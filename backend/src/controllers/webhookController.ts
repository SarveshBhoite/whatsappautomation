import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { io } from "../index";
import { processChatbotFlow } from "../services/flowEngine";
import { WhatsAppService } from "../services/whatsappService";

// GET: Webhook Verification
export const verifyWebhook = async (req: Request, res: Response) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "my_secure_verify_token_123";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Meta Webhook verified successfully.");
      return res.status(200).send(challenge);
    } else {
      console.warn("Meta Webhook verification failed. Tokens mismatch.");
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error("Error in webhook verification:", error);
    return res.sendStatus(500);
  }
};

// POST: Handle Webhook Events (Messages, Status updates)
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Check if this is a WhatsApp API webhook
    if (body.object !== "whatsapp_business_account") {
      return res.sendStatus(404);
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return res.sendStatus(200); // Acknowledge so Meta doesn't retry
    }

    const metadata = value.metadata;
    const phoneNumberId = metadata?.phone_number_id;

    if (!phoneNumberId) {
      return res.sendStatus(200);
    }

    // 1. Find Organization matching the Phone Number ID
    const waConfig = await prisma.whatsAppConfig.findFirst({
      where: { phoneNumberId },
      include: { organization: true },
    });

    if (!waConfig) {
      console.warn(`No organization configuration found for Phone Number ID: ${phoneNumberId}`);
      return res.sendStatus(200); // return 200 to acknowledge
    }

    const organizationId = waConfig.organizationId;

    // 2. Handle Message Status Updates (Sent, Delivered, Read, Failed)
    if (value.statuses && value.statuses.length > 0) {
      for (const statusObj of value.statuses) {
        const { id: waMessageId, status, recipient_id } = statusObj;

        // Update message status in the database
        const updatedMessage = await prisma.message.updateMany({
          where: { waMessageId },
          data: { status },
        });

        // If updated, notify the agents in real-time
        if (updatedMessage.count > 0) {
          io.to(organizationId).emit("message-status-update", {
            waMessageId,
            status,
            customerPhone: recipient_id,
          });
        }
      }
      return res.sendStatus(200);
    }

    // 3. Handle Incoming Messages
    if (value.messages && value.messages.length > 0) {
      const contactName = value.contacts?.[0]?.profile?.name || "WhatsApp User";
      
      for (const message of value.messages) {
        const customerPhone = message.from;
        const waMessageId = message.id;
        const timestamp = new Date(parseInt(message.timestamp) * 1000);
        const type = message.type;
        const context = message.context; // Meta context block for quotes: { id, from }
        
        let content = "";
        let mimeType: string | undefined = undefined;

        // Extract message content based on type
        if (type === "text") {
          content = message.text?.body || "";
        } else if (type === "interactive") {
          const interactiveType = message.interactive?.type;
          if (interactiveType === "button_reply") {
            content = message.interactive.button_reply?.title || "";
          } else if (interactiveType === "list_reply") {
            content = message.interactive.list_reply?.title || "";
          }
        } else if (["image", "document", "video", "audio", "voice"].includes(type)) {
          let mediaId = "";
          let filename: string | undefined = undefined;

          if (type === "image") {
            mediaId = message.image?.id || "";
            mimeType = message.image?.mime_type;
          } else if (type === "document") {
            mediaId = message.document?.id || "";
            mimeType = message.document?.mime_type;
            filename = message.document?.filename;
          } else if (type === "video") {
            mediaId = message.video?.id || "";
            mimeType = message.video?.mime_type;
          } else {
            mediaId = message.audio?.id || message.voice?.id || "";
            mimeType = message.audio?.mime_type || message.voice?.mime_type;
          }

          if (mediaId) {
            // Download file and save locally
            const localUrl = await WhatsAppService.downloadMedia(
              waConfig.phoneNumberId || "100000000000000",
              waConfig.accessToken || "",
              mediaId,
              mimeType || "application/octet-stream"
            );
            if (type === "document" && filename) {
              content = `${filename}|${localUrl}`;
            } else {
              content = localUrl;
            }
          } else {
            content = "Media reference empty";
          }
        } else {
          content = `Unsupported message type: ${type}`;
        }

        // Find or create the conversation
        let conversation = await prisma.conversation.findUnique({
          where: {
            organizationId_customerPhone: {
              organizationId,
              customerPhone,
            },
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId,
              customerPhone,
              customerName: contactName,
              isBotPaused: false,
            },
          });
        } else if (conversation.customerName !== contactName) {
          // Keep customer name updated
          conversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: { customerName: contactName },
          });
        }

        // Resolve quotedMessageId from Database if the message is a reply
        let quotedMessageId: string | null = null;
        if (context?.id) {
          const qMsg = await prisma.message.findFirst({
            where: { waMessageId: context.id }
          });
          if (qMsg) {
            quotedMessageId = qMsg.id;
          }
        }

        // Save incoming message in database
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: "inbound",
            messageType: type,
            content,
            mediaMimeType: mimeType,
            waMessageId,
            status: "read", // Inbound messages are read by server immediately
            createdAt: timestamp,
            quotedMessageId: quotedMessageId || null,
          },
        });

        // Fetch populated message with the quoted relation
        const fullMessage = await prisma.message.findUnique({
          where: { id: savedMessage.id },
          include: {
            quotedMessage: true,
          },
        });

        // Broadcast new message to UI agents
        io.to(organizationId).emit("new-message", {
          conversationId: conversation.id,
          message: fullMessage,
        });

        // 4. Trigger Chatbot Flow Logic (if bot is not paused)
        if (!conversation.isBotPaused) {
          // We will implement the flow execution engine in a separate service
          // For now, let's call the function asynchronously
          processChatbotFlow(conversation.id, savedMessage.id).catch((err) => {
            console.error("Error executing chatbot flow engine:", err);
          });
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.sendStatus(200); // Return 200 so Meta stops retrying
  }
};


