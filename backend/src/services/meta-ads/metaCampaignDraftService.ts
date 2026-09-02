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

  campaign: {
    name?: string;
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
    locationType?: "CITY" | "NEAR_ME" | "REGION" | "ALL_INDIA" | "CUSTOM";
    cities?: string[];
    radiusKm?: number;
    locationDescription?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: "ALL" | "MEN" | "WOMEN";
    interests?: string[];
    customAudiences?: string[];
    excludedAudiences?: string[];
    advantagePlusAudience?: boolean;
    placements?: "ADVANTAGE_PLUS" | "MANUAL";
    publisherPlatforms?: Array<"facebook" | "instagram" | "audience_network" | "messenger">;
    devicePlatforms?: Array<"mobile" | "desktop">;
  };

  destination: {
    type?: "WHATSAPP" | "INSTANT_FORM" | "WEBSITE" | "MESSENGER" | "PHONE_CALL" | "INSTAGRAM_DM" | "APP";
    destinationUrl?: string;
    whatsappPhoneNumber?: string;
    leadGenFormId?: string;
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
    mediaUrl?: string;
    mediaType?: "IMAGE" | "VIDEO";
    displayLink?: string;
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
        advantagePlusAudience: true,
      },
      destination: {
        type: "WHATSAPP",
      },
      creative: {},
      sourceMap: {},
      missingFields: ["business_or_goal", "budget", "location"],
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

    // Apply to deep path in draft
    this.assignDeepValue(draft, path, value);

    draft.sourceMap[path] = {
      value,
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
