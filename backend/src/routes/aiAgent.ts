import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import axios from "axios";
import multer from "multer";
import path from "path";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Helper to resolve org ID from request headers
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || DEFAULT_ORG_ID;
};

// Memory storage for ImageKit direct cloud upload
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// POST /api/ai-agent/upload-media - Upload PDF/Image/Video for AI Knowledge Item
router.post(
  "/upload-media",
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        console.error("[AI AGENT UPLOAD MULTER ERROR]:", err.message || err);
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No media file provided." });
      }

      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
      const mime = file.mimetype.toLowerCase();

      let mediaType: "image" | "document" | "video" = "image";
      if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
        mediaType = "image";
      } else if (mime.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext)) {
        mediaType = "video";
      } else {
        mediaType = "document";
      }

      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
      const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

      if (!privateKey || !urlEndpoint) {
        return res.status(500).json({
          error: "Cloud Storage Configuration Error",
          message: "ImageKit credentials are not configured on server."
        });
      }

      const fileBase64 = file.buffer.toString("base64");
      const cleanFilename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const formData = new FormData();
      formData.append("file", fileBase64);
      formData.append("fileName", cleanFilename);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/ai-agent-knowledge");

      const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
      const ikResponse = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
        headers: { Authorization: authHeader }
      });

      const publicUrl = ikResponse.data?.url;
      if (!publicUrl) {
        return res.status(500).json({ error: "ImageKit Upload Failed", message: "No CDN URL returned." });
      }

      return res.status(200).json({
        success: true,
        mediaUrl: publicUrl,
        mediaType,
        filename: cleanFilename,
        size: file.size
      });
    } catch (uploadErr: any) {
      console.error("[AI AGENT UPLOAD ERROR]:", uploadErr?.response?.data || uploadErr.message);
      return res.status(500).json({ error: "Failed to upload media file", details: uploadErr.message });
    }
  }
);

// ─── 1. CONFIGURATION & MODE TOGGLE ─────────────────────────────────────────

// GET: Fetch AI Agent configuration for Organization
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.aiAgentConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      config = await prisma.aiAgentConfig.create({
        data: {
          organizationId,
          agentName: "AI Sales Specialist",
          personalityPrompt: "You are a warm, highly knowledgeable human sales & customer representative. Chat naturally in a friendly, conversational tone. Answer questions based strictly on trained company data, attach relevant portfolio screenshots or PDFs when requested, and collect contact details if they ask to be called back.",
          greetingMessage: "Hello! How can I help you with our services today?",
          activeMode: "AI_AGENT",
          isActive: true,
          autoSendMedia: true,
        },
      });
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching AI Agent config:", error);
    return res.status(500).json({ error: "Failed to fetch AI Agent config", details: error.message });
  }
});

// POST: Update AI Agent configuration & Platform Checklist
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { 
      agentName, 
      personalityPrompt, 
      greetingMessage, 
      activeMode, 
      isActive, 
      groqApiKey,
      whatsappAiEnabled,
      instagramAiEnabled,
      youtubeAiEnabled,
      linkedinAiEnabled,
      autoSendMedia, 
      fallbackAction 
    } = req.body;

    const updated = await (prisma.aiAgentConfig as any).upsert({
      where: { organizationId },
      update: {
        agentName: agentName !== undefined ? agentName : undefined,
        personalityPrompt: personalityPrompt !== undefined ? personalityPrompt : undefined,
        greetingMessage: greetingMessage !== undefined ? greetingMessage : undefined,
        activeMode: activeMode !== undefined ? activeMode : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        groqApiKey: groqApiKey !== undefined ? (groqApiKey ? String(groqApiKey).trim() : null) : undefined,
        whatsappAiEnabled: whatsappAiEnabled !== undefined ? Boolean(whatsappAiEnabled) : undefined,
        instagramAiEnabled: instagramAiEnabled !== undefined ? Boolean(instagramAiEnabled) : undefined,
        youtubeAiEnabled: youtubeAiEnabled !== undefined ? Boolean(youtubeAiEnabled) : undefined,
        linkedinAiEnabled: linkedinAiEnabled !== undefined ? Boolean(linkedinAiEnabled) : undefined,
        autoSendMedia: autoSendMedia !== undefined ? Boolean(autoSendMedia) : undefined,
        fallbackAction: fallbackAction !== undefined ? fallbackAction : undefined,
      },
      create: {
        organizationId,
        agentName: agentName || "AI Sales Specialist",
        personalityPrompt: personalityPrompt || "You are a warm, highly knowledgeable human sales & customer representative.",
        greetingMessage: greetingMessage || "Hello! How can I help you today?",
        activeMode: activeMode || "AI_AGENT",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        groqApiKey: groqApiKey ? String(groqApiKey).trim() : null,
        whatsappAiEnabled: whatsappAiEnabled !== undefined ? Boolean(whatsappAiEnabled) : true,
        instagramAiEnabled: instagramAiEnabled !== undefined ? Boolean(instagramAiEnabled) : false,
        youtubeAiEnabled: youtubeAiEnabled !== undefined ? Boolean(youtubeAiEnabled) : false,
        linkedinAiEnabled: linkedinAiEnabled !== undefined ? Boolean(linkedinAiEnabled) : false,
        autoSendMedia: autoSendMedia !== undefined ? Boolean(autoSendMedia) : true,
        fallbackAction: fallbackAction || "human_callback",
      },
    });

    return res.status(200).json({ success: true, config: updated });
  } catch (error: any) {
    console.error("Error updating AI Agent config:", error);
    return res.status(500).json({ error: "Failed to update AI Agent config", details: error.message });
  }
});

