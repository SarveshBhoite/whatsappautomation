const fs = require('fs');
let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

const target = 'if (isGoalConsultation && (!state.draft.campaign.promotedService || !state.draft.campaign.name || /AI Meta Campaign|Meta Ad Campaign Blueprint/i.test(state.draft.campaign.name))) {';
const replacement = `if (isGoalConsultation && (!state.draft.campaign.promotedService || !state.draft.campaign.name || /AI Meta Campaign|Meta Ad Campaign Blueprint/i.test(state.draft.campaign.name))) {
      if (/sales|vikri|विक्री|बिक्री|sell/i.test(normalizedUserText)) {
        MetaCampaignDraftService.setField(state.draft, "campaign.objective", "OUTCOME_SALES", "USER", 0.95, "User indicated sales goal");
      } else if (/lead|inquir|ग्राहक|चौकशी/i.test(normalizedUserText)) {
        MetaCampaignDraftService.setField(state.draft, "campaign.objective", "OUTCOME_LEADS", "USER", 0.95, "User indicated leads goal");
      } else if (/traffic|website|व्हिजिट/i.test(normalizedUserText)) {
        MetaCampaignDraftService.setField(state.draft, "campaign.objective", "OUTCOME_TRAFFIC", "USER", 0.95, "User indicated traffic goal");
      } else {
        MetaCampaignDraftService.setField(state.draft, "campaign.objective", "OUTCOME_ENGAGEMENT", "USER", 0.95, "User indicated direct engagement goal");
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully updated isGoalConsultation objective setting!');
