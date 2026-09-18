/**
 * DEMAND GEN CAMPAIGN TYPE RULES
 */
export const DEMAND_GEN_TYPE_RULES = `### DEMAND GEN CAMPAIGN SPECIFIC RULES
When configuring or generating assets for DEMAND GEN:
1. Ad Copy:
   - Minimum 1 headline (<= 40 characters).
   - Minimum 1 description (<= 90 characters).
2. Creative Formats (adFormat: "SINGLE_IMAGE" | "VIDEO" | "CAROUSEL"):
   - Brand Logo: At least 1 square brand logo (1:1) is required.
   - If SINGLE_IMAGE: At least 1 marketing image asset.
   - If VIDEO: At least 1 YouTube video asset URL.
   - If CAROUSEL: At least 2 carousel cards with an image and headline.
3. Bidding:
   - Maximize conversions, Target CPA, Maximize conversion value, Target ROAS.`;