// ─── 2. KNOWLEDGE BASE TRAINING DATA ─────────────────────────────────────────

// GET: List all Knowledge Base Items for Organization
router.get("/knowledge", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    const items = await prisma.aiKnowledgeItem.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(items);
  } catch (error: any) {
    console.error("Error fetching knowledge items:", error);
    return res.status(500).json({ error: "Failed to fetch knowledge items", details: error.message });
  }
});

// POST: Add or Update Knowledge Item with Media Attachment (PDF/Image)
router.post("/knowledge", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, category, topic, keywords, content, mediaUrl, mediaType, mediaTitle, isActive, isExactMatch, matchType, triggerPhrases } = req.body;

    if (!topic || !content) {
      return res.status(400).json({ error: "Topic and Content details are required for training." });
    }

    let savedItem;
    if (id) {
      savedItem = await prisma.aiKnowledgeItem.update({
        where: { id },
        data: {
          category: category || "SERVICES",
          topic,
          keywords: keywords || "",
          content,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
          mediaTitle: mediaTitle || null,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          isExactMatch: isExactMatch !== undefined ? Boolean(isExactMatch) : false,
          matchType: matchType || (isExactMatch ? "EXACT_TRIGGER" : "AI_SEMANTIC"),
          triggerPhrases: triggerPhrases !== undefined ? triggerPhrases : null,
        },
      });
    } else {
      savedItem = await prisma.aiKnowledgeItem.create({
        data: {
          organizationId,
          category: category || "SERVICES",
          topic,
          keywords: keywords || "",
          content,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
          mediaTitle: mediaTitle || null,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          isExactMatch: isExactMatch !== undefined ? Boolean(isExactMatch) : false,
          matchType: matchType || (isExactMatch ? "EXACT_TRIGGER" : "AI_SEMANTIC"),
          triggerPhrases: triggerPhrases !== undefined ? triggerPhrases : null,
        },
      });
    }

    return res.status(200).json({ success: true, item: savedItem });
  } catch (error: any) {
    console.error("Error saving knowledge item:", error);
    return res.status(500).json({ error: "Failed to save knowledge item", details: error.message });
  }
});

// DELETE: Remove Knowledge Item
router.delete("/knowledge/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const organizationId = getOrgId(req);

    // Enforce that the item belongs to this organization
    const item = await prisma.aiKnowledgeItem.findFirst({
      where: { id, organizationId }
    });

    if (!item) {
      return res.status(404).json({ error: "Knowledge item not found in this organization" });
    }

    await prisma.aiKnowledgeItem.delete({
      where: { id },
    });

    return res.status(200).json({ success: true, message: "Knowledge item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting knowledge item:", error);
    return res.status(500).json({ error: "Failed to delete knowledge item", details: error.message });
  }
});

// ─── 3. LIVE AGENT PLAYGROUND / SANDBOX ──────────────────────────────────────

