const axios = require("axios");

const BASE = "http://localhost:5000/api/meta-ads";
const ORG_ID = "demo-org-123";

async function testLiveAccountAndValidateOnly() {
  console.log("==================================================");
  console.log("🚀 TESTING LIVE AD ACCOUNT DIAGNOSTICS & VALIDATE-ONLY CAMPAIGN (META API V26.0)");
  console.log("==================================================");

  try {
    // Fetch Config to get real access token and account ID
    const configRes = await axios.get(`${BASE}/config?organizationId=${ORG_ID}`);
    const config = configRes.data?.config;

    const accessToken = config?.accessToken;
    const rawAccountId = config?.adAccountId || "1454270479625110";
    const formattedAccountId = rawAccountId.startsWith("act_") ? rawAccountId : `act_${rawAccountId}`;

    console.log("Access Token Present:", !!accessToken);
    console.log("Ad Account ID:", formattedAccountId);

    if (!accessToken) {
      console.error("❌ Access Token missing from configuration.");
      return;
    }

    // 1. EXECUTE COMMAND 1: Ad Account & Campaign Diagnostics
    console.log("\n--------------------------------------------------");
    console.log("1️⃣ Executing Command 1: GET Ad Account & Recent Campaigns...");
    console.log("--------------------------------------------------");

    const fields = "id,name,account_status,currency,timezone_name,amount_spent,balance,business{id,name},owner,funding_source_details,min_daily_budget,is_prepay_account,ads_volume,capabilities,campaigns.limit(5){id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time,special_ad_categories,buying_type,bid_strategy}";

    const accountRes = await axios.get(`https://graph.facebook.com/v26.0/${formattedAccountId}`, {
      params: {
        fields,
        access_token: accessToken,
      },
    });

    const accData = accountRes.data;
    console.log("✅ LIVE AD ACCOUNT DATA RECEIVED:");
    console.log(`- Account ID: ${accData.id}`);
    console.log(`- Account Name: ${accData.name}`);
    console.log(`- Status: ${accData.account_status === 1 ? 'ACTIVE (1)' : accData.account_status}`);
    console.log(`- Currency: ${accData.currency}`);
    console.log(`- Timezone: ${accData.timezone_name}`);
    console.log(`- Amount Spent: ₹${accData.amount_spent ? Number(accData.amount_spent)/100 : 0}`);
    console.log(`- Min Daily Budget: ₹${accData.min_daily_budget ? Number(accData.min_daily_budget)/100 : 95.76}`);
    console.log(`- Business: ${accData.business ? accData.business.name : 'N/A'}`);
    console.log(`- Total Campaigns Returned: ${accData.campaigns?.data?.length || 0}`);

    if (accData.campaigns?.data && accData.campaigns.data.length > 0) {
      console.log("\n📋 Top 5 Recent Meta Campaigns:");
      accData.campaigns.data.forEach((c, idx) => {
        console.log(`  ${idx + 1}. [${c.id}] ${c.name} | Objective: ${c.objective} | Status: ${c.status} | Daily Budget: ₹${c.daily_budget ? Number(c.daily_budget)/100 : 'N/A'}`);
      });
    }

    // 2. EXECUTE COMMAND 2: Validate-Only Campaign Health Check
    console.log("\n--------------------------------------------------");
    console.log("2️⃣ Executing Command 2: POST Validate-Only Health Check Campaign...");
    console.log("--------------------------------------------------");

    const validateRes = await axios.post(`https://graph.facebook.com/v26.0/${formattedAccountId}/campaigns`, {
      name: "API Health Check Campaign",
      objective: "OUTCOME_AWARENESS",
      status: "PAUSED",
      special_ad_categories: [],
      is_adset_budget_sharing_enabled: false,
      execution_options: ["validate_only"],
      access_token: accessToken,
    });

    console.log("✅ LIVE VALIDATE-ONLY CAMPAIGN RESPONSE:");
    console.log(JSON.stringify(validateRes.data, null, 2));

    console.log("\n==================================================");
    console.log("🎉 SUCCESS: BOTH META GRAPH API V26.0 cURL COMMANDS PASSED LIVE!");
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Live API Command Error:", err.response?.data || err.message);
  }
}

testLiveAccountAndValidateOnly();
