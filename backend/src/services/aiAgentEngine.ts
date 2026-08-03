import axios from "axios";
import prisma from "../utils/prisma";
import { WhatsAppService } from "./whatsappService";
import { InstagramService } from "./instagramService";
import { YouTubeService } from "./youtubeService";
import { LinkedInService } from "./linkedinService";
import { io } from "../index";

interface KnowledgeItem {
  id: string;
  category: string;
  topic: string;
  keywords: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaTitle?: string | null;
}

interface AiAgentResponse {
  replyText: string;
  attachKnowledgeId?: string | null;
  capturedLead?: {
    name?: string;
    email?: string;
    phone?: string;
    topic?: string;
    notes?: string;
  } | null;
}

/**
 * Calculates keyword relevance score between customer message and a knowledge item.
 */
function scoreKnowledgeMatch(messageText: string, item: KnowledgeItem): number {
  const queryWords = messageText.toLowerCase().replace(/[^\w\s]/gi, "").split(/\s+/).filter(Boolean);
  const topicWords = item.topic.toLowerCase().split(/\s+/);
  const keywords = (item.keywords || "").toLowerCase().split(/[\s,]+/);
  const contentText = item.content.toLowerCase();

  let score = 0;
  for (const word of queryWords) {
    if (word.length < 3) continue;
    if (topicWords.some(tw => tw.includes(word))) score += 5;
    if (keywords.some(kw => kw.includes(word))) score += 4;
    if (contentText.includes(word)) score += 1;
  }
  return score;
}

/**
 * Core Human-Like Conversational AI Engine.
 * Uses Groq LLaMA-3.3 70B Model to answer customer questions based strictly on trained company data,
 * attach portfolio screenshots/PDFs, and capture leads for outbound callbacks.
 */
