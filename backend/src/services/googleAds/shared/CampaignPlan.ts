import { GoogleAdsBaseService } from "./GoogleAdsBaseService";
import { GoogleAdsBillingService } from "../GoogleAdsBillingService";
import { validateCustomerOwnership } from "../../../utils/customerOwnership";
import prisma from "../../../utils/prisma";

export type CampaignPlanSource = "AI_GUIDED";

export interface CampaignPlanMetadata {
  planId: string;
  organizationId: string;
  customerId: string;
  source: CampaignPlanSource;
  createdAt: string;
  version: number;
}

export interface CampaignPlanBusinessContext {
  profileId?: string;
  businessName: string;
  websiteUrl: string;
  selectedProductIds?: string[];
  selectedServiceIds?: string[];
  targetPersonaIds?: string[];
  businessType?: string;
  businessDescription?: string;
}

export interface CampaignPlanCoreConfig {
  campaignName: string;
  objective: "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "LOCAL" | "AWARENESS" | "NO_GUIDANCE" | "APP_PROMOTION" | string;
  campaignType: "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "VIDEO" | "DEMAND_GEN" | "SHOPPING" | "APP";
  status: "PAUSED" | "ENABLED";
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  euPolitical?: "YES" | "NO";
  adFormat?: string;
}

export interface CampaignPlanBudgetConfig {
  budgetType: "DAILY" | "TOTAL";
  amount: number;
  currencyCode: string;
  effectiveDailyAmount: number;
  biddingStrategy: string;
  targetCpa?: number;
  targetRoas?: number;
  maxCpcLimit?: number;
}

export type AudienceIntelligenceSource =
  | "CRM_PROFILE"
  | "CUSTOMER_MATCH"
  | "CUSTOM_AUDIENCE"
  | "USER_LIST"
  | "AI";

export interface AudienceIntelligenceItem {
  id: string;
  name: string;
  source: AudienceIntelligenceSource;
  type: string;
  status: string;
  memberCount?: number;
  relevanceReason: string;
  recommended: boolean;
  approved: boolean;
  resourceName?: string;
}

export interface CampaignPlanTargeting {
  locations: string[];
  languages: string[];
  adSchedule?: Array<{
    day: string;
    start: string;
    end: string;
    bidModifier?: number;
  }>;
  devices?: string[];
  audienceSignalIds?: string[];
  audienceIntelligence?: AudienceIntelligenceItem[];
  searchThemes?: string[];
  networkSearch?: boolean;
  networkDisplay?: boolean;
}

export type KeywordIntelligenceSource =
  | "USER"
  | "AI"
  | "KEYWORD_PLANNER"
  | "EXISTING_ACCOUNT"
  | "SEARCH_TERM"
  | "DISPLAY_CONTEXTUAL";

export interface KeywordIntelligenceItem {
  keyword: string;
  matchType?: "EXACT" | "PHRASE" | "BROAD";
  source: KeywordIntelligenceSource;
  searchVolume?: number;
  competition?: string;
  competitionIndex?: number;
  lowTopOfPageBid?: number;
  highTopOfPageBid?: number;
  monthlyTrend?: Array<{ month: string; year: string; searches: number }>;
  existingCampaignName?: string;
  existingStatus?: string;
  isNegative?: boolean;
  approved?: boolean;
}

export interface SharedNegativeSetSummary {
  id: string;
  name: string;
  memberCount: number;
  referenceCount?: number;
  resourceName?: string;
  isAttachedToCampaign?: boolean;
}

export interface CampaignPlanKeywordsConfig {
  positiveKeywords: string[];
  campaignNegativeKeywords?: string[];
  linkedSharedNegativeSetIds?: string[];
  keywordIntelligence?: KeywordIntelligenceItem[];
  availableSharedNegativeLists?: SharedNegativeSetSummary[];
}

export interface CampaignPlanAssets {
  headlines: Array<{ text: string; pinnedField?: string }>;
  longHeadlines?: Array<{ text: string }>;
  descriptions: Array<{ text: string; pinnedField?: string }>;
  marketingImages?: Array<{ url: string; fieldType?: string; aspectRatio?: string; name?: string }>;
  logos?: Array<{ url: string; fieldType?: string; aspectRatio?: string; name?: string }>;
  youtubeVideos?: Array<{ url: string; videoId?: string; name?: string }>;
  callToAction?: string;
  brandGuidelines?: {
    mainColor?: string;
    accentColor?: string;
    font?: string;
  };
}

