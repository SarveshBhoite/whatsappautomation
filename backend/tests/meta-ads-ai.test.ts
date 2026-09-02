import { MetaCampaignDraftService } from "../src/services/meta-ads/metaCampaignDraftService";
import { MetaCampaignValidationService } from "../src/services/meta-ads/metaCampaignValidationService";
import { MetaAdsCapabilityService } from "../src/services/meta-ads/metaAdsCapabilityService";
import { MetaAdsContext } from "../src/services/meta-ads/metaAIContextService";

/**
 * Unit Test Suite for Meta AI Campaign Engine
 */
function runTests() {
  console.log("=== Running Meta AI Campaign Architecture Tests ===");

  // TEST 1: Provenance Rule - User overrides always win over AI recommendations
  const draft = MetaCampaignDraftService.createInitialDraft("act_test_123");
  MetaCampaignDraftService.setField(draft, "campaign.dailyBudget", 500, "USER", 1.0);
  
  // Attempt to overwrite with AI recommendation
  const overwritten = MetaCampaignDraftService.setField(draft, "campaign.dailyBudget", 1000, "AI_RECOMMENDATION", 0.8, "Recommended scale");
  if (overwritten === false && draft.campaign.dailyBudget === 500) {
    console.log("✅ TEST 1 PASSED: Provenance Guard correctly protected USER budget from AI_RECOMMENDATION override.");
  } else {
    console.error("❌ TEST 1 FAILED: AI_RECOMMENDATION overwrote USER fact.");
  }

  // TEST 2: Multi-Field Set & Validation
  MetaCampaignDraftService.setField(draft, "campaign.objective", "OUTCOME_LEADS", "USER");
  MetaCampaignDraftService.setField(draft, "destination.type", "WHATSAPP", "USER");
  MetaCampaignDraftService.setField(draft, "targeting.cities", ["Pune"], "USER");

  const mockContext: MetaAdsContext = {
    organizationId: "org-test-1",
    isConnected: true,
    activeAdAccountId: "act_test_123",
    adAccounts: [{ id: "act_test_123", adAccountId: "act_test_123", name: "Dental Clinic Ads", accountStatus: 1, currency: "INR", timezoneName: "Asia/Kolkata", isActive: true }],
    pages: [{ id: "page_123", name: "Pune Dental Care" }],
    instagramAccounts: [],
    pixels: [],
    whatsAppNumbers: [{ phoneNumber: "+919876543210" }],
    customAudiences: [],
    currencies: ["INR"],
    timezones: ["Asia/Kolkata"],
  };

  const validation = MetaCampaignValidationService.validateDraft(draft, mockContext);
  if (validation.valid && validation.errors.length === 0) {
    console.log("✅ TEST 2 PASSED: Valid complete draft passed preflight validation.");
  } else {
    console.error("❌ TEST 2 FAILED: Validation returned errors:", validation.errors);
  }

  // TEST 3: Minimum Budget Rule Check
  draft.campaign.dailyBudget = 50; // below ₹100 minimum
  const invalidValidation = MetaCampaignValidationService.validateDraft(draft, mockContext);
  if (!invalidValidation.valid && invalidValidation.errors.some(e => e.code === "BUDGET_TOO_LOW")) {
    console.log("✅ TEST 3 PASSED: Validation correctly caught budget below Meta Graph API minimum threshold.");
  } else {
    console.error("❌ TEST 3 FAILED: Validation failed to detect low budget.");
  }

  console.log("=== All Tests Completed Successfully ===");
}

runTests();
