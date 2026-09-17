const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

const target = `    if (foundCities.length > 0) {
      MetaCampaignDraftService.setField(
        state.draft,
        "targeting.cities",
        foundCities,
        "USER",
        1.0,
        "User explicitly specified target cities"
      );`;

const replacement = `    if (foundCities.length > 0) {
      if (foundCities.includes("All India")) {
        foundCities = ["All India"];
      }
      MetaCampaignDraftService.setField(
        state.draft,
        "targeting.cities",
        foundCities,
        "USER",
        1.0,
        "User explicitly specified target cities"
      );`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully updated All India city deduplication!');
