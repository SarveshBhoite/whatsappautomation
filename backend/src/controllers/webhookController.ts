import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { io } from "../index";
import { processChatbotFlow } from "../services/flowEngine";
import { WhatsAppService } from "../services/whatsappService";
import { InstagramService } from "../services/instagramService";
import { InstagramCommentEngine } from "../services/instagramCommentEngine";

const processedComments = new Set<string>();

// GET: Webhook Verification
export const verifyWebhook = async (req: Request, res: Response) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"];

    const envVerifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "my_secure_verify_token_123";

    if (mode === "subscribe") {
      if (token === envVerifyToken) {
        console.log("[WEBHOOK VERIFY] Meta Webhook verified successfully via ENV token.");
        return res.status(200).send(challenge);
      }

      // Check if token matches any organization WhatsAppConfig or InstagramConfig
      const matchingWaConfig = await prisma.whatsAppConfig.findFirst({
        where: { webhookVerifyToken: token }
      });

      if (matchingWaConfig) {
        console.log(`[WEBHOOK VERIFY] Meta Webhook verified successfully for Org: ${matchingWaConfig.organizationId}`);
        return res.status(200).send(challenge);
      }

      console.warn(`[WEBHOOK VERIFY] Meta Webhook verification failed. Token received: "${token}" did not match.`);
      return res.sendStatus(403);
    }

    return res.sendStatus(400);
  } catch (error) {
    console.error("Error in webhook verification:", error);
    return res.sendStatus(500);
  }
};

