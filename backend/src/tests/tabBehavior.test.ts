import { LinkedInAIService } from "../services/aiService";
import assert from "assert";

async function testTabBehaviors() {
  console.log("=== TESTING TAB-SPECIFIC AI BEHAVIORS & REWRITE GUARDRAILS ===");
  const orgId = "demo-org-123";
  const EXACT_REFUSAL = "Please paste the content you would like me to rewrite, polish, or improve.";

  try {
    // 1. TEST POST GENERATOR TAB
    console.log("\n[TEST 1/3] Testing Post Generator Tab (New Content Creation)...");
    const genRes = await LinkedInAIService.generatePost(orgId, {
      topic: "Write a hiring post for a Staff Software Engineer",
      tone: "Professional"
    });
    assert.strictEqual(genRes.success, true);
    assert.strictEqual(genRes.mode, "Post Generator");
    assert.ok(genRes.text.length > 20, "Should generate post content from scratch");
    console.log("✅ TEST 1 PASSED: Post Generator created content from scratch.");

    // 2. TEST REWRITE & POLISH TAB GUARDRAIL REFUSALS
    console.log("\n[TEST 2A/3] Testing Rewrite Tab Refusals for Creation Commands...");
    const invalidPrompts = [
      "Write an email",
      "Write LinkedIn post",
      "Create blog",
      "Generate marketing copy",
      "Explain AI"
    ];

    for (const promptText of invalidPrompts) {
      const res = await LinkedInAIService.rewritePost(orgId, {
        content: promptText,
        mode: "professional"
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(
        res.text,
        EXACT_REFUSAL,
        `Prompt "${promptText}" must return exact refusal message`
      );
      console.log(`  ✓ Refused creation prompt: "${promptText}"`);
    }
    console.log("✅ TEST 2A PASSED: All creation commands correctly refused in Rewrite Tab.");

    // 3. TEST REWRITE & POLISH TAB WITH ACTUAL TEXT TO IMPROVE
    console.log("\n[TEST 2B/3] Testing Rewrite Tab with Actual Text to Improve...");
    const validRewriteText = `Rewrite this: "We are happy announce product launch today. It help business grow fast."`;
    const rewriteSuccess = await LinkedInAIService.rewritePost(orgId, {
      content: validRewriteText,
      mode: "professional"
    });
    assert.strictEqual(rewriteSuccess.success, true);
    assert.notStrictEqual(rewriteSuccess.text, EXACT_REFUSAL);
    assert.ok(rewriteSuccess.text.length > 10);
    console.log("✅ TEST 2B PASSED: Valid user text successfully rewritten.");
    console.log("    Rewritten Text:", rewriteSuccess.text.slice(0, 100).replace(/\n/g, " "), "...");

    // 4. TEST TEMPLATES TAB
    console.log("\n[TEST 3/3] Testing Templates Tab...");
    const templateRes = await LinkedInAIService.generateTemplate(orgId, {
      topic: "Cold Outreach Email Template"
    });
    assert.strictEqual(templateRes.success, true);
    assert.strictEqual(templateRes.mode, "Templates");
    assert.ok(templateRes.text.includes("[") && templateRes.text.includes("]"), "Template must contain bracketed placeholders");
    console.log("✅ TEST 3 PASSED: Templates returned reusable blueprint with placeholders.");

    console.log("\n🎉 ALL REWRITE GUARDRAIL AND TAB-SPECIFIC AI TESTS PASSED CLEANLY!");
  } catch (err: any) {
    console.error("❌ TEST SUITE FAILED:", err.message);
    process.exit(1);
  }
}

testTabBehaviors();
