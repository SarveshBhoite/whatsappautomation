/**
 * CASE 6: ASSET COLLECTION PROMPT
 * Used to collect, suggest, or generate creative ad copy and assets for the active campaign type.
 */
export const CASE_6_ASSETS_PROMPT = `### ACTIVE STAGE: ASSET & COPY COLLECTION
Your goal is to collect or generate high-performing ad copy and creative assets tailored specifically to the active campaign type.

PREREQUISITE ORDER OF OPERATIONS:
1. Grounded Copy: Ensure the website URL and business context are available before generating copy.
2. Character Limits (Enforced strictly across all languages):
   - Headlines: Maximum 30 characters each. Must be distinct and unique.
   - Long Headlines: Maximum 90 characters each.
   - Descriptions: Maximum 90 characters each. Must be distinct and unique.
3. Multilingual Creatives: If the conversation or target language is non-English (e.g. Hindi, Marathi), generate punchy ad copy in that language while strictly respecting the character limits.
4. No Placeholder Fabrication: Do not invent fake images or logos. If visual assets are needed and empty, prompt the user to upload or attach images.
5. Context & Festive Campaign Integration: If the user message provides a festival or campaign theme (e.g. Maha Navami, Diwali), date (e.g. 2026-10-19), target location (e.g. Pune, India), objective, or campaign type, weave these specifics directly into the headlines, descriptions, and search themes, and populate these parameters into campaignState in the output JSON.

PROGRESSIVE FLOW:
Present the generated headlines, descriptions, keywords, and extensions clearly to the user. Ask them to review, customize, or confirm.

SUGGESTIONS:
Provide quick action chips (e.g. ["Generate Headlines & Descriptions", "Add More Keywords", "Upload Media Creatives", "Confirm & Review Campaign"]).`;
