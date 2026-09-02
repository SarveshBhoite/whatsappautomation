export type MetaObjective =
  | "OUTCOME_LEADS"
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_SALES"
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_AWARENESS"
  | "OUTCOME_APP_PROMOTION";

export type MetaDestinationType =
  | "WHATSAPP"
  | "INSTANT_FORM"
  | "WEBSITE"
  | "MESSENGER"
  | "INSTAGRAM_DM"
  | "PHONE_CALL"
  | "APP";

export interface ObjectiveCapability {
  objective: MetaObjective;
  supportedOptimizationGoals: string[];
  defaultOptimizationGoal: string;
  supportedDestinations: MetaDestinationType[];
  supportedCTAs: string[];
  defaultBillingEvent: string;
  supportsCBO: boolean;
}

export class MetaAdsCapabilityService {
  private static capabilities: Record<MetaObjective, ObjectiveCapability> = {
    OUTCOME_LEADS: {
      objective: "OUTCOME_LEADS",
      supportedOptimizationGoals: ["CONVERSATIONS", "LEAD_GENERATION", "QUALITY_LEADS", "LINK_CLICKS"],
      defaultOptimizationGoal: "CONVERSATIONS",
      supportedDestinations: ["WHATSAPP", "INSTANT_FORM", "WEBSITE", "MESSENGER", "PHONE_CALL"],
      supportedCTAs: ["WHATSAPP_MESSAGE", "APPLY_NOW", "GET_QUOTE", "LEARN_MORE", "CONTACT_US", "CALL_NOW"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_TRAFFIC: {
      objective: "OUTCOME_TRAFFIC",
      supportedOptimizationGoals: ["LINK_CLICKS", "LANDING_PAGE_VIEWS", "IMPRESSIONS"],
      defaultOptimizationGoal: "LINK_CLICKS",
      supportedDestinations: ["WEBSITE", "WHATSAPP", "MESSENGER", "PHONE_CALL"],
      supportedCTAs: ["LEARN_MORE", "WHATSAPP_MESSAGE", "CONTACT_US", "VISIT_WEBSITE"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_SALES: {
      objective: "OUTCOME_SALES",
      supportedOptimizationGoals: ["OFFSITE_CONVERSIONS", "VALUE", "LANDING_PAGE_VIEWS"],
      defaultOptimizationGoal: "OFFSITE_CONVERSIONS",
      supportedDestinations: ["WEBSITE", "WHATSAPP"],
      supportedCTAs: ["SHOP_NOW", "ORDER_NOW", "BUY_NOW", "WHATSAPP_MESSAGE"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_ENGAGEMENT: {
      objective: "OUTCOME_ENGAGEMENT",
      supportedOptimizationGoals: ["CONVERSATIONS", "POST_ENGAGEMENT", "PAGE_LIKES", "THRUPLAY"],
      defaultOptimizationGoal: "CONVERSATIONS",
      supportedDestinations: ["WHATSAPP", "MESSENGER", "INSTAGRAM_DM"],
      supportedCTAs: ["WHATSAPP_MESSAGE", "SEND_MESSAGE", "LEARN_MORE"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_AWARENESS: {
      objective: "OUTCOME_AWARENESS",
      supportedOptimizationGoals: ["REACH", "IMPRESSIONS", "AD_RECALL_LIFT", "THRUPLAY"],
      defaultOptimizationGoal: "REACH",
      supportedDestinations: ["WEBSITE", "INSTAGRAM_DM"],
      supportedCTAs: ["LEARN_MORE", "WATCH_MORE", "NO_BUTTON"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
    OUTCOME_APP_PROMOTION: {
      objective: "OUTCOME_APP_PROMOTION",
      supportedOptimizationGoals: ["APP_INSTALLS", "VALUE", "OFFSITE_CONVERSIONS"],
      defaultOptimizationGoal: "APP_INSTALLS",
      supportedDestinations: ["APP"],
      supportedCTAs: ["INSTALL_MOBILE_APP", "USE_MOBILE_APP", "PLAY_GAME", "DOWNLOAD"],
      defaultBillingEvent: "IMPRESSIONS",
      supportsCBO: true,
    },
  };

  /**
   * Get technical capabilities for a given Meta objective
   */
  static getCapability(objective: MetaObjective): ObjectiveCapability {
    return this.capabilities[objective] || this.capabilities.OUTCOME_LEADS;
  }

  /**
   * Minimum daily budget constraints by currency (Graph API constraints)
   */
  static getMinimumDailyBudget(currency: string = "INR"): number {
    const upper = currency.toUpperCase();
    switch (upper) {
      case "INR":
        return 100; // ₹100 minimum / day
      case "USD":
      case "EUR":
      case "GBP":
        return 1;
      case "AED":
        return 5;
      default:
        return 100;
    }
  }

  /**
   * Match high level user commercial goal to standard Meta ODAX objective
   */
  static resolveObjectiveFromGoal(goalText: string, destinationType?: string): MetaObjective {
    const clean = (goalText || "").toLowerCase();
    const dest = (destinationType || "").toUpperCase();

    if (dest === "WHATSAPP" || clean.includes("whatsapp") || clean.includes("appointment") || clean.includes("lead") || clean.includes("inquiry")) {
      return "OUTCOME_LEADS";
    }
    if (clean.includes("sale") || clean.includes("purchase") || clean.includes("ecommerce") || clean.includes("order")) {
      return "OUTCOME_SALES";
    }
    if (clean.includes("traffic") || clean.includes("visit") || clean.includes("click")) {
      return "OUTCOME_TRAFFIC";
    }
    if (clean.includes("engage") || clean.includes("message") || clean.includes("dm")) {
      return "OUTCOME_ENGAGEMENT";
    }
    if (clean.includes("app") || clean.includes("install") || clean.includes("download")) {
      return "OUTCOME_APP_PROMOTION";
    }
    if (clean.includes("aware") || clean.includes("reach") || clean.includes("brand")) {
      return "OUTCOME_AWARENESS";
    }

    return "OUTCOME_LEADS";
  }
}
