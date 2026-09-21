const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

const target = `    // Guard: ignore demographic, phone, budget, goal, or CTA option values
    if (
      selectedOption?.startsWith("AGE_") ||
      selectedOption?.startsWith("USE_PHONE_") ||
      selectedOption?.startsWith("BUDGET_") ||
      selectedOption?.startsWith("GOAL_") ||
      selectedOption?.startsWith("DESTINATION_") ||
      selectedOption?.startsWith("SPECIAL_AD_") ||
      selectedOption?.startsWith("INTEREST_") ||
      selectedOption?.startsWith("PLACEMENTS_") ||
      selectedOption === "ALL_INDIA" ||
      /(?:\\+?91[\\s-]?)?[6-9]\\d{9}/.test(text) ||
      /(?:लिंग|वर्ष|वय|आयु|साल|age|gender|years old|men only|women only|all genders)/i.test(text)
    ) {
      return { countries, cityConfigs, postalCodes, hasBulkData: false };
    }`;

const replacement = `    // Guard: ignore demographic, phone, budget, goal, CTA option values, or All India selection
    if (
      selectedOption?.startsWith("AGE_") ||
      selectedOption?.startsWith("USE_PHONE_") ||
      selectedOption?.startsWith("BUDGET_") ||
      selectedOption?.startsWith("GOAL_") ||
      selectedOption?.startsWith("DESTINATION_") ||
      selectedOption?.startsWith("SPECIAL_AD_") ||
      selectedOption?.startsWith("INTEREST_") ||
      selectedOption?.startsWith("PLACEMENTS_") ||
      selectedOption === "ALL_INDIA" ||
      selectedOption === "TARGET_ALL_INDIA" ||
      /^(?:📍\\s*)?(?:all india|pan india|poora bharat|sampurna bharat|संपूर्ण भारत|पूरा भारत)/i.test(text.trim()) ||
      /(?:\\+?91[\\s-]?)?[6-9]\\d{9}/.test(text) ||
      /(?:लिंग|वर्ष|वय|आयु|साल|age|gender|years old|men only|women only|all genders)/i.test(text)
    ) {
      return { countries, cityConfigs, postalCodes, hasBulkData: false };
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully updated parseBulkLocationInput guard for All India!');
