/**
 * CAMPAIGN TYPE SCHEMA (CASE 4)
 */
export const CAMPAIGN_TYPE_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Consultative comparison and recommendation of compatible campaign types with clear rationale.",
  "suggestions": ["Use Search Campaign", "Use Performance Max", "Use Shopping Campaign", "Use Demand Gen"],
  "campaignState": {
    "campaignType": "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "VIDEO" | "DEMAND_GEN" | "SHOPPING" | "APP",
    "recommendationReason": "string"
  }
}`;
