import {
  CommonCampaignRules,
  SearchCampaignRules,
  PerformanceMaxCampaignRules,
  DisplayCampaignRules,
  DemandGenCampaignRules,
  ShoppingCampaignRules,
  AppCampaignRules,
  StructuredCampaignError
} from "./GoogleAdsCampaignRules";
import { YouTubeService } from "../../youtubeService";

export interface ValidationError {
  field: string;
  message: string;
  type: "FIELD" | "ASSET" | "BUDGET" | "TARGETING";
  code?: string;
  severity?: "BLOCKING" | "WARNING";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  missingSummary: string[];
}

export class GoogleAdsCampaignValidator {
  /**
   * Deterministically validates campaign state according to current official Google Ads API contract.
   * Dispatches to dedicated campaign rules without silent auto-relabeling or fallback hacks.
   */
  public static validate(state: any): ValidationResult {
    const errors: ValidationError[] = [];
    const missingSummary: string[] = [];

    if (!state || !state.campaignType) {
      errors.push({
        field: "campaignType",
        message: "Campaign type is required.",
        type: "FIELD",
        code: "MISSING_CAMPAIGN_TYPE",
        severity: "BLOCKING"
      });
      missingSummary.push("Campaign type is required.");
      return { isValid: false, errors, missingSummary };
    }

    const type = String(state.campaignType).toUpperCase().trim();

    // Direct legacy VIDEO campaigns cannot be created through Google Ads API
    if (type === "VIDEO") {
      errors.push({
        field: "campaignType",
        message: "Creating new campaigns with advertising_channel_type = VIDEO is not supported in the Google Ads API. Video advertising must be created via DEMAND_GEN with VIDEO ad format.",
        type: "FIELD",
        code: "DIRECT_VIDEO_CAMPAIGN_UNSUPPORTED",
        severity: "BLOCKING"
      });
      missingSummary.push("Direct VIDEO campaign creation is unsupported. Please map to Demand Gen Video format.");
      return { isValid: false, errors, missingSummary };
    }

    // 1. Common Campaign Rules
    const commonErrors: StructuredCampaignError[] = CommonCampaignRules.validate(state);

    // 2. Campaign Specific Rules
    let specificErrors: StructuredCampaignError[] = [];
    switch (type) {
      case "SEARCH":
        specificErrors = SearchCampaignRules.validate(state);
        break;
      case "PERFORMANCE_MAX":
        specificErrors = PerformanceMaxCampaignRules.validate(state);
        break;
      case "DISPLAY":
        specificErrors = DisplayCampaignRules.validate(state);
        break;
      case "DEMAND_GEN":
        specificErrors = DemandGenCampaignRules.validate(state);
        break;
      case "SHOPPING":
        specificErrors = ShoppingCampaignRules.validate(state);
        break;
      case "APP":
        specificErrors = AppCampaignRules.validate(state);
        break;
      default:
        specificErrors.push({
          code: "UNSUPPORTED_CAMPAIGN_TYPE",
          field: "campaignType",
          message: `Unsupported campaign type: ${state.campaignType}`,
          severity: "BLOCKING"
        });
        break;
    }

    const allErrors = [...commonErrors, ...specificErrors];

    for (const err of allErrors) {
      let errType: "FIELD" | "ASSET" | "BUDGET" | "TARGETING" = "FIELD";
      if (err.field.includes("Budget") || err.field.includes("budget") || err.field === "amount") {
        errType = "BUDGET";
      } else if (err.field.includes("Image") || err.field.includes("image") || err.field.includes("logo") || err.field.includes("video") || err.field.includes("card")) {
        errType = "ASSET";
      } else if (err.field.includes("location") || err.field.includes("language") || err.field.includes("schedule")) {
        errType = "TARGETING";
      }

      errors.push({
        field: err.field,
        message: err.message,
        type: errType,
        code: err.code,
        severity: err.severity
      });
      missingSummary.push(err.message);
    }

    const hasBlocking = errors.some(e => e.severity === "BLOCKING" || !e.severity);

    return {
      isValid: !hasBlocking,
      errors,
      missingSummary
    };
  }

  /**
   * Deterministically validates campaign state asynchronously, querying live YouTube authentication
   * status via YouTubeService.getOrganizationConnectionStatus(organizationId) when organizationId is provided.
   */
  public static async validateAsync(state: any, organizationId?: string): Promise<ValidationResult> {
    const clone = { ...state };
    if (organizationId && (clone.isYouTubeConnected === undefined || clone.isYouTubeConnected === null)) {
      try {
        const ytStatus = await YouTubeService.getOrganizationConnectionStatus(organizationId);
        clone.isYouTubeConnected = Boolean(ytStatus.isConnected);
      } catch (err: any) {
        console.warn("[GoogleAdsCampaignValidator] Could not check YouTube connection status:", err?.message);
        clone.isYouTubeConnected = false;
      }
    }
    return this.validate(clone);
  }
}
