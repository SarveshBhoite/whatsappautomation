const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/app/ads/campaigns/create/ai-guided/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const results = [];
lines.forEach((line, idx) => {
  if (line.includes('Sparkle') || line.includes('✨')) {
    results.push({ lineNum: idx + 1, text: line.trim() });
  }
});

console.log(JSON.stringify(results, null, 2));
