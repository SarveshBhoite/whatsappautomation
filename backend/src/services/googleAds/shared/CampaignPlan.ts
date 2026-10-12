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

export interface AudienceIntelligenceItem {
  id: string;
  name: string;
  source: string;
  type: string;
  status: string;
  memberCount?: number;
  relevanceReason: string;
  recommended: boolean;
  approved: boolean;
  resourceName?: string;
}

export interface CommonTargetingConfig {
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
}

export type AudienceIntelligenceSource =
  | "CRM_PROFILE"
  | "CUSTOMER_MATCH"
  | "CUSTOM_AUDIENCE"
  | "USER_LIST"
  | "AI";

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

export interface CampaignExtensionInsight {
  id: string;
  type: string;
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
  retailConfig?: any;
  appConfig?: any;
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

// ─────────────────────────────────────────────────────────────────────────────
// Discriminated Campaign-Specific Plan Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface BaseCampaignPlanFields {
  metadata: CampaignPlanMetadata;
  businessContext: CampaignPlanBusinessContext;
  preflightChecks: CampaignPlanPreflightChecks;
  keywordsConfig?: {
    positiveKeywords: string[];
    campaignNegativeKeywords?: string[];
    linkedSharedNegativeSetIds?: string[];
  };
  forecastSummary?: PerformanceForecastSummary;
  recommendationInsights?: RecommendationInsight[];
  extensionsAndAssets?: CampaignExtensionInsight[];
  reviewSummary?: CampaignReviewSummary;
}

export interface SearchCampaignPlan extends BaseCampaignPlanFields {
  campaignType: "SEARCH";
  coreConfig: {
    campaignName: string;
    objective: "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "NO_GUIDANCE" | string;
    status: "PAUSED" | "ENABLED";
    startDate: string;
    endDate?: string;
    euPolitical?: "YES" | "NO";
    networkSearch?: boolean;
    networkDisplay?: boolean;
  };
  budgetConfig: {
    budgetType: "DAILY";
    amount: number;
    currencyCode: string;
    biddingStrategy: "MAXIMIZE_CONVERSIONS" | "MAXIMIZE_CONVERSION_VALUE" | "TARGET_CPA" | "TARGET_ROAS" | "TARGET_IMPRESSION_SHARE" | "MANUAL_CPC" | "MAXIMIZE_CLICKS" | string;
    targetCpa?: number;
    targetRoas?: number;
    maxCpcLimit?: number;
  };
  targeting: CommonTargetingConfig;
  keywordsConfig: {
    positiveKeywords: string[];
    campaignNegativeKeywords?: string[];
  };
  assets: {
    headlines: Array<{ text: string; pinnedField?: string }>;
    descriptions: Array<{ text: string; pinnedField?: string }>;
  };
  extensions?: {
    sitelinks?: any[];
    callouts?: string[];
    structuredSnippets?: any[];
    callPhone?: { phoneNumber: string; countryCode: string };
    promotions?: any[];
    prices?: any[];
  };
}

export interface PerformanceMaxCampaignPlan extends BaseCampaignPlanFields {
  campaignType: "PERFORMANCE_MAX";
  coreConfig: {
    campaignName: string;
    objective: "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "LOCAL" | "NO_GUIDANCE" | string;
    status: "PAUSED" | "ENABLED";
    startDate: string;
    endDate?: string;
    euPolitical?: "YES" | "NO";
    assetGroupName?: string;
    brandGuidelinesEnabled?: boolean;
    customerAcquisitionMode?: "TARGET_ALL_EQUALLY" | "BID_HIGHER_FOR_NEW_CUSTOMERS" | "TARGET_NEW_CUSTOMER_ONLY" | string;
  };
  budgetConfig: {
    budgetType: "DAILY";
    amount: number;
    currencyCode: string;
    biddingStrategy: "MAXIMIZE_CONVERSIONS" | "MAXIMIZE_CONVERSION_VALUE" | "TARGET_CPA" | "TARGET_ROAS" | string;
    targetCpa?: number;
    targetRoas?: number;
  };
  targeting: CommonTargetingConfig;
  assets: {
    headlines: Array<{ text: string }>;
    longHeadlines: Array<{ text: string }>;
    descriptions: Array<{ text: string }>;
    marketingImages: Array<{ url: string; aspectRatio?: string; fieldType?: string; name?: string; width?: number; height?: number }>;
    logos: Array<{ url: string; aspectRatio?: string; fieldType?: string; name?: string; width?: number; height?: number }>;
    youtubeVideos?: Array<{ url: string; videoId?: string; name?: string }>;
  };
  extensions?: any;
}

