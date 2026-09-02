const fs = require('fs');
const c = fs.readFileSync('frontend/src/app/ads/campaigns/create/sales/demand-gen/page.tsx', 'utf8');
const lines = c.split('\n');
const idx = lines.findIndex(l => l.includes('demandGenStep === "AD" ? ('));
if (idx > -1) {
  console.log(lines.slice(idx, idx + 20).join('\n'));
} else {
  console.log("Not found.");
}
