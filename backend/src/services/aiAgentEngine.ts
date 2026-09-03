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
            ytConfigs: true,
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

    // 2. Fetch last 15 messages for natural dialogue context (ordered chronologically)
    const recentMessagesDesc = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const recentMessages = recentMessagesDesc.reverse(); // Chronological order (oldest to newest)

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
    if (customerQuery.startsWith("📋 [Template:")) {
      // Strip template prefix header so AI agent reads pure customer reply text
      customerQuery = customerQuery.replace(/^📋\s*\[Template:[^\]]+\]\s*/, "").trim();
    }
    if (customerQuery.startsWith("[Reply to: ")) {
      const closeBracketIndex = customerQuery.indexOf("] ");
      if (closeBracketIndex !== -1) {
        customerQuery = customerQuery.substring(closeBracketIndex + 2).trim();
      }
    }

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

    const companyName = conversation.organization.name || "our company";

    // Format Full Knowledge Base Context for THIS SPECIFIC ORGANIZATION ONLY
    let knowledgeContextText = "";
    if (allKnowledgeItems.length > 0) {
      knowledgeContextText = allKnowledgeItems.map(k => `
[KNOWLEDGE TOPIC: ${k.topic}] (Category: ${k.category})
Keywords Tagged: ${k.keywords}
Detailed Information: ${k.content}
${k.mediaUrl ? `Media Asset ID: "${k.id}" (Type: ${k.mediaType}, Title: "${k.mediaTitle || 'Attachment'}", URL: ${k.mediaUrl})` : 'No media asset attached'}
---`).join("\n");
    } else {
      knowledgeContextText = `Company Name: ${companyName}. Answer customer questions politely based on your training and offer to have our human team reach out.`;
    }

    // 4. Build Groq AI System Prompt with Dynamic Organization Awareness
    const groqApiKey = (aiConfig as any)?.groqApiKey?.trim() || process.env.GROQ_KEY;
    if (!groqApiKey) {
      console.warn("[AI AGENT ENGINE] GROQ_KEY is missing from configuration & environment.");
      return;
    }
    const currentTimestamp = new Date();
    const currentDateStr = currentTimestamp.toISOString().split("T")[0];
    const currentTimeStr = currentTimestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

    const systemPrompt = `You are "${agentName}", representing "${companyName}". You are a warm, highly intelligent, and human-like sales, growth and support consultant.
Current Date & Time in IST: ${currentDateStr} at ${currentTimeStr}.

### YOUR PERSONALITY & DIALOGUE GOALS:
${personalityPrompt}

### RESPONSE LENGTH — CRITICAL RULE:
Keep every reply SHORT — maximum 2-3 sentences. This is WhatsApp, not email. Write plain text only — no bullet points, no markdown bold, no numbered lists. Retrieve information naturally across multiple messages like a real human conversation — never dump everything in one long reply.

### STRICT HUMAN CONVERSATIONAL RULES:
1. **Be Warm, Natural & Conversational**: Speak as a real representative of ${companyName}. Keep messages clear, polite, and engaging.
2. **Handle Greetings & Freeform Questions Intelligently**:
   - If the customer says "Hi", "Hey", "Hello", "Good morning", "How are you", or asks a general greeting, greet them warmly, mention ${companyName}, ask how you can help, and offer assistance.
   - **CRITICAL RULE ON GREETINGS**: For simple greetings like 'hey' or 'hi', NEVER attach any media files. Set attachKnowledgeIds to [].
3. **Use Trained Data strictly for ${companyName}**: Answer questions ONLY based on the trained knowledge base data provided below for ${companyName}.
4. **Contextual Media & Asset Sending**:
   - ONLY attach media assets if the customer explicitly asks to see sample work, portfolio, screenshots, rate cards, brochures, or proof of work.
   - If (and ONLY if) the customer explicitly requests proof or media, return the matching asset IDs in "attachKnowledgeIds": ["ID1", "ID2"]. Otherwise, keep "attachKnowledgeIds": [].
5. **Deal Closing & Business Lead Capture**:
   - When the customer shows interest in custom pricing, starting a project, or getting a quote, naturally close the conversation: "I'd love to schedule a quick 10-minute consultation call with our ${companyName} team. May I have your Full Name, Phone Number, and Email so I can lock in your slot?"
6. **JOB APPLICANTS & RECRUITMENT HANDLING (CRITICAL RULE)**:
   - Check recent chat history. If the candidate mentions applying for a job, interviewing, or shares a resume/CV, treat all subsequent messages strictly as a job application for ${companyName}. Do NOT pitch company services to job applicants!
   - If the candidate mentions terms like "Digital Marketing", "Meta Ads", "Google Ads", "Web Development", "Python", "SEO", etc., treat these strictly as THE JOB POSITION / ROLE THEY ARE APPLYING FOR.
   - **ALWAYS ACKNOWLEDGE RESUME & CONFIRM CALL BACK**: Once they share their resume or specify the position, acknowledge warmly in the customer's detected language (English, Hindi, Hinglish, Marathi, etc.) and state clearly that HR will review their application and call them shortly.
7. **AUTOMATIC MULTILINGUAL MATCHING & CONTINUITY (CRITICAL RULE)**:
   - Detect the language of the customer's incoming message (e.g., Hindi, Marathi, Telugu, Tamil, Kannada, Gujarati, Hinglish, English, etc.).
   - Respond strictly in the EXACT SAME LANGUAGE as the user! Maintain this detected language for all subsequent responses throughout the chat history.
8. **OUTBOUND TEMPLATE, ADS & CAMPAIGN CONTINUITY**:
   - If the customer clicked on a Meta Ad (e.g. contains '[Customer clicked Meta Ad]' or mentions seeing an ad/offer/promotion), immediately welcome them enthusiastically to the promotion:
     "Welcome! You've unlocked our active Meta Ads Special Offer: 50% OFF on all Website & Mobile App Development packages (starting at ₹5,999/-) and 30% OFF on Digital Marketing & SEO! What project can we help you build today to lock in your discount?"
   - If the template offered a preview, catalog, rate card, or brochure, and the customer replies with confirmation (*"Yes send"*, *"Sure"*, *"Send it"*, *"Okay"*), IMMEDIATELY respond warmly and include the matching asset ID in "attachKnowledgeIds".
   - If the customer asks *"Why are you messaging me?"* or *"Who is this?"*, explain naturally: *"We reached out from ${companyName} regarding the offer/information sent above to see if it would help your business!"*
9. **GOOGLE MEET APPOINTMENT BOOKING (CRITICAL RULE)**:
   - For regular inquiries, greetings ('Hi', 'Hello'), questions, pricing, or casual talk:
     - Keep "requestedAppointment": { "isBookingRequested": false }
     - Answer the user's question naturally and conversationally.
   - ONLY when the customer EXPLICITLY asks to book or schedule a meeting/call (e.g. 'Schedule a google meet', 'book a slot', 'send instant meeting link', 'call me tomorrow at 4pm'):
     - **DO NOT WRITE ANY LINK OR URL IN YOUR replyText**. The system will automatically generate and attach the authentic Google Meet room.
     - Generate a personalized, dynamic "title" based specifically on what the user wants to discuss (e.g. "Instant Strategy Meeting with [Name]", "SEO & Ads Growth Consultation", "Custom Web App Discussion", "Careers & Interview Call").
     - If the user says "instant", "now", or "today", set dateStr to "${currentDateStr}" and timeStr to "${currentTimeStr}".
     - Just write a short warm confirmation sentence in your replyText (e.g., "I have scheduled your consultation right away. Here are your joining details:").
     - Set:
        "requestedAppointment": {
          "isBookingRequested": true,
          "customerName": "<extracted_name_or_from_history>",
          "customerEmail": "<extracted_email_or_from_history>",
          "dateStr": "<YYYY-MM-DD>",
          "timeStr": "<HH:MM AM/PM>",
          "title": "<Dynamic Subject/Title Based On User Topic>"
        }

### TRAINED COMPANY KNOWLEDGE BASE DATA:
${knowledgeContextText}

### RECENT CHAT HISTORY (Last 15 Messages):
${recentMessages.map(m => {
  let cleanContent = m.content || "";
  if (cleanContent.includes("📋 [Template:")) {
    cleanContent = cleanContent.replace(/📋\s*\[Template:[^\]]+\]\s*/g, "");
  }
  if (cleanContent.startsWith("[Reply to: ")) {
    const closeBracketIndex = cleanContent.indexOf("] ");
    if (closeBracketIndex !== -1) {
      const quotePart = cleanContent.substring(11, closeBracketIndex);
      const bodyPart = cleanContent.substring(closeBracketIndex + 2);
      cleanContent = `(Quoted "${quotePart.replace(/📋\s*\[Template:[^\]]+\]\s*/g, "").slice(0, 60)}...") ${bodyPart}`;
    }
  }
  cleanContent = cleanContent.replace(/_Powered by [^_]+_/g, "").trim();
  return `${m.direction === 'inbound' ? 'Customer' : 'Agent (' + agentName + ')'}: ${cleanContent}`;
}).join("\n")}

### REQUIRED JSON OUTPUT FORMAT:
Return ONLY valid JSON. replyText must be 1-3 plain sentences — no bullets, no markdown, no long paragraphs:
{
  "replyText": "Your short, natural WhatsApp reply here — plain text, 1-3 sentences only. NEVER write links here.",
  "attachKnowledgeIds": ["only_when_customer_explicitly_asks_for_media"],
  "requestedAppointment": {
    "isBookingRequested": true_or_false,
    "customerName": "extracted_name_or_null",
    "customerEmail": "extracted_email_or_null",
    "dateStr": "YYYY-MM-DD_or_null",
    "timeStr": "HH:MM AM/PM_or_null",
    "title": "Dynamic specific subject based on user discussion"
  },
  "capturedLead": {
    "name": "extracted_name_or_null",
    "email": "extracted_email_or_null",
    "phone": "extracted_phone_or_null",
    "topic": "topic_discussed_or_null",
    "notes": "additional_notes_or_null"
  }
}`;

    // 5. Call Groq REST API using GPT model
    let response: any;
    const primaryModel = "openai/gpt-oss-120b";
    const fallbackModel = "openai/gpt-oss-120b";

    try {
      response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: primaryModel,
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
    } catch (primaryErr: any) {
      if (primaryErr?.response?.data?.error?.code === "rate_limit_exceeded" || primaryErr?.response?.status === 429) {
        console.warn(`[AI AGENT ENGINE] Primary model ${primaryModel} rate limited. Retrying with fallback model ${fallbackModel}...`);
        response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: fallbackModel,
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
      } else {
        throw primaryErr;
      }
    }

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

    let replyText = parsedResult.replyText || "Thank you for reaching out! Let me connect you with our team specialist for full details.";
    
    // Strip any hallucinated/fake meet.google.com links the LLM might have written
    replyText = replyText.replace(/https?:\/\/meet\.google\.com\/[a-zA-Z0-9_-]+/gi, "").trim();

    const customerPhone = conversation.customerPhone;

    // Scan full chat history & current message for email address
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const combinedChatText = `${recentMessages.map(m => m.content).join(" ")} ${customerQuery} ${replyText}`;
    const matchedEmails = combinedChatText.match(emailRegex);
    const extractedEmail = parsedResult.requestedAppointment?.customerEmail || (matchedEmails ? matchedEmails[0] : null);

    // 5.5 Automatic Google Calendar & Google Meet Appointment Scheduling
    // CRITICAL: ONLY trigger when customer EXPLICITLY requests a meeting/call in their current message OR the LLM marked isBookingRequested = true
    const explicitBookingRegex = /\b(schedule|book|appointment|calendar|google\s+meet|zoom|consultation|joining\s+link|meet\s+link|call\s+me|set\s+up\s+a\s+meeting|demo\s+call|arrange\s+a\s+meet)\b/i;
    const isExplicitlyRequestedByCustomer = explicitBookingRegex.test(customerQuery);
    const isBookingRequested = Boolean(
      (parsedResult.requestedAppointment?.isBookingRequested === true && isExplicitlyRequestedByCustomer) ||
      (isExplicitlyRequestedByCustomer && !/^(hi|hii|hiii|hello|hey|good\s+morning|good\s+evening|namaste)$/i.test(customerQuery.trim()))
    );

    if (isBookingRequested) {
      try {
        const reqAppt = parsedResult.requestedAppointment || {};
        const isInstant = /instant|now|right now|immediately|today/i.test(customerQuery);
        
        let startTime: Date;
        if (isInstant || !reqAppt.dateStr) {
          // Instant meeting starts now (or within 2 minutes)
          startTime = new Date();
        } else {
          const apptDate = reqAppt.dateStr;
          const apptTime = reqAppt.timeStr || "11:00 AM";
          const startTimeStr = `${apptDate} ${apptTime}`;
          startTime = isNaN(new Date(startTimeStr).getTime()) ? new Date() : new Date(startTimeStr);
        }
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        const customerName = reqAppt.customerName || conversation.customerName || customerPhone;

        // Dynamic Title Generation matching user context
        let dynamicTitle = reqAppt.title;
        if (!dynamicTitle || dynamicTitle === "AI Consultation / Demo / Service Meeting" || dynamicTitle === "AI Strategy & Consultation Meeting") {
          if (/seo|ranking|google search/i.test(customerQuery)) {
            dynamicTitle = `SEO & Search Growth Consultation with ${customerName}`;
          } else if (/web|website|portal|app|development|software/i.test(customerQuery)) {
            dynamicTitle = `Web & App Development Strategy Session with ${customerName}`;
          } else if (/ad|meta|facebook|instagram|ppc/i.test(customerQuery)) {
            dynamicTitle = `Performance Ads & ROI Consultation with ${customerName}`;
          } else if (/job|career|interview|resume|hiring/i.test(customerQuery)) {
            dynamicTitle = `Careers & Candidate Interview Call with ${customerName}`;
          } else if (isInstant) {
            dynamicTitle = `Instant Strategy Call with ${customerName}`;
          } else {
            dynamicTitle = `Strategy & Growth Consultation with ${customerName}`;
          }
        }

        const { AppointmentService } = require("./appointmentService");
        const apptResult = await AppointmentService.createAppointment({
          organizationId: orgId,
          conversationId: conversation.id,
          customerPhone,
          customerName,
          customerEmail: extractedEmail || null,
          title: dynamicTitle,
          description: `Booked via WhatsApp AI Agent. Topic: ${customerQuery}`,
          startTime,
          endTime,
          timezone: "Asia/Kolkata",
          skipWhatsAppNotification: true // AI agent sends the single combined natural reply below
        });

        const formattedDate = new Date(startTime).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        });
        const formattedTime = `${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        // Clean out any broken LLM text remnants like "here's a link:" before appending real link
        replyText = replyText
          .replace(/here['’]?s\s+(a\s+)?(fresh\s+)?(google\s+meet\s+)?link:?/gi, "")
          .replace(/sure,?\s*:?/gi, "")
          .replace(/let me know if you need anything else\.?/gi, "")
          .trim();

        const prefix = replyText ? `${replyText}\n\n` : "I have scheduled your consultation right away!\n\n";

        // Attach verified, genuine Google Meet link to the WhatsApp message
        if (apptResult.meetUrl) {
          replyText = `${prefix}🎥 *Join Google Meet:* ${apptResult.meetUrl}\n📅 *Time:* ${formattedDate} at ${formattedTime}\n\nLooking forward to speaking with you!`;
        }

        console.log(`[AI AGENT ENGINE] 🚀 Authentic Google Meet link generated & saved to Appointments for ${customerName} (${customerPhone}): ${apptResult.meetUrl}`);
      } catch (apptErr: any) {
        console.error("[AI AGENT ENGINE] Appointment scheduling error:", apptErr.message);
      }
    }
    
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

    const conversationPhoneId = (conversation as any).phoneNumberId;
    const waConfig = (conversationPhoneId 
      ? conversation.organization.waConfigs?.find((c: any) => c.phoneNumberId === conversationPhoneId)
      : null) || conversation.organization.waConfigs?.find((c: any) => c.isDefault) || conversation.organization.waConfigs?.[0];
    const igConfig = conversation.organization.igConfigs?.find((c: any) => c.isDefault) || conversation.organization.igConfigs?.[0];
    const ytConfig = (conversation.organization as any).ytConfigs?.find((a: any) => a.isDefault) || (conversation.organization as any).ytConfigs?.[0];
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
