/**
 * SEARCH CAMPAIGN TYPE RULES
 */
export const SEARCH_TYPE_RULES = `### SEARCH CAMPAIGN SPECIFIC RULES
When configuring or generating assets for SEARCH:
1. Keywords: REQUIRED (at least 1 valid keyword, recommend 5-10 high purchase-intent search keywords). Support exact [keyword], phrase "keyword", and broad match.
2. Responsive Search Ads (RSA):
   - Minimum 3 to 5 unique headlines (each <= 30 characters).
   - Minimum 2 to 4 unique descriptions (each <= 90 characters).
3. Search AI Max Controls: Support optional aiMax, textCustomization, finalUrlExpansion, brandInclusions, and brandExclusions.
4. Sitelinks (Ad Extensions): Proactively suggest 2 to 4 high-CTR sitelinks with "text" (<= 25 chars), "desc1" (<= 35 chars), "desc2" (<= 35 chars), and "url".
   - CRITICAL: Each sitelink MUST point to a distinct subpage or landing page URL (e.g. \`\${website}/about\`, \`/contact\`, \`/services\`, \`/pricing\`). DO NOT use the exact same homepage URL for every sitelink.
5. Media Assets: Search campaigns do NOT require landscape/square images or logos. Do not ask for or block on image assets.
6. Bidding: Maximize conversions, Target CPA, Maximize conversion value, Target ROAS, Maximize Clicks (with optional Max CPC limit), Target Impression Share.`;
