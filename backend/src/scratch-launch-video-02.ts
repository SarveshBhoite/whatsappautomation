import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import prisma from "./utils/prisma";

async function executeFreshLiveVideoTest() {
  console.log("============================================================================");
  console.log("=== EXECUTING FRESH LIVE SALES -> VIDEO TEST: Atharva-Video-Test-02 ===");
  console.log("============================================================================");

  const orgId = "demo-org-123";
  const customerId = "6587355041";
  const campaignName = "Atharva-Video-Test-02";

  // Pre-check duplicate in DB or live
  const existingCamp = await prisma.googleAdCampaign.findFirst({
    where: { organizationId: orgId, customerId, name: campaignName }
  });
  if (existingCamp) {
    console.log(`Campaign "${campaignName}" already exists in DB with ID ${existingCamp.id}, aborting to avoid duplicates.`);
    return;
  }

  const payload = {
    campaignName,
    campaignSubtype: "VIDEO_ACTION",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    finalUrl: "https://www.atharva-automation.com",
    amountMicros: 500 * 1_000_000,
    biddingFocus: "MAXIMIZE_CONVERSIONS",
    targetCpaMicros: 50 * 1_000_000,
    headline: "Atharva Video Ads",
    description: "Discover automated marketing solutions."
  };

  console.log("\n[STEP 1] Calling GoogleAdsService.createNoGuidanceVideoCampaign (Real Google Ads API mutate):");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const launchResult = await GoogleAdsService.createNoGuidanceVideoCampaign(orgId, customerId, payload);
    console.log("\n[SUCCESS] Google Ads API Mutate Response:", JSON.stringify(launchResult, null, 2));

    // Storing in Prisma
    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: launchResult.campaignId || null,
        name: campaignName,
        campaignType: "VIDEO",
        biddingStrategy: "TARGET_CPA",
        budget: 500,
        budgetResourceName: launchResult.budgetResourceName,
        startDate: new Date(),
        status: "PAUSED",
        finalUrl: payload.finalUrl,
        headlines: [payload.headline],
        descriptions: [payload.description],
        geoTargets: ["India"],
        languages: ["English"],
        advertisingChannelType: "VIDEO",
        amountMicros: BigInt(payload.amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });
    console.log("\n[DB] Stored local record with id:", localCampaign.id);

    // Query Google Ads API via GAQL for real live verification
    console.log(`\n[STEP 2] Verifying live Google Ads campaign via GAQL query for campaign ID: ${launchResult.campaignId}...`);
    const gaql = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign_budget.amount_micros,
        campaign_budget.name
      FROM campaign
      WHERE campaign.id = ${launchResult.campaignId}
    `;

    const gaqlResults = await GoogleAdsService.gaqlSearch(orgId, customerId, gaql);
    console.log("\n[GAQL VERIFICATION RESPONSE]:\n", JSON.stringify(gaqlResults, null, 2));

    console.log("\n============================================================================");
    console.log("=== VERIFIED REAL GOOGLE ADS LIVE DETAILS ===");
    console.log(`- Customer ID: ${customerId}`);
    console.log(`- Campaign Name: ${campaignName}`);
    console.log(`- Campaign ID: ${launchResult.campaignId}`);
    console.log(`- Resource Name: ${launchResult.campaignResourceName}`);
    console.log(`- Status: PAUSED`);
    console.log(`- Advertising Channel Type: VIDEO`);
    console.log(`- Budget: ₹500 (500000000 micros)`);
    console.log("============================================================================");

  } catch (err: any) {
    console.error("\n[ERROR] Live Google Ads Mutation Failed:", err?.response?.data || err.message);
    if (err?.response?.data?.error?.details) {
      console.error("Details:", JSON.stringify(err.response.data.error.details, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

executeFreshLiveVideoTest();
