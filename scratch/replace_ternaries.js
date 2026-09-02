const fs = require('fs');
let c = fs.readFileSync('frontend/src/app/ads/campaigns/create/sales/demand-gen/page.tsx', 'utf8');

c = c.replace('{demandGenStep === "AD_GROUP" ? (', '{demandGenStep === "AD_GROUP" && (');
c = c.replace(') : demandGenStep === "CAMPAIGN_SETTINGS" ? (', ')} {demandGenStep === "CAMPAIGN_SETTINGS" && (');
c = c.replace(') : demandGenStep === "AD" ? (', ')} {demandGenStep === "AD" && (');

fs.writeFileSync('frontend/src/app/ads/campaigns/create/sales/demand-gen/page.tsx', c, 'utf8');
console.log('Replaced ternaries with && blocks');
