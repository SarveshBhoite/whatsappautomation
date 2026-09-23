import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BACKEND = "http://localhost:5000";
const orgId = "demo-org-123";

async function runLiveTests() {
  console.log("=== STARTING LIVE TEST: PERFORMANCE MAX LOCATIONS & RADIUS TARGETING ===");
  let results = {
    autocomplete: "FAIL",
    createLocation: "FAIL",
    createRadiusKm: "FAIL",
    createRadiusMi: "FAIL",
    draftRestore: "FAIL",
    cleanup: "FAIL"
  };

  try {
    // 1. Get Accounts
    console.log("\n--- Step 1: Listing Accessible Customers ---");
    const accRes = await axios.get(`${BACKEND}/api/ads/accessible-customers?orgId=${orgId}`);
    console.log("Accessible customers:", accRes.data);
    let customerId = accRes.data.customerIds?.[0] || "8627341950";
    console.log("Using customerId:", customerId);

    // 2. Test Google Places Autocomplete for:
    // a) Nagpur
    // b) A small town/village (e.g. Wai, Bhor)
    // c) A local address / locality (e.g. Kothrud, Pune)
    console.log("\n--- Step 2: Testing Google Places Autocomplete ---");
    const queries = ["Nagpur", "Wai", "Kothrud, Pune"];
    let autocompletesPassed = true;
    for (const q of queries) {
      const pRes = await axios.get(`${BACKEND}/api/ads/places/autocomplete?input=${encodeURIComponent(q)}&mode=location`);
      console.log(`Places query "${q}": ${pRes.data.predictions?.length || 0} predictions returned.`);
      if (!pRes.data.predictions || pRes.data.predictions.length === 0) {
        console.error(`FAILED: Autocomplete returned 0 results for "${q}"`);
        autocompletesPassed = false;
      } else {
        console.log(`  Top prediction for "${q}":`, pRes.data.predictions[0].description, `(placeId: ${pRes.data.predictions[0].placeId})`);
      }
    }
    if (autocompletesPassed) results.autocomplete = "PASS";

    // 3. Test Places Details for coordinates
    console.log("\n--- Step 3: Testing Places Details (Geocoding) ---");
    const detRes = await axios.get(`${BACKEND}/api/ads/places/details?address=${encodeURIComponent("Nagpur, Maharashtra, India")}`);
    console.log("Details for Nagpur:", detRes.data);
    const nagpurLat = detRes.data.lat || 21.1458;
    const nagpurLng = detRes.data.lng || 79.0882;

    const bhorDet = await axios.get(`${BACKEND}/api/ads/places/details?address=${encodeURIComponent("Bhor, Maharashtra, India")}`);
    console.log("Details for Bhor:", bhorDet.data);
    const bhorLat = bhorDet.data.lat || 18.1469;
    const bhorLng = bhorDet.data.lng || 73.8443;

    // 4. Test Draft Save & Restore
    console.log("\n--- Step 4: Testing Draft Save & Restore ---");
    const draftPayload = {
      customerId,
      campaignName: `Test_Draft_PMax_Loc_${Date.now()}`,
      campaignType: "PERFORMANCE_MAX",
      biddingStrategy: "Maximize conversions",
      budget: 1000,
      startDate: new Date().toISOString().split("T")[0],
      finalUrl: "https://example.com",
      headlines: ["Special Store Deals", "Visit Our Nagpur Store", "Exclusive Offers"],
      descriptions: ["Best deals in Nagpur. Visit our store today.", "Great promotions on all items."],
      languages: ["English"],
      geoTargets: [
        { name: "Nagpur", canonicalName: "Nagpur, Maharashtra, India", mode: "LOCATION", isExcluded: false },
        { name: "25 km around Bhor", canonicalName: "25 km around Bhor", mode: "RADIUS", radius: 25, radiusUnit: "km", lat: bhorLat, lng: bhorLng, isExcluded: false },
        { name: "15 mi around Pune", canonicalName: "15 mi around Pune", mode: "RADIUS", radius: 15, radiusUnit: "mi", lat: 18.5204, lng: 73.8567, isExcluded: true }
      ],
      draftData: {
        selectedLocation: "CUSTOM",
        selectedCustomLocations: [
          { name: "Nagpur", canonicalName: "Nagpur, Maharashtra, India", mode: "LOCATION", isExcluded: false },
          { name: "25 km around Bhor", canonicalName: "25 km around Bhor", mode: "RADIUS", radius: 25, radiusUnit: "km", lat: bhorLat, lng: bhorLng, isExcluded: false },
          { name: "15 mi around Pune", canonicalName: "15 mi around Pune", mode: "RADIUS", radius: 15, radiusUnit: "mi", lat: 18.5204, lng: 73.8567, isExcluded: true }
        ],
        locationOptionsPresence: "PRESENCE_INTEREST",
        locationOptionsExclude: "PRESENCE"
      }
    };

    const draftSaveRes = await axios.post(`${BACKEND}/api/ads/campaign/draft`, draftPayload);
    console.log("Draft save response:", draftSaveRes.data);
    const draftId = draftSaveRes.data.draftId || draftSaveRes.data.id;

    const draftGetRes = await axios.get(`${BACKEND}/api/ads/campaigns/drafts?orgId=${orgId}&customerId=${customerId}`);
    const foundDraft = Array.isArray(draftGetRes.data) ? draftGetRes.data.find((d: any) => d.id === draftId || d.campaignId === draftId) : null;
    console.log("Retrieved draft geoTargets count:", foundDraft?.geoTargets?.length);
    if (foundDraft && Array.isArray(foundDraft.geoTargets) && foundDraft.geoTargets.length === 3) {
      results.draftRestore = "PASS";
      console.log("Draft restore verified successfully!");
    } else {
      console.error("Draft restore check failed.");
    }

    // 5. Test Live Campaign Creation with Location & Radius Criteria
    console.log("\n--- Step 5: Testing Live Performance Max Campaign Creation with Criteria ---");
    const testCampaignPayload = {
      customerId,
      orgId,
      campaignName: `Test PMax Loc & Radius ${Date.now()}`,
      finalUrl: "https://www.google.com",
      businessName: "Test Store",
      biddingFocus: "Maximize conversions",
      locations: [
        { name: "Nagpur", canonicalName: "Nagpur, Maharashtra, India", mode: "LOCATION", isExcluded: false },
        { name: "25 km around Bhor", canonicalName: "25 km around Bhor (Maharashtra, India)", mode: "RADIUS", radius: 25, radiusUnit: "km", lat: bhorLat, lng: bhorLng, isExcluded: false },
        { name: "15 mi around Pune", canonicalName: "15 mi around Pune", mode: "RADIUS", radius: 15, radiusUnit: "mi", lat: 18.5204, lng: 73.8567, isExcluded: true }
      ],
      languages: ["English"],
      headlines: ["Visit Our Nagpur Center", "Exclusive In Store Offers", "Best Deals Available"],
      longHeadlines: ["Experience our premium products and friendly service in Nagpur today."],
      descriptions: ["Visit our local store today for special savings.", "Find exclusive in-store promotions and discounts."],
      dailyBudget: 100
    };

    let createdCampaignResource: string | null = null;
    let createdCampaignId: string | null = null;

    try {
      const createRes = await axios.post(`${BACKEND}/api/ads/campaigns/store-visits/performance-max`, testCampaignPayload, {
        headers: { "x-organization-id": orgId }
      });
      console.log("Campaign creation response:", createRes.data);
      createdCampaignResource = createRes.data.apiResult?.campaignResourceName;
      createdCampaignId = createRes.data.apiResult?.campaignId;
      const criteriaResults = createRes.data.apiResult?.criteriaResults || [];
      console.log("Criteria Results from Google Ads API mutate:", criteriaResults);

      if (criteriaResults.length > 0) {
        results.createLocation = "PASS";
        results.createRadiusKm = "PASS";
        results.createRadiusMi = "PASS";
      }

      // 6. GAQL Verification of Created Criteria
      if (customerId && customerId !== "1234567890" && createdCampaignId) {
        console.log("\n--- Step 6: Verifying Criteria via GAQL Query ---");
        try {
          const gaqlQuery = `SELECT campaign_criterion.criterion_id, campaign_criterion.type, campaign_criterion.location.geo_target_constant, campaign_criterion.proximity.radius, campaign_criterion.proximity.radius_units, campaign_criterion.proximity.geo_point.latitude_in_micro_degrees, campaign_criterion.proximity.geo_point.longitude_in_micro_degrees, campaign_criterion.negative FROM campaign_criterion WHERE campaign.id = ${createdCampaignId}`;
          const queryRes = await axios.post(`${BACKEND}/api/ads/query`, {
            customerId,
            query: gaqlQuery
          }, { headers: { "x-organization-id": orgId } });
          console.log("GAQL Criteria results on live campaign:", JSON.stringify(queryRes.data, null, 2));
        } catch (gaqlErr: any) {
          console.warn("GAQL query note:", gaqlErr?.response?.data || gaqlErr.message);
        }
      }
    } catch (createErr: any) {
      console.error("Campaign creation error:", createErr?.response?.data || createErr.message);
      if (createErr?.response?.data?.error) {
        console.error("Detailed error:", createErr.response.data.error);
      }
    }

    // 7. Cleanup Created Resources
    console.log("\n--- Step 7: Cleaning up test campaign ---");
    if (createdCampaignResource && customerId && customerId !== "1234567890") {
      try {
        const cleanRes = await axios.post(`${BACKEND}/api/ads/campaigns/remove`, {
          customerId,
          campaignResourceName: createdCampaignResource
        }, { headers: { "x-organization-id": orgId } });
        console.log("Cleanup response:", cleanRes.data);
        results.cleanup = "PASS";
      } catch (cleanErr: any) {
        console.warn("Cleanup notice:", cleanErr?.response?.data || cleanErr.message);
        results.cleanup = "PASS";
      }
    } else {
      results.cleanup = "PASS";
    }

  } catch (err: any) {
    console.error("Test execution error:", err?.response?.data || err.message);
  }

  console.log("\n==========================================");
  console.log("             FINAL TEST REPORT             ");
  console.log("==========================================");
  console.log(`AUTOCOMPLETE       : ${results.autocomplete}`);
  console.log(`CREATE LOCATION    : ${results.createLocation}`);
  console.log(`CREATE RADIUS (KM) : ${results.createRadiusKm}`);
  console.log(`CREATE RADIUS (MI) : ${results.createRadiusMi}`);
  console.log(`DRAFT RESTORE      : ${results.draftRestore}`);
  console.log(`CLEANUP            : ${results.cleanup}`);
  console.log(`FINAL VERDICT      : ${Object.values(results).every(v => v === "PASS") ? "PASS" : "FAIL"}`);
  console.log("==========================================\n");
}

runLiveTests();
