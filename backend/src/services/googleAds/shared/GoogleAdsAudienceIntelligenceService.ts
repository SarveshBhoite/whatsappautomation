import { GoogleAdsAudienceService } from "../GoogleAdsAudienceService";
import { CustomerBusinessProfileService } from "../CustomerBusinessProfileService";
import { validateCustomerOwnership } from "../../../utils/customerOwnership";
import { AudienceIntelligenceItem, AudienceIntelligenceSource } from "../shared/CampaignPlan";

export interface AudienceIntelligenceResult {
  campaignType: string;
  supportsAudienceSignals: boolean;
  message?: string;
  audienceIntelligence: AudienceIntelligenceItem[];
  profilePersonasCount: number;
  customerMatchListsCount: number;
  customAudiencesCount: number;
  audienceStatus: "SUCCESS" | "UNAVAILABLE" | "SKIPPED";
}

export class GoogleAdsAudienceIntelligenceService {
  /**
   * Deterministically calculates relevance reasons matching business personas/products with audience names.
   */
  private static determineRelevance(
    audienceName: string,
    audienceType: string,
    businessContext: {
      businessName?: string;
      products?: string[];
      personas?: string[];
      targetAudiences?: string[];
    }
  ): { relevanceReason: string; recommended: boolean } {
    const lowerName = (audienceName || "").toLowerCase();
    const allContextTerms = [
      ...(businessContext.products || []),
      ...(businessContext.personas || []),
      ...(businessContext.targetAudiences || [])
    ]
      .map(t => (typeof t === "string" ? t.toLowerCase().trim() : ""))
      .filter(t => t.length > 2);

    // 1. Direct persona / keyword match
    for (const term of allContextTerms) {
      if (lowerName.includes(term) || term.includes(lowerName)) {
        return {
          relevanceReason: `Matches the "${term}" audience defined in your business profile.`,
          recommended: true
        };
      }
    }

    // 2. Customer match conversion intent
    if (audienceType === "CRM_BASED" || lowerName.includes("purchas") || lowerName.includes("customer") || lowerName.includes("client") || lowerName.includes("buyer")) {
      return {
        relevanceReason: "Useful for reaching existing customers with relevant offers and cross-sell signals.",
        recommended: true
      };
    }

    // 3. Website visitors / Remarketing
    if (lowerName.includes("visitor") || lowerName.includes("lead") || lowerName.includes("cart") || lowerName.includes("checkout")) {
      return {
        relevanceReason: "High-intent remarketing signal to re-engage previous site visitors.",
        recommended: true
      };
    }

    // 4. Custom Audience keyword/interest signal
    if (audienceType === "SEARCH" || audienceType === "INTEREST" || audienceType === "AUTO") {
      return {
        relevanceReason: "Targets users showing active search interest related to your industry.",
        recommended: false
      };
    }

    return {
      relevanceReason: "Available first-party audience signal for algorithmic campaign targeting.",
      recommended: false
    };
  }

