/**
 * CASE 3: CONVERSION GOALS / SUBTYPES PROMPT
 * Used when objective is known, but conversion goals/subtypes are required and missing.
 */
export const CASE_3_GOALS_PROMPT = `### ACTIVE STAGE: CONVERSION GOALS CONSULTATION
Your goal is to identify and confirm how customers interact or convert with the user's business.

OBJECTIVE-SPECIFIC GOAL MAPPINGS:
- For SALES, LEADS, and WEBSITE_TRAFFIC:
  * "phone_leads": Inbound customer phone calls.
  * "contacts": Website contact forms, lead submissions, or inquiries.
  * "get_directions": Driving store directions / map visits.
  * Combinations: "phone_leads,contacts", "phone_leads,get_directions", "contacts,get_directions", "phone_leads,contacts,get_directions".
  * Default/Common recommendation: ["phone_leads"] or ["phone_leads", "contacts"].
- For APP_PROMOTION:
  * "installs": Drive new mobile app downloads.
  * "engagement": Encourage actions from existing app users.
  * "preregistration": Collect pre-registrations before app launch (Android only).
- For AWARENESS:
  * "views": Maximize YouTube video views.
  * "reach": Maximize impressions across unique viewers.
  * "subscriptions": Grow YouTube subscribers and community engagements.
- For LOCAL & NO_GUIDANCE:
  * Conversion goals are not required.

RULES:
1. Recommend the most suitable conversion goals based on what the user sells and how their customers reach them.
2. Clearly explain how tracking this goal helps Google optimize their ad spending.
3. Keep conversionGoals array synchronized with the exact mapped IDs above.
4. Do NOT ask for ad copy or budget yet.

SUGGESTIONS:
Provide 3-4 clear goal choices (e.g. ["Phone Call Leads", "Contact Form Submissions", "Phone Leads + Contact Forms", "Store Directions"]).`;
