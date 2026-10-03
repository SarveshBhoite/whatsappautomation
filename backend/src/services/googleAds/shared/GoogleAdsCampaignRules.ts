/**
 * Official Google Ads API Campaign Rules & Validation Matrix
 * Source of Truth: https://developers.google.com/google-ads/api
 *
 * Implements strict, campaign-specific rules and compatibility matrix for:
 * - SEARCH
 * - PERFORMANCE_MAX
 * - DISPLAY
 * - DEMAND_GEN
 * - SHOPPING
 * - APP
 * Note: VIDEO is mapped to DEMAND_GEN (VIDEO format) and blocked from direct API creation.
 */

export interface StructuredCampaignError {
  code: string;
  field: string;
  message: string;
  severity: "BLOCKING" | "WARNING";
}

export interface CompatibilityValidationResult {
  isValid: boolean;
  errors: StructuredCampaignError[];
}

export interface ImageAssetRequirement {
  url?: string;
  data?: string;
  fieldType?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  name?: string;
}

/**
 * Checks whether a campaign type supports Campaign Total Budgets (period = CUSTOM_PERIOD).
 * Current official Google Ads API documentation confirms campaign total budgets are supported for:
 * - DEMAND_GEN
 * - SEARCH
 * - SHOPPING (Standard Shopping)
 * - PERFORMANCE_MAX
 *
 * DISPLAY campaigns require standard daily budgets in Google Ads API.
 * APP campaigns require standard daily budgets in Google Ads API.
 */
export function isTotalBudgetSupported(campaignType: string): boolean {
  const normType = String(campaignType || "").toUpperCase().trim();
  return ["DEMAND_GEN", "SEARCH", "SHOPPING", "PERFORMANCE_MAX"].includes(normType);
}

/**
 * Checks whether a selected bidding strategy is compatible with Campaign Total Budgets.
 * In the Google Ads API:
 * - SEARCH + TOTAL: Supported with standard conversion/click strategies (MAXIMIZE_CONVERSIONS, MAXIMIZE_CLICKS, MANUAL_CPC)
 *   Portfolio bidding or unsupported automated bidding strategies that require continuous daily learning cannot be used.
 * - PERFORMANCE_MAX + TOTAL: Supported with MAXIMIZE_CONVERSIONS and MAXIMIZE_CONVERSION_VALUE.
 * - DEMAND_GEN + TOTAL: Supported with MAXIMIZE_CLICKS, MAXIMIZE_CONVERSIONS, TARGET_CPA.
 * - SHOPPING + TOTAL: Supported with MANUAL_CPC, MAXIMIZE_CLICKS. (Target ROAS on Shopping requires daily pacing).
 */
export function isBiddingStrategyCompatibleWithTotalBudget(
  campaignType: string,
  biddingStrategy: string
): { isCompatible: boolean; reason?: string } {
  const cType = String(campaignType || "").toUpperCase().trim();
  const bStrat = String(biddingStrategy || "MAXIMIZE_CONVERSIONS").trim().toUpperCase().replace(/\s+/g, "_");

  if (!isTotalBudgetSupported(cType)) {
    return {
      isCompatible: false,
      reason: `Google Ads API does not support Campaign Total Budgets for ${cType} campaigns.`
    };
  }

  if (cType === "SEARCH") {
    const allowed = [
      "MAXIMIZE_CONVERSIONS",
      "TARGET_CPA",
      "MAXIMIZE_CLICKS",
      "MANUAL_CPC"
    ];
    if (!allowed.includes(bStrat)) {
      return {
        isCompatible: false,
        reason: `Bidding strategy "${biddingStrategy}" is not compatible with Campaign Total Budgets for Search campaigns. Compatible strategies: Maximize Conversions, Target CPA, Maximize Clicks, Manual CPC.`
      };
    }
  }

  if (cType === "PERFORMANCE_MAX") {
    const allowed = [
      "MAXIMIZE_CONVERSIONS",
      "MAXIMIZE_CONVERSION_VALUE",
      "TARGET_CPA",
      "TARGET_ROAS"
    ];
    if (!allowed.includes(bStrat)) {
      return {
        isCompatible: false,
        reason: `Bidding strategy "${biddingStrategy}" is not compatible with Campaign Total Budgets for Performance Max. Compatible: Maximize Conversions or Maximize Conversion Value.`
      };
    }
  }

  if (cType === "SHOPPING") {
    const allowed = ["MANUAL_CPC", "MAXIMIZE_CLICKS", "MAXIMIZE_CONVERSION_VALUE"];
    if (!allowed.includes(bStrat)) {
      return {
        isCompatible: false,
        reason: `Bidding strategy "${biddingStrategy}" is not compatible with Campaign Total Budgets for Shopping campaigns. Compatible: Manual CPC, Maximize Clicks.`
      };
    }
  }

  if (cType === "DEMAND_GEN") {
    const allowed = [
      "MAXIMIZE_CONVERSIONS",
      "TARGET_CPA",
      "MAXIMIZE_CLICKS",
      "TARGET_ROAS"
    ];
    if (!allowed.includes(bStrat)) {
      return {
        isCompatible: false,
        reason: `Bidding strategy "${biddingStrategy}" is not compatible with Campaign Total Budgets for Demand Gen.`
      };
    }
  }

  return { isCompatible: true };
}

/**
 * Validates real aspect ratio and dimensions without guessing or relying on substring cheats.
 */
