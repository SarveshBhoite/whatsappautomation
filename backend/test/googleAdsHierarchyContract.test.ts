import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import prisma from "../src/utils/prisma";
import { GoogleAdsBaseService } from "../src/services/googleAds/shared/GoogleAdsBaseService";
import { GoogleAdsCampaignValidator } from "../src/services/googleAds/shared/GoogleAdsCampaignValidator";

describe("Google Ads Hierarchy & Full API Contract Integration Suite", () => {
  const testOrgId = "org-test-hierarchy-flow";
  const testCustomerId = "1234567890";
  const uniqueCampaignId = "camp-flow-999";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("validates full hierarchical payload with multiple ad groups, keywords, and ads", () => {
    const validHierarchyPayload = {
      customerId: testCustomerId,
      organizationId: testOrgId,
      campaignName: "Multi Ad Group Enterprise Search",
      campaignType: "SEARCH",
      objective: "SALES",
      currencyCode: "USD",
      budgetType: "DAILY",
      dailyBudget: 100,
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      website: "https://jisnucrm.com/enterprise",
      languages: ["English"],
      locations: ["United States"],
      adGroups: [
        {
          name: "Sales Automation Group",
          status: "ENABLED",
          cpcBid: 2.5,
          keywords: ["sales automation software", "[enterprise crm]"],
          negativeKeywords: ["free crm"],
          ads: [
            {
              name: "Sales Ad Variant 1",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Automate Sales Today", "Enterprise CRM Tools", "Boost Rep Productivity"],
              descriptions: ["Scale your entire outbound pipeline effortlessly.", "Schedule a custom live demo today."],
              finalUrls: ["https://jisnucrm.com/sales"]
            }
          ]
        },
        {
          name: "Marketing Automation Group",
          status: "ENABLED",
          cpcBid: 1.8,
          keywords: ["marketing workflows", '"crm campaign builder"'],
          ads: [
            {
              name: "Marketing Ad Variant 1",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Omnichannel Campaigns", "High Conversion Leads", "Top Marketing Platform"],
              descriptions: ["Integrate WhatsApp, Email & Ads seamlessly.", "Get started with Jisnu CRM now."],
              finalUrls: ["https://jisnucrm.com/marketing"]
            }
          ]
        }
      ]
    };

    const validation = GoogleAdsCampaignValidator.validate(validHierarchyPayload);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("persists multi-ad-group, multi-ad, and asset hierarchy with relational linkages", async () => {
    const payload = {
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: uniqueCampaignId,
      name: "Enterprise Multi-Ad Group Search",
      status: "PAUSED",
      campaignType: "SEARCH",
      advertisingChannelType: "SEARCH",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      budget: 150.0,
      finalUrl: "https://jisnucrm.com",
      adGroups: [
        {
          name: "Group Alpha",
          status: "ENABLED",
          cpcBid: 2.0,
          keywords: ["keyword one", "[keyword two]"],
          negativeKeywords: ["negative one"],
          ads: [
            {
              name: "Ad Alpha 1",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Headline A1", "Headline A2", "Headline A3"],
              descriptions: ["Description A1", "Description A2"],
              finalUrls: ["https://jisnucrm.com/alpha"]
            },
            {
              name: "Ad Alpha 2",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Headline A4", "Headline A5", "Headline A6"],
              descriptions: ["Description A3", "Description A4"],
              finalUrls: ["https://jisnucrm.com/alpha-2"]
            }
          ]
        },
        {
          name: "Group Beta",
          status: "ENABLED",
          cpcBid: 1.2,
          keywords: ["keyword three"],
          ads: [
            {
              name: "Ad Beta 1",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Headline B1", "Headline B2", "Headline B3"],
              descriptions: ["Description B1", "Description B2"],
              finalUrls: ["https://jisnucrm.com/beta"]
            }
          ]
        }
      ],
      images: [
        {
          name: "Company HQ Banner",
          url: "https://jisnucrm.com/assets/hq.jpg"
        }
      ],
      logos: [
        {
          name: "Company Icon",
          url: "https://jisnucrm.com/assets/icon.png"
        }
      ],
      videos: [
        {
          name: "Demo Video",
          url: "https://www.youtube.com/watch?v=sample123"
        }
      ]
    };

    // Mock prisma responses
    const mockCampaign = {
      id: "camp-db-id-1",
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: uniqueCampaignId,
      name: payload.name,
      status: "PAUSED",
      campaignType: "SEARCH",
      budget: 150.0
    };

    const mockAg1 = {
      id: "ag-db-id-1",
      organizationId: testOrgId,
      customerId: testCustomerId,
      campaignId: "camp-db-id-1",
      name: "Group Alpha",
      status: "ENABLED",
      cpcBid: 2.0
    };

    const mockAg2 = {
      id: "ag-db-id-2",
      organizationId: testOrgId,
      customerId: testCustomerId,
      campaignId: "camp-db-id-1",
      name: "Group Beta",
      status: "ENABLED",
      cpcBid: 1.2
    };

    jest.spyOn(prisma.googleAdCampaign as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdCampaign as any, "create").mockResolvedValue(mockCampaign);
    jest.spyOn(prisma.googleAdGroup as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdGroup as any, "create")
      .mockResolvedValueOnce(mockAg1)
      .mockResolvedValueOnce(mockAg2);
    jest.spyOn(prisma.googleAdKeyword as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdKeyword as any, "create").mockResolvedValue({ id: "kw-db-1" });
    jest.spyOn(prisma.googleAd as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAd as any, "create").mockResolvedValue({ id: "ad-db-1" });
    jest.spyOn(prisma.googleAdAsset as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdAsset as any, "create").mockResolvedValue({ id: "asset-db-1" });
    jest.spyOn(prisma.googleAdAssetLinkage as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdAssetLinkage as any, "create").mockResolvedValue({ id: "link-db-1" });

    const saved = await (GoogleAdsBaseService as any).saveCampaignToDatabase(payload);
    expect(saved).toBeDefined();
    expect(saved.id).toBe("camp-db-id-1");
    expect(prisma.googleAdGroup.create).toHaveBeenCalledTimes(2);
    expect(prisma.googleAd.create).toHaveBeenCalledTimes(3); // 2 in Group Alpha, 1 in Group Beta
    expect(prisma.googleAdKeyword.create).toHaveBeenCalledTimes(4); // 3 in Alpha, 1 in Beta
    expect(prisma.googleAdAsset.create).toHaveBeenCalledTimes(3); // image, logo, video
    expect(prisma.googleAdAssetLinkage.create).toHaveBeenCalledTimes(3);
  });

  it("preserves legacy flat payload compatibility gracefully", async () => {
    const legacyPayload = {
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: "legacy-camp-1",
      name: "Legacy Search Campaign",
      status: "PAUSED",
      campaignType: "SEARCH",
      advertisingChannelType: "SEARCH",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      budget: 30.0,
      headlines: ["Legacy H1", "Legacy H2", "Legacy H3"],
      descriptions: ["Legacy D1", "Legacy D2"],
      finalUrl: "https://jisnucrm.com/legacy",
      keywords: ["legacy crm"]
    };

    jest.spyOn(prisma.googleAdCampaign as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdCampaign as any, "create").mockResolvedValue({
      id: "legacy-camp-db-id",
      ...legacyPayload
    });
    jest.spyOn(prisma.googleAdGroup as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdGroup as any, "create").mockResolvedValue({ id: "ag-legacy-1" });
    jest.spyOn(prisma.googleAdKeyword as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdKeyword as any, "create").mockResolvedValue({ id: "kw-legacy-1" });
    jest.spyOn(prisma.googleAd as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAd as any, "create").mockResolvedValue({ id: "ad-legacy-1" });

    const saved = await (GoogleAdsBaseService as any).saveCampaignToDatabase(legacyPayload);
    expect(saved).toBeDefined();
    expect(saved.id).toBe("legacy-camp-db-id");
    expect(prisma.googleAdCampaign.create).toHaveBeenCalled();
  });
});
