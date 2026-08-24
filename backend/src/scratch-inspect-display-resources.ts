import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import prisma from "./utils/prisma";

async function investigateDisplayCampaign() {
  console.log("============================================================================");
  console.log("=== INVESTIGATING LIVE GOOGLE ADS DISPLAY CAMPAIGN: 22336873562 ===");
  console.log("============================================================================");

  const orgId = "demo-org-123";
  const customerId = "6587355041";
  const campaignId = "22336873562";

  // 1. Verify Campaign & Budget
  console.log("\n[CHECK 1] Querying Campaign & Budget via GAQL...");
  const campGaql = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.advertising_channel_sub_type,
      campaign.bidding_strategy_type,
      campaign.start_date,
      campaign.end_date,
      campaign.serving_status,
      campaign_budget.id,
      campaign_budget.name,
      campaign_budget.amount_micros,
      campaign_budget.status
    FROM campaign
    WHERE campaign.id = ${campaignId}
  `;
  const campRows = await GoogleAdsService.gaqlSearch(orgId, customerId, campGaql).catch(e => {
    console.error("Camp GAQL error:", e?.response?.data || e.message);
    return [];
  });
  console.log("Campaign details:", JSON.stringify(campRows, null, 2));

  // 2. Verify Ad Groups
  console.log("\n[CHECK 2] Querying Ad Groups for Campaign 22336873562...");
  const agGaql = `
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      ad_group.type,
      ad_group.campaign
    FROM ad_group
    WHERE campaign.id = ${campaignId}
  `;
  const agRows = await GoogleAdsService.gaqlSearch(orgId, customerId, agGaql).catch(e => {
    console.error("AdGroup GAQL error:", e?.response?.data || e.message);
    return [];
  });
  console.log(`Found ${agRows.length} Ad Group(s):`, JSON.stringify(agRows, null, 2));

  // 3. Verify Ad Group Ads (Responsive Display Ads)
  console.log("\n[CHECK 3] Querying Ad Group Ads for Campaign 22336873562...");
  const adGaql = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.name,
      ad_group_ad.ad.type,
      ad_group_ad.status,
      ad_group_ad.policy_summary.approval_status,
      ad_group_ad.ad.responsive_display_ad.headlines,
      ad_group_ad.ad.responsive_display_ad.descriptions,
      ad_group_ad.ad.responsive_display_ad.long_headline,
      ad_group_ad.ad.responsive_display_ad.marketing_images,
      ad_group_ad.ad.responsive_display_ad.square_marketing_images,
      ad_group_ad.ad.responsive_display_ad.logo_images
    FROM ad_group_ad
    WHERE campaign.id = ${campaignId}
  `;
  const adRows = await GoogleAdsService.gaqlSearch(orgId, customerId, adGaql).catch(e => {
    console.error("Ad GAQL error:", e?.response?.data || e.message);
    return [];
  });
  console.log(`Found ${adRows.length} Ad(s):`, JSON.stringify(adRows, null, 2));

  // 4. Verify Campaign Criteria (Geo, Language)
  console.log("\n[CHECK 4] Querying Campaign Criteria for Campaign 22336873562...");
  const critGaql = `
    SELECT
      campaign_criterion.criterion_id,
      campaign_criterion.type,
      campaign_criterion.status
    FROM campaign_criterion
    WHERE campaign.id = ${campaignId}
  `;
  const critRows = await GoogleAdsService.gaqlSearch(orgId, customerId, critGaql).catch(e => {
    console.error("Crit GAQL error:", e?.response?.data || e.message);
    return [];
  });
  console.log(`Found ${critRows.length} Campaign Criteria:`, JSON.stringify(critRows, null, 2));

  await prisma.$disconnect();
}

investigateDisplayCampaign();
