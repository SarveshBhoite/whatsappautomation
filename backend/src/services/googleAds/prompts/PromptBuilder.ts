import { CaseIdentifier } from "../GoogleAdsAiAssistantService";
import { GOOGLE_ADS_PROMPT_BASE } from "./GoogleAdsPromptBase";

// CASES
import { CASE_1_DISCOVERY_PROMPT } from "./cases/Case1DiscoveryPrompt";
import { CASE_2_OBJECTIVE_PROMPT } from "./cases/Case2ObjectivePrompt";
import { CASE_3_GOALS_PROMPT } from "./cases/Case3GoalsPrompt";
import { CASE_4_CAMPAIGN_TYPE_PROMPT } from "./cases/Case4CampaignTypePrompt";
import { CASE_5_SETUP_PROMPT } from "./cases/Case5SetupPrompt";
import { CASE_6_ASSETS_PROMPT } from "./cases/Case6AssetsPrompt";
import { CASE_7_REVIEW_PROMPT } from "./cases/Case7ReviewPrompt";
import { CASE_8_LAUNCH_PROMPT } from "./cases/Case8LaunchPrompt";

// CAMPAIGN TYPES
import { SEARCH_TYPE_RULES } from "./types/SearchTypeRules";
import { PMAX_TYPE_RULES } from "./types/PMaxTypeRules";
import { SHOPPING_TYPE_RULES } from "./types/ShoppingTypeRules";
import { APP_TYPE_RULES } from "./types/AppTypeRules";
import { DISPLAY_TYPE_RULES } from "./types/DisplayTypeRules";
import { DEMAND_GEN_TYPE_RULES } from "./types/DemandGenTypeRules";
import { VIDEO_TYPE_RULES } from "./types/VideoTypeRules";

// SCHEMAS
import { DISCOVERY_SCHEMA } from "./schemas/DiscoverySchema";
import { OBJECTIVE_SCHEMA } from "./schemas/ObjectiveSchema";
import { GOALS_SCHEMA } from "./schemas/GoalsSchema";
import { CAMPAIGN_TYPE_SCHEMA } from "./schemas/CampaignTypeSchema";
import { CAMPAIGN_SETUP_SCHEMA } from "./schemas/CampaignSetupSchema";
import { ASSET_SCHEMA } from "./schemas/AssetSchema";
import { REVIEW_SCHEMA } from "./schemas/ReviewSchema";
import { LAUNCH_SCHEMA } from "./schemas/LaunchSchema";

export interface PromptBuilderOptions {
  activeCase: CaseIdentifier;
  campaignState: any;
  customerProfile?: any;
  lastUserMessage?: string;
}

