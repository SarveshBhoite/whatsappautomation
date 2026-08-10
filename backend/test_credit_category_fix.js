const axios = require("axios");

const BASE = "http://localhost:5000/api/meta-ads";
const ORG_ID = "demo-org-123";

async function testCreditCategoryFix() {
  console.log("==================================================");
  console.log("🧪 TESTING SPECIAL AD CATEGORY: CREDIT -> FINANCIAL_PRODUCTS_SERVICES FIX");
  console.log("==================================================");

  try {
    const res = await axios.post(`${BASE}/campaigns`, {
      organizationId: ORG_ID,
      name: `Credit Special Category Test - ${Date.now()}`,
      objective: "OUTCOME_LEADS",
      buyingType: "AUCTION",
      specialAdCategory: "CREDIT",
      dailyBudget: 750,
      destinationType: "WHATSAPP",
      optimizationGoal: "CONVERSATIONS",
      callToAction: "WHATSAPP_MESSAGE",
      creativeHeadline: "Instant Financial & Personal Loans",
      creativeBody: "Apply for low-interest financial products directly on WhatsApp.",
      creativeMediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      targeting: { countries: ["IN"], ageMin: 18, ageMax: 65 },
    });

    console.log("✅ LIVE RESPONSE:");
    console.log(JSON.stringify(res.data, null, 2));

    if (res.data.success) {
      console.log("\n==================================================");
      console.log("🎉 SUCCESS: CREDIT SPECIAL AD CATEGORY CONVERTED AND ACCEPTED BY META GRAPH API V26.0!");
      console.log("==================================================");
    }
  } catch (err) {
    console.error("❌ Test Failed:", err.response?.data || err.message);
  }
}

testCreditCategoryFix();
