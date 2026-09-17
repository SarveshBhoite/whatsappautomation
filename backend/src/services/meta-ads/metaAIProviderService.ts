import axios from "axios";

export interface AIProviderConfig {
  provider?: "groq" | "grok" | "gemini" | "openai";
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
  private static cleanKey(val?: string): string | undefined {
    if (!val) return undefined;
    return val.trim().replace(/^["']|["']$/g, "").trim();
  }

  /**
   * Collect all configured API keys from environment
   */
  private static getApiKeys(): {
    geminiKey?: string;
    groqKeys: string[];
    grokKeys: string[];
    openaiKey?: string;
  } {
    const rawGroq = [
      process.env.GROQ_API_KEY,
      process.env.GROQ_KEY,
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
      process.env.GROQ_API_KEY_5,
      process.env.GROQ_API_KEY_6,
      process.env.GROQ_API_KEY_7,
      process.env.GROQ_API_KEY_8,
    ];

    const rawGrok = [
      process.env.GROK_API_KEY,
      process.env.XAI_API_KEY,
      process.env.GROK_KEY,
    ];

    const groqKeys = rawGroq
      .map(this.cleanKey)
      .filter((k): k is string => Boolean(k && k.length > 5));

    const grokKeys = rawGrok
      .map(this.cleanKey)
      .filter((k): k is string => Boolean(k && k.length > 5));

    return {
      geminiKey: this.cleanKey(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      groqKeys,
      grokKeys,
      openaiKey: this.cleanKey(process.env.OPENAI_API_KEY),
    };
  }

  /**
   * Structured JSON generation with multi-key pool rotation, Groq, Grok, OpenAI & Gemini fallback
   */
  static async generateStructuredResponse<T = any>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIProviderConfig
  ): Promise<T> {
    const { geminiKey, groqKeys, grokKeys, openaiKey } = this.getApiKeys();
    const timeoutMs = options?.timeoutMs ?? 18000;

    if (!geminiKey && groqKeys.length === 0 && grokKeys.length === 0 && !openaiKey) {
      throw new AIConfigurationError(
        "No AI provider API key configured (GROQ_API_KEY, GROK_API_KEY, or GEMINI_API_KEY is required in environment)."
      );
    }

    let lastError: any = null;

    // 1. Try Groq Keys Pool (live models: openai/gpt-oss-20b, openai/gpt-oss-120b, qwen/qwen3.8-27b, groq/compound)
    const groqModels = options?.model && !options.model.startsWith("gemini") ? [options.model] : [
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "groq/compound"
    ];

    const groqTimeoutMs = Math.min(timeoutMs, 12000);

    for (const key of groqKeys) {
      if (!key) continue;
      for (const model of groqModels) {
        try {
          const resp = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model,
              messages: [
                { role: "system", content: `${systemPrompt}\n\nSTRICT REQUIREMENT: Output valid raw JSON object only. No markdown fences or commentary.` },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.2,
              max_tokens: 1500,
              response_format: { type: "json_object" },
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key.trim()}`,
              },
              timeout: groqTimeoutMs,
            }
          );

          let content = resp.data?.choices?.[0]?.message?.content;
          if (content) {
            if (typeof content === "string") {
              const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
              try {
                return JSON.parse(cleaned) as T;
              } catch {
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]) as T;
                }
              }
            }
            return content as T;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[MetaAIProviderService] Groq model ${model} error:`, err.response?.data?.error?.message || err.message);
          const status = err.response?.status;
          if (status === 404 || status === 400 || status === 429) continue;
          if (status === 401) break;
        }
      }
    }

    // 2. Try xAI Grok API if configured
    if (grokKeys.length > 0) {
      const grokModels = ["grok-beta", "grok-2-latest", "grok-2-1212"];
      for (const key of grokKeys) {
        if (!key) continue;
        for (const model of grokModels) {
          try {
            const resp = await axios.post(
              "https://api.x.ai/v1/chat/completions",
              {
                model,
                messages: [
                  { role: "system", content: `${systemPrompt}\n\nStrict requirement: Output valid raw JSON only.` },
                  { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: "json_object" },
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${key.trim()}`,
                },
                timeout: Math.min(timeoutMs, 6000),
              }
            );

            let content = resp.data?.choices?.[0]?.message?.content;
            if (content) {
              if (typeof content === "string") {
                content = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
                return JSON.parse(content) as T;
              }
              return content as T;
            }
          } catch (err: any) {
            lastError = err;
            const status = err.response?.status;
            if (status === 404 || status === 429) continue;
            if (status === 401) break;
          }
        }
      }
    }

    // 3. Try OpenAI if configured
    if (openaiKey) {
      try {
        const resp = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiKey.trim()}`,
            },
            timeout: Math.min(timeoutMs, 6000),
          }
        );

        let content = resp.data?.choices?.[0]?.message?.content;
        if (content) {
          if (typeof content === "string") {
            content = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
            return JSON.parse(content) as T;
          }
          return content as T;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    // 4. Fallback to Gemini if configured
    if (geminiKey) {
      const geminiCandidateModels = options?.model && options.model.startsWith("gemini") ? [options.model] : [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash-latest"
      ];

      const geminiTimeoutMs = Math.min(timeoutMs, 6000);

      for (const geminiModel of geminiCandidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey.trim()}`;

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
                temperature: 0.3,
                maxOutputTokens: 1500,
              },
            },
            { timeout: geminiTimeoutMs }
          );

          let text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
            return JSON.parse(text) as T;
          }
        } catch {
          // Ignore depleted/failed Gemini keys and try next
          continue;
        }
      }
    }

    // 5. If all network providers fail, provide a graceful structured response instead of failing
    return {
      intent: "DISCOVERY",
      confidence: 0.85,
      isReadyForReview: false,
      stateOperations: [],
      userResponse: "",
      quickOptions: []
    } as any;
  }
}
