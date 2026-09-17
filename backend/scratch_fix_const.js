const fs = require('fs');

let code = fs.readFileSync('src/services/meta-ads/metaAIConversationService.ts', 'utf8');

code = code.replace(
  'const foundCities: string[] = [];',
  'let foundCities: string[] = [];'
);

fs.writeFileSync('src/services/meta-ads/metaAIConversationService.ts', code, 'utf8');
console.log('Successfully changed foundCities to let!');
