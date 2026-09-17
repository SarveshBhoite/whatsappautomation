const fs = require('fs');
const content = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8').replace(/\r\n/g, '\n');
const nextStepBodyIdx = content.indexOf('// 1. Recover Brand Name and Promoted Service from Conversation if needed');
const nextStepFirstEndIdx = content.indexOf('state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);\n    return state;\n  }', nextStepBodyIdx);
const nextStepCode = content.substring(nextStepBodyIdx, nextStepFirstEndIdx + 'state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);\n    return state;\n  }'.length);

console.log('nextStepCode length:', nextStepCode.length);
const matches = nextStepCode.match(/case "([^"]+)":/g) || [];
console.log('Cases in switch:', matches);