export interface CampaignPlanExtensions {
  sitelinks?: Array<{ text: string; url: string; desc1?: string; desc2?: string }>;
  callouts?: string[];
  structuredSnippets?: Array<{ header: string; values: string[] }>;
  callPhone?: { phoneNumber: string; countryCode: string };
  leadFormId?: string;
  promotions?: Array<{ promotionTarget: string; finalUrl: string; occasion?: string; percentOff?: number; moneyAmountOff?: number; currencyCode?: string }>;
  prices?: Array<{ header: string; amount?: number; currencyCode?: string; unit?: string; finalUrl?: string }>;
}

export interface CampaignPlanRetailConfig {
  merchantCenterId: string;
  salesCountry?: string;
  feedLabel?: string;
  campaignPriority?: "LOW" | "MEDIUM" | "HIGH";
  productGroupFilter?: string;
}

export interface CampaignPlanAppConfig {
  platform: "ANDROID" | "IOS";
  appId: string;
  appName?: string;
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
}

export interface PreflightIssue {
  severity: "CRITICAL" | "WARNING";
  field?: string;
  message: string;
  code: string;
}

export interface CampaignPlanPreflightChecks {
  passed: boolean;
  ownershipVerified: boolean;
  googleAdsConnected: boolean;
  billingActive: boolean;
  conversionTrackingActive: boolean;
  merchantCenterLinked?: boolean;
  issues: PreflightIssue[];
}

export interface PerformanceForecastSummary {
  status: "SUCCESS" | "UNAVAILABLE" | "UNSUPPORTED" | "INVALID_CONFIGURATION";
  currencyCode?: string;
  forecastPeriod?: {
    startDate: string;
    endDate: string;
  };
  dailyBudget?: number;
  metrics?: {
    clicks?: number;
    cost?: number;
    averageCpc?: number;
    conversions?: number;
    averageCpa?: number;
  };
  assumptions?: string[];
  warnings?: string[];
  notice?: string;
}

export interface RecommendationInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact?: {
    hasImpact?: boolean;
    deltaClicks?: number;
    deltaCost?: number;
    deltaConversions?: number;
  };
  campaignId?: string;
  campaignName?: string;
  resourceName?: string;
  recommendationType?: string;
  recommended: boolean;
  approved: boolean;
}

export type CampaignExtensionType =
  | "SITELINK"
  | "CALLOUT"
  | "STRUCTURED_SNIPPET"
  | "PROMOTION"
  | "CALL_ASSET"
  | "LEAD_FORM"
  | "ASSET_GROUP"
  | "MARKETING_IMAGE"
  | "SQUARE_MARKETING_IMAGE"
  | "LOGO"
  | "VIDEO";

export interface CampaignExtensionInsight {
  id: string;
  type: CampaignExtensionType | string;
  name: string;
  description: string;
  source: "GOOGLE_ADS" | "AI" | "USER";
  campaignId?: string;
  campaignName?: string;
  resourceName?: string;
  status?: string;
  recommended: boolean;
  approved: boolean;
}

export interface CampaignReviewSummary {
  customerId: string;
  businessName: string;
  objective: string;
  campaignType: string;
  campaignName: string;
  dailyBudget: number;
  biddingStrategy: string;
  targetCpa?: number;
  targetRoas?: number;
  locations: string[];
  languages: string[];
  retailConfig?: CampaignPlanRetailConfig;
  appConfig?: CampaignPlanAppConfig;
  youtubeVideosCount?: number;
  marketingImagesCount?: number;
  approvedKeywordsCount: number;
  approvedNegativeKeywordsCount: number;
  approvedAudienceCount: number;
  approvedRecommendationsCount: number;
  approvedExtensionsAssetsCount: number;
  approvedKeywords: string[];
  approvedNegativeKeywords: string[];
  approvedAudienceSignals: string[];
  approvedRecommendations: Array<{ id: string; type: string; title: string; description: string }>;
  approvedExtensionsAssets: Array<{ id: string; type: string; name: string; description: string }>;
  performanceForecast?: PerformanceForecastSummary;
  preflightStatus: "PASSED" | "BLOCKED";
  warnings: string[];
  blockingIssues: string[];
  readyForPublish: boolean;
}

