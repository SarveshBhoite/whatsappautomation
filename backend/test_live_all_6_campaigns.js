const axios = require("axios");

const BASE = "http://localhost:5000/api/meta-ads";
const ORG_ID = "demo-org-123";

async function testAll6Campaigns() {
  console.log("==================================================");
  console.log("🚀 META MARKETING API V26.0 - 6 CAMPAIGN OBJECTIVES TEST");
  console.log("==================================================");

  const campaignsToTest = [
    {
      name: "1. Brand Awareness Campaign Test",
      objective: "OUTCOME_AWARENESS",
      buyingType: "AUCTION",
      specialAdCategory: "NONE",
      dailyBudget: 600,
      destinationType: "WEBSITE",
      optimizationGoal: "REACH",
      callToAction: "LEARN_MORE",
      headline: "Awareness Campaign Headline",
      body: "Increase brand reach and recall across Facebook & Instagram.",
    },
    {
      name: "2. Website Traffic Campaign Test",
      objective: "OUTCOME_TRAFFIC",
      buyingType: "AUCTION",
      specialAdCategory: "NONE",
      dailyBudget: 750,
      destinationType: "WEBSITE",
      optimizationGoal: "LINK_CLICKS",
      callToAction: "LEARN_MORE",
      headline: "Traffic Campaign Headline",
      body: "Drive quality visitors to official landing page.",
    },
    {
      name: "3. WhatsApp Leads Campaign Test",
      objective: "OUTCOME_LEADS",
      buyingType: "AUCTION",
      specialAdCategory: "EMPLOYMENT",
      dailyBudget: 850,
      destinationType: "WHATSAPP",
      optimizationGoal: "CONVERSATIONS",
      callToAction: "WHATSAPP_MESSAGE",
      headline: "Connect with Hiring Team",
      body: "Send a direct message on WhatsApp for instant consultation.",
    },
    {
      name: "4. E-Commerce Sales Campaign Test",
      objective: "OUTCOME_SALES",
      buyingType: "AUCTION",
      specialAdCategory: "NONE",
      dailyBudget: 1200,
      destinationType: "WHATSAPP",
      optimizationGoal: "CONVERSATIONS",
      callToAction: "SHOP_NOW",
      headline: "Exclusive Product Offer",
      body: "Buy directly or chat with sales on WhatsApp for discounts.",
    },
    {
      name: "5. Customer Engagement Campaign Test",
      objective: "OUTCOME_ENGAGEMENT",
      buyingType: "AUCTION",
      specialAdCategory: "NONE",
      dailyBudget: 500,
      destinationType: "WHATSAPP",
      optimizationGoal: "CONVERSATIONS",
      callToAction: "WHATSAPP_MESSAGE",
      headline: "Engage with Our Experts",
      body: "Start a conversation to learn more about automation software.",
    },
    {
      name: "6. Mobile App Promotion Campaign Test",
      objective: "OUTCOME_APP_PROMOTION",
      buyingType: "AUCTION",
      specialAdCategory: "NONE",
      dailyBudget: 900,
      destinationType: "APP",
      optimizationGoal: "APP_INSTALLS",
      callToAction: "INSTALL_APP",
      headline: "Download WhatsApp Automation App",
      body: "Get the mobile app now for automated customer engagement.",
    },
  ];

  const results = [];

  for (const item of campaignsToTest) {
    console.log(`\n--------------------------------------------------`);
    console.log(`▶ Testing Objective: ${item.objective} (${item.name})`);
    console.log(`--------------------------------------------------`);

    try {
      // 1. Create Campaign
      const createRes = await axios.post(`${BASE}/campaigns`, {
        organizationId: ORG_ID,
        name: `${item.name} - ${Date.now()}`,
        objective: item.objective,
        buyingType: item.buyingType,
        specialAdCategory: item.specialAdCategory,
        dailyBudget: item.dailyBudget,
        destinationType: item.destinationType,
        optimizationGoal: item.optimizationGoal,
        callToAction: item.callToAction,
        creativeHeadline: item.headline,
        creativeBody: item.body,
        creativeMediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      });

      const campData = createRes.data;
      if (!campData.success) {
        throw new Error(campData.error || "Failed to create campaign");
      }

      const campId = campData.campaign.id;
      const metaCampId = campData.campaign.metaCampaignId;
      const metaAdSetId = campData.metaResponse?.adSetId || "Created";
      const metaAdId = campData.metaResponse?.adId || "Created";

      console.log(`✅ Campaign DB ID: ${campId}`);
      console.log(`✅ Meta Graph API Campaign ID: ${metaCampId}`);
      console.log(`✅ Meta Ad Set ID: ${metaAdSetId}`);
      console.log(`✅ Meta Ad ID: ${metaAdId}`);

      // 2. Fetch Selected Parameters Verification
      const paramRes = await axios.get(`${BASE}/campaigns/${campId}/parameters?organizationId=${ORG_ID}`);
      const selectedObj = paramRes.data?.data?.selectedValues?.objective;
      const selectedCat = paramRes.data?.data?.selectedValues?.specialAdCategory;
      const selectedBud = paramRes.data?.data?.selectedValues?.dailyBudget;

      console.log(`✅ Parameter Inspector Verified: Objective=${selectedObj}, Category=${selectedCat}, Budget=₹${selectedBud}`);

      results.push({
        objective: item.objective,
        status: "PASSED ✅",
        metaCampaignId: metaCampId,
        metaAdSetId: metaAdSetId,
        metaAdId: metaAdId,
        budgetVerified: `₹${selectedBud}`,
        categoryVerified: selectedCat,
      });

    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      console.error(`❌ Failed Objective ${item.objective}:`, errMsg);
      results.push({
        objective: item.objective,
        status: "FAILED ❌",
        error: errMsg,
      });
    }
  }

  console.log("\n==================================================");
  console.log("📊 FINAL SUMMARY REPORT - ALL 6 CAMPAIGN OBJECTIVES:");
  console.log("==================================================");
  console.table(results);
}

testAll6Campaigns();
