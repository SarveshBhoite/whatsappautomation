const fs = require('fs');
const { execSync } = require('child_process');

const headContent = execSync('git show HEAD:backend/src/services/meta-ads/metaAIConversationService.ts', { maxBuffer: 20 * 1024 * 1024 }).toString().replace(/\r\n/g, '\n');
const currentContent = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8').replace(/\r\n/g, '\n');

// 1. Get ad copy method from HEAD
const headAdCopyMatch = headContent.match(/  \/\*\*\n   \* Generates crisp, eye-catching production-grade Ad Copy:[\s\S]*?(?=\n  \/\*\*\n   \* Deterministic Campaign)/);
if (!headAdCopyMatch) {
  console.error('Failed to find headAdCopyMatch');
  process.exit(1);
}
const fullAdCopyMethod = headAdCopyMatch[0];

// 2. Get the new generateDeterministicNextStep method body from currentContent
const nextStepBodyIdx = currentContent.indexOf('// 1. Recover Brand Name and Promoted Service from Conversation if needed');
const nextStepEndMarker = 'state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);\n    return state;\n  }';
const nextStepFirstEndIdx = currentContent.indexOf(nextStepEndMarker, nextStepBodyIdx);
const nextStepBody = currentContent.substring(nextStepBodyIdx, nextStepFirstEndIdx + nextStepEndMarker.length - 3); // excluding closing brace

const fullDeterministicNextStepMethod = `  /**
   * Deterministic Campaign Guidance Engine:
   * Guarantees every single minor parameter is systematically gathered one question at a time
   * in the user's native language (Marathi, Hindi, Gujarati, English, etc.) with interactive chips.
   */
  static generateDeterministicNextStep(
    state: CampaignConversationState,
    detectedLang: DetectedLanguageInfo,
    userText: string = "",
    customPrefix: string = ""
  ): CampaignConversationState {
    const lang = detectedLang.code || "en";
    const style = MetaLanguageAnalyzerService.getLanguageStyle(detectedLang);
    ${nextStepBody}
  }`;

// 3. Get top of currentContent (up to before generateProductionAdCopy)
const adCopyHeaderIdx = currentContent.indexOf('  /**\n   * Generates crisp, eye-catching production-grade Ad Copy:');
const topContent = currentContent.substring(0, adCopyHeaderIdx);

// 4. Get autoDesignCampaignFromCreativeAndBudget method
const autoDesignHeaderIdx = currentContent.indexOf('  /**\n   * One-Shot Auto-Design: When user provides both Budget and Creative');
const bottomContent = currentContent.substring(autoDesignHeaderIdx);

const assembled = `${topContent}${fullAdCopyMethod}\n\n${fullDeterministicNextStepMethod}\n\n${bottomContent}`;

fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', assembled, 'utf8');
console.log('Successfully reassembled metaAIConversationService.ts! New length:', assembled.length);