export interface CampaignPlan {
  metadata: CampaignPlanMetadata;
  businessContext: CampaignPlanBusinessContext;
  coreConfig: CampaignPlanCoreConfig;
  budgetConfig: CampaignPlanBudgetConfig;
  targeting: CampaignPlanTargeting;
  keywordsConfig: CampaignPlanKeywordsConfig;
  assets: CampaignPlanAssets;
  extensions: CampaignPlanExtensions;
  retailConfig?: CampaignPlanRetailConfig;
  appConfig?: CampaignPlanAppConfig;
  preflightChecks: CampaignPlanPreflightChecks;
  forecastSummary?: PerformanceForecastSummary;
  recommendationInsights?: RecommendationInsight[];
  extensionsAndAssets?: CampaignExtensionInsight[];
  reviewSummary?: CampaignReviewSummary;
}

export class CampaignPlanMapper {
  /**
   * Transforms an AI Guided CampaignState into a deterministic, strictly typed CampaignPlan.
   */
  public static fromState(
    orgId: string,
    customerId: string,
    state: any,
    preflightChecks?: Partial<CampaignPlanPreflightChecks>
  ): CampaignPlan {
    const cleanCid = (customerId || "").replace(/-/g, "").trim();
    const todayStr = new Date().toISOString().split("T")[0];

    const budgetType = (state.budgetType || "DAILY").toUpperCase() as "DAILY" | "TOTAL";
    const rawBudget = Number(state.dailyBudget || state.budget || state.totalBudget || 0);
    const amount = isNaN(rawBudget) ? 0 : rawBudget;

    let effectiveDaily = amount;
    if (budgetType === "TOTAL" && state.startDate && state.endDate) {
      const startMs = new Date(state.startDate).getTime();
      const endMs = new Date(state.endDate).getTime();
      const days = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
      effectiveDaily = Math.max(1, Math.round(amount / days));
    } else if (budgetType === "TOTAL") {
      effectiveDaily = Math.max(1, Math.round(amount / 30));
    }

    const headlines = (state.headlines || [])
      .map((h: any) => typeof h === "string" ? { text: GoogleAdsBaseService.cleanAdText(h, 30) } : { text: GoogleAdsBaseService.cleanAdText(h?.text || "", 30), pinnedField: h?.pinnedField })
      .filter((h: any) => h.text.length > 0);

    const longHeadlines = (state.longHeadlines || [])
      .map((lh: any) => typeof lh === "string" ? { text: GoogleAdsBaseService.cleanAdText(lh, 90) } : { text: GoogleAdsBaseService.cleanAdText(lh?.text || "", 90) })
      .filter((lh: any) => lh.text.length > 0);

    const descriptions = (state.descriptions || [])
      .map((d: any) => typeof d === "string" ? { text: GoogleAdsBaseService.cleanAdText(d, 90) } : { text: GoogleAdsBaseService.cleanAdText(d?.text || "", 90), pinnedField: d?.pinnedField })
      .filter((d: any) => d.text.length > 0);

    const keywords = (state.keywords || [])
      .map((k: any) => GoogleAdsBaseService.cleanAdText(String(k || ""), 80))
      .filter((k: string) => k.length > 0);

    const rawLanguages = (Array.isArray(state.languages) ? state.languages : (state.language ? [state.language] : ["English"]))
      .flatMap((l: string) => typeof l === "string" ? l.split(",") : [String(l)])
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0 && !["all languages", "all", "any"].includes(l.toLowerCase()));

