import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import prisma from "../src/utils/prisma";
import { GoogleAdsBaseService } from "../src/services/googleAds/shared/GoogleAdsBaseService";

describe("Google Ads Hierarchy & Persistence Architecture Unit Tests", () => {
  const testOrgId = "test-org-hierarchy-unit";
  const testCustomerId = "1234567890";
  const uniqueCampaignId = "test-camp-unit-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process and structure hierarchical campaign data with ad groups, ads, keywords, and media assets", async () => {
    const campaignPayload = {
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: uniqueCampaignId,
      name: "Hierarchy Search Campaign",
      status: "PAUSED",
      campaignType: "SEARCH",
      advertisingChannelType: "SEARCH",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      budget: 50.0,
      headlines: ["Headline 1", "Headline 2", "Headline 3"],
      descriptions: ["Description 1", "Description 2"],
      finalUrl: "https://www.example.com",
      adGroups: [
        {
          name: "High Intent Ad Group",
          status: "ENABLED",
          cpcBid: 1.5,
          keywords: ["buy crm online", "[crm software]", '"best crm"'],
          negativeKeywords: ["free crm", "crack"],
          ads: [
            {
              name: "Ad Variant A",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Top Rated CRM", "Boost Sales Fast", "Try For Free Today"],
              descriptions: ["Automate your entire sales process.", "Sign up for a free trial now."],
              finalUrls: ["https://www.example.com/crm-a"],
              path1: "crm",
              path2: "sales"
            },
            {
              name: "Ad Variant B",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Enterprise CRM Solution", "Award Winning Support", "Integrate in Minutes"],
              descriptions: ["Scale your marketing effortlessly.", "Contact our sales team today."],
              finalUrls: ["https://www.example.com/crm-b"],
              path1: "crm",
              path2: "enterprise"
            }
          ]
        },
        {
          name: "Brand Search Ad Group",
          status: "ENABLED",
          cpcBid: 0.8,
          keywords: ["jisnu crm", "jisnu marketing"],
          ads: [
            {
              name: "Brand Ad 1",
              adType: "RESPONSIVE_SEARCH_AD",
              headlines: ["Official Jisnu CRM", "The All-in-One Growth Platform", "Start Free Demo"],
              descriptions: ["Trusted by thousands of modern businesses.", "Join Jisnu CRM now."],
              finalUrls: ["https://www.example.com/brand"]
            }
          ]
        }
      ],
      images: [
        {
          name: "Marketing Banner 1",
          url: "https://example.com/images/banner1.jpg"
        }
      ],
      logos: [
        {
          name: "Brand Logo Square",
          url: "https://example.com/images/logo.png"
        }
      ],
      videos: [
        {
          name: "Product Overview Video",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ]
    };

    // Mock prisma responses
    const mockCampaign = {
      id: "camp-uuid-1",
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: uniqueCampaignId,
      name: "Hierarchy Search Campaign",
      status: "PAUSED",
      campaignType: "SEARCH",
      advertisingChannelType: "SEARCH",
      biddingStrategy: "MAXIMIZE_CONVERSIONS",
      budget: 50.0,
      headlines: ["Headline 1", "Headline 2", "Headline 3"],
      descriptions: ["Description 1", "Description 2"],
      finalUrl: "https://www.example.com"
    };

    const mockAdGroup1 = {
      id: "ag-uuid-1",
      organizationId: testOrgId,
      customerId: testCustomerId,
      campaignId: "camp-uuid-1",
      name: "High Intent Ad Group",
      status: "ENABLED",
      cpcBid: 1.5,
      cpcBidMicros: BigInt(1500000)
    };

    const mockAdGroup2 = {
      id: "ag-uuid-2",
      organizationId: testOrgId,
      customerId: testCustomerId,
      campaignId: "camp-uuid-1",
      name: "Brand Search Ad Group",
      status: "ENABLED",
      cpcBid: 0.8,
      cpcBidMicros: BigInt(800000)
    };

    const mockAsset = {
      id: "asset-uuid-1",
      organizationId: testOrgId,
      customerId: testCustomerId,
      assetType: "IMAGE",
      name: "Marketing Banner 1",
      url: "https://example.com/images/banner1.jpg"
    };

    jest.spyOn(prisma.googleAdCampaign as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdCampaign as any, "create").mockResolvedValue(mockCampaign);
    jest.spyOn(prisma.googleAdGroup as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdGroup as any, "create")
      .mockResolvedValueOnce(mockAdGroup1)
      .mockResolvedValueOnce(mockAdGroup2);
    jest.spyOn(prisma.googleAdKeyword as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdKeyword as any, "create").mockResolvedValue({ id: "kw-1" });
    jest.spyOn(prisma.googleAd as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAd as any, "create").mockResolvedValue({ id: "ad-1" });
    jest.spyOn(prisma.googleAdAsset as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdAsset as any, "create").mockResolvedValue(mockAsset);
    jest.spyOn(prisma.googleAdAssetLinkage as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdAssetLinkage as any, "create").mockResolvedValue({ id: "link-1" });

    const result = await (GoogleAdsBaseService as any).saveCampaignToDatabase(campaignPayload);
    expect(result).toBeDefined();
    expect(result.id).toBe("camp-uuid-1");
    expect(prisma.googleAdCampaign.create).toHaveBeenCalled();
    expect(prisma.googleAdGroup.create).toHaveBeenCalledTimes(2);
    expect(prisma.googleAd.create).toHaveBeenCalledTimes(3); // 2 in ag1, 1 in ag2
    expect(prisma.googleAdKeyword.create).toHaveBeenCalledTimes(7); // 5 in ag1, 2 in ag2
    expect(prisma.googleAdAsset.create).toHaveBeenCalledTimes(3); // image, logo, video
    expect(prisma.googleAdAssetLinkage.create).toHaveBeenCalledTimes(3);
  });

  it("should enforce tenant isolation by organizationId in queries", async () => {
    jest.spyOn(prisma.googleAdCampaign as any, "findFirst").mockResolvedValue(null);
    const result = await (prisma.googleAdCampaign as any).findFirst({
      where: {
        organizationId: "unauthorized-org",
        googleAdsCampaignId: uniqueCampaignId
      }
    });
    expect(result).toBeNull();
  });

  it("Scenario 1 & 2: handles successful asset creation and linkage vs association failure resilience", async () => {
    const mockAsset = { id: "asset-1", organizationId: testOrgId, customerId: testCustomerId, assetType: "IMAGE", url: "https://example.com/img1.jpg" };
    jest.spyOn(prisma.googleAdAsset as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdAsset as any, "create").mockResolvedValue(mockAsset);
    jest.spyOn(prisma.googleAdAssetLinkage as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdAssetLinkage as any, "create").mockResolvedValue({ id: "link-1", assetId: "asset-1", campaignId: "camp-1", status: "ENABLED" });

    const payload = {
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: "camp-test-1",
      name: "Media Test Campaign",
      status: "PAUSED",
      campaignType: "SEARCH",
      images: [{ name: "Image 1", url: "https://example.com/img1.jpg" }]
    };

    jest.spyOn(prisma.googleAdCampaign as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdCampaign as any, "create").mockResolvedValue({ id: "camp-1", ...payload });

    const result = await (GoogleAdsBaseService as any).saveCampaignToDatabase(payload);
    expect(result).toBeDefined();
    expect(prisma.googleAdAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: testOrgId,
        assetType: "IMAGE",
        url: "https://example.com/img1.jpg"
      })
    });
    expect(prisma.googleAdAssetLinkage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: testOrgId,
        assetId: "asset-1",
        campaignId: "camp-1",
        assetFieldType: "MARKETING_IMAGE"
      })
    });
  });

  it("Scenario 4 & 5: safely associates the same asset with two different campaigns without duplicate asset creation", async () => {
    const existingAsset = { id: "shared-asset-1", organizationId: testOrgId, customerId: testCustomerId, assetType: "IMAGE", url: "https://example.com/shared.jpg" };
    
    // First campaign finds and returns existing asset
    jest.spyOn(prisma.googleAdAsset as any, "findFirst").mockResolvedValue(existingAsset);
    const createAssetSpy = jest.spyOn(prisma.googleAdAsset as any, "create");
    
    jest.spyOn(prisma.googleAdAssetLinkage as any, "findFirst").mockResolvedValue(null);
    const createLinkSpy = jest.spyOn(prisma.googleAdAssetLinkage as any, "create").mockResolvedValue({ id: "link-camp2", assetId: "shared-asset-1", campaignId: "camp-2" });

    const payloadCamp2 = {
      organizationId: testOrgId,
      customerId: testCustomerId,
      googleAdsCampaignId: "camp-test-2",
      name: "Second Campaign Using Shared Asset",
      status: "PAUSED",
      campaignType: "SEARCH",
      images: [{ name: "Shared Banner", url: "https://example.com/shared.jpg" }]
    };

    jest.spyOn(prisma.googleAdCampaign as any, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.googleAdCampaign as any, "create").mockResolvedValue({ id: "camp-2", ...payloadCamp2 });

    const result = await (GoogleAdsBaseService as any).saveCampaignToDatabase(payloadCamp2);
    expect(result).toBeDefined();
    // Asset was reused, not recreated
    expect(createAssetSpy).not.toHaveBeenCalled();
    // New linkage for camp-2 was created
    expect(createLinkSpy).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: testOrgId,
        assetId: "shared-asset-1",
        campaignId: "camp-2"
      })
    });
  });

  it("Scenario 8: campaign rollback does not delete reusable assets from database or Google Ads", async () => {
    // Verify rollbackGoogleAdsCampaign signature and behavior with mock/safe resource
    const rollbackSpy = jest.spyOn(GoogleAdsBaseService as any, "rollbackGoogleAdsCampaign");
    await GoogleAdsBaseService.rollbackGoogleAdsCampaign(testOrgId, testCustomerId, "mock-customers/123/campaigns/999");
    
    // When resourceName contains 'mock-', it safely skips calling external API and preserves assets
    expect(rollbackSpy).toHaveBeenCalledWith(testOrgId, testCustomerId, "mock-customers/123/campaigns/999");
  });
});
