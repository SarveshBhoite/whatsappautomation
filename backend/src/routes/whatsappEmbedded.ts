import { Router, Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prisma";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "demo-org-123";
};

// GET: Fetch current organization's WhatsApp connection status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.whatsAppConfig.findUnique({
      where: { organizationId },
      select: {
        id: true,
        organizationId: true,
        phoneNumberId: true,
        wabaId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      connected: !!(config && config.wabaId),
      config: config || null,
    });
  } catch (error: any) {
    console.error("Error fetching WhatsApp status:", error);
    return res.status(500).json({ error: "Failed to fetch status", details: error.message });
  }
});

// GET: Config for frontend Meta SDK setup
router.get("/embedded-config", (req: Request, res: Response) => {
  return res.status(200).json({
    appId: process.env.META_APP_ID || "36702477879366478",
    configId: process.env.META_WHATSAPP_CONFIG_ID || "1057598330310757",
  });
});

// POST: Exchange code from Meta Embedded Signup for system access token and auto-subscribe webhooks
router.post("/embedded-signup/callback", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { code, wabaId, phoneNumberId } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code from Meta" });
    }

    const appId = process.env.META_APP_ID || "36702477879366478";
    const appSecret = process.env.META_APP_SECRET || "31a42564bf74d77abc944800042fad9a";

    let accessToken = "";

    // 1. Exchange temporary code for access token from Meta Graph API
    console.log(`[EMBEDDED SIGNUP] Exchanging code for token with Meta Graph API for Org: ${organizationId}...`);
    try {
      // Primary: FB.login SDK code exchange (Meta expects no redirect_uri parameter)
      const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
        params: {
          client_id: appId,
          client_secret: appSecret,
          code: code,
        },
      });
      accessToken = tokenResponse.data.access_token;
    } catch (err1: any) {
      console.warn("[EMBEDDED SIGNUP] SDK exchange fallback, trying with redirect_uri...", err1?.response?.data?.error?.message);
      // Fallback: If dialog redirect was used
      const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
        params: {
          client_id: appId,
          client_secret: appSecret,
          code: code,
          redirect_uri: req.body.redirectUri || "https://crm.jisnudigital.com/settings",
        },
      });
      accessToken = tokenResponse.data.access_token;
    }

    if (!accessToken) {
      return res.status(400).json({ error: "Failed to obtain access token from Meta API" });
    }

    let finalWabaId = wabaId || "";
    let finalPhoneNumberId = phoneNumberId || "";

    // 2. If WABA ID is missing, auto-discover from Meta Graph API
    if (!finalWabaId) {
      try {
        const debugTokenRes = await axios.get("https://graph.facebook.com/v21.0/debug_token", {
          params: {
            input_token: accessToken,
            access_token: `${appId}|${appSecret}`,
          },
        });
        const granularScopes = debugTokenRes.data?.data?.granular_scopes || [];
        const waScope = granularScopes.find((s: any) => s.scope === "whatsapp_business_management");
        if (waScope && waScope.target_ids && waScope.target_ids.length > 0) {
          finalWabaId = waScope.target_ids[0];
          console.log(`[EMBEDDED SIGNUP] Auto-discovered WABA ID from token scopes: ${finalWabaId}`);
        }
      } catch (debugErr: any) {
        console.warn("[EMBEDDED SIGNUP] Token debug check failed:", debugErr?.response?.data || debugErr.message);
      }
    }

    // 3. If WABA ID is present, auto-discover phone number if not directly passed
    if (finalWabaId && !finalPhoneNumberId) {
      try {
        const phoneNumbersRes = await axios.get(
          `https://graph.facebook.com/v21.0/${finalWabaId}/phone_numbers`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const phones = phoneNumbersRes.data?.data || [];
        if (phones.length > 0) {
          finalPhoneNumberId = phones[0].id;
          console.log(`[EMBEDDED SIGNUP] Auto-discovered Phone Number ID: ${finalPhoneNumberId}`);
        }
      } catch (phoneErr: any) {
        console.warn("[EMBEDDED SIGNUP] Could not auto-fetch phone numbers:", phoneErr?.response?.data || phoneErr.message);
      }
    }

    // 4. Auto-register phone number on Cloud API (Activates status from Pending to Connected)
    if (finalPhoneNumberId) {
      try {
        console.log(`[EMBEDDED SIGNUP] Auto-registering phone number: ${finalPhoneNumberId} with Cloud API...`);
        await axios.post(
          `https://graph.facebook.com/v21.0/${finalPhoneNumberId}/register`,
          {
            messaging_product: "whatsapp",
            pin: "123456",
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log(`[EMBEDDED SIGNUP] Successfully registered phone number ${finalPhoneNumberId} on Cloud API!`);
      } catch (regErr: any) {
        console.warn("[EMBEDDED SIGNUP] Phone registration response/notice:", regErr?.response?.data?.error?.message || regErr.message);
      }
    }

    // 5. Auto-subscribe app to the WABA for webhooks
    if (finalWabaId) {
      try {
        console.log(`[EMBEDDED SIGNUP] Subscribing app to WABA: ${finalWabaId}...`);
        await axios.post(
          `https://graph.facebook.com/v21.0/${finalWabaId}/subscribed_apps`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log(`[EMBEDDED SIGNUP] Successfully subscribed app to WABA webhooks.`);
      } catch (subErr: any) {
        console.warn("[EMBEDDED SIGNUP] Warning subscribing app to WABA:", subErr?.response?.data || subErr.message);
      }
    }

    // 6. Upsert client's WhatsAppConfig in database
    const config = await prisma.whatsAppConfig.upsert({
      where: { organizationId },
      update: {
        accessToken,
        ...(finalWabaId && { wabaId: finalWabaId }),
        ...(finalPhoneNumberId && { phoneNumberId: finalPhoneNumberId }),
      },
      create: {
        organizationId,
        accessToken,
        wabaId: finalWabaId || "",
        phoneNumberId: finalPhoneNumberId || "",
        webhookVerifyToken: `verify_${organizationId.slice(0, 8)}`,
      },
    });

    console.log(`[EMBEDDED SIGNUP] WhatsApp Config saved successfully for Organization: ${organizationId}`);

    return res.status(200).json({
      success: true,
      message: "WhatsApp Business Account connected and configured successfully!",
      config: {
        id: config.id,
        organizationId: config.organizationId,
        wabaId: config.wabaId,
        phoneNumberId: config.phoneNumberId,
      },
    });
  } catch (error: any) {
    console.error("Error processing Meta Embedded Signup callback:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to connect WhatsApp account",
      details: error?.response?.data || error.message,
    });
  }
});

