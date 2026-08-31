import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import prisma from "./utils/prisma";

async function runLiveVerification() {
  console.log("===============================================================");
  console.log("=== STARTING LIVE SALES -> SEARCH TEST FOR CAMPAIGN: JDS ===");
  console.log("===============================================================");

  const orgId = "demo-org-123";
  const customerId = "6587355041";
  const campaignName = "JDS";

  // Step 0: Check account connectivity
  console.log("[PRE-CHECK] Verifying Google Ads Account connection...");
  const accounts = await prisma.googleAdAccount.findMany({
    where: { organizationId: orgId, isActive: true }
  });
  console.log(`Found ${accounts.length} active account(s) for org ${orgId}.`);
  const currentAcc = accounts.find(a => a.customerId === customerId);
  console.log(`Selected Customer ID: ${customerId} (Found in DB: ${!!currentAcc})`);

  const payload = {
    organizationId: orgId,
    customerId,
    campaignName,
    channelType: "SEARCH",
    biddingStrategy: "MAXIMIZE_CONVERSIONS",
    budget: 500,
    startDate: "2026-08-25",
    finalUrl: "https://www.JDS-automation.com",
    headlines: [
      "JDS Smart Automation",
      "Next Gen CRM Marketing",
      "Boost Sales Conversions"
    ],
    descriptions: [
      "Automate your customer engagement with AI-powered WhatsApp and Ads automation tools.",
      "Supercharge your marketing workflow with real-time analytics and intelligent bidding."
    ],
    keywords: [
      "marketing automation",
      "crm software",
      "sales growth"
    ],
    geoTargetIds: ["India"],
    languages: ["English"],
    locationTargetingType: "PRESENCE_INTEREST",
    urlExpansionOptOut: false,
    adSchedules: [],
    brandInclusions: [],
    brandExclusions: [],
    onlyBidNewCustomers: false,
    adjustLapsedCustomers: false,
    euPolitical: "NO",
    conversionGoals: [
      { category: "PURCHASE", origin: "WEBSITE", biddable: true },
      { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE", biddable: true }
    ]
  };

  console.log("\n[STEP 1] Executing GoogleAdsService.launchLocalSearchCampaign...");
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const launchResult = await GoogleAdsService.launchLocalSearchCampaign(payload);
    console.log("\n[SUCCESS] Google Ads Search Campaign Launched Successfully!");
    console.log("Live Launch Result:", JSON.stringify(launchResult, null, 2));

    // Save to Prisma
    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: launchResult.campaignId || null,
        name: campaignName,
        campaignType: "SEARCH",
        biddingStrategy: "MAXIMIZE_CONVERSIONS",
        budget: 500,
        budgetResourceName: launchResult.budgetResourceName,
        startDate: new Date("2026-08-25"),
        status: "PAUSED",
        finalUrl: payload.finalUrl,
        headlines: payload.headlines,
        descriptions: payload.descriptions,
        keywords: payload.keywords,
        geoTargets: payload.geoTargetIds,
        languages: payload.languages,
        audienceSignal: {
          locationTargetingType: payload.locationTargetingType,
          conversionGoals: payload.conversionGoals
        }
      } as any
    });
    console.log("\n[DB] Stored in local Prisma DB with id:", localCampaign.id);

    // Verify via GAQL Query
    console.log("\n[STEP 2] Verifying live campaign via GAQL query...");
    const gaql = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros,
        campaign_budget.name
      FROM campaign
      WHERE campaign.id = ${launchResult.campaignId}
    `;

    const gaqlResults = await GoogleAdsService.gaqlSearch(orgId, customerId, gaql);
    console.log("GAQL Live Verification Output:\n", JSON.stringify(gaqlResults, null, 2));

    // Verify Criteria (Keywords, Geo, Languages)
    console.log("\n[STEP 3] Verifying Criteria (Keywords, Geo, Languages) via GAQL query...");
    const criteriaGaql = `
      SELECT
        campaign_criterion.criterion_id,
        campaign_criterion.type,
        campaign_criterion.location.geo_target_constant,
        campaign_criterion.language.language_constant,
        campaign_criterion.negative
      FROM campaign_criterion
      WHERE campaign.id = ${launchResult.campaignId}
    `;
    const criteriaResults = await GoogleAdsService.gaqlSearch(orgId, customerId, criteriaGaql).catch(() => []);
    console.log("Criteria GAQL Verification Output:\n", JSON.stringify(criteriaResults, null, 2));

    // Verify Ad Group & RSA
    console.log("\n[STEP 4] Verifying live Ad Group & Ads via GAQL query...");
    const adGaql = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.final_urls
      FROM ad_group_ad
      WHERE campaign.id = ${launchResult.campaignId}
    `;
    const adResults = await GoogleAdsService.gaqlSearch(orgId, customerId, adGaql).catch(() => []);
    console.log("Ad GAQL Verification Output:\n", JSON.stringify(adResults, null, 2));

    // Verify Ad Group Keywords
    console.log("\n[STEP 5] Verifying live Ad Group Keywords via GAQL query...");
    const kwGaql = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status
      FROM ad_group_criterion
      WHERE campaign.id = ${launchResult.campaignId}
    `;
    const kwResults = await GoogleAdsService.gaqlSearch(orgId, customerId, kwGaql).catch(() => []);
    console.log("Keywords GAQL Verification Output:\n", JSON.stringify(kwResults, null, 2));

  } catch (err: any) {
    console.error("\n[ERROR] Live Google Ads Launch Error:", err?.response?.data || err.message);
    if (err?.response?.data?.error?.details) {
      console.error("Details:", JSON.stringify(err.response.data.error.details, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

runLiveVerification();
