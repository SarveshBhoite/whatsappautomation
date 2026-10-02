import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import axios from "axios";
import { SalesSearchService } from "../src/services/googleAds/sales/SalesSearchService";
import { LeadsSearchService } from "../src/services/googleAds/leads/LeadsSearchService";
import { SalesPerformanceMaxService } from "../src/services/googleAds/sales/SalesPerformanceMaxService";
import { LeadsPerformanceMaxService } from "../src/services/googleAds/leads/LeadsPerformanceMaxService";
import { StoreVisitsPerformanceMaxService } from "../src/services/googleAds/storeVisits/StoreVisitsPerformanceMaxService";
import { SalesDemandGenService } from "../src/services/googleAds/sales/SalesDemandGenService";
import { SalesDisplayService } from "../src/services/googleAds/sales/SalesDisplayService";
import { SalesShoppingService } from "../src/services/googleAds/sales/SalesShoppingService";
import { SalesVideoService } from "../src/services/googleAds/sales/SalesVideoService";
import { YoutubeVideoService } from "../src/services/googleAds/youtubeReach/YoutubeVideoService";
import { AppPromotionAppService } from "../src/services/googleAds/appPromotion/AppPromotionAppService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("End-to-End Service Level Conversion Goal Mutation Verification", () => {
  const orgId = "org-test-verify";
  const customerId = "123-456-7890";
  const cid = "1234567890";

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock headers resolution
    jest.spyOn<any, any>(SalesSearchService as any, "getAdsHeaders").mockResolvedValue({
      headers: { Authorization: "Bearer test-token", "developer-token": "dev-token" }
    });
    jest.spyOn<any, any>(SalesSearchService as any, "createBudget").mockResolvedValue(
      `customers/${cid}/campaignBudgets/bud-1`
    );
    jest.spyOn<any, any>(SalesSearchService as any, "saveCampaignToDatabase").mockResolvedValue({
      id: "local-camp-1",
      amountMicros: BigInt(1000000),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });
  });

  it("SalesSearchService: dispatches campaignConversionGoals:mutate with PURCHASE category", async () => {
    mockedAxios.post.mockImplementation((url: string, payload: any) => {
      if (url.includes("campaigns:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/campaigns/camp-search-1` }] } });
      }
      if (url.includes("adGroups:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/adGroups/ag-1` }] } });
      }
      if (url.includes("adGroupCriteria:mutate")) {
        return Promise.resolve({ data: { results: [] } });
      }
      if (url.includes("campaignConversionGoals:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/campaignConversionGoals/camp-search-1~PURCHASE~WEBSITE` }] } });
      }
      return Promise.resolve({ data: { results: [] } });
    });

    await SalesSearchService.createCampaign(orgId, customerId, {
      campaignName: "Test Sales Search",
      website: "https://example.com",
      dailyBudget: 100,
      headlines: ["Headline 1", "Headline 2", "Headline 3"],
      descriptions: ["Description 1", "Description 2"],
      keywords: ["buy shoes online"],
      conversionGoals: ["purchase"]
    });

    const conversionCall = mockedAxios.post.mock.calls.find(call =>
      String(call[0]).includes("campaignConversionGoals:mutate")
    );

    expect(conversionCall).toBeDefined();
    expect(conversionCall![0]).toBe(`https://googleads.googleapis.com/v24/customers/${cid}/campaignConversionGoals:mutate`);
    expect(conversionCall![1]).toEqual({
      operations: [
        {
          update: {
            resourceName: `customers/${cid}/campaignConversionGoals/camp-search-1~PURCHASE~WEBSITE`,
            biddable: true
          },
          updateMask: "biddable"
        }
      ]
    });
  });

  it("LeadsSearchService: dispatches campaignConversionGoals:mutate with SUBMIT_LEAD_FORM category", async () => {
    jest.spyOn<any, any>(LeadsSearchService as any, "getAdsHeaders").mockResolvedValue({
      headers: { Authorization: "Bearer test-token", "developer-token": "dev-token" }
    });
    jest.spyOn<any, any>(LeadsSearchService as any, "createBudget").mockResolvedValue(`customers/${cid}/campaignBudgets/bud-1`);
    jest.spyOn<any, any>(LeadsSearchService as any, "saveCampaignToDatabase").mockResolvedValue({
      id: "local-camp-1",
      amountMicros: BigInt(1000000),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes("campaigns:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/campaigns/camp-leads-1` }] } });
      }
      if (url.includes("adGroups:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/adGroups/ag-1` }] } });
      }
      if (url.includes("campaignConversionGoals:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/campaignConversionGoals/camp-leads-1~SUBMIT_LEAD_FORM~WEBSITE` }] } });
      }
      return Promise.resolve({ data: { results: [] } });
    });

    await LeadsSearchService.createCampaign(orgId, customerId, {
      campaignName: "Test Leads Search",
      website: "https://example.com",
      dailyBudget: 100,
      headlines: ["Headline 1", "Headline 2", "Headline 3"],
      descriptions: ["Description 1", "Description 2"],
      conversionGoals: ["submit_lead_form"]
    });

    const conversionCall = mockedAxios.post.mock.calls.find(call =>
      String(call[0]).includes("campaignConversionGoals:mutate")
    );

    expect(conversionCall).toBeDefined();
    expect(conversionCall![1]).toEqual({
      operations: [
        {
          update: {
            resourceName: `customers/${cid}/campaignConversionGoals/camp-leads-1~SUBMIT_LEAD_FORM~WEBSITE`,
            biddable: true
          },
          updateMask: "biddable"
        }
      ]
    });
  });

  it("StoreVisitsPerformanceMaxService: dispatches campaignConversionGoals:mutate with GET_DIRECTIONS and STORE_VISIT", async () => {
    jest.spyOn<any, any>(StoreVisitsPerformanceMaxService as any, "getAdsHeaders").mockResolvedValue({
      headers: { Authorization: "Bearer test-token", "developer-token": "dev-token" }
    });
    jest.spyOn<any, any>(StoreVisitsPerformanceMaxService as any, "createBudget").mockResolvedValue(`customers/${cid}/campaignBudgets/bud-1`);
    jest.spyOn<any, any>(StoreVisitsPerformanceMaxService as any, "uploadImageAsset").mockResolvedValue(`customers/${cid}/assets/img-1`);
    jest.spyOn<any, any>(StoreVisitsPerformanceMaxService as any, "mutateCampaignGeoAndLanguageCriteria").mockResolvedValue([]);
    jest.spyOn<any, any>(StoreVisitsPerformanceMaxService as any, "saveCampaignToDatabase").mockResolvedValue({
      id: "local-camp-1",
      amountMicros: BigInt(1000000),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes("campaigns:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/campaigns/camp-store-1` }] } });
      }
      if (url.includes("assets:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/assets/ast-1` }] } });
      }
      if (url.includes("googleAds:mutate")) {
        return Promise.resolve({ data: { mutateOperationResponses: [{ assetGroupResult: { resourceName: `customers/${cid}/assetGroups/ag-1` } }] } });
      }
      if (url.includes("campaignConversionGoals:mutate")) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: { results: [] } });
    });

    await StoreVisitsPerformanceMaxService.createCampaign(orgId, customerId, {
      campaignName: "Test Store Visits PMax",
      businessName: "Store Test",
      finalUrl: "https://example.com",
      dailyBudget: 100,
      headlines: ["Store H1", "Store H2", "Store H3"],
      longHeadlines: ["Store LH 1"],
      descriptions: ["Store D1", "Store D2"],
      images: ["https://example.com/img1.jpg"],
      logos: ["https://example.com/logo.jpg"],
      conversionGoals: ["get_directions", "store_visits"]
    });

    const conversionCall = mockedAxios.post.mock.calls.find(call =>
      String(call[0]).includes("campaignConversionGoals:mutate")
    );

    expect(conversionCall).toBeDefined();
    expect(conversionCall![1]).toEqual({
      operations: [
        {
          update: {
            resourceName: `customers/${cid}/campaignConversionGoals/camp-store-1~GET_DIRECTIONS~GOOGLE_HOSTED`,
            biddable: true
          },
          updateMask: "biddable"
        },
        {
          update: {
            resourceName: `customers/${cid}/campaignConversionGoals/camp-store-1~STORE_VISIT~STORE`,
            biddable: true
          },
          updateMask: "biddable"
        }
      ]
    });
  });

  it("AppPromotionAppService: sets appCampaignSetting.biddingStrategyGoalType for installs, engagement, preregistration", async () => {
    jest.spyOn<any, any>(AppPromotionAppService as any, "getAdsHeaders").mockResolvedValue({
      headers: { Authorization: "Bearer test-token", "developer-token": "dev-token" }
    });
    jest.spyOn<any, any>(AppPromotionAppService as any, "createBudget").mockResolvedValue(`customers/${cid}/campaignBudgets/bud-1`);
    jest.spyOn<any, any>(AppPromotionAppService as any, "saveCampaignToDatabase").mockResolvedValue({
      id: "local-camp-1",
      amountMicros: BigInt(1000000),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    let lastCampaignPayload: any = null;
    mockedAxios.post.mockImplementation((url: string, payload: any) => {
      if (url.includes("campaigns:mutate")) {
        lastCampaignPayload = payload;
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/campaigns/camp-app-1` }] } });
      }
      if (url.includes("adGroups:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/adGroups/ag-1` }] } });
      }
      if (url.includes("adGroupAds:mutate")) {
        return Promise.resolve({ data: { results: [{ resourceName: `customers/${cid}/adGroupAds/aga-1` }] } });
      }
      return Promise.resolve({ data: { results: [] } });
    });

    // 1. Installs
    await AppPromotionAppService.createCampaign(orgId, customerId, {
      campaignName: "Test App Installs",
      appId: "com.test.app",
      platform: "ANDROID",
      dailyBudget: 50,
      targetCpa: 5,
      headlines: ["Headline 1", "Headline 2"],
      descriptions: ["Desc 1", "Desc 2"],
      conversionGoals: ["installs"]
    });
    expect(lastCampaignPayload.operations[0].create.appCampaignSetting.biddingStrategyGoalType).toBe(
      "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST"
    );

    // 2. Engagement
    await AppPromotionAppService.createCampaign(orgId, customerId, {
      campaignName: "Test App Engagement",
      appId: "com.test.app",
      platform: "ANDROID",
      dailyBudget: 50,
      targetCpa: 5,
      headlines: ["Headline 1", "Headline 2"],
      descriptions: ["Desc 1", "Desc 2"],
      conversionGoals: ["engagement"]
    });
    expect(lastCampaignPayload.operations[0].create.appCampaignSetting.biddingStrategyGoalType).toBe(
      "OPTIMIZE_IN_APP_CONVERSIONS_TARGET_CONVERSION_COST"
    );

    // 3. Pre-registration
    await AppPromotionAppService.createCampaign(orgId, customerId, {
      campaignName: "Test App Pre-registration",
      appId: "com.test.app",
      platform: "ANDROID",
      dailyBudget: 50,
      targetCpa: 5,
      headlines: ["Headline 1", "Headline 2"],
      descriptions: ["Desc 1", "Desc 2"],
      conversionGoals: ["preregistration"]
    });
    expect(lastCampaignPayload.operations[0].create.appCampaignSetting.biddingStrategyGoalType).toBe(
      "OPTIMIZE_PRE_REGISTRATION_CONVERSION_VOLUME"
    );
  });

  it("YoutubeVideoService: accurately reports CRM/YouTube asset planning storage rather than fake Google Ads mutation", async () => {
    const { YouTubeService } = require("../src/services/youtubeService");
    jest.spyOn<any, any>(YouTubeService, "getOrganizationConnectionStatus").mockResolvedValue({ isConnected: true });
    jest.spyOn<any, any>(YoutubeVideoService as any, "uploadYouTubeVideoAsset").mockResolvedValue(`customers/${cid}/assets/yt-1`);
    const saveSpy = jest.spyOn<any, any>(YoutubeVideoService as any, "saveCampaignToDatabase").mockResolvedValue({
      id: "local-camp-1",
      amountMicros: BigInt(1000000),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    const result = await YoutubeVideoService.createCampaign(orgId, customerId, {
      campaignName: "YouTube Views Campaign",
      dailyBudget: 100,
      videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
      conversionGoals: ["views", "engagements"]
    });

    expect(result.apiResult.isCrmPlanningOnly).toBe(true);
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        geoTargets: expect.objectContaining({
          conversionGoals: ["views", "engagements"]
        })
      })
    );
  });
});
