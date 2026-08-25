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
            waConfigs: true,
            igConfigs: true,
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
6. **JOB APPLICANT & CAREER INQUIRIES (CRITICAL CONTINUITY RULE)**:
   - Check the recent chat history carefully! If the customer previously mentioned applying for a job, looking for a job, interviewing, or has shared their resume (e.g. mentions "job", "apply", "resume", "cv", "hiring", "interview", or uploaded a document/PDF resume), THE ENTIRE CONVERSATION IS A JOB APPLICATION.
   - **CRITICAL STICKINESS RULE**: STAY STICKY IN THE JOB APPLICANT FLOW! DO NOT SWITCH TO SELLING COMPANY SERVICES TO A JOB APPLICANT!
   - If the candidate mentions terms like "Digital Marketing", "Meta Ads", "Google Ads", "Web Development", "Python", "SEO", etc., treat these strictly as THE JOB POSITION / ROLE THEY ARE APPLYING FOR (e.g., "Got it! You are applying for the Digital Marketing / Meta Ads role."), NOT as services they want to purchase!
   - **ALWAYS ACKNOWLEDGE RESUME & CONFIRM CALL BACK**: Once they share their resume or specify the position, acknowledge warmly in the customer's detected language (English, Hindi, Hinglish, Marathi, etc.) and state clearly that HR will review their application and call them:
     - Example (Hinglish/Hindi): "Aapki application aur resume mil gayi hai, thank you! Humari HR team aapki application review karegi aur aapko jaldi call karegi."
     - Example (English): "Thank you for sharing your resume and details for the Digital Marketing / Meta Ads role! Our HR team will review your application and call you shortly with an update."
7. **AUTOMATIC MULTILINGUAL MATCHING & CONTINUITY (CRITICAL RULE)**:
   - Detect the language of the customer's incoming message (e.g., Hindi, Marathi, Telugu, Tamil, Kannada, Gujarati, Hinglish, English, etc.).
   - Respond strictly in the EXACT SAME LANGUAGE as the user!
   - **CONTINUITY**: Maintain this detected language for all subsequent responses throughout the chat history, ensuring seamless single-language conversation until the customer chooses to switch.
