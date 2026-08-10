const axios = require("axios");

const BASE = "http://localhost:5000/api/meta-ads";
const ORG_ID = "demo-org-123";

async function runStrictBudgetAudit() {
  console.log("==================================================");
  console.log("🎯 STRICT USER BUDGET & PARAMETER AUDIT (ZERO FALLBACKS)");
  console.log("==================================================");

  const testCases = [
    { budget: 777, objective: "OUTCOME_AWARENESS", name: "User Custom Budget 777 Test" },
    { budget: 1200, objective: "OUTCOME_TRAFFIC", name: "User Custom Budget 1200 Test" },
    { budget: 945, objective: "OUTCOME_LEADS", name: "User Custom Budget 945 Test" },
  ];

  const results = [];

  for (const tc of testCases) {
    console.log(`\nTesting ${tc.name} (Budget: ₹${tc.budget}, Objective: ${tc.objective})...`);
    try {
      // 1. Create Campaign
      const createRes = await axios.post(`${BASE}/campaigns`, {
        organizationId: ORG_ID,
        name: `${tc.name} - ${Date.now()}`,
        objective: tc.objective,
        buyingType: "AUCTION",
        specialAdCategory: "NONE",
        dailyBudget: tc.budget,
        destinationType: "WEBSITE",
        optimizationGoal: "REACH",
        callToAction: "LEARN_MORE",
        creativeHeadline: "Strict User Budget Test",
        creativeBody: "Verifying exact parameter persistence.",
        creativeMediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        targeting: { countries: ["IN"], ageMin: 18, ageMax: 65 },
      });

      const campaignId = createRes.data?.campaign?.id;
      const metaId = createRes.data?.campaign?.metaCampaignId;

      // 2. Fetch Detail
      const detailRes = await axios.get(`${BASE}/campaigns/${campaignId}?organizationId=${ORG_ID}`);
      const campaign = detailRes.data?.campaign || detailRes.data;

      // 3. Fetch Inspector
      const paramRes = await axios.get(`${BASE}/campaigns/${campaignId}/parameters?organizationId=${ORG_ID}`);
      const sv = paramRes.data?.data?.selectedValues || {};

      const dbBudget = campaign.dailyBudget;
      const inspectorBudget = sv.dailyBudget;

      if (dbBudget === tc.budget && inspectorBudget === tc.budget) {
        console.log(`✅ PASSED: Selected ₹${tc.budget} -> DB: ₹${dbBudget}, Inspector: ₹${inspectorBudget}`);
        results.push({ name: tc.name, selected: `₹${tc.budget}`, db: `₹${dbBudget}`, inspector: `₹${inspectorBudget}`, status: "PASSED ✅" });
      } else {
        console.error(`❌ FAILED: Selected ₹${tc.budget} -> DB: ₹${dbBudget}, Inspector: ₹${inspectorBudget}`);
        results.push({ name: tc.name, selected: `₹${tc.budget}`, db: `₹${dbBudget}`, inspector: `₹${inspectorBudget}`, status: "FAILED ❌" });
      }

    } catch (err) {
      console.error(`❌ Error in ${tc.name}:`, err.response?.data || err.message);
      results.push({ name: tc.name, selected: `₹${tc.budget}`, db: "ERROR", inspector: "ERROR", status: "FAILED ❌" });
    }
  }

  console.log("\n==================================================");
  console.log("📊 STRICT USER BUDGET AUDIT RESULTS:");
  console.log("==================================================");
  console.table(results);
}

runStrictBudgetAudit();
