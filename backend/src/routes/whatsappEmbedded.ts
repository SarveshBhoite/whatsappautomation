import { Router, Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prisma";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "demo-org-123";
};

// GET: Config for frontend Meta SDK setup
router.get("/embedded-config", (req: Request, res: Response) => {
  return res.status(200).json({
    appId: process.env.META_APP_ID || "",
    configId: process.env.META_WHATSAPP_CONFIG_ID || "",
  });
});

// POST: Exchange code from Meta Embedded Signup for system access token
router.post("/embedded-signup/callback", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { code, wabaId, phoneNumberId } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code from Meta" });
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      return res.status(500).json({ error: "Meta App credentials (META_APP_ID / META_APP_SECRET) not configured in server environment" });
    }

    // Exchange temporary code for access token from Meta Graph API
    const tokenResponse = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
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

    // Upsert client's WhatsAppConfig
    const config = await prisma.whatsAppConfig.upsert({
      where: { organizationId },
      update: {
        accessToken,
        ...(wabaId && { wabaId }),
        ...(phoneNumberId && { phoneNumberId }),
      },
      create: {
        organizationId,
        accessToken,
        wabaId: wabaId || "",
        phoneNumberId: phoneNumberId || "",
        webhookVerifyToken: `verify_${organizationId.slice(0, 8)}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "WhatsApp Business Account connected successfully!",
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
