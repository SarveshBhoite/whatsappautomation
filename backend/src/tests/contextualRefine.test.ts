import { LinkedInAIService } from "../services/aiService";
import assert from "assert";

async function testContextualRefine() {
  console.log("=== TESTING CONTEXTUAL AI REFINE (FOLLOW-UP CHAT) ===");
  const orgId = "demo-org-123";

  try {
    // 1. Initial Post Generation
    console.log("\n[STEP 1] Generating initial post...");
    const initRes = await LinkedInAIService.generatePost(orgId, {
      topic: "Announcing new AI workflow automation suite for CRM",
      tone: "Professional"
    });
    assert.strictEqual(initRes.success, true);
    const firstContent = initRes.text;
    console.log("✓ Initial Content Generated:", firstContent.slice(0, 120).replace(/\n/g, " "), "...");

    // 2. Follow-up 1: "Make it shorter"
    console.log("\n[STEP 2] Sending contextual follow-up: 'Make it shorter'...");
    const refine1 = await LinkedInAIService.refineContent(orgId, {
      originalPrompt: "Announcing new AI workflow automation suite for CRM",
      lastGeneratedContent: firstContent,
      instruction: "Make it shorter"
    });
    assert.strictEqual(refine1.success, true);
    assert.ok(refine1.text.length > 10);
    console.log("✓ Refined Content (Shorter):", refine1.text.slice(0, 120).replace(/\n/g, " "), "...");

    // 3. Follow-up 2: "Translate to Marathi"
    console.log("\n[STEP 3] Sending contextual follow-up: 'Translate to Marathi'...");
    const refine2 = await LinkedInAIService.refineContent(orgId, {
      originalPrompt: "Announcing new AI workflow automation suite for CRM",
      lastGeneratedContent: refine1.text,
      instruction: "Translate to Marathi"
    });
    assert.strictEqual(refine2.success, true);
    assert.ok(refine2.text.length > 5);
    console.log("✓ Refined Content (Marathi):", refine2.text.slice(0, 120).replace(/\n/g, " "), "...");

    console.log("\n🎉 ALL CONTEXTUAL AI CHAT REFINE TESTS PASSED CLEANLY!");
  } catch (err: any) {
    console.error("❌ TEST SUITE FAILED:", err.message);
    process.exit(1);
  }
}

testContextualRefine();