    const plan: CampaignPlan = {
      metadata: {
        planId: state.planId || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        customerId: cleanCid,
        source: "AI_GUIDED",
        createdAt: new Date().toISOString(),
        version: state.version || 1
      },
      businessContext: {
        profileId: state.profileId || state.customerProfile?.id,
        businessName: GoogleAdsBaseService.cleanAdText(state.businessName || state.business?.name || "Business", 100),
        websiteUrl: state.website || state.finalUrl || state.websiteVisitsUrl || "",
        selectedProductIds: state.selectedProductIds || [],
        selectedServiceIds: state.selectedServiceIds || [],
        targetPersonaIds: state.targetPersonaIds || [],
        businessType: state.business?.type || state.businessType,
        businessDescription: state.business?.description || state.businessDescription
      },
      coreConfig: {
        campaignName: GoogleAdsBaseService.cleanAdText(state.campaignName || `${state.businessName || "Campaign"} - ${state.campaignType || "Search"}`, 100),
        objective: (state.objective || "LEADS").toUpperCase(),
        campaignType: (state.campaignType || "SEARCH").toUpperCase(),
        status: state.status === "ENABLED" ? "ENABLED" : "PAUSED",
        startDate: state.startDate ? String(state.startDate).split("T")[0] : todayStr,
        endDate: state.endDate ? String(state.endDate).split("T")[0] : undefined,
        euPolitical: state.euPolitical || "NO",
        adFormat: (state.adFormat || (state.videos && state.videos.length > 0 ? "VIDEO" : undefined))
      },
      budgetConfig: {
        budgetType,
        amount,
        currencyCode: state.currencyCode || "INR",
        effectiveDailyAmount: effectiveDaily,
        biddingStrategy: state.biddingStrategy || "Maximize conversions",
        targetCpa: state.targetCpa ? Number(state.targetCpa) : undefined,
        targetRoas: state.targetRoas ? Number(state.targetRoas) : undefined,
        maxCpcLimit: state.maxCpcLimit ? Number(state.maxCpcLimit) : undefined
      },
      targeting: {
        locations: (Array.isArray(state.locations) && state.locations.length > 0) ? state.locations : ["India"],
        languages: rawLanguages.length > 0 ? rawLanguages : ["English"],
        adSchedule: state.adSchedule || state.adScheduleList || [],
        devices: state.devices || [],
        audienceSignalIds: state.audienceSignalIds || state.audienceSignals || [],
        audienceIntelligence: state.audienceIntelligence || [],
        searchThemes: state.searchThemes || [],
        networkSearch: state.networkSearch !== undefined ? Boolean(state.networkSearch) : true,
        networkDisplay: state.networkDisplay !== undefined ? Boolean(state.networkDisplay) : (state.campaignType === "SEARCH" ? false : true)
      },
      keywordsConfig: {
        positiveKeywords: keywords,
        campaignNegativeKeywords: state.negativeKeywords || state.campaignNegativeKeywords || [],
        linkedSharedNegativeSetIds: state.linkedSharedNegativeSetIds || [],
        keywordIntelligence: state.keywordIntelligence || [],
        availableSharedNegativeLists: state.availableSharedNegativeLists || []
      },
      assets: {
        headlines,
        longHeadlines,
        descriptions,
        marketingImages: (state.images || []).map((img: any) => typeof img === "string" ? { url: img } : img),
        logos: (state.logos || []).map((l: any) => typeof l === "string" ? { url: l } : l),
        youtubeVideos: (state.videos || []).map((v: any) => typeof v === "string" ? { url: v } : v),
        callToAction: state.callToAction || "Automated",
        brandGuidelines: state.brandGuidelines || undefined
      },
      extensions: {
        sitelinks: state.sitelinks || [],
        callouts: state.callouts || [],
        structuredSnippets: state.structuredSnippets || [],
        callPhone: state.callPhoneNumber ? { phoneNumber: state.callPhoneNumber, countryCode: "IN" } : undefined,
        leadFormId: state.leadFormId,
        promotions: state.promotions || [],
        prices: state.prices || []
      },
      preflightChecks: {
        passed: false,
        ownershipVerified: false,
        googleAdsConnected: false,
        billingActive: false,
        conversionTrackingActive: false,
        issues: [],
        ...(preflightChecks || {})
      }
    };

    if (state.campaignType === "SHOPPING" || state.merchantCenterId) {
      plan.retailConfig = {
        merchantCenterId: state.merchantCenterId || state.merchantId || "",
        salesCountry: state.salesCountry || "IN",
        feedLabel: state.feedLabel || state.salesCountry || "IN",
        campaignPriority: state.campaignPriority || "LOW",
        productGroupFilter: state.productGroupFilter || "Use all products"
      };
    }

