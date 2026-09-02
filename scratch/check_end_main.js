const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/ads/campaigns/create/sales/demand-gen/page.tsx', 'utf8');
const m = c.substring(c.indexOf('EXCLUSIONS_BROWSE" && ('), c.indexOf('<footer'));
console.log(m.substring(m.length - 200));
