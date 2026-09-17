import axios from "axios";
import { GoogleAdsCampaignValidator, ValidationError } from "./shared/GoogleAdsCampaignValidator";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";
import { GoogleAdsImageGenService, GeneratedCreativeImage } from "./GoogleAdsImageGenService";

export interface BusinessContext {
  name?: string;
  type?: string;
  description?: string;
  website?: string;
  hasApp?: boolean;
  physicalLocation?: boolean;
  ecommerceFeed?: boolean;
}

export type CampaignStage =
  | "collecting_business"
  | "recommending_objective"
  | "recommending_conversion_goals"
  | "recommending_campaign_type"
  | "collecting_campaign_data"
  | "collecting_assets"
  | "validation_required"
  | "missing_requirements"
  | "ready_for_review"
  | "ready_for_publish"
  | "creating"
  | "completed"
  | "failed";

export interface CampaignState {
  business?: BusinessContext;
  desiredOutcome?: string;
  objective?: "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "APP_PROMOTION" | "AWARENESS" | "LOCAL" | "NO_GUIDANCE" | "";
  conversionGoals?: string[];
  campaignType?: "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "VIDEO" | "DEMAND_GEN" | "SHOPPING" | "APP" | "";
  recommendationReason?: string;
  campaignName?: string;
  businessName?: string;
  website?: string;
  finalUrl?: string;
  budgetType?: "DAILY" | "TOTAL" | string;
  dailyBudget?: number | null;
  totalBudget?: number | null;
  budget?: number | null;
  locations?: string[];
  language?: string;
  biddingStrategy?: string;
  targetCpa?: number | null;
  targetRoas?: number | null;
  maxCpcLimit?: number | string | null;
  targetImpressionSharePercent?: number | string | null;
  impressionShareLocation?: string;
  conversionGoal?: string;
  keywords?: string[];
  headlines?: string[];
  descriptions?: string[];
  longHeadlines?: string[];
  // Search-specific AI Max Settings
  aiMax?: boolean;
  enableAiMax?: boolean;
  textCustomization?: boolean;
  enableTextCustomization?: boolean;
  finalUrlExpansion?: boolean;
  enableFinalUrlExpansion?: boolean;
  brandInclusions?: string[];
  brandExclusions?: string[];
  // Demand Gen specific settings
  adFormat?: "SINGLE_IMAGE" | "VIDEO" | "CAROUSEL";
  channelTargeting?: "ALL" | "CHOOSE";
  channels?: string[];
  carouselCards?: Array<{ id: string; image: string; headline: string; finalUrl: string }>;
  callToAction?: string;
  images?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string; aspectRatio?: string; dimensions?: { width: number; height: number } }>;
  logos?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string; aspectRatio?: string; dimensions?: { width: number; height: number } }>;
  videos?: Array<string | { url?: string; data?: string; name?: string; aspectRatio?: string; dimensions?: { width: number; height: number } }>;
  appId?: string;
  appName?: string;
  platform?: "ANDROID" | "IOS";
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  // Shopping & Performance Max specific settings
  merchantCenterId?: string;
  merchantId?: string;
  salesCountry?: string;
  feedLabel?: string;
  customerAcquisitionMode?: string;
  campaignPriority?: string;
  localProducts?: boolean;
  enableLocalProducts?: boolean;
  adGroupName?: string;
  adGroupBid?: number | string | null;
  productGroupFilter?: string;
  productGroupSelectBy?: string;
  productGroupCustomLabel?: string;
  assetGroupName?: string;
  brandGuidelinesEnabled?: boolean;
  positiveGeoTargetType?: string;
  negativeGeoTargetType?: string;
  trackingTemplate?: string;
  finalUrlSuffix?: string;
  customParameters?: Array<{ id?: string; name: string; value: string }>;
  displayPath1?: string;
  displayPath2?: string;
  mobileFinalUrl?: string;
  searchThemes?: string[];
  audienceSignals?: Array<{ resourceName: string; name?: string; type?: string }>;
  sitelinks?: Array<{ text: string; url: string; desc1?: string; desc2?: string }>;
  callouts?: string[];
  callPhoneNumber?: string;
  promotions?: Array<{ promotionTarget: string; finalUrl: string; occasion?: string; percentOff?: number; moneyAmountOff?: number; currencyCode?: string }>;
  prices?: Array<{ header: string; description?: string; amount?: number; currencyCode?: string; unit?: string; finalUrl?: string }>;
  structuredSnippets?: Array<{ header: string; values: string[] }>;
  languages?: string[];
  networkSearch?: boolean;
  networkDisplay?: boolean;
  locationOptionsPresence?: string;
  locationOptionsExclude?: string;
  adRotationMode?: string;
  onlyBidNewCustomers?: boolean;
  adjustLapsedCustomers?: boolean;
  mainBrandColor?: string;
  accentBrandColor?: string;
  brandFont?: string;
  adName?: string;
  brandGuidelines?: {
    mainColor?: string;
    accentColor?: string;
    font?: string;
  };
  optAdaptiveLayouts?: boolean;
  optAnimatedImages?: boolean;
  optGeneratedVideos?: boolean;
  optShorterVideos?: boolean;
  optResizedVideos?: boolean;
  optLandingPagePreviews?: boolean;
  includeViewThrough?: boolean;
  optimizedTargeting?: boolean;
  ipExclusions?: string[];
  startDate?: string;
  endDate?: string;
  euPolitical?: "YES" | "NO";
  readyForReview?: boolean;
  readyForPublish?: boolean;
  stage?: CampaignStage;
  [key: string]: any;
}

export interface AiChatResponse {
  message: string;
  suggestions: string[];
  campaignState: CampaignState;
  generatedImages?: GeneratedCreativeImage[];
  missingFields: string[];
  validationErrors: ValidationError[];
  readyForReview: boolean;
  readyForPublish: boolean;
  stage: CampaignStage;
  explanation?: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── MANUAL CREATION COMPATIBILITY MATRICES (SOURCE OF TRUTH) ──
export const MANUAL_GOALS_BY_OBJECTIVE: Record<string, Array<{ id: string; name: string }>> = {
  SALES: [
    { id: "phone_leads", name: "Phone call leads" },
    { id: "contacts", name: "Contacts" },
    { id: "get_directions", name: "Get directions" },
    { id: "phone_leads,contacts", name: "Phone call leads + Contacts" },
    { id: "contacts,get_directions", name: "Contacts + Get directions" },
    { id: "phone_leads,get_directions", name: "Phone call leads + Get directions" },
    { id: "phone_leads,contacts,get_directions", name: "Phone call leads + Contacts + Get directions" }
  ],
  LEADS: [
    { id: "phone_leads", name: "Phone call leads" },
    { id: "contacts", name: "Contacts" },
    { id: "get_directions", name: "Get directions" },
    { id: "phone_leads,contacts", name: "Phone call leads + Contacts" },
    { id: "contacts,get_directions", name: "Contacts + Get directions" },
    { id: "phone_leads,get_directions", name: "Phone call leads + Get directions" },
    { id: "phone_leads,contacts,get_directions", name: "Phone call leads + Contacts + Get directions" }
  ],
  WEBSITE_TRAFFIC: [
    { id: "phone_leads", name: "Phone call leads" },
    { id: "contacts", name: "Contacts" },
    { id: "get_directions", name: "Get directions" },
    { id: "phone_leads,contacts", name: "Phone call leads + Contacts" },
    { id: "contacts,get_directions", name: "Contacts + Get directions" },
    { id: "phone_leads,get_directions", name: "Phone call leads + Get directions" },
    { id: "phone_leads,contacts,get_directions", name: "Phone call leads + Contacts + Get directions" }
  ],
  APP_PROMOTION: [
    { id: "installs", name: "App installs" },
    { id: "engagement", name: "App engagement" },
    { id: "preregistration", name: "App pre-registration (Android only)" }
  ],
  AWARENESS: [
    { id: "views", name: "Video views" },
    { id: "reach", name: "Reach" },
    { id: "subscriptions", name: "YouTube subscriptions and engagements" }
  ],
  LOCAL: [],
  NO_GUIDANCE: [
    { id: "phone_leads", name: "Phone call leads" },
    { id: "get_directions", name: "Get directions" },
    { id: "phone_leads,get_directions", name: "Phone call leads + Get directions" }
  ]
};

export function getAvailableCampaignTypesBackend(
  objective?: string,
  conversionGoals?: string[]
): string[] {
  const obj = objective || "";
  const rawGoal = (conversionGoals && conversionGoals.length > 0) ? conversionGoals.join(",") : "";
  const hasContacts = rawGoal.includes("contacts");
  const hasDirections = rawGoal.includes("get_directions");

  if (obj === "APP_PROMOTION") {
    return ["APP"];
  }

  if (obj === "LOCAL") {
    return ["PERFORMANCE_MAX"];
  }

  if (obj === "AWARENESS") {
    const videoGoal = conversionGoals?.[0] || "views";
    if (videoGoal === "views") return ["VIDEO"];
    if (videoGoal === "reach") return ["VIDEO", "DISPLAY"];
    if (videoGoal === "subscriptions") return ["DEMAND_GEN"];
    return ["VIDEO"];
  }

  if (obj === "NO_GUIDANCE") {
    return ["PERFORMANCE_MAX", "SEARCH", "DISPLAY", "DEMAND_GEN", "SHOPPING"];
  }

  if (obj === "WEBSITE_TRAFFIC") {
    return ["SEARCH", "PERFORMANCE_MAX", "DEMAND_GEN", "DISPLAY", "SHOPPING", "VIDEO"];
  }

  // SALES or LEADS
  const baseTypes = ["PERFORMANCE_MAX", "SEARCH", "DEMAND_GEN", "VIDEO", "DISPLAY", "SHOPPING"];
  if (hasContacts) {
    return ["PERFORMANCE_MAX"];
  } else if (hasDirections && !hasContacts) {
    return ["PERFORMANCE_MAX", "SEARCH", "SHOPPING"];
  }
  return baseTypes;
}

export function reconcileCampaignStateBackend(state: CampaignState): CampaignState {
  const updated = { ...state };
  const obj = updated.objective || "";

  if (obj === "SALES" || obj === "LEADS" || obj === "WEBSITE_TRAFFIC") {
    const rawGoal = (updated.conversionGoals && updated.conversionGoals.length > 0)
      ? updated.conversionGoals.join(",")
      : "phone_leads";
    const allowed = MANUAL_GOALS_BY_OBJECTIVE[obj] || [];
    const isValid = allowed.some(g => g.id === rawGoal);
    const resolvedGoal = isValid ? rawGoal : "phone_leads";
    updated.conversionGoals = resolvedGoal.split(",");

    const availableTypes = getAvailableCampaignTypesBackend(obj, updated.conversionGoals);
    if (!updated.campaignType || !availableTypes.includes(updated.campaignType)) {
      updated.campaignType = (availableTypes[0] || "PERFORMANCE_MAX") as any;
    }
  } else if (obj === "APP_PROMOTION") {
    const rawSubtype = updated.conversionGoals?.[0] || "installs";
    const allowed = MANUAL_GOALS_BY_OBJECTIVE.APP_PROMOTION;
    const isValid = allowed.some(s => s.id === rawSubtype);
    updated.conversionGoals = [isValid ? rawSubtype : "installs"];
    updated.campaignType = "APP";
  } else if (obj === "AWARENESS") {
    const rawSubtype = updated.conversionGoals?.[0] || "views";
    const allowed = MANUAL_GOALS_BY_OBJECTIVE.AWARENESS;
    const isValid = allowed.some(s => s.id === rawSubtype);
    const resolvedSubtype = isValid ? rawSubtype : "views";
    updated.conversionGoals = [resolvedSubtype];
    const availableTypes = getAvailableCampaignTypesBackend(obj, updated.conversionGoals);
    if (!updated.campaignType || !availableTypes.includes(updated.campaignType)) {
      updated.campaignType = (availableTypes[0] || "VIDEO") as any;
    }
  } else if (obj === "LOCAL") {
    updated.conversionGoals = [];
    updated.campaignType = "PERFORMANCE_MAX";
  } else if (obj === "NO_GUIDANCE") {
    const availableTypes = ["PERFORMANCE_MAX", "SEARCH", "DISPLAY", "DEMAND_GEN", "SHOPPING"];
    if (!updated.campaignType || !availableTypes.includes(updated.campaignType)) {
      updated.campaignType = "PERFORMANCE_MAX";
    }
    if (updated.campaignType === "DEMAND_GEN") {
      updated.conversionGoals = ["phone_leads"];
    } else if (updated.campaignType === "SHOPPING") {
      const rawGoal = (updated.conversionGoals && updated.conversionGoals.length > 0)
        ? updated.conversionGoals.join(",")
        : "phone_leads";
      const allowed = MANUAL_GOALS_BY_OBJECTIVE.NO_GUIDANCE;
      const isValid = allowed.some(g => g.id === rawGoal);
      updated.conversionGoals = (isValid ? rawGoal : "phone_leads").split(",");
    } else {
      updated.conversionGoals = [];
    }
  }

  return updated;
}

export class GoogleAdsAiAssistantService {
  private static activeKeyIndex = 0;

