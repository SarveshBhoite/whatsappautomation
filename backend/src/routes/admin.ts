import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";

const router = Router();

// Middleware to inject default org ID if not provided (Simplifies dev/sandbox testing)
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || "demo-org-123";
};

// GET: List all conversations for the organization
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    const conversations = await prisma.conversation.findMany({
      where: { organizationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Include only the last message for list view snippet
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Failed to fetch conversations", details: error.message });
  }
});

// GET: Fetch message history for a specific conversation
router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId: id as string },
      include: {
        quotedMessage: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching message history:", error);
    return res.status(500).json({ error: "Failed to fetch message history", details: error.message });
  }
});

// GET: Fetch active flow or list of flows
router.get("/flows", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { platform } = req.query;

    const flows = await prisma.flow.findMany({
      where: { 
        organizationId,
        platform: platform ? (platform as string) : undefined
      },
      orderBy: { isActive: "desc" }, // Active first
    });

    return res.status(200).json(flows);
  } catch (error: any) {
    console.error("Error fetching flows:", error);
    return res.status(500).json({ error: "Failed to fetch flows", details: error.message });
  }
});

// POST: Save or Update a Flow
router.post("/flows", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, name, description, graphJson, isActive, platform } = req.body;

    if (!name || !graphJson) {
      return res.status(400).json({ error: "Missing required fields: name, graphJson" });
    }

    const flowPlatform = platform || "whatsapp";
    let flow;

    if (isActive) {
      // Deactivate other flows OF THE SAME PLATFORM if setting this one to active
      await prisma.flow.updateMany({
        where: { organizationId, platform: flowPlatform, isActive: true },
        data: { isActive: false },
      });
    }

    if (id) {
      // Update existing
      flow = await prisma.flow.update({
        where: { id },
        data: {
          name,
          description,
          graphJson,
          platform: flowPlatform,
          isActive: !!isActive,
        },
      });
    } else {
      // Create new
      flow = await prisma.flow.create({
        data: {
          name,
          description,
          graphJson,
          platform: flowPlatform,
          isActive: !!isActive,
          organizationId,
        },
      });
    }

    return res.status(200).json({ message: "Flow saved successfully", data: flow });
  } catch (error: any) {
    console.error("Error saving flow:", error);
    return res.status(500).json({ error: "Failed to save flow", details: error.message });
  }
});

// GET: Fetch WhatsApp Config credentials
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.whatsAppConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      // Create empty config if not existing
      config = await prisma.whatsAppConfig.create({
        data: {
          organizationId,
          phoneNumberId: "",
          wabaId: "",
          accessToken: "",
        },
      });
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching config:", error);
    return res.status(500).json({ error: "Failed to fetch config", details: error.message });
  }
});

// POST: Update WhatsApp Config credentials
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { phoneNumberId, wabaId, accessToken } = req.body;

    const config = await prisma.whatsAppConfig.upsert({
      where: { organizationId },
      update: {
        phoneNumberId,
        wabaId,
        accessToken,
      },
      create: {
        organizationId,
        phoneNumberId: phoneNumberId || "",
        wabaId: wabaId || "",
        accessToken: accessToken || "",
      },
    });

    return res.status(200).json({ message: "WhatsApp configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating config:", error);
    return res.status(500).json({ error: "Failed to update config", details: error.message });
  }
});

// GET: Fetch Instagram Config credentials
router.get("/instagram/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.instagramConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      // Create empty config if not existing
      config = await prisma.instagramConfig.create({
        data: {
          organizationId,
          instagramAccountId: "",
          pageId: "",
          pageAccessToken: "",
        },
      });
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching Instagram config:", error);
    return res.status(500).json({ error: "Failed to fetch Instagram config", details: error.message });
  }
});

// POST: Update Instagram Config credentials
router.post("/instagram/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { instagramAccountId, pageId, pageAccessToken } = req.body;

    const config = await prisma.instagramConfig.upsert({
      where: { organizationId },
      update: {
        instagramAccountId,
        pageId,
        pageAccessToken,
      },
      create: {
        organizationId,
        instagramAccountId: instagramAccountId || "",
        pageId: pageId || "",
        pageAccessToken: pageAccessToken || "",
      },
    });

    return res.status(200).json({ message: "Instagram configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating Instagram config:", error);
    return res.status(500).json({ error: "Failed to update Instagram config", details: error.message });
  }
});

// POST: Upload visual builder node media file
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { filename, fileBase64 } = req.body;
    if (!filename || !fileBase64) {
      return res.status(400).json({ error: "Missing filename or fileBase64" });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    // 1. If ImageKit is configured, upload directly to cloud CDN
    if (privateKey && urlEndpoint) {
      console.log("Uploading file to ImageKit cloud storage...");
      
      // Construct native FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append("file", fileBase64); // ImageKit accepts raw base64 strings in multipart form
      formData.append("fileName", filename);
      formData.append("useUniqueFileName", "true");

      const axios = require("axios");
      const token = Buffer.from(`${privateKey}:`).toString("base64");
      
      const response = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
        headers: {
          Authorization: `Basic ${token}`,
          // Axios automatically manages multipart boundary when receiving a FormData instance
        }
      });

      console.log("ImageKit upload success. Public URL:", response.data.url);
      return res.status(200).json({ url: response.data.url });
    }

    // 2. Fallback: upload locally but dynamically construct an absolute public URL
    console.log("ImageKit credentials not configured. Falling back to local upload.");
    const path = require("path");
    const fs = require("fs");
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const cleanFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, cleanFilename);
    const fileBuffer = Buffer.from(fileBase64, "base64");
    fs.writeFileSync(filePath, fileBuffer);

    // Resolve host dynamically (e.g. ngrok tunnel URL or production domain)
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const fileUrl = `${proto}://${host}/uploads/${cleanFilename}`;
    
    console.log("Local upload success. Public URL:", fileUrl);
    return res.status(200).json({ url: fileUrl });
  } catch (error: any) {
    const errorResponse = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("Error writing upload to storage:", errorResponse);
    return res.status(500).json({ error: "Failed to upload file", details: error.message });
  }
});

export default router;
