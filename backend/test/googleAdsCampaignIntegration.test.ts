import axios from "axios";
import { SalesSearchService } from "../src/services/googleAds/sales/SalesSearchService";
import { SalesPerformanceMaxService } from "../src/services/googleAds/sales/SalesPerformanceMaxService";
import { SalesDemandGenService } from "../src/services/googleAds/sales/SalesDemandGenService";
import { LeadsDemandGenService } from "../src/services/googleAds/leads/LeadsDemandGenService";
import { SalesShoppingService } from "../src/services/googleAds/sales/SalesShoppingService";
import { SalesDisplayService } from "../src/services/googleAds/sales/SalesDisplayService";
import { AppPromotionAppService } from "../src/services/googleAds/appPromotion/AppPromotionAppService";
import { GoogleAdsBaseService } from "../src/services/googleAds/shared/GoogleAdsBaseService";
import { GoogleAdsCampaignValidator } from "../src/services/googleAds/shared/GoogleAdsCampaignValidator";
import { CampaignPlanMapper } from "../src/services/googleAds/shared/CampaignPlan";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Google Ads Campaign Creation End-to-End Resource Payload Integration Tests", () => {
  const orgId = "org-test-456";
  const customerId = "1234567890";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getAdsHeaders / DB token retrieval by spying on GoogleAdsBaseService directly
    jest.spyOn(GoogleAdsBaseService as any, "getAdsHeaders").mockResolvedValue({
      headers: { Authorization: "Bearer test-token", "developer-token": "dev-token" }
    });
    jest.spyOn(GoogleAdsBaseService as any, "saveCampaignToDatabase").mockResolvedValue({
      id: "local-camp-1",
      amountMicros: BigInt(1500000000),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });
    jest.spyOn(GoogleAdsBaseService as any, "mutateCampaignGeoAndLanguageCriteria").mockResolvedValue(undefined);
    jest.spyOn(GoogleAdsBaseService as any, "mutateCampaignAdScheduleCriteria").mockResolvedValue(undefined);
    jest.spyOn(GoogleAdsBaseService as any, "uploadImageAsset").mockImplementation(async (_orgId, _cid, name) => {
      return `customers/1234567890/assets/mock_img_${name}`;
    });

    mockedAxios.get.mockResolvedValue({
      data: Buffer.from("fake-image-bytes-longer-than-fifty-characters-for-testing-purposes-only")
    });

    // Mock default axios post response for all API calls
    mockedAxios.post.mockImplementation((url: string, data: any) => {
      if (url.includes("campaignBudgets:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/campaignBudgets/mock-budget-999" }] }
        });
      }
      if (url.includes("campaigns:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/campaigns/mock-camp-888" }] }
        });
      }
      if (url.includes("adGroups:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/adGroups/mock-ag-777" }] }
        });
      }
      if (url.includes("adGroupAds:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/adGroupAds/mock-aga-666" }] }
        });
      }
      if (url.includes("assets:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/assets/mock-asset-555" }] }
        });
      }
      if (url.includes("assetGroupCompositeOperations:mutate") || url.includes("assetGroups:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/assetGroups/mock-ag-444" }] }
        });
      }
      if (url.includes("adGroupCriteria:mutate") || url.includes("campaignConversionGoals:mutate")) {
        return Promise.resolve({
          data: { results: [{ resourceName: "customers/1234567890/criteria/mock-crit-333" }] }
        });
      }
      if (url.includes("googleAds:mutate")) {
        return Promise.resolve({
          data: {
            mutateOperationResponses: [
              { assetGroupResult: { resourceName: "customers/1234567890/assetGroups/mock-ag-444" } }
            ]
          }
        });
      }
      return Promise.resolve({ data: { results: [{ resourceName: "customers/1234567890/generic/mock-111" }] } });
    });
  });

  // 1. Search DAILY -> amount_micros only
  test("1. Search DAILY -> budget payload contains amount_micros only, no total_amount_micros", async () => {
    await SalesSearchService.createCampaign(orgId, customerId, {
      campaignName: "Search Daily Test",
      budgetType: "DAILY",
      dailyBudget: 1500,
      websiteVisitsUrl: "https://acmesoftware.com/landing",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      keywords: ["crm software"],
      headlines: ["Top CRM System", "Boost Your Sales", "Automate Growth"],
      descriptions: ["Manage all your customer relationships.", "Grow revenue with our tools."],
      networkDisplay: false
    });

    const budgetCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaignBudgets:mutate"));
    expect(budgetCall).toBeDefined();
    const budgetOp = budgetCall![1].operations[0].create;
    expect(budgetOp.amountMicros).toBe("1500000000");
    expect(budgetOp.totalAmountMicros).toBeUndefined();
    expect(budgetOp.explicitlyShared).toBe(false);
  });

  // 2. Search TOTAL -> total_amount_micros + CUSTOM_PERIOD only
  test("2. Search TOTAL -> budget payload contains total_amount_micros and CUSTOM_PERIOD only", async () => {
    await SalesSearchService.createCampaign(orgId, customerId, {
      campaignName: "Search Total Test",
      budgetType: "TOTAL",
      totalBudget: 45000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      websiteVisitsUrl: "https://acmesoftware.com/landing",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      keywords: ["crm software"],
      headlines: ["Top CRM System", "Boost Your Sales", "Automate Growth"],
      descriptions: ["Manage all your customer relationships.", "Grow revenue with our tools."],
      networkDisplay: false
    });

    const budgetCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaignBudgets:mutate"));
    expect(budgetCall).toBeDefined();
    const budgetOp = budgetCall![1].operations[0].create;
    expect(budgetOp.totalAmountMicros).toBe("45000000000");
    expect(budgetOp.period).toBe("CUSTOM_PERIOD");
    expect(budgetOp.amountMicros).toBeUndefined();
    expect(budgetOp.explicitlyShared).toBe(false);
  });

  // 3. PMax DAILY -> amount_micros only
  test("3. PMax DAILY -> budget payload contains amount_micros only", async () => {
    await SalesPerformanceMaxService.createCampaign(orgId, customerId, {
      campaignName: "PMax Daily Test",
      businessName: "Acme Corp",
      finalUrl: "https://acmesoftware.com/landing",
      budgetType: "DAILY",
      dailyBudget: 2000,
      biddingFocus: "Maximize conversions",
      headlines: ["Top CRM 1", "Top CRM 2", "Top CRM 3"],
      longHeadlines: ["Complete Customer Platform for Teams"],
      descriptions: ["Description 1 goes here.", "Description 2 goes here."],
      images: [
        { url: "https://acmesoftware.com/land.jpg", fieldType: "MARKETING_IMAGE" },
        { url: "https://acmesoftware.com/sq.jpg", fieldType: "SQUARE_MARKETING_IMAGE" }
      ],
      logos: [{ url: "https://acmesoftware.com/logo.jpg", fieldType: "LOGO" }]
    });

    const budgetCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaignBudgets:mutate"));
    expect(budgetCall).toBeDefined();
    const budgetOp = budgetCall![1].operations[0].create;
    expect(budgetOp.amountMicros).toBe("2000000000");
    expect(budgetOp.totalAmountMicros).toBeUndefined();
    expect(budgetOp.explicitlyShared).toBe(false);
  });

  // 4. PMax TOTAL -> total_amount_micros + CUSTOM_PERIOD only
  test("4. PMax TOTAL -> budget payload contains total_amount_micros + CUSTOM_PERIOD only", async () => {
    await SalesPerformanceMaxService.createCampaign(orgId, customerId, {
      campaignName: "PMax Total Test",
      businessName: "Acme Corp",
      finalUrl: "https://acmesoftware.com/landing",
      budgetType: "TOTAL",
      totalBudget: 60000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      biddingFocus: "Maximize conversions",
      headlines: ["Top CRM 1", "Top CRM 2", "Top CRM 3"],
      longHeadlines: ["Complete Customer Platform for Teams"],
      descriptions: ["Description 1 goes here.", "Description 2 goes here."],
      images: [
        { url: "https://acmesoftware.com/land.jpg", fieldType: "MARKETING_IMAGE" },
        { url: "https://acmesoftware.com/sq.jpg", fieldType: "SQUARE_MARKETING_IMAGE" }
      ],
      logos: [{ url: "https://acmesoftware.com/logo.jpg", fieldType: "LOGO" }]
    });

    const budgetCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaignBudgets:mutate"));
    expect(budgetCall).toBeDefined();
    const budgetOp = budgetCall![1].operations[0].create;
    expect(budgetOp.totalAmountMicros).toBe("60000000000");
    expect(budgetOp.period).toBe("CUSTOM_PERIOD");
    expect(budgetOp.amountMicros).toBeUndefined();
  });

  // 5. Demand Gen TOTAL -> total_amount_micros + CUSTOM_PERIOD only
  test("5. Demand Gen TOTAL -> budget payload contains total_amount_micros + CUSTOM_PERIOD only", async () => {
    await SalesDemandGenService.createCampaign(orgId, customerId, {
      campaignName: "Demand Gen Total Test",
      businessName: "Acme Corp",
      finalUrl: "https://acmesoftware.com/landing",
      budgetType: "TOTAL",
      totalBudget: 30000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      headlines: ["Discover Acme"],
      descriptions: ["Explore modern solutions for your teams."],
      images: ["customers/1234567890/assets/land_1"],
      logos: ["customers/1234567890/assets/logo_1"]
    });

    const budgetCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaignBudgets:mutate"));
    expect(budgetCall).toBeDefined();
    const budgetOp = budgetCall![1].operations[0].create;
    expect(budgetOp.totalAmountMicros).toBe("30000000000");
    expect(budgetOp.period).toBe("CUSTOM_PERIOD");
    expect(budgetOp.amountMicros).toBeUndefined();
  });

  // 6. Shopping TOTAL -> total_amount_micros + CUSTOM_PERIOD only
  test("6. Shopping TOTAL -> budget payload contains total_amount_micros + CUSTOM_PERIOD only", async () => {
    await SalesShoppingService.createCampaign(orgId, customerId, {
      campaignName: "Shopping Total Test",
      merchantCenterId: "12345678",
      salesCountry: "IN",
      feedLabel: "IN",
      budgetType: "TOTAL",
      totalBudget: 25000,
      dailyBudget: 1000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      biddingStrategy: "MANUAL_CPC"
    });

    const budgetCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaignBudgets:mutate"));
    expect(budgetCall).toBeDefined();
    const budgetOp = budgetCall![1].operations[0].create;
    expect(budgetOp.totalAmountMicros).toBe("25000000000");
    expect(budgetOp.period).toBe("CUSTOM_PERIOD");
    expect(budgetOp.amountMicros).toBeUndefined();
  });

  // 7. Display TOTAL -> blocked by validation
  test("7. Display TOTAL -> blocked from reaching creation service", () => {
    const state = {
      customerId,
      campaignName: "Display Total Attempt",
      campaignType: "DISPLAY",
      budgetType: "TOTAL",
      totalBudget: 10000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      website: "https://acmesoftware.com/landing",
      businessName: "Acme",
      dailyBudget: 500,
      headlines: ["Headline"],
      descriptions: ["Description"],
      images: [{ url: "https://acme.com/img.jpg", aspectRatio: "1.91:1" }],
      logos: [{ url: "https://acme.com/logo.jpg", aspectRatio: "1:1" }]
    };
    const valResult = GoogleAdsCampaignValidator.validate(state);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.some(e => e.code === "TOTAL_BUDGET_UNSUPPORTED_FOR_CAMPAIGN_TYPE")).toBe(true);
  });

  // 8. App TOTAL -> blocked by validation
  test("8. App TOTAL -> blocked from reaching creation service", () => {
    const state = {
      customerId,
      campaignName: "App Total Attempt",
      campaignType: "APP",
      budgetType: "TOTAL",
      totalBudget: 20000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      platform: "ANDROID",
      appId: "com.acme.app",
      targetCpa: 50,
      headlines: ["Install Acme App"],
      descriptions: ["Get it today on Play Store"]
    };
    const valResult = GoogleAdsCampaignValidator.validate(state);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.some(e => e.code === "TOTAL_BUDGET_UNSUPPORTED_FOR_CAMPAIGN_TYPE")).toBe(true);
  });

  // 9. Search incompatible TOTAL bidding -> blocked
  test("9. Search incompatible TOTAL bidding (e.g. TARGET_IMPRESSION_SHARE) -> blocked", () => {
    const state = {
      customerId,
      campaignName: "Search Incompatible Total",
      campaignType: "SEARCH",
      budgetType: "TOTAL",
      totalBudget: 15000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      website: "https://acmesoftware.com/landing",
      biddingStrategy: "TARGET_IMPRESSION_SHARE",
      keywords: ["software"],
      headlines: ["H1", "H2", "H3"],
      descriptions: ["D1", "D2"]
    };
    const valResult = GoogleAdsCampaignValidator.validate(state);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.some(e => e.code === "BIDDING_STRATEGY_INCOMPATIBLE_WITH_TOTAL_BUDGET")).toBe(true);
  });

  // 10. Shopping incompatible TOTAL bidding -> blocked
  test("10. Shopping incompatible TOTAL bidding (e.g. TARGET_ROAS) -> blocked", () => {
    const state = {
      customerId,
      campaignName: "Shopping Incompatible Total",
      campaignType: "SHOPPING",
      budgetType: "TOTAL",
      totalBudget: 15000,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      merchantCenterId: "12345678",
      salesCountry: "IN",
      biddingStrategy: "TARGET_ROAS",
      targetRoas: 200
    };
    const valResult = GoogleAdsCampaignValidator.validate(state);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.some(e => e.code === "BIDDING_STRATEGY_INCOMPATIBLE_WITH_TOTAL_BUDGET")).toBe(true);
  });

  // 11. VIDEO intent -> Demand Gen VIDEO
  test("11. VIDEO intent -> normalizes to DEMAND_GEN with VIDEO adFormat", () => {
    const state = {
      customerId,
      campaignName: "Video Intent Test",
      campaignType: "VIDEO",
      website: "https://acmesoftware.com/landing",
      businessName: "Acme",
      videos: [{ url: "https://www.youtube.com/watch?v=12345", videoId: "12345" }],
      headlines: ["Headline 1"],
      descriptions: ["Description 1"],
      logos: [{ url: "https://acme.com/logo.jpg", aspectRatio: "1:1" }]
    };
    const plan = CampaignPlanMapper.fromState(orgId, customerId, state);
    expect(plan.campaignType).toBe("DEMAND_GEN");
    expect((plan as any).coreConfig.adFormat).toBe("VIDEO");
  });

  // 12. Direct VIDEO creation -> blocked
  test("12. Direct VIDEO creation -> blocked by centralized validator", () => {
    const state = {
      customerId,
      campaignName: "Direct Video Campaign",
      campaignType: "VIDEO",
      website: "https://acmesoftware.com/landing"
    };
    const valResult = GoogleAdsCampaignValidator.validate(state);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.some(e => e.code === "DIRECT_VIDEO_CAMPAIGN_UNSUPPORTED")).toBe(true);
  });

  // 13. Search does not silently enable Display Network
  test("13. Search does not silently enable Display Network (networkSettings.targetContentNetwork = false)", async () => {
    await SalesSearchService.createCampaign(orgId, customerId, {
      campaignName: "Search Display Network Check",
      budgetType: "DAILY",
      dailyBudget: 1000,
      websiteVisitsUrl: "https://acmesoftware.com/landing",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      keywords: ["crm software"],
      headlines: ["Top CRM System", "Boost Your Sales", "Automate Growth"],
      descriptions: ["Manage all your customer relationships.", "Grow revenue with our tools."]
      // networkDisplay not passed, must default to false!
    });

    const campaignCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaigns:mutate"));
    expect(campaignCall).toBeDefined();
    const campOp = campaignCall![1].operations[0].create;
    expect(campOp.networkSettings.targetContentNetwork).toBe(false);
    expect(campOp.networkSettings.targetGoogleSearch).toBe(true);
  });

  // 14. PMax does not inject fake assets
  test("14. PMax does not inject fake assets when explicit assets are provided", async () => {
    await SalesPerformanceMaxService.createCampaign(orgId, customerId, {
      campaignName: "PMax Real Assets Check",
      businessName: "Acme Corp",
      finalUrl: "https://acmesoftware.com/landing",
      budgetType: "DAILY",
      dailyBudget: 1500,
      biddingFocus: "Maximize conversions",
      headlines: ["H1", "H2", "H3"],
      longHeadlines: ["Long Headline 1"],
      descriptions: ["Description 1", "Description 2"],
      images: [
        { url: "https://acmesoftware.com/land.jpg", fieldType: "MARKETING_IMAGE" },
        { url: "https://acmesoftware.com/sq.jpg", fieldType: "SQUARE_MARKETING_IMAGE" }
      ],
      logos: [{ url: "https://acmesoftware.com/logo.jpg", fieldType: "LOGO" }]
    });

    // Check asset upload calls: none should use default fallback ImageKit URL
    const uploadSpy = jest.spyOn(GoogleAdsBaseService as any, "uploadImageAsset");
    expect(uploadSpy).toHaveBeenCalled();
    const calls = uploadSpy.mock.calls;
    for (const call of calls) {
      expect(call[3]).not.toContain("gads_dg_image_1788441362828");
      expect(call[3]).not.toContain("gads_dg_logo_1788441370183");
    }
  });

  // 15. Shopping does not inject example.com
  test("15. Shopping does not inject example.com and passes Merchant Center configuration", async () => {
    await SalesShoppingService.createCampaign(orgId, customerId, {
      campaignName: "Shopping MC Check",
      merchantCenterId: "987654321",
      salesCountry: "IN",
      feedLabel: "IN",
      budgetType: "DAILY",
      dailyBudget: 1000,
      biddingStrategy: "MANUAL_CPC"
    });

    const campaignCall = mockedAxios.post.mock.calls.find(c => c[0].includes("campaigns:mutate"));
    expect(campaignCall).toBeDefined();
    const campOp = campaignCall![1].operations[0].create;
    expect(campOp.advertisingChannelType).toBe("SHOPPING");
    expect(campOp.shoppingSetting.merchantId).toBe("987654321");
    expect(campOp.shoppingSetting.feedLabel).toBe("IN");
    expect(JSON.stringify(campOp)).not.toContain("example.com");
  });
});