  /**
   * Retrieves all available Groq API keys configured in environment.
   * Supports GROQ_KEY, GROQ_API_KEY, and GROQ_API_KEY_1 through GROQ_API_KEY_20.
   */
  public static getGroqKeys(): string[] {
    const keys: string[] = [];
    const main = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
    if (main && main.trim()) {
      keys.push(main.trim().replace(/['"]/g, ""));
    }
    for (let i = 1; i <= 20; i++) {
      const k = process.env[`GROQ_API_KEY_${i}`];
      if (k && k.trim()) {
        const clean = k.trim().replace(/['"]/g, "");
        if (!keys.includes(clean)) {
          keys.push(clean);
        }
      }
    }
    if (keys.length === 0) {
      console.warn("[GoogleAdsAiAssistantService] Warning: No GROQ keys found in environment.");
      keys.push("");
    }
    return keys;
  }

  /**
   * Executes a Groq Chat Completion with automatic multi-key rotation and model fallback.
   */
  public static async executeGroqChat(
    payload: {
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: string };
    },
    preferredModels?: string[]
  ): Promise<{ content: string; model: string }> {
    const candidateModels = preferredModels || [
      "groq/compound",
      "groq/compound-mini",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b"
    ];

    const groqKeys = this.getGroqKeys();
    const numKeys = groqKeys.length;
    let lastErr: any = null;

    for (let kOffset = 0; kOffset < numKeys; kOffset++) {
      const keyIdx = (this.activeKeyIndex + kOffset) % numKeys;
      const currentKey = groqKeys[keyIdx];
      if (!currentKey) continue;

      for (const model of candidateModels) {
        try {
          const body: any = {
            model,
            messages: payload.messages,
            temperature: payload.temperature ?? 0.2,
            max_tokens: payload.max_tokens ?? 1000
          };
          if (payload.response_format) {
            body.response_format = payload.response_format;
          }

          const response = await axios.post(
            GROQ_API_URL,
            body,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentKey}`
              },
              timeout: 15000
            }
          );

          const content = response.data?.choices?.[0]?.message?.content || "";
          if (content && (payload.response_format?.type !== "json_object" || content.trim().startsWith("{") || content.trim().startsWith("["))) {
            this.activeKeyIndex = keyIdx;
            return { content, model };
          }
        } catch (mErr: any) {
          lastErr = mErr;
          const errMsg = mErr?.response?.data?.error?.message || mErr.message || "";
          const status = mErr?.response?.status;
          console.warn(`[AI-GUIDED Groq] Key #${keyIdx + 1} Model ${model} failed: ${errMsg}`);

          const isRateLimit = status === 429 ||
            errMsg.toLowerCase().includes("tokens per minute") ||
            errMsg.toLowerCase().includes("tpm") ||
            errMsg.toLowerCase().includes("rpm") ||
            errMsg.toLowerCase().includes("rate limit") ||
            errMsg.toLowerCase().includes("quota") ||
            errMsg.toLowerCase().includes("request too large");

          if (isRateLimit) {
            console.warn(`[AI-GUIDED Groq] Key #${keyIdx + 1} reached quota/limit. Rotating to next Groq key...`);
            break; // Immediately try next key in pool
          }
        }
      }
    }

    throw lastErr || new Error("All Groq keys and models failed to generate response.");
  }

  /**
   * Compacts campaign state specifically for LLM prompt injection.
   * Strips out massive base64 image strings, giant metadata, and empty fields
   * while keeping 100% of all Google Ads configuration parameters intact.
   */
  public static sanitizeStateForPrompt(state: CampaignState): any {
    if (!state) return {};
    const clone: any = { ...state };

    // Cap creative text arrays to avoid feeding giant repetitive arrays into the prompt
    if (Array.isArray(clone.headlines) && clone.headlines.length > 5) {
      clone.headlines = clone.headlines.slice(0, 5);
      clone.totalHeadlinesCount = state.headlines?.length;
    }
    if (Array.isArray(clone.descriptions) && clone.descriptions.length > 3) {
      clone.descriptions = clone.descriptions.slice(0, 3);
      clone.totalDescriptionsCount = state.descriptions?.length;
    }
    if (Array.isArray(clone.keywords) && clone.keywords.length > 8) {
      clone.keywords = clone.keywords.slice(0, 8);
      clone.totalKeywordsCount = state.keywords?.length;
    }

    // Sanitize images to keep only URLs / names (strip base64 data)
    if (Array.isArray(clone.images)) {
      clone.images = clone.images.map((img: any) => {
        if (typeof img === "string") {
          return img.startsWith("data:") ? "[Uploaded Image Asset]" : img;
        }
        return {
          name: img?.name || "image",
          fieldType: img?.fieldType || "MARKETING_IMAGE",
          url: (img?.url && !img.url.startsWith("data:")) ? img.url : "[Uploaded Image Asset]"
        };
      });
    }

    // Sanitize logos
    if (Array.isArray(clone.logos)) {
      clone.logos = clone.logos.map((logo: any) => {
        if (typeof logo === "string") {
          return logo.startsWith("data:") ? "[Uploaded Logo Asset]" : logo;
        }
        return {
          name: logo?.name || "logo",
          fieldType: logo?.fieldType || "LOGO",
          url: (logo?.url && !logo.url.startsWith("data:")) ? logo.url : "[Uploaded Logo Asset]"
        };
      });
    }

    // Sanitize videos
    if (Array.isArray(clone.videos)) {
      clone.videos = clone.videos.map((vid: any) => {
        if (typeof vid === "string") return vid;
        return {
          name: vid?.name || "video",
          url: vid?.url || "[Attached Video Asset]"
        };
      });
    }

    // Remove redundant nested business object if fields are already top-level
    if (clone.business && clone.businessName) {
      delete clone.business;
    }

    // Remove empty/undefined/null keys to keep JSON compact
    const compact: any = {};
    for (const [k, v] of Object.entries(clone)) {
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v) && v.length === 0) continue;
      compact[k] = v;
    }
    return compact;
  }

  /**
   * Prunes and compacts conversation history so token limits are never exhausted,
   * while preserving the initial user request and the recent context turns.
   */
  public static compactMessagesForPrompt(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Array<{ role: "user" | "assistant" | "system"; content: string }> {
    if (!Array.isArray(messages) || messages.length === 0) return [];

    const cleanContent = (role: string, content: string): string => {
      if (!content) return "";
      if (role === "assistant" && content.length > 350) {
        return content.substring(0, 350) + "...";
      }
      if (role === "user" && content.length > 500) {
        return content.substring(0, 500) + "...";
      }
      return content;
    };

    if (messages.length <= 3) {
      return messages.map(m => ({
        role: m.role,
        content: cleanContent(m.role, m.content)
      }));
    }

    const firstUserMsg = messages.find(m => m.role === "user");
    const recentMessages = messages.slice(-3);

    const result: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
    if (firstUserMsg && !recentMessages.includes(firstUserMsg)) {
      result.push({
        role: firstUserMsg.role,
        content: cleanContent(firstUserMsg.role, firstUserMsg.content)
      });
    }

    for (const m of recentMessages) {
      result.push({
        role: m.role,
        content: cleanContent(m.role, m.content)
      });
    }

    return result;
  }

  /**
   * Sanitizes strings to eliminate placeholders/fabrications
   */
  private static isPlaceholderOrFabrication(val: string): boolean {
    if (!val || typeof val !== "string") return true;
    const trimmed = val.trim();
    if (!trimmed) return true;
    const lower = trimmed.toLowerCase();
    const placeholders = [
      "your dental clinic",
      "your clothing store",
      "your business",
      "my business",
      "your business name",
      "your store name",
      "your city",
      "your state",
      "your country",
      "your city, your state",
      "your city, country",
      "example",
      "placeholder"
    ];
    return placeholders.some(p => lower.includes(p));
  }

  private static sanitizeArray(arr: any[] | undefined, maxLen?: number): string[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map(item => {
        const raw = typeof item === "string" ? item.trim() : (item?.url || item?.name || "").trim();
        return maxLen ? GoogleAdsBaseService.cleanAdText(raw, maxLen) : GoogleAdsBaseService.cleanAdText(raw);
      })
      .filter(item => item.length > 0 && !this.isPlaceholderOrFabrication(item));
  }

  public static async processChat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    currentState: CampaignState
  ): Promise<AiChatResponse> {
    const promptState = this.sanitizeStateForPrompt(currentState);

    const systemPrompt = `You are an expert Google Ads Strategic Consultant helping a business owner create the ideal Google Ads campaign.
This software is a multi-business CRM. You must dynamically understand and serve ANY type of business (B2B SaaS, B2C, ecommerce, local physical stores, mobile apps, professional services, dental/medical clinics, educational institutes, digital creators, restaurants, real estate, etc.). NEVER hardcode or restrict yourself to static mappings or any single business type.

### 6-STAGE CONSULTATIVE DECISION FLOW:
Stage 1: **BUSINESS DISCOVERY**
- Understand the user's business naturally: what they sell/provide, target audience, local/national/global focus, and primary desired outcome (leads, phone calls, store visits, online sales, app downloads, brand awareness, website traffic).
- CRITICAL OBJECTIVE RULE: If the user has ONLY provided a Business Name (or business name + website) and has NOT stated their desired goal/outcome yet, DO NOT automatically pick an objective (leave \`objective: ""\`). Instead, ask them warmly what business outcome they want to achieve (e.g. online sales, leads/calls, foot traffic, brand awareness, app installs).
- NEVER set \`objective: "LEADS"\` by default or as a fallback. The CRM supports 7 distinct objectives (\`SALES\`, \`LEADS\`, \`WEBSITE_TRAFFIC\`, \`APP_PROMOTION\`, \`AWARENESS\`, \`LOCAL\`, \`NO_GUIDANCE\`).

Stage 2: **CAMPAIGN OBJECTIVE RECOMMENDATION**
- Map the user's specific desired outcome to one of the 7 Google Ads Objectives:
  * Selling products online/ecommerce -> \`SALES\`
  * Generating client inquiries/consultations/phone calls -> \`LEADS\`
  * Driving visitors to blog, content, or general site -> \`WEBSITE_TRAFFIC\`
  * Mobile app installations/engagement -> \`APP_PROMOTION\`
  * Video views, reach, brand recognition -> \`AWARENESS\`
  * Physical store visits/walk-ins/restaurant/dealership -> \`LOCAL\`
  * Expert custom control without guidance -> \`NO_GUIDANCE\`
- Explain WHY this objective is recommended in simple, non-jargon language.
- If an objective was already chosen and confirmed by the user in \`currentState.objective\`, PRESERVE it unless the user explicitly asks to change their goal.

Stage 3: **CONVERSION GOAL / SUBTYPE & CAMPAIGN TYPE CONSULTATION**
- For \`SALES\`, \`LEADS\`, and \`WEBSITE_TRAFFIC\`:
  * Default conversion goal to \`["phone_leads"]\` or ask user how customers reach them (phone calls, website purchases, contact forms, store directions).
  * CRITICAL: When the user asks for suggestions or recommends a campaign for selling their product/business, DO NOT force or auto-select \`PERFORMANCE_MAX\` as the only option.
  * Instead, clearly present and explain the best compatible campaign types for Sales and ask the user which one they prefer:
    1. **Search Campaign**: Best for capturing high-intent customers actively searching Google for your product/service keywords.
    2. **Shopping Campaign**: Best for ecommerce stores selling physical products with images and prices directly in Google search results.
    3. **Performance Max**: Best for multi-channel automated reach across Search, YouTube, Gmail, Maps, and Display in a single campaign.
    4. **Demand Gen**: Best for visual storytelling on YouTube Shorts, Discover, and Gmail.
  * Provide selectable suggestion chips for the campaign types (e.g. \`["Use Search Campaign", "Use Shopping Campaign", "Use Performance Max", "Use Demand Gen"]\`).
  * If user asks to "suggest campaign type", provide this consultative comparison and ask them to choose or confirm, rather than auto-assigning Performance Max without asking.

Stage 4: **CAMPAIGN TYPE RECOMMENDATION (EXACT DEPENDENCY RULES)**
- Match user's choice to allowed types:
  * For \`APP_PROMOTION\`: ONLY \`APP\`.
  * For \`LOCAL\`: ONLY \`PERFORMANCE_MAX\`.
  * For \`AWARENESS\`:
    - If subtype is \`views\` -> ONLY \`VIDEO\`.
    - If subtype is \`reach\` -> \`VIDEO\` or \`DISPLAY\`.
    - If subtype is \`subscriptions\` -> ONLY \`DEMAND_GEN\`.
  * For \`SALES\` & \`LEADS\`:
    - If goal is \`phone_leads\` -> \`SEARCH\`, \`SHOPPING\`, \`PERFORMANCE_MAX\`, \`DEMAND_GEN\`, \`VIDEO\`, \`DISPLAY\`.
    - If goal is \`get_directions\` -> \`SEARCH\`, \`SHOPPING\`, \`PERFORMANCE_MAX\`.
    - If goal is \`contacts\` -> \`PERFORMANCE_MAX\`.
  * For \`WEBSITE_TRAFFIC\`: \`SEARCH\`, \`PERFORMANCE_MAX\`, \`DEMAND_GEN\`, \`DISPLAY\`, \`SHOPPING\`, \`VIDEO\`.
  * For \`NO_GUIDANCE\`: \`PERFORMANCE_MAX\`, \`SEARCH\`, \`DISPLAY\`, \`DEMAND_GEN\`, \`SHOPPING\`.
- Provide a clear rationale explaining why this campaign type fits their specific goals.

Stage 5: **CAMPAIGN TYPE PROGRESSIVE DISCLOSURE (UNIVERSAL REUSABLE BEHAVIOR)**
- When \`campaignType\` is \`SEARCH\`:
  * Keywords: REQUIRED (at least 1 valid keyword). Generate 5-10 high-intent search keywords. Support [exact], "phrase", and plain broad match.
  * Responsive Search Ad: Minimum 3 unique headlines (<= 30 chars) and minimum 2 unique descriptions (<= 90 chars).
  * Search AI Max Controls: \`aiMax\`, \`textCustomization\`, \`finalUrlExpansion\`, \`brandInclusions\`, \`brandExclusions\`.
  * Bidding: \`Maximize conversions\`, \`Target CPA\`, \`Maximize conversion value\`, \`Target ROAS\`, \`Maximize Clicks\` (optional Max CPC limit), \`Target Impression Share\`.
  * Media: Search does NOT require landscape/square images or logos.

- When \`campaignType\` is \`PERFORMANCE_MAX\`:
  * Asset Group Essentials: Minimum 3 headlines (<= 30 chars), 1 long headline (<= 90 chars), 2 descriptions (<= 90 chars).
  * Creative Assets: Landscape marketing image (1.91:1), Square marketing image (1:1), Logo (1:1).
  * Bidding: \`Maximize conversions\`, \`Target CPA\`, \`Maximize conversion value\`, \`Target ROAS\`.

- When \`campaignType\` is \`DISPLAY\`:
  * Ad Copy: Minimum 1 headline (<= 30 chars) and 1 description (<= 90 chars).
  * Creative Assets: At least 1 marketing image and optional logo.
  * Bidding: \`Maximize conversions\`, \`Target CPA\`, \`Maximize conversion value\`, \`Target ROAS\`.

- When \`campaignType\` is \`DEMAND_GEN\`:
  * Ad Copy: Minimum 1 headline and 1 description.
  * Creative Assets: At least 1 image or video asset.
  * Bidding: \`Maximize conversions\`, \`Target CPA\`, \`Maximize conversion value\`, \`Target ROAS\`.

- When \`campaignType\` is \`VIDEO\`:
  * Ad Copy: Minimum 1 headline and 1 description.
  * Creative Assets: YouTube Video URL / video asset.
  * Bidding: \`Maximize conversions\`, \`Target CPA\`, \`Maximize conversion value\`, \`Target ROAS\`.

- When \`campaignType\` is \`APP\`:
  * Flow & Progressive Disclosure:
    - If user wants app installs or in-app actions: Recommend \`APP\` campaign under \`APP_PROMOTION\`.
    - Ask for platform: Android or iOS (\`platform: "ANDROID" | "IOS"\`).
    - Ask for the exact Mobile App package name (for Android, e.g. 'com.example.app') or bundle ID / app store ID (for iOS). Never invent or use a fake default package ID like 'com.hubmate.app'. If the user gives an app name, ask for or verify their real package name/ID.
    - Ask for Campaign Goal/Subtype: App installs (\`installs\`), App engagement (\`engagement\`), or Pre-registration (\`preregistration\`).
    - Ask for daily budget (never silently default to ₹1000).
    - Ask for Target CPA (Cost per install / target cost per action). Never silently default to ₹25.
    - Ask for ad copy / business name (at least 1 headline <= 30 chars, at least 1 description <= 90 chars).
  * App State Fields:
    - \`platform\`: 'ANDROID' | 'IOS'
    - \`appStore\`: 'GOOGLE_APP_STORE' | 'APPLE_APP_STORE'
    - \`appId\`: real package name or bundle ID
    - \`appName\`: user's mobile app name
    - \`biddingStrategy\`: 'Target CPA'
    - \`targetCpa\`: positive number in ₹
    - \`dailyBudget\`: positive number in ₹
    - \`businessName\`: business name
    - \`headlines\`: minimum 1 headline
    - \`descriptions\`: minimum 1 description
  * Validation Notice: If \`appId\` is missing, stop and request it: "Mobile App package name (Android) or bundle ID (iOS) is required before this App campaign can be published." Never silently fallback.

- When \`campaignType\` is \`SHOPPING\`:
  * Flow & Progressive Disclosure:
    - If user sells physical products online and wants sales: Recommend \`SHOPPING\` campaign.
    - Ask for Google Merchant Center ID (required: numeric ID, e.g. 5840531233). Do NOT ask all technical parameters immediately.
    - Ask for website / final URL if not already known.
    - Ask for daily budget (do not silently default).
    - Recommend an appropriate bidding strategy: \`Maximize conversion value\` (default for Shopping), \`Target ROAS\`, \`Maximize clicks\` (with optional max CPC limit), or \`Manual CPC\` (requires ad group bid).
    - Ask Target ROAS ONLY if the user chooses or confirms \`Target ROAS\`.
    - Ask product targeting / product groups only when necessary (default is "All products").
  * Shopping State Fields:
    - \`merchantCenterId\`: required numeric ID
    - \`salesCountry\`: country code (default 'IN')
    - \`feedLabel\`: feed label (default 'IN')
    - \`biddingStrategy\`: 'Maximize conversion value' | 'Target ROAS' | 'Maximize clicks' | 'Manual CPC'
    - \`targetRoas\`: number in % (only if Target ROAS selected)
    - \`maxCpcLimit\`: max CPC limit (optional, if Maximize clicks selected)
    - \`adGroupName\`: ad group name (e.g. 'Ad group 1')
    - \`adGroupBid\`: ad group CPC bid (required if Manual CPC selected)
    - \`productGroupFilter\`: 'Use all products' | 'Use a selection of products'
    - \`productGroupSelectBy\`: 'Product type' | 'Custom label' (if selection used)
    - \`campaignPriority\`: 'LOW' | 'MEDIUM' | 'HIGH'
    - \`customerAcquisitionMode\`: 'ALL_CUSTOMERS' | 'NEW_CUSTOMERS_ONLY'
    - \`localProducts\`: boolean (enable local inventory products)
    - \`finalUrl\`: valid landing page URL
    - \`headlines\`: minimum 1 headline
    - \`descriptions\`: minimum 1 description
  * Merchant Center Notice: If \`merchantCenterId\` is missing, state clearly: "Merchant Center ID is required before this Shopping campaign can be published." Never invent or assume a hardcoded Merchant Center ID.

Stage 6: **VALIDATION & REVIEW**
- Summarize the complete configuration, verify all required fields against Google Ads standards, and present the final plan for launch.

### "I DON'T KNOW" & UNCERTAINTY HANDLING:
- If the user says "I don't know", "recommend for me", or is unsure at any stage:
  * Do NOT ask more technical questions.
  * Recommend the single best option based on what is known so far, explain WHY simply, and provide actionable suggestion chips like ["Use Recommended Settings", "Show Other Options"].

### @ CAMPAIGN REFERENCE CONTEXT REUSE (CRITICAL FOR TOKEN & QUESTION MINIMIZATION):
- If the user references an existing campaign via "@[Campaign Name]" or if \`currentState\` already has fields pre-filled from an existing referenced campaign (e.g. \`businessName\`, \`website\`, \`locations\`, \`language\`, \`dailyBudget\`, \`keywords\`, \`headlines\`, \`descriptions\`, \`images\`, \`logos\`, \`biddingStrategy\`):
  1. **DO NOT ask redundant questions** for information that is already provided or inherited from the referenced campaign (e.g. do NOT ask "What is your business name?", "What is your website URL?", "What is your target location?").
  2. **Acknowledge the referenced campaign context**: Warmly state that you've imported the business profile, locations, assets, and parameters from the referenced campaign.
  3. **Focus ONLY on what is missing or changed**: Ask ONLY about the specific goal or changes needed for this new campaign (e.g. new campaign objective, adjusted budget, or new product focus).
  4. **Preserve existing high-quality assets**: Inherit and retain headlines, descriptions, keywords, images, and logos from the reference context, making only relevant adaptations if requested.

### MULTILINGUAL & MULTI-LANGUAGE SUPPORT (CRITICAL):
- **DYNAMIC LANGUAGE ADAPTATION**: You MUST automatically detect the language of the user's input prompt (e.g. Hindi, Marathi, Gujarati, Spanish, French, German, Bengali, Tamil, Telugu, Kannada, Urdu, Arabic, Japanese, or any other language) or use the configured campaign language (\`currentState.language\`).
- **CONVERSATIONAL REPLIES IN USER'S LANGUAGE**: If the user writes in a language other than English (e.g. Hindi "मुझे कपड़े बेचने के लिए कैंपेन बनाना है", Marathi "मला पुण्यात दुकानाची जाहिरात करायची आहे", Spanish, etc.), your response \`message\` and suggestion chips MUST be written naturally in that SAME language or script (supporting native Devanagari/scripts as well as Romanized text like Hinglish/Marathlish if the user typed Roman script).
- **CREATIVE AD ASSETS IN TARGET / INPUT LANGUAGE**:
  * When generating or suggesting **Headlines**, **Long Headlines**, **Descriptions**, and **Keywords**, generate them in the USER'S INPUT LANGUAGE (or specified target language).
  * For example, if user asks in Hindi/Marathi/Gujarati/etc., generate headlines, long headlines, descriptions, and keywords in that language (or matching the user's linguistic style/script), ensuring character limits (Headlines <= 30 chars, Long Headlines <= 90 chars, Descriptions <= 90 chars) are respected in that language.
- **LANGUAGE PARAMETER SYNCHRONIZATION**: Set \`campaignState.language\` to the corresponding language name (e.g. "Hindi", "Marathi", "Gujarati", "Spanish", "French", "German", "English", etc.) matching the user's primary language.

### STRICT DATA ACCURACY & SYNCHRONIZATION RULES:
1. **NO SILENT DEFAULT VALUES FOR CORE FIELDS (BUSINESS NAME, BUDGET, CAMPAIGN NAME)**:
   - **Business Name (\`businessName\`)**: NEVER invent or use a default like "My Business" or "Commercial Business". If the user has not provided their business/shop name, leave \`businessName: ""\` and ask the user directly: "What is your business or shop name?".
   - **Daily Budget (\`dailyBudget\`)**: NEVER silently default to ₹1,000, ₹500, or any hardcoded number. If the user has not specified a budget yet, leave \`dailyBudget: null\` and ask the user directly: "What daily budget would you like to allocate for this campaign?".
   - **Campaign Name (\`campaignName\`)**: Format campaign name strictly using the user's real business name and chosen campaign type: \`[Business_Name] - [CampaignType]\`. If the business name is not yet provided, leave \`campaignName: ""\` until the business name is known.
   - **Website / Final URL (\`website\`)**: If missing, ask the user for their official website or landing page URL.
2. **OBJECTIVE INTEGRITY**:
   - NEVER assume or default \`objective\` to \`LEADS\`.
   - If user only supplied business name: \`objective: ""\` (empty string).
   - If user provides a goal, intelligently match to one of the 7 CRM objectives (\`SALES\`, \`LEADS\`, \`WEBSITE_TRAFFIC\`, \`APP_PROMOTION\`, \`AWARENESS\`, \`LOCAL\`, \`NO_GUIDANCE\`).
   - Preserve existing \`currentState.objective\` if valid, unless user explicitly changes it.
3. **BUDGET SYNCHRONIZATION**:
   - When the user mentions a daily budget in natural language (e.g. "my budget is 5600 per day", "7000 daily", "Rs 5000", "500/day"), extract and set \`campaignState.dailyBudget\` as an integer (e.g. 5600, 7000, 5000, 500).
   - If the user changes their budget later in the conversation, immediately update \`campaignState.dailyBudget\` to the new number.
   - If the user has not mentioned a budget yet, leave \`dailyBudget\` as null. NEVER output 0.
4. **IMAGE & ASSET VERIFICATION (NEVER FABRICATE ASSETS)**:
   - If the user claims "I attached images" or "I uploaded logos", but \`campaignState.images\` is empty (\`[]\`), DO NOT pretend images are present. Politely remind them to click the **Upload Media** or **Attach Images** button to attach real creative images.
   - Do NOT invent fake or placeholder URLs for images or logos in \`campaignState.images\` or \`campaignState.logos\`.
5. **LOCATION & RADIUS TARGETING INTEGRITY**:
   - Only set \`locations\` and \`language\` if specified by the user or detected from their website content / \`currentState\`.
   - **Supports both Standard Locations and Radius Targeting**:
     * Standard: City, State, Country, Postal PIN codes (e.g. \`["India"]\`, \`["Mumbai, Maharashtra, India"]\`, \`["411038"]\`).
     * Radius: Custom distance around a place or landmark in km or mi (e.g. \`["20 km around Pune"]\`, \`["15 mi around New Delhi"]\`, \`["25 km around Bhor"]\`).
   - If user asks for local store radius (e.g. "target 10 km around my store in Pune"), format as \`"[distance] [km/mi] around [Location]"\`.
   - If the user communicates in a non-English language, set \`language\` to that language (e.g., "Hindi", "Marathi", "Gujarati", "Spanish", "German").
6. **STRICT ASSET GENERATION PREREQUISITE FLOW (NEVER GENERATE COPY/CREATIVES BEFORE PREREQUISITES ARE SET)**:
   - **CRITICAL ORDER OF OPERATIONS**:
     1. **Step 1: Website & Business URL**: If the website URL is not yet provided (\`website: ""\`), DO NOT generate headlines, long headlines, descriptions, images, or logos yet. Stop and ask the user for their official website or landing page URL first so that ad copy can be grounded in verified business content.
     2. **Step 2: Campaign Objective & Campaign Type**: If the website is already present but the \`objective\` or \`campaignType\` is not yet selected/configured, DO NOT generate copy or creative assets yet. Instead, analyze the business/website and suggest the ideal objective and compatible campaign types (e.g. Search, Shopping, Performance Max, Demand Gen), asking the user to confirm their preferred campaign strategy.
     3. **Step 3: Copy & Asset Generation**: ONLY AFTER the website URL, objective, and campaign type are properly set/known, proceed to generate tailored ad copy (3-5 Headlines <= 30 chars, 1-2 Long Headlines <= 90 chars, 2-4 Descriptions <= 90 chars, 5-10 Keywords) tailored specifically to that campaign type.
   - When prerequisites are fully satisfied and user asks to generate ad copy or assets:
     * **HEADLINES (REQUIRED: MINIMUM 3 TO 5 DISTINCT HEADLINES)**: You MUST generate at least 3 to 5 unique, punchy headlines in the user's conversation language. NEVER generate only 1 headline. Each headline must be <= 30 characters.
     * **LONG HEADLINES (REQUIRED: MINIMUM 1 TO 2 LONG HEADLINES)**: You MUST generate at least 1 to 2 long headlines in the user's conversation language. Each long headline must be <= 90 characters.
     * **DESCRIPTIONS (REQUIRED: MINIMUM 2 TO 4 DISTINCT DESCRIPTIONS)**: You MUST generate at least 2 to 4 distinct descriptions in the user's conversation language. NEVER generate only 1 description. Each description must be <= 90 characters.
     * **KEYWORDS (REQUIRED: MINIMUM 5 TO 10 KEYWORDS)**: If campaign type is Search or includes keywords, generate 5 to 10 high purchase-intent keywords in the user's language/script.

### BUDGET ACCOUNTING & DATE PACING RULES (DAILY BUDGET VS LIFETIME TOTAL BUDGET):
Google Ads supports two budget types with precise accounting and scheduling rules:
1. **DAILY BUDGET (\`budgetType: "DAILY"\`)**:
   - The budget specifies the average spend **per day** (e.g., ₹500/day, ₹1,000/day, ₹2,500/day).
   - **Start Date (\`startDate\`)**: Required (defaults to today or specified future date).
   - **End Date (\`endDate\`)**: **Optional** (can run continuously without an end date, or stop on a specified date).
   - **Smart Auto-Suggestions to Provide**: Suggest budget amounts and duration options like ["Daily: ₹1,000/day", "Daily: ₹2,500/day", "Run Continuously (No End Date)", "Set 30-Day Duration"].

2. **LIFETIME / TOTAL BUDGET (\`budgetType: "TOTAL"\`)**:
   - The budget specifies the **total amount** to spend across the entire campaign duration (e.g., ₹15,000 total budget for 15 days).
   - **Start Date (\`startDate\`)**: **Required**.
   - **End Date (\`endDate\`)**: **Mandatory (Required)**. Google Ads API requires a fixed end date to calculate daily spend pacing (\`Estimated Daily Pacing = Total Budget ÷ Number of Days\`).
   - If the user selects a Total Budget without an end date, you MUST proactively ask them: *"For a Total/Lifetime budget, Google Ads requires a Start and End Date to pace your spending evenly. How many days would you like this campaign to run or what is your target end date?"*
   - **Smart Auto-Suggestions to Provide**: Suggest duration options like ["Run for 7 Days", "Run for 14 Days", "Run for 30 Days", "Switch to Daily Budget"].

### PROACTIVE QUESTIONING & DYNAMIC CONTEXTUAL AUTO-SUGGESTIONS:
- Whenever key campaign elements are missing or needed, actively ask the user in simple, conversational language and provide **3 to 5 highly relevant, actionable suggestion chips** in the \`suggestions\` array:
  * If goal is missing: \`suggestions: ["I want more Leads & Phone Calls", "I want Online Sales", "I want Website Traffic", "I want App Downloads"]\`
  * If budget is missing: \`suggestions: ["Daily: ₹1,000/day", "Daily: ₹2,500/day", "Total: ₹15,000 (15 Days)", "Run Continuously (No End Date)"]\`
  * If dates are requested: \`suggestions: ["Start Immediately", "Run for 14 Days", "Run for 30 Days", "No End Date (Ongoing)"]\`
  * If copy/keywords are needed: \`suggestions: ["Generate Headlines & Descriptions", "Generate 10 High-Intent Keywords", "Upload Media Creatives", "Review & Launch"]\`

### OUTPUT JSON SCHEMA:
You MUST reply strictly with valid, parseable JSON matching this schema:
{
  "message": "Conversational markdown response explaining your recommendation clearly and explaining WHY, asking clarifying questions if needed, and stating what is next.",
  "suggestions": ["Daily: ₹1,000/day", "Total: ₹15,000 (15 Days)", "Run Continuously", "Generate Ad Copy"],
  "campaignState": {
    "business": {
      "name": "string",
      "type": "string",
      "description": "string",
      "website": "string",
      "hasApp": boolean,
      "physicalLocation": boolean,
      "ecommerceFeed": boolean
    },
    "desiredOutcome": "string",
    "objective": "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "APP_PROMOTION" | "AWARENESS" | "LOCAL" | "NO_GUIDANCE" | "",
    "conversionGoals": ["string"],
    "campaignType": "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "VIDEO" | "DEMAND_GEN" | "SHOPPING" | "APP" | "",
    "recommendationReason": "string",
    "campaignName": "string",
    "businessName": "string",
    "website": "string",
    "budgetType": "DAILY" | "TOTAL",
    "dailyBudget": number | null,
    "locations": ["string"],
    "language": "string",
    "biddingStrategy": "Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS" | string,
    "targetCpa": number | null,
    "targetRoas": number | null,
    "keywords": ["string"],
    "headlines": ["string"],
    "descriptions": ["string"],
    "longHeadlines": ["string"],
    "images": ["string"],
    "logos": ["string"],
    "videos": ["string"],
    "appId": "string",
    "appStore": "GOOGLE_APP_STORE" | "APPLE_APP_STORE",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}

Current State from Frontend:
${JSON.stringify(promptState, null, 2)}
`;

    try {
      console.log("[AI-GUIDED] AI reasoning started. Total input messages:", messages.length);
      const compactedMessages = this.compactMessagesForPrompt(messages);
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...compactedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const candidateModels = [
        "groq/compound",
        "groq/compound-mini",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-120b"
      ];

      const groqKeys = this.getGroqKeys();
      const numKeys = groqKeys.length;
      let rawContent = "";
      let successfulModel = "";
      let lastErr: any = null;

      for (let kOffset = 0; kOffset < numKeys; kOffset++) {
        const keyIdx = (this.activeKeyIndex + kOffset) % numKeys;
        const currentKey = groqKeys[keyIdx];
        if (!currentKey) continue;

        for (const model of candidateModels) {
          try {
            const response = await axios.post(
              GROQ_API_URL,
              {
                model,
                messages: apiMessages,
                temperature: 0.1,
                max_tokens: 1000,
                response_format: { type: "json_object" }
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${currentKey}`
                },
                timeout: 15000
              }
            );

            rawContent = response.data?.choices?.[0]?.message?.content || "{}";
            if (rawContent && rawContent.trim().startsWith("{")) {
              successfulModel = model;
              this.activeKeyIndex = keyIdx;
              console.log(`[AI-GUIDED] Reasoning succeeded using Groq Key #${keyIdx + 1} and model: ${successfulModel}`);
              break;
            }
          } catch (mErr: any) {
            lastErr = mErr;
            const errMsg = mErr?.response?.data?.error?.message || mErr.message || "";
            const status = mErr?.response?.status;
            console.warn(`[AI-GUIDED] Key #${keyIdx + 1} with Model ${model} failed (${errMsg})`);

            const isRateLimit = status === 429 ||
              errMsg.toLowerCase().includes("tokens per minute") ||
              errMsg.toLowerCase().includes("tpm") ||
              errMsg.toLowerCase().includes("rpm") ||
              errMsg.toLowerCase().includes("rate limit") ||
              errMsg.toLowerCase().includes("quota") ||
              errMsg.toLowerCase().includes("request too large");

            if (isRateLimit) {
              console.warn(`[AI-GUIDED] Key #${keyIdx + 1} hit rate limit or token quota. Rotating to next Groq key...`);
              break; // Switch to next key immediately
            }
          }
        }

        if (rawContent && rawContent.trim().startsWith("{")) {
          break; // Successfully got JSON response
        }
      }

      if (!rawContent || !rawContent.trim().startsWith("{")) {
        console.error(`[AI-GUIDED] All AI candidate models and Groq keys failed. Last failure reason:`, lastErr?.response?.data || lastErr?.message);
        throw lastErr || new Error("Failed to get JSON response from Groq models across all configured keys");
      }
      const parsed = JSON.parse(rawContent);

      // Deep merge current state and parsed state
      const parsedState = parsed.campaignState || {};

      // Sanitize business name / description
      const rawBizName = parsedState.business?.name || parsedState.businessName || currentState.businessName || currentState.business?.name || "";
      const cleanBizName = this.isPlaceholderOrFabrication(rawBizName) ? "" : rawBizName.trim();

      const rawBizDesc = parsedState.business?.description || currentState.business?.description || "";
      const cleanBizDesc = this.isPlaceholderOrFabrication(rawBizDesc) ? "" : rawBizDesc.trim();

      const rawWebsite = parsedState.website || parsedState.business?.website || currentState.website || currentState.business?.website || "";
      const cleanWebsite = this.isPlaceholderOrFabrication(rawWebsite) ? "" : rawWebsite.trim();

      // Check if user explicitly asked to generate copy/assets in conversation
      const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content?.toLowerCase() || "";
      const userAskedForGen = lastUserMsg.includes("generate") || lastUserMsg.includes("create") || lastUserMsg.includes("headline") || lastUserMsg.includes("leadline") || lastUserMsg.includes("description") || lastUserMsg.includes("suggest") || lastUserMsg.includes("website") || lastUserMsg.includes("all required");
      const userConfirmedSettings = lastUserMsg.includes("use recommended") || lastUserMsg.includes("accept") || lastUserMsg.includes("confirm");

      // Helper to normalize any date input (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD) to ISO YYYY-MM-DD
      const normalizeDateString = (dStr?: string): string | undefined => {
        if (!dStr || typeof dStr !== "string") return undefined;
        const trimmed = dStr.trim();
        const parts = trimmed.split(/[-\/\.]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
          }
          if (parts[2].length === 4) {
            // DD-MM-YYYY or MM-DD-YYYY -> DD-MM-YYYY standard in India / EU
            return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
          }
        }
        return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
      };

      // Extract explicit budget & budget type if stated in natural language in last user message
      let explicitBudget: number | null = null;
      let explicitBudgetType: "DAILY" | "TOTAL" | undefined = undefined;

      if (
        lastUserMsg.includes("total budget") ||
        lastUserMsg.includes("lifetime") ||
        lastUserMsg.includes("campaign total") ||
        lastUserMsg.includes("campaign budget") ||
        lastUserMsg.includes("campain budget") ||
        lastUserMsg.includes("set campaign budget")
      ) {
        explicitBudgetType = "TOTAL";
      } else if (
        lastUserMsg.includes("daily") ||
        lastUserMsg.includes("per day") ||
        lastUserMsg.includes("/day") ||
        lastUserMsg.includes("set daily budget") ||
        lastUserMsg.includes("dailay")
      ) {
        explicitBudgetType = "DAILY";
      }

      const budgetMatch = lastUserMsg.match(/(?:budget|spend|cost)\s*(?:is|of|to)?\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/i) ||
                          lastUserMsg.match(/(?:rs\.?|₹|inr)\s*(\d[\d,]*)\s*(?:per day|daily|\/day|total)?/i) ||
                          lastUserMsg.match(/(\d[\d,]*)\s*(?:per day|daily|\/day|total)/i);
      if (budgetMatch && budgetMatch[1]) {
        const parsedNum = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          explicitBudget = parsedNum;
        }
      }

      // Extract explicit dates & duration if stated in natural language in last user message
      let explicitStartDate: string | undefined = undefined;
      let explicitEndDate: string | undefined = undefined;
      const startDateMatch = lastUserMsg.match(/start\s*(?:date)?\s*(?:is|:)?\s*(\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4})/i);
      if (startDateMatch && startDateMatch[1]) {
        explicitStartDate = normalizeDateString(startDateMatch[1]);
      }
      const endDateMatch = lastUserMsg.match(/end\s*(?:date)?\s*(?:is|:)?\s*(\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4})/i);
      if (endDateMatch && endDateMatch[1]) {
        explicitEndDate = normalizeDateString(endDateMatch[1]);
      }

      const durationMatch = lastUserMsg.match(/for\s*(\d+)\s*(?:days|day)/i);
      if (durationMatch && durationMatch[1] && !explicitEndDate) {
        const days = parseInt(durationMatch[1], 10);
        if (days > 0) {
          const baseDate = new Date(explicitStartDate || currentState.startDate || new Date().toISOString().split("T")[0]);
          baseDate.setDate(baseDate.getDate() + days);
          explicitEndDate = baseDate.toISOString().split("T")[0];
        }
      }

      if (lastUserMsg.includes("no end date") || lastUserMsg.includes("ongoing") || lastUserMsg.includes("continuously") || lastUserMsg.includes("indefinite")) {
        explicitEndDate = undefined;
      }

      const resolvedBudgetType = explicitBudgetType || parsedState.budgetType || currentState.budgetType || "DAILY";

      // Regex fallback for business name and website if LLM omitted them
      const bizNameMatch = lastUserMsg.match(/(?:shop|business|company|store|brand)\s*(?:name)?\s*(?:is|:)?\s*["']([^"']+)["']/i);
      const extractedBizName = bizNameMatch ? bizNameMatch[1].trim() : "";

      const websiteMatch = lastUserMsg.match(/(?:website|url|site)\s*(?:is|:)?\s*["']?(https?:\/\/[^\s"']+)["']?/i);
      const extractedWebsite = websiteMatch ? websiteMatch[1].trim() : "";

      const resolvedBizName = cleanBizName || extractedBizName || currentState.businessName || currentState.business?.name || "";
      const resolvedWebsite = cleanWebsite || extractedWebsite || currentState.website || currentState.business?.website || "";

      // Regex fallback for campaign objective and type if explicitly requested
      let resolvedObjective = parsedState.objective || currentState.objective || "";
      let resolvedCampaignType = parsedState.campaignType || currentState.campaignType || "";

      if (lastUserMsg.includes("performance max") || lastUserMsg.includes("pmax")) {
        resolvedCampaignType = "PERFORMANCE_MAX";
      } else if (lastUserMsg.includes("search")) {
        resolvedCampaignType = "SEARCH";
      }

      if (lastUserMsg.includes("in sales") || lastUserMsg.includes("for sales") || lastUserMsg.includes("objective is sales") || lastUserMsg.includes("objective sales")) {
        resolvedObjective = "SALES";
      } else if (lastUserMsg.includes("in leads") || lastUserMsg.includes("for leads") || lastUserMsg.includes("objective is leads")) {
        resolvedObjective = "LEADS";
      }

      const cleanLocations = (parsedState.locations && parsedState.locations.length > 0)
        ? this.sanitizeArray(parsedState.locations)
        : (currentState.locations && currentState.locations.length > 0 ? currentState.locations : ["India"]);

      // Check if user requested copy/assets or if parsedState contains generated items
      const hasKeywordsInParsed = Array.isArray(parsedState.keywords) && parsedState.keywords.length > 0;
      const hasHeadlinesInParsed = Array.isArray(parsedState.headlines) && parsedState.headlines.length > 0;
      const hasDescriptionsInParsed = Array.isArray(parsedState.descriptions) && parsedState.descriptions.length > 0;
      const hasLongHeadlinesInParsed = Array.isArray(parsedState.longHeadlines) && parsedState.longHeadlines.length > 0;

      let cleanKeywords = (hasKeywordsInParsed || userAskedForGen || userConfirmedSettings)
        ? this.sanitizeArray(hasKeywordsInParsed ? parsedState.keywords : (currentState.keywords || []), 80)
        : this.sanitizeArray(currentState.keywords, 80);

      let cleanHeadlines = (hasHeadlinesInParsed || userAskedForGen || userConfirmedSettings)
        ? this.sanitizeArray(hasHeadlinesInParsed ? parsedState.headlines : (currentState.headlines || []), 30)
        : this.sanitizeArray(currentState.headlines, 30);

      let cleanDescriptions = (hasDescriptionsInParsed || userAskedForGen || userConfirmedSettings)
        ? this.sanitizeArray(hasDescriptionsInParsed ? parsedState.descriptions : (currentState.descriptions || []), 90)
        : this.sanitizeArray(currentState.descriptions, 90);

      let cleanLongHeadlines = (hasLongHeadlinesInParsed || userAskedForGen || userConfirmedSettings)
        ? this.sanitizeArray(hasLongHeadlinesInParsed ? parsedState.longHeadlines : (currentState.longHeadlines || []), 90)
        : this.sanitizeArray(currentState.longHeadlines, 90);

      // User confirmed values vs recommendation values
      const resolvedBiddingStrategy = parsedState.biddingStrategy || currentState.biddingStrategy || "";
      const resolvedLanguage = parsedState.language || currentState.language || "English";
      const resolvedTargetCpa = explicitBudget !== null ? null : (parsedState.targetCpa ?? currentState.targetCpa ?? null);
      const resolvedTargetRoas = parsedState.targetRoas ?? currentState.targetRoas ?? null;
      const resolvedDailyBudget = explicitBudget !== null
        ? explicitBudget
        : (parsedState.dailyBudget ?? currentState.dailyBudget ?? null);

      // Contextual Campaign Name Formulation: [Business_Name] or [Business_Name] - [CampaignType]
      let derivedCampaignName = "";
      if (resolvedBizName) {
        const underscoredBiz = resolvedBizName.replace(/\s+/g, "_");
        const activeType = resolvedCampaignType || parsedState.campaignType;
        if (activeType) {
          const formattedType = activeType
            .split("_")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          derivedCampaignName = `${underscoredBiz} - ${formattedType}`;
        } else {
          derivedCampaignName = underscoredBiz;
        }
      }

      const cleanCampaignName = currentState.campaignName || (
        parsedState.campaignName && !this.isPlaceholderOrFabrication(parsedState.campaignName)
          ? parsedState.campaignName.trim()
          : derivedCampaignName
      );

      const resolvedStartDate = explicitStartDate || normalizeDateString(parsedState.startDate) || currentState.startDate || new Date().toISOString().split("T")[0];
      const resolvedEndDate = explicitEndDate || normalizeDateString(parsedState.endDate) || currentState.endDate || undefined;

      // Check if user also asked to generate images/logo in prompt
      let generatedCreativesList: GeneratedCreativeImage[] = [];
      let mergedImages = currentState.images || [];
      let mergedLogos = currentState.logos || [];

      const resolvedTypeUpper = ((resolvedCampaignType as any) || parsedState.campaignType || currentState.campaignType || "").toUpperCase();
      const isVisualType = ["DEMAND_GEN", "PERFORMANCE_MAX", "DISPLAY", "VIDEO"].includes(resolvedTypeUpper);
      const userAskedForImages = lastUserMsg.includes("generate image") || lastUserMsg.includes("generate images") ||
                                 lastUserMsg.includes("generate logo") || lastUserMsg.includes("create image") ||
                                 lastUserMsg.includes("create logo") || lastUserMsg.includes("generate and auto fill") ||
                                 lastUserMsg.includes("generate creatives") || (lastUserMsg.includes("image") && lastUserMsg.includes("logo")) ||
                                 lastUserMsg.includes("@") || (isVisualType && (mergedImages.length === 0 || mergedLogos.length === 0));

      if (userAskedForImages && (resolvedBizName || resolvedWebsite)) {
        try {
          console.log(`[AI-GUIDED] Generating ad visuals for business: "${resolvedBizName}" (${resolvedTypeUpper || "CAMPAIGN"})`);
          const tempStateForImg: CampaignState = {
            ...currentState,
            campaignType: (resolvedTypeUpper as any) || currentState.campaignType,
            businessName: resolvedBizName,
            website: resolvedWebsite,
            business: {
              name: resolvedBizName,
              website: resolvedWebsite,
              description: cleanBizDesc || `${resolvedBizName} products and services`
            }
          };
          const imgGenRes = await GoogleAdsImageGenService.generateAdImages(lastUserMsg || `Professional ad images and logo for ${resolvedBizName}`, tempStateForImg);
          if (imgGenRes && imgGenRes.generatedImages && imgGenRes.generatedImages.length > 0) {
            generatedCreativesList = imgGenRes.generatedImages;
            mergedImages = imgGenRes.campaignState.images || [];
            mergedLogos = imgGenRes.campaignState.logos || [];
          }
        } catch (imgErr: any) {
          console.warn("[AI-GUIDED] Integrated visual asset generation warning:", imgErr?.message || imgErr);
        }
      }

      const mergedState: CampaignState = {
        ...currentState,
        ...parsedState,
        business: {
          ...(currentState.business || {}),
          ...(parsedState.business || {}),
          name: resolvedBizName,
          description: cleanBizDesc,
          website: resolvedWebsite
        },
        businessName: resolvedBizName,
        campaignName: cleanCampaignName,
        website: resolvedWebsite,
        objective: (resolvedObjective as any) || parsedState.objective || currentState.objective || "",
        campaignType: (resolvedCampaignType as any) || parsedState.campaignType || currentState.campaignType || "",
        conversionGoals: parsedState.conversionGoals || currentState.conversionGoals || (resolvedObjective === "SALES" ? ["phone_leads", "contacts"] : []),
        locations: cleanLocations,
        language: resolvedLanguage,
        biddingStrategy: resolvedBiddingStrategy,
        targetCpa: resolvedTargetCpa,
        targetRoas: resolvedTargetRoas,
        budgetType: resolvedBudgetType,
        dailyBudget: resolvedDailyBudget,
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
        keywords: cleanKeywords,
        headlines: cleanHeadlines,
        descriptions: cleanDescriptions,
        longHeadlines: cleanLongHeadlines,
        images: mergedImages,
        logos: mergedLogos,
        videos: currentState.videos || [],
        // App-specific properties preservation
        appId: parsedState.appId || currentState.appId || undefined,
        appName: parsedState.appName || currentState.appName || undefined,
        platform: parsedState.platform || currentState.platform || (parsedState.appStore === "APPLE_APP_STORE" ? "IOS" : (currentState.platform || "ANDROID")),
        appStore: parsedState.appStore || currentState.appStore || (parsedState.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE"),
        // Shopping-specific properties preservation
        merchantCenterId: parsedState.merchantCenterId || currentState.merchantCenterId || undefined,
        salesCountry: parsedState.salesCountry || currentState.salesCountry || undefined,
        feedLabel: parsedState.feedLabel || currentState.feedLabel || undefined,
        maxCpcLimit: parsedState.maxCpcLimit !== undefined ? parsedState.maxCpcLimit : (currentState.maxCpcLimit ?? null),
        adGroupName: parsedState.adGroupName || currentState.adGroupName || undefined,
        adGroupBid: parsedState.adGroupBid !== undefined ? parsedState.adGroupBid : (currentState.adGroupBid ?? null),
        campaignPriority: parsedState.campaignPriority || currentState.campaignPriority || undefined,
        customerAcquisitionMode: parsedState.customerAcquisitionMode || currentState.customerAcquisitionMode || undefined,
        localProducts: parsedState.localProducts !== undefined ? parsedState.localProducts : currentState.localProducts,
        enableLocalProducts: parsedState.enableLocalProducts !== undefined ? parsedState.enableLocalProducts : currentState.enableLocalProducts,
        productGroupFilter: parsedState.productGroupFilter || currentState.productGroupFilter || undefined,
        productGroupSelectBy: parsedState.productGroupSelectBy || currentState.productGroupSelectBy || undefined,
        productGroupCustomLabel: parsedState.productGroupCustomLabel || currentState.productGroupCustomLabel || undefined,
        trackingTemplate: parsedState.trackingTemplate || currentState.trackingTemplate || undefined,
        finalUrlSuffix: parsedState.finalUrlSuffix || currentState.finalUrlSuffix || undefined,
        euPolitical: parsedState.euPolitical || currentState.euPolitical || undefined
      };

      // ── ENFORCE 100% COMPATIBILITY WITH MANUAL CREATION (SOURCE OF TRUTH) ──
      const reconciledMergedState = reconcileCampaignStateBackend(mergedState);

      // ── DYNAMIC STAGE DETERMINATION ──
      const hasBusiness = !!(reconciledMergedState.business?.name || reconciledMergedState.business?.type || reconciledMergedState.businessName);
      const hasOutcome = !!reconciledMergedState.desiredOutcome;
      const hasObjective = !!reconciledMergedState.objective;
      const hasGoals = Array.isArray(reconciledMergedState.conversionGoals) && reconciledMergedState.conversionGoals.length > 0;
      const hasCampaignType = !!reconciledMergedState.campaignType;

      let strategicStage: CampaignStage = "collecting_business";

      if (!hasBusiness && !hasOutcome && !hasObjective && !hasCampaignType) {
        strategicStage = "collecting_business";
      } else if (!hasObjective) {
        strategicStage = "recommending_objective";
      } else if (!hasGoals) {
        strategicStage = "recommending_conversion_goals";
      } else if (!hasCampaignType) {
        strategicStage = "recommending_campaign_type";
      } else {
        strategicStage = "collecting_campaign_data";
      }

      // ── VALIDATION EVALUATION ──
      let missingFields: string[] = [];
      let validationErrors: ValidationError[] = [];
      let isReadyForPublish = false;
      let isReadyForReview = false;

      if (hasCampaignType) {
        const valResult = GoogleAdsCampaignValidator.validate(reconciledMergedState);
        missingFields = valResult.missingSummary;
        validationErrors = valResult.errors;
        isReadyForPublish = valResult.isValid;

        const hasMinFields = (!!reconciledMergedState.businessName || !!reconciledMergedState.business?.name) &&
                             (!!reconciledMergedState.website || reconciledMergedState.campaignType === "APP" || !!reconciledMergedState.appId);
        isReadyForReview = hasMinFields;

        if (isReadyForPublish) {
          strategicStage = "ready_for_publish";
        } else if (validationErrors.some(e => e.type === "ASSET")) {
          strategicStage = "collecting_assets";
        } else if (isReadyForReview) {
          strategicStage = "missing_requirements";
        } else {
          strategicStage = "collecting_campaign_data";
        }
      }

      const updatedState: CampaignState = {
        ...reconciledMergedState,
        readyForReview: isReadyForReview,
        readyForPublish: isReadyForPublish,
        stage: strategicStage
      };

      console.log("[AI-GUIDED] final merged campaignState:", {
        businessName: updatedState.businessName,
        website: updatedState.website,
        objective: updatedState.objective,
        campaignType: updatedState.campaignType,
        dailyBudget: updatedState.dailyBudget,
        conversionGoals: updatedState.conversionGoals,
        headlinesCount: updatedState.headlines?.length || 0,
        descriptionsCount: updatedState.descriptions?.length || 0
      });

      // Context-aware dynamic suggestions
      let computedSuggestions: string[] = [];
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        computedSuggestions = parsed.suggestions;
      } else if (!updatedState.objective) {
        computedSuggestions = ["I want more Leads & Phone Calls", "I want Online Sales", "I want Website Traffic", "I want App Downloads"];
      } else if (!updatedState.dailyBudget) {
        computedSuggestions = ["Daily: ₹1,000/day", "Daily: ₹2,500/day", "Total: ₹15,000 (15 Days)", "Run Continuously (No End Date)"];
      } else if (updatedState.budgetType === "TOTAL" && !updatedState.endDate) {
        computedSuggestions = ["Run for 7 Days", "Run for 14 Days", "Run for 30 Days", "Switch to Daily Budget"];
      } else if (!updatedState.headlines || updatedState.headlines.length < 3) {
        computedSuggestions = ["Generate Headlines & Copy", "Generate 10 High-Intent Keywords", "Upload Media Creatives", "Review Settings"];
      } else {
        computedSuggestions = ["Confirm & Review Campaign", "Adjust Daily Budget", "Change Target Locations", "Show Other Options"];
      }

      return {
        message: parsed.message || "I've updated your campaign configuration based on your input.",
        suggestions: computedSuggestions,
        campaignState: updatedState,
        generatedImages: generatedCreativesList.length > 0 ? generatedCreativesList : undefined,
        missingFields,
        validationErrors,
        readyForReview: isReadyForReview,
        readyForPublish: isReadyForPublish,
        stage: strategicStage,
        explanation: parsed.explanation
      };
    } catch (error: any) {
      console.error("[GoogleAdsAiAssistantService Error]:", error?.response?.data || error.message);

      // Intelligent deterministic fallback based on user input intent
      const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content?.toLowerCase() || "";
      let resolvedObjective = currentState.objective || "";
      let resolvedCampaignType = currentState.campaignType || "";
      let resolvedGoals = currentState.conversionGoals || [];
      let fallbackMessage = "";

      if (lastUserMsg.includes("lead") || lastUserMsg.includes("call") || lastUserMsg.includes("enquiry")) {
        resolvedObjective = "LEADS";
        resolvedCampaignType = "SEARCH";
        resolvedGoals = ["phone_leads", "contacts"];
        fallbackMessage = "Based on your goal to get **more leads and phone inquiries**, I recommend a **Search Campaign** targeting high-intent customers actively searching for your services.\n\n### Recommended Strategy:\n- **Objective:** Leads\n- **Campaign Type:** Search\n- **Conversion Goals:** Phone call leads & Contact form enquiries\n- **Target Location:** India\n\nWould you like to provide your website URL or tell me your budget?";
      } else if (lastUserMsg.includes("sale") || lastUserMsg.includes("product") || lastUserMsg.includes("ecommerce") || lastUserMsg.includes("buy")) {
        resolvedObjective = "SALES";
        resolvedCampaignType = "PERFORMANCE_MAX";
        resolvedGoals = ["website_purchases"];
        fallbackMessage = "To maximize **online sales and customer conversions**, I recommend **Performance Max** to reach buyers across Search, YouTube, Gmail, and Google Maps with AI optimization.\n\n### Recommended Strategy:\n- **Objective:** Sales\n- **Campaign Type:** Performance Max\n- **Conversion Goals:** Online Purchases\n- **Target Location:** India\n\nPlease share your website URL or upload your product images to proceed.";
      } else if (lastUserMsg.includes("visitor") || lastUserMsg.includes("traffic") || lastUserMsg.includes("website")) {
        resolvedObjective = "WEBSITE_TRAFFIC";
        resolvedCampaignType = "SEARCH";
        resolvedGoals = ["contacts"];
        fallbackMessage = "To drive **high-quality website traffic**, a **Search Campaign** is best to capture users searching for topics relevant to your business.\n\n### Recommended Strategy:\n- **Objective:** Website Traffic\n- **Campaign Type:** Search\n- **Target Location:** India\n\nWhat is your website URL?";
      } else {
        resolvedObjective = currentState.objective || "LEADS";
        resolvedCampaignType = currentState.campaignType || "SEARCH";
        resolvedGoals = currentState.conversionGoals?.length ? currentState.conversionGoals : ["phone_leads"];
        fallbackMessage = "I recommend starting with a targeted **Search Campaign** focused on **Leads** to capture qualified potential clients actively searching for your solutions.\n\nTell me your business name or paste your website URL to begin.";
      }

      // Check if user specified a budget in fallback
      let explicitBudget: number | null = currentState.dailyBudget || null;
      let fallbackBudgetType: "DAILY" | "TOTAL" = currentState.budgetType === "TOTAL" ? "TOTAL" : "DAILY";

      if (lastUserMsg.includes("total budget") || lastUserMsg.includes("lifetime")) {
        fallbackBudgetType = "TOTAL";
      } else if (lastUserMsg.includes("daily") || lastUserMsg.includes("per day")) {
        fallbackBudgetType = "DAILY";
      }

      const budgetMatch = lastUserMsg.match(/(?:budget|spend|cost)\s*(?:is|of|to)?\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/i) ||
                          lastUserMsg.match(/(?:rs\.?|₹|inr)\s*(\d[\d,]*)\s*(?:per day|daily|\/day|total)?/i) ||
                          lastUserMsg.match(/(\d[\d,]*)\s*(?:per day|daily|\/day|total)/i);
      if (budgetMatch && budgetMatch[1]) {
        const parsedNum = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) explicitBudget = parsedNum;
      }

