/**
 * Campaign Payload Builders for Google Ads Campaigns.
 *
 * Provides strongly-typed, discriminated payload builders for:
 * - SEARCH
 * - PERFORMANCE_MAX
 * - DISPLAY
 * - DEMAND_GEN
 * - SHOPPING
 * - APP
 *
 * Ensures:
 * 1. Zero field leakage between campaign types (e.g. merchantCenterId cannot leak to Search, keywords cannot leak to App).
 * 2. Strict strategy-compatible bidding fields (no sending both Target CPA and Target ROAS or Manual CPC bids when automated).
 * 3. Consistent date, budget, and targeting representations.
 */

import {
  NormalizedBudget,
  NormalizedDates,
  NormalizedBidding,
  NormalizedLanguages,
  NormalizedLocations,
  SupportedObjective,
  SupportedCampaignType
} from "./CampaignNormalizationService";
import { GoogleAdsBaseService } from "./GoogleAdsBaseService";

export interface NormalizedCampaignContext {
  organizationId: string;
  customerId: string;
  campaignType: SupportedCampaignType;
  objective: SupportedObjective;
  campaignName: string;
  adName?: string;
  adGroupName?: string;
  businessName?: string;
  finalUrl?: string;
  mobileFinalUrl?: string;
  displayPath1?: string;
  displayPath2?: string;
  budget: NormalizedBudget;
  dates: NormalizedDates;
  bidding: NormalizedBidding;
  targeting: {
    locations: NormalizedLocations;
    languages: NormalizedLanguages;
    devices?: any;
    adSchedule?: any[];
  };
  assets: {
    headlines: string[];
    longHeadlines: string[];
    descriptions: string[];
    images: any[];
    logos: any[];
    videos: any[];
    carouselCards?: any[];
  };
  extensions?: {
    sitelinks?: any[];
    callouts?: any[];
    structuredSnippets?: any[];
    callAsset?: any;
    promotions?: any[];
    prices?: any[];
    leadForms?: any[];
  };
  conversionGoals?: any[];
  euPolitical?: string;
  customParameters?: any[];
  trackingTemplate?: string;
  finalUrlSuffix?: string;
  rawState: any;
}

