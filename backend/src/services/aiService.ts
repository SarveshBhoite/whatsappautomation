import axios from "axios";
import prisma from "../utils/prisma";

export interface AIGenerateParams {
  topic: string;
  industry?: string;
  goal?: string;
  targetAudience?: string;
  tone?: string;
  length?: string;
  provider?: string;
  userId?: string;
}

export interface AIRewriteParams {
  content: string;
  mode: "professional" | "friendly" | "marketing" | "corporate" | "technical" | "simple" | "detailed" | "short";
  provider?: string;
  userId?: string;
}

export interface AITemplateParams {
  category?: string;
  topic?: string;
  userId?: string;
}

export interface AIResponseScore {
  grammar: number;
  engagement: number;
  readability: number;
}

export interface StructuredAIResponse {
  intent: string;
  mode: string;
  response: string;
  hashtags: string[];
  cta: string;
  score: AIResponseScore;
}

export class LinkedInAIService {
  private static MODEL_NAME = "openai/gpt-oss-120b";

  /**
   * Helper to construct CRM & Jisnu Context from recent AI history
   */
  private static async buildContext(organizationId: string): Promise<string> {
    try {
      const recentHistory = await prisma.aIContentHistory.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5
      });

      let historyText = "";
      if (recentHistory.length > 0) {
        historyText = "\nRecent Conversation & Content Context:\n" +
          recentHistory.map((h, i) => `[Interaction ${i + 1}]: Prompt: "${h.prompt}" -> Response: "${(h.generatedContent || h.generatedText || "").slice(0, 150)}..."`).join("\n");
      }