export interface DisplayCampaignPlan extends BaseCampaignPlanFields {
  campaignType: "DISPLAY";
  coreConfig: {
    campaignName: string;
    objective: "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "AWARENESS" | "NO_GUIDANCE" | string;
    status: "PAUSED" | "ENABLED";
    startDate: string;
    endDate?: string;
    euPolitical?: "YES" | "NO";
  };
  budgetConfig: {
    budgetType: "DAILY";
    amount: number;
    currencyCode: string;
    biddingStrategy: string;
    targetCpa?: number;
    targetRoas?: number;
  };
  targeting: CommonTargetingConfig;
  assets: {
    headlines: Array<{ text: string }>;
    longHeadlines: Array<{ text: string }>;
    descriptions: Array<{ text: string }>;
    marketingImages: Array<{ url: string; aspectRatio?: string; fieldType?: string; name?: string; width?: number; height?: number }>;
    logos: Array<{ url: string; aspectRatio?: string; fieldType?: string; name?: string; width?: number; height?: number }>;
  };
  extensions?: any;
}

export interface DemandGenCampaignPlan extends BaseCampaignPlanFields {
  campaignType: "DEMAND_GEN";
  coreConfig: {
    campaignName: string;
    objective: "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "AWARENESS" | "NO_GUIDANCE" | string;
    status: "PAUSED" | "ENABLED";
    startDate: string;
    endDate?: string;
    euPolitical?: "YES" | "NO";
    adFormat: "SINGLE_IMAGE" | "VIDEO" | "CAROUSEL";
  };
  budgetConfig: {
    budgetType: "DAILY" | "TOTAL";
    amount: number;
    currencyCode: string;
    biddingStrategy: string;
    targetCpa?: number;
    targetRoas?: number;
  };
  targeting: CommonTargetingConfig;
  assets: {
    headlines: Array<{ text: string }>;
    longHeadlines?: Array<{ text: string }>;
    descriptions: Array<{ text: string }>;
    marketingImages?: Array<{ url: string; aspectRatio?: string; fieldType?: string; name?: string }>;
    logos: Array<{ url: string; aspectRatio?: string; fieldType?: string; name?: string }>;
    youtubeVideos?: Array<{ url: string; videoId?: string; name?: string }>;
    carouselCards?: Array<{ image: string; headline: string; description?: string }>;
  };
  extensions?: any;
}

export interface ShoppingCampaignPlan extends BaseCampaignPlanFields {
  campaignType: "SHOPPING";
  coreConfig: {
    campaignName: string;
    objective: "SALES" | "NO_GUIDANCE" | string;
    status: "PAUSED" | "ENABLED";
    startDate: string;
    endDate?: string;
    euPolitical?: "YES" | "NO";
  };
  retailConfig: {
    merchantCenterId: string;
    salesCountry: string;
    feedLabel?: string;
    campaignPriority?: "LOW" | "MEDIUM" | "HIGH";
  };
  budgetConfig: {
    budgetType: "DAILY";
    amount: number;
    currencyCode: string;
    biddingStrategy: string;
    targetRoas?: number;
  };
  targeting: CommonTargetingConfig;
  assets?: any;
  extensions?: any;
}