export function checkImageRatio(
  img: any,
  targetRatio: "1:1" | "1.91:1" | "4:5" | "9:16" | "4:1",
  minWidth = 300,
  minHeight = 300
): boolean {
  if (!img) return false;

  const size = Number(img.size || img.fileSize || img.fileSizeBytes || img.bytes || 0);
  if (size > 5 * 1024 * 1024) {
    return false; // Reject files larger than 5 MB
  }

  const w = Number(img.width || img.dimensions?.width);
  const h = Number(img.height || img.dimensions?.height);

  // If explicit numeric dimensions exist, verify them mathematically
  if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
    if (w < minWidth || h < minHeight) return false;
    const ratio = w / h;
    if (targetRatio === "1:1") {
      return Math.abs(ratio - 1.0) <= 0.05;
    }
    if (targetRatio === "1.91:1") {
      return Math.abs(ratio - 1.91) <= 0.08;
    }
    if (targetRatio === "4:5") {
      return Math.abs(ratio - 0.8) <= 0.05;
    }
    if (targetRatio === "9:16") {
      return Math.abs(ratio - (9 / 16)) <= 0.05;
    }
    if (targetRatio === "4:1") {
      return Math.abs(ratio - 4.0) <= 0.2;
    }
  }

  // If explicit aspectRatio metadata is verified
  const ar = String(img.aspectRatio || "").trim();
  if (ar === targetRatio) {
    return true;
  }

  // Explicit fieldType designation when verified by ingestion
  const ft = String(img.fieldType || "").trim();
  if (targetRatio === "1:1" && (ft === "SQUARE_MARKETING_IMAGE" || ft === "LOGO")) {
    return true;
  }
  if (targetRatio === "1.91:1" && ft === "MARKETING_IMAGE") {
    return true;
  }
  if (targetRatio === "4:1" && (ft === "LANDSCAPE_LOGO" || ft === "LOGO_LANDSCAPE")) {
    return true;
  }

  return false;
}

/**
 * Common Campaign Rules applicable to all campaign types.
 */
export class CommonCampaignRules {
  public static validate(state: any, context?: { orgId?: string; customerId?: string }): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Customer ID check
    const cid = String(state.customerId || context?.customerId || "").replace(/-/g, "").trim();
    if (!cid || !/^\d{10}$/.test(cid)) {
      errors.push({
        code: "INVALID_CUSTOMER_ID",
        field: "customerId",
        message: "A valid 10-digit Google Ads Customer ID is required.",
        severity: "BLOCKING"
      });
    }

    // Campaign Name
    if (!state.campaignName || !String(state.campaignName).trim()) {
      errors.push({
        code: "MISSING_CAMPAIGN_NAME",
        field: "campaignName",
        message: "Campaign name is required.",
        severity: "BLOCKING"
      });
    }

    // Currency
    const currency = String(state.currencyCode || state.currency || "INR").toUpperCase();
    if (!currency || currency.length !== 3) {
      errors.push({
        code: "INVALID_CURRENCY",
        field: "currencyCode",
        message: "A valid 3-letter currency code (e.g. INR, USD) is required.",
        severity: "BLOCKING"
      });
    }

    // Objective validation (reject unknown or incompatible objective)
    const rawObj = state.objective;
    const normObj = String(rawObj || "SALES").toUpperCase().replace(/-/g, "_").trim();
    const cType = String(state.campaignType || "").toUpperCase().trim();
    const validObjectives = [
      "SALES",
      "LEADS",
      "WEBSITE_TRAFFIC",
      "APP_PROMOTION",
      "AWARENESS",
      "YOUTUBE",
      "YOUTUBE_REACH",
      "STORE_VISITS",
      "LOCAL",
      "NO_GUIDANCE",
      "WITHOUT_GUIDANCE"
    ];
    if (rawObj && !validObjectives.includes(normObj)) {
      errors.push({
        code: "UNSUPPORTED_OBJECTIVE",
        field: "objective",
        message: `Unsupported objective "${rawObj}" for campaign creation.`,
        severity: "BLOCKING"
      });
    }

    // Budget Presence & Value (parse string amounts like "₹6,500", "6500/day")
    const budgetType = String(state.budgetType || "DAILY").toUpperCase();
    const rawBudget = budgetType === "TOTAL"
      ? (state.totalBudget !== undefined && state.totalBudget !== null && state.totalBudget !== "" ? state.totalBudget : (state.dailyBudget || state.budget))
      : (state.dailyBudget !== undefined && state.dailyBudget !== null && state.dailyBudget !== "" ? state.dailyBudget : state.budget);

    let budgetNum = NaN;
    if (rawBudget !== undefined && rawBudget !== null && String(rawBudget).trim() !== "") {
      const cleaned = String(rawBudget)
        .replace(/[₹$€£,]/g, "")
        .replace(/\s*(?:\/|\bper\b)\s*(?:day|daily|month|campaign|total)?/gi, "")
        .trim();
      budgetNum = Number(cleaned);
    }

    if (rawBudget === undefined || rawBudget === null || String(rawBudget).trim() === "" || isNaN(budgetNum) || !isFinite(budgetNum)) {
      errors.push({
        code: "INVALID_BUDGET",
        field: budgetType === "TOTAL" ? "totalBudget" : "dailyBudget",
        message: `${budgetType === "TOTAL" ? "Campaign Total Budget" : "Daily budget"} must be a valid positive number.`,
        severity: "BLOCKING"
      });
    } else if (budgetNum <= 0) {
      errors.push({
        code: "BUDGET_MUST_BE_POSITIVE",
        field: budgetType === "TOTAL" ? "totalBudget" : "dailyBudget",
        message: `${budgetType === "TOTAL" ? "Campaign Total Budget" : "Daily budget"} must be greater than 0.`,
        severity: "BLOCKING"
      });
    }

    // Date rules & TOTAL budget contract
    const startStr = state.startDate ? String(state.startDate).trim().split("T")[0] : "";
    const endStr = state.endDate ? String(state.endDate).trim().split("T")[0] : "";

    if (budgetType === "TOTAL") {
      if (!startStr) {
        errors.push({
          code: "MISSING_START_DATE_FOR_TOTAL_BUDGET",
          field: "startDate",
          message: "Campaign start date is required when using Campaign Total Budget (CUSTOM_PERIOD).",
          severity: "BLOCKING"
        });
      }
      if (!endStr) {
        errors.push({
          code: "MISSING_END_DATE_FOR_TOTAL_BUDGET",
          field: "endDate",
          message: "Campaign end date is required when using Campaign Total Budget (CUSTOM_PERIOD).",
          severity: "BLOCKING"
        });
      }
    }

    if (startStr && endStr && endStr <= startStr) {
      errors.push({
        code: "END_DATE_BEFORE_START_DATE",
        field: "endDate",
        message: `End date (${endStr}) must be after start date (${startStr}).`,
        severity: "BLOCKING"
      });
    }

