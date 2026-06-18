import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { WhatsAppService } from "../services/whatsappService";
import { io } from "../index";

const router = Router();

// POST: Send Manual Message (from Sales Agent)
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { conversationId, messageType, content, filename, quotedMessageId } = req.body;

    if (!conversationId || !messageType || !content) {
      return res.status(400).json({ error: "Missing required fields: conversationId, messageType, content" });
    }

    // 1. Fetch Conversation and WABA Config
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { organization: { include: { waConfig: true } } },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const waConfig = conversation.organization.waConfig;
    if (!waConfig || !waConfig.phoneNumberId || !waConfig.accessToken) {
      return res.status(400).json({ error: "WhatsApp credentials not configured for this organization" });
    }

    const customerPhone = conversation.customerPhone;
    let responseData;
    let mediaUrlOrId = content;

    // Decode base64 file upload if provided by client
    const { fileBase64 } = req.body;
    if (fileBase64 && filename) {
      try {
        const path = require("path");
        const fs = require("fs");
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Clean filename and make unique
        const cleanFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = path.join(uploadsDir, cleanFilename);
        const fileBuffer = Buffer.from(fileBase64, "base64");
        
        fs.writeFileSync(filePath, fileBuffer);
        mediaUrlOrId = `/uploads/${cleanFilename}`;
      } catch (err: any) {
        console.error("Error writing base64 file to storage:", err.message);
      }
    }

    // Resolve contextMessageId if quoting a message
    let contextMessageId: string | undefined = undefined;
    if (quotedMessageId) {
      const qMsg = await prisma.message.findUnique({
        where: { id: quotedMessageId }
      });
      if (qMsg?.waMessageId) {
        contextMessageId = qMsg.waMessageId;
      }
    }

    const { caption } = req.body;
    let contentForDb = mediaUrlOrId;

    // 2. Call WhatsApp Cloud API via WhatsAppService
    if (messageType === "text") {
      responseData = await WhatsAppService.sendTextMessage(
        waConfig.phoneNumberId,
        waConfig.accessToken,
        customerPhone,
        mediaUrlOrId,
        contextMessageId
      );
      contentForDb = mediaUrlOrId;
    } else if (["image", "document", "video", "audio"].includes(messageType)) {
      responseData = await WhatsAppService.sendMediaMessage(
        waConfig.phoneNumberId,
        waConfig.accessToken,
        customerPhone,
        messageType,
        mediaUrlOrId,
        filename,
        caption,
        contextMessageId
      );
      
      // Format content for database
      if (messageType === "document") {
        contentForDb = `${filename || "document.pdf"}|${mediaUrlOrId}`;
      } else {
        contentForDb = mediaUrlOrId;
      }
      if (caption) {
        contentForDb += `|caption:${caption}`;
      }
    } else {
      return res.status(400).json({ error: "Unsupported message type for manual sending" });
    }

    const waMessageId = responseData?.messages?.[0]?.id || null;

    // 3. Pause the Chatbot (Sending manual message automatically pauses chatbot for 24h)
    const pauseDuration = 24 * 60 * 60 * 1000; // 24 hours
    const botPausedUntil = new Date(Date.now() + pauseDuration);

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isBotPaused: true,
        botPausedUntil,
      },
    });

    // 4. Save Outbound Message to Database
    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        direction: "outbound",
        messageType,
        content: contentForDb,
        waMessageId,
        status: "sent",
        senderName: "Agent", // Default for manual chat
        quotedMessageId: quotedMessageId || null,
      },
    });

    // Fetch the saved message with quotedMessage relation
    const fullMessage = await prisma.message.findUnique({
      where: { id: savedMessage.id },
      include: {
        quotedMessage: true,
      },
    });

    const orgId = conversation.organizationId;

    // 5. Broadcast to Agents via Socket.io
    io.to(orgId).emit("new-message", {
      conversationId,
      message: fullMessage,
    });

    // Notify agents of the bot pause state update
    io.to(orgId).emit("bot-status-change", {
      conversationId,
      isBotPaused: true,
      botPausedUntil,
    });

    return res.status(200).json({ message: "Message sent successfully", data: savedMessage });
  } catch (error: any) {
    console.error("Error sending manual message:", error);
    return res.status(500).json({
      error: "Failed to send WhatsApp message",
      details: error.response?.data || error.message,
    });
  }
});

// POST: Toggle Chatbot Manual Status (Pause/Resume)
router.post("/toggle-bot", async (req: Request, res: Response) => {
  try {
    const { conversationId, isBotPaused } = req.body;

    if (!conversationId || isBotPaused === undefined) {
      return res.status(400).json({ error: "Missing required fields: conversationId, isBotPaused" });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isBotPaused,
        botPausedUntil: isBotPaused ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      },
    });

    // Broadcast update
    io.to(conversation.organizationId).emit("bot-status-change", {
      conversationId,
      isBotPaused: updated.isBotPaused,
      botPausedUntil: updated.botPausedUntil,
    });

    return res.status(200).json({ message: "Bot status toggled successfully", data: updated });
  } catch (error: any) {
    console.error("Error toggling bot status:", error);
    return res.status(500).json({ error: "Failed to toggle bot status", details: error.message });
  }
});

export default router;