// Helper to normalize text for exact phrase matching
function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// POST: Interactive AI Agent Simulator Endpoint
router.post("/test-sandbox", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { userMessage, history } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "User message is required for testing." });
    }

    // Fetch Config & Knowledge
    const config = await prisma.aiAgentConfig.findUnique({
      where: { organizationId },
    });

    const items = await prisma.aiKnowledgeItem.findMany({
      where: { organizationId, isActive: true },
    });

    // 1. CHECK FOR EXACT TRIGGER MATCH FIRST (Meta Ads / Fixed Button Clicks)
    const normalizedUserMsg = normalizeText(userMessage);
    const matchedExactItem = items.find(item => {
      if (!item.isExactMatch && item.matchType !== "EXACT_TRIGGER") return false;
      const phrasesStr = item.triggerPhrases || item.topic || "";
      const phrases = phrasesStr
        .split(/[\n,]+/)
        .map(p => normalizeText(p))
        .filter(Boolean);
      
      // Also check against normalized topic
      const normalizedTopic = normalizeText(item.topic);
      if (normalizedTopic && normalizedTopic === normalizedUserMsg) return true;

      return phrases.some(p => p === normalizedUserMsg || normalizedUserMsg.includes(p));
    });

    if (matchedExactItem) {
      console.log(`[SANDBOX] 🎯 Exact trigger matched knowledge item: "${matchedExactItem.topic}"`);
      let attachment = null;
      if (matchedExactItem.mediaUrl) {
        attachment = {
          url: matchedExactItem.mediaUrl,
          type: matchedExactItem.mediaType || "image",
          title: matchedExactItem.mediaTitle || matchedExactItem.topic,
        };
      }
      return res.status(200).json({
        success: true,
        replyText: matchedExactItem.content,
        attachment,
        isExactTrigger: true,
        matchedTopic: matchedExactItem.topic,
        capturedLead: matchedExactItem.category === "JOBS" ? { topic: "Job Application (Trigger Match)" } : null,
      });
    }

    const agentName = config?.agentName || "AI Sales Representative";
    const personalityPrompt = config?.personalityPrompt || "You are a warm human sales consultant.";

    let knowledgeContextText = items.map(k => `
[TOPIC: ${k.topic}] (Category: ${k.category})
Keywords: ${k.keywords}
Content: ${k.content}
${k.mediaUrl ? `Attached Media ID: "${k.id}" (Type: ${k.mediaType}, Title: "${k.mediaTitle || 'Attachment'}", URL: ${k.mediaUrl})` : 'No attached media'}
---`).join("\n");

    if (items.length === 0) {
      knowledgeContextText = "No company knowledge trained yet. Answer politely and offer to take contact details.";
    }

    const groqApiKey = process.env.GROQ_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: "GROQ_KEY is missing from server env." });
    }

    const systemPrompt = `You are "${agentName}", a warm, highly intelligent, and human-like sales and growth consultant for our company.

### YOUR PERSONALITY & DIALOGUE GOALS:
${personalityPrompt}

### STRICT HUMAN CONVERSATIONAL RULES:
1. **Be Warm, Natural & Conversational**: Speak like a real senior sales executive chatting on WhatsApp. Keep messages clear, polite, and engaging. Never sound like a robotic form or list of options.
2. **Handle Greetings & Freeform Questions Intelligently**:
   - If the customer says "Hi", "Hello", "Good morning", or asks general questions without specific keywords, greet them warmly, ask about their business goals, and offer assistance.
3. **Use Trained Data**: Answer questions based on the trained company data provided below.
4. **Contextual Media & Screenshot Sending**:
   - If the customer asks to see sample work, portfolio, screenshots, rate cards, brochures, or case studies, look at the Media Asset IDs in the Knowledge Base.
   - If a relevant media asset exists, set "attachKnowledgeId": "<THE_MEDIA_KNOWLEDGE_ITEM_ID>" in your JSON response.
5. **Proactive Contact & Lead Capture**:
   - If the customer asks about custom pricing, expresses interest in starting a project, asks to speak to management, or needs a callback, politely ask for their **Name and Phone Number** so a specialist can call them.
   - If the customer provides their name, phone number, email, or requirement details, extract them in the "capturedLead" object.

### TRAINED COMPANY KNOWLEDGE BASE:
${knowledgeContextText}

### TEST CHAT HISTORY:
${(history || []).map((h: any) => `${h.role === 'user' ? 'Customer' : 'Agent (' + agentName + ')'}: ${h.content}`).join("\n")}

### REQUIRED JSON OUTPUT FORMAT:
{
  "replyText": "Your natural human chat response text here",
  "attachKnowledgeId": "optional_knowledge_item_id_or_null",
  "capturedLead": {
    "name": "extracted_name_or_null",
    "email": "extracted_email_or_null",
    "phone": "extracted_phone_or_null",
    "topic": "topic_discussed_or_null",
    "notes": "notes_or_null"
  }
}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Customer Message: "${userMessage}"` }
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

    const rawChoice = response.data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(rawChoice || "{}");

    // Resolve attached media if present
    let attachment = null;
    if (parsed.attachKnowledgeId) {
      const match = items.find(k => k.id === parsed.attachKnowledgeId);
      if (match && match.mediaUrl) {
        attachment = {
          url: match.mediaUrl,
          type: match.mediaType || "image",
          title: match.mediaTitle || match.topic,
        };
      }
    }

    return res.status(200).json({
      success: true,
      replyText: parsed.replyText || rawChoice,
      attachment,
      capturedLead: parsed.capturedLead || null,
    });
  } catch (error: any) {
    console.error("Error in AI sandbox:", error);
    return res.status(500).json({ error: "Failed to simulate AI Agent chat", details: error.message });
  }
});

// ─── 4. AI CAPTURED LEADS DESK ───────────────────────────────────────────────

// GET: List all AI Captured Leads
router.get("/leads", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    const leads = await prisma.aiCapturedLead.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(leads);
  } catch (error: any) {
    console.error("Error fetching captured leads:", error);
    return res.status(500).json({ error: "Failed to fetch captured leads", details: error.message });
  }
});

// PATCH: Update lead status ("NEW" | "CONTACTED" | "CLOSED"), notes, and remarks
router.patch("/leads/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const organizationId = getOrgId(req);
    const { status, notes, remark } = req.body;

    const existingLead = await prisma.aiCapturedLead.findFirst({
      where: { id, organizationId }
    });

    if (!existingLead) {
      return res.status(404).json({ error: "Lead not found in this organization" });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (remark !== undefined) updateData.remark = remark;

    const lead = await (prisma.aiCapturedLead as any).update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, lead });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return res.status(500).json({ error: "Failed to update lead", details: error.message });
  }
});

export default router;
