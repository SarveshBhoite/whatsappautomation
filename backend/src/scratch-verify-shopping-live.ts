import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";

async function verifyShoppingLive() {
  console.log("============================================================================");
  console.log("=== SALES -> SHOPPING: CONTROLLED LIVE PUBLISH TEST ===");
  console.log("============================================================================");

  const orgId = "demo-org-123";
  const customerId = "6587355041";
  const campaignName = "JDS-Shopping-Test-01";

  // Step 1: Pre-check if campaign already exists in Google Ads
  console.log("\n[STEP 1] Checking if campaign already exists in customer account", customerId, "...");
  const checkGaql = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type
    FROM campaign
    WHERE campaign.name = '${campaignName}'
  `;

  try {
    const existing = await GoogleAdsService.gaqlSearch(orgId, customerId, checkGaql);
    if (existing && existing.length > 0) {
      console.log(`[ALREADY EXISTS] Found campaign "${campaignName}" with ID:`, existing[0].campaign?.id);
      console.log(JSON.stringify(existing, null, 2));
      return;
    }
  } catch (err: any) {
    console.log("GAQL check error (or zero results):", err?.message);
  }

  // Step 2: Formulate frontend launch payload
  const frontendPayload = {
    orgId,
    customerId,
    campaignName,
    channelType: "SHOPPING",
    biddingStrategy: "MANUAL_CPC",
    budget: 500,
    budgetType: "DAILY",
    merchantCenterId: "5840531233",
    salesCountry: "IN",
    feedLabel: "IN",
    shoppingSetting: {
      merchantId: "5840531233",
      salesCountry: "IN",
      feedLabel: "IN",
      campaignPriority: "LOW",
      enableLocalProducts: false
    },
    finalUrl: "https://www.JDS-automation.com",
    headlines: ["Shop Top Deals Now"],
    descriptions: ["Explore our exclusive shopping collection with fast delivery and great discounts."],
    adGroupName: "JDS Shopping Ad Group",
    adGroupBid: 10,
    customerAcquisitionMode: "ALL_CUSTOMERS",
    campaignPriority: "LOW",
    locations: ["INDIA"],
    localProducts: false,
    euPolitical: "NO",
    startDate: new Date().toISOString().split("T")[0],
    includeSearchPartners: true,
    productGroupFilter: "Use all products"
  };

  console.log("\n[STEP 2] Executing live publish with frontend payload:");
  console.log(JSON.stringify(frontendPayload, null, 2));

  // Step 3: Trigger live backend launch endpoint
  try {
    const response = await fetch("http://localhost:5000/api/ads/campaign/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(frontendPayload)
    });

    const data = await response.json();
    console.log("\n[STEP 3] Launch Endpoint HTTP Status:", response.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("\n❌ [LAUNCH FAILED]:", data);
      return;
    }

    console.log("\n[STEP 4] Campaign Published! Verifying campaign in Google Ads...");
    const verifyRows = await GoogleAdsService.gaqlSearch(orgId, customerId, `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.shopping_setting.merchant_id,
        campaign.shopping_setting.sales_country,
        campaign.shopping_setting.campaign_priority,
        campaign.shopping_setting.enable_local_products,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.name = '${campaignName}'
    `);

    console.log("\n[LIVE GOOGLE ADS ACCOUNT VERIFICATION RESULT]:");
    console.log(JSON.stringify(verifyRows, null, 2));

  } catch (err: any) {
    console.error("\n❌ [ERROR RUNNING LIVE TEST]:", err?.response?.data || err?.message);
  }
}

verifyShoppingLive();
