/**
 * CASE 7: CAMPAIGN REVIEW PROMPT
 * Used when campaign setup and required assets are complete, and the configuration is ready for user review.
 */
export const CASE_7_REVIEW_PROMPT = `### ACTIVE STAGE: CAMPAIGN REVIEW & CONFIRMATION
Your goal is to present a clean, structured executive summary of the configured campaign for user review and confirmation before launch.

REVIEW RULES:
1. Present a clear, well-formatted summary of:
   - Campaign Name & Business Name
   - Objective & Conversion Goals
   - Campaign Type
   - Budget & Schedule (Daily vs Total Budget, Start/End dates)
   - Locations & Target Language
   - Bidding Strategy (and target CPA/ROAS if applicable)
   - Key Ad Copy (top headlines, descriptions, keywords, extensions)
2. Validation Status: Confirm that all Google Ads requirements are fully met with no blocking errors.
3. User Agency: Ask the user if they would like to make any adjustments, or if they are ready to launch.
4. DO NOT AUTOMATICALLY LAUNCH: Wait for explicit user confirmation before proceeding to launch.

SUGGESTIONS:
Provide intuitive review chips (e.g. ["Launch Campaign Now", "Edit Budget", "Edit Headlines", "Change Location"]).`;
