import { MetaCampaignDraft } from "./metaCampaignDraftService";
import { MetaAdsContext } from "./metaAIContextService";
import { MetaAdsCapabilityService } from "./metaAdsCapabilityService";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface DraftValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export class MetaCampaignValidationService {
  /**
   * Validate a campaign draft against account context, Meta policies, and capability rules
   */
  static validateDraft(draft: MetaCampaignDraft, context: MetaAdsContext): DraftValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Validate Meta Ad Account
    if (!draft.adAccountId && !context.activeAdAccountId && context.adAccounts.length === 0) {
      errors.push({
        field: "adAccountId",
        message: "No connected Meta Ad Account found. Please connect your Meta account first.",
        code: "META_ACCOUNT_MISSING",
      });
    }

    // 2. Validate Budget Constraints
    const currency = draft.campaign.currency || "INR";
    const minBudget = MetaAdsCapabilityService.getMinimumDailyBudget(currency);
    const dailyBudget = draft.campaign.dailyBudget;

    if (!dailyBudget || dailyBudget <= 0) {
      errors.push({
        field: "campaign.dailyBudget",
        message: "A daily budget is required to launch the campaign.",
        code: "BUDGET_MISSING",
      });
    } else if (dailyBudget < minBudget) {
      errors.push({
        field: "campaign.dailyBudget",
        message: `Daily budget must be at least ₹${minBudget} / day for Meta Ads.`,
        code: "BUDGET_TOO_LOW",
      });
    }

    // 3. Validate Destination
    const destType = draft.destination.type || "WHATSAPP";
    if (destType === "WHATSAPP") {
      if (context.whatsAppNumbers.length === 0 && !draft.destination.whatsappPhoneNumber) {
        warnings.push({
          field: "destination.whatsappPhoneNumber",
          message: "No verified WhatsApp number found in Page assets. Meta will use the default business WhatsApp if available.",
        });
      }
    } else if (destType === "WEBSITE") {
      if (!draft.destination.destinationUrl || !draft.destination.destinationUrl.startsWith("http")) {
        errors.push({
          field: "destination.destinationUrl",
          message: "A valid website landing page URL starting with https:// is required.",
          code: "INVALID_WEBSITE_URL",
        });
      }
    } else if (destType === "INSTANT_FORM") {
      if (!draft.destination.leadGenFormId) {
        warnings.push({
          field: "destination.leadGenFormId",
          message: "No specific Instant Form selected. Meta AI will use the latest available Page lead form.",
        });
      }
    }

    // 4. Validate Location Targeting
    const loc = draft.targeting;
    const hasLocation =
      (loc.cities && loc.cities.length > 0) ||
      loc.locationDescription ||
      loc.locationType === "ALL_INDIA" ||
      loc.radiusKm;

    if (!hasLocation) {
      errors.push({
        field: "targeting.location",
        message: "Please specify target location or city (e.g. Pune, Mumbai, All India).",
        code: "LOCATION_MISSING",
      });
    }

    // 6. Learning Phase Evaluation (Conversion Volume Math)
    const cpa = context.accountMetrics?.avgCpa || 72.20;
    if (dailyBudget && dailyBudget > 0) {
      const learningEval = MetaCampaignValidationService.evaluateLearningPhase(dailyBudget, cpa);
      if (learningEval.status === "FAIL" || learningEval.status === "LEARNING_LIMITED") {
        warnings.push({
          field: "campaign.dailyBudget",
          message: learningEval.advice,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Conversion Volume Math: Evaluates weekly volume against the 50-event threshold to exit learning phase
   */
  static evaluateLearningPhase(dailyBudget: number, cpa: number): { weeklyVolume: number; status: "PASS" | "LEARNING_LIMITED" | "FAIL"; advice: string } {
    const validCpa = cpa > 0 ? cpa : 72.20;
    const weeklyConversions = (dailyBudget / validCpa) * 7;
    const roundedVolume = Math.round(weeklyConversions);

    if (weeklyConversions >= 50) {
      return {
        weeklyVolume: roundedVolume,
        status: "PASS",
        advice: `Your budget is sufficient to exit the learning phase (~${roundedVolume} conversions/week).`,
      };
    } else if (weeklyConversions >= 10) {
      const suggestedBudget = Math.ceil(((validCpa * 50) / 7) * 1.2);
      return {
        weeklyVolume: roundedVolume,
        status: "LEARNING_LIMITED",
        advice: `Estimated weekly volume (~${roundedVolume}/week) may struggle to exit the learning phase (50 events/week needed). Consider increasing budget to ~₹${suggestedBudget}/day.`,
      };
    } else {
      const targetBudget = Math.ceil((validCpa * 50) / 7);
      return {
        weeklyVolume: roundedVolume,
        status: "FAIL",
        advice: `Estimated volume is too low (~${roundedVolume} results/week). Meta needs ~50 events/week to optimize effectively. Target ~₹${targetBudget}/day to exit learning.`,
      };
    }
  }

  /**
   * Compliance: Scan for Special Ad Category (SAC) triggers (Credit, Housing, Employment) and enforce restrictions
   */
  static checkAndEnforceSAC(draft: MetaCampaignDraft, businessText: string): boolean {
    const lower = (businessText || "").toLowerCase();
    let detectedCategory: string | null = null;

    if (lower.includes("loan") || lower.includes("credit") || lower.includes("mortgage") || lower.includes("insurance") || lower.includes("banking")) {
      detectedCategory = "FINANCIAL_PRODUCTS_SERVICES";
    } else if (lower.includes("real estate") || lower.includes("flat") || lower.includes("apartment") || lower.includes("rent") || lower.includes("housing") || lower.includes("property")) {
      detectedCategory = "HOUSING";
    } else if (lower.includes("job") || lower.includes("hiring") || lower.includes("recruitment") || lower.includes("employment") || lower.includes("career")) {
      detectedCategory = "EMPLOYMENT";
    }

    if (detectedCategory) {
      draft.campaign.specialAdCategory = detectedCategory;
      draft.targeting.ageMin = 18;
      draft.targeting.ageMax = 65;
      draft.targeting.gender = "ALL";
      if (!draft.targeting.radiusKm || draft.targeting.radiusKm < 15) {
        draft.targeting.radiusKm = 15;
      }
      return true;
    }
    return false;
  }
}
