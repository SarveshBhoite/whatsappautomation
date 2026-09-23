/**
 * ASSET SCHEMA (CASE 6)
 */
export const ASSET_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Conversational reply presenting tailored ad copy, headlines, descriptions, keywords, and extensions.",
  "suggestions": ["Confirm Ad Copy", "Add More Keywords", "Upload Media Creatives", "Review & Launch"],
  "campaignState": {
    "objective": "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "APP_PROMOTION" | "AWARENESS" | "LOCAL" | "NO_GUIDANCE",
    "campaignType": "PERFORMANCE_MAX" | "SEARCH" | "DISPLAY" | "SHOPPING" | "DEMAND_GEN" | "VIDEO" | "APP",
    "campaignName": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "locations": ["string"],
    "language": "string",
    "biddingStrategy": "Maximize conversions" | "Maximize conversion value" | "Target CPA" | "Target ROAS" | string,
    "dailyBudget": number | null,
    "headlines": ["string"],
    "descriptions": ["string"],
    "longHeadlines": ["string"],
    "keywords": ["string"],
    "searchThemes": ["string"],
    "sitelinks": [
      {
        "text": "string",
        "desc1": "string",
        "desc2": "string",
        "url": "string"
      }
    ],
    "callouts": ["string"],
    "structuredSnippets": [
      {
        "header": "string",
        "values": ["string"]
      }
    ]
  }
}`;
