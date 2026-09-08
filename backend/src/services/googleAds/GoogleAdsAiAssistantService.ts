import axios from "axios";
import { GoogleAdsCampaignValidator, ValidationError } from "./shared/GoogleAdsCampaignValidator";

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
  dailyBudget?: number | null;
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
  images?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  logos?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  videos?: Array<string | { url?: string; data?: string; name?: string }>;
  appId?: string;
  appName?: string;
  platform?: "ANDROID" | "IOS";
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  // Shopping specific settings
  merchantCenterId?: string;
  merchantId?: string;
  salesCountry?: string;
  feedLabel?: string;
  budgetType?: string;
  customerAcquisitionMode?: string;
  campaignPriority?: string;
  localProducts?: boolean;
  enableLocalProducts?: boolean;
  adGroupName?: string;
  adGroupBid?: number | string | null;
  productGroupFilter?: string;
  productGroupSelectBy?: string;
  productGroupCustomLabel?: string;
  trackingTemplate?: string;
  finalUrlSuffix?: string;
  startDate?: string;
  endDate?: string;
  euPolitical?: "YES" | "NO";
  readyForReview?: boolean;
  readyForPublish?: boolean;
  stage?: CampaignStage;
}

export interface AiChatResponse {
  message: string;
  suggestions: string[];
  campaignState: CampaignState;
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
  private static getGroqKey(): string {
    const key = process.env.GROQ_KEY || "";
    if (!key) {
      console.warn("[GoogleAdsAiAssistantService] Warning: GROQ_KEY is not configured in backend environment.");
    }
    return key;
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

  private static sanitizeArray(arr: any[] | undefined): string[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map(item => (typeof item === "string" ? item.trim() : (item?.url || item?.name || "").trim()))
      .filter(item => item.length > 0 && !this.isPlaceholderOrFabrication(item));
  }

  public static async processChat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    currentState: CampaignState
  ): Promise<AiChatResponse> {
    const groqKey = this.getGroqKey();

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

Stage 3: **CONVERSION GOAL / SUBTYPE RECOMMENDATION (AUTHORITATIVE MANUAL CRM MAPPING)**
- Match the objective strictly to allowed conversion goals/subtypes:
  * For \`SALES\`, \`LEADS\`, and \`WEBSITE_TRAFFIC\`: Select EXACTLY ONE from these 7 single-selection composite goal options:
    1. \`["phone_leads"]\` ("Phone call leads")
    2. \`["contacts"]\` ("Contacts")
    3. \`["get_directions"]\` ("Get directions")
    4. \`["phone_leads", "contacts"]\` ("Phone call leads + Contacts")
    5. \`["contacts", "get_directions"]\` ("Contacts + Get directions")
    6. \`["phone_leads", "get_directions"]\` ("Phone call leads + Get directions")
    7. \`["phone_leads", "contacts", "get_directions"]\` ("Phone call leads + Contacts + Get directions")
  * For \`APP_PROMOTION\`: Select a Campaign Subtype from:
    - \`["installs"]\` ("App installs")
    - \`["engagement"]\` ("App engagement")
    - \`["preregistration"]\` ("App pre-registration (Android only)")
  * For \`AWARENESS\`: Select a Campaign Subtype from:
    - \`["views"]\` ("Video views")
    - \`["reach"]\` ("Reach")
    - \`["subscriptions"]\` ("YouTube subscriptions & engagements")
  * For \`LOCAL\`: No conversion goals or subtypes. Leave \`conversionGoals: []\`.
  * For \`NO_GUIDANCE\`: Goals are selected only after campaign type:
    - If Demand Gen: \`["phone_leads"]\`
    - If Shopping: \`["phone_leads"]\`, \`["get_directions"]\`, or \`["phone_leads", "get_directions"]\`
    - Otherwise: \`conversionGoals: []\`

Stage 4: **CAMPAIGN TYPE RECOMMENDATION (EXACT DEPENDENCY RULES)**
- You MUST only recommend campaign types that are strictly compatible with the objective and goals:
  * For \`APP_PROMOTION\`: ONLY \`APP\`.
  * For \`LOCAL\`: ONLY \`PERFORMANCE_MAX\`.
  * For \`AWARENESS\`:
    - If subtype is \`views\` -> ONLY \`VIDEO\`.
    - If subtype is \`reach\` -> \`VIDEO\` or \`DISPLAY\`.
    - If subtype is \`subscriptions\` -> ONLY \`DEMAND_GEN\`.
  * For \`SALES\` & \`LEADS\`:
    - If \`contacts\` is in conversion goals -> ONLY \`PERFORMANCE_MAX\`.
    - If \`get_directions\` is in conversion goals (without contacts) -> \`PERFORMANCE_MAX\`, \`SEARCH\`, \`SHOPPING\`.
    - If \`phone_leads\` only -> \`PERFORMANCE_MAX\`, \`SEARCH\`, \`DEMAND_GEN\`, \`VIDEO\`, \`DISPLAY\`, \`SHOPPING\`.
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

### STRICT DATA ACCURACY & SYNCHRONIZATION RULES:
1. **OBJECTIVE INTEGRITY**:
   - NEVER assume or default \`objective\` to \`LEADS\`.
   - If user only supplied business name: \`objective: ""\` (empty string).
   - If user provides a goal, intelligently match to one of the 7 CRM objectives (\`SALES\`, \`LEADS\`, \`WEBSITE_TRAFFIC\`, \`APP_PROMOTION\`, \`AWARENESS\`, \`LOCAL\`, \`NO_GUIDANCE\`).
   - Preserve existing \`currentState.objective\` if valid, unless user explicitly changes it.
2. **BUDGET SYNCHRONIZATION**:
   - When the user mentions a daily budget in natural language (e.g. "my budget is 5600 per day", "7000 daily", "Rs 5000", "500/day"), extract and set \`campaignState.dailyBudget\` as an integer (e.g. 5600, 7000, 5000, 500).
   - If the user changes their budget later in the conversation, immediately update \`campaignState.dailyBudget\` to the new number.
   - If the user has not mentioned a budget yet, leave \`dailyBudget\` as null. NEVER output 0.
3. **SMART CONTEXTUAL CAMPAIGN NAMING**:
   - Format campaign name as \`[Business_Name]\` (or \`[Business_Name] - [CampaignType]\` if campaign type is confirmed).
   - If the user explicitly asks for a custom campaign name, respect and use their custom name verbatim.
4. **IMAGE & ASSET VERIFICATION (NEVER FABRICATE ASSETS)**:
   - If the user claims "I attached images" or "I uploaded logos", but \`campaignState.images\` is empty (\`[]\`), DO NOT pretend images are present. Politely remind them to click the **Upload Media** or **Attach Images** button to attach real creative images.
   - Do NOT invent fake or placeholder URLs for images or logos in \`campaignState.images\` or \`campaignState.logos\`.
5. **DEFAULT LOCATION & LANGUAGE**:
   - Provide standard practical defaults if not specified: \`locations: ["India"]\`, \`language: "English"\`. If the user specifies different locations (e.g. "Pune", "United States", "Global") or languages (e.g. "Hindi", "Spanish"), update them immediately.
6. **REAL AD COPY GENERATION**:
   - When generating headlines and descriptions, tailor them specifically to the user's business name, products/services, and website benefits.
   - Headlines must be <= 30 characters each.
   - Descriptions and Long Headlines must be <= 90 characters each.

### OUTPUT JSON SCHEMA:
You MUST reply strictly with valid, parseable JSON matching this schema:
{
  "message": "Conversational markdown response explaining your recommendation clearly and explaining WHY, then stating what is needed next.",
  "suggestions": ["Use Recommended Settings", "Upload Media", "Change Budget", "Show Other Options"],
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
${JSON.stringify(currentState, null, 2)}
`;

    try {
      console.log("[AI-GUIDED] AI reasoning started. Input message count:", messages.length);
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      const candidateModels = [
        "llama-3.3-70b-versatile",
        "openai/gpt-oss-120b",
        "llama-3.1-8b-instant",
        "openai/gpt-oss-20b"
      ];

      let rawContent = "";
      let successfulModel = "";
      let lastErr: any = null;

      for (const model of candidateModels) {
        try {
          const response = await axios.post(
            GROQ_API_URL,
            {
              model,
              messages: apiMessages,
              temperature: 0.1,
              max_tokens: 1500,
              response_format: { type: "json_object" }
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqKey}`
              },
              timeout: 15000
            }
          );

          rawContent = response.data?.choices?.[0]?.message?.content || "{}";
          if (rawContent && rawContent.trim().startsWith("{")) {
            successfulModel = model;
            console.log(`[AI-GUIDED] AI reasoning succeeded using model: ${successfulModel}`);
            break;
          }
        } catch (mErr: any) {
          lastErr = mErr;
          console.warn(`[AI-GUIDED] Model ${model} failed (${mErr?.response?.data?.error?.message || mErr.message}), trying next candidate...`);
        }
      }

      if (!rawContent || !rawContent.trim().startsWith("{")) {
        console.error(`[AI-GUIDED] All AI candidate models failed. Last failure reason:`, lastErr?.response?.data || lastErr?.message);
        throw lastErr || new Error("Failed to get JSON response from Groq models");
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
      const userAskedForGen = lastUserMsg.includes("generate") || lastUserMsg.includes("create headlines") || lastUserMsg.includes("suggest keywords") || lastUserMsg.includes("website");
      const userConfirmedSettings = lastUserMsg.includes("use recommended") || lastUserMsg.includes("accept") || lastUserMsg.includes("confirm");

      // Extract explicit budget if stated in natural language in last user message
      let explicitBudget: number | null = null;
      const budgetMatch = lastUserMsg.match(/(?:budget|spend|cost)\s*(?:is|of|to)?\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/i) ||
                          lastUserMsg.match(/(?:rs\.?|₹|inr)\s*(\d[\d,]*)\s*(?:per day|daily|\/day)?/i) ||
                          lastUserMsg.match(/(\d[\d,]*)\s*(?:per day|daily|\/day)/i);
      if (budgetMatch && budgetMatch[1]) {
        const parsedNum = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          explicitBudget = parsedNum;
        }
      }

      const cleanLocations = (parsedState.locations && parsedState.locations.length > 0)
        ? this.sanitizeArray(parsedState.locations)
        : (currentState.locations && currentState.locations.length > 0 ? currentState.locations : ["India"]);

      const cleanKeywords = (userAskedForGen || userConfirmedSettings || (parsedState.keywords && parsedState.keywords.length > 0))
        ? this.sanitizeArray(parsedState.keywords || currentState.keywords)
        : this.sanitizeArray(currentState.keywords);

      const cleanHeadlines = (userAskedForGen || userConfirmedSettings || (parsedState.headlines && parsedState.headlines.length > 0))
        ? this.sanitizeArray(parsedState.headlines || currentState.headlines)
        : this.sanitizeArray(currentState.headlines);

      const cleanDescriptions = (userAskedForGen || userConfirmedSettings || (parsedState.descriptions && parsedState.descriptions.length > 0))
        ? this.sanitizeArray(parsedState.descriptions || currentState.descriptions)
        : this.sanitizeArray(currentState.descriptions);

      const cleanLongHeadlines = (userAskedForGen || userConfirmedSettings || (parsedState.longHeadlines && parsedState.longHeadlines.length > 0))
        ? this.sanitizeArray(parsedState.longHeadlines || currentState.longHeadlines)
        : this.sanitizeArray(currentState.longHeadlines);

      // User confirmed values vs recommendation values
      const resolvedBiddingStrategy = parsedState.biddingStrategy || currentState.biddingStrategy || "Maximize conversions";
      const resolvedLanguage = parsedState.language || currentState.language || "English";
      const resolvedTargetCpa = explicitBudget !== null ? null : (parsedState.targetCpa ?? currentState.targetCpa ?? null);
      const resolvedTargetRoas = parsedState.targetRoas ?? currentState.targetRoas ?? null;
      const resolvedDailyBudget = explicitBudget !== null
        ? explicitBudget
        : (parsedState.dailyBudget ?? currentState.dailyBudget ?? null);

      // Contextual Campaign Name Formulation: [Business_Name] or [Business_Name] - [CampaignType]
      let derivedCampaignName = "";
      if (cleanBizName) {
        const underscoredBiz = cleanBizName.replace(/\s+/g, "_");
        if (parsedState.campaignType) {
          const formattedType = parsedState.campaignType
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

      const mergedState: CampaignState = {
        ...currentState,
        ...parsedState,
        business: {
          ...(currentState.business || {}),
          ...(parsedState.business || {}),
          name: cleanBizName,
          description: cleanBizDesc,
          website: cleanWebsite
        },
        businessName: cleanBizName,
        campaignName: cleanCampaignName,
        website: cleanWebsite,
        conversionGoals: parsedState.conversionGoals || currentState.conversionGoals || [],
        locations: cleanLocations,
        language: resolvedLanguage,
        biddingStrategy: resolvedBiddingStrategy,
        targetCpa: resolvedTargetCpa,
        targetRoas: resolvedTargetRoas,
        dailyBudget: resolvedDailyBudget,
        startDate: parsedState.startDate || currentState.startDate || new Date().toISOString().split("T")[0],
        endDate: parsedState.endDate || currentState.endDate || undefined,
        keywords: cleanKeywords,
        headlines: cleanHeadlines,
        descriptions: cleanDescriptions,
        longHeadlines: cleanLongHeadlines,
        images: currentState.images || [],
        logos: currentState.logos || [],
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

      return {
        message: parsed.message || "I've updated your campaign configuration based on your input.",
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions
          : hasCampaignType && !isReadyForPublish && validationErrors.some(e => e.type === "ASSET")
            ? ["Upload Media", "Use Recommended Settings", "Show Required Assets"]
            : ["Use Recommended Settings", "Show Other Options", "Change Budget"],
        campaignState: updatedState,
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
        fallbackMessage = "Based on your goal to get **more leads and phone inquiries**, I recommend a **Search Campaign** targeting high-intent customers actively searching for your services.\n\n### Recommended Strategy:\n- **Objective:** Leads\n- **Campaign Type:** Search\n- **Conversion Goals:** Phone call leads & Contact form enquiries\n- **Target Location:** India\n\nWould you like to provide your website URL or tell me your daily budget to generate ad headlines?";
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
      const budgetMatch = lastUserMsg.match(/(?:budget|spend|cost)\s*(?:is|of|to)?\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/i) ||
                          lastUserMsg.match(/(?:rs\.?|₹|inr)\s*(\d[\d,]*)\s*(?:per day|daily|\/day)?/i) ||
                          lastUserMsg.match(/(\d[\d,]*)\s*(?:per day|daily|\/day)/i);
      if (budgetMatch && budgetMatch[1]) {
        const parsedNum = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) explicitBudget = parsedNum;
      }

      const fallbackState: CampaignState = {
        ...currentState,
        objective: resolvedObjective as any,
        campaignType: resolvedCampaignType as any,
        conversionGoals: resolvedGoals,
        dailyBudget: explicitBudget,
        startDate: currentState.startDate || new Date().toISOString().split("T")[0],
        locations: currentState.locations?.length ? currentState.locations : ["India"],
        language: currentState.language || "English",
        readyForReview: !!(currentState.businessName || currentState.website),
        readyForPublish: false,
        stage: "collecting_campaign_data"
      };

      return {
        message: fallbackMessage,
        suggestions: [
          "Use Recommended Settings",
          "Set Daily Budget to ₹1,000",
          "I want to sell products online",
          "I want more leads"
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