export class PromptBuilder {
  /**
   * Formats approved customer profile context into structured, clean markdown.
   * Pure deterministic TypeScript string composition (0 AI tokens consumed).
   */
  public static formatCustomerProfileContext(profile: any): string {
    if (!profile || typeof profile !== "object") return "";

    const lines: string[] = [];
    lines.push("### TRUSTED CUSTOMER BUSINESS & MARKETING PROFILE CONTEXT (Approved & Saved)");
    lines.push("IMPORTANT RULES FOR USING THIS PROFILE CONTEXT:");
    lines.push("1. This profile contains verified, approved business intelligence for this customer.");
    lines.push("2. Use this data as context, smart suggestions, and campaign prefill recommendations.");
    lines.push("3. NEVER force or silently override values that the user has explicitly entered or confirmed in the campaign.");
    lines.push("4. User-entered campaign values always take priority over profile defaults.");
    lines.push("5. If specific profile data is missing or empty, ask the user normally in the conversational flow.");
    lines.push("6. Do NOT invent or hallucinate data outside of this context or user inputs.");

    // Business Information
    const bizDetails: string[] = [];
    if (profile.businessName) bizDetails.push(`Business Name: ${profile.businessName}`);
    if (profile.legalBusinessName) bizDetails.push(`Legal Name: ${profile.legalBusinessName}`);
    if (profile.industry) bizDetails.push(`Industry: ${profile.industry}`);
    if (profile.businessCategory) bizDetails.push(`Category: ${profile.businessCategory}`);
    if (profile.customerType) bizDetails.push(`Customer Type: ${profile.customerType}`);
    if (profile.businessModel) bizDetails.push(`Business Model: ${profile.businessModel}`);
    if (profile.businessDescription) bizDetails.push(`Description: ${profile.businessDescription}`);
    if (profile.businessEmail) bizDetails.push(`Email: ${profile.businessEmail}`);
    if (profile.businessPhone) bizDetails.push(`Phone: ${profile.businessPhone}`);
    if (profile.whatsappNumber) bizDetails.push(`WhatsApp: ${profile.whatsappNumber}`);
    if (profile.businessAddress) bizDetails.push(`Address: ${profile.businessAddress}`);
    if (Array.isArray(profile.languagesServed) && profile.languagesServed.length) {
      bizDetails.push(`Languages Served: ${profile.languagesServed.join(", ")}`);
    }
    if (bizDetails.length) {
      lines.push("\n[Business Information]");
      lines.push(bizDetails.join("\n"));
    }

    // Approved Websites & Intelligence
    const webDetails: string[] = [];
    if (profile.primaryWebsite) webDetails.push(`Primary Website: ${profile.primaryWebsite}`);
    if (Array.isArray(profile.additionalWebsites) && profile.additionalWebsites.length) {
      const additional = profile.additionalWebsites
        .map((w: any) => (typeof w === "string" ? w : w.url || w.domain || ""))
        .filter(Boolean);
      if (additional.length) webDetails.push(`Additional Websites: ${additional.join(", ")}`);
    }
    if (webDetails.length) {
      lines.push("\n[Approved Websites]");
      lines.push(webDetails.join("\n"));
    }

    // Products
    if (Array.isArray(profile.products) && profile.products.length) {
      lines.push("\n[Approved Products]");
      profile.products.slice(0, 15).forEach((p: any) => {
        if (typeof p === "string") {
          lines.push(`- ${p}`);
        } else if (p && typeof p === "object") {
          const parts = [p.name || p.title || "Product"];
          if (p.price) parts.push(`Price: ${p.currency || "INR"} ${p.price}`);
          if (p.description) parts.push(`Desc: ${p.description}`);
          if (p.targetAudience) parts.push(`Audience: ${p.targetAudience}`);
          if (p.usp) parts.push(`USP: ${p.usp}`);
          lines.push(`- ${parts.join(" | ")}`);
        }
      });
    }

    // Services
    if (Array.isArray(profile.services) && profile.services.length) {
      lines.push("\n[Approved Services]");
      profile.services.slice(0, 15).forEach((s: any) => {
        if (typeof s === "string") {
          lines.push(`- ${s}`);
        } else if (s && typeof s === "object") {
          const parts = [s.name || s.title || "Service"];
          if (s.price) parts.push(`Price: ${s.currency || "INR"} ${s.price}`);
          if (s.description) parts.push(`Desc: ${s.description}`);
          if (s.targetAudience) parts.push(`Audience: ${s.targetAudience}`);
          if (s.usp) parts.push(`USP: ${s.usp}`);
          lines.push(`- ${parts.join(" | ")}`);
        }
      });
    }

    // Target Audiences & Personas
    if (profile.targetAudience) {
      lines.push(`\n[Target Audience Overview]\n${profile.targetAudience}`);
    }
    if (Array.isArray(profile.targetAudiences) && profile.targetAudiences.length) {
      lines.push("\n[Detailed Target Audiences]");
      profile.targetAudiences.slice(0, 10).forEach((a: any) => {
        const parts = [a.name || "Audience"];
        if (a.description) parts.push(`Desc: ${a.description}`);
        if (a.ageRanges?.length) parts.push(`Ages: ${a.ageRanges.join(", ")}`);
        if (a.interests?.length) parts.push(`Interests: ${a.interests.join(", ")}`);
        lines.push(`- ${parts.join(" | ")}`);
      });
    }
    if (Array.isArray(profile.customerPersonas) && profile.customerPersonas.length) {
      lines.push("\n[Customer Personas]");
      profile.customerPersonas.slice(0, 10).forEach((p: any) => {
        const parts = [p.name || "Persona"];
        if (p.description) parts.push(`Desc: ${p.description}`);
        if (p.painPoints?.length) parts.push(`Pain Points: ${p.painPoints.join(", ")}`);
        if (p.buyingMotivations?.length) parts.push(`Motivations: ${p.buyingMotivations.join(", ")}`);
        lines.push(`- ${parts.join(" | ")}`);
      });
    }

    // Locations & Geography
    const locs: string[] = [];
    if (Array.isArray(profile.locations) && profile.locations.length) {
      locs.push(`Target Locations: ${profile.locations.join(", ")}`);
    }
    if (Array.isArray(profile.serviceAreas) && profile.serviceAreas.length) {
      locs.push(`Service Areas: ${profile.serviceAreas.join(", ")}`);
    }
    if (Array.isArray(profile.locationRecords) && profile.locationRecords.length) {
      const records = profile.locationRecords
        .slice(0, 10)
        .map((l: any) => `${l.name} (${l.type || "Location"}${l.radius ? `, radius ${l.radius}${l.radiusUnit || "km"}` : ""}${l.isExcluded ? " [EXCLUDED]" : ""})`);
      locs.push(`Configured Location Records: ${records.join("; ")}`);
    }
    if (locs.length) {
      lines.push("\n[Locations & Geography]");
      lines.push(locs.join("\n"));
    }

    // Conversion Goals
    if (Array.isArray(profile.conversionGoals) && profile.conversionGoals.length) {
      lines.push("\n[Approved Conversion Goals]");
      profile.conversionGoals.slice(0, 10).forEach((g: any) => {
        const parts = [g.customName || g.category || "Goal"];
        if (g.isPrimary) parts.push("(Primary)");
        if (g.value) parts.push(`Target Value: ${g.value}`);
        lines.push(`- ${parts.join(" ")}`);
      });
    }

    // Brand Profile & Guidelines
    if (profile.brandProfile && typeof profile.brandProfile === "object") {
      const bp = profile.brandProfile;
      const bpLines: string[] = [];
      if (bp.tagline) bpLines.push(`Tagline: ${bp.tagline}`);
      if (Array.isArray(bp.brandVoice) && bp.brandVoice.length) bpLines.push(`Brand Voice / Tone: ${bp.brandVoice.join(", ")}`);
      if (Array.isArray(bp.usps) && bp.usps.length) bpLines.push(`USPs: ${bp.usps.join("; ")}`);
      if (Array.isArray(bp.wordsToPrefer) && bp.wordsToPrefer.length) bpLines.push(`Words to Prefer: ${bp.wordsToPrefer.join(", ")}`);
      if (Array.isArray(bp.wordsToAvoid) && bp.wordsToAvoid.length) bpLines.push(`Words to Avoid: ${bp.wordsToAvoid.join(", ")}`);
      if (Array.isArray(bp.adCopyGuidelines?.dos) && bp.adCopyGuidelines.dos.length) bpLines.push(`Ad Copy DOs: ${bp.adCopyGuidelines.dos.join("; ")}`);
      if (Array.isArray(bp.adCopyGuidelines?.donts) && bp.adCopyGuidelines.donts.length) bpLines.push(`Ad Copy DONTs: ${bp.adCopyGuidelines.donts.join("; ")}`);
      if (Array.isArray(bp.complianceRules) && bp.complianceRules.length) bpLines.push(`Compliance Rules: ${bp.complianceRules.join("; ")}`);
      if (bpLines.length) {
        lines.push("\n[Brand Guidelines & Voice]");
        lines.push(bpLines.join("\n"));
      }
    }

    // Competitors
    if (Array.isArray(profile.competitors) && profile.competitors.length) {
      lines.push("\n[Competitors]");
      profile.competitors.slice(0, 10).forEach((c: any) => {
        const parts = [c.name || "Competitor"];
        if (c.website) parts.push(`(${c.website})`);
        if (c.strengths) parts.push(`Strengths: ${c.strengths}`);
        if (c.weaknesses) parts.push(`Weaknesses: ${c.weaknesses}`);
        lines.push(`- ${parts.join(" ")}`);
      });
    }

    // SEO Target Keywords
    if (Array.isArray(profile.seoKeywords) && profile.seoKeywords.length) {
      lines.push("\n[Approved SEO / Seed Keywords]");
      const kwList = profile.seoKeywords.slice(0, 20).map((k: any) => {
        if (typeof k === "string") return k;
        return `${k.keyword}${k.matchType ? ` [${k.matchType}]` : ""}${k.intent ? ` (${k.intent})` : ""}`;
      });
      lines.push(kwList.join(", "));
    }

    // Negative Keywords
    if (Array.isArray(profile.negativeKeywords) && profile.negativeKeywords.length) {
      lines.push("\n[Approved Negative Keywords]");
      const negList = profile.negativeKeywords.slice(0, 20).map((nk: any) => {
        if (typeof nk === "string") return nk;
        return `${nk.keyword}${nk.matchType ? ` [${nk.matchType}]` : ""}${nk.reason ? ` (Reason: ${nk.reason})` : ""}`;
      });
      lines.push(negList.join(", "));
    }

    // Business FAQs & Knowledge
    if (Array.isArray(profile.faqs) && profile.faqs.length) {
      lines.push("\n[Business FAQs]");
      profile.faqs.slice(0, 8).forEach((f: any) => {
        if (f.question && f.answer) {
          lines.push(`Q: ${f.question}\nA: ${f.answer}`);
        }
      });
    }

    return lines.join("\n");
  }

