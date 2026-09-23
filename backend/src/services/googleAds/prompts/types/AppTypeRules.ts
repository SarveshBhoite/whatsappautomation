/**
 * APP CAMPAIGN TYPE RULES
 */
export const APP_TYPE_RULES = `### APP PROMOTION CAMPAIGN SPECIFIC RULES
When configuring or generating assets for APP:
1. Platform & App Identification:
   - platform: "ANDROID" | "IOS".
   - appStore: "GOOGLE_APP_STORE" | "APPLE_APP_STORE".
   - appId: REQUIRED real mobile package name (e.g. 'com.example.app') for Android, or numeric App Store ID (e.g. '123456789') for iOS. Never use fake dummy IDs like 'com.hubmate.app'.
2. Campaign Subtype:
   - "installs" (App installs), "engagement" (In-app actions), or "preregistration" (Android only).
3. Ad Copy:
   - Minimum 1 headline (<= 30 chars).
   - Minimum 1 description (<= 90 chars).
4. Bidding & Budget:
   - Target CPA is MANDATORY for App campaigns. Never leave 0 or null. Ask user for their target cost per install.
   - dailyBudget: Positive number in ₹.`;
