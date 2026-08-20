import { LinkedInAIService } from "../services/aiService";
import assert from "assert";

async function testAIHistoryModule() {
  console.log("=== TESTING LINKEDIN AI PROMPT HISTORY MODULE ===");

  const orgId = "demo-org-123";
  const testPrompt = `Automated Test Prompt - ${Date.now()}`;
  const testContent = `Automated Test Generated Content - ${Date.now()}`;

  try {
    // 1. Auto-save History
    console.log("\n[TEST 1/5] Testing Automatic History Saving...");
    const savedRecord = await LinkedInAIService.saveHistory({
      organizationId: orgId,
      userId: "test-user-001",
      prompt: testPrompt,
      generatedContent: testContent,
      mode: "Post Generator",
      tone: "Authoritative",
      model: "Groq-llama-3.3-70b-versatile"
    });

    assert.ok(savedRecord && savedRecord.id, "History record should be saved successfully");
    console.log("✅ TEST 1 PASSED: History record saved with ID:", savedRecord.id);

    // 2. Fetch History List
    console.log("\n[TEST 2/5] Testing History List Retrieval (Newest First)...");
    const listRes = await LinkedInAIService.getHistoryList(orgId);
    assert.strictEqual(listRes.success, true);
    assert.ok(Array.isArray(listRes.history));
    assert.ok(listRes.history.length > 0);
    assert.strictEqual(listRes.history[0].id, savedRecord.id);
    console.log("✅ TEST 2 PASSED: Newest record retrieved at top of list.");

    // 3. Search History List
    console.log("\n[TEST 3/5] Testing History Search Filter...");
    const searchRes = await LinkedInAIService.getHistoryList(orgId, testPrompt);
    assert.strictEqual(searchRes.success, true);
    assert.ok(searchRes.history.length >= 1);
    assert.strictEqual(searchRes.history[0].prompt, testPrompt);
    console.log("✅ TEST 3 PASSED: Search query successfully filtered history.");

    // 4. Fetch Single History Item
    console.log("\n[TEST 4/5] Testing Get History By ID...");
    const singleRes = await LinkedInAIService.getHistoryById(orgId, savedRecord.id);
    assert.strictEqual(singleRes.success, true);
    assert.strictEqual(singleRes.item?.prompt, testPrompt);
    console.log("✅ TEST 4 PASSED: Single history record retrieved cleanly.");

    // 5. Delete Single History Item
    console.log("\n[TEST 5/5] Testing Delete History Item...");
    const deleteRes = await LinkedInAIService.deleteHistoryById(orgId, savedRecord.id);
    assert.strictEqual(deleteRes.success, true);

    const recheckRes = await LinkedInAIService.getHistoryById(orgId, savedRecord.id);
    assert.strictEqual(recheckRes.success, false);
    console.log("✅ TEST 5 PASSED: History item deleted successfully.");

    console.log("\n🎉 ALL 5 AI PROMPT HISTORY TESTS PASSED CLEANLY!");
  } catch (err: any) {
    console.error("❌ TEST SUITE FAILED:", err.message);
    process.exit(1);
  }
}

testAIHistoryModule();