    if (state.campaignType === "APP" || state.appId) {
      plan.appConfig = {
        platform: state.platform || (state.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID"),
        appId: state.appId || "",
        appName: state.appName,
        appStore: state.appStore || (state.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE")
      };
    }

    if (state.forecastSummary && typeof state.forecastSummary === "object") {
      plan.forecastSummary = {
        status: state.forecastSummary.status || "UNAVAILABLE",
        currencyCode: state.forecastSummary.currencyCode,
        dailyBudget: state.forecastSummary.dailyBudget,
        forecastPeriod: state.forecastSummary.forecastPeriod,
        metrics: state.forecastSummary.metrics ? {
          clicks: state.forecastSummary.metrics.clicks,
          cost: state.forecastSummary.metrics.cost,
          averageCpc: state.forecastSummary.metrics.averageCpc,
          conversions: state.forecastSummary.metrics.conversions,
          averageCpa: state.forecastSummary.metrics.averageCpa
        } : undefined,
        warnings: Array.isArray(state.forecastSummary.warnings) ? state.forecastSummary.warnings : undefined,
        notice: state.forecastSummary.notice
      };
    }

    if (Array.isArray(state.recommendationInsights)) {
      // Include only explicitly user-approved recommendations in CampaignPlan
      const approvedOnly = state.recommendationInsights
        .filter((r: any) => r && r.approved === true)
        .map((r: any) => ({
          id: String(r.id),
          type: String(r.type || "UNKNOWN"),
          title: String(r.title || "Recommendation"),
          description: String(r.description || ""),
          impact: r.impact ? {
            hasImpact: Boolean(r.impact.hasImpact),
            deltaClicks: r.impact.deltaClicks,
            deltaCost: r.impact.deltaCost,
            deltaConversions: r.impact.deltaConversions
          } : undefined,
          campaignId: r.campaignId ? String(r.campaignId) : undefined,
          campaignName: r.campaignName ? String(r.campaignName) : undefined,
          resourceName: r.resourceName ? String(r.resourceName) : undefined,
          recommendationType: r.recommendationType ? String(r.recommendationType) : undefined,
          recommended: true,
          approved: true
        }));

      if (approvedOnly.length > 0) {
        plan.recommendationInsights = approvedOnly;
      }
    }

    if (Array.isArray(state.extensionsAndAssets)) {
      // Include only explicitly user-approved extensions and assets in CampaignPlan
      const approvedExtensions = state.extensionsAndAssets
        .filter((ext: any) => ext && ext.approved === true)
        .map((ext: any) => ({
          id: String(ext.id),
          type: String(ext.type || "UNKNOWN"),
          name: String(ext.name || "Asset"),
          description: String(ext.description || ""),
          source: (ext.source || "GOOGLE_ADS") as "GOOGLE_ADS" | "AI" | "USER",
          campaignId: ext.campaignId ? String(ext.campaignId) : undefined,
          campaignName: ext.campaignName ? String(ext.campaignName) : undefined,
          resourceName: ext.resourceName ? String(ext.resourceName) : undefined,
          status: ext.status ? String(ext.status) : undefined,
          recommended: true,
          approved: true
        }));

      if (approvedExtensions.length > 0) {
        plan.extensionsAndAssets = approvedExtensions;
      }
    }

    return plan;
  }

  /**
   * Adapts a validated CampaignPlan back into the payload shape expected by existing objective campaign creation services.
   */
  public static toServicePayload(plan: CampaignPlan): any {
    const rawHeadlines = plan.assets.headlines.map(h => h.text);
    const rawLongHeadlines = (plan.assets.longHeadlines || []).map(lh => lh.text);
    const rawDescriptions = plan.assets.descriptions.map(d => d.text);

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: plan.coreConfig.campaignName,
      objective: plan.coreConfig.objective,
      campaignType: plan.coreConfig.campaignType,
      businessName: plan.businessContext.businessName,
      website: plan.businessContext.websiteUrl,
      websiteVisitsUrl: plan.businessContext.websiteUrl,
      finalUrl: plan.businessContext.websiteUrl,
      dailyBudget: plan.budgetConfig.effectiveDailyAmount,
      budget: plan.budgetConfig.effectiveDailyAmount,
      budgetType: plan.budgetConfig.budgetType,
      locations: plan.targeting.locations,
      languages: plan.targeting.languages,
      biddingStrategy: plan.budgetConfig.biddingStrategy,
      biddingFocus: plan.budgetConfig.biddingStrategy,
      targetCpa: plan.budgetConfig.targetCpa,
      targetRoas: plan.budgetConfig.targetRoas,
      maxCpcLimit: plan.budgetConfig.maxCpcLimit,
      startDate: plan.coreConfig.startDate,
      endDate: plan.coreConfig.endDate,
      euPolitical: plan.coreConfig.euPolitical || "NO",
      keywords: plan.keywordsConfig.positiveKeywords,
      headlines: rawHeadlines,
      longHeadlines: rawLongHeadlines.length > 0 ? rawLongHeadlines : (rawHeadlines[0] ? [rawHeadlines[0]] : []),
      descriptions: rawDescriptions,
      images: plan.assets.marketingImages || [],
      logos: plan.assets.logos || [],
      videos: plan.assets.youtubeVideos || [],
      callToAction: plan.assets.callToAction,
      searchThemes: plan.targeting.searchThemes || [],
      audienceSignals: plan.targeting.audienceSignalIds || [],
      adSchedule: plan.targeting.adSchedule || [],
      devices: plan.targeting.devices || [],
      sitelinks: plan.extensions.sitelinks || [],
      callouts: plan.extensions.callouts || [],
      structuredSnippets: plan.extensions.structuredSnippets || [],
      callAsset: plan.extensions.callPhone ? { phone: plan.extensions.callPhone.phoneNumber, countryCode: plan.extensions.callPhone.countryCode } : undefined,
      callPhoneNumber: plan.extensions.callPhone?.phoneNumber,
      promotions: plan.extensions.promotions || [],
      prices: plan.extensions.prices || [],
      merchantCenterId: plan.retailConfig?.merchantCenterId,
      salesCountry: plan.retailConfig?.salesCountry,
      feedLabel: plan.retailConfig?.feedLabel,
      appId: plan.appConfig?.appId,
      platform: plan.appConfig?.platform,
      appStore: plan.appConfig?.appStore
    };
  }