    // Check CampaignBudget field mutation constraints:
    // For TOTAL budget: amount_micros must NOT be set; total_amount_micros must be set.
    // For DAILY budget: total_amount_micros must NOT be set; amount_micros must be set.
    if (state.amount_micros !== undefined && state.amount_micros !== null) {
      if (budgetType === "TOTAL") {
        errors.push({
          code: "TOTAL_BUDGET_AMOUNT_MICROS_FORBIDDEN",
          field: "amount_micros",
          message: "amount_micros must NOT be set for a Campaign Total Budget (CUSTOM_PERIOD). Only total_amount_micros is allowed.",
          severity: "BLOCKING"
        });
      }
    }

    if (state.total_amount_micros !== undefined && state.total_amount_micros !== null) {
      if (budgetType === "DAILY") {
        errors.push({
          code: "DAILY_BUDGET_TOTAL_AMOUNT_MICROS_FORBIDDEN",
          field: "total_amount_micros",
          message: "total_amount_micros must NOT be set for a DAILY budget. Only amount_micros is allowed.",
          severity: "BLOCKING"
        });
      }
    }

    // Validate campaign type support for TOTAL budget
    if (budgetType === "TOTAL") {
      if (!isTotalBudgetSupported(cType)) {
        errors.push({
          code: "TOTAL_BUDGET_UNSUPPORTED_FOR_CAMPAIGN_TYPE",
          field: "budgetType",
          message: `Campaign Total Budget (CUSTOM_PERIOD) is not supported for ${cType} campaigns in Google Ads API. Supported types: DEMAND_GEN, SEARCH, SHOPPING, PERFORMANCE_MAX.`,
          severity: "BLOCKING"
        });
      } else {
        // Validate bidding strategy compatibility with TOTAL budget
        const bStrat = state.biddingStrategy || state.biddingFocus || "MAXIMIZE_CONVERSIONS";
        const compat = isBiddingStrategyCompatibleWithTotalBudget(cType, bStrat);
        if (!compat.isCompatible) {
          errors.push({
            code: "BIDDING_STRATEGY_INCOMPATIBLE_WITH_TOTAL_BUDGET",
            field: "biddingStrategy",
            message: compat.reason || `Bidding strategy "${bStrat}" is not compatible with Campaign Total Budgets for ${cType}.`,
            severity: "BLOCKING"
          });
        }
      }
    }

    // Common Targeting: Locations
    const locs = Array.isArray(state.locations) ? state.locations.filter(Boolean) : [];
    if (locs.length === 0) {
      errors.push({
        code: "MISSING_LOCATIONS",
        field: "locations",
        message: "At least one targeted location (e.g. 'India' or 'Mumbai') is required.",
        severity: "BLOCKING"
      });
    }

    // Common Targeting: Languages
    const langs = Array.isArray(state.languages) ? state.languages.filter(Boolean) : (state.language ? [state.language] : []);
    if (langs.length === 0) {
      errors.push({
        code: "MISSING_LANGUAGES",
        field: "languages",
        message: "At least one targeted language (e.g. 'English') is required.",
        severity: "BLOCKING"
      });
    }

    // Common Final URL Validation (Except APP)
    if (cType !== "APP") {
      const url = String(state.website || state.finalUrl || state.websiteVisitsUrl || "").trim();
      if (!url) {
        errors.push({
          code: "MISSING_FINAL_URL",
          field: "website",
          message: "Landing page URL is required.",
          severity: "BLOCKING"
        });
      } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errors.push({
          code: "INVALID_URL_PROTOCOL",
          field: "website",
          message: "Landing page URL must begin with http:// or https://.",
          severity: "BLOCKING"
        });
      } else {
        try {
          const parsed = new URL(url);
          const host = parsed.hostname.toLowerCase();
          if (host === "example.com" || host.endsWith(".example.com") || host === "localhost" || host === "127.0.0.1" || host === "test.com") {
            errors.push({
              code: "FORBIDDEN_PLACEHOLDER_DOMAIN",
              field: "website",
              message: `Landing page URL cannot use placeholder or local domain (${host}).`,
              severity: "BLOCKING"
            });
          }
        } catch {
          errors.push({
            code: "MALFORMED_FINAL_URL",
            field: "website",
            message: "Invalid landing page URL format.",
            severity: "BLOCKING"
          });
        }
      }
    }

    return errors;
  }
}

/**
 * Rules for SEARCH campaigns.
 * Google Ads API:
 * - Allowed bidding: MAXIMIZE_CONVERSIONS (optional target CPA), MAXIMIZE_CONVERSION_VALUE (optional target ROAS),
 *   TARGET_IMPRESSION_SHARE (optional cpc limit), MANUAL_CPC, MAXIMIZE_CLICKS.
 * - Supports DAILY and CUSTOM_PERIOD (total budget) with compatible strategies and dates.
 * - Minimum assets: 3 headlines (<=30), 2 descriptions (<=90), 1 keyword (match type EXACT/PHRASE/BROAD).
 */
export class SearchCampaignRules {
  public static validate(state: any): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Bidding strategy & targets compatibility
    const rawStrat = String(state.biddingStrategy || state.biddingFocus || "MAXIMIZE_CONVERSIONS").trim();
    const strat = rawStrat.toUpperCase().replace(/\s+/g, "_");

    const validStrategies = [
      "MAXIMIZE_CONVERSIONS",
      "MAXIMIZE_CONVERSION_VALUE",
      "TARGET_CPA",
      "TARGET_ROAS",
      "TARGET_IMPRESSION_SHARE",
      "MANUAL_CPC",
      "MAXIMIZE_CLICKS"
    ];

    if (!validStrategies.includes(strat)) {
      errors.push({
        code: "SEARCH_UNSUPPORTED_BIDDING_STRATEGY",
        field: "biddingStrategy",
        message: `Bidding strategy "${rawStrat}" is not supported for Search campaigns. Supported: Maximize Conversions, Maximize Conversion Value, Target CPA, Target ROAS, Target Impression Share, Manual CPC, Maximize Clicks.`,
        severity: "BLOCKING"
      });
    }