// POST: Cleanly Disconnect WhatsApp Account
router.post("/disconnect", async (req: Request, res: Response) => {
  try {
    const organizationId = (req.headers["x-organization-id"] as string) || req.body.organizationId;
    if (!organizationId) {
      return res.status(400).json({ error: "Missing x-organization-id header" });
    }

    const config = await prisma.whatsAppConfig.findUnique({
      where: { organizationId }
    });

    if (config) {
      // Unsubscribe app from WABA webhooks if token and WABA ID are present
      if (config.wabaId && config.accessToken) {
        try {
          await axios.delete(
            `https://graph.facebook.com/v21.0/${config.wabaId}/subscribed_apps`,
            { headers: { Authorization: `Bearer ${config.accessToken}` } }
          );
          console.log(`[WHATSAPP DISCONNECT] Unsubscribed app from WABA: ${config.wabaId}`);
        } catch (unsubErr: any) {
          console.warn("[WHATSAPP DISCONNECT] Warning during unsubscribe:", unsubErr?.response?.data || unsubErr.message);
        }
      }

      // Clear WhatsApp config from database
      await prisma.whatsAppConfig.delete({
        where: { organizationId }
      });
    }

    return res.status(200).json({
      success: true,
      message: "WhatsApp Business Account disconnected successfully.",
    });
  } catch (error: any) {
    console.error("Error disconnecting WhatsApp:", error);
    return res.status(500).json({ error: "Failed to disconnect WhatsApp account", details: error.message });
  }
});

export default router;
