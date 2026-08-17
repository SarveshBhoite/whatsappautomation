const fs = require('fs');
const path = require('path');

const salesSearchFile = 'c:\\My Document C Drive\\JISNU\\whatsappautomation\\frontend\\src\\app\\ads\\campaigns\\create\\sales\\search\\page.tsx';
const appPromotionFile = 'c:\\My Document C Drive\\JISNU\\whatsappautomation\\frontend\\src\\app\\ads\\campaigns\\create\\app-promotion\\app\\page.tsx';

// Read both files
let salesCode = fs.readFileSync(salesSearchFile, 'utf8');
let appPromoCode = fs.readFileSync(appPromotionFile, 'utf8');

// 1. Extract Campaign Settings State from sales/search
const stateStartMarker = '// Step 2: Campaign Settings State';
const stateEndMarker = '// Search-Specific AI Max Settings State';
const stateStartIndex = salesCode.indexOf(stateStartMarker);
const stateEndIndex = salesCode.indexOf(stateEndMarker);

if (stateStartIndex === -1 || stateEndIndex === -1) {
  console.error("Could not find state markers in sales/search/page.tsx");
  process.exit(1);
}
const stateCodeToCopy = salesCode.substring(stateStartIndex, stateEndIndex);

// Also need the Collapsible sections toggle states (lines 87-106 approx)
const collapseStartMarker = '// Collapsible sections toggle states';
const collapseEndMarker = 'const presetBrandsList = [';
const collapseStartIndex = salesCode.indexOf(collapseStartMarker);
const collapseEndIndex = salesCode.indexOf(collapseEndMarker);
const collapseCodeToCopy = salesCode.substring(collapseStartIndex, collapseEndIndex);

const presetBrandsStart = salesCode.indexOf('const presetBrandsList = [');
const handlersMarker = '// Handlers';
const presetBrandsBlock = salesCode.substring(presetBrandsStart, salesCode.indexOf(handlersMarker));


// 2. Extract Campaign Settings JSX from sales/search
const jsxStartMarker = '{wizardStep === "CAMPAIGN_SETTINGS" && (';
const jsxEndMarker = '{wizardStep === "AI_MAX" && (';

let jsxStartIndex = salesCode.indexOf(jsxStartMarker);
let jsxEndIndex = salesCode.indexOf(jsxEndMarker);

const priorCloseBrace = salesCode.lastIndexOf(')}', jsxEndIndex);
const jsxCodeToCopy = salesCode.substring(jsxStartIndex, priorCloseBrace + 2);

// 3. Inject into app-promotion/app
const insertionPointForState = appPromoCode.indexOf('// Form Data State');
if (insertionPointForState === -1) {
    console.error("Could not find state insertion point in app-promotion");
    process.exit(1);
}
const endOfFormData = appPromoCode.indexOf('const [appSearchQuery, setAppSearchQuery]', insertionPointForState);

const newStateCode = '\n  ' + stateCodeToCopy + '\n  ' + collapseCodeToCopy + '\n  ' + presetBrandsBlock + '\n';
appPromoCode = appPromoCode.substring(0, endOfFormData) + newStateCode + appPromoCode.substring(endOfFormData);

// Disable the old CAMPAIGN_SETTINGS block in appPromoCode (we already did this in a previous step, so it starts with `{false && ( <>`)
const oldJsxStartMarker = '{false && ( <>\n            <div className="space-y-12 max-w-4xl">';
const targetJsxStartIndex = appPromoCode.indexOf(oldJsxStartMarker);
if (targetJsxStartIndex === -1) {
    // Maybe we just replace the whole CAMPAIGN_SETTINGS chunk.
    const altStart = appPromoCode.indexOf('{wizardStep === "CAMPAIGN_SETTINGS" && (');
    const altEnd = appPromoCode.indexOf('{/* ASSETS */}');
    const altClose = appPromoCode.lastIndexOf(')}', altEnd);
    appPromoCode = appPromoCode.substring(0, altStart) + jsxCodeToCopy + '\n\n          ' + appPromoCode.substring(altEnd);
} else {
    // If it is hidden, let's just insert the new code before it and we don't care about the hidden block anymore
    appPromoCode = appPromoCode.substring(0, targetJsxStartIndex) + jsxCodeToCopy + '\n\n          ' + appPromoCode.substring(targetJsxStartIndex);
}

fs.writeFileSync(appPromotionFile, appPromoCode);
console.log('Successfully migrated code!');
