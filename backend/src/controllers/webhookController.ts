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

    // Handle Instagram Webhook Events
    if (body.object === "page") {
      const entry = body.entry?.[0];
      const messagingObj = entry?.messaging?.[0];
      if (!messagingObj) {
        return res.sendStatus(200);
      }

      const senderId = messagingObj.sender?.id;
      const recipientId = messagingObj.recipient?.id;
      const message = messagingObj.message;

      if (!message || !senderId || !recipientId) {
        return res.sendStatus(200);
      }

      const mid = message.mid;
      const isEcho = message.is_echo === true;
      const timestamp = new Date(messagingObj.timestamp || Date.now());

      const pageId = isEcho ? senderId : recipientId;
      const customerPhone = isEcho ? recipientId : senderId;

      // 1. Resolve InstagramConfig by pageId
      const igConfig = await prisma.instagramConfig.findFirst({
        where: { pageId },
        include: { organization: true }
      });

      if (!igConfig) {
        console.warn(`No Instagram configuration found for Page ID: ${pageId}`);
        return res.sendStatus(200);
      }

      const organizationId = igConfig.organizationId;

      // 2. Determine message type and content
      let messageType = "text";
      let content = "";
      let mimeType: string | undefined = undefined;

      if (message.quick_reply) {
        content = message.text || message.quick_reply.payload || "";
        messageType = "text";
      } else if (message.text) {
        content = message.text;
        messageType = "text";
      } else if (message.attachments && message.attachments.length > 0) {
        const attachment = message.attachments[0];
        messageType = attachment.type;
        if (messageType === "file") {
          messageType = "document";
        }
        
        const mediaUrl = attachment.payload?.url || "";
        if (messageType === "document") {
          content = `instagram_file.pdf|${mediaUrl}`;
        } else {
          content = mediaUrl;
        }
      }

      // Find or create conversation
      let conversation = await prisma.conversation.findUnique({
        where: {
          organizationId_platform_customerPhone: {
            organizationId,
            platform: "instagram",
            customerPhone,
          },
        },
      });

      const contactName = "Instagram User";

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            organizationId,
            platform: "instagram",
            customerPhone,
            customerName: contactName,
            isBotPaused: isEcho,
            botPausedUntil: isEcho ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
          },
        });
      } else if (isEcho) {
        const pauseDuration = 24 * 60 * 60 * 1000;
        const botPausedUntil = new Date(Date.now() + pauseDuration);
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            isBotPaused: true,
            botPausedUntil,
          },
        });

        // Broadcast bot status update
        io.to(organizationId).emit("bot-status-change", {
          conversationId: conversation.id,
          isBotPaused: true,
          botPausedUntil,
        });
      }

      // Save message in DB
      const savedMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: isEcho ? "outbound" : "inbound",
          messageType,
          content,
          mediaMimeType: mimeType,
          waMessageId: mid,
          status: isEcho ? "sent" : "read",
          createdAt: timestamp,
          senderName: isEcho ? "Agent" : null,
        },
      });

      // Broadcast message to clients
      io.to(organizationId).emit("new-message", {
        conversationId: conversation.id,
        message: savedMessage,
      });

      // Trigger chatbot flow
      if (!isEcho && !conversation.isBotPaused) {
        processChatbotFlow(conversation.id, savedMessage.id).catch((err) => {
          console.error("Error executing Instagram chatbot flow engine:", err);
        });
      }

      return res.sendStatus(200);
    }

    // Handle WhatsApp Webhook Events
    if (body.object !== "whatsapp_business_account") {
      return res.sendStatus(404);
    }

    console.log("=== INCOMING WHATSAPP WEBHOOK PAYLOAD ===");
    console.log(JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      console.log("Webhook received but 'changes.value' is empty.");
      return res.sendStatus(200); // Acknowledge so Meta doesn't retry
    }

    const metadata = value.metadata;
    const phoneNumberId = metadata?.phone_number_id;

    if (!phoneNumberId) {
      console.log("Webhook changes.value received but 'phone_number_id' is missing from metadata.");
      return res.sendStatus(200);
    }

    console.log(`Searching database for Phone Number ID: "${phoneNumberId}"`);

    // 1. Find Organization matching the Phone Number ID
    let waConfig = await prisma.whatsAppConfig.findFirst({
      where: { phoneNumberId },
      include: { organization: true },
    });

    if (!waConfig) {
      // Fallback to default organization if matching by phoneNumberId fails
      console.warn(`No exact match for Phone Number ID: ${phoneNumberId}. Falling back to default organization...`);
      const defaultOrg = await prisma.organization.findFirst({
        include: { waConfig: true }
      });
      if (defaultOrg && defaultOrg.waConfig) {
        waConfig = defaultOrg.waConfig as any;
      }
    }

    if (!waConfig) {
      console.warn(`❌ No organization configuration found for Phone Number ID: ${phoneNumberId}`);
      return res.sendStatus(200);
    }

    console.log(`✅ Found organization match: "${waConfig.organization.name}" (${waConfig.organizationId})`);
    const organizationId = waConfig.organizationId;

    // 2. Handle Message Status Updates (Sent, Delivered, Read, Failed)
    if (value.statuses && value.statuses.length > 0) {
      console.log(`Processing ${value.statuses.length} message status updates...`);
      for (const statusObj of value.statuses) {
        const { id: waMessageId, status, recipient_id } = statusObj;

        // Update message status in the database
        const updatedMessage = await prisma.message.updateMany({
          where: { waMessageId },
          data: { status },
        });

        console.log(`Updated status of message ${waMessageId} to "${status}". DB Count: ${updatedMessage.count}`);

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
      console.log(`Processing ${value.messages.length} incoming messages...`);
      const contactName = value.contacts?.[0]?.profile?.name || "WhatsApp User";
      
      for (const message of value.messages) {
        const customerPhone = message.from;
        const waMessageId = message.id;
        const timestamp = new Date(parseInt(message.timestamp) * 1000);
        const type = message.type;
        const context = message.context; // Meta context block for quotes: { id, from }
        
        let content = "";
        let mimeType: string | undefined = undefined;

        // Extract message content cleanly based on Meta type
        if (type === "text") {
          content = message.text?.body || "";
        } else if (type === "button") {
          content = message.button?.text || message.button?.payload || "";
        } else if (type === "interactive") {
          const interactiveType = message.interactive?.type;
          if (interactiveType === "button_reply") {
            content = message.interactive.button_reply?.title || "";
          } else if (interactiveType === "list_reply") {
            content = message.interactive.list_reply?.title || "";
          } else {
            content = "Interactive response";
          }
        } else if (type === "location") {
          const loc = message.location;
          const locName = loc?.name ? `${loc.name} - ` : "";
          content = `📍 Location: ${locName}${loc?.address || `${loc?.latitude}, ${loc?.longitude}`}`;
        } else if (type === "contacts") {
          const c = message.contacts?.[0];
          const name = c?.name?.formatted_name || "Contact";
          const phone = c?.phones?.[0]?.phone || "";
          content = `👤 Shared Contact: ${name} (${phone})`;
        } else if (type === "reaction") {
          content = `Reacted: ${message.reaction?.emoji || "👍"}`;
        } else if (type === "sticker") {
          content = "🎨 [Sticker]";
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
              waConfig.phoneNumberId || "1192785647248309",
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
          // Meta unsupported payload or system message
          content = "💬 System Message / Unsupported Media Payload";
        }

        // Find or create the conversation using unique index organizationId_platform_customerPhone
        let conversation = await prisma.conversation.findUnique({
          where: {
            organizationId_platform_customerPhone: {
              organizationId,
              platform: "whatsapp",
              customerPhone,
            },
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId,
              platform: "whatsapp",
              customerPhone,
              customerName: contactName,
              isBotPaused: false,
            },
          });
        } else if (conversation.customerName !== contactName && contactName !== "WhatsApp User") {
          // Keep customer name updated with WhatsApp Profile Name
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

        console.log(`Saving message to database: direction=inbound, type=${type}, content="${content}"`);
        // Save incoming message in database
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: "inbound",
            messageType: type === "button" || type === "interactive" || type === "location" || type === "contacts" ? "text" : type,
            content,
            mediaMimeType: mimeType,
            waMessageId,
            status: "read", // Inbound messages are read by server immediately
            createdAt: timestamp,
            quotedMessageId: quotedMessageId || null,
          },
        });
        console.log(`Saved message in database successfully. Message ID: "${savedMessage.id}"`);

        // Fetch populated message with the quoted relation
        const fullMessage = await prisma.message.findUnique({
          where: { id: savedMessage.id },
          include: {
            quotedMessage: true,
          },
        });

        // Broadcast new message to UI agents
        console.log(`Broadcasting new-message event via Socket.IO to Room: "${organizationId}"`);
        io.to(organizationId).emit("new-message", {
          conversationId: conversation.id,
          message: fullMessage,
        });

        // 4. Trigger Chatbot Flow Logic (if bot is not paused)
        if (!conversation.isBotPaused) {
          console.log(`Triggering processChatbotFlow for conversation: "${conversation.id}"...`);
          processChatbotFlow(conversation.id, savedMessage.id).then(() => {
            console.log(`processChatbotFlow execution complete for message: "${savedMessage.id}"`);
          }).catch((err) => {
            console.error("❌ Error executing chatbot flow engine:", err);
          });
        } else {
          console.log(`Chatbot flow skipped because bot is paused for conversation: "${conversation.id}"`);
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.sendStatus(200); // Return 200 so Meta stops retrying
  }
};