  /**
   * Builds a tailored system prompt dynamically combining:
   * GLOBAL_BASE + ACTIVE_CASE_PROMPT + ACTIVE_CAMPAIGN_TYPE_RULES (only when required) + SCHEMA + RELEVANT_STATE + PROFILE_CONTEXT
   *
   * Consumes 0 AI tokens (pure deterministic TypeScript string composition).
   */
  public static buildCampaignSystemPrompt(options: PromptBuilderOptions): string {
    const { activeCase, campaignState, customerProfile } = options;
    const parts: string[] = [];

    // 1. GLOBAL BASE PROMPT
    parts.push(GOOGLE_ADS_PROMPT_BASE);

    // 2. ACTIVE CASE PROMPT
    switch (activeCase) {
      case "CASE_1_DISCOVERY":
        parts.push(CASE_1_DISCOVERY_PROMPT);
        break;
      case "CASE_2_OBJECTIVE":
        parts.push(CASE_2_OBJECTIVE_PROMPT);
        break;
      case "CASE_3_GOALS":
        parts.push(CASE_3_GOALS_PROMPT);
        break;
      case "CASE_4_CAMPAIGN_TYPE":
        parts.push(CASE_4_CAMPAIGN_TYPE_PROMPT);
        break;
      case "CASE_5_SETUP":
        parts.push(CASE_5_SETUP_PROMPT);
        break;
      case "CASE_6_ASSETS":
        parts.push(CASE_6_ASSETS_PROMPT);
        break;
      case "CASE_7_REVIEW":
        parts.push(CASE_7_REVIEW_PROMPT);
        break;
      case "CASE_8_LAUNCH":
        parts.push(CASE_8_LAUNCH_PROMPT);
        break;
      default:
        parts.push(CASE_1_DISCOVERY_PROMPT);
        break;
    }

    // 3. CAMPAIGN TYPE RULES (loaded ONLY when activeCase is CASE_5_SETUP, CASE_6_ASSETS, or CASE_7_REVIEW)
    let rawType = (campaignState?.campaignType || "").toUpperCase();
    if (!rawType && options.lastUserMessage) {
      const lmsg = options.lastUserMessage.toLowerCase();
      if (lmsg.includes("performance max") || lmsg.includes("pmax")) rawType = "PERFORMANCE_MAX";
      else if (lmsg.includes("search")) rawType = "SEARCH";
      else if (lmsg.includes("display")) rawType = "DISPLAY";
      else if (lmsg.includes("demand gen")) rawType = "DEMAND_GEN";
      else if (lmsg.includes("shopping")) rawType = "SHOPPING";
      else if (lmsg.includes("video")) rawType = "VIDEO";
      else if (lmsg.includes("app")) rawType = "APP";
    }
    const needsTypeRules = (activeCase === "CASE_5_SETUP" || activeCase === "CASE_6_ASSETS" || activeCase === "CASE_7_REVIEW") && rawType;

    if (needsTypeRules) {
      switch (rawType) {
        case "SEARCH":
          parts.push(SEARCH_TYPE_RULES);
          break;
        case "PERFORMANCE_MAX":
          parts.push(PMAX_TYPE_RULES);
          break;
        case "SHOPPING":
          parts.push(SHOPPING_TYPE_RULES);
          break;
        case "APP":
          parts.push(APP_TYPE_RULES);
          break;
        case "DISPLAY":
          parts.push(DISPLAY_TYPE_RULES);
          break;
        case "DEMAND_GEN":
          parts.push(DEMAND_GEN_TYPE_RULES);
          break;
        case "VIDEO":
          parts.push(VIDEO_TYPE_RULES);
          break;
        default:
          break;
      }
    }

    // 4. FOCUSED OUTPUT JSON SCHEMA
    switch (activeCase) {
      case "CASE_1_DISCOVERY":
        parts.push(DISCOVERY_SCHEMA);
        break;
      case "CASE_2_OBJECTIVE":
        parts.push(OBJECTIVE_SCHEMA);
        break;
      case "CASE_3_GOALS":
        parts.push(GOALS_SCHEMA);
        break;
      case "CASE_4_CAMPAIGN_TYPE":
        parts.push(CAMPAIGN_TYPE_SCHEMA);
        break;
      case "CASE_5_SETUP":
        parts.push(CAMPAIGN_SETUP_SCHEMA);
        break;
      case "CASE_6_ASSETS":
        parts.push(ASSET_SCHEMA);
        break;
      case "CASE_7_REVIEW":
        parts.push(REVIEW_SCHEMA);
        break;
      case "CASE_8_LAUNCH":
        parts.push(LAUNCH_SCHEMA);
        break;
      default:
        parts.push(DISCOVERY_SCHEMA);
        break;
    }

    // 5. APPROVED CUSTOMER PROFILE CONTEXT (Approved & Saved Profile)
    if (customerProfile) {
      const profileContext = PromptBuilder.formatCustomerProfileContext(customerProfile);
      if (profileContext) {
        parts.push(profileContext);
      }
    }

    // 6. CURRENT COMPACT STATE
    const stateJson = JSON.stringify(campaignState || {}, null, 2);
    parts.push(`Current Campaign State:\n${stateJson}`);

    return parts.join("\n\n");
  }
}
