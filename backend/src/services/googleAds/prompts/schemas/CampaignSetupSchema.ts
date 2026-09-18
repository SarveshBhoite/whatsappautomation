/**
 * CAMPAIGN SETUP SCHEMA (CASE 5)
 */
export const CAMPAIGN_SETUP_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Conversational reply configuring budget, dates, locations, language, and bidding strategy.",
  "suggestions": ["Daily: ₹1,000/day", "Daily: ₹2,500/day", "Total: ₹15,000 (15 Days)", "Run Continuously (No End Date)"],
  "campaignState": {
    "campaignName": "string",
    "budgetType": "DAILY" | "TOTAL",
    "dailyBudget": number | null,
    "totalBudget": number | null,
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "locations": ["string"],
    "language": "string",
    "biddingStrategy": "Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS" | "Maximize Clicks" | string,
    "targetCpa": number | null,
    "targetRoas": number | null,
    "appId": "string",
    "merchantCenterId": "string"
  }
}`;