  /**
   * Produces a clean, consolidated, compact CampaignReviewSummary from a CampaignPlan and Preflight result.
   */
  public static buildReviewSummary(
    plan: CampaignPlan,
    preflight: CampaignPlanPreflightChecks
  ): CampaignReviewSummary {
    const criticalIssues = (preflight.issues || [])
      .filter(i => i.severity === "CRITICAL")
      .map(i => i.message);

    const warningIssues = (preflight.issues || [])
      .filter(i => i.severity === "WARNING")
      .map(i => i.message);

    const approvedKeywords = plan.keywordsConfig.positiveKeywords || [];
    const approvedNegativeKeywords = plan.keywordsConfig.campaignNegativeKeywords || [];
    const approvedAudienceSignals = plan.targeting.audienceSignalIds || [];

    const approvedRecommendations = (plan.recommendationInsights || [])
      .filter(r => r.approved === true)
      .map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description
      }));

    const approvedExtensionsAssets = (plan.extensionsAndAssets || [])
      .filter(ext => ext.approved === true)
      .map(ext => ({
        id: ext.id,
        type: ext.type,
        name: ext.name,
        description: ext.description
      }));

    const isReady = Boolean(preflight.passed && criticalIssues.length === 0);

    return {
      customerId: plan.metadata.customerId,
      businessName: plan.businessContext.businessName,
      objective: plan.coreConfig.objective,
      campaignType: plan.coreConfig.campaignType,
      campaignName: plan.coreConfig.campaignName,
      dailyBudget: plan.budgetConfig.effectiveDailyAmount,
      biddingStrategy: plan.budgetConfig.biddingStrategy,
      targetCpa: plan.budgetConfig.targetCpa,
      targetRoas: plan.budgetConfig.targetRoas,
      locations: plan.targeting.locations,
      languages: plan.targeting.languages,
      retailConfig: plan.retailConfig,
      appConfig: plan.appConfig,
      youtubeVideosCount: (plan.assets.youtubeVideos || []).length,
      marketingImagesCount: (plan.assets.marketingImages || []).length,
      approvedKeywordsCount: approvedKeywords.length,
      approvedNegativeKeywordsCount: approvedNegativeKeywords.length,
      approvedAudienceCount: approvedAudienceSignals.length,
      approvedRecommendationsCount: approvedRecommendations.length,
      approvedExtensionsAssetsCount: approvedExtensionsAssets.length,
      approvedKeywords,
      approvedNegativeKeywords,
      approvedAudienceSignals,
      approvedRecommendations,
      approvedExtensionsAssets,
      performanceForecast: plan.forecastSummary,
      preflightStatus: isReady ? "PASSED" : "BLOCKED",
      warnings: warningIssues,
      blockingIssues: criticalIssues,
      readyForPublish: isReady
    };
  }
}

