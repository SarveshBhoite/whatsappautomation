import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { generateFlow } from "../services/aiFlowGenerator";

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
    const { platform, category, status, search } = req.query;

    const whereClause: any = { organizationId };

    if (platform) {
      whereClause.platform = platform as string;
    }
    if (category && category !== "All") {
      whereClause.category = category as string;
    }
    if (status && status !== "All") {
      whereClause.status = status as string;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { category: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const flows = await prisma.flow.findMany({
      where: whereClause,
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json(flows);
  } catch (error: any) {
    console.error("Error fetching flows:", error);
    return res.status(500).json({ error: "Failed to fetch flows", details: error.message });
  }
});

// GET: Fetch single flow by ID
router.get("/flows/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const flow = await prisma.flow.findFirst({
      where: { id: id as string, organizationId },
    });

    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    return res.status(200).json(flow);
  } catch (error: any) {
    console.error("Error fetching flow:", error);
    return res.status(500).json({ error: "Failed to fetch flow", details: error.message });
  }
});

// POST: Save or Update a Flow
router.post("/flows", async (req: Request, res: Response) => {
  console.log("------------------------------------------");
  console.log("[SAVE FLOW API] Incoming Request Payload:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const organizationId = getOrgId(req);
    const { id, name, description, category, status, isDefault, graphJson, isActive, platform } = req.body;

    if (!name || !graphJson) {
      const valError = "Missing required fields: name, graphJson";
      console.error("[SAVE FLOW API] Validation Error:", valError);
      return res.status(400).json({ success: false, error: valError });
    }

    const flowPlatform = platform || "whatsapp";
    const flowCategory = category || "Custom";
    let flowStatus = status || (isActive ? "Active" : "Draft");

    if (isActive) {
      flowStatus = "Active";
      // Deactivate all other flows OF THE SAME PLATFORM
      await prisma.flow.updateMany({
        where: { organizationId, platform: flowPlatform, isActive: true },
        data: { isActive: false, status: "Published" },
      });
    }

    if (isDefault) {
      await prisma.flow.updateMany({
        where: { organizationId, platform: flowPlatform, isDefault: true },
        data: { isDefault: false },
      });
    }

    let flow;

    if (id) {
      // Check if updating to an existing flow ID that exists
      const existingFlow = await prisma.flow.findUnique({ where: { id } });
      if (existingFlow) {
        flow = await prisma.flow.update({
          where: { id },
          data: {
            name,
            description: description || "",
            category: flowCategory,
            status: flowStatus,
            isDefault: !!isDefault,
            graphJson,
            platform: flowPlatform,
            isActive: !!isActive,
          },
        });
      } else {
        // If ID does not exist in DB (e.g. temporary ID), create new record
        flow = await prisma.flow.create({
          data: {
            name,
            description: description || "",
            category: flowCategory,
            status: flowStatus,
            isDefault: !!isDefault,
            graphJson,
            platform: flowPlatform,
            isActive: !!isActive,
            organizationId,
          },
        });
      }
    } else {
      // Create new
      flow = await prisma.flow.create({
        data: {
          name,
          description: description || "",
          category: flowCategory,
          status: flowStatus,
          isDefault: !!isDefault,
          graphJson,
          platform: flowPlatform,
          isActive: !!isActive,
          organizationId,
        },
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit(id ? "flow-updated" : "flow-created", flow);
      if (isActive) {
        io.to(organizationId).emit("flow-activated", flow);
      }
    }

    console.log("[SAVE FLOW API] Response Payload:");
    console.log(JSON.stringify(flow, null, 2));

    return res.status(200).json({ success: true, message: "Flow saved successfully", data: flow });
  } catch (error: any) {
    console.error("==========================================");
    console.error("[SAVE FLOW API] EXCEPTION ENCOUNTERED:");
    console.error("Error Message:", error?.message || error);
    console.error("Error Code:", error?.code);
    console.error("Stack Trace:\n", error?.stack);
    console.error("==========================================");

    let clientMessage = error?.message || "Failed to save flow";
    if (error?.code === "P2002") {
      clientMessage = "Flow name already exists.";
    }

    return res.status(500).json({
      success: false,
      error: clientMessage,
      details: error?.message,
      code: error?.code,
      stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined
    });
  }
});

// POST: Activate Flow
router.post("/flows/:id/activate", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const targetFlow = await prisma.flow.findFirst({
      where: { id: id as string, organizationId },
    });

    if (!targetFlow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    // Deactivate ALL other flows for the exact SAME platform
    await prisma.flow.updateMany({
      where: {
        organizationId,
        platform: targetFlow.platform,
        isActive: true,
      },
      data: { isActive: false, status: "Published" },
    });

    const updatedFlow = await prisma.flow.update({
      where: { id: id as string },
      data: { isActive: true, status: "Active" },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-activated", updatedFlow);
      io.to(organizationId).emit("flow-updated", updatedFlow);
    }

    return res.status(200).json({ message: "Flow activated successfully", data: updatedFlow });
  } catch (error: any) {
    console.error("Error activating flow:", error);
    return res.status(500).json({ error: "Failed to activate flow", details: error.message });
  }
});

// POST: Archive Flow
router.post("/flows/:id/archive", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const updatedFlow = await prisma.flow.update({
      where: { id: id as string },
      data: { isActive: false, status: "Archived" },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-updated", updatedFlow);
    }

    return res.status(200).json({ message: "Flow archived successfully", data: updatedFlow });
  } catch (error: any) {
    console.error("Error archiving flow:", error);
    return res.status(500).json({ error: "Failed to archive flow", details: error.message });
  }
});

// POST: Duplicate Flow
router.post("/flows/:id/duplicate", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const originalFlow = await prisma.flow.findFirst({
      where: { id: id as string, organizationId },
    });

    if (!originalFlow) {
      return res.status(404).json({ error: "Original flow not found" });
    }

    const duplicatedFlow = await prisma.flow.create({
      data: {
        organizationId,
        name: `${originalFlow.name} (Copy)`,
        description: originalFlow.description,
        category: originalFlow.category,
        platform: originalFlow.platform,
        status: "Draft",
        isActive: false,
        isDefault: false,
        graphJson: originalFlow.graphJson as any,
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-created", duplicatedFlow);
    }

    return res.status(200).json({ message: "Flow duplicated successfully", data: duplicatedFlow });
  } catch (error: any) {
    console.error("Error duplicating flow:", error);
    return res.status(500).json({ error: "Failed to duplicate flow", details: error.message });
  }
});

// DELETE: Delete Flow
router.delete("/flows/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id } = req.params;

    const deletedFlow = await prisma.flow.delete({
      where: { id: id as string },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(organizationId).emit("flow-deleted", { id });
    }

    return res.status(200).json({ message: "Flow deleted successfully", data: deletedFlow });
  } catch (error: any) {
    console.error("Error deleting flow:", error);
    return res.status(500).json({ error: "Failed to delete flow", details: error.message });
  }
});

// POST: Generate Flow via AI (Groq)
router.post("/flows/generate", async (req: Request, res: Response) => {
  try {
    const { prompt, platform } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing required field: prompt" });
    }

    const flowPlatform = platform === "youtube" ? "youtube" : platform === "instagram" ? "instagram" : "whatsapp";
    const generatedGraph = await generateFlow(prompt, flowPlatform);

    return res.status(200).json({
      success: true,
      flow: generatedGraph
    });
  } catch (error: any) {
    console.error("Error generating flow:", error);
    if (error.message && error.message.includes("Schema validation failed")) {
      return res.status(422).json({ error: error.message, details: error.message });
    }
    return res.status(500).json({ error: error.message, details: error.message });
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
