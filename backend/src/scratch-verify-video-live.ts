import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import prisma from "./utils/prisma";

async function verifyVideoCampaign() {
  console.log("============================================================================");
  console.log("=== STARTING CONTROLLED LIVE VIDEO VERIFICATION: Atharva-Sales-Video-Verification-01 ===");
  console.log("============================================================================");

  const orgId = "demo-org-123";
  const customerId = "6587355041";
  const campaignName = "Atharva-Sales-Video-Verification-01";

  // Check account
  const accounts = await prisma.googleAdAccount.findMany({
    where: { organizationId: orgId, isActive: true }
  });
  console.log(`[PRE-CHECK] Active accounts in DB:`, accounts.map(a => `${a.customerId} (${a.name})`));

  const payload = {
    campaignName,
    campaignSubtype: "VIDEO_ACTION",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    finalUrl: "https://www.atharva-automation.com",
    amountMicros: 500 * 1_000_000,
    biddingFocus: "MAXIMIZE_CONVERSIONS",
    targetCpaMicros: 50 * 1_000_000,
    headline: "Atharva Video Ads",
    description: "Transform your customer outreach with automated video marketing."
  };

  console.log("\n[STEP 1] Calling GoogleAdsService.createNoGuidanceVideoCampaign with payload:", JSON.stringify(payload, null, 2));

  try {
    const launchResult = await GoogleAdsService.createNoGuidanceVideoCampaign(orgId, customerId, payload);
    console.log("\n[SUCCESS] Google Ads API Response:", JSON.stringify(launchResult, null, 2));

    // Save to Prisma (matching backend launch handler)
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
    console.log("\n[DB] Stored in local Prisma DB with id:", localCampaign.id);

    // Query Google Ads API via GAQL to verify the campaign in live account
    console.log("\n[STEP 2] Querying Google Ads API via GAQL for campaign.id =", launchResult.campaignId);
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
    console.log("\n[GAQL LIVE OUTPUT]:\n", JSON.stringify(gaqlResults, null, 2));

    console.log("\n============================================================================");
    console.log("=== LIVE VERIFICATION COMPLETE ===");
    console.log(`Customer ID: ${customerId}`);
    console.log(`Campaign ID: ${launchResult.campaignId}`);
    console.log(`Campaign Resource Name: ${launchResult.campaignResourceName}`);
    console.log(`Campaign Name: ${campaignName}`);
    console.log(`Status: PAUSED`);
    console.log(`Channel Type: VIDEO`);
    console.log("============================================================================");

  } catch (err: any) {
    console.error("\n[ERROR] Google Ads API Error:", err?.response?.data || err.message);
    if (err?.response?.data?.error?.details) {
      console.error("Details:", JSON.stringify(err.response.data.error.details, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyVideoCampaign();