// POST: Handle Webhook Events (Messages, Status updates)
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log(`[WEBHOOK RECEIVED] Path: ${req.path}, Object: ${body?.object}`);
    console.log("FULL PAYLOAD:", JSON.stringify(body, null, 2));

    // Handle Instagram Webhook Events (Messages & Comments)
    if (body.object === "page" || body.object === "instagram") {
      console.log("=== INCOMING INSTAGRAM WEBHOOK PAYLOAD ===");
      console.log(JSON.stringify(body, null, 2));

      const entries = body.entry || [];
      for (const entry of entries) {
        // 1. Check for Instagram Comments Webhook Event (entry.changes)
        const commentChange = entry?.changes?.[0];
        if (commentChange && commentChange.field === "comments") {
          const commentValue = commentChange.value;
          const commentId = commentValue?.id;
          const commentText = commentValue?.text;
          const mediaId = commentValue?.media?.id || "default_post";
          const fromUser = commentValue?.from?.username || commentValue?.from?.id;
          const fromUserId = commentValue?.from?.id;

          const igConfig = await prisma.instagramConfig.findFirst({
            include: { organization: true }
          });

          // Prevent self-loop / duplicate replies when the business page posts a reply
          const isSelfComment = fromUserId === igConfig?.instagramAccountId || 
                                fromUserId === igConfig?.pageId;

          if (isSelfComment) {
            console.log(`[INSTAGRAM COMMENT WEBHOOK] Ignored comment from business page self/bot (${fromUser}).`);
            continue;
          }

          // Network retry guard: Only prevent duplicate network retries for the exact same comment ID within 10s
          if (commentId && processedComments.has(commentId)) {
            continue;
          }

          if (commentId) {
            processedComments.add(commentId);
            setTimeout(() => processedComments.delete(commentId), 10 * 1000);
          }

          // Check for active Instagram Comment-to-DM Automations via Production Engine
          if (commentId && commentText) {
            try {
              const activeToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN || igConfig?.pageAccessToken;
              await InstagramCommentEngine.processIncomingComment({
                commentId,
                mediaId,
                commentText,
                fromUser,
                fromUserId,
                organizationId: igConfig?.organizationId,
                pageAccessToken: activeToken,
                pageId: igConfig?.pageId,
                instagramAccountId: igConfig?.instagramAccountId
              });
            } catch (err: any) {
              console.error("[COMMENT-TO-DM ENGINE ERROR]:", err.message || err);
            }
          }

          // Emit real-time comment notification via Socket.IO
          const io = req.app.get("io");
          if (io && igConfig?.organizationId) {
            io.to(igConfig.organizationId).emit("instagram-comment-received", {
              id: commentId || `cmt_${Date.now()}`,
              fromUser,
              commentText,
              createdAt: new Date().toISOString(),
              status: "REPLIED",
              autoReplyText: `Private DM sent to @${fromUser}`
            });
          }
          continue;
        }

        const messagingList = entry?.messaging || [];
        for (const messagingObj of messagingList) {
          const senderId = messagingObj.sender?.id;
          const recipientId = messagingObj.recipient?.id;
          const message = messagingObj.message;

          if (!message || !senderId || !recipientId) {
            continue;
          }

          const mid = message.mid;
          const isEcho = message.is_echo === true;
          const timestamp = new Date(messagingObj.timestamp || Date.now());

      const pageId = isEcho ? senderId : recipientId;
      const customerPhone = isEcho ? recipientId : senderId;

      // 1. Resolve InstagramConfig by pageId or instagramAccountId
      let igConfig = await prisma.instagramConfig.findFirst({
        where: {
          OR: [
            { pageId },
            { instagramAccountId: pageId }
          ]
        },
        include: { organization: true }
      });

      if (!igConfig) {
        // Fallback to first available config if only 1 config exists
        const count = await prisma.instagramConfig.count();
        if (count === 1) {
          igConfig = await prisma.instagramConfig.findFirst({
            include: { organization: true }
          });
        }
      }

      if (!igConfig) {
        console.warn(`No Instagram configuration found for Page ID / IG Account ID: ${pageId}`);
        continue;
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
        messageType = attachment.type || "file";

        // Normalize Instagram attachment types
        if (messageType === "file") {
          messageType = "document";
        } else if (messageType === "ig_reel" || messageType === "reel" || messageType === "share") {
          messageType = "video";
        } else if (messageType === "story_mention") {
          messageType = "image";
        }
        
        const mediaUrl = attachment.payload?.url || "";
        if (messageType === "document") {
          content = `instagram_file.pdf|${mediaUrl}`;
        } else {
          content = mediaUrl;
        }
      }

      // Find or create conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          organizationId,
          platform: "instagram",
          customerPhone,
        },
      });

      let contactName = `Instagram User (${customerPhone.substring(0, 5)}...)`;
      if (!isEcho && igConfig.pageAccessToken) {
        try {
          const profile = await InstagramService.getUserProfile(igConfig.pageAccessToken, customerPhone);
          if (profile && (profile.name || profile.username)) {
            contactName = profile.name || `@${profile.username}`;
          }
        } catch (err: any) {
          // Profile lookup permissions require instagram_manage_messages; fallback cleanly
          console.warn("Instagram user profile lookup skipped:", err?.message || err);
        }
      }

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            organizationId,
            platform: "instagram",
            customerPhone,
            customerName: contactName,
            isBotPaused: false,
            botPausedUntil: null,
          },
        });
      } else {
        // Update customerName if it was default fallback or changed
        if (contactName !== "Instagram User" && conversation.customerName !== contactName) {
          conversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: { customerName: contactName },
          });
        }
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
    }
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

    // 1. Find Organization matching the Phone Number ID strictly
    let waConfig = await prisma.whatsAppConfig.findFirst({
      where: { phoneNumberId },
      include: { organization: true },
    });

    if (!waConfig) {
      console.warn(`❌ [WEBHOOK] No WhatsApp configuration found matching incoming Phone Number ID: ${phoneNumberId}. Ignoring webhook.`);
      return res.sendStatus(200);
    }

    console.log(`✅ Found organization match: "${waConfig.organization.name}" (${waConfig.organizationId})`);
    const organizationId = waConfig.organizationId;

    // 2. Handle Message Status Updates (Sent, Delivered, Read, Failed)
    if (value.statuses && value.statuses.length > 0) {
      console.log(`Processing ${value.statuses.length} message status updates...`);
      for (const statusObj of value.statuses) {
        const { id: waMessageId, status, recipient_id } = statusObj;
        const eventUniqueKey = `status_${waMessageId}_${status}`;

        // Phase 6/7: Strong DB-backed WebhookEvent persistence & Idempotency check
        try {
          const existingEvent = await (prisma as any).webhookEvent.findUnique({
            where: { providerEventId: eventUniqueKey }
          });
          if (existingEvent) {
            console.log(`[WEBHOOK IDEMPOTENCY] Status event ${eventUniqueKey} already processed. Skipping duplicate.`);
            continue;
          }

          await (prisma as any).webhookEvent.create({
            data: {
              organizationId,
              whatsappConfigId: waConfig.id,
              phoneNumberId,
              provider: "meta_whatsapp",
              providerEventId: eventUniqueKey,
              eventType: "status",
              payload: statusObj,
              status: "PROCESSED",
              processedAt: new Date()
            }
          });
        } catch (evtErr: any) {
          // If unique constraint triggers in race condition, safely skip
          console.warn(`[WEBHOOK DB IDEMPOTENCY]: Duplicate status event ${eventUniqueKey} caught.`);
          continue;
        }

        // Phase 8: Message State Machine - fetch current message and enforce valid progression
        const existingMsg = await prisma.message.findFirst({
          where: { waMessageId },
          select: { id: true, status: true },
        });

        let updatedCount = 0;
        if (existingMsg) {
          const { MessageStateMachine } = require("../services/whatsapp/outboundMessageService");
          if (MessageStateMachine.canTransitionOutbound(existingMsg.status, status)) {
            const updatedMessage = await prisma.message.updateMany({
              where: { waMessageId },
              data: { status },
            });
            updatedCount = updatedMessage.count;
            console.log(`[STATE MACHINE] Updated status of message ${waMessageId} from "${existingMsg.status}" to "${status}".`);
          } else {
            console.log(`[STATE MACHINE REJECT] Out-of-order status "${status}" rejected because current status is "${existingMsg.status}".`);
          }
        }

        // If message was sent by external software/dashboard (DB Count === 0), auto-create the message in CRM chat history ONLY if statusObj has template metadata or status is "sent"
        if (updatedCount === 0 && recipient_id && statusObj.status === "sent") {
          try {
            const formattedCustomerPhone = recipient_id.replace(/\D/g, "");
            let conversation = await prisma.conversation.findFirst({
              where: {
                organizationId,
                platform: "whatsapp",
                customerPhone: { contains: formattedCustomerPhone.slice(-10) }
              },
              orderBy: { updatedAt: "desc" }
            });

            if (!conversation) {
              conversation = await prisma.conversation.create({
                data: {
                  organizationId,
                  platform: "whatsapp",
                  customerPhone: formattedCustomerPhone,
                  customerName: `Lead (+${formattedCustomerPhone})`,
                  phoneNumberId: waConfig.phoneNumberId || null,
                  isBotPaused: false
                }
              });
            }

            // Attempt to fetch full template text (Header, Body, Footer) from Meta WABA API ONLY if template name is matched
            let templateBodyText = "";
            const categoryName = statusObj.pricing?.category ? ` (${statusObj.pricing.category.toUpperCase()})` : "";
            
            if (waConfig.wabaId && waConfig.accessToken) {
              try {
                const metaTplRes = await fetch(
                  `https://graph.facebook.com/v21.0/${waConfig.wabaId}/message_templates?limit=250&access_token=${waConfig.accessToken}`
                );
                if (metaTplRes.ok) {
                  const tplData = await metaTplRes.json();
                  const templatesList: any[] = tplData.data || [];
                  
                  // Match template by name if provided in status metadata, or find exact match
                  const templateNameInStatus = statusObj.template?.name || statusObj.message?.template?.name;
                  const matchedTpl = templateNameInStatus
                    ? templatesList.find((t: any) => t.name === templateNameInStatus)
                    : null;

                  if (matchedTpl && matchedTpl.components) {
                    const headerComp = matchedTpl.components.find((c: any) => c.type === "HEADER");
                    const bodyComp = matchedTpl.components.find((c: any) => c.type === "BODY");
                    const footerComp = matchedTpl.components.find((c: any) => c.type === "FOOTER");

                    const headerText = headerComp?.text ? `${headerComp.text}\n\n` : "";
                    const bodyText = bodyComp?.text || "";
                    const footerText = footerComp?.text ? `\n\n_${footerComp.text}_` : "";

                    templateBodyText = `📋 [Template: ${matchedTpl.name}]\n${headerText}${bodyText}${footerText}`;
                  }
                }
              } catch (metaErr) {
                console.warn("[WEBHOOK_META_FETCH_WARN]: Could not fetch template text from Meta:", metaErr);
              }
            }

            let autoMsg: any = null;
            // Only create message if we actually resolved template content or explicitly sent status
            if (templateBodyText) {
              const finalContent = templateBodyText;

              // Prevent race condition duplicate insertion if multiple webhooks arrive simultaneously
              const existingMsg = await prisma.message.findFirst({ where: { waMessageId } });
              autoMsg = existingMsg;
              if (!existingMsg) {
                autoMsg = await prisma.message.create({
                  data: {
                    conversationId: conversation.id,
                    direction: "outbound",
                    messageType: "template",
                    content: finalContent,
                    waMessageId: waMessageId,
                    status: status
                  }
                });
                console.log(`✅ Auto-synced external template message ${waMessageId} into CRM conversation ${conversation.id}`);
              }
            }

            // Touch conversation timestamp and store latest snippet
            const updatedConv = await prisma.conversation.update({
              where: { id: conversation.id },
              data: { updatedAt: new Date() },
              include: {
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 1
                }
              }
            });

            console.log(`✅ Auto-synced external template message ${waMessageId} into CRM conversation ${conversation.id}`);

            // Emit real-time socket event so chat sidebar updates live
            const socketIo = req.app.get("io") || io;
            if (socketIo) {
              socketIo.to(organizationId).emit("new-message", {
                message: autoMsg,
                conversation: updatedConv
              });
            }
          } catch (autoErr: any) {
            console.warn(`[WEBHOOK_AUTO_SYNC_WARN] Failed to auto-sync external status message:`, autoErr.message);
          }
        } else if (updatedCount > 0) {
          // If updated, notify the agents in real-time
          const socketIo = req.app.get("io") || io;
          if (socketIo) {
            socketIo.to(organizationId).emit("message-status-update", {
              waMessageId,
              status,
              customerPhone: recipient_id,
            });
          }
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
        
        const referral = message.referral; // Meta Ads Click referral: { source_url, source_type, source_id, headline, body, media_type, image_url, video_url }
        let referralText = "";
        if (referral) {
          const headline = referral.headline || "";
          const bodyText = referral.body || "";
          referralText = `[Customer clicked Meta Ad: "${headline || bodyText || referral.source_url || 'Meta Ad'}"] `;
          console.log(`[META ADS REFERRAL DETECTED] Headline: "${headline}", Body: "${bodyText}"`);
        }
        let content = "";
        let mimeType: string | undefined = undefined;

        // Extract message content cleanly based on Meta type
        if (type === "text") {
          content = (referralText ? referralText : "") + (message.text?.body || "");
        } else if (type === "button") {
          content = (referralText ? referralText : "") + (message.button?.text || message.button?.payload || "");
        } else if (type === "interactive") {
          const interactiveType = message.interactive?.type;
          if (interactiveType === "button_reply") {
            content = (referralText ? referralText : "") + (message.interactive.button_reply?.id || message.interactive.button_reply?.title || "");
          } else if (interactiveType === "list_reply") {
            content = (referralText ? referralText : "") + (message.interactive.list_reply?.id || message.interactive.list_reply?.title || "");
          } else {
            content = (referralText ? referralText : "") + "Interactive response";
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
            // Download from Meta and upload to ImageKit CDN
            const mediaPublicUrl = await WhatsAppService.downloadMedia(
              waConfig.phoneNumberId || "1192785647248309",
              waConfig.accessToken || "",
              mediaId,
              mimeType || "application/octet-stream",
              filename  // pass original filename for documents
            );
            if (type === "document" && filename) {
              content = `${filename}|${mediaPublicUrl}`;
            } else {
              content = mediaPublicUrl;
            }
          } else {
            content = "Media reference empty";
          }
        } else if (type === "unsupported") {
          const errDetail = message.errors?.[0]?.title || message.errors?.[0]?.details || message.unsupported?.details || "";
          console.log(`[UNSUPPORTED PAYLOAD DETECTED]:`, JSON.stringify(message, null, 2));
          if (errDetail.toLowerCase().includes("delete")) {
            content = "🗑️ [Message deleted by user]";
          } else if (errDetail.toLowerCase().includes("call")) {
            content = "📞 [WhatsApp Call notification]";
          } else if (errDetail) {
            content = `⚠️ [System Event: ${errDetail}]`;
          } else {
            content = "ℹ️ [WhatsApp System Notification]";
          }
        } else if (type === "order") {
          content = `🛒 [WhatsApp Order Received: ${message.order?.catalog_id || ''}]`;
        } else if (type === "system") {
          content = `⚙️ [System: ${message.system?.body || message.system?.type || 'WhatsApp Notification'}]`;
        } else {
          // Fallback for any other Meta payload type
          console.log(`[UNKNOWN MESSAGE TYPE PAYLOAD]: type=${type}`, JSON.stringify(message, null, 2));
          content = `💬 [WhatsApp ${type || 'System'} Event]`;
        }

        // If message was triggered by a Meta Click-to-WhatsApp Ad, tag it with referral info
        if (referral) {
          const adHeadline = referral.headline || referral.body || "Meta Ad Promotion";
          console.log(`[META AD REFERRAL]: Customer clicked Ad "${adHeadline}" (Source ID: ${referral.source_id || 'N/A'})`);
          content = `[Customer clicked Meta Ad: "${adHeadline}"] ${content}`;
        }

        // Find or create the conversation strictly scoped to this WhatsApp line (whatsappConfigId)
        let conversation = await (prisma as any).conversation.findFirst({
          where: {
            organizationId,
            platform: "whatsapp",
            customerPhone,
            whatsappConfigId: waConfig.id,
          },
        });

        if (!conversation) {
          conversation = await (prisma as any).conversation.create({
            data: {
              organizationId,
              platform: "whatsapp",
              whatsappConfigId: waConfig.id,
              customerPhone,
              customerName: contactName,
              phoneNumberId: phoneNumberId || waConfig.phoneNumberId || null,
              isBotPaused: false,
            },
          });
        } else {
          conversation = await (prisma as any).conversation.update({
            where: { id: conversation.id },
            data: {
              customerName: (conversation.customerName !== contactName && contactName !== "WhatsApp User") ? contactName : conversation.customerName,
              whatsappConfigId: waConfig.id,
              phoneNumberId: phoneNumberId || waConfig.phoneNumberId
            },
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
        // Determine separate content label and media url for media messages
        let messageContent = content;
        let messageMediaUrl: string | undefined = undefined;
        if (["image", "document", "video", "audio", "voice"].includes(type) && content.includes("|")) {
          // Document: filename|localUrl
          const parts = content.split("|");
          messageContent = parts[0]; // e.g. "Siddhi_Bhoite_8530241573.pdf"
          messageMediaUrl = parts[1]; // e.g. "/uploads/..."
        } else if (["image", "video", "audio", "voice"].includes(type)) {
          messageContent = type === "image" ? "📷 Image" : type === "video" ? "📹 Video" : "🎵 Audio";
          messageMediaUrl = content; // the local URL
        }

        // Phase 6/7: DB-backed WebhookEvent persistence & Idempotency check
        if (waMessageId) {
          try {
            const existingEvent = await (prisma as any).webhookEvent.findUnique({
              where: { providerEventId: waMessageId }
            });
            if (existingEvent) {
              console.log(`[WEBHOOK IDEMPOTENCY]: Message event ${waMessageId} already recorded. Skipping duplicate.`);
              continue;
            }

            await (prisma as any).webhookEvent.create({
              data: {
                organizationId,
                whatsappConfigId: waConfig.id,
                phoneNumberId,
                provider: "meta_whatsapp",
                providerEventId: waMessageId,
                eventType: "message",
                payload: message,
                status: "PROCESSING",
              }
            });
          } catch (evtErr: any) {
            console.warn(`[WEBHOOK DB IDEMPOTENCY]: Duplicate message event ${waMessageId} caught:`, evtErr.message);
            continue;
          }
        }

        // Additional Message Table Idempotency check: If this message ID already exists, ignore duplicate webhook delivery
        if (waMessageId) {
          const existing = await prisma.message.findUnique({
            where: { waMessageId }
          });
          if (existing) {
            console.log(`[WEBHOOK IDEMPOTENCY]: Message ${waMessageId} already in messages table. Skipping duplicate.`);
            continue;
          }
        }

        // Save incoming message in database
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: "inbound",
            messageType: type === "button" || type === "interactive" || type === "location" || type === "contacts" ? "text" : type,
            content: messageContent,
            mediaMimeType: mimeType,
            mediaUrl: messageMediaUrl,
            waMessageId,
            status: "read",
            createdAt: timestamp,
            quotedMessageId: quotedMessageId || null,
          },
        });
        console.log(`Saved message in database successfully. Message ID: "${savedMessage.id}"`);

        // Trigger WhatsApp Drip Campaign inbound reply handler (pauses/stops active drip steps on reply)
        import("../services/whatsappDripService").then(({ WhatsAppDripEngine }) => {
          WhatsAppDripEngine.handleInboundReply(organizationId, customerPhone).catch((err) => {
            console.error("[WEBHOOK DRIP HOOK ERROR]:", err);
          });
        });

        // For media messages, set the incoming content to a virtual text so AI can acknowledge receipt
        if (["image", "document", "video", "audio", "voice"].includes(type)) {
          const mediaLabel = type === "document" ? messageContent : type;
          // Patch the incomingMsg content so AI engine knows media was received
          await prisma.message.update({
            where: { id: savedMessage.id },
            data: { content: `[Received ${type}: ${messageContent}] Please acknowledge receipt and continue the conversation.` }
          });
        }
        // Fetch populated message with the quoted relation
        const fullMessage = await prisma.message.findUnique({
          where: { id: savedMessage.id },
          include: {
            quotedMessage: true,
          },
        });

        // Broadcast new message to UI agents
        console.log(`Broadcasting new-message event via Socket.IO to Room: "${organizationId}"`);
        const socketIo = req.app.get("io") || io;
        if (socketIo) {
          socketIo.to(organizationId).emit("new-message", {
            conversationId: conversation.id,
            message: fullMessage,
          });
        }

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
