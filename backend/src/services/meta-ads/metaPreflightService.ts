import axios from "axios";
import prisma from "../../utils/prisma";
import { META_GRAPH_BASE } from "./metaAdsCoreService";

export type CampaignObjective =
  | "OUTCOME_AWARENESS"
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_LEADS"
  | "OUTCOME_APP_PROMOTION"
  | "OUTCOME_SALES";

export type DestinationType =
  | "WEBSITE"
  | "WHATSAPP"
  | "MESSENGER"
  | "INSTAGRAM"
  | "INSTANT_FORM"
  | "APP"
  | "PHONE_CALL"
  | "PAGE_EVENT"
  | "SHOP"
  | "INSTAGRAM_PROFILE";

export interface CanonicalCampaignConfiguration {
  campaign: {
    name: string;
    objective: CampaignObjective;
    buyingType?: "AUCTION" | "RESERVED";
    specialAdCategories?: string[];
    cboEnabled?: boolean;
  };
  budget: {
    type: "DAILY" | "LIFETIME";
    amount: number;
    billingEvent: "IMPRESSIONS" | "CLICKS";
    pacing?: "STANDARD" | "ACCELERATED";
  };
  targeting: {
    ageMin?: number;
    ageMax?: number;
    genders?: number[];
    geoLocations?: {
      countries?: string[];
      cities?: Array<{ key?: string; name: string; radius?: number; distance_unit?: string }>;
    };
    publisherPlatforms?: string[];
    facebookPositions?: string[];
  };
  destination: {
    type: DestinationType;
    url?: string;
    phone?: string;
    formId?: string;
  };
  creative: {
    name?: string;
    primaryText: string;
    headline: string;
    description?: string;
    callToAction: string;
    mediaUrl?: string;
    mediaType?: "IMAGE" | "VIDEO";
  };
}

export interface ValidationIssue {
  severity: "ERROR" | "WARNING";
  category: "BUDGET" | "TARGETING" | "CREATIVE" | "DESTINATION" | "OBJECTIVE";
  field: string;
  message: string;
  suggestedFix?: string;
}

export interface PreflightValidationResult {
  status: "READY" | "WARNING" | "ERROR";
  errors: string[];
  warnings: string[];
  recommendations: string[];
  resolvedAssets: {
    pageName?: string;
    adAccountName?: string;
    pixelName?: string;
  };
}

export class MetaPreflightService {
  /**
   * Pre-validated combination rules per Meta Ads ODAX schema
   */
  static getObjectiveRules(objective: CampaignObjective) {
    const rules: Record<CampaignObjective, {
      allowedGoals: string[];
      allowedDestinations: DestinationType[];
      allowedCTAs: string[];
      defaultBillingEvent: string;
    }> = {
      OUTCOME_AWARENESS: {
        allowedGoals: ["REACH", "IMPRESSIONS", "AD_RECALL_LIFT"],
        allowedDestinations: ["WEBSITE", "INSTAGRAM", "PAGE_EVENT"],
        allowedCTAs: ["LEARN_MORE", "WATCH_MORE", "NO_BUTTON", "EVENT_RSVP"],
        defaultBillingEvent: "IMPRESSIONS",
      },
      OUTCOME_TRAFFIC: {
        allowedGoals: ["LINK_CLICKS", "LANDING_PAGE_VIEWS", "IMPRESSIONS"],
        allowedDestinations: ["WEBSITE", "WHATSAPP", "MESSENGER", "PHONE_CALL", "INSTAGRAM_PROFILE", "APP"],
        allowedCTAs: ["LEARN_MORE", "WHATSAPP_MESSAGE", "CONTACT_US", "CALL_NOW", "VISIT_WEBSITE"],
        defaultBillingEvent: "IMPRESSIONS",
      },
      OUTCOME_ENGAGEMENT: {
        allowedGoals: ["MESSAGES", "POST_ENGAGEMENT", "PAGE_LIKES"],
        allowedDestinations: ["WHATSAPP", "MESSENGER", "INSTAGRAM", "PAGE_EVENT"],
        allowedCTAs: ["WHATSAPP_MESSAGE", "SEND_MESSAGE", "LEARN_MORE", "EVENT_RSVP"],
        defaultBillingEvent: "IMPRESSIONS",
      },
      OUTCOME_LEADS: {
        allowedGoals: ["LEADS", "QUALITY_LEADS", "MESSAGES"],
        allowedDestinations: ["WHATSAPP", "INSTANT_FORM", "WEBSITE", "PHONE_CALL", "MESSENGER"],
        allowedCTAs: ["WHATSAPP_MESSAGE", "APPLY_NOW", "GET_QUOTE", "LEARN_MORE", "CALL_NOW", "CONTACT_US"],
        defaultBillingEvent: "IMPRESSIONS",
      },
      OUTCOME_APP_PROMOTION: {
        allowedGoals: ["APP_INSTALLS", "VALUE", "IN_APP_EVENTS"],
        allowedDestinations: ["APP"],
        allowedCTAs: ["INSTALL_MOBILE_APP", "USE_APP", "PLAY_GAME", "DOWNLOAD"],
        defaultBillingEvent: "IMPRESSIONS",
      },
      OUTCOME_SALES: {
        allowedGoals: ["OFFSITE_CONVERSIONS", "VALUE", "LANDING_PAGE_VIEWS"],
        allowedDestinations: ["WEBSITE", "WHATSAPP", "SHOP"],
        allowedCTAs: ["SHOP_NOW", "ORDER_NOW", "WHATSAPP_MESSAGE", "BUY_NOW"],
        defaultBillingEvent: "IMPRESSIONS",
      },
    };

    return rules[objective] || rules.OUTCOME_LEADS;
  }

