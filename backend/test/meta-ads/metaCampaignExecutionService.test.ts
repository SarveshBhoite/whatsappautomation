import { MetaCampaignExecutionService, ExecutionResult } from "../../src/services/meta-ads/metaCampaignExecutionService";
import { MetaAdsCapabilityService } from "../../src/services/meta-ads/metaAdsCapabilityService";
import axios from "axios";
import prisma from "../../src/utils/prisma";

jest.mock("axios");
jest.mock("../../src/utils/prisma", () => ({
  metaAdConfig: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  metaAdCampaign: {
    create: jest.fn(),
  },
  metaAdSet: {
    create: jest.fn(),
  },
  metaAd: {
    create: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Meta Campaign Execution Service - Production Quality Suite", () => {
  const mockOrgId = "test-org-123";
  const mockConfig = {
    organizationId: mockOrgId,
    accessToken: "EAAB_TEST_TOKEN",
    adAccountId: "act_1454270479625110",
    pageId: "1062234726963242",
  };

  const baseDraft: any = {
    adAccountId: "act_1454270479625110",
    pageId: "1062234726963242",
    campaign: {
      name: "Urban Threads Launch",
      objective: "OUTCOME_LEADS",
      dailyBudget: 500,
      cboEnabled: true,
    },
    targeting: {
      cities: ["Pune"],
      radiusKm: 30,
      ageMin: 18,
      ageMax: 65,
      gender: "ALL",
      interests: ["Streetwear"],
    },
    destination: {
      type: "WHATSAPP",
      whatsappPhoneNumber: "+919876543210",
    },
    creative: {
      headline: "Urban Threads Exclusive",
      primaryText: "Get 20% off high quality urban wear.",
      callToAction: "WHATSAPP_MESSAGE",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.metaAdConfig.findUnique as jest.Mock).mockResolvedValue(mockConfig);
    (prisma.metaAdCampaign.create as jest.Mock).mockImplementation((args) =>
      Promise.resolve({ id: "db_camp_1", ...args.data })
    );
    (prisma.metaAdSet.create as jest.Mock).mockImplementation((args) =>
      Promise.resolve({ id: "db_adset_1", ...args.data })
    );
    (prisma.metaAd.create as jest.Mock).mockImplementation((args) =>
      Promise.resolve({ id: "db_ad_1", ...args.data })
    );
  });

  // Test 1: Full success flow
  it("Test 1: Full success flow creates Campaign -> AdSet -> Creative -> Ad with verified IDs", async () => {
    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes("/campaigns")) return Promise.resolve({ data: { id: "meta_camp_123" } });
      if (url.includes("/adsets")) return Promise.resolve({ data: { id: "meta_adset_456" } });
      if (url.includes("/adcreatives")) return Promise.resolve({ data: { id: "meta_creative_789" } });
      if (url.includes("/ads")) return Promise.resolve({ data: { id: "meta_ad_999" } });
      return Promise.reject(new Error("Unknown endpoint"));
    });

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("meta_camp_123")) return Promise.resolve({ data: { id: "meta_camp_123" } });
      if (url.includes("meta_adset_456")) return Promise.resolve({ data: { id: "meta_adset_456" } });
      if (url.includes("meta_creative_789")) return Promise.resolve({ data: { id: "meta_creative_789" } });
      if (url.includes("meta_ad_999")) return Promise.resolve({ data: { id: "meta_ad_999" } });
      return Promise.reject(new Error("Unknown verification"));
    });

    const result = await MetaCampaignExecutionService.publishCampaign(
      mockOrgId,
      baseDraft,
      "test_exec_full_success"
    );

    expect(result.success).toBe(true);
    expect(result.deploymentStatus).toBe("FULL_SUCCESS");
    expect(result.campaign.status).toBe("CREATED");
    expect(result.campaign.id).toBe("meta_camp_123");
    expect(result.adSet.status).toBe("CREATED");
    expect(result.adSet.id).toBe("meta_adset_456");
    expect(result.creative.status).toBe("CREATED");
    expect(result.creative.id).toBe("meta_creative_789");
    expect(result.ad.status).toBe("CREATED");
    expect(result.ad.id).toBe("meta_ad_999");
    expect(result.stepFailed).toBeNull();
  });

  // Test 2: Final Ad creation fails with Non-discrimination error (2859002 / code 3)
  it("Test 2: Ad creation fails with Non-discrimination error (2859002) -> returns PARTIAL_CREATION and never reports success", async () => {
    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes("/campaigns")) return Promise.resolve({ data: { id: "meta_camp_123" } });
      if (url.includes("/adsets")) return Promise.resolve({ data: { id: "meta_adset_456" } });
      if (url.includes("/adcreatives")) return Promise.resolve({ data: { id: "meta_creative_789" } });
      if (url.includes("/ads")) {
        const error: any = new Error("Certification required");
        error.response = {
          data: {
            error: {
              code: 3,
              error_subcode: 2859002,
              message: "You must certify compliance with our Non-discrimination Policy before running ads.",
              error_user_title: "Certification required",
              error_user_msg: "You must certify compliance with our Non-discrimination Policy before running ads. Visit facebook.com/certification/nondiscrimination to certify compliance.",
            },
          },
        };
        return Promise.reject(error);
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    mockedAxios.get.mockResolvedValue({ data: { id: "verified" } });

    const result = await MetaCampaignExecutionService.publishCampaign(
      mockOrgId,
      baseDraft,
      "test_exec_cert_failure"
    );

    // CRITICAL ASSERTION: Must NOT be reported as success!
    expect(result.success).toBe(false);
    expect(result.deploymentStatus).toBe("PARTIAL_CREATION");
    expect(result.status).toBe("PARTIAL_FAILURE");

    expect(result.campaign.status).toBe("CREATED");
    expect(result.campaign.id).toBe("meta_camp_123");
    expect(result.adSet.status).toBe("CREATED");
    expect(result.adSet.id).toBe("meta_adset_456");
    expect(result.creative.status).toBe("CREATED");
    expect(result.creative.id).toBe("meta_creative_789");

    // Ad MUST be marked as FAILED with null ID (no fake ID generated)
    expect(result.ad.status).toBe("FAILED");
    expect(result.ad.id).toBeNull();
    expect(result.adId).toBeNull();
    expect(result.metaAdId).toBeNull();
    expect(result.ad.errorCode).toBe(3);
    expect(result.ad.errorSubcode).toBe(2859002);
    expect(result.errorCategory).toBe("USER_ACTION_REQUIRED");
    expect(result.stepFailed).toBe("AD_OBJECT");
  });

  // Test 3: Campaign creation failure
  it("Test 3: Campaign creation failure halts flow immediately and returns FAILED", async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        data: {
          error: {
            code: 100,
            message: "Invalid daily budget parameter.",
          },
        },
      },
    });

    const result = await MetaCampaignExecutionService.publishCampaign(
      mockOrgId,
      baseDraft,
      "test_exec_camp_fail"
    );

    expect(result.success).toBe(false);
    expect(result.deploymentStatus).toBe("FAILED");
    expect(result.campaign.status).toBe("FAILED");
    expect(result.campaign.id).toBeNull();
    expect(result.adSet.status).toBe("NOT_ATTEMPTED");
    expect(result.stepFailed).toBe("CAMPAIGN");
  });

  // Test 4: Ad Set creation failure
  it("Test 4: Ad Set creation failure halts flow before creative and returns PARTIAL_CREATION", async () => {
    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes("/campaigns")) return Promise.resolve({ data: { id: "meta_camp_123" } });
      return Promise.reject({
        response: {
          data: {
            error: {
              code: 100,
              message: "Please select a promoted object for your ad set.",
            },
          },
        },
      });
    });

    mockedAxios.get.mockResolvedValue({ data: { id: "meta_camp_123" } });

    const result = await MetaCampaignExecutionService.publishCampaign(
      mockOrgId,
      baseDraft,
      "test_exec_adset_fail"
    );

    expect(result.success).toBe(false);
    expect(result.deploymentStatus).toBe("PARTIAL_CREATION");
    expect(result.campaign.status).toBe("CREATED");
    expect(result.campaign.id).toBe("meta_camp_123");
    expect(result.adSet.status).toBe("FAILED");
    expect(result.creative.status).toBe("NOT_ATTEMPTED");
    expect(result.ad.status).toBe("NOT_ATTEMPTED");
    expect(result.stepFailed).toBe("AD_SET");
  });

  // Test 5: Parameter spec resolution tests (ODAX deterministic mapping)
  it("Test 5: MetaAdsCapabilityService deterministically resolves parameter combinations", () => {
    // 5.1 Leads + WhatsApp
    const leadWa = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_LEADS", "WHATSAPP");
    expect(leadWa.objective).toBe("OUTCOME_LEADS");
    expect(leadWa.metaDestinationType).toBe("WHATSAPP");
    expect(leadWa.optimizationGoal).toBe("CONVERSATIONS");
    expect(leadWa.requiresPagePromotedObject).toBe(true);

    // 5.2 Leads + Phone Call
    const leadCall = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_LEADS", "PHONE_CALL");
    expect(leadCall.objective).toBe("OUTCOME_LEADS");
    expect(leadCall.metaDestinationType).toBe("PHONE_CALL");
    expect(leadCall.optimizationGoal).toBe("LINK_CLICKS");
    expect(leadCall.cta).toBe("CALL_NOW");

    // 5.3 Traffic + Website
    const trafficWeb = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_TRAFFIC", "WEBSITE");
    expect(trafficWeb.objective).toBe("OUTCOME_TRAFFIC");
    expect(trafficWeb.metaDestinationType).toBe("WEBSITE");
    expect(trafficWeb.optimizationGoal).toBe("LINK_CLICKS");
  });

  // Test 6: Idempotent retry of final Ad creation
  it("Test 6: retryAdCreation successfully creates the Ad when upstream objects exist", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "meta_ad_retry_101" } });
    mockedAxios.get.mockResolvedValue({ data: { id: "meta_ad_retry_101" } });

    const adStatus = await MetaCampaignExecutionService.retryAdCreation(
      mockOrgId,
      "meta_adset_456",
      "meta_creative_789",
      "Urban Threads Ad"
    );

    expect(adStatus.status).toBe("CREATED");
    expect(adStatus.id).toBe("meta_ad_retry_101");
    expect(adStatus.verified).toBe(true);
  });
});