8. **META ADS & SPECIAL OFFER DIRECT PITCHING (CRITICAL RULE)**:
   - If the customer clicked on a Meta Ad (e.g. contains '[Customer clicked Meta Ad]' or mentions seeing an ad/offer/discount/promotion), DO NOT give a plain generic greeting!
   - Immediately welcome them enthusiastically to our active Meta Ads promotion:
     "Welcome! You've unlocked our active Meta Ads Special Offer: 50% OFF on all Website & Mobile App Development packages (starting at ₹5,999/-) and 30% OFF on Digital Marketing & SEO! What project can we help you build today to lock in your discount?"
   - Direct, enthusiastic, and focused on offering the discounted price right away!

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
        model: "openai/gpt-oss-120b",
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
    const waConfig = conversation.organization.waConfigs?.find((c: any) => c.isDefault) || conversation.organization.waConfigs?.[0];
    const igConfig = conversation.organization.igConfigs?.find((c: any) => c.isDefault) || conversation.organization.igConfigs?.[0];
    const ytConfig = conversation.organization.ytConfig;
    const linkedInConfig = conversation.organization.linkedInConfig;

    // Dispatch Text Message
    let outWaId: string | null = null;
    if (isWhatsApp && waConfig?.phoneNumberId && waConfig?.accessToken) {
      const resData = await WhatsAppService.sendTextMessage(
        waConfig.phoneNumberId,
        waConfig.accessToken,
        customerPhone,
        replyText
      );
      outWaId = resData?.messages?.[0]?.id || resData?.message_id || null;
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

    // Dispatch Attached Media (Screenshot / PDF / Multiple Images) if requested
    for (const attachedItem of attachedItems) {
      if (!attachedItem.mediaUrl) continue;

      const mediaType = attachedItem.mediaType || "image";
      const rawMediaString = attachedItem.mediaUrl.trim();
      const mediaCaption = attachedItem.mediaTitle || attachedItem.topic;

      // Extract all media URLs (supports single URL, comma-separated, pipe-separated, or JSON array string)
      let mediaUrls: string[] = [];
      if (rawMediaString.startsWith("[")) {
        try { mediaUrls = JSON.parse(rawMediaString); } catch(e) { mediaUrls = [rawMediaString]; }
      } else if (rawMediaString.includes(",")) {
        mediaUrls = rawMediaString.split(",").map(u => u.trim()).filter(Boolean);
      } else if (rawMediaString.includes("|")) {
        mediaUrls = rawMediaString.split("|").map(u => u.trim()).filter(Boolean);
      } else {
        mediaUrls = [rawMediaString];
      }

      for (const singleMediaUrl of mediaUrls) {
        if (!singleMediaUrl) continue;

        let mediaWaId: string | null = null;
        if (isWhatsApp && waConfig?.phoneNumberId && waConfig?.accessToken) {
          const resMediaData = await WhatsAppService.sendMediaMessage(
            waConfig.phoneNumberId,
            waConfig.accessToken,
            customerPhone,
            mediaType === "document" ? "document" : "image",
            singleMediaUrl,
            attachedItem.mediaTitle || undefined,
            mediaCaption || undefined
          );
          mediaWaId = resMediaData?.messages?.[0]?.id || resMediaData?.message_id || null;
        } else if (isInstagram && igConfig?.pageAccessToken) {
          await InstagramService.sendMediaMessage(
            igConfig.pageAccessToken,
            customerPhone,
            mediaType === "document" ? "document" : "image",
            singleMediaUrl,
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
            content: mediaType === "document" ? `${attachedItem.mediaTitle || 'Document.pdf'}|${singleMediaUrl}` : singleMediaUrl,
            mediaUrl: singleMediaUrl,
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
    }

    // 8. Handle AI Captured Lead (Service requirement, pricing, job inquiries, callback requests)
    // Ignore system notifications, deleted messages, or calls
    const isSystemMessage = customerQuery.startsWith("ℹ️") || 
                            customerQuery.startsWith("💬") || 
                            customerQuery.startsWith("📞") || 
                            customerQuery.startsWith("🗑️") || 
                            /system notification|unsupported payload/i.test(customerQuery);

    const isLeadExpressingInterest = !isSystemMessage && (
      parsedResult?.capturedLead?.isLead === true ||
      (parsedResult?.capturedLead && (parsedResult.capturedLead.phone || parsedResult.capturedLead.email || parsedResult.capturedLead.name || parsedResult.capturedLead.topic)) ||
      /\b(website|web app|web dev|web design|landing page|seo|google ranking|digital marketing|meta ads|social media|mobile app|android app|ios app|flutter|pricing|cost|discount|quote|hiring|job|resume|cv|vacancy)\b/i.test(customerQuery)
    );

    if (isLeadExpressingInterest) {
      const leadData = parsedResult?.capturedLead || {};
      
      // Check if conversation history is a job application
      const isJobCandidateContext = recentMessages.some(m => /\b(job|career|resume|cv|hiring|vacancy|interview|apply|applying)\b/i.test(m.content));

      // Determine precise topic
      let topicSummary = leadData.topic || "";
      if (isJobCandidateContext) {
        topicSummary = `Job Candidate / Hiring Inquiry (${customerQuery.slice(0, 50)})`;
      } else if (!topicSummary || topicSummary === "extracted_topic_or_null") {
        if (/\b(website|web app|web dev|web design|landing page)\b/i.test(customerQuery)) topicSummary = "Website Development";
        else if (/\b(android app|ios app|mobile app|flutter|react native)\b/i.test(customerQuery)) topicSummary = "Mobile App Development";
        else if (/\b(seo|google ranking|search engine)\b/i.test(customerQuery)) topicSummary = "SEO & Google Ranking";
        else if (/\b(digital marketing|meta ads|social media|smm)\b/i.test(customerQuery)) topicSummary = "Digital Marketing & Ads";
        else if (/\b(job|career|resume|cv|hiring|vacancy|interview)\b/i.test(customerQuery)) topicSummary = "Job Candidate / Hiring Inquiry";
        else if (/\b(price|pricing|cost|quote|discount|package|rate)\b/i.test(customerQuery)) topicSummary = "Pricing & Package Inquiry";
        else topicSummary = customerQuery.slice(0, 100);
      }

      const notesText = (leadData.notes && leadData.notes !== "additional_notes_or_null") 
        ? leadData.notes 
        : `Discussed ${topicSummary} via ${conversation.platform || 'WhatsApp'}`;
      
      const leadName = (leadData.name && leadData.name !== "extracted_name_or_null") ? leadData.name : (conversation.customerName || "WhatsApp Lead");
      const leadEmail = (leadData.email && leadData.email !== "extracted_email_or_null") ? leadData.email : null;

      try {
        const existingLead = await prisma.aiCapturedLead.findFirst({
          where: { organizationId: orgId, customerPhone }
        });

        if (existingLead) {
          await prisma.aiCapturedLead.update({
            where: { id: existingLead.id },
            data: {
              customerName: leadName !== "WhatsApp Lead" ? leadName : existingLead.customerName,
              email: leadEmail || existingLead.email,
              topicDiscussed: topicSummary.slice(0, 255),
              notes: notesText,
              updatedAt: new Date(),
            }
          });
          console.log(`[AI AGENT ENGINE] ✅ Lead updated for phone: ${customerPhone} -> ${topicSummary}`);
        } else {
          await prisma.aiCapturedLead.create({
            data: {
              organizationId: orgId,
              customerPhone,
              customerName: leadName,
              email: leadEmail,
              topicDiscussed: topicSummary.slice(0, 255),
              notes: notesText,
              status: "NEW",
            }
          });
          console.log(`[AI AGENT ENGINE] ✅ New Lead captured for phone: ${customerPhone} -> ${topicSummary}`);
        }
      } catch (leadErr: any) {
        console.error(`[AI AGENT ENGINE] Error saving captured lead:`, leadErr.message);
      }
    }

    console.log(`[AI AGENT ENGINE] Replied to ${customerPhone} with "${replyText.slice(0, 40)}..."`);
  } catch (error: any) {
    console.error("[AI AGENT ENGINE] Error processing AI chat:", JSON.stringify(error.response?.data || error.message || error, null, 2));
    
    // GUARANTEED ZERO UNREPLIED MESSAGES FALLBACK
    try {
      const fallbackConv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { organization: { include: { waConfigs: true, igConfigs: true } } },
      });
      if (fallbackConv && !fallbackConv.isBotPaused) {
        const fallbackText = "Thank you for reaching out to Jisnu Digital Solutions! Our senior representative has received your message and will guide you personally in just a moment.";
        const waConfig = fallbackConv.organization.waConfigs?.find((c: any) => c.isDefault) || fallbackConv.organization.waConfigs?.[0];
        const customerPhone = fallbackConv.customerPhone;
        
        let outWaId: string | null = null;
        if (fallbackConv.platform === "whatsapp" && waConfig?.phoneNumberId && waConfig?.accessToken) {
          const resData = await WhatsAppService.sendTextMessage(
            waConfig.phoneNumberId,
            waConfig.accessToken,
            customerPhone,
            fallbackText
          );
          outWaId = resData?.messages?.[0]?.id || resData?.message_id || null;
        }

        const savedFallback = await prisma.message.create({
          data: {
            conversationId: fallbackConv.id,
            direction: "outbound",
            messageType: "text",
            content: fallbackText,
            waMessageId: outWaId,
            status: "sent",
            senderName: "AI Sales Specialist",
          },
        });

        const { io: socketIo } = require("../index");
        if (socketIo) {
          socketIo.to(fallbackConv.organizationId).emit("new-message", {
            conversationId: fallbackConv.id,
            message: savedFallback,
          });
        }
        console.log(`[AI AGENT ENGINE] Emergency fallback reply sent to ${customerPhone}`);
      }
    } catch (fallbackErr: any) {
      console.error("[AI AGENT ENGINE] Emergency fallback error:", fallbackErr.message);
    }
  }
}
