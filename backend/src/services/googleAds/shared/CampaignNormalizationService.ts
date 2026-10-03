/**
 * Centralized Campaign Normalization & Parsing Service for Google Ads AI-Guided Campaigns.
 *
 * Implements strict, production-ready parsing and canonical normalization for:
 * 1. Budget parsing (handles ₹, commas, /day, rejects NaN/<=0)
 * 2. Inclusive date validation (endDate >= startDate, no hidden Math.max cheating)
 * 3. Budget type normalization (DAILY vs TOTAL with API compatibility)
 * 4. Bidding strategy normalization & mutual exclusivity (Target CPA vs Target ROAS)
 * 5. Language normalization (separates UI "All languages" / unrestricted from API criteria)
 * 6. Location normalization (preserves location, radius, units, positive/negative)
 * 7. Objective normalization & strict compatibility check
 * 8. Final URL normalization & validation
 */

import { isTotalBudgetSupported, isBiddingStrategyCompatibleWithTotalBudget } from "./GoogleAdsCampaignRules";

export class CampaignValidationError extends Error {
  public readonly code: string;
  public readonly field?: string;

  constructor(message: string, code = "CAMPAIGN_VALIDATION_ERROR", field?: string) {
    super(message);
    this.name = "CampaignValidationError";
    this.code = code;
    this.field = field;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type SupportedCampaignType =
  | "SEARCH"
  | "PERFORMANCE_MAX"
  | "DISPLAY"
  | "DEMAND_GEN"
  | "SHOPPING"
  | "APP"
  | "VIDEO"; // Mapped to DEMAND_GEN

export type SupportedObjective =
  | "SALES"
  | "LEADS"
  | "WEBSITE_TRAFFIC"
  | "APP_PROMOTION"
  | "AWARENESS"
  | "YOUTUBE"
  | "YOUTUBE_REACH"
  | "STORE_VISITS"
  | "LOCAL"
  | "NO_GUIDANCE";

/**
 * Strict Compatibility Matrix defining which objectives are genuinely supported
 * by each campaign type in Google Ads.
 */
export const CAMPAIGN_OBJECTIVE_COMPATIBILITY_MAP: Record<string, string[]> = {
  SEARCH: ["SALES", "LEADS", "WEBSITE_TRAFFIC", "NO_GUIDANCE"],
  PERFORMANCE_MAX: ["SALES", "LEADS", "WEBSITE_TRAFFIC", "STORE_VISITS", "LOCAL", "NO_GUIDANCE"],
  DISPLAY: ["SALES", "LEADS", "WEBSITE_TRAFFIC", "AWARENESS", "YOUTUBE_REACH", "NO_GUIDANCE"],
  DEMAND_GEN: ["SALES", "LEADS", "WEBSITE_TRAFFIC", "AWARENESS", "YOUTUBE", "YOUTUBE_REACH", "NO_GUIDANCE"],
  SHOPPING: ["SALES", "LEADS", "WEBSITE_TRAFFIC", "NO_GUIDANCE"],
  APP: ["APP_PROMOTION"],
  VIDEO: ["AWARENESS", "YOUTUBE", "YOUTUBE_REACH", "SALES", "LEADS", "WEBSITE_TRAFFIC", "NO_GUIDANCE"]
};

export interface NormalizedBudget {
  type: "DAILY" | "TOTAL";
  amount: number;
  dailyBudget: number;
  totalBudget?: number;
  effectiveDailyBudget: number;
  currencyCode: string;
}

export interface NormalizedDates {
  startDate: string;
  endDate?: string;
  durationDays?: number;
}

export interface NormalizedBidding {
  strategy: string;
  uiLabel: string;
  targetCpa?: number;
  targetRoas?: number;
  maxCpcLimit?: number;
}

export interface NormalizedLanguages {
  unrestricted: boolean;
  languages: string[];
  rawInputs: string[];
}

export interface NormalizedLocation {
  name: string;
  isNegative?: boolean;
  radius?: number;
  radiusUnits?: "KILOMETERS" | "MILES";
}

export interface NormalizedLocations {
  locations: string[];
  detailedLocations: NormalizedLocation[];
  positiveGeoTargetType?: string;
  negativeGeoTargetType?: string;
}

export class CampaignNormalizationService {
  /**
   * Safely parses any budget input string/number (e.g. "₹6,500", "6,500/day", 6500).
   * Rejects NaN, Infinity, negative, zero, or missing values.
   */
  public static parseBudget(value: any, fieldName = "budget"): number {
    if (value === undefined || value === null || value === "") {
      throw new CampaignValidationError(`${fieldName} is required and cannot be empty.`, "INVALID_BUDGET", fieldName);
    }

    if (typeof value === "number") {
      if (isNaN(value) || !isFinite(value) || value <= 0) {
        throw new CampaignValidationError(`${fieldName} must be a valid positive number (> 0).`, "BUDGET_MUST_BE_POSITIVE", fieldName);
      }
      return Math.round(value * 100) / 100;
    }

    // Convert string by stripping currency symbols (₹, $, €, £), commas, whitespace, and "/day" / " per day"
    const cleaned = String(value)
      .replace(/[₹$€£,]/g, "")
      .replace(/\s*(?:\/|\bper\b)\s*(?:day|daily|month|campaign|total)?/gi, "")
      .trim();

    const parsed = Number(cleaned);
    if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
      throw new CampaignValidationError(
        `Invalid ${fieldName} value "${value}". Must be a valid positive number.`,
        "INVALID_BUDGET",
        fieldName
      );
    }

    return Math.round(parsed * 100) / 100;
  }

  /**
   * Validates dates BEFORE budget calculation.
   * Ensures start date is valid format, end date is >= start date, and calculates inclusive duration.
   */
  public static validateAndNormalizeDates(
    startDateRaw?: any,
    endDateRaw?: any,
    budgetType: "DAILY" | "TOTAL" = "DAILY"
  ): NormalizedDates {
    const todayStr = new Date().toISOString().split("T")[0];
    let startDate = startDateRaw ? String(startDateRaw).trim().split("T")[0] : todayStr;

    // Check valid date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || isNaN(new Date(startDate).getTime())) {
      throw new CampaignValidationError(
        `Invalid startDate format: "${startDateRaw}". Expected YYYY-MM-DD.`,
        "INVALID_START_DATE",
        "startDate"
      );
    }

    let endDate: string | undefined = undefined;
    if (endDateRaw !== undefined && endDateRaw !== null && String(endDateRaw).trim() !== "") {
      const parsedEnd = String(endDateRaw).trim().split("T")[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedEnd) || isNaN(new Date(parsedEnd).getTime())) {
        throw new CampaignValidationError(
          `Invalid endDate format: "${endDateRaw}". Expected YYYY-MM-DD.`,
          "INVALID_END_DATE",
          "endDate"
        );
      }
      endDate = parsedEnd;
    }

