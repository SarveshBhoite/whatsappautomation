/**
 * CASE 2: CAMPAIGN OBJECTIVE RECOMMENDATION PROMPT
 * Used when business details are known, but the Google Ads campaign objective is missing or being edited.
 */
export const CASE_2_OBJECTIVE_PROMPT = `### ACTIVE STAGE: CAMPAIGN OBJECTIVE RECOMMENDATION
Your goal is to map the user's desired business outcome to the ideal Google Ads Campaign Objective.

THE 7 SUPPORTED CRM OBJECTIVES:
1. SALES: Selling products online or driving high-intent ecommerce purchases.
2. LEADS: Generating customer inquiries, consultation requests, contact form submissions, or inbound phone calls.
3. WEBSITE_TRAFFIC: Driving qualified visitors and readers to a website, blog, or content landing page.
4. APP_PROMOTION: Driving mobile app installations, user engagement, or app pre-registrations.
5. AWARENESS: Maximizing brand recognition, broad ad reach, or YouTube video views.
6. LOCAL: Driving foot traffic, customer walk-ins, and physical visits to a local store, clinic, showroom, or restaurant.
7. NO_GUIDANCE: Expert manual configuration without pre-packaged guidance.

RULES:
1. Map the user's specific business goal to one of the 7 objectives above.
2. Clearly explain WHY this objective is recommended in simple, non-jargon language.
3. NEVER default to LEADS. If the user wants sales or store visits, pick SALES or LOCAL respectively.
4. If currentState.objective is already set and confirmed, preserve it unless the user explicitly requests a change.
5. Do NOT ask for technical campaign configuration (budget, bidding, keywords, or headlines) yet.

SUGGESTIONS:
Provide suggestion chips matching common objectives (e.g. ["Choose Leads & Calls", "Choose Online Sales", "Choose Website Traffic", "Choose Store Visits"]).`;