export interface AppCampaignPlan extends BaseCampaignPlanFields {
  campaignType: "APP";
  coreConfig: {
    campaignName: string;
    objective: "APP_PROMOTION" | string;
    status: "PAUSED" | "ENABLED";
    startDate: string;
    endDate?: string;
    euPolitical?: "YES" | "NO";
  };
  appConfig: {
    platform: "ANDROID" | "IOS";
    appId: string;
    appName?: string;
    appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  };
  budgetConfig: {
    budgetType: "DAILY";
    amount: number;
    currencyCode: string;
    biddingStrategy?: string;
    targetCpa: number;
  };
  targeting: CommonTargetingConfig;
  assets: {
    headlines: Array<{ text: string }>;
    descriptions: Array<{ text: string }>;
    marketingImages?: Array<{ url: string }>;
    youtubeVideos?: Array<{ url: string }>;
  };
  extensions?: any;
}

export type CampaignPlan =
  | SearchCampaignPlan
  | PerformanceMaxCampaignPlan
  | DisplayCampaignPlan
  | DemandGenCampaignPlan
  | ShoppingCampaignPlan
  | AppCampaignPlan;

export class CampaignPlanMapper {
  /**
   * Normalizes campaign type and maps VIDEO intent to DEMAND_GEN with VIDEO ad format.
   */
  public static normalizeCampaignType(type: string): "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "DEMAND_GEN" | "SHOPPING" | "APP" {
    const upper = (type || "SEARCH").toUpperCase().trim();
    if (upper === "VIDEO") {
      return "DEMAND_GEN";
    }
    if (["SEARCH", "PERFORMANCE_MAX", "DISPLAY", "DEMAND_GEN", "SHOPPING", "APP"].includes(upper)) {
      return upper as any;
    }
    return "SEARCH";
  }

  /**
   * Transforms an AI Guided CampaignState into a deterministic, strictly typed Discriminated CampaignPlan.
   * Maps VIDEO intent to DemandGenCampaignPlan with adFormat = "VIDEO".
   */
  public static fromState(
    orgId: string,
    customerId: string,
    state: any,
    preflightChecks?: Partial<CampaignPlanPreflightChecks>
  ): CampaignPlan {
    const cleanCid = (customerId || "").replace(/-/g, "").trim();
    const todayStr = new Date().toISOString().split("T")[0];

    // Convert VIDEO intent to DEMAND_GEN with adFormat = "VIDEO"
    const rawType = (state.campaignType || "SEARCH").toUpperCase();
    const isVideoIntent = rawType === "VIDEO";
    const campaignType = this.normalizeCampaignType(rawType);

    const budgetType = (state.budgetType || "DAILY").toUpperCase() as "DAILY" | "TOTAL";
    const rawBudget = Number(
      budgetType === "TOTAL"
        ? (state.totalBudget !== undefined && state.totalBudget !== null && state.totalBudget !== "" ? state.totalBudget : (state.dailyBudget || state.budget))
        : (state.dailyBudget !== undefined && state.dailyBudget !== null && state.dailyBudget !== "" ? state.dailyBudget : state.budget)
    );
    const amount = isNaN(rawBudget) ? 0 : rawBudget;

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

    const targeting: CommonTargetingConfig = {
      locations: (Array.isArray(state.locations) && state.locations.length > 0) ? state.locations : ["India"],
      languages: rawLanguages.length > 0 ? rawLanguages : ["English"],
      adSchedule: state.adSchedule || state.adScheduleList || [],
      devices: state.devices || [],
      audienceSignalIds: state.audienceSignalIds || state.audienceSignals || [],
      audienceIntelligence: state.audienceIntelligence || [],
      searchThemes: state.searchThemes || []
    };

    const baseFields: BaseCampaignPlanFields = {
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

    const currencyCode = state.currencyCode || state.currency || "INR";
    const startDate = state.startDate ? String(state.startDate).split("T")[0] : todayStr;
    const endDate = state.endDate ? String(state.endDate).split("T")[0] : undefined;
    const campaignName = GoogleAdsBaseService.cleanAdText(state.campaignName || `${state.businessName || "Campaign"} - ${campaignType}`, 100);
    const status = state.status === "ENABLED" ? "ENABLED" : "PAUSED";
    const euPolitical = state.euPolitical || "NO";

    if (campaignType === "SEARCH") {
      return {
        ...baseFields,
        campaignType: "SEARCH",
        coreConfig: {
          campaignName,
          objective: (state.objective || "LEADS").toUpperCase(),
          status,
          startDate,
          endDate,
          euPolitical,
          networkSearch: state.networkSearch !== undefined ? Boolean(state.networkSearch) : true,
          networkDisplay: state.networkDisplay !== undefined ? Boolean(state.networkDisplay) : false
        },
        budgetConfig: {
          budgetType: "DAILY",
          amount,
          currencyCode,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: state.targetCpa ? Number(state.targetCpa) : undefined,
          targetRoas: state.targetRoas ? Number(state.targetRoas) : undefined,
          maxCpcLimit: state.maxCpcLimit ? Number(state.maxCpcLimit) : undefined
        },
        targeting,
        keywordsConfig: {
          positiveKeywords: keywords,
          campaignNegativeKeywords: state.negativeKeywords || state.campaignNegativeKeywords || []
        },
        assets: {
          headlines,
          descriptions
        },
        extensions: {
          sitelinks: state.sitelinks || [],
          callouts: state.callouts || [],
          structuredSnippets: state.structuredSnippets || [],
          callPhone: state.callPhoneNumber ? { phoneNumber: state.callPhoneNumber, countryCode: "IN" } : undefined,
          promotions: state.promotions || [],
          prices: state.prices || []
        }
      };
    }

    if (campaignType === "PERFORMANCE_MAX") {
      return {
        ...baseFields,
        campaignType: "PERFORMANCE_MAX",
        coreConfig: {
          campaignName,
          objective: (state.objective || "SALES").toUpperCase(),
          status,
          startDate,
          endDate,
          euPolitical,
          assetGroupName: state.assetGroupName,
          brandGuidelinesEnabled: state.brandGuidelinesEnabled !== undefined ? Boolean(state.brandGuidelinesEnabled) : false,
          customerAcquisitionMode: state.customerAcquisitionMode
        },
        budgetConfig: {
          budgetType: "DAILY",
          amount,
          currencyCode,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: state.targetCpa ? Number(state.targetCpa) : undefined,
          targetRoas: state.targetRoas ? Number(state.targetRoas) : undefined
        },
        targeting,
        assets: {
          headlines,
          longHeadlines,
          descriptions,
          marketingImages: (state.images || []).map((img: any) => typeof img === "string" ? { url: img } : img),
          logos: (state.logos || []).map((l: any) => typeof l === "string" ? { url: l } : l),
          youtubeVideos: (state.videos || []).map((v: any) => typeof v === "string" ? { url: v } : v)
        }
      };
    }

    if (campaignType === "DISPLAY") {
      return {
        ...baseFields,
        campaignType: "DISPLAY",
        coreConfig: {
          campaignName,
          objective: (state.objective || "SALES").toUpperCase(),
          status,
          startDate,
          endDate,
          euPolitical
        },
        budgetConfig: {
          budgetType: "DAILY",
          amount,
          currencyCode,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: state.targetCpa ? Number(state.targetCpa) : undefined,
          targetRoas: state.targetRoas ? Number(state.targetRoas) : undefined
        },
        targeting,
        assets: {
          headlines,
          longHeadlines,
          descriptions,
          marketingImages: (state.images || []).map((img: any) => typeof img === "string" ? { url: img } : img),
          logos: (state.logos || []).map((l: any) => typeof l === "string" ? { url: l } : l)
        }
      };
    }

    if (campaignType === "DEMAND_GEN") {
      const adFormat = isVideoIntent ? "VIDEO" : (state.adFormat || ((state.videos && state.videos.length > 0) ? "VIDEO" : "SINGLE_IMAGE"));
      return {
        ...baseFields,
        campaignType: "DEMAND_GEN",
        coreConfig: {
          campaignName,
          objective: (state.objective || "SALES").toUpperCase(),
          status,
          startDate,
          endDate,
          euPolitical,
          adFormat
        },
        budgetConfig: {
          budgetType,
          amount,
          currencyCode,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSIONS",
          targetCpa: state.targetCpa ? Number(state.targetCpa) : undefined,
          targetRoas: state.targetRoas ? Number(state.targetRoas) : undefined
        },
        targeting,
        assets: {
          headlines,
          longHeadlines,
          descriptions,
          marketingImages: (state.images || []).map((img: any) => typeof img === "string" ? { url: img } : img),
          logos: (state.logos || []).map((l: any) => typeof l === "string" ? { url: l } : l),
          youtubeVideos: (state.videos || []).map((v: any) => typeof v === "string" ? { url: v } : v),
          carouselCards: state.carouselCards || []
        }
      };
    }

    if (campaignType === "SHOPPING") {
      return {
        ...baseFields,
        campaignType: "SHOPPING",
        coreConfig: {
          campaignName,
          objective: (state.objective || "SALES").toUpperCase(),
          status,
          startDate,
          endDate,
          euPolitical
        },
        retailConfig: {
          merchantCenterId: state.merchantCenterId || state.merchantId || "",
          salesCountry: state.salesCountry || "",
          feedLabel: state.feedLabel || state.salesCountry || "",
          campaignPriority: state.campaignPriority || "LOW"
        },
        budgetConfig: {
          budgetType: "DAILY",
          amount,
          currencyCode,
          biddingStrategy: state.biddingStrategy || "MAXIMIZE_CONVERSION_VALUE",
          targetRoas: state.targetRoas ? Number(state.targetRoas) : undefined
        },
        targeting
      };
    }

    // AppCampaignPlan
    return {
      ...baseFields,
      campaignType: "APP",
      coreConfig: {
        campaignName,
        objective: "APP_PROMOTION",
        status,
        startDate,
        endDate,
        euPolitical
      },
      appConfig: {
        platform: state.platform || (state.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID"),
        appId: state.appId || "",
        appName: state.appName,
        appStore: state.appStore || (state.platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE")
      },
      budgetConfig: {
        budgetType: "DAILY",
        amount,
        currencyCode,
        biddingStrategy: state.biddingStrategy || "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST",
        targetCpa: Number(state.targetCpa || 0)
      },
      targeting,
      assets: {
        headlines,
        descriptions,
        marketingImages: state.images || [],
        youtubeVideos: state.videos || []
      }
    };
  }

  /**
   * Adapts a validated CampaignPlan back into the payload shape expected by existing objective campaign creation services.
   */
  public static toServicePayload(plan: CampaignPlan): any {
    const rawHeadlines = plan.assets && (plan.assets as any).headlines ? (plan.assets as any).headlines.map((h: any) => h.text) : [];
    const rawLongHeadlines = plan.assets && (plan.assets as any).longHeadlines ? (plan.assets as any).longHeadlines.map((lh: any) => lh.text) : [];
    const rawDescriptions = plan.assets && (plan.assets as any).descriptions ? (plan.assets as any).descriptions.map((d: any) => d.text) : [];

    const isTotal = plan.budgetConfig.budgetType === "TOTAL";
    const amount = plan.budgetConfig.amount;

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: plan.coreConfig.campaignName,
      objective: plan.coreConfig.objective,
      campaignType: plan.campaignType,
      businessName: plan.businessContext.businessName,
      website: plan.businessContext.websiteUrl,
      websiteVisitsUrl: plan.businessContext.websiteUrl,
      finalUrl: plan.businessContext.websiteUrl,
      // For daily budget: amountPerDay = amount; for total budget: amount is total
      dailyBudget: isTotal ? undefined : amount,
      budget: amount,
      budgetType: plan.budgetConfig.budgetType,
      totalBudget: isTotal ? amount : undefined,
      locations: plan.targeting.locations,
      languages: plan.targeting.languages,
      biddingStrategy: plan.budgetConfig.biddingStrategy,
      biddingFocus: plan.budgetConfig.biddingStrategy,
      targetCpa: (plan.budgetConfig as any).targetCpa,
      targetRoas: (plan.budgetConfig as any).targetRoas,
      maxCpcLimit: (plan.budgetConfig as any).maxCpcLimit,
      startDate: plan.coreConfig.startDate,
      endDate: plan.coreConfig.endDate,
      euPolitical: plan.coreConfig.euPolitical || "NO",
      keywords: plan.campaignType === "SEARCH" ? plan.keywordsConfig.positiveKeywords : [],
      headlines: rawHeadlines,
      longHeadlines: rawLongHeadlines.length > 0 ? rawLongHeadlines : (rawHeadlines[0] ? [rawHeadlines[0]] : []),
      descriptions: rawDescriptions,
      images: (plan.assets as any)?.marketingImages || [],
      logos: (plan.assets as any)?.logos || [],
      videos: (plan.assets as any)?.youtubeVideos || [],
      carouselCards: (plan.assets as any)?.carouselCards || [],
      adFormat: plan.campaignType === "DEMAND_GEN" ? (plan as DemandGenCampaignPlan).coreConfig.adFormat : undefined,
      searchThemes: plan.targeting.searchThemes || [],
      audienceSignals: plan.targeting.audienceSignalIds || [],
      adSchedule: plan.targeting.adSchedule || [],
      devices: plan.targeting.devices || [],
      sitelinks: plan.extensions?.sitelinks || [],
      callouts: plan.extensions?.callouts || [],
      structuredSnippets: plan.extensions?.structuredSnippets || [],
      callAsset: plan.extensions?.callPhone ? { phone: plan.extensions.callPhone.phoneNumber, countryCode: plan.extensions.callPhone.countryCode } : undefined,
      callPhoneNumber: plan.extensions?.callPhone?.phoneNumber,
      promotions: plan.extensions?.promotions || [],
      prices: plan.extensions?.prices || [],
      merchantCenterId: plan.campaignType === "SHOPPING" ? plan.retailConfig?.merchantCenterId : undefined,
      salesCountry: plan.campaignType === "SHOPPING" ? plan.retailConfig?.salesCountry : undefined,
      feedLabel: plan.campaignType === "SHOPPING" ? plan.retailConfig?.feedLabel : undefined,
      campaignPriority: plan.campaignType === "SHOPPING" ? plan.retailConfig?.campaignPriority : undefined,
      appId: plan.campaignType === "APP" ? plan.appConfig?.appId : undefined,
      platform: plan.campaignType === "APP" ? plan.appConfig?.platform : undefined,
      appStore: plan.campaignType === "APP" ? plan.appConfig?.appStore : undefined
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

    const approvedKeywords = plan.campaignType === "SEARCH" ? plan.keywordsConfig.positiveKeywords : [];
    const approvedNegativeKeywords = plan.campaignType === "SEARCH" ? (plan.keywordsConfig.campaignNegativeKeywords || []) : [];
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
      campaignType: plan.campaignType,
      campaignName: plan.coreConfig.campaignName,
      dailyBudget: plan.budgetConfig.amount,
      biddingStrategy: plan.budgetConfig.biddingStrategy || "MAXIMIZE_CONVERSIONS",
      targetCpa: (plan.budgetConfig as any).targetCpa,
      targetRoas: (plan.budgetConfig as any).targetRoas,
      locations: plan.targeting.locations,
      languages: plan.targeting.languages,
      retailConfig: plan.campaignType === "SHOPPING" ? plan.retailConfig : undefined,
      appConfig: plan.campaignType === "APP" ? plan.appConfig : undefined,
      youtubeVideosCount: ((plan.assets as any)?.youtubeVideos || []).length,
      marketingImagesCount: ((plan.assets as any)?.marketingImages || []).length,
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
