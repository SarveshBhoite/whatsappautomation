import {
  CommonCampaignRules,
  SearchCampaignRules,
  PerformanceMaxCampaignRules,
  DisplayCampaignRules,
  DemandGenCampaignRules,
  ShoppingCampaignRules,
  AppCampaignRules
} from "../src/services/googleAds/shared/GoogleAdsCampaignRules";
import { GoogleAdsCampaignValidator } from "../src/services/googleAds/shared/GoogleAdsCampaignValidator";
import { CampaignPlanMapper } from "../src/services/googleAds/shared/CampaignPlan";

describe("Official Google Ads API Campaign Rules & Validation Suite", () => {
  const baseValidState = {
    customerId: "1234567890",
    organizationId: "org-test-1",
    campaignName: "Test Marketing Campaign",
    businessName: "Acme Software Corp",
    website: "https://acmesoftware.com/landing",
    currencyCode: "INR",
    budgetType: "DAILY",
    dailyBudget: 1500,
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    locations: ["India"],
    languages: ["English"],
    userConfirmed: true
  };

  // ───────────────────────────────────────────────────────────────────────────
  // COMMON VALIDATION
  // ───────────────────────────────────────────────────────────────────────────
  describe("Common Campaign Rules", () => {
    test("rejects invalid or missing Customer ID", () => {
      const state = { ...baseValidState, customerId: "invalid-cid" };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "INVALID_CUSTOMER_ID")).toBe(true);
    });

    test("rejects missing campaign name", () => {
      const state = { ...baseValidState, campaignName: "" };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "MISSING_CAMPAIGN_NAME")).toBe(true);
    });

    test("rejects negative or zero budget", () => {
      const state = { ...baseValidState, dailyBudget: 0 };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "BUDGET_MUST_BE_POSITIVE")).toBe(true);
    });

    test("blocks campaign total budget if startDate is missing", () => {
      const state = { ...baseValidState, budgetType: "TOTAL", totalBudget: 50000, startDate: undefined, endDate: "2026-11-30" };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "MISSING_START_DATE_FOR_TOTAL_BUDGET")).toBe(true);
    });

    test("blocks campaign total budget if endDate is missing", () => {
      const state = { ...baseValidState, budgetType: "TOTAL", totalBudget: 50000, startDate: "2026-11-01", endDate: undefined };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "MISSING_END_DATE_FOR_TOTAL_BUDGET")).toBe(true);
    });

    test("blocks publish if endDate <= startDate", () => {
      const stateEqual = { ...baseValidState, startDate: "2026-11-01", endDate: "2026-11-01" };
      const errorsEqual = CommonCampaignRules.validate(stateEqual);
      expect(errorsEqual.some(e => e.code === "END_DATE_BEFORE_START_DATE")).toBe(true);

      const stateBefore = { ...baseValidState, startDate: "2026-12-01", endDate: "2026-11-01" };
      const errorsBefore = CommonCampaignRules.validate(stateBefore);
      expect(errorsBefore.some(e => e.code === "END_DATE_BEFORE_START_DATE")).toBe(true);
    });

    test("blocks TOTAL budget if totalBudget <= 0", () => {
      const state = { ...baseValidState, budgetType: "TOTAL", totalBudget: 0, startDate: "2026-11-01", endDate: "2026-11-30" };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "BUDGET_MUST_BE_POSITIVE")).toBe(true);
    });

    test("blocks TOTAL budget when amount_micros is provided (Google Ads API requires only total_amount_micros)", () => {
      const state = {
        ...baseValidState,
        budgetType: "TOTAL",
        totalBudget: 50000,
        amount_micros: "50000000000",
        startDate: "2026-11-01",
        endDate: "2026-11-30"
      };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "TOTAL_BUDGET_AMOUNT_MICROS_FORBIDDEN")).toBe(true);
    });

    test("blocks DAILY budget when total_amount_micros is provided (Google Ads API requires only amount_micros)", () => {
      const state = {
        ...baseValidState,
        budgetType: "DAILY",
        dailyBudget: 1500,
        total_amount_micros: "1500000000"
      };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "DAILY_BUDGET_TOTAL_AMOUNT_MICROS_FORBIDDEN")).toBe(true);
    });

    test("rejects placeholder domains such as example.com", () => {
      const state = { ...baseValidState, website: "https://example.com/shop" };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "FORBIDDEN_PLACEHOLDER_DOMAIN")).toBe(true);
    });

    test("rejects missing locations", () => {
      const state = { ...baseValidState, locations: [] };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "MISSING_LOCATIONS")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SEARCH CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  describe("Search Campaign Rules", () => {
    test("valid Search campaign passes validation", () => {
      const state = {
        ...baseValidState,
        campaignType: "SEARCH",
        biddingStrategy: "MAXIMIZE_CONVERSIONS",
        targetCpa: 250,
        headlines: ["Fast CRM Software", "Boost Sales Today", "Automate Customer Care"],
        descriptions: ["Get complete CRM automation with omni-channel messaging.", "Sign up today for a 14-day free demo of our platform."],
        keywords: ["crm automation", "whatsapp crm", "customer support tool"]
      };
      const errors = SearchCampaignRules.validate(state);
      expect(errors).toHaveLength(0);
    });

    test("Search with Campaign Total Budget is valid when bidding strategy and start/end dates are provided", () => {
      const state = {
        ...baseValidState,
        campaignType: "SEARCH",
        budgetType: "TOTAL",
        totalBudget: 50000,
        startDate: "2026-11-01",
        endDate: "2026-11-30",
        biddingStrategy: "MAXIMIZE_CONVERSIONS",
        headlines: ["Fast CRM Software", "Boost Sales Today", "Automate Customer Care"],
        descriptions: ["Get complete CRM automation with omni-channel messaging.", "Sign up today for a 14-day free demo of our platform."],
        keywords: ["crm automation", "whatsapp crm", "customer support tool"]
      };
      const commonErrors = CommonCampaignRules.validate(state);
      const searchErrors = SearchCampaignRules.validate(state);
      expect(commonErrors).toHaveLength(0);
      expect(searchErrors).toHaveLength(0);
    });

    test("blocks Search with Campaign Total Budget when bidding strategy is incompatible", () => {
      const state = {
        ...baseValidState,
        campaignType: "SEARCH",
        budgetType: "TOTAL",
        totalBudget: 50000,
        startDate: "2026-11-01",
        endDate: "2026-11-30",
        biddingStrategy: "TARGET_IMPRESSION_SHARE",
        headlines: ["Fast CRM Software", "Boost Sales Today", "Automate Customer Care"],
        descriptions: ["Get complete CRM automation with omni-channel messaging.", "Sign up today for a 14-day free demo of our platform."],
        keywords: ["crm automation"]
      };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "BIDDING_STRATEGY_INCOMPATIBLE_WITH_TOTAL_BUDGET")).toBe(true);
    });

    test("blocks Search when target CPA is paired with Maximize Conversion Value", () => {
      const state = {
        ...baseValidState,
        campaignType: "SEARCH",
        biddingStrategy: "MAXIMIZE_CONVERSION_VALUE",
        targetCpa: 300,
        headlines: ["H1", "H2", "H3"],
        descriptions: ["D1", "D2"],
        keywords: ["k1"]
      };
      const errors = SearchCampaignRules.validate(state);
      expect(errors.some(e => e.code === "SEARCH_INCOMPATIBLE_TARGET_CPA")).toBe(true);
    });

    test("blocks Search when target ROAS is paired with Maximize Conversions", () => {
      const state = {
        ...baseValidState,
        campaignType: "SEARCH",
        biddingStrategy: "MAXIMIZE_CONVERSIONS",
        targetRoas: 400,
        headlines: ["H1", "H2", "H3"],
        descriptions: ["D1", "D2"],
        keywords: ["k1"]
      };
      const errors = SearchCampaignRules.validate(state);
      expect(errors.some(e => e.code === "SEARCH_INCOMPATIBLE_TARGET_ROAS")).toBe(true);
    });

    test("blocks Search when fewer than 3 headlines or 2 descriptions or 0 keywords are provided", () => {
      const state = {
        ...baseValidState,
        campaignType: "SEARCH",
        headlines: ["Only One Headline"],
        descriptions: ["Only One Description"],
        keywords: []
      };
      const errors = SearchCampaignRules.validate(state);
      expect(errors.some(e => e.code === "SEARCH_INSUFFICIENT_HEADLINES")).toBe(true);
      expect(errors.some(e => e.code === "SEARCH_INSUFFICIENT_DESCRIPTIONS")).toBe(true);
      expect(errors.some(e => e.code === "SEARCH_MISSING_KEYWORDS")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PERFORMANCE MAX CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  describe("Performance Max Campaign Rules", () => {
    test("valid Performance Max campaign with real landscape, square and logo passes", () => {
      const state = {
        ...baseValidState,
        campaignType: "PERFORMANCE_MAX",
        biddingStrategy: "MAXIMIZE_CONVERSIONS",
        headlines: ["Headline One", "Headline Two", "Headline Three"],
        longHeadlines: ["Long Headline Announcing Special Limited Time Platform Offerings"],
        descriptions: ["Full descriptive text explaining benefits to marketing teams.", "Another unique description highlighting instant onboarding."],
        images: [
          { url: "https://acmesoftware.com/img_land.jpg", aspectRatio: "1.91:1", width: 1200, height: 628 },
          { url: "https://acmesoftware.com/img_sq.jpg", aspectRatio: "1:1", width: 600, height: 600 }
        ],
        logos: [
          { url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1", width: 300, height: 300 }
        ]
      };
      const errors = PerformanceMaxCampaignRules.validate(state);
      expect(errors).toHaveLength(0);
    });

    test("Performance Max with Campaign Total Budget is valid when strategy and start/end dates are provided", () => {
      const state = {
        ...baseValidState,
        campaignType: "PERFORMANCE_MAX",
        budgetType: "TOTAL",
        totalBudget: 60000,
        startDate: "2026-11-01",
        endDate: "2026-11-30",
        biddingStrategy: "MAXIMIZE_CONVERSIONS",
        headlines: ["Headline One", "Headline Two", "Headline Three"],
        longHeadlines: ["Long Headline Announcing Special Limited Time Platform Offerings"],
        descriptions: ["Full descriptive text explaining benefits to marketing teams.", "Another unique description highlighting instant onboarding."],
        images: [
          { url: "https://acmesoftware.com/img_land.jpg", aspectRatio: "1.91:1", width: 1200, height: 628 },
          { url: "https://acmesoftware.com/img_sq.jpg", aspectRatio: "1:1", width: 600, height: 600 }
        ],
        logos: [
          { url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1", width: 300, height: 300 }
        ]
      };
      const commonErrors = CommonCampaignRules.validate(state);
      const pmaxErrors = PerformanceMaxCampaignRules.validate(state);
      expect(commonErrors).toHaveLength(0);
      expect(pmaxErrors).toHaveLength(0);
    });

    test("rejects Performance Max with unsupported bidding strategies (MANUAL_CPC, MAXIMIZE_CLICKS)", () => {
      const state = {
        ...baseValidState,
        campaignType: "PERFORMANCE_MAX",
        biddingStrategy: "MANUAL_CPC"
      };
      const errors = PerformanceMaxCampaignRules.validate(state);
      expect(errors.some(e => e.code === "PMAX_UNSUPPORTED_BIDDING_STRATEGY")).toBe(true);
    });

    test("blocks Performance Max when only one image is supplied without real dimensions satisfying both ratios", () => {
      const state = {
        ...baseValidState,
        campaignType: "PERFORMANCE_MAX",
        headlines: ["H1", "H2", "H3"],
        longHeadlines: ["Long Headline 1"],
        descriptions: ["Desc 1", "Desc 2"],
        images: [
          { url: "https://acmesoftware.com/random_image.jpg", width: 1200, height: 628, aspectRatio: "1.91:1" }
        ],
        logos: [
          { url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1", width: 200, height: 200 }
        ]
      };
      const errors = PerformanceMaxCampaignRules.validate(state);
      expect(errors.some(e => e.code === "PMAX_MISSING_SQUARE_IMAGE")).toBe(true);
    });

    test("blocks Performance Max when logo is missing", () => {
      const state = {
        ...baseValidState,
        campaignType: "PERFORMANCE_MAX",
        headlines: ["H1", "H2", "H3"],
        longHeadlines: ["Long Headline 1"],
        descriptions: ["Desc 1", "Desc 2"],
        images: [
          { url: "https://acmesoftware.com/land.jpg", aspectRatio: "1.91:1", width: 1200, height: 628 },
          { url: "https://acmesoftware.com/sq.jpg", aspectRatio: "1:1", width: 600, height: 600 }
        ],
        logos: []
      };
      const errors = PerformanceMaxCampaignRules.validate(state);
      expect(errors.some(e => e.code === "PMAX_MISSING_LOGO")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DISPLAY CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  describe("Display Campaign Rules", () => {
    test("valid Responsive Display Ad passes", () => {
      const state = {
        ...baseValidState,
        campaignType: "DISPLAY",
        headlines: ["Display Ad Headline"],
        longHeadlines: ["Display Ad Long Headline Announcing Omnichannel Solutions"],
        descriptions: ["Responsive display description delivering clear value."],
        images: [
          { url: "https://acmesoftware.com/d_land.jpg", aspectRatio: "1.91:1", width: 1200, height: 628 },
          { url: "https://acmesoftware.com/d_sq.jpg", aspectRatio: "1:1", width: 600, height: 600 }
        ],
        logos: [
          { url: "https://acmesoftware.com/d_logo.jpg", aspectRatio: "1:1", width: 300, height: 300 }
        ]
      };
      const errors = DisplayCampaignRules.validate(state);
      expect(errors).toHaveLength(0);
    });

    test("blocks Display with Campaign Total Budget", () => {
      const state = {
        ...baseValidState,
        campaignType: "DISPLAY",
        budgetType: "TOTAL",
        totalBudget: 25000,
        startDate: "2026-11-01",
        endDate: "2026-11-30"
      };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "TOTAL_BUDGET_UNSUPPORTED_FOR_CAMPAIGN_TYPE")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DEMAND GEN CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  describe("Demand Gen Campaign Rules", () => {
    test("Demand Gen format VIDEO requires genuine YouTube video and does NOT fallback to single image", () => {
      const state = {
        ...baseValidState,
        campaignType: "DEMAND_GEN",
        adFormat: "VIDEO",
        headlines: ["Engage Now with Video"],
        descriptions: ["Watch our detailed product demo on YouTube."],
        logos: [{ url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1", width: 200, height: 200 }],
        videos: [] // Missing
      };
      const errors = DemandGenCampaignRules.validate(state);
      expect(errors.some(e => e.code === "DEMAND_GEN_MISSING_VIDEO_ASSET")).toBe(true);
    });

    test("Demand Gen format CAROUSEL requires at least 2 valid cards", () => {
      const state = {
        ...baseValidState,
        campaignType: "DEMAND_GEN",
        adFormat: "CAROUSEL",
        headlines: ["Shop Carousel Items"],
        descriptions: ["Browse best sellers below."],
        logos: [{ url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1", width: 200, height: 200 }],
        carouselCards: [
          { image: "https://acmesoftware.com/card1.jpg", headline: "Product 1" }
          // Missing card 2
        ]
      };
      const errors = DemandGenCampaignRules.validate(state);
      expect(errors.some(e => e.code === "DEMAND_GEN_INSUFFICIENT_CAROUSEL_CARDS")).toBe(true);
    });

    test("Demand Gen supports Campaign Total Budget when dates are provided", () => {
      const state = {
        ...baseValidState,
        campaignType: "DEMAND_GEN",
        budgetType: "TOTAL",
        totalBudget: 40000,
        startDate: "2026-11-01",
        endDate: "2026-11-20",
        adFormat: "SINGLE_IMAGE",
        headlines: ["Headline 1"],
        descriptions: ["Desc 1"],
        images: [{ url: "https://acmesoftware.com/img.jpg", aspectRatio: "1.91:1", width: 1200, height: 628 }],
        logos: [{ url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1", width: 200, height: 200 }]
      };
      const commonErr = CommonCampaignRules.validate(state);
      const specificErr = DemandGenCampaignRules.validate(state);
      expect(commonErr).toHaveLength(0);
      expect(specificErr).toHaveLength(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SHOPPING CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  describe("Shopping Campaign Rules", () => {
    test("valid Shopping configuration passes", () => {
      const state = {
        ...baseValidState,
        campaignType: "SHOPPING",
        merchantCenterId: "5840531233",
        salesCountry: "IN",
        website: "https://acmesoftware.com/store"
      };
      const errors = ShoppingCampaignRules.validate(state);
      expect(errors).toHaveLength(0);
    });

    test("Shopping with Campaign Total Budget is valid when strategy and dates are provided", () => {
      const state = {
        ...baseValidState,
        campaignType: "SHOPPING",
        budgetType: "TOTAL",
        totalBudget: 45000,
        startDate: "2026-11-01",
        endDate: "2026-11-30",
        biddingStrategy: "MANUAL_CPC",
        merchantCenterId: "5840531233",
        salesCountry: "IN",
        website: "https://acmesoftware.com/store"
      };
      const commonErrors = CommonCampaignRules.validate(state);
      const shoppingErrors = ShoppingCampaignRules.validate(state);
      expect(commonErrors).toHaveLength(0);
      expect(shoppingErrors).toHaveLength(0);
    });

    test("blocks Shopping with Campaign Total Budget when bidding strategy is incompatible", () => {
      const state = {
        ...baseValidState,
        campaignType: "SHOPPING",
        budgetType: "TOTAL",
        totalBudget: 45000,
        startDate: "2026-11-01",
        endDate: "2026-11-30",
        biddingStrategy: "TARGET_ROAS",
        merchantCenterId: "5840531233",
        salesCountry: "IN",
        website: "https://acmesoftware.com/store"
      };
      const errors = CommonCampaignRules.validate(state);
      expect(errors.some(e => e.code === "BIDDING_STRATEGY_INCOMPATIBLE_WITH_TOTAL_BUDGET")).toBe(true);
    });

    test("blocks Shopping if Merchant Center ID is missing or non-numeric", () => {
      const state = {
        ...baseValidState,
        campaignType: "SHOPPING",
        merchantCenterId: "not-a-number",
        salesCountry: "IN",
        website: "https://acmesoftware.com/store"
      };
      const errors = ShoppingCampaignRules.validate(state);
      expect(errors.some(e => e.code === "SHOPPING_INVALID_MERCHANT_CENTER_ID")).toBe(true);
    });

    test("blocks Shopping if sales country is missing", () => {
      const state = {
        ...baseValidState,
        campaignType: "SHOPPING",
        merchantCenterId: "5840531233",
        salesCountry: "",
        feedLabel: "",
        website: "https://acmesoftware.com/store"
      };
      const errors = ShoppingCampaignRules.validate(state);
      expect(errors.some(e => e.code === "SHOPPING_MISSING_SALES_COUNTRY")).toBe(true);
    });

    test("blocks Shopping with example.com URL", () => {
      const state = {
        ...baseValidState,
        campaignType: "SHOPPING",
        merchantCenterId: "5840531233",
        salesCountry: "IN",
        website: "https://example.com/store"
      };
      const errors = ShoppingCampaignRules.validate(state);
      expect(errors.some(e => e.code === "SHOPPING_FORBIDDEN_EXAMPLE_URL")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // APP CAMPAIGNS
  // ───────────────────────────────────────────────────────────────────────────
  describe("App Campaign Rules", () => {
    test("valid Android App campaign passes", () => {
      const state = {
        ...baseValidState,
        campaignType: "APP",
        platform: "ANDROID",
        appId: "com.acmesoftware.app",
        targetCpa: 50,
        headlines: ["Install App Today"],
        descriptions: ["Get quick access to your business analytics on mobile."]
      };
      const errors = AppCampaignRules.validate(state);
      expect(errors).toHaveLength(0);
    });

    test("rejects invalid platform without silent defaulting to ANDROID", () => {
      const state = {
        ...baseValidState,
        campaignType: "APP",
        platform: "WINDOWS_PHONE",
        appId: "com.acmesoftware.app",
        targetCpa: 50,
        headlines: ["Install App"],
        descriptions: ["Desc"]
      };
      const errors = AppCampaignRules.validate(state);
      expect(errors.some(e => e.code === "APP_INVALID_PLATFORM")).toBe(true);
    });

    test("validates Android package dot notation", () => {
      const state = {
        ...baseValidState,
        campaignType: "APP",
        platform: "ANDROID",
        appId: "invalidpackagename",
        targetCpa: 50,
        headlines: ["Install App"],
        descriptions: ["Desc"]
      };
      const errors = AppCampaignRules.validate(state);
      expect(errors.some(e => e.code === "APP_INVALID_ANDROID_PACKAGE")).toBe(true);
    });

    test("blocks App when target CPA is missing or 0", () => {
      const state = {
        ...baseValidState,
        campaignType: "APP",
        platform: "ANDROID",
        appId: "com.acmesoftware.app",
        targetCpa: 0,
        headlines: ["Install App"],
        descriptions: ["Desc"]
      };
      const errors = AppCampaignRules.validate(state);
      expect(errors.some(e => e.code === "APP_MISSING_TARGET_CPA")).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // VIDEO NORMALIZATION & ISOLATION
  // ───────────────────────────────────────────────────────────────────────────
  describe("VIDEO Intent Mapping to DEMAND_GEN", () => {
    test("GoogleAdsCampaignValidator blocks direct VIDEO campaign mutation", () => {
      const state = {
        ...baseValidState,
        campaignType: "VIDEO"
      };
      const result = GoogleAdsCampaignValidator.validate(state);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === "DIRECT_VIDEO_CAMPAIGN_UNSUPPORTED")).toBe(true);
    });

    test("CampaignPlanMapper normalizes VIDEO intent to DEMAND_GEN with VIDEO adFormat", () => {
      const state = {
        ...baseValidState,
        campaignType: "VIDEO",
        videos: [{ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", videoId: "dQw4w9WgXcQ" }],
        headlines: ["Headline 1"],
        descriptions: ["Description 1"],
        logos: [{ url: "https://acmesoftware.com/logo.jpg", aspectRatio: "1:1" }]
      };
      const plan = CampaignPlanMapper.fromState("org-1", "1234567890", state);
      expect(plan.campaignType).toBe("DEMAND_GEN");
      expect((plan as any).coreConfig.adFormat).toBe("VIDEO");
    });
  });
});
