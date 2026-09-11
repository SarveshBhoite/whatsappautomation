import { Router, Request, Response } from "express";
import { MetaAIConversationService } from "../../services/meta-ads/metaAIConversationService";
import { MetaCampaignExecutionService } from "../../services/meta-ads/metaCampaignExecutionService";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `meta_ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * POST /api/meta-ads/ai/conversation/upload-media
 * Upload custom user graphics or videos for Meta Ad Creative
 */
router.post("/ai/conversation/upload-media", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file provided" });
    }

    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol || "http";
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGE";

    res.json({
      success: true,
      media: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        mediaType,
      },
    });
  } catch (error: any) {
    console.error("[AIRoutes] Error uploading media file:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/ai/conversation/init
 * Initialize a dynamic campaign strategy session with real authenticated Meta context
 */
router.get("/ai/conversation/init", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const session = await MetaAIConversationService.getInitialSession(orgId);
    res.json({ success: true, session });
  } catch (error: any) {
    console.error("[AIRoutes] Error initializing conversation session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/ai/conversation/message
 * Process natural language user message, extract facts, update draft, and validate
 */
router.post("/ai/conversation/message", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { currentState, message } = req.body;
    const selectedOption = req.body.selectedOption || req.body.selectedOptionValue;

    if (!currentState) {
      return res.status(400).json({ success: false, error: "currentState is required." });
    }

    const updatedState = await MetaAIConversationService.processMessage(
      orgId,
      currentState,
      message || selectedOption || "",
      selectedOption
    );

    res.json({ success: true, state: updatedState });
  } catch (error: any) {
    console.error("[AIRoutes] Error processing conversation message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/ai/conversation/confirm-publish
 * Explicit user confirmation trigger to execute campaign on Meta Graph API
 */
router.post("/ai/conversation/confirm-publish", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { draft, executionId } = req.body;

    if (!draft) {
      return res.status(400).json({ success: false, error: "draft is required for publishing." });
    }

    const execId = executionId || `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = await MetaCampaignExecutionService.publishCampaign(orgId, draft, execId);

    res.json({ success: result.deploymentStatus === "FULL_SUCCESS", result });
  } catch (error: any) {
    console.error("[AIRoutes] Error confirming campaign publication:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const voiceUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * POST /api/meta-ads/ai/conversation/voice
 * Receives an audio voice note from the browser, transcribes it dynamically using Groq Whisper,
 * automatically detects any spoken language (Marathi, Hindi, English, etc.),
 * and returns the transcribed text.
 */
router.post("/ai/conversation/voice", voiceUpload.single("audio"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ success: false, error: "No audio file provided." });
    }

    const groqApiKey = process.env.GROQ_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ success: false, error: "GROQ_KEY is missing from environment." });
    }

    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "voice_input.webm");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("prompt", "Meta ad campaign voice instructions in Marathi, Hindi, or English");

    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: formData,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      console.error("[AIRoutes] Whisper transcription error:", errText);
      return res.status(500).json({ success: false, error: "Failed to transcribe audio voice note." });
    }

    const whisperData: any = await whisperRes.json();
    const transcribedText = whisperData?.text?.trim() || "";
    console.log(`[AIRoutes] 🎙️ Auto-detected and transcribed voice note: "${transcribedText}"`);

    res.json({ success: true, text: transcribedText });
  } catch (error: any) {
    console.error("[AIRoutes] Error processing voice note:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