      // Regex fallback extraction for business, website, dates in fallback
      const bizNameMatch = lastUserMsg.match(/(?:shop|business|company|store|brand)\s*(?:name)?\s*(?:is|:)?\s*["']([^"']+)["']/i);
      const fallbackBizName = bizNameMatch ? bizNameMatch[1].trim() : (currentState.businessName || currentState.business?.name || "");

      const websiteMatch = lastUserMsg.match(/(?:website|url|site)\s*(?:is|:)?\s*["']?(https?:\/\/[^\s"']+)["']?/i);
      const fallbackWebsite = websiteMatch ? websiteMatch[1].trim() : (currentState.website || currentState.business?.website || "");

      const normalizeDateString = (dStr?: string): string | undefined => {
        if (!dStr || typeof dStr !== "string") return undefined;
        const trimmed = dStr.trim();
        const parts = trimmed.split(/[-\/\.]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
          if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
        return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
      };

      const startDateMatch = lastUserMsg.match(/start\s*(?:date)?\s*(?:is|:)?\s*(\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4})/i);
      const fallbackStartDate = startDateMatch ? normalizeDateString(startDateMatch[1]) : (currentState.startDate || new Date().toISOString().split("T")[0]);

      const endDateMatch = lastUserMsg.match(/end\s*(?:date)?\s*(?:is|:)?\s*(\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4})/i);
      const fallbackEndDate = endDateMatch ? normalizeDateString(endDateMatch[1]) : currentState.endDate;

