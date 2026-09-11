const assert = require("assert");
const axios = require("axios");

// We can test MetaAdsCapabilityService and simulated sequential flow directly via node runner
const { MetaAdsCapabilityService } = require("./dist/services/meta-ads/metaAdsCapabilityService");

async function runTestSuite() {
  console.log("=================================================");
  console.log("🧪 RUNNING META MARKETING API VERIFICATION SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function it(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Test ODAX resolution for WhatsApp Leads
  it("Test 1: Resolve ODAX spec for OUTCOME_LEADS + WHATSAPP", () => {
    const spec = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_LEADS", "WHATSAPP");
    assert.strictEqual(spec.objective, "OUTCOME_LEADS");
    assert.strictEqual(spec.metaDestinationType, "WHATSAPP");
    assert.strictEqual(spec.optimizationGoal, "CONVERSATIONS");
    assert.strictEqual(spec.cta, "WHATSAPP_MESSAGE");
    assert.strictEqual(spec.requiresPagePromotedObject, true);
  });

  // 2. Test ODAX resolution for Phone Call
  it("Test 2: Resolve ODAX spec for OUTCOME_LEADS + PHONE_CALL", () => {
    const spec = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_LEADS", "PHONE_CALL");
    assert.strictEqual(spec.objective, "OUTCOME_LEADS");
    assert.strictEqual(spec.metaDestinationType, "PHONE_CALL");
    assert.strictEqual(spec.optimizationGoal, "LINK_CLICKS");
    assert.strictEqual(spec.cta, "CALL_NOW");
    assert.strictEqual(spec.requiresPagePromotedObject, true);
  });

  // 3. Test ODAX resolution for Traffic Website
  it("Test 3: Resolve ODAX spec for OUTCOME_TRAFFIC + WEBSITE", () => {
    const spec = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_TRAFFIC", "WEBSITE");
    assert.strictEqual(spec.objective, "OUTCOME_TRAFFIC");
    assert.strictEqual(spec.metaDestinationType, "WEBSITE");
    assert.strictEqual(spec.optimizationGoal, "LINK_CLICKS");
    assert.strictEqual(spec.cta, "LEARN_MORE");
  });

  // 4. Test ODAX resolution for Sales Website
  it("Test 4: Resolve ODAX spec for OUTCOME_SALES + WEBSITE", () => {
    const spec = MetaAdsCapabilityService.resolveAndValidateSpec("OUTCOME_SALES", "WEBSITE");
    assert.strictEqual(spec.objective, "OUTCOME_SALES");
    assert.strictEqual(spec.metaDestinationType, "WEBSITE");
    assert.strictEqual(spec.optimizationGoal, "OFFSITE_CONVERSIONS");
    assert.strictEqual(spec.cta, "SHOP_NOW");
    assert.strictEqual(spec.requiresPixelPromotedObject, true);
  });

  // 5. Simulated Flow: Final Ad creation failure must yield PARTIAL_CREATION
  it("Test 5: Ad failure classification (code 3, subcode 2859002) returns USER_ACTION_REQUIRED", () => {
    const { MetaCampaignExecutionService } = require("./dist/services/meta-ads/metaCampaignExecutionService");
    const mockErr = {
      response: {
        data: {
          error: {
            code: 3,
            error_subcode: 2859002,
            message: "You must certify compliance with our Non-discrimination Policy before running ads.",
            error_user_title: "Certification required",
            error_user_msg: "You must certify compliance with our Non-discrimination Policy before running ads. Visit facebook.com/certification/nondiscrimination to certify compliance.",
          },
        },
      },
    };
    const classified = MetaCampaignExecutionService.classifyMetaError(mockErr);
    assert.strictEqual(classified.category, "USER_ACTION_REQUIRED");
    assert.strictEqual(classified.code, 3);
    assert.strictEqual(classified.subcode, 2859002);
    assert.ok(classified.recovery.includes("Non-discrimination Policy certification"));
  });

  // 6. Test Token Redaction in Logging
  it("Test 6: sanitizeForLogging redacts all access tokens and keys", () => {
    const { MetaCampaignExecutionService } = require("./dist/services/meta-ads/metaCampaignExecutionService");
    const payload = {
      name: "Campaign 1",
      access_token: "EAAB_SECRET_ACCESS_TOKEN_12345",
      nested: {
        apiKey: "SECRET_KEY",
        value: 100,
      },
    };
    const sanitized = MetaCampaignExecutionService.sanitizeForLogging(payload);
    assert.strictEqual(sanitized.access_token, "[REDACTED_ACCESS_TOKEN]");
    assert.strictEqual(sanitized.nested.apiKey, "[REDACTED_ACCESS_TOKEN]");
    assert.strictEqual(sanitized.nested.value, 100);
  });

  console.log(`\nResults: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();
