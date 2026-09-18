/**
 * ASSET SCHEMA (CASE 6)
 */
export const ASSET_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Conversational reply presenting tailored ad copy, headlines, descriptions, keywords, and extensions.",
  "suggestions": ["Confirm Ad Copy", "Add More Keywords", "Upload Media Creatives", "Review & Launch"],
  "campaignState": {
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