    if (budgetType === "TOTAL" && !endDate) {
      throw new CampaignValidationError(
        "Campaign end date is required when using Campaign Total Budget (CUSTOM_PERIOD).",
        "MISSING_END_DATE_FOR_TOTAL_BUDGET",
        "endDate"
      );
    }

    let durationDays: number | undefined = undefined;
    if (endDate) {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();

      if (endMs < startMs) {
        throw new CampaignValidationError(
          `End date (${endDate}) cannot be earlier than start date (${startDate}).`,
          "END_DATE_BEFORE_START_DATE",
          "endDate"
        );
      }

      // Inclusive days: e.g. Oct 2 to Oct 2 is 1 day, Oct 2 to Oct 4 is 3 days
      durationDays = Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    }

    return {
      startDate,
      endDate,
      durationDays
    };
  }

  /**
   * Normalizes budget according to campaign type and Google Ads API rules.
   */
  public static normalizeBudget(
    state: any,
    campaignType: string,
    dates: NormalizedDates
  ): NormalizedBudget {
    const rawType = String(state.budgetType || "DAILY").toUpperCase().trim();
    const isTotal = rawType === "TOTAL";
    const cType = campaignType.toUpperCase().trim();

    if (isTotal && !isTotalBudgetSupported(cType)) {
      throw new CampaignValidationError(
        `Campaign Total Budget (CUSTOM_PERIOD) is not supported for ${cType} campaigns in Google Ads API. Supported types: DEMAND_GEN, SEARCH, SHOPPING, PERFORMANCE_MAX.`,
        "TOTAL_BUDGET_UNSUPPORTED_FOR_CAMPAIGN_TYPE",
        "budgetType"
      );
    }

    const currencyCode = String(state.currencyCode || state.currency || "INR").toUpperCase().trim();

    if (isTotal) {
      const rawTotal = state.totalBudget !== undefined && state.totalBudget !== null && state.totalBudget !== ""
        ? state.totalBudget
        : (state.dailyBudget !== undefined ? state.dailyBudget : state.budget);
      const totalBudget = this.parseBudget(rawTotal, "totalBudget");

      if (!dates.durationDays || dates.durationDays < 1) {
        throw new CampaignValidationError(
          "Campaign end date must be after start date to calculate total budget pacing.",
          "INVALID_DATE_RANGE_FOR_TOTAL_BUDGET",
          "endDate"
        );
      }

      const effectiveDailyBudget = Math.max(1, Math.round(totalBudget / dates.durationDays));

      return {
        type: "TOTAL",
        amount: totalBudget,
        dailyBudget: effectiveDailyBudget,
        totalBudget,
        effectiveDailyBudget,
        currencyCode
      };
    } else {
      const rawDaily = state.dailyBudget !== undefined && state.dailyBudget !== null && state.dailyBudget !== ""
        ? state.dailyBudget
        : state.budget;
      const dailyBudget = this.parseBudget(rawDaily, "dailyBudget");

      return {
        type: "DAILY",
        amount: dailyBudget,
        dailyBudget,
        effectiveDailyBudget: dailyBudget,
        currencyCode
      };
    }
  }

  /**
   * Normalizes campaign type (mapping VIDEO -> DEMAND_GEN).
   */
  public static normalizeCampaignType(rawType: any): SupportedCampaignType {
    if (!rawType || typeof rawType !== "string") {
      throw new CampaignValidationError("Campaign type is required.", "MISSING_CAMPAIGN_TYPE", "campaignType");
    }
    const clean = rawType.toUpperCase().trim();
    if (clean === "VIDEO") {
      return "DEMAND_GEN";
    }
    const supported: SupportedCampaignType[] = ["SEARCH", "PERFORMANCE_MAX", "DISPLAY", "DEMAND_GEN", "SHOPPING", "APP"];
    if (supported.includes(clean as SupportedCampaignType)) {
      return clean as SupportedCampaignType;
    }
    throw new CampaignValidationError(`Unsupported campaign type: "${rawType}".`, "UNSUPPORTED_CAMPAIGN_TYPE", "campaignType");
  }

  /**
   * Normalizes objective strings including aliases like "NO-GUIDANCE", "WEBSITE-TRAFFIC", "STORE-VISITS".
   */
  public static normalizeObjective(rawObjective: any): SupportedObjective {
    if (!rawObjective || typeof rawObjective !== "string") {
      return "SALES";
    }
    const clean = rawObjective.toUpperCase().replace(/-/g, "_").trim();
    if (clean === "WITHOUT_GUIDANCE" || clean === "NO_GUIDANCE") {
      return "NO_GUIDANCE";
    }
    if (clean === "TRAFFIC" || clean === "WEBSITE_TRAFFIC") {
      return "WEBSITE_TRAFFIC";
    }
    if (clean === "STORE_VISIT" || clean === "STORE_VISITS" || clean === "LOCAL") {
      return "STORE_VISITS";
    }
    if (clean === "APP" || clean === "APP_PROMOTION") {
      return "APP_PROMOTION";
    }
    if (clean === "YOUTUBE_REACH" || clean === "YOUTUBE") {
      return "YOUTUBE";
    }

    const validObjectives: SupportedObjective[] = [
      "SALES",
      "LEADS",
      "WEBSITE_TRAFFIC",
      "APP_PROMOTION",
      "AWARENESS",
      "YOUTUBE",
      "YOUTUBE_REACH",
      "STORE_VISITS",
      "LOCAL",
      "NO_GUIDANCE"
    ];

    if (validObjectives.includes(clean as SupportedObjective)) {
      return clean as SupportedObjective;
    }

    throw new CampaignValidationError(`Unsupported objective "${rawObjective}".`, "UNSUPPORTED_OBJECTIVE", "objective");
  }

  /**
   * Validates objective compatibility against campaign type.
   * Throws CampaignValidationError if unsupported (NO silent fallback to SALES).
   */
  public static validateObjectiveCompatibility(campaignType: SupportedCampaignType, objective: SupportedObjective): void {
    const allowed = CAMPAIGN_OBJECTIVE_COMPATIBILITY_MAP[campaignType];
    if (!allowed || !allowed.includes(objective)) {
      throw new CampaignValidationError(
        `Unsupported objective "${objective}" for campaign type "${campaignType}". Valid objectives: ${allowed ? allowed.join(", ") : "none"}.`,
        "INCOMPATIBLE_CAMPAIGN_OBJECTIVE",
        "objective"
      );
    }
  }

  /**
   * Normalizes bidding strategy and validates Target CPA / Target ROAS mutual exclusivity.
   */
  public static normalizeBidding(
    state: any,
    campaignType: SupportedCampaignType,
    budgetType: "DAILY" | "TOTAL"
  ): NormalizedBidding {
    const rawFocus = String(state.biddingStrategy || state.biddingFocus || "MAXIMIZE_CONVERSIONS").trim();
    let norm = rawFocus.toUpperCase().replace(/\s+/g, "_");

    if (norm === "MAXIMIZE_CONVERSIONS" || norm === "CONVERSIONS") norm = "MAXIMIZE_CONVERSIONS";
    else if (norm === "MAXIMIZE_CONVERSION_VALUE" || norm === "CONVERSION_VALUE" || norm === "VALUE") norm = "MAXIMIZE_CONVERSION_VALUE";
    else if (norm === "TARGET_CPA" || norm === "CPA") norm = "TARGET_CPA";
    else if (norm === "TARGET_ROAS" || norm === "ROAS") norm = "TARGET_ROAS";
    else if (norm === "MAXIMIZE_CLICKS" || norm === "CLICKS") norm = "MAXIMIZE_CLICKS";
    else if (norm === "MANUAL_CPC" || norm === "MANUAL") norm = "MANUAL_CPC";

    // Target CPA parsing
    let targetCpa: number | undefined = undefined;
    if (state.targetCpa !== undefined && state.targetCpa !== null && String(state.targetCpa).trim() !== "") {
      targetCpa = this.parseBudget(state.targetCpa, "targetCpa");
    }

    // Target ROAS parsing
    let targetRoas: number | undefined = undefined;
    if (state.targetRoas !== undefined && state.targetRoas !== null && String(state.targetRoas).trim() !== "") {
      const roasClean = String(state.targetRoas).replace(/%/g, "").trim();
      const roasNum = Number(roasClean);
      if (isNaN(roasNum) || !isFinite(roasNum) || roasNum <= 0) {
        throw new CampaignValidationError("Target ROAS must be a positive percentage (> 0).", "INVALID_TARGET_ROAS", "targetRoas");
      }
      targetRoas = Math.round(roasNum * 100) / 100;
    }

    // Mutual Exclusivity Check
    if (targetCpa !== undefined && targetRoas !== undefined) {
      throw new CampaignValidationError(
        "Target CPA and Target ROAS cannot both be specified simultaneously. Choose one target metric based on your bidding strategy.",
        "CONFLICTING_BID_TARGETS",
        "targetCpa"
      );
    }

    // Target CPA compatibility
    if (targetCpa !== undefined && (norm === "MAXIMIZE_CONVERSION_VALUE" || norm === "TARGET_ROAS")) {
      throw new CampaignValidationError(
        `Target CPA cannot be set when bidding strategy is ${norm}.`,
        "INCOMPATIBLE_TARGET_CPA",
        "targetCpa"
      );
    }

    // Target ROAS compatibility
    if (targetRoas !== undefined && (norm === "MAXIMIZE_CONVERSIONS" || norm === "TARGET_CPA")) {
      throw new CampaignValidationError(
        `Target ROAS cannot be set when bidding strategy is ${norm}.`,
        "INCOMPATIBLE_TARGET_ROAS",
        "targetRoas"
      );
    }

    // If TOTAL budget is used, check strategy compatibility
    if (budgetType === "TOTAL") {
      const compat = isBiddingStrategyCompatibleWithTotalBudget(campaignType, norm);
      if (!compat.isCompatible) {
        throw new CampaignValidationError(
          compat.reason || `Bidding strategy "${norm}" is not compatible with Campaign Total Budgets for ${campaignType}.`,
          "BIDDING_STRATEGY_INCOMPATIBLE_WITH_TOTAL_BUDGET",
          "biddingStrategy"
        );
      }
    }

    let maxCpcLimit: number | undefined = undefined;
    if (state.maxCpcLimit !== undefined && state.maxCpcLimit !== null && String(state.maxCpcLimit).trim() !== "") {
      maxCpcLimit = this.parseBudget(state.maxCpcLimit, "maxCpcLimit");
    }

    return {
      strategy: norm,
      uiLabel: rawFocus,
      targetCpa,
      targetRoas,
      maxCpcLimit
    };
  }

  /**
   * Normalizes languages separating UI "All languages" from actual criteria.
   */
  public static normalizeLanguages(state: any): NormalizedLanguages {
    const rawInputs: string[] = [];
    if (state.language && typeof state.language === "string") {
      rawInputs.push(...state.language.split(",").map((l: string) => l.trim()).filter(Boolean));
    }
    if (Array.isArray(state.languages)) {
      for (const item of state.languages) {
        if (typeof item === "string" && item.includes(",")) {
          rawInputs.push(...item.split(",").map((l: string) => l.trim()).filter(Boolean));
        } else if (item) {
          rawInputs.push(String(item).trim());
        }
      }
    }

    const isAll = rawInputs.length === 0 || rawInputs.some((l: string) =>
      ["all languages", "all", "any", "all_languages", "all languages / unrestricted"].includes(l.toLowerCase())
    );

    const filtered = isAll ? [] : Array.from(new Set(rawInputs)).filter(
      (l: string) => !["all languages", "all", "any", "all_languages"].includes(l.toLowerCase())
    );

    return {
      unrestricted: isAll,
      languages: isAll ? ["All languages"] : (filtered.length > 0 ? filtered : ["All languages"]),
      rawInputs
    };
  }

  /**
   * Normalizes locations ensuring valid array and structure.
   */
  public static normalizeLocations(state: any): NormalizedLocations {
    const rawLocs = state.locations || (state.location ? [state.location] : []);
    const locArray: string[] = Array.isArray(rawLocs) ? rawLocs.map(String).map(s => s.trim()).filter(Boolean) : [];

    const detailed: NormalizedLocation[] = locArray.map(locStr => {
      // Check if radius targeting pattern exists e.g. "25 km around Bengaluru"
      const radiusMatch = locStr.match(/^(\d+(?:\.\d+)?)\s*(km|mi|miles|kilometers)\s+around\s+(.+)$/i);
      if (radiusMatch) {
        return {
          name: radiusMatch[3].trim(),
          radius: Number(radiusMatch[1]),
          radiusUnits: radiusMatch[2].toLowerCase().startsWith("mi") ? "MILES" : "KILOMETERS"
        };
      }
      return { name: locStr };
    });

    return {
      locations: locArray.length > 0 ? locArray : ["India"],
      detailedLocations: detailed.length > 0 ? detailed : [{ name: "India" }],
      positiveGeoTargetType: state.positiveGeoTargetType || state.locationOptionsPresence || "PRESENCE_INTEREST",
      negativeGeoTargetType: state.negativeGeoTargetType || state.locationOptionsExclude || "PRESENCE"
    };
  }

  /**
   * Normalizes and strictly validates landing page URL.
   */
  public static validateFinalUrl(urlRaw?: string): string {
    const url = String(urlRaw || "").trim();
    if (!url) {
      throw new CampaignValidationError("Landing page URL is required.", "MISSING_FINAL_URL", "website");
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new CampaignValidationError("Landing page URL must begin with http:// or https://.", "INVALID_URL_PROTOCOL", "website");
    }

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (
        host === "example.com" ||
        host.endsWith(".example.com") ||
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "test.com"
      ) {
        throw new CampaignValidationError(
          `Cannot use placeholder or local domain (${host}) as final URL for campaign creation.`,
          "FORBIDDEN_PLACEHOLDER_DOMAIN",
          "website"
        );
      }
      return url;
    } catch (e: any) {
      if (e instanceof CampaignValidationError) throw e;
      throw new CampaignValidationError(`Invalid landing page URL format: "${url}".`, "MALFORMED_FINAL_URL", "website");
    }
  }

  /**
   * Normalizes customer acquisition mode for Performance Max campaigns.
   * Maps UI choices and aliases to official Google Ads API CustomerAcquisitionOptimizationMode enums:
   * - "EQUAL" / "ALL_CUSTOMERS" / "TARGET_ALL_EQUALLY" -> "TARGET_ALL_EQUALLY"
   * - "BID_HIGHER" / "BID_HIGHER_FOR_NEW_CUSTOMERS" -> "BID_HIGHER_FOR_NEW_CUSTOMERS"
   * - "ONLY_NEW" / "NEW_CUSTOMERS_ONLY" / "TARGET_NEW_CUSTOMER_ONLY" / "BID_ONLY_FOR_NEW_CUSTOMERS" -> "TARGET_NEW_CUSTOMER_ONLY"
   */
  public static normalizeCustomerAcquisitionMode(modeRaw?: any): "TARGET_ALL_EQUALLY" | "BID_HIGHER_FOR_NEW_CUSTOMERS" | "TARGET_NEW_CUSTOMER_ONLY" {
    if (!modeRaw) return "TARGET_ALL_EQUALLY";
    const mode = String(modeRaw).trim().toUpperCase();
    if (mode === "BID_HIGHER" || mode === "BID_HIGHER_FOR_NEW_CUSTOMERS") {
      return "BID_HIGHER_FOR_NEW_CUSTOMERS";
    }
    if (mode === "ONLY_NEW" || mode === "NEW_CUSTOMERS_ONLY" || mode === "TARGET_NEW_CUSTOMER_ONLY" || mode === "BID_ONLY_FOR_NEW_CUSTOMERS") {
      return "TARGET_NEW_CUSTOMER_ONLY";
    }
    return "TARGET_ALL_EQUALLY";
  }
}

