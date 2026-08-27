import { Router, Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prisma";
import { resolveWhatsAppConfig } from "../utils/accountResolver";

const router = Router();

const DEFAULT_ORG_ID = "demo-org-123";

const getOrgId = (req: Request): string => {
  const headerVal = req.headers["x-organization-id"];
  if (Array.isArray(headerVal) && headerVal[0]) return headerVal[0];
  if (typeof headerVal === "string" && headerVal.trim() !== "") return headerVal;
  return DEFAULT_ORG_ID;
};

// GET: Fetch current organization's WhatsApp connection status and active config
router.get("/status", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    let configs = await prisma.whatsAppConfig.findMany({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (configs.length === 0) {
      configs = await prisma.whatsAppConfig.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
    }

    const activeConfig = configs.find((c) => c.isDefault) || configs[0] || null;

    return res.status(200).json({
      connected: !!(activeConfig && activeConfig.wabaId),
      config: activeConfig,
      accounts: configs,
    });
  } catch (error: any) {
    console.error("Error fetching WhatsApp status:", error);
    return res.status(500).json({ error: "Failed to fetch status", details: error.message });
  }
});

export async function syncAllWhatsAppAccountsForToken(organizationId: string, accessToken: string, targetWabaId?: string) {
  try {
    const wabaIdSet = new Set<string>();
    if (targetWabaId) wabaIdSet.add(targetWabaId);

    const appId = process.env.META_APP_ID || "36702477879366478";
    const appSecret = process.env.META_APP_SECRET || "31a42564bf74d77abc944800042fad9a";

    // 1. Discover WABAs from debug_token granular scopes
    try {
      const debugTokenRes = await axios.get("https://graph.facebook.com/v21.0/debug_token", {
        params: {
          input_token: accessToken,
          access_token: `${appId}|${appSecret}`,
        },
      });
      const granularScopes = debugTokenRes.data?.data?.granular_scopes || [];
      const waScope = granularScopes.find((s: any) => s.scope === "whatsapp_business_management");
      if (waScope && waScope.target_ids) {
        waScope.target_ids.forEach((id: string) => wabaIdSet.add(id));
      }
    } catch (e) {}

    // 2. For any discovered WABA, inspect owner_business_info to discover Business Manager ID and all owned WABAs
    const discoveredBusinessIds = new Set<string>();
    for (const wabaId of Array.from(wabaIdSet)) {
      try {
        const wabaInfoRes = await axios.get(
          `https://graph.facebook.com/v21.0/${wabaId}?fields=id,name,owner_business_info`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const bizId = wabaInfoRes.data?.owner_business_info?.id;
        if (bizId) {
          discoveredBusinessIds.add(bizId);
        }
      } catch (e) {}
    }

    // 3. For each Business Manager, fetch ALL owned and client WABAs & phone numbers
    for (const bizId of Array.from(discoveredBusinessIds)) {
      try {
        const ownedRes = await axios.get(
          `https://graph.facebook.com/v21.0/${bizId}/owned_whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const ownedWabas = ownedRes.data?.data || [];
        ownedWabas.forEach((w: any) => wabaIdSet.add(w.id));
      } catch (e) {}

      try {
        const clientRes = await axios.get(
          `https://graph.facebook.com/v21.0/${bizId}/client_whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const clientWabas = clientRes.data?.data || [];
        clientWabas.forEach((w: any) => wabaIdSet.add(w.id));
      } catch (e) {}
    }

    const allWabaIds = Array.from(wabaIdSet);
    if (allWabaIds.length === 0) return;

    // 4. Iterate over ALL WABAs and upsert ALL phone numbers into DB
    for (const wabaId of allWabaIds) {
      try {
        await axios.post(
          `https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        ).catch(() => {});

        const phoneRes = await axios.get(
          `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const phones = phoneRes.data?.data || [];

        for (const p of phones) {
          const phoneNumberId = p.id;
          const displayPhone = p.display_phone_number || p.verified_name || `+${phoneNumberId}`;
          const accountName = p.verified_name || p.display_phone_number || `WhatsApp Number (${phoneNumberId.slice(-4)})`;

          const existingCount = await prisma.whatsAppConfig.count({ where: { organizationId } });
          const existing = await prisma.whatsAppConfig.findFirst({
            where: { organizationId, phoneNumberId }
          });

          if (existing) {
            await prisma.whatsAppConfig.update({
              where: { id: existing.id },
              data: {
                accessToken,
                wabaId,
                phoneNumber: displayPhone,
                accountName,
                isActive: true
              }
            });
          } else {
            await prisma.whatsAppConfig.create({
              data: {
                organizationId,
                phoneNumberId,
                wabaId,
                accessToken,
                phoneNumber: displayPhone,
                accountName,
                isDefault: existingCount === 0,
                isActive: true
              }
            });
          }
        }
      } catch (wabaErr: any) {
        console.warn(`[MULTI-WA SYNC] Error fetching phone numbers for WABA ${wabaId}:`, wabaErr?.message);
      }
    }
  } catch (err: any) {
    console.warn("[MULTI-WA SYNC] Auto-sync notice:", err?.message);
  }
}

// GET: Fetch all linked WhatsApp accounts for organization
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    let accounts = await prisma.whatsAppConfig.findMany({
      where: { OR: [{ organizationId }, { organizationId: "demo-org-123" }] },
      orderBy: { createdAt: "desc" },
    });

    if (accounts.length === 0) {
      accounts = await prisma.whatsAppConfig.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    // Auto-sync in background asynchronously without blocking the UI response
    const tokenConfig = accounts.find((a) => a.accessToken);
    if (tokenConfig && tokenConfig.accessToken) {
      syncAllWhatsAppAccountsForToken(organizationId, tokenConfig.accessToken, tokenConfig.wabaId || undefined).catch((e) => {
        console.warn("[BG-SYNC] Non-blocking account sync warning:", e.message);
      });
    }

    return res.status(200).json({ success: true, accounts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch WhatsApp accounts", details: error.message });
  }
});

// POST: Manually sync / refresh WhatsApp account data and numbers
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { whatsappConfigId, accountId } = req.body;
    const targetConfigId = whatsappConfigId || accountId;

    const waConfig = await resolveWhatsAppConfig(organizationId, targetConfigId);
    if (!waConfig || !waConfig.accessToken) {
      return res.status(400).json({ error: "No active WhatsApp configuration found with valid credentials" });
    }

    // Auto-sync all numbers associated with token/WABA
    await syncAllWhatsAppAccountsForToken(organizationId, waConfig.accessToken, waConfig.wabaId || undefined);

    const refreshedAccounts = await prisma.whatsAppConfig.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      success: true,
      message: "WhatsApp account data synchronized successfully",
      syncedAccountId: waConfig.id,
      phoneNumber: waConfig.phoneNumber,
      accountsCount: refreshedAccounts.length,
      syncedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[WHATSAPP SYNC ERROR]:", error);
    return res.status(500).json({ error: "Failed to sync WhatsApp data", details: error.message });
  }
});

// POST: Set default active WhatsApp account
router.post("/set-default", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "Missing accountId" });
    }

    // Check if target account is already default to avoid unnecessary DB locks
    const target = await prisma.whatsAppConfig.findUnique({
      where: { id: accountId }
    });

    if (!target) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (target.isDefault) {
      return res.status(200).json({ success: true, message: "Account already default", activeAccount: target });
    }

    // Atomically swap default status
    const [, updated] = await prisma.$transaction([
      prisma.whatsAppConfig.updateMany({
        where: { organizationId, id: { not: accountId }, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.whatsAppConfig.update({
        where: { id: accountId },
        data: { isDefault: true },
      })
    ]);

    return res.status(200).json({ success: true, message: "Default WhatsApp account updated", activeAccount: updated });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update default account", details: error.message });
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
    const { code, wabaId, phoneNumberId, phoneNumber, accountName } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code from Meta" });
    }

    const appId = process.env.META_APP_ID || "36702477879366478";
    const appSecret = process.env.META_APP_SECRET || "31a42564bf74d77abc944800042fad9a";

    let accessToken = "";

    // 1. Exchange temporary code for access token from Meta Graph API
    console.log(`[EMBEDDED SIGNUP] Exchanging code for token with Meta Graph API for Org: ${organizationId}...`);
    try {
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
    let discoveredPhoneNumber = phoneNumber || "";
    if (finalWabaId && !finalPhoneNumberId) {
      try {
        const phoneNumbersRes = await axios.get(
          `https://graph.facebook.com/v21.0/${finalWabaId}/phone_numbers`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const phones = phoneNumbersRes.data?.data || [];
        if (phones.length > 0) {
          finalPhoneNumberId = phones[0].id;
          discoveredPhoneNumber = phones[0].display_phone_number || phones[0].verified_name || "";
          console.log(`[EMBEDDED SIGNUP] Auto-discovered Phone Number ID: ${finalPhoneNumberId}`);
        }
      } catch (phoneErr: any) {
        console.warn("[EMBEDDED SIGNUP] Could not auto-fetch phone numbers:", phoneErr?.response?.data || phoneErr.message);
      }
    }

    // 4. Auto-register phone number on Cloud API
    if (finalPhoneNumberId) {
      try {
        await axios.post(
          `https://graph.facebook.com/v21.0/${finalPhoneNumberId}/register`,
          {
            messaging_product: "whatsapp",
            pin: "123456",
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (regErr: any) {
        console.warn("[EMBEDDED SIGNUP] Phone registration notice:", regErr?.response?.data?.error?.message || regErr.message);
      }
    }

    // 5. Auto-subscribe app to WABA webhooks
    if (finalWabaId) {
      try {
        await axios.post(
          `https://graph.facebook.com/v21.0/${finalWabaId}/subscribed_apps`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (subErr: any) {
        console.warn("[EMBEDDED SIGNUP] Warning subscribing app to WABA:", subErr?.response?.data || subErr.message);
      }
    }

    // Check existing count for default setting
    const existingCount = await prisma.whatsAppConfig.count({ where: { organizationId } });
    const isFirst = existingCount === 0;

    // Search existing by phoneNumberId or wabaId
    const existingConfig = finalPhoneNumberId
      ? await prisma.whatsAppConfig.findFirst({ where: { organizationId, phoneNumberId: finalPhoneNumberId } })
      : null;

    let config;
    if (existingConfig) {
      config = await prisma.whatsAppConfig.update({
        where: { id: existingConfig.id },
        data: {
          accessToken,
          ...(finalWabaId && { wabaId: finalWabaId }),
          ...(discoveredPhoneNumber && { phoneNumber: discoveredPhoneNumber }),
          ...(accountName && { accountName }),
          isActive: true,
        },
      });
    } else {
      config = await prisma.whatsAppConfig.create({
        data: {
          organizationId,
          accessToken,
          wabaId: finalWabaId || "",
          phoneNumberId: finalPhoneNumberId || "",
          phoneNumber: discoveredPhoneNumber || "",
          accountName: accountName || discoveredPhoneNumber || `WhatsApp ID (${finalPhoneNumberId.slice(-4)})`,
          isDefault: isFirst,
          isActive: true,
          webhookVerifyToken: `verify_${organizationId.slice(0, 8)}`,
        },
      });
    }

    console.log(`[EMBEDDED SIGNUP] WhatsApp Config saved successfully for Organization: ${organizationId}`);

    return res.status(200).json({
      success: true,
      message: "WhatsApp Business Account connected and configured successfully!",
      config,
    });
  } catch (error: any) {
    console.error("Error processing Meta Embedded Signup callback:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to connect WhatsApp account",
      details: error?.response?.data || error.message,
    });
  }
});

// POST: Cleanly Disconnect a WhatsApp Account
router.post("/disconnect", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { accountId } = req.body;

    const config = accountId
      ? await prisma.whatsAppConfig.findFirst({ where: { id: accountId, organizationId } })
      : await prisma.whatsAppConfig.findFirst({ where: { organizationId, isDefault: true } });

    if (config) {
      if (config.wabaId && config.accessToken) {
        try {
          await axios.delete(
            `https://graph.facebook.com/v21.0/${config.wabaId}/subscribed_apps`,
            { headers: { Authorization: `Bearer ${config.accessToken}` } }
          );
        } catch (unsubErr: any) {
          console.warn("[WHATSAPP DISCONNECT] Warning during unsubscribe:", unsubErr?.response?.data || unsubErr.message);
        }
      }

      await prisma.whatsAppConfig.delete({ where: { id: config.id } });

      // If deleted account was default, set next available as default
      const remaining = await prisma.whatsAppConfig.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.whatsAppConfig.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
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
