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

    const flows = await prisma.flow.findMany({
      where: { organizationId },
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
    const { id, name, description, graphJson, isActive } = req.body;

    if (!name || !graphJson) {
      return res.status(400).json({ error: "Missing required fields: name, graphJson" });
    }

    let flow;

    if (isActive) {
      // Deactivate other flows if setting this one to active
      await prisma.flow.updateMany({
        where: { organizationId, isActive: true },
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

// POST: Upload visual builder node media file
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { filename, fileBase64 } = req.body;
    if (!filename || !fileBase64) {
      return res.status(400).json({ error: "Missing filename or fileBase64" });
    }
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
    const fileUrl = `/uploads/${cleanFilename}`;
    return res.status(200).json({ url: fileUrl });
  } catch (error: any) {
    console.error("Error writing upload to storage:", error);
    return res.status(500).json({ error: "Failed to upload file", details: error.message });
  }
});

export default router;
