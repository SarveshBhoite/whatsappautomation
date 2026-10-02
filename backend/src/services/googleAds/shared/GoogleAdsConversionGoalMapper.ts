import axios from "axios";

export interface NormalizedConversionGoal {
  category: string;
  origin: string;
  biddable: boolean;
  resourceName?: string;
  originalGoal?: string;
}

export interface GoalMappingResult {
  mappedGoals: NormalizedConversionGoal[];
  appliedDescriptions: string[];
  skippedGoals: string[];
  goalConfigLevel: "CAMPAIGN_LEVEL" | "CUSTOMER_LEVEL (Inherited)";
  skipReason?: string | null;
}

export class GoogleAdsConversionGoalMapper {
  /**
   * Complete dictionary mapping frontend goal IDs and names to Google Ads API category & origin.
   */
  public static readonly GOAL_MAPPING_DICT: Record<string, { category: string; origin: string }> = {
    // Phone Call Leads
    "phone_leads": { category: "PHONE_CALL_LEAD", origin: "WEBSITE" },
    "phone call leads": { category: "PHONE_CALL_LEAD", origin: "WEBSITE" },
    "phone_call_leads": { category: "PHONE_CALL_LEAD", origin: "WEBSITE" },
    "phone_call_lead": { category: "PHONE_CALL_LEAD", origin: "WEBSITE" },

    // Contacts
    "contacts": { category: "CONTACT", origin: "WEBSITE" },
    "contact": { category: "CONTACT", origin: "WEBSITE" },

    // Get Directions / Store Visits
    "get_directions": { category: "GET_DIRECTIONS", origin: "GOOGLE_HOSTED" },
    "get directions": { category: "GET_DIRECTIONS", origin: "GOOGLE_HOSTED" },
    "store_visits": { category: "STORE_VISIT", origin: "STORE" },
    "store visits": { category: "STORE_VISIT", origin: "STORE" },

    // YouTube Engagements & Views
    "engagements": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "engagement": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "youtube follow-on views": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "youtube_follow_on_views": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "views": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "video views": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "video_views": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "subscriptions": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
    "reach": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },

    // Purchases & Ecommerce
    "purchase": { category: "PURCHASE", origin: "WEBSITE" },
    "purchases": { category: "PURCHASE", origin: "WEBSITE" },
    "add_to_cart": { category: "ADD_TO_CART", origin: "WEBSITE" },
    "begin_checkout": { category: "BEGIN_CHECKOUT", origin: "WEBSITE" },

