import { MetaCampaignDraft } from "./metaCampaignDraftService";
import { MetaAdsCapabilityService } from "./metaAdsCapabilityService";
import { MetaAdsContext } from "./metaAIContextService";

export type ValidationSeverity = "ERROR" | "WARNING" | "INFO";

export interface ValidationResultItem {
  severity: ValidationSeverity;
  code: string;
  message: string;
  field?: string;
  blocking: boolean;
  suggestedFix?: string;
}

export interface EnterpriseValidationReport {
  valid: boolean; // true ONLY if there are 0 blocking ERROR severity items
  errors: ValidationResultItem[];
  warnings: ValidationResultItem[];
  info: ValidationResultItem[];
  blockingCount: number;
}

export class MetaCampaignValidationService {
  /**
   * Enterprise-Grade Validation distinguishing Hard Blocker Errors vs Non-blocking Warnings vs Strategic Info
   */
  static validateDraft(draft: MetaCampaignDraft, context: MetaAdsContext): EnterpriseValidationReport {
    const items: ValidationResultItem[] = [];

    // ─────────────────────────────────────────────────────────────
    // 1. HARD BLOCKERS (SEVERITY: ERROR, BLOCKING: TRUE)
    // ─────────────────────────────────────────────────────────────

    // Check 1.1: Meta Ad Account Connectivity
    if (!draft.adAccountId && !context.activeAdAccountId && context.adAccounts.length === 0) {
      items.push({
        severity: "ERROR",
        code: "META_ACCOUNT_MISSING",
        field: "adAccountId",
        message: "No connected Meta Ad Account found. Please connect your Meta account first.",
        blocking: true,
        suggestedFix: "Select or connect an active Meta Ad Account in settings.",
      });
    }

    // Check 1.2: Minimum Daily Budget requirement by currency
    const currency = draft.campaign.currency || "INR";
    const minBudget = MetaAdsCapabilityService.getMinimumDailyBudget(currency);
    const dailyBudget = draft.campaign.dailyBudget;

    if (!dailyBudget || dailyBudget <= 0) {
      items.push({
        severity: "ERROR",
        code: "BUDGET_MISSING",
        field: "campaign.dailyBudget",
        message: "A daily budget is required to launch the campaign.",
        blocking: true,
        suggestedFix: "Provide a daily testing budget (e.g. ₹500/day).",
      });
    } else if (dailyBudget < minBudget) {
      items.push({
        severity: "ERROR",
        code: "BUDGET_TOO_LOW",
        field: "campaign.dailyBudget",
        message: `Daily budget must be at least ₹${minBudget}/day for Meta Ads auction.`,
        blocking: true,
        suggestedFix: `Increase your daily budget to at least ₹${minBudget}.`,
      });
    }

    // Check 1.3: Target Location
    const loc = draft.targeting;
    const hasLocation = Boolean(
      (loc?.cities && loc.cities.length > 0) ||
      (loc?.cityConfigs && loc.cityConfigs.length > 0) ||
      (loc?.countries && loc.countries.length > 0) ||
      (loc?.postalCodes && loc.postalCodes.length > 0) ||
      loc?.locationDescription ||
      loc?.locationType === "ALL_INDIA" ||
      loc?.radiusKm
    );

    if (!hasLocation) {
      items.push({
        severity: "ERROR",
        code: "LOCATION_MISSING",
        field: "targeting.location",
        message: "Please specify target location or operating city (e.g. Pune, Mumbai, All India).",
        blocking: true,
        suggestedFix: "Provide the target city or operating region.",
      });
    }

    // Check 1.4: Destination Validation
    const destType = (draft.destination?.type || "WHATSAPP").toUpperCase();
    if (destType === "WEBSITE") {
      if (!draft.destination.destinationUrl || !draft.destination.destinationUrl.startsWith("http")) {
        items.push({
          severity: "ERROR",
          code: "INVALID_WEBSITE_URL",
          field: "destination.destinationUrl",
          message: "A valid landing page URL starting with https:// is required for Website destination.",
          blocking: true,
          suggestedFix: "Provide a valid website URL (e.g. https://yourbusiness.com).",
        });
      }
    } else if (destType === "APP") {
      if (!draft.destination.appUrl && !draft.destination.destinationUrl) {
        items.push({
          severity: "ERROR",
          code: "APP_URL_MISSING",
          field: "destination.appUrl",
          message: "A Google Play Store or Apple App Store URL is required for Mobile App destination.",
          blocking: true,
          suggestedFix: "Provide your App link (e.g. https://play.google.com/store/apps/details?id=...).",
        });
      }
    } else if (destType === "PHONE_CALL") {
      if (!draft.destination.phoneNumber && !draft.destination.whatsappPhoneNumber) {
        items.push({
          severity: "ERROR",
          code: "PHONE_NUMBER_MISSING",
          field: "destination.phoneNumber",
          message: "A contact phone number is required for Direct Phone Call ads.",
          blocking: true,
          suggestedFix: "Provide a 10-digit phone number (e.g. +91 9876543210).",
        });
      }
    } else if (destType === "WHATSAPP") {
      if (!draft.destination.whatsappPhoneNumber) {
        items.push({
          severity: "ERROR",
          code: "WHATSAPP_NUMBER_MISSING",
          field: "destination.whatsappPhoneNumber",
          message: "A connected WhatsApp phone number is required for Click-to-WhatsApp ads.",
          blocking: true,
          suggestedFix: context.whatsAppNumbers.length > 0
            ? `Select from your verified connected numbers: ${context.whatsAppNumbers.map((n) => n.phoneNumber).join(", ")}`
            : "Connect your WhatsApp number to your Facebook Page, or switch destination to Instant Lead Form.",
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ADVISORY WARNINGS (SEVERITY: WARNING, BLOCKING: FALSE)
    // (Never block campaign launch solely for warnings)
    // ─────────────────────────────────────────────────────────────

    // Warning 2.1: Meta Learning Phase Conversion Math (<50 conversions/week)
    if (dailyBudget && dailyBudget > 0) {
      const avgCpa = context.accountMetrics?.avgCpa || 72.20;
      const estimatedWeeklyConversions = Math.floor(((dailyBudget * 7) / avgCpa));
      if (estimatedWeeklyConversions < 50) {
        items.push({
          severity: "WARNING",
          code: "LEARNING_PHASE_CAPACITY",
          field: "campaign.dailyBudget",
          message: `Estimated ~${estimatedWeeklyConversions} conversions/week at ~₹${avgCpa.toFixed(0)} CPA (Meta recommends ~50/week for complete AI optimization). Campaign can still launch safely.`,
          blocking: false,
          suggestedFix: "Consider scaling budget after initial 3-day validation window.",
        });
      }
    }

    // Validation 2.2: WhatsApp number must be connected with Facebook Page or Meta WABA ID
    if (destType === "WHATSAPP") {
      const cleanDraftPhone = (draft.destination.whatsappPhoneNumber || "").replace(/\D/g, "");
      const isMatched = context.whatsAppNumbers.some((wn) => {
        const cleanWn = (wn.phoneNumber || "").replace(/\D/g, "");
        return cleanWn.endsWith(cleanDraftPhone.slice(-10)) || cleanDraftPhone.endsWith(cleanWn.slice(-10));
      });

      if (cleanDraftPhone && !isMatched && context.whatsAppNumbers.length > 0) {
        items.push({
          severity: "ERROR",
          code: "WHATSAPP_NUMBER_NOT_LINKED_TO_WABA",
          field: "destination.whatsappPhoneNumber",
          message: `The WhatsApp number (${draft.destination.whatsappPhoneNumber}) is not linked to your Facebook Page or Meta WABA ID. Meta strictly requires a linked number.`,
          blocking: true,
          suggestedFix: `Select from your verified connected numbers: ${context.whatsAppNumbers.map((n) => n.phoneNumber).join(", ")}`,
        });
      } else if (!cleanDraftPhone && context.whatsAppNumbers.length === 0) {
        items.push({
          severity: "ERROR",
          code: "WHATSAPP_NUMBER_UNVERIFIED",
          field: "destination.whatsappPhoneNumber",
          message: "No connected WhatsApp WABA found on Page. Meta requires an officially connected WhatsApp Business number to run Click-to-WhatsApp ads.",
          blocking: true,
          suggestedFix: "Link your WhatsApp Business number to your Facebook Page in Meta Business Suite, or select Instant Lead Form.",
        });
      }
    }

    // Warning 2.3: Special Ad Categories (Housing/Credit/Employment)
    const textToCheck = `${draft.campaign.name || ""} ${draft.creative.primaryText || ""} ${draft.creative.headline || ""}`.toLowerCase();
    const sacTerms = ["loan", "credit card", "mortgage", "hiring", "job vacancy", "real estate", "rent flat", "apartment sale"];
    const detectedSAC = sacTerms.find(t => textToCheck.includes(t));
    if (detectedSAC && (!draft.campaign.specialAdCategory || draft.campaign.specialAdCategory === "NONE")) {
      items.push({
        severity: "WARNING",
        code: "SPECIAL_AD_CATEGORY_DETECTED",
        field: "campaign.specialAdCategory",
        message: `Ad content may relate to Special Ad Categories (${detectedSAC}). If flagged by Meta review, category declaration will be needed.`,
        blocking: false,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. STRATEGIC BEST PRACTICES (SEVERITY: INFO, BLOCKING: FALSE)
    // ─────────────────────────────────────────────────────────────
    if (draft.targeting.advantagePlusAudience) {
      items.push({
        severity: "INFO",
        code: "ADVANTAGE_PLUS_AUDIENCE_ENABLED",
        message: "Meta Advantage+ Audience AI is active (leveraging pixel signals and dynamic expansion for lowest CPA).",
        blocking: false,
      });
    }

    const errors = items.filter(i => i.severity === "ERROR");
    const warnings = items.filter(i => i.severity === "WARNING");
    const info = items.filter(i => i.severity === "INFO");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      blockingCount: errors.length,
    };
  }
}
