import { MetaCampaignDraft } from "./metaCampaignDraftService";

export interface CampaignPlanStrategy {
  businessGoal: "INCREASE_BOOKINGS" | "GENERATE_LEADS" | "DRIVE_SALES" | "BUILD_AWARENESS" | "INCREASE_TRAFFIC" | "PROMOTE_APP";
  funnelStage: "CONVERSION" | "CONSIDERATION" | "AWARENESS";
  conversionStrategy: "WHATSAPP_CONVERSATION" | "WEBSITE_PURCHASE" | "INSTANT_LEAD_FORM" | "LINK_CLICKS";
  recommendedDestination: "WHATSAPP" | "WEBSITE" | "INSTANT_FORM";
  recommendedObjective: "OUTCOME_LEADS" | "OUTCOME_SALES" | "OUTCOME_TRAFFIC" | "OUTCOME_AWARENESS";
  advantagePlusAudience: boolean;
  advantagePlusBudget: boolean;
  bidStrategy: "LOWEST_COST_WITHOUT_CAP" | "COST_CAP";
  rationale: string;
}

export class MetaCampaignPlanningService {
  /**
   * Deterministic Campaign Planning Layer:
   * Maps User Intent & Business Goal to concrete Meta Ads strategy & ODAX objectives
   */
  static planCampaignStrategy(userGoal: string | null, industryOrOffer?: string | null): CampaignPlanStrategy {
    const text = `${userGoal || ""} ${industryOrOffer || ""}`.toLowerCase();

    // Strategy 1: E-commerce / Online Purchases
    if (text.includes("sell") || text.includes("shop") || text.includes("product") || text.includes("course") || text.includes("store")) {
      return {
        businessGoal: "DRIVE_SALES",
        funnelStage: "CONVERSION",
        conversionStrategy: "WEBSITE_PURCHASE",
        recommendedDestination: "WEBSITE",
        recommendedObjective: "OUTCOME_SALES",
        advantagePlusAudience: true,
        advantagePlusBudget: true,
        bidStrategy: "LOWEST_COST_WITHOUT_CAP",
        rationale: "Sales objective with Website destination leverages Meta pixel signals for maximum direct conversions.",
      };
    }

    // Strategy 2: Local Service Bookings & Inquiries (Rental, Clinic, Real Estate, Salon, Gym, Agency)
    if (
      text.includes("rental") ||
      text.includes("car") ||
      text.includes("lead") ||
      text.includes("enquiry") ||
      text.includes("inquiry") ||
      text.includes("booking") ||
      text.includes("clinic") ||
      text.includes("doctor") ||
      text.includes("salon") ||
      text.includes("service") ||
      text.includes("whatsapp")
    ) {
      return {
        businessGoal: "INCREASE_BOOKINGS",
        funnelStage: "CONVERSION",
        conversionStrategy: "WHATSAPP_CONVERSATION",
        recommendedDestination: "WHATSAPP",
        recommendedObjective: "OUTCOME_LEADS",
        advantagePlusAudience: true,
        advantagePlusBudget: true,
        bidStrategy: "LOWEST_COST_WITHOUT_CAP",
        rationale: "Click-to-WhatsApp Leads campaign creates instant direct conversations, resulting in highest local conversion rates.",
      };
    }

    // Strategy 3: Default High-ROI Direct Response
    return {
      businessGoal: "GENERATE_LEADS",
      funnelStage: "CONVERSION",
      conversionStrategy: "WHATSAPP_CONVERSATION",
      recommendedDestination: "WHATSAPP",
      recommendedObjective: "OUTCOME_LEADS",
      advantagePlusAudience: true,
      advantagePlusBudget: true,
      bidStrategy: "LOWEST_COST_WITHOUT_CAP",
      rationale: "Advantage+ Lead Generation with Meta Advantage audience expansion.",
    };
  }
}