      let fallbackHeadlines = [...(currentState.headlines || [])];
      let fallbackLongHeadlines = [...(currentState.longHeadlines || [])];
      let fallbackDescriptions = [...(currentState.descriptions || [])];

      const fallbackState: CampaignState = {
        ...currentState,
        businessName: fallbackBizName,
        website: fallbackWebsite,
        business: {
          ...(currentState.business || {}),
          name: fallbackBizName,
          website: fallbackWebsite
        },
        objective: resolvedObjective as any,
        campaignType: resolvedCampaignType as any,
        conversionGoals: resolvedGoals,
        budgetType: fallbackBudgetType,
        dailyBudget: explicitBudget,
        startDate: fallbackStartDate,
        endDate: fallbackEndDate,
        headlines: fallbackHeadlines,
        longHeadlines: fallbackLongHeadlines,
        descriptions: fallbackDescriptions,
        locations: currentState.locations?.length ? currentState.locations : [],
        language: currentState.language || "",
        readyForReview: !!(fallbackBizName || fallbackWebsite),
        readyForPublish: false,
        stage: "collecting_campaign_data"
      };

      return {
        message: fallbackMessage,
        suggestions: [
          "Daily: ₹1,000/day",
          "Daily: ₹2,500/day",
          "Total: ₹15,000 (15 Days)",
          "Run Continuously (No End Date)"
        ],
        campaignState: fallbackState,
        missingFields: GoogleAdsCampaignValidator.validate(fallbackState).missingSummary,
        validationErrors: GoogleAdsCampaignValidator.validate(fallbackState).errors,
        readyForReview: !!(fallbackState.businessName || fallbackState.website),
        readyForPublish: false,
        stage: "collecting_campaign_data"
      };
    }
  }

  public static computeMissingFields(state: CampaignState): string[] {
    if (!state.campaignType) return [];
    const valResult = GoogleAdsCampaignValidator.validate(state);
    return valResult.missingSummary;
  }
}