    // Leads & Signups
    "submit_lead_form": { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE" },
    "lead": { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE" },
    "leads": { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE" },
    "sign_up": { category: "SIGNUP", origin: "WEBSITE" },
    "signup": { category: "SIGNUP", origin: "WEBSITE" }
  };

  /**
   * Normalizes raw goals input (string, comma-separated string, string[], or object[])
   * into an array of NormalizedConversionGoal objects.
   */
  public static normalizeGoals(conversionGoals: any): NormalizedConversionGoal[] {
    if (!conversionGoals) return [];

    let rawList: any[] = [];
    if (Array.isArray(conversionGoals)) {
      rawList = conversionGoals;
    } else if (typeof conversionGoals === "string") {
      rawList = conversionGoals.includes(",")
        ? conversionGoals.split(",").map(s => s.trim())
        : [conversionGoals.trim()];
    } else if (typeof conversionGoals === "object") {
      rawList = [conversionGoals];
    }

    // Flatten any comma-separated strings inside arrays
    const flattenedList: any[] = [];
    for (const item of rawList) {
      if (typeof item === "string" && item.includes(",")) {
        item.split(",").forEach(sub => flattenedList.push(sub.trim()));
      } else {
        flattenedList.push(item);
      }
    }

    const mappedGoals: NormalizedConversionGoal[] = [];
    const seenKeys = new Set<string>();

    for (const rg of flattenedList) {
      if (!rg) continue;

      if (typeof rg === "string") {
        const normKey = rg.trim().toLowerCase();
        const found = this.GOAL_MAPPING_DICT[normKey];
        if (found) {
          const uniqueKey = `${found.category}~${found.origin}`;
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            mappedGoals.push({
              category: found.category,
              origin: found.origin,
              biddable: true,
              originalGoal: rg
            });
          }
        }
      } else if (typeof rg === "object" && rg.category && rg.origin) {
        const uniqueKey = `${rg.category}~${rg.origin}`;
        if (!seenKeys.has(uniqueKey)) {
          seenKeys.add(uniqueKey);
          mappedGoals.push({
            category: String(rg.category).toUpperCase(),
            origin: String(rg.origin).toUpperCase(),
            biddable: rg.biddable !== undefined ? Boolean(rg.biddable) : true,
            resourceName: rg.resourceName,
            originalGoal: rg.originalGoal || `${rg.category} (${rg.origin})`
          });
        }
      }
    }

    return mappedGoals;
  }

  /**
   * Builds the campaignConversionGoals:mutate operations array.
   */
  public static buildMutateOperations(
    customerId: string,
    campaignResourceNameOrId: string,
    mappedGoals: NormalizedConversionGoal[]
  ): any[] {
    const cid = (customerId || "").replace(/-/g, "").trim();
    const campaignId = campaignResourceNameOrId.includes("/")
      ? campaignResourceNameOrId.split("/").pop()
      : campaignResourceNameOrId;

    const operations: any[] = [];
    for (const cg of mappedGoals) {
      const resourceName =
        cg.resourceName ||
        `customers/${cid}/campaignConversionGoals/${campaignId}~${cg.category}~${cg.origin}`;

      operations.push({
        update: {
          resourceName,
          biddable: cg.biddable
        },
        updateMask: "biddable"
      });
    }

    return operations;
  }

  /**
   * Applies campaign conversion goals to a campaign in Google Ads.
   * If mapped goals are empty, returns customer-level inheritance notice.
   */
  public static async applyCampaignConversionGoals(
    organizationId: string,
    customerId: string,
    campaignResourceName: string,
    conversionGoals: any,
    headers: any,
    serviceLoggerName: string = "GoogleAdsConversionGoalMapper"
  ): Promise<GoalMappingResult> {
    const ADS_BASE = "https://googleads.googleapis.com/v24";
    const cid = (customerId || "").replace(/-/g, "").trim();
    const mappedGoals = this.normalizeGoals(conversionGoals);

    const appliedDescriptions = mappedGoals.map(
      g => `${g.originalGoal || g.category} -> ${g.category} (${g.origin})`
    );

    if (mappedGoals.length === 0) {
      return {
        mappedGoals: [],
        appliedDescriptions: [],
        skippedGoals: Array.isArray(conversionGoals) ? conversionGoals.map(String) : [String(conversionGoals || "")],
        goalConfigLevel: "CUSTOMER_LEVEL (Inherited)",
        skipReason: "No campaign-level conversion goal overrides specified; inheriting customer-level conversion goals"
      };
    }

    try {
      const operations = this.buildMutateOperations(cid, campaignResourceName, mappedGoals);
      if (operations.length > 0) {
        await axios.post(
          `${ADS_BASE}/customers/${cid}/campaignConversionGoals:mutate`,
          { operations },
          { headers }
        );
        return {
          mappedGoals,
          appliedDescriptions,
          skippedGoals: [],
          goalConfigLevel: "CAMPAIGN_LEVEL",
          skipReason: null
        };
      }
    } catch (err: any) {
      const skipReason =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Campaign inherits account-level conversion goal settings";
      console.warn(`[${serviceLoggerName}] campaignConversionGoals mutate notice (inheriting customer-level goals):`, skipReason);
      return {
        mappedGoals,
        appliedDescriptions,
        skippedGoals: [],
        goalConfigLevel: "CUSTOMER_LEVEL (Inherited)",
        skipReason
      };
    }

    return {
      mappedGoals,
      appliedDescriptions,
      skippedGoals: [],
      goalConfigLevel: "CUSTOMER_LEVEL (Inherited)",
      skipReason: "Defaulted to customer level"
    };
  }

  /**
   * Maps App Promotion goal subtype to Google Ads App Campaign biddingStrategyGoalType enum.
   */
  public static resolveAppBiddingGoalType(conversionGoals: any, defaultGoal: string = "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST"): string {
    if (!conversionGoals) return defaultGoal;

    const rawStr = Array.isArray(conversionGoals)
      ? (conversionGoals[0] || "")
      : String(conversionGoals);
    const lower = String(rawStr).trim().toLowerCase();

    if (lower === "engagement" || lower === "app_engagement" || lower.includes("engagement")) {
      return "OPTIMIZE_IN_APP_CONVERSIONS_TARGET_CONVERSION_COST";
    }
    if (lower === "preregistration" || lower === "pre_registration" || lower.includes("preregistration") || lower.includes("pre-registration")) {
      return "OPTIMIZE_PRE_REGISTRATION_CONVERSION_VOLUME";
    }
    return "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST";
  }
}
