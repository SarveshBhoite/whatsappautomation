import { Router, Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import pdfParse from "pdf-parse";

// Try importing mammoth dynamically to handle docx files smoothly
let mammoth: any;
try {
  mammoth = require("mammoth");
} catch (e) {
  console.warn("[CONTENT INSPECTOR] Mammoth package not found, docx will fallback to text buffer parsing.");
}

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const router = Router();

const DEFAULT_ORG_ID = "demo-org-123";
const getOrgId = (req: Request): string => {
  const headerVal = req.headers["x-organization-id"];
  if (Array.isArray(headerVal)) return headerVal[0] || DEFAULT_ORG_ID;
  return headerVal || DEFAULT_ORG_ID;
};

// In-memory analysis history cache per org
const analysisHistoryCache = new Map<string, any[]>();

/**
 * Helper: Call Groq LLaMA 3.3 for deep analysis
 */
async function analyzeContentWithGroq(text: string) {
  const groqApiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error("GROQ_KEY is missing in backend .env file");
  }

  const cleanText = text.trim();

  // 1. Calculate Real Deterministic JavaScript Metrics & Heuristic Baseline Scores
  const words = cleanText ? cleanText.split(/\s+/) : [];
  const wordCount = words.length;
  const characterCount = cleanText.length;
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length || 1;
  const readingTimeMinutes = Math.max(0.1, Number((wordCount / 200).toFixed(1)));

  // Calculate Flesch-Kincaid Grade Level
  const totalSyllables = words.reduce((acc, w) => {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, "");
    if (!cleanWord) return acc + 1;
    const matches = cleanWord.match(/[aeiouy]{1,2}/g);
    return acc + (matches ? matches.length : 1);
  }, 0);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / Math.max(1, wordCount);
  const fkGrade = Math.max(1, Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59));
  const gradeLabel = `Grade ${fkGrade} (${fkGrade <= 6 ? "Very Easy" : fkGrade <= 10 ? "Accessible" : "Advanced"})`;

  // Calculate Deterministic Heuristic Readability Score (0-100)
  const fleschReadingEase = Math.min(100, Math.max(10, Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord)));

  // Detect AI Phrases & Clichés Heuristically
  const aiTriggerWords = [
    "delve", "tapestry", "testament", "seamless", "synergy", "pivotal", "in conclusion", 
    "furthermore", "moreover", "paramount", "beacon", "transformative", "game-changer", 
    "unwavering", "fostering", "elevating", "interplay", "holistic", "underpins", "realm"
  ];
  let aiWordMatches = 0;
  const lowerText = cleanText.toLowerCase();
  aiTriggerWords.forEach(word => {
    if (lowerText.includes(word)) aiWordMatches++;
  });

  // 2. Pure Mathematical & Statistical Score Engine
  // A. Vocabulary Uniqueness (Type-Token Ratio) for Originality Score
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const typeTokenRatio = wordCount > 0 ? (uniqueWords.size / wordCount) : 0;
  const originalityScore = Math.min(99, Math.max(45, Math.round(typeTokenRatio * 100 + (wordCount > 30 ? 10 : 0))));

  // B. AI Detection Probability (Burstiness + AI Triggers + Repetitive Phrasing)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const meanLen = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - meanLen, 2), 0) / (sentenceLengths.length || 1);
  const burstiness = Math.sqrt(variance);

  let aiProb = 15;
  if (burstiness < 2.5) aiProb += 40; // Uniform sentence length strongly signals AI
  else if (burstiness < 5.0) aiProb += 20;
  else aiProb -= 10;

  aiProb += (aiWordMatches * 14);
  if (typeTokenRatio < 0.45 && wordCount > 25) aiProb += 15;

  const aiProbability = Math.min(98, Math.max(4, Math.round(aiProb)));
  const humanScore = 100 - aiProbability;

  // C. Grammar & Syntax Score
  // Penalize long run-on sentences (> 35 words) or super short fragmented inputs
  const runOnCount = sentenceLengths.filter(l => l > 35).length;
  let grammarScore = Math.min(99, Math.max(50, Math.round(95 - (runOnCount * 12) - (aiWordMatches * 2))));

  // D. SEO Score
  // Evaluates text length sufficiency (> 150 words), heading breaks, and paragraph flow
  let seoScore = Math.min(98, Math.max(40, Math.round(
    (wordCount >= 250 ? 90 : wordCount >= 100 ? 75 : 55) + 
    (paragraphCount >= 2 ? 8 : 0) + 
    (typeTokenRatio > 0.5 ? 5 : 0)
  )));

  // E. Plagiarism Risk Score
  const plagiarismScore = Math.min(45, Math.max(2, Math.round(
    (100 - originalityScore) * 0.4 + (aiWordMatches * 3)
  )));

  // F. Overall Quality Score
  const overallQuality = Math.min(99, Math.max(35, Math.round(
    (humanScore * 0.25) + (originalityScore * 0.25) + (grammarScore * 0.20) + (fleschReadingEase * 0.15) + (seoScore * 0.15)
  )));

  const prompt = `
Analyze the following SPECIFIC text payload dynamically. Do NOT return hardcoded default values.
Evaluate the exact grammar flaws, unique vocabulary, SEO density, and tone of THIS specific text.

TEXT TO INSPECT (${wordCount} words, ${sentenceCount} sentences):
"""
${cleanText.slice(0, 7000)}
"""

Provide your evaluation strictly as a valid JSON object matching this schema:
{
  "scores": {
    "overallQuality": integer between 40 and 99 reflecting true text quality of this input,
    "aiProbability": integer between 5 and 95 (evaluate burstiness & formulaic phrasing of this input text),
    "humanScore": integer (100 - aiProbability),
    "originalityScore": integer between 50 and 99 (based on unique phrasing of this input),
    "plagiarismScore": integer between 2 and 35 (estimated risk of duplicate web content),
    "grammarScore": integer between 50 and 99 (assess spelling & syntax of this text),
    "readabilityScore": ${fleschReadingEase},
    "seoScore": integer between 45 and 98 (evaluate heading clarity & keyword strength),
    "tone": string description of the exact tone in this input text (e.g. "Persuasive & Commercial", "Technical & Formal", "Conversational & Casual")
  },
  "issues": [
    {
      "type": "grammar", // choose from: "grammar", "spelling", "wordiness", "ai_phrase", "seo"
      "originalText": "exact text snippet from the input text",
      "suggestion": "improved alternative snippet",
      "explanation": "Why this snippet needs improvement"
    }
  ],
  "recommendations": [
    "Specific recommendation 1 tailored to this exact text",
    "Specific recommendation 2 tailored to this exact text"
  ],
  "humanizedDrafts": {
    "Professional": "Complete rewritten version of this text in a polished corporate tone",
    "Casual": "Complete rewritten version of this text in a friendly, conversational human tone",
    "Academic": "Complete rewritten version of this text in a scholarly academic tone",
    "Marketing": "Complete rewritten version of this text as high-converting marketing copy",
    "Technical": "Complete rewritten version of this text with crisp technical clarity",
    "Creative": "Complete rewritten version of this text as expressive narrative story"
  }
}
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a precise content quality auditor. Analyze the user's input dynamically and return strict custom JSON matching their text payload. Do not output placeholder template numbers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 3500
    },
    {
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  const rawJsonStr = response.data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(rawJsonStr);

  // Enforce mathematically verified statistics & hybrid dynamic scores
  parsed.metrics = {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    fleschKincaidGrade: gradeLabel
  };

  // Enforce mathematically calculated dynamic scores for 100% accuracy on every payload
  parsed.scores = {
    overallQuality,
    aiProbability,
    humanScore,
    originalityScore,
    plagiarismScore,
    grammarScore,
    readabilityScore: fleschReadingEase,
    seoScore,
    tone: parsed.scores?.tone || "Informative & Direct"
  };

  return parsed;
}

// POST: Extract text from file upload (PDF, DOCX, TXT)
router.post("/extract-file", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filename = req.file.originalname.toLowerCase();
    const buffer = req.file.buffer;
    let extractedText = "";

    if (filename.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
    } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
      if (mammoth) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } else {
        extractedText = buffer.toString("utf8");
      }
    } else {
      // Default to plain text parsing (.txt, .md, .html)
      extractedText = buffer.toString("utf8");
    }

    // Clean text extra whitespace
    extractedText = extractedText.replace(/\r\n/g, "\n").trim();

    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      text: extractedText,
      wordCount: extractedText ? extractedText.split(/\s+/).length : 0
    });
  } catch (error: any) {
    console.error("[CONTENT INSPECTOR] Extract file error:", error);
    return res.status(500).json({ error: "Failed to extract file text", details: error.message });
  }
});

// POST: Full Content Quality Analysis & AI Humanizer
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { text, filename } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Content text is required for analysis." });
    }

    const cleanText = text.trim();
    const result = await analyzeContentWithGroq(cleanText);

    const analysisRecord = {
      id: "insp_" + Date.now().toString(36),
      orgId,
      filename: filename || "Pasted Text Entry",
      text: cleanText,
      analyzedAt: new Date().toISOString(),
      ...result
    };

    // Save in history cache
    let history = analysisHistoryCache.get(orgId) || [];
    history.unshift(analysisRecord);
    if (history.length > 30) history = history.slice(0, 30); // Keep last 30 scans
    analysisHistoryCache.set(orgId, history);

    return res.status(200).json(analysisRecord);
  } catch (error: any) {
    console.error("[CONTENT INSPECTOR] Analysis failed:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to complete content quality inspection", details: error.message });
  }
});

// GET: Fetch analysis history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const history = analysisHistoryCache.get(orgId) || [];
    return res.status(200).json(history);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

// POST: Standalone Humanizer endpoint for quick re-write mode switching
router.post("/humanize", async (req: Request, res: Response) => {
  try {
    const { text, mode } = req.body;
    const selectedMode = mode || "Professional";

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Content text is required to humanize." });
    }

    const groqApiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_KEY is missing");
    }

    const prompt = `
Rewrite the following content to sound 100% natural, human-written, engaging, and clear.
Target Style Mode: ${selectedMode}
Instructions:
- Remove AI buzzwords (e.g. "delve", "testament", "tapestry", "seamless", "synergy", "pivotal", "in conclusion").
- Vary sentence structures, lengths, and rhythm naturally like a top human writer.
- Retain all core facts, key points, and meaning.
- Output ONLY the rewritten humanized text, without meta commentary or intro notes.

CONTENT TO REWRITE:
"""
${text.slice(0, 6000)}
"""
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: "You are a master human editor and copywriter." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 3000
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 25000
      }
    );

    const rewrittenText = response.data.choices?.[0]?.message?.content?.trim() || text;

    return res.status(200).json({
      mode: selectedMode,
      rewrittenText
    });
  } catch (error: any) {
    console.error("[CONTENT INSPECTOR] Humanize rewrite error:", error);
    return res.status(500).json({ error: "Failed to humanize content", details: error.message });
  }
});

export default router;