  /**
   * Reads and synthesizes audience intelligence from Google Ads Customer Match,
   * Custom Audiences, and CustomerBusinessProfile personas.
   */
  public static async gatherIntelligence(
    organizationId: string,
    customerId: string,
    campaignType: string
  ): Promise<AudienceIntelligenceResult> {
    const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";
    const cleanType = (campaignType || "PERFORMANCE_MAX").toUpperCase();

    // 1. Customer Isolation check
    if (!organizationId || !cleanCid) {
      throw new Error("organizationId and customerId are required for audience intelligence.");
    }

    const isOwned = await validateCustomerOwnership(organizationId, cleanCid);
    if (!isOwned) {
      throw new Error("Access denied. Customer ID does not belong to this organization.");
    }

    // 2. Campaign Type Guardrails
    // Performance Max, Demand Gen, Display, and Video heavily utilize audience signals.
    // For Search, audience signals are optional/not mandatory.
    // For Shopping & App, support depends on the respective subservice.
    const primaryAudienceTypes = ["PERFORMANCE_MAX", "DEMAND_GEN", "DISPLAY", "VIDEO", "SEARCH", "SHOPPING", "APP"];
    if (!primaryAudienceTypes.includes(cleanType)) {
      return {
        campaignType: cleanType,
        supportsAudienceSignals: false,
        message: `Audience signals are not supported for campaign type: ${cleanType}.`,
        audienceIntelligence: [],
        profilePersonasCount: 0,
        customerMatchListsCount: 0,
        customAudiencesCount: 0,
        audienceStatus: "SKIPPED"
      };
    }

    // 3. Read Business Profile for personas and target context
    let profileBusinessName = "";
    const profileProducts: string[] = [];
    const profilePersonas: string[] = [];
    const profileTargetAudiences: string[] = [];

    try {
      const profile = await CustomerBusinessProfileService.getProfile(organizationId, cleanCid);
      if (profile) {
        profileBusinessName = profile.businessName || "";
        if (Array.isArray(profile.products)) {
          for (const p of profile.products) {
            if (p?.name && typeof p.name === "string") profileProducts.push(p.name);
          }
        }
        if (Array.isArray(profile.services)) {
          for (const s of profile.services) {
            if (s?.name && typeof s.name === "string") profileProducts.push(s.name);
          }
        }
        if (Array.isArray(profile.customerPersonas)) {
          for (const cp of profile.customerPersonas) {
            if (cp?.name && typeof cp.name === "string") profilePersonas.push(cp.name);
            if (Array.isArray(cp?.interests)) profilePersonas.push(...cp.interests);
          }
        }
        if (Array.isArray(profile.targetAudiences)) {
          for (const ta of profile.targetAudiences) {
            if (ta?.name && typeof ta.name === "string") profileTargetAudiences.push(ta.name);
            if (Array.isArray(ta?.interests)) profileTargetAudiences.push(...ta.interests);
          }
        }
      }
    } catch (profileErr: any) {
      console.warn("[GoogleAdsAudienceIntelligenceService] Could not read business profile personas:", profileErr.message);
    }

    const businessContext = {
      businessName: profileBusinessName,
      products: profileProducts,
      personas: profilePersonas,
      targetAudiences: profileTargetAudiences
    };

    const items: AudienceIntelligenceItem[] = [];
    let audienceStatus: "SUCCESS" | "UNAVAILABLE" | "SKIPPED" = "SUCCESS";
    let customerMatchCount = 0;
    let customAudienceCount = 0;

    // 4. Fetch Google Ads Customer Match / User Lists (Metadata only — zero raw PII)
    try {
      const userLists = await GoogleAdsAudienceService.listCustomerMatchLists(organizationId, cleanCid);
      customerMatchCount = userLists.length;

      for (const ul of userLists) {
        const { relevanceReason, recommended } = this.determineRelevance(ul.name, ul.type, businessContext);
        items.push({
          id: ul.id,
          name: ul.name,
          source: "CUSTOMER_MATCH",
          type: "Customer Match (CRM)",
          status: ul.membershipStatus || "OPEN",
          memberCount: ul.sizeForSearch || ul.sizeForDisplay || undefined,
          relevanceReason,
          recommended,
          approved: false,
          resourceName: ul.resourceName
        });
      }
    } catch (cmErr: any) {
      console.warn("[GoogleAdsAudienceIntelligenceService] listCustomerMatchLists notice:", cmErr?.response?.data || cmErr.message);
      audienceStatus = "UNAVAILABLE";
    }

    // 5. Fetch Google Ads Custom Audiences
    try {
      const customAudiences = await GoogleAdsAudienceService.listCustomAudiences(organizationId, cleanCid);
      customAudienceCount = customAudiences.length;

      for (const ca of customAudiences) {
        const { relevanceReason, recommended } = this.determineRelevance(ca.name, ca.type, businessContext);
        items.push({
          id: ca.id,
          name: ca.name,
          source: "CUSTOM_AUDIENCE",
          type: `Custom Segment (${ca.type})`,
          status: ca.status || "ENABLED",
          relevanceReason,
          recommended,
          approved: false,
          resourceName: ca.resourceName
        });
      }
    } catch (caErr: any) {
      console.warn("[GoogleAdsAudienceIntelligenceService] listCustomAudiences notice:", caErr?.response?.data || caErr.message);
      if (items.length === 0) {
        audienceStatus = "UNAVAILABLE";
      }
    }

    // 6. Surface Profile Personas as CRM Profile Audience Candidates if no direct user lists match
    if (profilePersonas.length > 0) {
      for (const [idx, personaName] of profilePersonas.slice(0, 3).entries()) {
        const alreadyExists = items.some(i => i.name.toLowerCase() === personaName.toLowerCase());
        if (!alreadyExists) {
          items.push({
            id: `persona-${idx + 1}`,
            name: personaName,
            source: "CRM_PROFILE",
            type: "Business Profile Persona",
            status: "ACTIVE",
            relevanceReason: `Derived from target persona profile: "${personaName}".`,
            recommended: true,
            approved: false
          });
        }
      }
    }

    // Sort: recommended first
    items.sort((a, b) => (b.recommended === a.recommended ? 0 : b.recommended ? 1 : -1));

    return {
      campaignType: cleanType,
      supportsAudienceSignals: true,
      audienceIntelligence: items,
      profilePersonasCount: profilePersonas.length,
      customerMatchListsCount: customerMatchCount,
      customAudiencesCount: customAudienceCount,
      audienceStatus
    };
  }
}
