/**
 * SHOPPING CAMPAIGN TYPE RULES
 */
export const SHOPPING_TYPE_RULES = `### SHOPPING CAMPAIGN SPECIFIC RULES
When configuring or generating assets for SHOPPING:
1. Google Merchant Center:
   - REQUIRED: merchantCenterId must be a valid numeric account ID (e.g. 5840531233). If missing, inform the user it is required for Shopping campaigns.
   - salesCountry (e.g. "IN") and feedLabel (e.g. "IN") are required.
2. Ad Copy:
   - Minimum 1 headline (<= 30 chars).
   - Minimum 1 description (<= 90 chars).
3. Product Targeting:
   - productGroupFilter: "Use all products" (default) or "Use a selection of products".
   - campaignPriority: "LOW" | "MEDIUM" | "HIGH".
4. Bidding:
   - Maximize conversion value (recommended default for Shopping), Target ROAS, Maximize clicks (with optional max CPC limit), or Manual CPC (requires adGroupBid).`;