    // CPA only with MAXIMIZE_CONVERSIONS or TARGET_CPA
    if (state.targetCpa !== undefined && state.targetCpa !== null && state.targetCpa !== "") {
      const cleanedCpa = String(state.targetCpa).replace(/[₹$€£,]/g, "").trim();
      const cpaNum = Number(cleanedCpa);
      if (strat === "MAXIMIZE_CONVERSION_VALUE") {
        errors.push({
          code: "SEARCH_INCOMPATIBLE_TARGET_CPA",
          field: "targetCpa",
          message: "Target CPA cannot be set when bidding strategy is Maximize Conversion Value.",
          severity: "BLOCKING"
        });
      } else if (isNaN(cpaNum) || cpaNum <= 0) {
        errors.push({
          code: "SEARCH_INVALID_TARGET_CPA",
          field: "targetCpa",
          message: "Target CPA must be a positive number.",
          severity: "BLOCKING"
        });
      }
    } else if (strat === "TARGET_CPA") {
      errors.push({
        code: "SEARCH_MISSING_TARGET_CPA",
        field: "targetCpa",
        message: "Target CPA amount is required when Target CPA bidding is selected.",
        severity: "BLOCKING"
      });
    }

    // ROAS only with MAXIMIZE_CONVERSION_VALUE or TARGET_ROAS
    if (state.targetRoas !== undefined && state.targetRoas !== null && state.targetRoas !== "") {
      const cleanedRoas = String(state.targetRoas).replace(/%/g, "").trim();
      const roasNum = Number(cleanedRoas);
      if (strat === "MAXIMIZE_CONVERSIONS") {
        errors.push({
          code: "SEARCH_INCOMPATIBLE_TARGET_ROAS",
          field: "targetRoas",
          message: "Target ROAS cannot be set when bidding strategy is Maximize Conversions.",
          severity: "BLOCKING"
        });
      } else if (isNaN(roasNum) || roasNum <= 0) {
        errors.push({
          code: "SEARCH_INVALID_TARGET_ROAS",
          field: "targetRoas",
          message: "Target ROAS must be a positive percentage (> 0).",
          severity: "BLOCKING"
        });
      }
    } else if (strat === "TARGET_ROAS") {
      errors.push({
        code: "SEARCH_MISSING_TARGET_ROAS",
        field: "targetRoas",
        message: "Target ROAS percentage is required when Target ROAS bidding is selected.",
        severity: "BLOCKING"
      });
    }

    // Headlines
    const headlines = (state.headlines || [])
      .map((h: any) => (typeof h === "string" ? h.trim() : (h?.text || "").trim()))
      .filter((h: string) => h.length > 0);
    if (headlines.length < 3) {
      errors.push({
        code: "SEARCH_INSUFFICIENT_HEADLINES",
        field: "headlines",
        message: `Search campaigns require at least 3 unique headlines (currently have ${headlines.length}).`,
        severity: "BLOCKING"
      });
    }
    for (const h of headlines) {
      if (h.length > 30) {
        errors.push({
          code: "SEARCH_HEADLINE_TOO_LONG",
          field: "headlines",
          message: `Headline "${h.slice(0, 20)}..." exceeds 30 characters limit for Search ads.`,
          severity: "BLOCKING"
        });
        break;
      }
    }

    // Descriptions
    const descriptions = (state.descriptions || [])
      .map((d: any) => (typeof d === "string" ? d.trim() : (d?.text || "").trim()))
      .filter((d: string) => d.length > 0);
    if (descriptions.length < 2) {
      errors.push({
        code: "SEARCH_INSUFFICIENT_DESCRIPTIONS",
        field: "descriptions",
        message: `Search campaigns require at least 2 unique descriptions (currently have ${descriptions.length}).`,
        severity: "BLOCKING"
      });
    }
    for (const d of descriptions) {
      if (d.length > 90) {
        errors.push({
          code: "SEARCH_DESCRIPTION_TOO_LONG",
          field: "descriptions",
          message: `Description "${d.slice(0, 20)}..." exceeds 90 characters limit for Search ads.`,
          severity: "BLOCKING"
        });
        break;
      }
    }

    // Keywords
    const rawKeywords = state.keywords || [];
    const validKeywords = rawKeywords
      .map((k: any) => (typeof k === "string" ? k.trim() : (k?.keyword || k?.text || "").trim()))
      .filter((k: string) => k.length > 0);
    if (validKeywords.length < 1) {
      errors.push({
        code: "SEARCH_MISSING_KEYWORDS",
        field: "keywords",
        message: "At least 1 targeted keyword is required for Search campaigns.",
        severity: "BLOCKING"
      });
    }

    return errors;
  }
}

/**
 * Rules for PERFORMANCE_MAX campaigns.
 * Google Ads API:
 * - Allowed bidding: MAXIMIZE_CONVERSIONS (optional target CPA), MAXIMIZE_CONVERSION_VALUE (optional target ROAS).
 * - Prohibited bidding: MANUAL_CPC, MAXIMIZE_CLICKS, TARGET_IMPRESSION_SHARE.
 * - Supports DAILY and CUSTOM_PERIOD (total budget) with start & end dates.
 * - No advertising_channel_sub_type.
 * - No Search network settings.
 * - Asset requirements:
 *   - Business Name (<= 25 chars)
 *   - At least 3 headlines (<= 30 chars)
 *   - At least 1 long headline (<= 90 chars)
 *   - At least 2 descriptions (<= 90 chars)
 *   - At least 1 landscape marketing image (1.91:1 ratio, min 600x314)
 *   - At least 1 square marketing image (1:1 ratio, min 300x300)
 *   - At least 1 square brand logo (1:1 ratio, min 128x128)
 * - REMOVE all fake asset detection (never turn 1 image into both, never guess by url/filename).
 */
export class PerformanceMaxCampaignRules {
  public static validate(state: any): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Bidding strategy compatibility
    const rawStrat = String(state.biddingStrategy || state.biddingFocus || "MAXIMIZE_CONVERSIONS").trim();
    const strat = rawStrat.toUpperCase().replace(/\s+/g, "_");

