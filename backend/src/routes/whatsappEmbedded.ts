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

    // 1. Exchange temporary code for access token from Meta Graph API
    console.log(`[EMBEDDED SIGNUP] Exchanging code for token with Meta Graph API for Org: ${organizationId}...`);
    const tokenResponse = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: {
        client_id: appId,
        client_secret: appSecret,
        code: code,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ error: "Failed to obtain access token from Meta API" });
    }

    let finalWabaId = wabaId || "";
    let finalPhoneNumberId = phoneNumberId || "";

    // 2. If WABA ID is present, auto-discover phone number if not directly passed
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

    // 3. Auto-subscribe app to the WABA for webhooks
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

    // 4. Upsert client's WhatsAppConfig in database
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

export default router;