export async function processAiAgentChat(conversationId: string, incomingMessageId: string) {
  try {
    // 1. Fetch Conversation with Organization credentials & AI Agent Config
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        organization: {
          include: {
            waConfig: true,
            igConfig: true,
            ytConfig: true,
            linkedInConfig: true,
            aiAgentConfig: true,
          },
        },
      },
    });

    const incomingMsg = await prisma.message.findUnique({
      where: { id: incomingMessageId },
    });

    if (!conversation || !incomingMsg || conversation.isBotPaused) {
      console.log(`[AI AGENT ENGINE] Skipped conversation ${conversationId}. Bot paused or missing message.`);
      return;
    }

    const orgId = conversation.organizationId;
    const aiConfig = conversation.organization.aiAgentConfig;

    // Default configuration if client hasn't saved one yet
    const agentName = aiConfig?.agentName || "AI Sales & Support Specialist";
    const personalityPrompt = aiConfig?.personalityPrompt || 
      "You are a warm, highly knowledgeable human sales & customer representative. Chat in a friendly, conversational tone. Answer questions based on trained company data. Attach relevant portfolio screenshots or PDFs when requested, and collect contact details if the user wants to be called back.";
    const activeMode = aiConfig?.activeMode || "AI_AGENT";
    const autoSendMedia = aiConfig?.autoSendMedia !== false;

    // 2. Fetch last 10 messages for natural dialogue context
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    recentMessages.reverse(); // Chronological order

    // 3. Retrieve ALL Trained Knowledge Base Items for this Organization (Full AI Brain)
    const allKnowledgeItems = await prisma.aiKnowledgeItem.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
      },
    });

    const rawContent = incomingMsg.content || "";
    const msgType = incomingMsg.messageType || "text";
    
    // Build a human-readable customer query — for media types, describe what was received
    let customerQuery = rawContent;
    if (["image", "document", "video", "audio", "voice"].includes(msgType)) {
      const mediaLabel = msgType === "document" ? `a document named "${rawContent}"` 
        : msgType === "image" ? "an image"
        : msgType === "video" ? "a video"
        : "an audio file";
      customerQuery = `[The customer just sent ${mediaLabel}. Acknowledge receipt naturally and continue collecting any remaining information needed based on the recent chat context. Do NOT ask them to send the file again — it has been received.]`;
    } else if (rawContent.startsWith("[Received ")) {
      // Already patched by webhook controller for media acknowledgement
      customerQuery = rawContent;
    }

    // Format Full Knowledge Base Context so AI has complete company knowledge regardless of keywords
    let knowledgeContextText = "";
    if (allKnowledgeItems.length > 0) {
      knowledgeContextText = allKnowledgeItems.map(k => `
[KNOWLEDGE TOPIC: ${k.topic}] (Category: ${k.category})
Keywords Tagged: ${k.keywords}
Detailed Information: ${k.content}
${k.mediaUrl ? `Media Asset ID: "${k.id}" (Type: ${k.mediaType}, Title: "${k.mediaTitle || 'Attachment'}", URL: ${k.mediaUrl})` : 'No media asset attached'}
---`).join("\n");
    } else {
      knowledgeContextText = "Company Information: Jisnu Digital Solutions PVT LTD - High performance website development, custom web applications, technical SEO, and paid ad campaigns. Phone: +91 9136870930, Email: info@jisnudigital.com, Address: Wakad, Pune 411057.";
    }

    // 4. Build Groq AI System Prompt with Human Conversational Intelligence
    const groqApiKey = (aiConfig as any)?.groqApiKey?.trim() || process.env.GROQ_KEY;
    if (!groqApiKey) {
      console.warn("[AI AGENT ENGINE] GROQ_KEY is missing from configuration & environment.");
      return;
    }

    const systemPrompt = `You are "${agentName}", a warm, highly intelligent, and human-like sales and growth consultant for our company.

### YOUR PERSONALITY & DIALOGUE GOALS:
${personalityPrompt}

### RESPONSE LENGTH — CRITICAL RULE:
Keep every reply SHORT — maximum 2-3 sentences. This is WhatsApp, not email. Write plain text only — no bullet points, no markdown bold, no numbered lists. Retrieve information naturally across multiple messages like a real human conversation — never dump everything in one long reply.

### STRICT HUMAN CONVERSATIONAL RULES:
1. **Be Warm, Natural & Conversational**: Speak like a real senior sales executive chatting on WhatsApp. Keep messages clear, polite, and engaging. Never sound like a robotic form or list of options.
2. **Handle Greetings & Freeform Questions Intelligently**:
   - If the customer says "Hi", "Hey", "Hello", "Good morning", "How are you", or asks a general greeting without a specific media request, greet them warmly in a friendly, conversational human tone, ask about their business goals, and offer assistance.
   - **CRITICAL RULE ON GREETINGS**: For simple greetings like 'hey' or 'hi', NEVER attach any media files. Set attachKnowledgeIds to an empty array [].
3. **Use Trained Data**: Answer questions based on the trained company data provided below.
4. **Contextual Media & Screenshot Sending**:
   - ONLY attach media assets if the customer explicitly asks to see sample work, portfolio, screenshots, rate cards, brochures, or proof of work.
   - If (and ONLY if) the customer explicitly requests proof or media, return the matching asset IDs in "attachKnowledgeIds": ["ID1", "ID2"]. Otherwise, keep "attachKnowledgeIds": [].
5. **Deal Closing & Business Lead Capture**:
   - Converse naturally like a top-performing Senior Growth Consultant closing web & digital marketing deals on WhatsApp.
   - Build value around our core services (High-Performance Next.js Web Portals, Rank #1 Google SEO, Meta/Google Ads).
   - When the customer shows interest in custom pricing, starting a project, or getting a quote, naturally close the conversation: "I'd love to schedule a quick 10-minute strategy call with our team. May I have your Full Name, Phone Number, and Email so I can lock in your slot?"
6. **Job Applicant & Career Inquiries**:
   - Be warm, encouraging, and professional with job seekers.
   - Share open positions (Full-Stack Web Developers, Performance Marketers, UI/UX, Sales Executives) and internships.
   - Ask for their Full Name, Phone Number, Email, Qualification/Years of Experience, and Resume Link (LinkedIn/Drive) — ask one thing at a time, naturally across the conversation.

### TRAINED COMPANY KNOWLEDGE BASE DATA:
${knowledgeContextText}

### RECENT CHAT HISTORY (Last 10 Messages):
${recentMessages.map(m => `${m.direction === 'inbound' ? 'Customer' : 'Agent (' + agentName + ')'}: ${m.content}`).join("\n")}

### REQUIRED JSON OUTPUT FORMAT:
Return ONLY valid JSON. replyText must be 1-3 plain sentences — no bullets, no markdown, no long paragraphs:
{
  "replyText": "Your short, natural WhatsApp reply here — plain text, 1-3 sentences only",
  "attachKnowledgeIds": ["only_when_customer_explicitly_asks_for_media"],
  "capturedLead": {
    "name": "extracted_name_or_null",
    "email": "extracted_email_or_null",
    "phone": "extracted_phone_or_null",
    "topic": "topic_discussed_or_null",
    "notes": "additional_notes_or_null"
  }
}`;

    // 5. Call Groq LLaMA 3.3 70B REST API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Respond in valid json format to the incoming customer message: "${customerQuery}"` }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const rawChoiceContent = response.data.choices?.[0]?.message?.content;
    if (!rawChoiceContent) {
      console.error("[AI AGENT ENGINE] Empty response from Groq API.");
      return;
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(rawChoiceContent);
    } catch (parseErr) {
      console.error("[AI AGENT ENGINE] Error parsing JSON from Groq:", parseErr);
      parsedResult = { replyText: rawChoiceContent };
    }

    const replyText = parsedResult.replyText || "Thank you for reaching out! Let me connect you with our team specialist for full details.";
    
    // Support single ID or array of IDs
    let rawAttachIds: string[] = [];
    if (Array.isArray(parsedResult.attachKnowledgeIds)) {
      rawAttachIds = parsedResult.attachKnowledgeIds;
    } else if (parsedResult.attachKnowledgeId) {
      rawAttachIds = [parsedResult.attachKnowledgeId];
    }

    // 6. Collect all matching Knowledge Media Items
    const attachedItems: KnowledgeItem[] = [];
    if (autoSendMedia && rawAttachIds.length > 0) {
      for (const id of rawAttachIds) {
        const found = allKnowledgeItems.find(k => k.id === id);
        if (found && found.mediaUrl) {
          attachedItems.push(found as KnowledgeItem);
        }
      }
    }

    // 7. Save AI Agent Response to DB & Dispatch via Channel API
    const isWhatsApp = conversation.platform === "whatsapp";
    const isInstagram = conversation.platform === "instagram";
    const isYouTube = conversation.platform === "youtube";
    const isLinkedIn = conversation.platform === "linkedin";

    const customerPhone = conversation.customerPhone;
    const waConfig = conversation.organization.waConfig;
    const igConfig = conversation.organization.igConfig;
    const ytConfig = conversation.organization.ytConfig;
    const linkedInConfig = conversation.organization.linkedInConfig;

    // Dispatch Text Message
    let outWaId: string | null = null;
    if (isWhatsApp && waConfig?.phoneNumberId && waConfig?.accessToken) {
      outWaId = await WhatsAppService.sendTextMessage(
        waConfig.phoneNumberId,
        waConfig.accessToken,
        customerPhone,
        replyText
      );
    } else if (isInstagram && igConfig?.pageId && igConfig?.pageAccessToken) {
      await InstagramService.sendTextMessage(
        igConfig.pageAccessToken,
        customerPhone,
        replyText
      );
    } else if (isYouTube && ytConfig?.accessToken) {
      await YouTubeService.sendCommentReply(
        ytConfig.channelId || "",
        ytConfig.accessToken,
        customerPhone,
        replyText
      );
    } else if (isLinkedIn && linkedInConfig?.accessToken) {
      await LinkedInService.replyToComment(
        linkedInConfig.accessToken,
        customerPhone,
        replyText
      );
    }

    // Save text message in Database
    const savedTextMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "outbound",
        messageType: "text",
        content: replyText,
        waMessageId: outWaId,
        status: "sent",
        senderName: agentName,
      },
    });

    // Broadcast Socket.IO event for live agent dashboard monitoring
    try {
      const { io: socketIo } = require("../index");
      if (socketIo) {
        socketIo.to(orgId).emit("new-message", {
          conversationId: conversation.id,
          message: savedTextMessage,
        });
      }
    } catch (ioErr: any) {
      console.warn("[AI AGENT ENGINE] Socket emit warning:", ioErr.message);
    }

    // Dispatch Attached Media (Screenshot / PDF) if requested
    for (const attachedItem of attachedItems) {
      if (!attachedItem.mediaUrl) continue;

      const mediaType = attachedItem.mediaType || "image";
      const mediaUrl = attachedItem.mediaUrl;
      const mediaCaption = attachedItem.mediaTitle || attachedItem.topic;

      let mediaWaId: string | null = null;
      if (isWhatsApp && waConfig?.phoneNumberId && waConfig?.accessToken) {
        mediaWaId = await WhatsAppService.sendMediaMessage(
          waConfig.phoneNumberId,
          waConfig.accessToken,
          customerPhone,
          mediaType === "document" ? "document" : "image",
          mediaUrl,
          attachedItem.mediaTitle || undefined,
          mediaCaption || undefined
        );
      } else if (isInstagram && igConfig?.pageAccessToken) {
        await InstagramService.sendMediaMessage(
          igConfig.pageAccessToken,
          customerPhone,
          mediaType === "document" ? "document" : "image",
          mediaUrl,
          attachedItem.mediaTitle || undefined,
          mediaCaption
        );
      }

      // Save media message in DB
      const savedMediaMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "outbound",
          messageType: mediaType === "document" ? "document" : "image",
          content: mediaType === "document" ? `${attachedItem.mediaTitle || 'Document.pdf'}|${mediaUrl}` : mediaUrl,
          mediaUrl: mediaUrl,
          waMessageId: mediaWaId,
          status: "sent",
          senderName: agentName,
        },
      });

      try {
        const { io: socketIo } = require("../index");
        if (socketIo) {
          socketIo.to(orgId).emit("new-message", {
            conversationId: conversation.id,
            message: savedMediaMessage,
          });
        }
      } catch (ioErr: any) {
        console.warn("[AI AGENT ENGINE] Socket media emit warning:", ioErr.message);
      }
    }

    // 8. Handle AI Captured Lead
    if (parsedResult.capturedLead && (parsedResult.capturedLead.phone || parsedResult.capturedLead.email || parsedResult.capturedLead.name)) {
      const leadData = parsedResult.capturedLead;
      await prisma.aiCapturedLead.create({
        data: {
          organizationId: orgId,
          customerPhone: leadData.phone || customerPhone,
          customerName: leadData.name || conversation.customerName || "WhatsApp User",
          email: leadData.email || null,
          topicDiscussed: leadData.topic || customerQuery,
          notes: leadData.notes || `Captured by AI Agent during WhatsApp conversation`,
          status: "NEW",
        },
      });

      console.log(`[AI AGENT ENGINE] ✅ Lead captured successfully for phone: ${customerPhone}`);
    }

    console.log(`[AI AGENT ENGINE] Replied to ${customerPhone} with "${replyText.slice(0, 40)}..."`);
  } catch (error: any) {
    console.error("[AI AGENT ENGINE] Error processing AI chat:", JSON.stringify(error.response?.data || error.message || error, null, 2));
  }
}