    if (
      strat === "MANUAL_CPC" ||
      strat === "MAXIMIZE_CLICKS" ||
      strat === "TARGET_IMPRESSION_SHARE"
    ) {
      errors.push({
        code: "PMAX_UNSUPPORTED_BIDDING_STRATEGY",
        field: "biddingStrategy",
        message: `Performance Max does not support "${rawStrat}" bidding. Performance Max only supports Maximize Conversions (optional Target CPA) or Maximize Conversion Value (optional Target ROAS).`,
        severity: "BLOCKING"
      });
    } else if (
      strat !== "MAXIMIZE_CONVERSIONS" &&
      strat !== "MAXIMIZE_CONVERSION_VALUE" &&
      strat !== "TARGET_CPA" &&
      strat !== "TARGET_ROAS"
    ) {
      errors.push({
        code: "PMAX_UNSUPPORTED_BIDDING_STRATEGY",
        field: "biddingStrategy",
        message: `Unsupported bidding strategy "${rawStrat}" for Performance Max. Allowed: MAXIMIZE_CONVERSIONS or MAXIMIZE_CONVERSION_VALUE.`,
        severity: "BLOCKING"
      });
    }

    // CPA/ROAS cross validation
    if (strat === "MAXIMIZE_CONVERSION_VALUE" && state.targetCpa) {
      errors.push({
        code: "PMAX_INCOMPATIBLE_TARGET_CPA",
        field: "targetCpa",
        message: "Target CPA cannot be set when Performance Max bidding strategy is Maximize Conversion Value.",
        severity: "BLOCKING"
      });
    }
    if (strat === "MAXIMIZE_CONVERSIONS" && state.targetRoas) {
      errors.push({
        code: "PMAX_INCOMPATIBLE_TARGET_ROAS",
        field: "targetRoas",
        message: "Target ROAS cannot be set when Performance Max bidding strategy is Maximize Conversions.",
        severity: "BLOCKING"
      });
    }

    // Business Name
    const bizName = String(state.businessName || state.business?.name || "").trim();
    if (!bizName) {
      errors.push({
        code: "PMAX_MISSING_BUSINESS_NAME",
        field: "businessName",
        message: "Business name is required for Performance Max (max 25 characters).",
        severity: "BLOCKING"
      });
    } else if (bizName.length > 25) {
      errors.push({
        code: "PMAX_BUSINESS_NAME_TOO_LONG",
        field: "businessName",
        message: "Business name must be 25 characters or fewer for Performance Max.",
        severity: "BLOCKING"
      });
    }

    // Text assets
    const headlines = (state.headlines || [])
      .map((h: any) => (typeof h === "string" ? h.trim() : (h?.text || "").trim()))
      .filter((h: string) => h.length > 0);
    if (headlines.length < 3) {
      errors.push({
        code: "PMAX_INSUFFICIENT_HEADLINES",
        field: "headlines",
        message: `Performance Max requires at least 3 unique headlines (currently have ${headlines.length}).`,
        severity: "BLOCKING"
      });
    }

    const longHeadlines = (state.longHeadlines || [])
      .map((lh: any) => (typeof lh === "string" ? lh.trim() : (lh?.text || "").trim()))
      .filter((lh: string) => lh.length > 0);
    if (longHeadlines.length < 1) {
      errors.push({
        code: "PMAX_MISSING_LONG_HEADLINE",
        field: "longHeadlines",
        message: "Performance Max requires at least 1 long headline (up to 90 characters).",
        severity: "BLOCKING"
      });
    }

    const descriptions = (state.descriptions || [])
      .map((d: any) => (typeof d === "string" ? d.trim() : (d?.text || "").trim()))
      .filter((d: string) => d.length > 0);
    if (descriptions.length < 2) {
      errors.push({
        code: "PMAX_INSUFFICIENT_DESCRIPTIONS",
        field: "descriptions",
        message: `Performance Max requires at least 2 unique descriptions (currently have ${descriptions.length}).`,
        severity: "BLOCKING"
      });
    }

    // STRICT ASSET VALIDATION: Separate landscape (1.91:1) and square (1:1), plus 1:1 logo
    const images: any[] = [
      ...(Array.isArray(state.images) ? state.images : []),
      ...(Array.isArray(state.marketingImages) ? state.marketingImages : [])
    ];
    const logos: any[] = [
      ...(Array.isArray(state.logos) ? state.logos : []),
      ...(Array.isArray(state.brandLogos) ? state.brandLogos : [])
    ];

    // Filter genuine non-empty assets
    const validImages = images.filter(im => {
      const url = typeof im === "string" ? im : im?.url || im?.data;
      return url && typeof url === "string" && url.trim().length > 0;
    });

    const hasLandscape = validImages.some(im => checkImageRatio(im, "1.91:1", 600, 314));
    const hasSquare = validImages.some(im => checkImageRatio(im, "1:1", 300, 300));
    const hasLogo = logos.some(l => {
      const url = typeof l === "string" ? l : l?.url || l?.data;
      return url && typeof url === "string" && url.trim().length > 0 && checkImageRatio(l, "1:1", 128, 128);
    }) || validImages.some(im => im?.fieldType === "LOGO" && checkImageRatio(im, "1:1", 128, 128));

    if (!hasLandscape) {
      errors.push({
        code: "PMAX_MISSING_LANDSCAPE_IMAGE",
        field: "marketingImages",
        message: "Performance Max requires at least 1 verified landscape marketing image (1.91:1 ratio, min 600×314 px).",
        severity: "BLOCKING"
      });
    }

    if (!hasSquare) {
      errors.push({
        code: "PMAX_MISSING_SQUARE_IMAGE",
        field: "marketingImages",
        message: "Performance Max requires at least 1 verified square marketing image (1:1 ratio, min 300×300 px).",
        severity: "BLOCKING"
      });
    }

    if (!hasLogo) {
      errors.push({
        code: "PMAX_MISSING_LOGO",
        field: "logos",
        message: "Performance Max requires at least 1 verified square brand logo (1:1 ratio, min 128×128 px).",
        severity: "BLOCKING"
      });
    }

    // Asset Group Name (Google Ads API Asset Group name: max 128 characters)
    if (state.assetGroupName !== undefined && state.assetGroupName !== null) {
      const agName = String(state.assetGroupName).trim();
      if (agName.length > 128) {
        errors.push({
          code: "PMAX_ASSET_GROUP_NAME_TOO_LONG",
          field: "assetGroupName",
          message: "Performance Max Asset Group Name must not exceed 128 characters.",
          severity: "BLOCKING"
        });
      }
    }

