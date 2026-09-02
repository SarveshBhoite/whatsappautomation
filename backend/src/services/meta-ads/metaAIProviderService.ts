import axios from "axios";

export interface AIProviderConfig {
  provider?: "groq" | "gemini" | "openai";
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigurationError";
  }
}

export class AIRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIRateLimitError";
  }
}

export class AIInvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIInvalidResponseError";
  }
}

export class AITimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AITimeoutError";
  }
}

export class MetaAIProviderService {
  /**
   * Collect all configured API keys from environment
   */
  private static getApiKeys(): { geminiKey?: string; groqKeys: string[]; openaiKey?: string } {
    const groqKeys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
      process.env.GROQ_API_KEY_5,
      process.env.GROQ_API_KEY_6,
      process.env.GROQ_API_KEY_7,
      process.env.GROQ_API_KEY_8,
      process.env.GROQ_KEY,
      process.env.GROQ_API_KEY,
    ].filter(Boolean) as string[];

    return {
      geminiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
      groqKeys,
      openaiKey: process.env.OPENAI_API_KEY,
    };
  }

  /**
   * Structured JSON generation with multi-key pool rotation, retries, and Gemini fallback
   */
  static async generateStructuredResponse<T = any>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIProviderConfig
  ): Promise<T> {
    const { geminiKey, groqKeys, openaiKey } = this.getApiKeys();
    const timeoutMs = options?.timeoutMs ?? 30000;

    if (!geminiKey && groqKeys.length === 0 && !openaiKey) {
      throw new AIConfigurationError(
        "No AI provider API key configured (GEMINI_API_KEY or GROQ_API_KEY is required in environment)."
      );
    }

    let lastError: any = null;

    // 1. Try Groq Keys Pool with candidate models
    const groqModels = options?.model ? [options.model] : [
      "openai/gpt-oss-120b",
      "qwen/qwen3.6-27b",
      "groq/compound",
      "llama-3.3-70b-versatile"
    ];

    for (const key of groqKeys) {
      for (const model of groqModels) {
        try {
          const resp = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.2,
              response_format: { type: "json_object" },
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
              },
              timeout: timeoutMs,
            }
          );

          const content = resp.data?.choices?.[0]?.message?.content;
          if (content) {
            return JSON.parse(content) as T;
          }
        } catch (err: any) {
          lastError = err;
          const status = err.response?.status;
          // If 404 (model not available on this tier), try next model immediately
          if (status === 404) continue;
          // If 429 (rate limit), break to try next key in the pool
          if (status === 429) break;
        }
      }
    }

    // 2. Fallback to Gemini if Groq pool was exhausted
    if (geminiKey) {
      try {
        const geminiModel = options?.model || "gemini-2.0-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

        const resp = await axios.post(
          url,
          {
            contents: [
              {
                role: "user",
                parts: [
                  { text: `${systemPrompt}\n\nStrict requirement: Output valid raw JSON only.\n\n${userPrompt}` },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          },
          { timeout: timeoutMs }
        );

        const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text) as T;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw new AIInvalidResponseError(
      `AI Provider generation failed: ${lastError?.response?.data?.error?.message || lastError?.message || "Unknown error"}`
    );
  }
}