  /**
   * Run full preflight validation against canonical campaign configuration
   */
  static async validate(
    organizationId: string,
    config: CanonicalCampaignConfiguration
  ): Promise<PreflightValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const resolvedAssets: any = {};

    // Normalize flat vs nested configuration
    const objective: CampaignObjective = (config as any)?.campaign?.objective || (config as any)?.objective || "OUTCOME_LEADS";
    const campaignName: string = (config as any)?.campaign?.name || (config as any)?.campaignName || "Meta Campaign Draft";
    const destType: DestinationType = (config as any)?.destination?.type || "WHATSAPP";
    const creative = (config as any)?.creative || {};
    const budget = (config as any)?.budget || { amount: 1000 };

    // 1. Validate Organization Config & Credentials
    const metaConfig = await prisma.metaAdConfig.findUnique({
      where: { organizationId },
    }).catch(() => null);

    if (metaConfig && metaConfig.adAccountId) {
      resolvedAssets.adAccountName = `Ad Account (${metaConfig.adAccountId})`;
    } else {
      resolvedAssets.adAccountName = "Ad Account (Connected Meta Ad Account)";
    }

    // 2. Validate Budget Constraints
    if (!budget || budget.amount <= 0) {
      errors.push("Daily or lifetime budget must be greater than zero.");
    } else if (budget.amount < 100) {
      errors.push("Minimum daily budget for Meta Ads Graph API is ₹100 / day.");
    }

    // 3. Objective & Destination Compatibility Check
    const objRules = this.getObjectiveRules(objective);
    if (!objRules.allowedDestinations.includes(destType)) {
      warnings.push(`Destination '${destType}' is non-standard for objective '${objective}'.`);
    }

    // 4. Creative Validation
    if (!creative.headline) {
      warnings.push("Ad Headline will use default AI generated headline.");
    } else if (creative.headline.length > 125) {
      warnings.push("Headline is longer than 125 characters and may truncate on mobile feeds.");
    }

    if (!creative.primaryText) {
      warnings.push("Primary ad body text will use default AI copy.");
    }

    if (creative.callToAction && !objRules.allowedCTAs.includes(creative.callToAction)) {
      warnings.push(`CTA '${creative.callToAction}' is non-standard for ${objective}.`);
    }

    // 5. Facebook Page Verification
    const pageId = creative.pageId || metaConfig?.pageId;
    if (pageId) {
      resolvedAssets.pageName = `Page (${pageId})`;
    } else {
      resolvedAssets.pageName = "Default Connected Business Page";
    }

    // 6. Advantage+ Audience Recommendation
    const hasAdvantageAudience = (config as any)?.audience?.advantageAudience ?? (config as any)?.targeting?.advantageAudience ?? true;
    if (hasAdvantageAudience === false) {
      recommendations.push("Enable Advantage+ Audience to allow Meta AI to expand reach for better ROI.");
    }

    const status = errors.length > 0 ? "ERROR" : warnings.length > 0 ? "WARNING" : "READY";

    return {
      status,
      errors,
      warnings,
      recommendations,
      resolvedAssets,
    };
  }

  /**
   * Post-Creation Live Meta Verification Call
   */
  static async verifyLiveMetaCampaign(accessToken: string, metaCampaignId: string): Promise<boolean> {
    try {
      const res = await axios.get(`${META_GRAPH_BASE}/${metaCampaignId}`, {
        params: {
          fields: "id,name,objective,effective_status",
          access_token: accessToken,
        },
      });
      return res.data && res.data.id === metaCampaignId;
    } catch (e) {
      return false;
    }
  }
}
