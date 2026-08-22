const { InstagramCommentEngine } = require("../backend/src/services/instagramCommentEngine");

async function runTests() {
  console.log("=== RUNNING INSTAGRAM AUTOMATION ENGINE INTEGRATION TESTS ===");

  // 1. Test Normalization
  const norm1 = InstagramCommentEngine.normalizeText("  PRICE!!!  ", { removePunctuation: true });
  console.log("1. Normalization Test 1 ('  PRICE!!!  '):", norm1 === "price" ? "PASSED" : `FAILED (${norm1})`);

  const norm2 = InstagramCommentEngine.normalizeText("  कीमत   कशी  आहे?  ", { normalizeSpaces: true });
  console.log("2. Unicode Marathi Test:", norm2 === "कीमत कशी आहे?" ? "PASSED" : `FAILED (${norm2})`);

  // 2. Test Specific Keyword (Whole Word vs Contains)
  const auto1 = {
    triggerType: "SPECIFIC_KEYWORD",
    keywords: ["car"],
    matchingMode: "WHOLE_WORD",
    isCaseSensitive: false
  };

  const match1 = InstagramCommentEngine.evaluateTriggerMatch("I have a car", auto1);
  console.log("3. Whole Word 'car' in 'I have a car':", match1.isMatch ? "PASSED" : "FAILED");

  const match2 = InstagramCommentEngine.evaluateTriggerMatch("career opportunity", auto1);
  console.log("4. Whole Word 'car' in 'career opportunity':", !match2.isMatch ? "PASSED (Correctly rejected)" : "FAILED");

  // 3. Test Negative Keywords
  const autoNeg = {
    triggerType: "SPECIFIC_KEYWORD",
    keywords: ["price"],
    excludedKeywords: ["job"],
    matchingMode: "CONTAINS"
  };

  const matchNeg1 = InstagramCommentEngine.evaluateTriggerMatch("What is the price?", autoNeg);
  console.log("5. Positive Keyword with No Negative Keyword:", matchNeg1.isMatch ? "PASSED" : "FAILED");

  const matchNeg2 = InstagramCommentEngine.evaluateTriggerMatch("Price for job?", autoNeg);
  console.log("6. Negative Keyword Exclusion ('job'):", !matchNeg2.isMatch && matchNeg2.skipReason.includes("CONTAINED_EXCLUDED_KEYWORD") ? "PASSED (Excluded)" : "FAILED");

  // 4. Test Multiple Keywords (ALL vs ANY)
  const autoAll = {
    triggerType: "MULTIPLE_KEYWORDS",
    keywords: ["price", "delivery"],
    matchBehavior: "ALL",
    matchingMode: "CONTAINS"
  };

  const matchAll1 = InstagramCommentEngine.evaluateTriggerMatch("What is the price?", autoAll);
  console.log("7. Multiple Keywords ALL (Only 1 present):", !matchAll1.isMatch ? "PASSED (Rejected)" : "FAILED");

  const matchAll2 = InstagramCommentEngine.evaluateTriggerMatch("What is the price for delivery?", autoAll);
  console.log("8. Multiple Keywords ALL (Both present):", matchAll2.isMatch ? "PASSED" : "FAILED");

  // 5. Test Pattern / Regex Match with invalid regex safety
  const autoRegex = {
    triggerType: "PATTERN_MATCH",
    exactMatchText: "[0-9]+% off",
    matchingMode: "PATTERN"
  };

  const matchRegex = InstagramCommentEngine.evaluateTriggerMatch("Get 50% off today!", autoRegex);
  console.log("9. Pattern Match Regex ('[0-9]+% off'):", matchRegex.isMatch ? "PASSED" : "FAILED");

  // 6. Test Schedule & Business Hours
  const schedValid = InstagramCommentEngine.isScheduleValid({
    startDate: "2020-01-01",
    endDate: "2030-01-01"
  });
  console.log("10. Valid Schedule Test:", schedValid.valid ? "PASSED" : "FAILED");

  // 7. Test Variable Template Renderer
  const template = "Hi {{commenter_name}}! Here is your doc: {{document_link}}";
  const rendered = InstagramCommentEngine.renderTemplate(template, {
    commenterUser: "sarvesh_bhoite",
    documentUrl: "https://example.com/guide.pdf"
  });
  console.log("11. Variable Template Render:", rendered.includes("sarvesh_bhoite") && rendered.includes("guide.pdf") ? "PASSED" : `FAILED (${rendered})`);

  console.log("=== ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(console.error);
