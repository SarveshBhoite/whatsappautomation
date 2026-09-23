/**
 * REVIEW SCHEMA (CASE 7)
 */
export const REVIEW_SCHEMA = `OUTPUT JSON SCHEMA:
{
  "message": "Executive summary of the completed campaign ready for review, asking the user to confirm or make adjustments.",
  "suggestions": ["Launch Campaign Now", "Edit Budget", "Edit Headlines", "Change Location"],
  "campaignState": {
    "readyForReview": true,
    "readyForPublish": true
  }
}`;
