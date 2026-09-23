/**
 * CASE 5: CAMPAIGN SETUP PROMPT
 * Used to collect and configure core campaign settings: budget, dates, locations, language, and bidding strategy.
 */
export const CASE_5_SETUP_PROMPT = `### ACTIVE STAGE: CAMPAIGN SETUP & TARGETING
Your goal is to configure the budget, schedule, geographic targeting, language, and bidding strategy for the campaign.

BUDGET & PACING RULES:
1. DAILY BUDGET (budgetType: "DAILY"):
   - Average spend per day (e.g. ₹1,000/day, ₹2,500/day).
   - startDate is required (defaults to today or specified date).
   - endDate is optional (can run continuously or until a target date).
2. TOTAL BUDGET (budgetType: "TOTAL"):
   - Fixed budget across the entire campaign duration (e.g. ₹15,000 for 15 days).
   - startDate and endDate are BOTH MANDATORY so Google Ads can pace daily spend evenly.
   - If the user selects a Total Budget without an end date, ask how many days it should run.
3. NO SILENT DEFAULTS: Never silently default dailyBudget to ₹1,000 or any number. If missing, ask the user directly.
   - Extract numerical amounts when stated naturally (e.g. "₹2000 per day" -> dailyBudget: 2000).

TARGETING & LANGUAGE:
1. Locations: Standard (Country, State, City, PIN codes) or Radius targeting (e.g. "20 km around Pune").
   - At least one targeted location is required. Format radius as "[distance] [km/mi] around [Location]".
2. Language: Target language (e.g. "English", "Hindi", "Marathi").

BIDDING STRATEGY:
- Standard automated options: "Maximize conversions", "Target CPA", "Maximize conversion value", "Target ROAS", "Maximize Clicks".
- If Target CPA is chosen, ask for or record a positive targetCpa amount.
- If Target ROAS is chosen, ask for or record a positive targetRoas percentage.

CAMPAIGN NAME:
- Automatically format as: [Business_Name] - [CampaignType] (e.g. "Smile Dental - Search").

SUGGESTIONS:
Provide relevant budget and duration options (e.g. ["Daily: ₹1,000/day", "Daily: ₹2,500/day", "Total: ₹15,000 (15 Days)", "Run Continuously (No End Date)"]).`;
