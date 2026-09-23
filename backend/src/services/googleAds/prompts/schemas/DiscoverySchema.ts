/**
 * DISCOVERY SCHEMA (CASE 1)
 */
export const DISCOVERY_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Conversational reply understanding the business and asking for missing business name, website, or primary desired outcome.",
  "suggestions": ["I want Online Sales", "I want more Client Leads & Calls", "I want Store Walk-ins", "I want App Downloads"],
  "campaignState": {
    "businessName": "string",
    "website": "string",
    "desiredOutcome": "string",
    "business": {
      "name": "string",
      "type": "string",
      "description": "string",
      "website": "string"
    }
  }
}`;
