export type FieldSource = "USER" | "META" | "AI_RECOMMENDATION" | "SYSTEM";

export interface FieldProvenance<T = any> {
  value: T;
  source: FieldSource;
  confidence: number;
  reason?: string;
  updatedAt: string;
}

export interface MetaCampaignDraft {
  adAccountId?: string | null;
  adAccountName?: string | null;
  pageId?: string | null;
  pageName?: string | null;
  instagramAccountId?: string | null;
  pixelId?: string | null;
  conversationLanguage?: {
    code: string;
    name: string;
    nativeName: string;
    metaLocaleKey: number;
    localeCode: string;
    script: string;
    confidence: number;
  };

  campaign: {
    name?: string;
    brandName?: string;
    promotedService?: string;
    promotedProduct?: string;
    offer?: string;
    objective?: string;
    buyingType?: "AUCTION" | "RESERVED";
    specialAdCategory?: string;
    cboEnabled?: boolean;
    dailyBudget?: number;
    lifetimeBudget?: number;
    bidStrategy?: "LOWEST_COST_WITHOUT_CAP" | "COST_CAP" | "BID_CAP" | "LOWEST_COST_WITH_MIN_ROAS";
    bidAmount?: number;
    currency?: string;
    startTime?: string;
    endTime?: string;
  };

  targeting: {
    locationType?: "CITY" | "NEAR_ME" | "REGION" | "ALL_INDIA" | "CUSTOM" | "BULK";
    cities?: string[];
    cityConfigs?: Array<{
      name: string;
      radiusKm: number;
      key?: string;
    }>;
    countries?: string[];
    postalCodes?: string[];
    radiusKm?: number;
    locationDescription?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: "ALL" | "MEN" | "WOMEN";
    interests?: string[];
    locales?: number[];
    languages?: string[];
    customAudiences?: string[];
    excludedAudiences?: string[];
    advantagePlusAudience?: boolean;
    placements?: "ADVANTAGE_PLUS" | "MANUAL";
    publisherPlatforms?: Array<"facebook" | "instagram" | "audience_network" | "messenger">;
    devicePlatforms?: Array<"mobile" | "desktop">;
  };

  destination: {
    type?: "WHATSAPP" | "INSTANT_FORM" | "WEBSITE" | "MESSENGER" | "PHONE_CALL" | "INSTAGRAM_DM" | "PAGE_EVENT" | "APP" | "SHOP" | "INSTAGRAM_PROFILE";
    destinationUrl?: string;
    displayLink?: string;
    browserAddOn?: "NONE" | "CALL" | "MESSENGER" | "WHATSAPP";
    whatsappPhoneNumber?: string;
    phoneNumber?: string;
    welcomeMessage?: string;
    leadGenFormId?: string;
    leadGenFormTitle?: string;
    leadGenFormFields?: string[];
    leadGenCustomQuestions?: string[];
    eventId?: string;
    eventName?: string;
    eventUrl?: string;
    appUrl?: string;
    appId?: string;
    shopUrl?: string;
    instagramProfileUrl?: string;
    pixelId?: string;
    pixelTracking?: {
      pixelId?: string;
      conversionEvent?: string;
    };
  };

  creative: {
    headline?: string;
    primaryText?: string;
    description?: string;
    callToAction?: string;
    visualDirection?: string;
    aspectRatio?: "1:1" | "9:16" | "16:9" | "4:5";
    mediaUrl?: string;
    mediaType?: "IMAGE" | "VIDEO";
    mediaApproved?: boolean;
    copyApproved?: boolean;
    displayLink?: string;
    variations?: Array<{
      angle?: string;
      headline?: string;
      primaryText?: string;
      description?: string;
    }>;
  };

  abTesting?: {
    enabled: boolean;
    splitType?: "LOCATION" | "AUDIENCE" | "CREATIVE";
    adSets?: Array<{
      name: string;
      cities?: string[];
      interests?: string[];
      budgetRatio?: number;
    }>;
  };

  crmBotFlowLink?: {
    autoLinkWhatsAppBot: boolean;
    flowName?: string;
    welcomeMessage?: string;
    triggerKeyword?: string;
    crmFlowId?: string;
  };

  sourceMap: Record<string, FieldProvenance>;
  missingFields: string[];
  recommendations: Array<{ field: string; recommendedValue: any; rationale: string }>;
}

export class MetaCampaignDraftService {
  /**
   * Create an initial empty campaign draft
   */
  static createInitialDraft(adAccountId?: string | null): MetaCampaignDraft {
    return {
      adAccountId: adAccountId || null,
      campaign: {
        buyingType: "AUCTION",
        specialAdCategory: "NONE",
        cboEnabled: true,
        currency: "INR",
      },
      targeting: {
        gender: "ALL",
      },
      destination: {},
      creative: {},
      sourceMap: {},
      missingFields: [
        "business_or_goal",
        "special_category",
        "destination",
        "location",
        "demographics_age_gender",
        "interests_and_targeting",
        "placements",
        "budget",
        "schedule",
        "creative_visual",
        "call_to_action",
        "copy_approval"
      ],
      recommendations: [],
    };
  }

  /**
   * Apply field update respecting provenance rules (USER facts cannot be overridden by AI_RECOMMENDATION)
   */
  static setField<T = any>(
    draft: MetaCampaignDraft,
    path: string,
    value: T,
    source: FieldSource,
    confidence: number = 1.0,
    reason?: string
  ): boolean {
    if (!draft.sourceMap) {
      draft.sourceMap = {};
    }

    const existingProv = draft.sourceMap[path];

    // Provenance Guard: USER source always wins over AI_RECOMMENDATION
    if (existingProv && existingProv.source === "USER" && source === "AI_RECOMMENDATION") {
      return false; // Do not overwrite explicit user decision
    }

    let finalValue: any = value;
    if (path === "campaign.objective" && typeof value === "string") {
      const valUpper = value.toUpperCase();
      if (valUpper === "BRAND_AWARENESS" || valUpper === "REACH" || valUpper === "AWARENESS") {
        finalValue = "OUTCOME_AWARENESS";
      } else if (valUpper === "LEAD_GENERATION" || valUpper === "LEADS") {
        finalValue = "OUTCOME_LEADS";
      } else if (valUpper === "CONVERSIONS" || valUpper === "SALES" || valUpper === "PRODUCT_CATALOG_SALES") {
        finalValue = "OUTCOME_SALES";
      } else if (valUpper === "LINK_CLICKS" || valUpper === "TRAFFIC") {
        finalValue = "OUTCOME_TRAFFIC";
      } else if (valUpper === "MESSAGES" || valUpper === "POST_ENGAGEMENT" || valUpper === "ENGAGEMENT") {
        finalValue = "OUTCOME_ENGAGEMENT";
      } else if (valUpper === "APP_INSTALLS" || valUpper === "APP_PROMOTION") {
        finalValue = "OUTCOME_APP_PROMOTION";
      }
    }

    // Apply to deep path in draft
    this.assignDeepValue(draft, path, finalValue);

    draft.sourceMap[path] = {
      value: finalValue,
      source,
      confidence,
      reason,
      updatedAt: new Date().toISOString(),
    };

    return true;
  }

  /**
   * Remove a field from draft (e.g. user says "Remove Instagram")
   */
  static removeField(draft: MetaCampaignDraft, path: string): void {
    delete draft.sourceMap[path];
    this.deleteDeepValue(draft, path);
  }

  private static assignDeepValue(obj: any, path: string, value: any) {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  private static deleteDeepValue(obj: any, path: string) {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) return;
      current = current[keys[i]];
    }
    delete current[keys[keys.length - 1]];
  }
}