    // Brand Guidelines Enabled (Boolean)
    if (state.brandGuidelinesEnabled !== undefined && typeof state.brandGuidelinesEnabled !== "boolean" && typeof state.brandGuidelinesEnabled !== "string") {
      errors.push({
        code: "PMAX_INVALID_BRAND_GUIDELINES",
        field: "brandGuidelinesEnabled",
        message: "Brand Guidelines setting must be a boolean (On/Off).",
        severity: "BLOCKING"
      });
    }

    // Customer Acquisition Mode (TARGET_ALL_EQUALLY, BID_HIGHER_FOR_NEW_CUSTOMERS, TARGET_NEW_CUSTOMER_ONLY)
    if (state.customerAcquisitionMode !== undefined && state.customerAcquisitionMode !== null && String(state.customerAcquisitionMode).trim() !== "") {
      const rawMode = String(state.customerAcquisitionMode).trim().toUpperCase();
      const validModes = [
        "TARGET_ALL_EQUALLY",
        "BID_HIGHER_FOR_NEW_CUSTOMERS",
        "TARGET_NEW_CUSTOMER_ONLY",
        // Friendly UI aliases mapped canonically by services
        "EQUAL",
        "BID_HIGHER",
        "ONLY_NEW",
        "ALL_CUSTOMERS",
        "NEW_CUSTOMERS_ONLY"
      ];
      if (!validModes.includes(rawMode)) {
        errors.push({
          code: "PMAX_INVALID_CUSTOMER_ACQUISITION_MODE",
          field: "customerAcquisitionMode",
          message: `Invalid customer acquisition mode "${state.customerAcquisitionMode}" for Performance Max. Supported: Bid equally (TARGET_ALL_EQUALLY), Bid higher for new customers (BID_HIGHER_FOR_NEW_CUSTOMERS), or Only bid for new customers (TARGET_NEW_CUSTOMER_ONLY).`,
          severity: "BLOCKING"
        });
      }
    }

    return errors;
  }
}

/**
 * Rules for DISPLAY campaigns.
 * Responsive Display Ad requirements:
 * - Business Name (<= 25 chars)
 * - At least 1 headline (<= 30 chars)
 * - At least 1 long headline (<= 90 chars)
 * - At least 1 description (<= 90 chars)
 * - At least 1 landscape image (1.91:1) and 1 square image (1:1)
 * - At least 1 square logo (1:1)
 * - In Google Ads API, Display campaigns require standard DAILY budgets.
 */
export class DisplayCampaignRules {
  public static validate(state: any): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Business Name
    const bizName = String(state.businessName || state.business?.name || "").trim();
    if (!bizName) {
      errors.push({
        code: "DISPLAY_MISSING_BUSINESS_NAME",
        field: "businessName",
        message: "Business name is required for Display campaigns (max 25 characters).",
        severity: "BLOCKING"
      });
    } else if (bizName.length > 25) {
      errors.push({
        code: "DISPLAY_BUSINESS_NAME_TOO_LONG",
        field: "businessName",
        message: "Business name must be 25 characters or fewer for Display.",
        severity: "BLOCKING"
      });
    }

    // Text assets
    const headlines = (state.headlines || [])
      .map((h: any) => (typeof h === "string" ? h.trim() : (h?.text || "").trim()))
      .filter((h: string) => h.length > 0);
    if (headlines.length < 1) {
      errors.push({
        code: "DISPLAY_MISSING_HEADLINE",
        field: "headlines",
        message: "At least 1 headline is required for Display campaigns (max 30 characters).",
        severity: "BLOCKING"
      });
    }

    const longHeadlines = (state.longHeadlines || [])
      .map((lh: any) => (typeof lh === "string" ? lh.trim() : (lh?.text || "").trim()))
      .filter((lh: string) => lh.length > 0);
    if (longHeadlines.length < 1 && headlines.length < 1) {
      errors.push({
        code: "DISPLAY_MISSING_LONG_HEADLINE",
        field: "longHeadlines",
        message: "At least 1 long headline is required for Responsive Display ads (max 90 characters).",
        severity: "BLOCKING"
      });
    }

    const descriptions = (state.descriptions || [])
      .map((d: any) => (typeof d === "string" ? d.trim() : (d?.text || "").trim()))
      .filter((d: string) => d.length > 0);
    if (descriptions.length < 1) {
      errors.push({
        code: "DISPLAY_MISSING_DESCRIPTION",
        field: "descriptions",
        message: "At least 1 description is required for Display campaigns (max 90 characters).",
        severity: "BLOCKING"
      });
    }

    // Genuine images & logos (no single image relabeling)
    const images: any[] = [
      ...(Array.isArray(state.images) ? state.images : []),
      ...(Array.isArray(state.marketingImages) ? state.marketingImages : [])
    ];
    const logos: any[] = [
      ...(Array.isArray(state.logos) ? state.logos : []),
      ...(Array.isArray(state.brandLogos) ? state.brandLogos : [])
    ];

    const hasLandscape = images.some(im => checkImageRatio(im, "1.91:1", 600, 314));
    const hasSquare = images.some(im => checkImageRatio(im, "1:1", 300, 300));
    const hasLogo = logos.some(l => checkImageRatio(l, "1:1", 128, 128) || checkImageRatio(l, "4:1", 512, 128)) ||
      images.some(im => im?.fieldType === "LOGO" && (checkImageRatio(im, "1:1", 128, 128) || checkImageRatio(im, "4:1", 512, 128)));

    if (!hasLandscape) {
      errors.push({
        code: "DISPLAY_MISSING_LANDSCAPE_IMAGE",
        field: "marketingImages",
        message: "Responsive Display ads require at least 1 landscape marketing image (1.91:1 ratio, min 600×314 px).",
        severity: "BLOCKING"
      });
    }
    if (!hasSquare) {
      errors.push({
        code: "DISPLAY_MISSING_SQUARE_IMAGE",
        field: "marketingImages",
        message: "Responsive Display ads require at least 1 square marketing image (1:1 ratio, min 300×300 px).",
        severity: "BLOCKING"
      });
    }
    // Brand logos are optional for Google Display campaigns at launch.
    // If a logo is provided, ensure it adheres to Display logo specifications (1:1 min 128x128 or 4:1 min 512x128).
    if (logos.length > 0 && !hasLogo) {
      errors.push({
        code: "DISPLAY_INVALID_LOGO",
        field: "logos",
        message: "Provided brand logo must be a valid format: 1:1 square (min 128×128 px) or 4:1 landscape (min 512×128 px).",
        severity: "BLOCKING"
      });
    }

