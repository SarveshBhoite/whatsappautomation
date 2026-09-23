const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on("error", reject);
    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING CUSTOMER ISOLATION AUDIT TESTS ===\n");
  let passed = 0;
  let total = 0;

  function assert(condition, testName, details) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${testName}: ${details}`);
    }
  }

  // TEST A: Customer A profile -> Customer A data
  try {
    const resA = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/ai-guided/user-profile?orgId=demo-org-123&customerId=658-735-5041",
      method: "GET"
    });
    assert(
      resA.status === 200 && resA.body.customerId === "6587355041" && resA.body.businessName === "Account 6587355041",
      "A: Customer A profile -> Customer A data",
      JSON.stringify(resA.body)
    );
  } catch (e) {
    assert(false, "A: Customer A profile", e.message);
  }

  // TEST B & C: Customer B profile -> Customer B data or empty, NEVER Customer A profile
  try {
    const resB = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/ai-guided/user-profile?orgId=demo-org-123&customerId=779-100-4787",
      method: "GET"
    });
    const doesNotHaveAccountA = resB.body.customerId !== "6587355041" && resB.body.businessName !== "Account 6587355041";
    const preservesRequestedId = resB.body.customerId === "779-100-4787" || resB.body.customerId === "7791004787";
    assert(
      resB.status === 200 && doesNotHaveAccountA && preservesRequestedId,
      "B & C: Customer B profile -> Customer B safe data and NEVER Customer A",
      JSON.stringify(resB.body)
    );
  } catch (e) {
    assert(false, "B & C: Customer B profile", e.message);
  }

  // TEST D: Customer A drafts -> only Customer A drafts
  try {
    const resDraftsA = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/campaigns/drafts?orgId=demo-org-123&customerId=6587355041",
      method: "GET"
    });
    const draftsA = Array.isArray(resDraftsA.body) ? resDraftsA.body : [];
    const allA = draftsA.every(d => d.customerId === "6587355041" || d.customerId === "658-735-5041");
    assert(
      resDraftsA.status === 200 && allA,
      "D: Customer A drafts -> only Customer A drafts",
      `Total drafts: ${draftsA.length}, raw: ${JSON.stringify(draftsA)}`
    );
  } catch (e) {
    assert(false, "D: Customer A drafts", e.message);
  }

  // TEST E & F: Customer B drafts -> only Customer B drafts, default drafts NEVER leak
  try {
    const resDraftsB = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/campaigns/drafts?orgId=demo-org-123&customerId=7791004787",
      method: "GET"
    });
    const draftsB = Array.isArray(resDraftsB.body) ? resDraftsB.body : [];
    const hasDefault = draftsB.some(d => d.customerId === "default");
    const hasCustomerA = draftsB.some(d => d.customerId === "6587355041");
    assert(
      resDraftsB.status === 200 && !hasDefault && !hasCustomerA && draftsB.length === 0,
      "E & F: Customer B drafts -> no default drafts leak into Customer B",
      `Total drafts: ${draftsB.length}, raw: ${JSON.stringify(draftsB)}`
    );
  } catch (e) {
    assert(false, "E & F: Customer B drafts", e.message);
  }

  // TEST G: Valid Customer A mutation -> ownership passes
  try {
    // We send an invalid state or empty state without real campaign to verify that ownership validation passes (does not 403)
    const resMutA = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/ai-guided/create-campaign",
      method: "POST",
      headers: { "Content-Type": "application/json", "x-organization-id": "demo-org-123" }
    }, {
      customerId: "6587355041",
      campaignState: { campaignType: "SEARCH", campaignName: "Test Isolation Valid Ownership" }
    });
    // Since it's a mock state, ownership validation passes (status is not 403)
    assert(
      resMutA.status !== 403,
      "G: Valid Customer A mutation -> ownership check passes (not 403)",
      `Status: ${resMutA.status}, Body: ${JSON.stringify(resMutA.body)}`
    );
  } catch (e) {
    assert(false, "G: Valid Customer A mutation", e.message);
  }

  // TEST H: Invalid / unowned customerId -> rejected before Google Ads API mutation
  try {
    const resMutUnowned = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/ai-guided/create-campaign",
      method: "POST",
      headers: { "Content-Type": "application/json", "x-organization-id": "demo-org-123" }
    }, {
      customerId: "7791004787", // Valid format, but not owned by demo-org-123
      campaignState: { campaignType: "SEARCH", campaignName: "Test Unowned Mutation" }
    });
    assert(
      resMutUnowned.status === 403 && resMutUnowned.body.error && resMutUnowned.body.error.includes("Access denied"),
      "H: Invalid/unowned customerId -> rejected with 403 before Google Ads API mutation",
      `Status: ${resMutUnowned.status}, Body: ${JSON.stringify(resMutUnowned.body)}`
    );
  } catch (e) {
    assert(false, "H: Invalid/unowned customerId", e.message);
  }

  // TEST I: Different organization customerId -> rejected
  try {
    // Org 'non-existent-org' does not own 6587355041
    const resMutDiffOrg = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/campaigns/sales/search",
      method: "POST",
      headers: { "Content-Type": "application/json", "x-organization-id": "unauthorized-org-999" }
    }, {
      customerId: "6587355041",
      campaignName: "Test Sales Campaign Different Org"
    });
    assert(
      resMutDiffOrg.status === 403 && resMutDiffOrg.body.error && resMutDiffOrg.body.error.includes("Access denied"),
      "I: Different organization customerId -> rejected with 403",
      `Status: ${resMutDiffOrg.status}, Body: ${JSON.stringify(resMutDiffOrg.body)}`
    );
  } catch (e) {
    assert(false, "I: Different organization customerId", e.message);
  }

  // TEST J: Campaign status mutation with unowned customerId -> rejected
  try {
    const resStatus = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/ads/campaign/status",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, {
      orgId: "demo-org-123",
      campaignId: "non-existent-id",
      customerId: "7791004787",
      status: "PAUSED"
    });
    // It should fail with 404 (if campaign not found) or 403 (if unowned)
    assert(
      resStatus.status === 404 || resStatus.status === 403,
      "J: Campaign status mutation rejects unowned or missing campaigns safely",
      `Status: ${resStatus.status}, Body: ${JSON.stringify(resStatus.body)}`
    );
  } catch (e) {
    assert(false, "J: Campaign status mutation", e.message);
  }

  console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===\n`);
}

runTests();
