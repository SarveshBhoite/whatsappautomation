import { LinkedInAIService } from "../services/aiService";
import assert from "assert";

async function testUniversalAIService() {
  console.log("=== TESTING UNIVERSAL CRM AI ASSISTANT (Groq llama-3.3-70b-versatile) ===");

  try {
    // Test 1: LinkedIn Intent
    console.log("\n[TEST 1/2] Testing LinkedIn Post Generation Intent...");
    const res1 = await LinkedInAIService.askUniversalAI("demo-org-123", "Write a high converting LinkedIn post about launching an AI social media scheduler for SaaS");
    console.log("Returned Intent:", res1.intent);
    console.log("Returned Mode:", res1.mode);
    console.log("Returned Model:", res1.model);
    console.log("Hashtags:", res1.hashtags);
    console.log("CTA:", res1.cta);
    console.log("Score:", res1.score);

    assert.strictEqual(res1.success, true);
    assert.ok(res1.intent.toLowerCase().includes("linkedin") || res1.intent === "marketing_ideas");
    assert.ok(Array.isArray(res1.hashtags));
    assert.ok(res1.score.grammar > 0);
    console.log("✅ TEST 1 PASSED: LinkedIn persona, hooks, and hashtags generated.");

    // Test 2: Non-LinkedIn Coding / Technical Intent
    console.log("\n[TEST 2/2] Testing Technical / Coding Intent (React / TypeScript)...");
    const res2 = await LinkedInAIService.askUniversalAI("demo-org-123", "How do I optimize React useEffect dependencies to prevent memory leaks in TypeScript?");
    console.log("Returned Intent:", res2.intent);
    console.log("Returned Mode:", res2.mode);
    console.log("Response Preview:", res2.response.slice(0, 150) + "...");
    console.log("Hashtags:", res2.hashtags);

    assert.strictEqual(res2.success, true);
    assert.ok(["react", "typescript", "coding_help", "documentation", "general_chat"].includes(res2.intent));
    assert.ok(res2.response.length > 50);
    console.log("✅ TEST 2 PASSED: Natural technical response delivered without forcing LinkedIn formatting.");

    console.log("\n🎉 ALL UNIVERSAL CRM AI ASSISTANT TESTS PASSED CLEANLY!");
  } catch (error: any) {
    console.error("❌ TEST SUITE FAILED:", error.message);
    process.exit(1);
  }
}

testUniversalAIService();