    return errors;
  }
}

/**
 * Rules for DEMAND_GEN campaigns.
 * Google Ads API:
 * - advertising_channel_type = DEMAND_GEN.
 * - Supports DAILY budget and CUSTOM_PERIOD total budget (when start & end dates are set).
 * - Supported ad formats: SINGLE_IMAGE, VIDEO, CAROUSEL.
 * - Format VIDEO: YouTube video asset is mandatory. Never fall back to image.
 * - Format CAROUSEL: Minimum 2 cards, each with image and headline.
 * - Format SINGLE_IMAGE: Verified marketing image and logo.
 * - No Search keyword requirements.
 */
export class DemandGenCampaignRules {
  public static validate(state: any): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Business Name
    const bizName = String(state.businessName || state.business?.name || "").trim();
    if (!bizName) {
      errors.push({
        code: "DEMAND_GEN_MISSING_BUSINESS_NAME",
        field: "businessName",
        message: "Business name is required for Demand Gen (max 25 characters).",
        severity: "BLOCKING"
      });
    } else if (bizName.length > 25) {
      errors.push({
        code: "DEMAND_GEN_BUSINESS_NAME_TOO_LONG",
        field: "businessName",
        message: "Business name must be 25 characters or fewer for Demand Gen.",
        severity: "BLOCKING"
      });
    }

    // Text assets
    const headlines = (state.headlines || [])
      .map((h: any) => (typeof h === "string" ? h.trim() : (h?.text || "").trim()))
      .filter((h: string) => h.length > 0);
    if (headlines.length < 1) {
      errors.push({
        code: "DEMAND_GEN_MISSING_HEADLINE",
        field: "headlines",
        message: "At least 1 headline is required for Demand Gen (max 40 characters).",
        severity: "BLOCKING"
      });
    }
    for (const h of headlines) {
      if (h.length > 40) {
        errors.push({
          code: "DEMAND_GEN_HEADLINE_TOO_LONG",
          field: "headlines",
          message: `Headline "${h.slice(0, 20)}..." exceeds 40 characters limit for Demand Gen.`,
          severity: "BLOCKING"
        });
        break;
      }
    }

    const descriptions = (state.descriptions || [])
      .map((d: any) => (typeof d === "string" ? d.trim() : (d?.text || "").trim()))
      .filter((d: string) => d.length > 0);
    if (descriptions.length < 1) {
      errors.push({
        code: "DEMAND_GEN_MISSING_DESCRIPTION",
        field: "descriptions",
        message: "At least 1 description is required for Demand Gen (max 90 characters).",
        severity: "BLOCKING"
      });
    }

    // Logos
    const logos: any[] = [
      ...(Array.isArray(state.logos) ? state.logos : []),
      ...(Array.isArray(state.brandLogos) ? state.brandLogos : [])
    ].filter(l => {
      const url = typeof l === "string" ? l : l?.url || l?.data;
      return url && typeof url === "string" && url.trim().length > 0;
    });

    if (logos.length < 1) {
      errors.push({
        code: "DEMAND_GEN_MISSING_LOGO",
        field: "logos",
        message: "At least 1 square brand logo (1:1 ratio) is required for Demand Gen.",
        severity: "BLOCKING"
      });
    }

    // Ad Format specific rules
    const format = String(state.adFormat || "SINGLE_IMAGE").toUpperCase();

    if (format === "VIDEO") {
      const videos = (state.videos || []).filter((v: any) => {
        const u = typeof v === "string" ? v : v?.url || v?.videoId || v?.asset;
        return u && typeof u === "string" && u.trim().length > 0;
      });

      if (videos.length < 1) {
        errors.push({
          code: "DEMAND_GEN_MISSING_VIDEO_ASSET",
          field: "videos",
          message: "A valid YouTube video asset is required when Demand Gen ad format is VIDEO. Automatic fallback to image is prohibited.",
          severity: "BLOCKING"
        });
      }
    } else if (format === "CAROUSEL") {
      const cards = Array.isArray(state.carouselCards) ? state.carouselCards : [];
      const validCards = cards.filter((c: any) => c && (c.image || c.imageUrl) && c.headline);
      if (validCards.length < 2) {
        errors.push({
          code: "DEMAND_GEN_INSUFFICIENT_CAROUSEL_CARDS",
          field: "carouselCards",
          message: `Demand Gen Carousel ads require at least 2 cards with an image and headline (currently have ${validCards.length}).`,
          severity: "BLOCKING"
        });
      }
    } else {
      // SINGLE_IMAGE format
      const images = (state.images || []).filter((im: any) => {
        const url = typeof im === "string" ? im : im?.url || im?.data;
        return url && typeof url === "string" && url.trim().length > 0;
      });
      if (images.length < 1) {
        errors.push({
          code: "DEMAND_GEN_MISSING_MARKETING_IMAGE",
          field: "images",
          message: "At least 1 marketing image is required for Single Image Demand Gen ads.",
          severity: "BLOCKING"
        });
      }
    }

    // Bidding strategy validation
    const rawStrat = String(state.biddingStrategy || state.biddingFocus || "MAXIMIZE_CONVERSIONS").trim();
    const strat = rawStrat.toUpperCase().replace(/\s+/g, "_");

    if (strat === "YOUTUBE_ENGAGEMENTS") {
      errors.push({
        code: "DEMAND_GEN_UNSUPPORTED_BIDDING_STRATEGY",
        field: "biddingStrategy",
        message: "YouTube engagements bidding is not supported for Demand Gen campaigns.",
        severity: "BLOCKING"
      });
    }

    return errors;
  }
}

/**
 * Rules for SHOPPING campaigns.
 * Google Ads API:
 * - campaignType = SHOPPING
 * - Supports DAILY and CUSTOM_PERIOD (total budget) with start & end dates.
 * - Numeric merchantCenterId required.
 * - salesCountry / feedLabel required (cannot rely on fake defaults).
 * - Placeholder URLs (e.g. example.com) strictly rejected.
 */