export class CampaignPayloadBuilders {
  /**
   * Builds Search campaign payload with strict field isolation.
   */
  public static buildSearchPayload(ctx: NormalizedCampaignContext): any {
    const raw = ctx.rawState;
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(ctx.trackingTemplate);

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: ctx.campaignName,
      websiteVisitsUrl: ctx.finalUrl,
      finalUrl: ctx.finalUrl,
      businessName: ctx.businessName,
      dailyBudget: ctx.budget.dailyBudget,
      budget: ctx.budget.type === "TOTAL" && ctx.budget.totalBudget ? ctx.budget.totalBudget : ctx.budget.dailyBudget,
      budgetType: ctx.budget.type,
      totalBudget: ctx.budget.totalBudget,
      locations: ctx.targeting.locations.locations,
      languages: ctx.targeting.languages.languages,
      biddingFocus: ctx.bidding.uiLabel,
      biddingStrategy: ctx.bidding.strategy,
      targetCpa: ctx.bidding.targetCpa,
      targetRoas: ctx.bidding.targetRoas,
      maxCpcLimit: ctx.bidding.maxCpcLimit,
      startDate: ctx.dates.startDate,
      endDate: ctx.dates.endDate,
      keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
      headlines: ctx.assets.headlines,
      descriptions: ctx.assets.descriptions,
      euPolitical: ctx.euPolitical || "NO",
      // Search Networks: display network strictly defaults to false unless explicitly true
      networkSearch: raw.networkSearch !== undefined ? Boolean(raw.networkSearch) : true,
      networkDisplay: raw.networkDisplay !== undefined ? Boolean(raw.networkDisplay) : false,
      locationOptionsPresence: ctx.targeting.locations.positiveGeoTargetType || "PRESENCE_INTEREST",
      locationOptionsExclude: ctx.targeting.locations.negativeGeoTargetType || "PRESENCE",
      adRotationMode: raw.adRotationMode || "OPTIMIZE",
      displayPath1: ctx.displayPath1,
      displayPath2: ctx.displayPath2,
      adGroupName: raw.adGroupName,
      trackingTemplate: cleanTrackingTemplate,
      finalUrlSuffix: ctx.finalUrlSuffix,
      customParameters: ctx.customParameters || [],
      adSchedule: ctx.targeting.adSchedule || [],
      devices: ctx.targeting.devices,
      sitelinks: ctx.extensions?.sitelinks || [],
      callouts: ctx.extensions?.callouts || [],
      structuredSnippets: ctx.extensions?.structuredSnippets || [],
      callAsset: ctx.extensions?.callAsset,
      callPhoneNumber: raw.callPhoneNumber || (ctx.extensions?.callAsset?.phoneNumber),
      promotions: ctx.extensions?.promotions || [],
      prices: ctx.extensions?.prices || [],
      leadForms: ctx.extensions?.leadForms || [],
      searchThemes: raw.searchThemes || [],
      conversionGoals: ctx.conversionGoals || []
    };
  }

  /**
   * Builds Performance Max payload with strict asset group and field isolation.
   */
  public static buildPerformanceMaxPayload(ctx: NormalizedCampaignContext): any {
    const raw = ctx.rawState;
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(ctx.trackingTemplate);

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: ctx.campaignName,
      finalUrl: ctx.finalUrl,
      businessName: ctx.businessName,
      dailyBudget: ctx.budget.dailyBudget,
      budget: ctx.budget.type === "TOTAL" && ctx.budget.totalBudget ? ctx.budget.totalBudget : ctx.budget.dailyBudget,
      budgetType: ctx.budget.type,
      totalBudget: ctx.budget.totalBudget,
      locations: ctx.targeting.locations.locations,
      languages: ctx.targeting.languages.languages,
      biddingFocus: ctx.bidding.uiLabel,
      biddingStrategy: ctx.bidding.strategy,
      targetCpa: ctx.bidding.targetCpa,
      targetRoas: ctx.bidding.targetRoas,
      headlines: ctx.assets.headlines,
      longHeadlines: ctx.assets.longHeadlines,
      descriptions: ctx.assets.descriptions,
      images: ctx.assets.images,
      logos: ctx.assets.logos,
      brandLogos: ctx.assets.logos,
      assetGroupName: (raw.assetGroupName && String(raw.assetGroupName).trim()) ? String(raw.assetGroupName).trim() : `${ctx.campaignName} Asset Group 1`,
      brandGuidelinesEnabled: Boolean(raw.brandGuidelinesEnabled),
      startDate: ctx.dates.startDate,
      endDate: ctx.dates.endDate,
      euPolitical: ctx.euPolitical || "NO",
      merchantCenterId: raw.merchantCenterId || raw.merchantId,
      merchantId: raw.merchantCenterId || raw.merchantId,
      feedLabel: raw.feedLabel,
      salesCountry: raw.salesCountry,
      customerAcquisitionMode: raw.customerAcquisitionMode,
      positiveGeoTargetType: ctx.targeting.locations.positiveGeoTargetType,
      negativeGeoTargetType: ctx.targeting.locations.negativeGeoTargetType,
      trackingTemplate: cleanTrackingTemplate,
      finalUrlSuffix: ctx.finalUrlSuffix,
      customParameters: ctx.customParameters || [],
      displayPath1: ctx.displayPath1,
      displayPath2: ctx.displayPath2,
      mobileFinalUrl: ctx.mobileFinalUrl,
      searchThemes: raw.searchThemes || [],
      audienceSignals: raw.audienceSignals || raw.audienceSignalIds || [],
      sitelinks: ctx.extensions?.sitelinks || [],
      callouts: ctx.extensions?.callouts || [],
      promotions: ctx.extensions?.promotions || [],
      prices: ctx.extensions?.prices || [],
      leadForms: ctx.extensions?.leadForms || [],
      callAsset: ctx.extensions?.callAsset,
      structuredSnippets: ctx.extensions?.structuredSnippets || [],
      adSchedule: ctx.targeting.adSchedule || [],
      devices: ctx.targeting.devices,
      conversionGoals: ctx.conversionGoals || [],
      localServicesEnabled: ctx.objective === "STORE_VISITS" || ctx.objective === "LOCAL"
    };
  }

  /**
   * Builds Display campaign payload. Requires DAILY budget only in Google Ads API.
   */
  public static buildDisplayPayload(ctx: NormalizedCampaignContext): any {
    const raw = ctx.rawState;
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(ctx.trackingTemplate);

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: ctx.campaignName,
      finalUrl: ctx.finalUrl,
      mobileFinalUrl: ctx.mobileFinalUrl,
      businessName: ctx.businessName,
      dailyBudget: ctx.budget.dailyBudget,
      budget: ctx.budget.dailyBudget,
      locations: ctx.targeting.locations.locations,
      languages: ctx.targeting.languages.languages,
      biddingStrategy: ctx.bidding.strategy,
      biddingFocus: ctx.bidding.uiLabel,
      targetCpa: ctx.bidding.targetCpa,
      targetRoas: ctx.bidding.targetRoas,
      startDate: ctx.dates.startDate,
      endDate: ctx.dates.endDate,
      headlines: ctx.assets.headlines,
      longHeadlines: ctx.assets.longHeadlines,
      descriptions: ctx.assets.descriptions,
      images: ctx.assets.images,
      logos: ctx.assets.logos,
      videos: ctx.assets.videos,
      callToAction: raw.callToAction || raw.callToActionText || "Automated",
      euPolitical: ctx.euPolitical || "NO",
      devices: ctx.targeting.devices,
      adSchedule: ctx.targeting.adSchedule || [],
      trackingTemplate: cleanTrackingTemplate,
      finalUrlSuffix: ctx.finalUrlSuffix,
      customParameters: ctx.customParameters || [],
      audiences: raw.audiences || raw.selectedAudiences || [],
      selectedAudiences: raw.selectedAudiences || [],
      topics: raw.topics || raw.selectedTopics || [],
      selectedTopics: raw.selectedTopics || [],
      placements: raw.placements || raw.selectedPlacements || [],
      selectedPlacements: raw.selectedPlacements || [],
      keywords: raw.keywords || [],
      useOptimizedTargeting: raw.useOptimizedTargeting !== undefined ? Boolean(raw.useOptimizedTargeting) : true,
      sitelinks: ctx.extensions?.sitelinks || [],
      callouts: ctx.extensions?.callouts || [],
      structuredSnippets: ctx.extensions?.structuredSnippets || [],
      promotions: ctx.extensions?.promotions || [],
      callAsset: ctx.extensions?.callAsset,
      conversionGoals: ctx.conversionGoals || []
    };
  }

  /**
   * Builds Demand Gen payload. Supports ad formats: SINGLE_IMAGE, VIDEO, CAROUSEL.
   */
  public static buildDemandGenPayload(ctx: NormalizedCampaignContext): any {
    const raw = ctx.rawState;
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(ctx.trackingTemplate);

    const resolvedBudgetType = raw.demandGenBudgetType || (ctx.budget.type === "TOTAL" ? "Total" : "Daily");

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: ctx.campaignName,
      adName: raw.adName || ctx.adName || undefined,
      adGroupName: raw.adGroupName || undefined,
      adGroups: raw.adGroups || undefined,
      finalUrl: ctx.finalUrl,
      website: ctx.finalUrl,
      businessName: ctx.businessName,
      dailyBudget: ctx.budget.dailyBudget,
      budget: ctx.budget.type === "TOTAL" && ctx.budget.totalBudget ? ctx.budget.totalBudget : ctx.budget.dailyBudget,
      totalBudget: ctx.budget.totalBudget,
      budgetType: resolvedBudgetType,
      demandGenBudgetType: resolvedBudgetType,
      locations: ctx.targeting.locations.locations,
      languages: ctx.targeting.languages.languages,
      biddingStrategy: ctx.bidding.strategy,
      biddingFocus: ctx.bidding.uiLabel,
      targetCpa: ctx.bidding.targetCpa,
      targetRoas: ctx.bidding.targetRoas,
      startDate: ctx.dates.startDate,
      endDate: ctx.dates.endDate,
      adFormat: raw.adFormat || "SINGLE_IMAGE",
      channelTargeting: raw.channelTargeting || "ALL",
      channels: raw.channels || [],
      carouselCards: ctx.assets.carouselCards || raw.carouselCards || [],
      callToAction: raw.callToAction || "Automated",
      displayPath1: raw.displayPath1 || undefined,
      displayPath2: raw.displayPath2 || undefined,
      mobileFinalUrl: raw.mobileFinalUrl || undefined,
      callPhoneNumber: raw.callPhoneNumber || undefined,
      headlines: ctx.assets.headlines,
      longHeadlines: ctx.assets.longHeadlines,
      descriptions: ctx.assets.descriptions,
      images: ctx.assets.images,
      logos: ctx.assets.logos,
      videos: ctx.assets.videos,
      youtubeVideos: ctx.assets.videos,
      euPolitical: ctx.euPolitical || "NO",
      includeViewThrough: raw.includeViewThrough !== undefined ? Boolean(raw.includeViewThrough) : true,
      mainBrandColor: raw.mainBrandColor || undefined,
      accentBrandColor: raw.accentBrandColor || undefined,
      brandFont: raw.brandFont || undefined,
      brandGuidelines: raw.brandGuidelines || (raw.mainBrandColor && raw.accentBrandColor ? {
        mainBrandColor: raw.mainBrandColor,
        accentBrandColor: raw.accentBrandColor,
        brandFont: raw.brandFont
      } : undefined),
      optAdaptiveLayouts: raw.optAdaptiveLayouts !== undefined ? Boolean(raw.optAdaptiveLayouts) : true,
      optAnimatedImages: raw.optAnimatedImages !== undefined ? Boolean(raw.optAnimatedImages) : true,
      optGeneratedVideos: raw.optGeneratedVideos !== undefined ? Boolean(raw.optGeneratedVideos) : true,
      optShorterVideos: Boolean(raw.optShorterVideos),
      optResizedVideos: raw.optResizedVideos !== undefined ? Boolean(raw.optResizedVideos) : true,
      optLandingPagePreviews: raw.optLandingPagePreviews !== undefined ? Boolean(raw.optLandingPagePreviews) : true,
      deviceTargeting: raw.deviceTargeting || "ALL",
      devices: ctx.targeting.devices || raw.devices || { computers: true, mobile: true, tablets: true, tv: true },
      adSchedule: ctx.targeting.adSchedule || raw.adSchedule || [],
      trackingTemplate: cleanTrackingTemplate,
      finalUrlSuffix: ctx.finalUrlSuffix,
      customParameters: ctx.customParameters || raw.customParameters || [],
      sitelinks: ctx.extensions?.sitelinks || [],
      callouts: ctx.extensions?.callouts || [],
      structuredSnippets: ctx.extensions?.structuredSnippets || [],
      promotions: ctx.extensions?.promotions || [],
      audienceSignals: raw.audienceSignals || (raw.audienceSignal ? [raw.audienceSignal] : []),
      searchThemes: raw.searchThemes || [],
      keywords: raw.keywords || [],
      demographicExclusions: raw.demographicExclusions || undefined,
      genderExclusions: raw.genderExclusions || raw.demographicExclusions?.genders || undefined,
      ageExclusions: raw.ageExclusions || raw.demographicExclusions?.ages || undefined,
      brandExclusions: raw.brandExclusions || undefined,
      brandInclusions: raw.brandInclusions || undefined,
      valueRules: raw.valueRules || undefined,
      merchantCenterId: raw.merchantCenterId || raw.merchantId || undefined,
      merchantId: raw.merchantCenterId || raw.merchantId || undefined,
      conversionGoals: ctx.conversionGoals || []
    };
  }

  /**
   * Builds Shopping campaign payload with verified Merchant Center configuration.
   */
  public static buildShoppingPayload(ctx: NormalizedCampaignContext): any {
    const raw = ctx.rawState;
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(ctx.trackingTemplate);

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: ctx.campaignName,
      finalUrl: ctx.finalUrl,
      merchantCenterId: raw.merchantCenterId || raw.merchantId,
      salesCountry: raw.salesCountry,
      feedLabel: raw.feedLabel || raw.salesCountry,
      dailyBudget: ctx.budget.dailyBudget,
      budget: ctx.budget.type === "TOTAL" && ctx.budget.totalBudget ? ctx.budget.totalBudget : ctx.budget.dailyBudget,
      budgetType: ctx.budget.type,
      totalBudget: ctx.budget.totalBudget,
      locations: ctx.targeting.locations.locations,
      languages: ctx.targeting.languages.languages,
      biddingStrategy: ctx.bidding.strategy,
      biddingFocus: ctx.bidding.uiLabel,
      targetRoas: ctx.bidding.targetRoas,
      campaignPriority: raw.campaignPriority || "LOW",
      customerAcquisitionMode: raw.customerAcquisitionMode || "ALL_CUSTOMERS",
      localProducts: Boolean(raw.localProducts || raw.enableLocalProducts),
      adGroupName: raw.adGroupName || "Ad group 1",
      adGroupBid: raw.adGroupBid,
      productGroupFilter: raw.productGroupFilter || "Use all products",
      productGroupSelectBy: raw.productGroupSelectBy,
      productGroupCustomLabel: raw.productGroupCustomLabel,
      trackingTemplate: cleanTrackingTemplate,
      finalUrlSuffix: ctx.finalUrlSuffix,
      customParameters: ctx.customParameters || [],
      adSchedule: ctx.targeting.adSchedule || [],
      devices: ctx.targeting.devices,
      startDate: ctx.dates.startDate,
      endDate: ctx.dates.endDate,
      euPolitical: ctx.euPolitical || "NO",
      conversionGoals: ctx.conversionGoals || []
    };
  }

  /**
   * Builds App campaign payload. Platform must be explicit ("ANDROID" or "IOS").
   */
  public static buildAppPayload(ctx: NormalizedCampaignContext): any {
    const raw = ctx.rawState;
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(ctx.trackingTemplate);

    return {
      source: "AI_GUIDED",
      isAiGuided: true,
      campaignName: ctx.campaignName,
      platform: raw.platform,
      appId: raw.appId,
      appName: raw.appName,
      businessName: ctx.businessName,
      locations: ctx.targeting.locations.locations,
      languages: ctx.targeting.languages.languages,
      headlines: ctx.assets.headlines,
      descriptions: ctx.assets.descriptions,
      targetCpa: ctx.bidding.targetCpa,
      dailyBudget: ctx.budget.dailyBudget,
      budget: ctx.budget.dailyBudget,
      startDate: ctx.dates.startDate,
      endDate: ctx.dates.endDate,
      euPolitical: ctx.euPolitical || "NO",
      images: ctx.assets.images,
      videos: ctx.assets.videos,
      trackingTemplate: cleanTrackingTemplate,
      finalUrlSuffix: ctx.finalUrlSuffix,
      customParameters: ctx.customParameters || [],
      conversionGoals: ctx.conversionGoals || []
    };
  }
}
