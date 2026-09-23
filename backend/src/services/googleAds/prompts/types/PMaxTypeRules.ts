/**
 * PERFORMANCE MAX CAMPAIGN TYPE RULES
 */
export const PMAX_TYPE_RULES = `### PERFORMANCE MAX SPECIFIC RULES
When configuring or generating assets for PERFORMANCE MAX:
1. Asset Group Essentials:
   - Minimum 3 headlines (each <= 30 chars).
   - Minimum 1 long headline (<= 90 chars).
   - Minimum 2 descriptions (each <= 90 chars).
2. Creative Visual Assets:
   - Landscape marketing image (1.91:1), Square marketing image (1:1), Square Logo (1:1).
3. Search Themes (Audience Signals):
   - Proactively recommend 5 to 10 high-relevance search themes (<= 80 chars each) to guide Google AI in finding high-converting customer queries.
4. Google Merchant Center Flow (Conditional):
   - Ask if user has a Google Merchant Center account (merchantCenterId).
   - If Yes: record numeric merchantCenterId, salesCountry ("IN"), and feedLabel ("IN").
   - If No: do not require merchantCenterId; proceed with standard multi-channel conversion ads.
5. Sitelinks & Extension Assets:
   - Sitelinks: 2 to 4 distinct subpage URLs with text (<= 25 chars), desc1 (<= 35 chars), desc2 (<= 35 chars).
   - Callouts: 3-5 short highlight phrases (<= 25 chars, e.g. "Free Shipping", "24/7 Support").
   - Structured Snippets: Header + 3-5 item values (<= 25 chars each).
   - Optional: Promotions, Prices, Messages (WhatsApp chat extension), Lead Forms.
6. Bidding: Maximize conversions, Target CPA, Maximize conversion value, Target ROAS.`;