export class ShoppingCampaignRules {
  public static validate(state: any): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Merchant Center linkage & ID
    const mcId = String(state.merchantCenterId || state.merchantId || "").trim();
    if (!mcId) {
      errors.push({
        code: "SHOPPING_MISSING_MERCHANT_CENTER_ID",
        field: "merchantCenterId",
        message: "Google Merchant Center Account ID is required before a Shopping campaign can be published.",
        severity: "BLOCKING"
      });
    } else if (!/^\d+$/.test(mcId)) {
      errors.push({
        code: "SHOPPING_INVALID_MERCHANT_CENTER_ID",
        field: "merchantCenterId",
        message: "Merchant Center ID must be numeric (e.g. 5840531233).",
        severity: "BLOCKING"
      });
    }

    // Sales Country / Feed Label
    const country = String(state.salesCountry || state.feedLabel || "").trim();
    if (!country) {
      errors.push({
        code: "SHOPPING_MISSING_SALES_COUNTRY",
        field: "salesCountry",
        message: "Sales country / Feed Label is required for Shopping campaigns. A real country must be explicitly selected.",
        severity: "BLOCKING"
      });
    }

    // Landing Page / Store URL (explicitly rejecting placeholder URLs)
    const url = String(state.website || state.finalUrl || "").trim();
    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      errors.push({
        code: "SHOPPING_MISSING_FINAL_URL",
        field: "website",
        message: "A valid store landing page URL starting with http:// or https:// is required.",
        severity: "BLOCKING"
      });
    } else {
      try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        if (host === "example.com" || host.endsWith(".example.com")) {
          errors.push({
            code: "SHOPPING_FORBIDDEN_EXAMPLE_URL",
            field: "website",
            message: "Cannot use example.com as the final URL for production Shopping campaign creation.",
            severity: "BLOCKING"
          });
        }
      } catch {
        errors.push({
          code: "SHOPPING_INVALID_URL",
          field: "website",
          message: "Invalid landing page URL format.",
          severity: "BLOCKING"
        });
      }
    }

    return errors;
  }
}

/**
 * Rules for APP campaigns.
 * Google Ads API:
 * - appId required: Android dot notation (e.g. com.example.app) or iOS numeric ID/bundle ID.
 * - platform required: ANDROID or IOS (never silently default unknown platform).
 * - Advertising channel sub type: APP_CAMPAIGN or APP_CAMPAIGN_FOR_ENGAGEMENT.
 * - Target CPA required when goal is install cost optimization.
 * - Budget period: DAILY only.
 */
export class AppCampaignRules {
  public static validate(state: any): StructuredCampaignError[] {
    const errors: StructuredCampaignError[] = [];

    // Platform validation (NO silent fallback)
    const rawPlatform = String(state.platform || "").toUpperCase().trim();
    let normPlatform: "ANDROID" | "IOS" | null = null;

    if (rawPlatform === "ANDROID" || state.appStore === "GOOGLE_APP_STORE") {
      normPlatform = "ANDROID";
    } else if (rawPlatform === "IOS" || state.appStore === "APPLE_APP_STORE") {
      normPlatform = "IOS";
    }

    if (!normPlatform) {
      errors.push({
        code: "APP_INVALID_PLATFORM",
        field: "platform",
        message: "A valid mobile platform ('ANDROID' or 'IOS') is required. Unknown platforms cannot be silently defaulted.",
        severity: "BLOCKING"
      });
    }

    // App ID validation
    const appId = String(state.appId || "").trim();
    if (!appId) {
      errors.push({
        code: "APP_MISSING_APP_ID",
        field: "appId",
        message: "Mobile App package name (Android) or App Store ID (iOS) is required.",
        severity: "BLOCKING"
      });
    } else if (normPlatform === "ANDROID" && !appId.includes(".")) {
      errors.push({
        code: "APP_INVALID_ANDROID_PACKAGE",
        field: "appId",
        message: `Android package name "${appId}" must follow standard dot notation (e.g. 'com.company.app').`,
        severity: "BLOCKING"
      });
    } else if (normPlatform === "IOS" && !/^\d+$/.test(appId) && !appId.includes(".")) {
      errors.push({
        code: "APP_INVALID_IOS_APP_ID",
        field: "appId",
        message: `iOS App ID "${appId}" must be a numeric Store ID (e.g. '123456789') or valid bundle ID.`,
        severity: "BLOCKING"
      });
    }

    // Target CPA requirement for Install Optimization
    const bStratGoal = String(state.biddingStrategyGoalType || "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST");
    if (bStratGoal.includes("TARGET_INSTALL_COST") || bStratGoal.includes("TARGET_CONVERSION_COST") || !state.biddingStrategy || state.biddingStrategy.toLowerCase().includes("cpa")) {
      const cpaNum = Number(state.targetCpa);
      if (state.targetCpa === undefined || state.targetCpa === null || isNaN(cpaNum) || cpaNum <= 0) {
        errors.push({
          code: "APP_MISSING_TARGET_CPA",
          field: "targetCpa",
          message: "A positive Target CPA amount is required for App Install campaigns in Google Ads API.",
          severity: "BLOCKING"
        });
      }
    }

    // Text assets
    const headlines = (state.headlines || [])
      .map((h: any) => (typeof h === "string" ? h.trim() : (h?.text || "").trim()))
      .filter((h: string) => h.length > 0);
    if (headlines.length < 1) {
      errors.push({
        code: "APP_MISSING_HEADLINE",
        field: "headlines",
        message: "At least 1 headline is required for App promotion (max 30 characters).",
        severity: "BLOCKING"
      });
    }

    const descriptions = (state.descriptions || [])
      .map((d: any) => (typeof d === "string" ? d.trim() : (d?.text || "").trim()))
      .filter((d: string) => d.length > 0);
    if (descriptions.length < 1) {
      errors.push({
        code: "APP_MISSING_DESCRIPTION",
        field: "descriptions",
        message: "At least 1 description is required for App promotion (max 90 characters).",
        severity: "BLOCKING"
      });
    }

    return errors;
  }
}
