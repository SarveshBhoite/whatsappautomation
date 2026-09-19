import axios from "axios";
import { GoogleAdsCampaignValidator, ValidationError } from "./shared/GoogleAdsCampaignValidator";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";
import { GoogleAdsImageGenService, GeneratedCreativeImage } from "./GoogleAdsImageGenService";
import { PromptBuilder } from "./prompts/PromptBuilder";

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

export type CaseIdentifier =
  | "CASE_1_DISCOVERY"
  | "CASE_2_OBJECTIVE"
  | "CASE_3_GOALS"
  | "CASE_4_CAMPAIGN_TYPE"
  | "CASE_5_SETUP"
  | "CASE_6_ASSETS"
  | "CASE_7_REVIEW"
  | "CASE_8_LAUNCH";

/**
 * Deterministic CASE router for Google Ads AI Guided Assistant.
 * Routes strictly via pure deterministic TypeScript and consumes 0 AI tokens.
 *
 * Routing Priority:
 * Priority 1: Explicit user edit/override intent (if campaign exists / configuration is available)
 * Priority 2: Launch intent (CASE_8_LAUNCH ONLY when campaign is ready for publish AND user explicitly asks to launch)
 * Priority 3: Deterministic campaign progression (state-based)
 */
export function detectCampaignCase(
  state: CampaignState,
  lastUserMsgRaw?: string
): CaseIdentifier {
  const currentState = state || {};
  const msg = (lastUserMsgRaw || "").trim().toLowerCase();

  // Helper: check if business information is present
  const hasBusiness = Boolean(
    (currentState.businessName && currentState.businessName.trim().length > 0) ||
    (currentState.website && currentState.website.trim().length > 0) ||
    (currentState.business?.name && currentState.business.name.trim().length > 0) ||
    (currentState.business?.website && currentState.business.website.trim().length > 0)
  );

  const hasObjective = Boolean(currentState.objective && currentState.objective.trim().length > 0);
  const objective = (currentState.objective || "").trim().toUpperCase();

  // Check if conversion goals are required for this objective
  // LOCAL has no goals; NO_GUIDANCE requires no goals by default
  const goalsRequired = !(objective === "LOCAL" || objective === "NO_GUIDANCE");
  const hasGoals = Array.isArray(currentState.conversionGoals) && currentState.conversionGoals.length > 0;

  const hasCampaignType = Boolean(currentState.campaignType && currentState.campaignType.trim().length > 0);
  const campaignType = (currentState.campaignType || "").trim().toUpperCase();

  // Validation evaluation via existing GoogleAdsCampaignValidator
  let isValid = false;
  let validationErrors: ValidationError[] = [];
  if (hasCampaignType) {
    const valResult = GoogleAdsCampaignValidator.validate(currentState);
    isValid = valResult.isValid;
    validationErrors = valResult.errors;
  }

  const isReady = isValid || currentState.readyForPublish === true;

  // ── Priority 1: Explicit user edit/override intent ──
  // Only evaluate overrides if campaign context already exists
  if (hasBusiness && msg) {
    // 1. Explicit objective override
    const isExplicitObjectiveChange =
      /\b(?:change|switch|update|set|choose|select)\s+(?:my\s+)?objective\b/.test(msg) ||
      /\bobjective\s*(?:to|is|=)\s*(?:sales|leads|website_traffic|traffic|app_promotion|awareness|local|no_guidance)\b/.test(msg) ||
      /\b(?:in sales|for sales|objective is sales|objective sales)\b/.test(msg) ||
      /\b(?:in leads|for leads|objective is leads|objective leads)\b/.test(msg);

    if (isExplicitObjectiveChange) {
      return "CASE_2_OBJECTIVE";
    }

    // 2. Explicit campaign type override
    const isExplicitCampaignTypeChange =
      /\b(?:change|switch|update|set|choose|select)\s+(?:my\s+)?(?:campaign\s+)?type\b/.test(msg) ||
      /\b(?:switch|change|convert)\s+(?:this\s+campaign\s+)?to\s+(?:performance\s+max|pmax|search|display|video|demand\s+gen|shopping|app)\b/.test(msg) ||
      /\b(?:use|make it|set to)\s+(?:performance\s+max|pmax|search|display|video|demand\s+gen|shopping|app)\s+campaign\b/.test(msg);

    if (isExplicitCampaignTypeChange) {
      return "CASE_4_CAMPAIGN_TYPE";
    }

    // 3. Explicit setup change (budget, locations, dates, languages, bidding)
    const isExplicitSetupChange =
      /\b(?:change|update|set|increase|decrease|make)\s+(?:my\s+)?(?:daily\s+|total\s+|campaign\s+)?budget\b/.test(msg) ||
      /\b(?:budget|spend|cost)\s*(?:is|of|to|=)\s*(?:rs\.?|₹|inr|\$)?\s*\d+/i.test(msg) ||
      /\b(?:change|update|set|target|add|use)\s+(?:my\s+)?(?:location|locations|country|city|geo)\b/.test(msg) ||
      /\b(?:for\s+location|as\s+location|location\s+to|target\s+to)\b/.test(msg) ||
      /\b(?:change|update|set)\s+(?:my\s+)?(?:start\s+date|end\s+date|date|duration)\b/.test(msg) ||
      /\b(?:change|update|set)\s+(?:my\s+)?(?:language|languages)\b/.test(msg) ||
      /\blanguage\s+to\s+[a-z]+/i.test(msg) ||
      /\b(?:change|update|set)\s+(?:my\s+)?(?:bidding|bid|bid\s+strategy|target\s+cpa|target\s+roas)\b/.test(msg);

    if (isExplicitSetupChange && hasCampaignType) {
      return "CASE_5_SETUP";
    }

    // 4. Explicit asset / creative generation request
    const isExplicitAssetRequest =
      /\b(?:generate|write|create|suggest|draft|regenerate)\s+(?:more\s+)?(?:headlines?|descriptions?|ad\s+copy|copy|keywords?|search\s+themes?|assets?|images?|logos?|creatives?|sitelinks?)\b/.test(msg) ||
      /\b(?:give me|show me)\s+(?:some\s+)?(?:headlines?|descriptions?|keywords?|copy|sitelinks?)\b/.test(msg);

    if (isExplicitAssetRequest) {
      return "CASE_6_ASSETS";
    }
  }

  // ── Priority 2: Launch intent ──
  // Launch CASE requires BOTH:
  // 1. Campaign is actually ready for publishing.
  // 2. User explicitly expresses launch/publish/go-live confirmation intent.
  // CRITICAL: Generic phrases like "create campaign", "start campaign", "I want to create a campaign" must NOT qualify.
  const isExplicitLaunchIntent =
    /\b(?:launch\s+now|launch\s+campaign|launch\s+this\s+campaign|confirm\s+and\s+launch|yes[,\s]+launch\s+it)\b/.test(msg) ||
    /\b(?:publish\s+now|publish\s+campaign|publish\s+this\s+campaign|confirm\s+and\s+publish)\b/.test(msg) ||
    /\b(?:go\s+live|make\s+it\s+live)\b/.test(msg) ||
    /^(?:launch|publish|go live)$/.test(msg);

  if (isReady && isExplicitLaunchIntent) {
    return "CASE_8_LAUNCH";
  }

  // ── Priority 3: Deterministic campaign progression ──
  // 1. No business information -> CASE_1_DISCOVERY
  if (!hasBusiness) {
    return "CASE_1_DISCOVERY";
  }

  // 2. Business known but objective missing -> CASE_2_OBJECTIVE
  if (!hasObjective) {
    return "CASE_2_OBJECTIVE";
  }

  // 3. Objective known but conversion goals are required and missing -> CASE_3_GOALS
  if (goalsRequired && !hasGoals) {
    return "CASE_3_GOALS";
  }

  // 4. Objective/goals are sufficient but campaign type missing -> CASE_4_CAMPAIGN_TYPE
  if (!hasCampaignType) {
    return "CASE_4_CAMPAIGN_TYPE";
  }

  // 5. Campaign type exists but required setup fields are missing -> CASE_5_SETUP
  // Check common and type-specific setup requirements:
  // - dailyBudget / totalBudget
  // - locations
  // - language
  // - totalBudget requires endDate
  // - APP requires appId and positive targetCpa
  // - SHOPPING requires merchantCenterId and salesCountry
  const dailyBudgetNum = Number(currentState.dailyBudget);
  const totalBudgetNum = Number(currentState.totalBudget || currentState.budget);
  const budgetType = (currentState.budgetType || "DAILY").toUpperCase();
  const hasValidBudget = budgetType === "TOTAL"
    ? (!isNaN(totalBudgetNum) && totalBudgetNum > 0) || (!isNaN(dailyBudgetNum) && dailyBudgetNum > 0)
    : (!isNaN(dailyBudgetNum) && dailyBudgetNum > 0);

  const hasLocations = Array.isArray(currentState.locations) &&
    currentState.locations.filter((l: any) => l && String(l).trim()).length > 0;

  const hasLanguage = Boolean(currentState.language || (Array.isArray(currentState.languages) && currentState.languages.length > 0));

  let missingTypeSetup = false;
  if (budgetType === "TOTAL" && (!currentState.endDate || !String(currentState.endDate).trim())) {
    missingTypeSetup = true;
  }

  if (campaignType === "APP") {
    const hasAppId = Boolean(currentState.appId && currentState.appId.trim().length > 0);
    const targetCpaNum = Number(currentState.targetCpa);
    const hasAppCpa = !isNaN(targetCpaNum) && targetCpaNum > 0;
    if (!hasAppId || !hasAppCpa) {
      missingTypeSetup = true;
    }
  } else if (campaignType === "SHOPPING") {
    const hasMerchantId = Boolean(
      (currentState.merchantCenterId && currentState.merchantCenterId.trim().length > 0) ||
      (currentState.merchantId && currentState.merchantId.trim().length > 0)
    );
    const hasCountry = Boolean(
      (currentState.salesCountry && currentState.salesCountry.trim().length > 0) ||
      (currentState.feedLabel && currentState.feedLabel.trim().length > 0)
    );
    if (!hasMerchantId || !hasCountry) {
      missingTypeSetup = true;
    }
  }

  // Check validator for setup-level errors (BUDGET or TARGETING)
  const hasSetupValidationErrors = validationErrors.some(
    e => e.type === "BUDGET" || e.type === "TARGETING"
  );

  if (!hasValidBudget || !hasLocations || !hasLanguage || missingTypeSetup || hasSetupValidationErrors) {
    return "CASE_5_SETUP";
  }

  // 6. Setup is complete but required assets/copy are missing -> CASE_6_ASSETS
  // Determine asset completeness using existing campaign-specific asset requirements:
  const headlinesCount = (currentState.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0).length;
  const descriptionsCount = (currentState.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0).length;
  const longHeadlinesCount = (currentState.longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0).length;
  const keywordsCount = (currentState.keywords || []).filter((k: any) => typeof k === "string" && k.trim().length > 0).length;

  let missingAssets = false;
  if (campaignType === "SEARCH") {
    if (headlinesCount < 3 || descriptionsCount < 2 || keywordsCount < 1) {
      missingAssets = true;
    }
  } else if (campaignType === "PERFORMANCE_MAX") {
    if (headlinesCount < 3 || longHeadlinesCount < 1 || descriptionsCount < 2) {
      missingAssets = true;
    }
  } else if (campaignType === "DISPLAY" || campaignType === "DEMAND_GEN" || campaignType === "VIDEO") {
    if (headlinesCount < 1 || descriptionsCount < 1) {
      missingAssets = true;
    }
  } else if (campaignType === "APP" || campaignType === "SHOPPING") {
    if (headlinesCount < 1 || descriptionsCount < 1) {
      missingAssets = true;
    }
  }

  // Check validator for ASSET or creative FIELD errors
  const hasAssetValidationErrors = validationErrors.some(
    e => e.type === "ASSET" ||
         e.field === "headlines" ||
         e.field === "descriptions" ||
         e.field === "longHeadlines" ||
         e.field === "keywords" ||
         e.field === "images" ||
         e.field === "logos" ||
         e.field === "videos" ||
         e.field === "carouselCards"
  );

  if (missingAssets || hasAssetValidationErrors) {
    return "CASE_6_ASSETS";
  }

  // 7. Campaign configuration is sufficiently complete / valid and ready for review -> CASE_7_REVIEW
  return "CASE_7_REVIEW";
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
    if (Array.isArray(clone.searchThemes) && clone.searchThemes.length > 8) {
      clone.searchThemes = clone.searchThemes.slice(0, 8);
      clone.totalSearchThemesCount = state.searchThemes?.length;
    }
    if (Array.isArray(clone.sitelinks) && clone.sitelinks.length > 4) {
      clone.sitelinks = clone.sitelinks.slice(0, 4);
      clone.totalSitelinksCount = state.sitelinks?.length;
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

    // Ensure customerProfile context is not redundantly duplicated in campaign state JSON
    if (clone.customerProfile) {
      delete clone.customerProfile;
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
    currentState: CampaignState,
    customerProfile?: any
  ): Promise<AiChatResponse> {
    const lastUserMsgRaw = messages.filter(m => m.role === "user").pop()?.content || "";
    const activeCase = detectCampaignCase(currentState, lastUserMsgRaw);

    // Safe dev logging for CASE routing
    console.log(
      `[AI Guided] CASE ROUTER case=${activeCase} objective=${currentState.objective || "undefined"} campaignType=${currentState.campaignType || "undefined"}`
    );

    const promptState = this.sanitizeStateForPrompt(currentState);
    const resolvedCustomerProfile = customerProfile || (currentState as any)?.customerProfile || null;

    // Modular dynamic prompt built via pure deterministic TypeScript (0 AI tokens)
    const systemPrompt = PromptBuilder.buildCampaignSystemPrompt({
      activeCase,
      campaignState: promptState,
      customerProfile: resolvedCustomerProfile,
      lastUserMessage: lastUserMsgRaw
    });

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

      // Safe development-only token diagnostics
      const systemChars = systemPrompt.length;
      const systemWords = systemPrompt.split(/\s+/).filter(Boolean).length;
      const systemEstimatedTokens = Math.round(systemChars / 4);

      const historyChars = compactedMessages.slice(0, -1).reduce((acc, m) => acc + m.content.length, 0);
      const historyEstimatedTokens = Math.round(historyChars / 4);

      const userChars = (compactedMessages[compactedMessages.length - 1]?.content || "").length;
      const userEstimatedTokens = Math.round(userChars / 4);

      const estimatedInputTokens = systemEstimatedTokens + historyEstimatedTokens + userEstimatedTokens;
      const maxTokens = 1000;
      const estimatedTPMReservation = estimatedInputTokens + maxTokens;

      console.log(
        `[AI TOKEN DEBUG]\n` +
        `case=${activeCase}\n` +
        `systemChars=${systemChars}\n` +
        `systemWords=${systemWords}\n` +
        `systemEstimatedTokens=${systemEstimatedTokens}\n` +
        `historyChars=${historyChars}\n` +
        `historyEstimatedTokens=${historyEstimatedTokens}\n` +
        `userChars=${userChars}\n` +
        `userEstimatedTokens=${userEstimatedTokens}\n` +
        `estimatedInputTokens=${estimatedInputTokens}\n` +
        `maxTokens=${maxTokens}\n` +
        `estimatedTPMReservation=${estimatedTPMReservation}`
      );

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
            const actualUsage = response.data?.usage;
            if (actualUsage) {
              console.log(
                `[AI TOKEN ACTUAL USAGE] prompt_tokens=${actualUsage.prompt_tokens} completion_tokens=${actualUsage.completion_tokens} total_tokens=${actualUsage.total_tokens}`
              );
            }
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
      // Check if user requested copy/assets or if parsedState contains generated items
      const hasKeywordsInParsed = Array.isArray(parsedState.keywords) && parsedState.keywords.length > 0;
      const hasSearchThemesInParsed = Array.isArray(parsedState.searchThemes) && parsedState.searchThemes.length > 0;
      const hasSitelinksInParsed = Array.isArray(parsedState.sitelinks) && parsedState.sitelinks.length > 0;
      const hasHeadlinesInParsed = Array.isArray(parsedState.headlines) && parsedState.headlines.length > 0;
      const hasDescriptionsInParsed = Array.isArray(parsedState.descriptions) && parsedState.descriptions.length > 0;
      const hasLongHeadlinesInParsed = Array.isArray(parsedState.longHeadlines) && parsedState.longHeadlines.length > 0;

      let cleanKeywords = (hasKeywordsInParsed || userAskedForGen || userConfirmedSettings)
        ? this.sanitizeArray(hasKeywordsInParsed ? parsedState.keywords : (currentState.keywords || []), 80)
        : this.sanitizeArray(currentState.keywords, 80);

      let cleanSearchThemes = (hasSearchThemesInParsed || userAskedForGen || userConfirmedSettings)
        ? this.sanitizeArray(hasSearchThemesInParsed ? parsedState.searchThemes : (currentState.searchThemes || []), 80)
        : this.sanitizeArray(currentState.searchThemes, 80);

      // Sitelinks sanitization
      let cleanSitelinks: Array<{ text: string; url: string; desc1?: string; desc2?: string }> = [];
      const rawSitelinks = hasSitelinksInParsed ? parsedState.sitelinks : (currentState.sitelinks || []);
      const baseSiteUrl = (currentState.website || "https://www.example.com").trim().replace(/\/+$/, "");
      const usedSitelinkUrls = new Set<string>();

      if (Array.isArray(rawSitelinks)) {
        cleanSitelinks = rawSitelinks
          .filter((st: any) => st && (st.text || st.linkText))
          .map((st: any, idx: number) => {
            const rawText = String(st.text || st.linkText);
            let targetUrl = String(st.url || baseSiteUrl).trim();
            const normalized = targetUrl.replace(/\/+$/, "");

            // If the URL matches the base homepage or is duplicate, synthesize a relevant path
            if (normalized === baseSiteUrl || usedSitelinkUrls.has(normalized)) {
              const textSlug = rawText.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
              if (textSlug) {
                targetUrl = `${baseSiteUrl}/${textSlug}`;
              } else {
                targetUrl = `${baseSiteUrl}/page-${idx + 1}`;
              }
            }
            usedSitelinkUrls.add(targetUrl.replace(/\/+$/, ""));

            return {
              text: GoogleAdsBaseService.cleanAdText(rawText, 25),
              desc1: (st.desc1 || st.description1) ? GoogleAdsBaseService.cleanAdText(String(st.desc1 || st.description1), 35) : undefined,
              desc2: (st.desc2 || st.description2) ? GoogleAdsBaseService.cleanAdText(String(st.desc2 || st.description2), 35) : undefined,
              url: GoogleAdsBaseService.cleanUrl ? GoogleAdsBaseService.cleanUrl(targetUrl) : targetUrl
            };
          })
          .filter((st: any) => st.text && st.url);
      }

      // If campaignType is PERFORMANCE_MAX and searchThemes is empty but keywords exist, seed search themes
      if (
        (resolvedCampaignType === "PERFORMANCE_MAX" || currentState.campaignType === "PERFORMANCE_MAX") &&
        cleanSearchThemes.length === 0 &&
        cleanKeywords.length > 0
      ) {
        cleanSearchThemes = cleanKeywords.slice(0, 8);
      }

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
        searchThemes: cleanSearchThemes,
        sitelinks: cleanSitelinks,
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
        // Extension Assets & More Asset Types preservation
        callouts: Array.isArray(parsedState.callouts) && parsedState.callouts.length > 0
          ? parsedState.callouts.map((c: any) => GoogleAdsBaseService.cleanAdText(String(c), 25)).filter(Boolean)
          : (currentState.callouts || []),
        structuredSnippets: Array.isArray(parsedState.structuredSnippets) && parsedState.structuredSnippets.length > 0
          ? parsedState.structuredSnippets.filter((sn: any) => sn && sn.header && Array.isArray(sn.values))
          : (currentState.structuredSnippets || []),
        promotions: Array.isArray(parsedState.promotions) && parsedState.promotions.length > 0
          ? parsedState.promotions.filter((p: any) => p && (p.promotionTarget || p.finalUrl))
          : (currentState.promotions || []),
        prices: Array.isArray(parsedState.prices) && parsedState.prices.length > 0
          ? parsedState.prices.filter((pr: any) => pr && pr.header)
          : (currentState.prices || []),
        messages: Array.isArray(parsedState.messages) && parsedState.messages.length > 0
          ? parsedState.messages.filter((m: any) => m && m.platform)
          : (currentState.messages || []),
        leadForms: Array.isArray(parsedState.leadForms) && parsedState.leadForms.length > 0
          ? parsedState.leadForms.filter((lf: any) => lf && (lf.headline || lf.businessName))
          : (currentState.leadForms || []),
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
        descriptionsCount: updatedState.descriptions?.length || 0,
        searchThemesCount: updatedState.searchThemes?.length || 0,
        sitelinksCount: updatedState.sitelinks?.length || 0
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
      } else if (updatedState.campaignType === "PERFORMANCE_MAX" && updatedState.merchantCenterId === undefined && (lastUserMsg.toLowerCase().includes("performance max") || lastUserMsg.toLowerCase().includes("pmax") || lastUserMsg.toLowerCase().includes("sales"))) {
        computedSuggestions = ["Yes, I have a Merchant Center Account", "No Merchant Center Account", "Suggest Search Themes", "Suggest Sitelinks & Callouts"];
      } else if (updatedState.campaignType === "PERFORMANCE_MAX" && (!updatedState.searchThemes || updatedState.searchThemes.length === 0)) {
        computedSuggestions = ["Suggest Search Themes", "Suggest 4 Sitelinks", "Add Callouts & Snippets", "Generate Headlines & Copy"];
      } else if ((updatedState.campaignType === "PERFORMANCE_MAX" || updatedState.campaignType === "SEARCH") && (!updatedState.sitelinks || updatedState.sitelinks.length < 2)) {
        computedSuggestions = ["Suggest 4 Sitelinks", "Add Callouts & Promotions", "Generate Headlines & Copy", "Review Settings"];
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

