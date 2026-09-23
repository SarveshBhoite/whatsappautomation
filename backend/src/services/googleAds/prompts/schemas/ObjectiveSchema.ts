/**
 * OBJECTIVE SCHEMA (CASE 2)
 */
export const OBJECTIVE_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Conversational explanation recommending the ideal Google Ads objective and explaining why.",
  "suggestions": ["Choose Leads & Calls", "Choose Online Sales", "Choose Website Traffic", "Choose Store Visits"],
  "campaignState": {
    "objective": "SALES" | "LEADS" | "WEBSITE_TRAFFIC" | "APP_PROMOTION" | "AWARENESS" | "LOCAL" | "NO_GUIDANCE",
    "desiredOutcome": "string",
    "recommendationReason": "string"
  }
}`;