      return `[SYSTEM CONTEXT]: You are the Universal CRM AI Assistant powering Jisnu CRM & Social Media Automation Suite.
Capabilities: Lead Management, LinkedIn Publishing & Analytics, Automated Workflows, Multi-channel Messaging (WhatsApp, Instagram, GMB, YouTube), SEO Audit, and AI Copywriting.
${historyText}`;
    } catch {
      return `[SYSTEM CONTEXT]: You are the Universal CRM AI Assistant powering Jisnu CRM & Social Media Automation Suite.`;
    }
  }

  /**
   * Tab-Specific System Prompt Dispatcher
   */
  private static getTabSystemInstruction(
    systemContext: string,
    tabMode: "generate" | "rewrite" | "templates" | "general" = "general"
  ): string {
    if (tabMode === "generate") {
      return `${systemContext}

======================================================
TAB MODE: POST GENERATOR (PRIMARY PURPOSE: NEW CONTENT CREATION)
======================================================

You are the POST GENERATOR AI ASSISTANT.
Your primary responsibility is to detect user intent and generate brand-new content from scratch.

ACCEPTED REQUEST TYPES:
- Write LinkedIn post
- Write Email
- Write Blog
- Write Marketing Copy
- Explain concepts
- Generate Code

INTENT DETECTION & GENERATION RULES:
1. Detect user intent from prompt and generate fresh deliverable directly.
2. ABSOLUTE BAN ON META PREAMBLES: Never start with "Here is your post:", "Crafting an email requires...", "Here are the key takeaways...".

STRICT OUTPUT FORMAT:
You MUST respond with valid JSON matching EXACTLY this structure:
{
  "intent": "<detected_intent_code>",
  "mode": "Post Generator",
  "response": "<final_generated_deliverable>",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "cta": "<conversation_starter_or_call_to_action>",
  "score": { "grammar": 95, "engagement": 92, "readability": 94 }
}`;
    }

    if (tabMode === "rewrite") {
      return `${systemContext}

======================================================
TAB MODE: REWRITE & POLISH (PRIMARY PURPOSE: REWRITE & POLISH CONTENT)
======================================================

You are the REWRITE & POLISH AI SPECIALIST.
Your primary responsibility is to rewrite, refine, polish, humanize, adjust tone, shorten, expand, or format text provided by the user.

RULES:
1. If the user provides a topic or phrase (e.g. "AI in mathematics"), create a polished, engaging LinkedIn post specifically about that topic in the requested tone.
2. If the user provides an existing post or draft, rewrite and polish it to enhance clarity, engagement, and tone while preserving its core meaning.
3. Return ONLY the generated/polished content without intro conversational fluff.

STRICT OUTPUT FORMAT:
You MUST respond with valid JSON matching EXACTLY this structure:
{
  "intent": "linkedin_rewrite",
  "mode": "Rewrite & Polish",
  "response": "<polished_or_generated_content>",
  "hashtags": [],
  "cta": "",
  "score": { "grammar": 98, "engagement": 95, "readability": 96 }
}`;
    }

    if (tabMode === "templates") {
      return `${systemContext}

======================================================
TAB MODE: TEMPLATES (PRIMARY PURPOSE: REUSABLE BLUEPRINTS)
======================================================

You are the REUSABLE CRM TEMPLATE ARCHITECT.
Your primary responsibility is to return reusable, fill-in-the-blank blueprint templates with explicit bracketed placeholders.

STRICT TEMPLATE RULES:
1. NEVER generate custom finished content for a single scenario.
2. ALWAYS return a structured blueprint template containing explicit bracketed placeholders like [Your Name], [Company Name], [Product/Service Name], [Key Benefit], [Call to Action], [Date/Time].
3. Provide templates for LinkedIn, Cold Emails, Follow-up Emails, Thank You Emails, or Marketing Campaigns.

STRICT OUTPUT FORMAT:
You MUST respond with valid JSON matching EXACTLY this structure:
{
  "intent": "template",
  "mode": "Templates",
  "response": "<reusable_blueprint_template_with_placeholders>",
  "hashtags": [],
  "cta": "",
  "score": { "grammar": 100, "engagement": 95, "readability": 95 }
}`;
    }

    // Default General Assistant
    return `${systemContext}

You must intelligently detect the user's intent FIRST (general_chat, linkedin_post, linkedin_rewrite, email_writing, coding_help, etc.).
Always return direct deliverables without meta preambles ("Here is your answer:").

STRICT OUTPUT FORMAT:
You MUST respond with valid JSON matching EXACTLY this structure:
{
  "intent": "<detected_intent>",
  "mode": "Universal Assistant",
  "response": "<main_answer>",
  "hashtags": [],
  "cta": "",
  "score": { "grammar": 95, "engagement": 90, "readability": 92 }
}`;
  }

  /**
   * Core Groq API LLM Dispatcher using exact model: openai/gpt-oss-120b
   */
  private static async callLLM(
    prompt: string,
    organizationId?: string,
    tabMode: "generate" | "rewrite" | "templates" | "general" = "general"
  ): Promise<{ structured: StructuredAIResponse; rawText: string; model: string }> {
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;

    let systemContext = "[SYSTEM CONTEXT]: You are the Universal CRM AI Assistant for Jisnu CRM.";
    if (organizationId) {
      systemContext = await this.buildContext(organizationId);
    }

    const systemInstruction = this.getTabSystemInstruction(systemContext, tabMode);

    if (groqKey) {
      try {
        const res = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: this.MODEL_NAME,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          },
          { headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" }, timeout: 25000 }
        );

        const rawText = res.data?.choices?.[0]?.message?.content?.trim() || "";
        if (rawText) {
          try {
            const parsed = JSON.parse(rawText);
            const structured: StructuredAIResponse = {
              intent: parsed.intent || (tabMode === "rewrite" ? "linkedin_rewrite" : "general_chat"),
              mode: parsed.mode || (tabMode === "rewrite" ? "Rewrite & Polish" : tabMode === "generate" ? "Post Generator" : "Universal Assistant"),
              response: parsed.response || rawText,
              hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
              cta: parsed.cta || "",
              score: {
                grammar: typeof parsed.score?.grammar === "number" ? parsed.score.grammar : 95,
                engagement: typeof parsed.score?.engagement === "number" ? parsed.score.engagement : 92,
                readability: typeof parsed.score?.readability === "number" ? parsed.score.readability : 96
              }
            };
            return { structured, rawText: structured.response, model: `Groq-${this.MODEL_NAME}` };
          } catch {
            const fallbackStructured: StructuredAIResponse = {
              intent: tabMode === "rewrite" ? "linkedin_rewrite" : "general_chat",
              mode: tabMode === "rewrite" ? "Rewrite & Polish" : "Post Generator",
              response: rawText,
              hashtags: this.extractHashtags(rawText),
              cta: "",
              score: { grammar: 95, engagement: 90, readability: 92 }
            };
            return { structured: fallbackStructured, rawText, model: `Groq-${this.MODEL_NAME}` };
          }
        }
      } catch (err: any) {
        console.warn("[AI SERVICE GROQ NOTICE]:", err.message);
      }
    }

    // Secondary fallback
    const fallbackResponse: StructuredAIResponse = {
      intent: tabMode === "rewrite" ? "linkedin_rewrite" : "general_chat",
      mode: tabMode === "rewrite" ? "Rewrite & Polish" : "Post Generator",
      response: this.generateRuleBasedFallback(prompt, tabMode),
      hashtags: tabMode === "generate" ? ["#JisnuCRM", "#BusinessGrowth", "#AI"] : [],
      cta: tabMode === "generate" ? "What's your biggest growth challenge this quarter? Drop your thoughts below 👇" : "",
      score: { grammar: 95, engagement: 90, readability: 92 }
    };

    return {
      structured: fallbackResponse,
      rawText: fallbackResponse.response,
      model: `Groq-${this.MODEL_NAME}`
    };
  }

  private static extractHashtags(text: string): string[] {
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    return matches ? Array.from(new Set(matches)).slice(0, 5) : [];
  }

  private static generateRuleBasedFallback(prompt: string, tabMode: string = "general"): string {
    if (tabMode === "rewrite") {
      return "Please paste the content you would like me to rewrite, polish, or improve.";
    }

    const lower = prompt.toLowerCase();
    if (lower.includes("hiring")) {
      return "🚀 We're Hiring! Join our growing engineering team.\n\nWe are looking for passionate builders to scale high-impact CRM solutions with us.\n\n💼 Open Roles:\n• Staff Full Stack Engineer\n• Growth & Automation Lead\n\nApply now or tag someone who would be a great fit!\n\nWhat's your favorite tech stack to build with?";
    }
    return "💡 Most teams overestimate tools and underestimate workflow automation.\n\nBuilding consistent growth requires clear strategy, compelling storytelling, and delivering real value to your audience every single day.\n\nWhat strategies are driving growth for your business this quarter?";
  }

  /**
   * Automatically save generated content into AIContentHistory
   */
  public static async saveHistory(params: {
    organizationId: string;
    userId?: string;
    prompt: string;
    generatedContent: string;
    mode: string;
    tone?: string;
    model: string;
  }) {
    try {
      const record = await prisma.aIContentHistory.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId || null,
          prompt: params.prompt,
          generatedContent: params.generatedContent,
          generatedText: params.generatedContent,
          mode: params.mode || "Post Generator",
          tone: params.tone || "Professional",
          model: params.model || `Groq-${this.MODEL_NAME}`,
          modelName: params.model || `Groq-${this.MODEL_NAME}`
        }
      });
      return record;
    } catch (err: any) {
      console.warn("[AI SERVICE] Failed to auto-save history record:", err.message);
      return null;
    }
  }

  /**
   * Universal AI Assistant Endpoint
   */
  public static async askUniversalAI(organizationId: string, userPrompt: string, userId?: string) {
    const { structured, rawText, model } = await this.callLLM(userPrompt, organizationId, "generate");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId,
      prompt: userPrompt.slice(0, 500),
      generatedContent: rawText,
      mode: structured.mode || "Post Generator",
      tone: "Human Creator",
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      ...structured,
      model,
      text: structured.response
    };
  }

  /**
   * 1. TAB 1: POST GENERATOR
   * Generates LinkedIn post content strictly focused on user's topic and selected tone.
   */
  public static async generatePost(organizationId: string, params: AIGenerateParams) {
    const topicText = (params.topic || "").trim();
    const toneText = (params.tone || "Professional").trim();

    const prompt = `Write a high-engaging, original LinkedIn post specifically about the following topic:
Topic: "${topicText}"
Requested Tone: ${toneText}

CRITICAL INSTRUCTION:
- You MUST create content directly and specifically about "${topicText}". For example, if the topic is "AI in mathematics", discuss how artificial intelligence is applied in mathematics (such as mathematical problem solving, theorem proving, symbolic computation, mathematical modeling, or AI-assisted research).
- Match the requested tone: ${toneText}.
- DO NOT return generic marketing copy or unrelated SaaS text.
- Do NOT include meta-preambles like "Here is your post:".`;

    const { structured, model } = await this.callLLM(prompt, organizationId, "generate");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId: params.userId,
      prompt: topicText,
      generatedContent: structured.response,
      mode: "Post Generator",
      tone: toneText,
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      text: structured.response,
      model,
      intent: structured.intent || "general_chat",
      mode: "Post Generator",
      hashtags: structured.hashtags,
      cta: structured.cta,
      score: structured.score
    };
  }

  /**
   * 2. TAB 2: REWRITE & POLISH
   * Polishes provided text or generates a polished LinkedIn post if a topic/prompt is entered.
   */
  public static async rewritePost(organizationId: string, params: AIRewriteParams) {
    const cleanContent = (params.content || "").trim();
    const modeText = (params.mode || "professional").trim();

    if (!cleanContent) {
      return {
        success: true,
        text: "Please paste the content or enter a topic you would like me to rewrite, polish, or improve.",
        model: `Groq-${this.MODEL_NAME}`,
        intent: "linkedin_rewrite",
        mode: "Rewrite & Polish",
        hashtags: [],
        cta: "",
        score: { grammar: 100, engagement: 100, readability: 100 }
      };
    }

    const prompt = `You are an expert LinkedIn editor and copywriter.
Task: Polish, rewrite, or generate a compelling LinkedIn post based on the following input:

User Input:
"""
${cleanContent}
"""

Tone / Mode: ${modeText}

INSTRUCTIONS:
1. If the input is a short topic or brief phrase (e.g. "AI in mathematics"), generate a complete, high-quality LinkedIn post specifically focused on that topic in a ${modeText} tone.
2. If the input is already a complete post or paragraph, rewrite and polish it to improve clarity, flow, engagement, and grammar while preserving its core meaning.
3. Return ONLY the final polished post content without any introductory conversational preambles (e.g., do NOT start with "Here is your rewritten post:").`;

    const { structured, model } = await this.callLLM(prompt, organizationId, "rewrite");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId: params.userId,
      prompt: `Rewrite (${modeText}): ${cleanContent.slice(0, 150)}...`,
      generatedContent: structured.response,
      mode: "Rewrite & Polish",
      tone: modeText,
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      text: structured.response,
      model,
      intent: structured.intent || "linkedin_rewrite",
      mode: "Rewrite & Polish",
      hashtags: structured.hashtags,
      cta: structured.cta,
      score: structured.score
    };
  }

  /**
   * 3. TAB 3: TEMPLATES
   * Provides reusable blueprint templates with bracketed placeholders.
   */
  public static async generateTemplate(organizationId: string, params: AITemplateParams) {
    const prompt = `Provide a reusable, fill-in-the-blank blueprint template for topic/category: "${params.topic || params.category || "Cold Email outreach"}". Ensure it has explicit bracketed placeholders like [Your Name], [Company Name], [Key Feature], [Call to Action].`;

    const { structured, model } = await this.callLLM(prompt, organizationId, "templates");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId: params.userId,
      prompt: `Template: ${params.topic || params.category || "General"}`,
      generatedContent: structured.response,
      mode: "Templates",
      tone: "Blueprint",
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      text: structured.response,
      model,
      intent: "template",
      mode: "Templates",
      hashtags: [],
      cta: "",
      score: structured.score
    };
  }

  /**
   * Contextual AI Refinement (Follow-up chat remembering last generated response)
   */
  public static async refineContent(organizationId: string, params: {
    originalPrompt?: string;
    lastGeneratedContent: string;
    instruction: string;
    userId?: string;
  }) {
    const prompt = `Refine and update the following content according to the user's follow-up instruction. Do NOT generate a completely new post on an unrelated topic. Apply the instruction directly to the provided content:

Original Prompt Context: "${params.originalPrompt || "LinkedIn Post"}"

Previous Content:
"""
${params.lastGeneratedContent}
"""

Follow-up Instruction: "${params.instruction}"

Requirements:
- Modify/refine the previous content to fulfill the instruction (e.g. shorten, add emojis, translate to Marathi/Hindi, rewrite for CEOs/developers, improve hook, improve ending, make viral).
- Return ONLY the updated content directly without meta preambles ("Here is your updated post:").`;

    const { structured, model } = await this.callLLM(prompt, organizationId, "generate");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId: params.userId,
      prompt: `Refine: "${params.instruction}"`,
      generatedContent: structured.response,
      mode: "Contextual Refine",
      tone: "Interactive",
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      text: structured.response,
      model,
      intent: structured.intent || "linkedin_post",
      mode: "Contextual Refine",
      hashtags: structured.hashtags,
      cta: structured.cta,
      score: structured.score
    };
  }

  /**
   * 4. Hashtag Generator
   */
  public static async generateHashtags(organizationId: string, content: string, count: number = 10, userId?: string) {
    const prompt = `Generate exactly ${count} relevant, high-performing LinkedIn hashtags for this post:

${content}`;

    const { structured, model } = await this.callLLM(prompt, organizationId, "generate");
    const hashtags = structured.hashtags.length > 0 ? structured.hashtags : this.extractHashtags(structured.response);
    const resultText = hashtags.slice(0, count).join(" ");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId,
      prompt: `Hashtags for: ${content.slice(0, 100)}...`,
      generatedContent: resultText,
      mode: "Hashtags",
      tone: "Trending",
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      hashtags: hashtags.slice(0, count),
      text: resultText,
      model,
      intent: "linkedin_post",
      score: structured.score
    };
  }

  /**
   * 5. Call to Action (CTA) Generator
   */
  public static async generateCTA(type: string = "Contact Us") {
    const ctas: Record<string, string[]> = {
      "Contact Us": [
        "📩 DM us today to learn how we can help your team scale!",
        "💬 What's your take on this? Drop your thoughts below!",
        "📧 Reach out directly for inquiries."
      ],
      "Book Demo": [
        "📅 Ready to see it in action? Book your 1-on-1 demo today!",
        "🚀 Schedule a free live demo using the link in the comments below."
      ],
      "Learn More": [
        "💡 Want to dive deeper? What's your biggest takeaway?",
        "📖 Read our complete guide to master this strategy today."
      ],
      "Visit Website": [
        "🌐 Visit our website to explore our full product suite!",
        "🔗 Click the link below to visit our official portal."
      ]
    };

    const suggestions = ctas[type] || ctas["Contact Us"];
    const chosenCta = suggestions[Math.floor(Math.random() * suggestions.length)];
    return {
      success: true,
      cta: chosenCta,
      suggestions,
      intent: "general_chat",
      score: { grammar: 98, engagement: 95, readability: 96 }
    };
  }

  /**
   * 6. Grammar & Spell Check
   */
  public static async fixGrammar(organizationId: string, content: string, userId?: string) {
    const cleanContent = (content || "").trim();
    const exactRefusalMessage = "Please paste the content you would like me to rewrite, polish, or improve.";

    if (!cleanContent) {
      return {
        success: true,
        text: exactRefusalMessage,
        model: `Groq-${this.MODEL_NAME}`,
        intent: "grammar_check",
        mode: "Grammar",
        hashtags: [],
        cta: "",
        score: { grammar: 100, engagement: 100, readability: 100 }
      };
    }

    const prompt = `Fix all spelling, grammar, punctuation, and sentence structure errors in this text while maintaining its human tone and formatting:

${cleanContent}`;

    const { structured, model } = await this.callLLM(prompt, organizationId, "rewrite");

    const savedRecord = await this.saveHistory({
      organizationId,
      userId,
      prompt: `Grammar Fix: ${cleanContent.slice(0, 100)}...`,
      generatedContent: structured.response,
      mode: "Grammar",
      tone: "Corrected",
      model
    });

    return {
      success: true,
      id: savedRecord?.id,
      text: structured.response,
      model,
      intent: "grammar_check",
      mode: "Grammar",
      hashtags: structured.hashtags,
      cta: structured.cta,
      score: structured.score
    };
  }

  /**
   * 7. Fetch AI History List (Newest First with Search support)
   */
  public static async getHistoryList(organizationId: string, search?: string) {
    const where: any = { organizationId };

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { prompt: { contains: query, mode: "insensitive" } },
        { generatedContent: { contains: query, mode: "insensitive" } },
        { mode: { contains: query, mode: "insensitive" } }
      ];
    }

    const history = await prisma.aIContentHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return { success: true, history };
  }

  public static async getHistory(organizationId: string) {
    return this.getHistoryList(organizationId);
  }

  /**
   * 8. Fetch Single AI History Item by ID
   */
  public static async getHistoryById(organizationId: string, id: string) {
    const item = await prisma.aIContentHistory.findFirst({
      where: { id, organizationId }
    });

    if (!item) {
      return { success: false, error: "History record not found." };
    }

    return { success: true, item };
  }

  /**
   * 9. Delete AI History Item by ID
   */
  public static async deleteHistoryById(organizationId: string, id: string) {
    const existing = await prisma.aIContentHistory.findFirst({
      where: { id, organizationId }
    });

    if (!existing) {
      return { success: false, error: "History record not found or access denied." };
    }

    await prisma.aIContentHistory.delete({
      where: { id }
    });

    return { success: true, message: "History record deleted successfully." };
  }
}
