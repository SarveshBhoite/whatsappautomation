import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GoogleAdsConversionGoalMapper } from "../src/services/googleAds/shared/GoogleAdsConversionGoalMapper";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GoogleAdsConversionGoalMapper & Conversion Goal Pipeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Goal Normalization (normalizeGoals)", () => {
    it("normalizes single string goal IDs correctly", () => {
      const goals1 = GoogleAdsConversionGoalMapper.normalizeGoals("phone_leads");
      expect(goals1).toEqual([
        {
          category: "PHONE_CALL_LEAD",
          origin: "WEBSITE",
          biddable: true,
          originalGoal: "phone_leads"
        }
      ]);

      const goals2 = GoogleAdsConversionGoalMapper.normalizeGoals("contacts");
      expect(goals2).toEqual([
        {
          category: "CONTACT",
          origin: "WEBSITE",
          biddable: true,
          originalGoal: "contacts"
        }
      ]);

      const goals3 = GoogleAdsConversionGoalMapper.normalizeGoals("get_directions");
      expect(goals3).toEqual([
        {
          category: "GET_DIRECTIONS",
          origin: "GOOGLE_HOSTED",
          biddable: true,
          originalGoal: "get_directions"
        }
      ]);
    });

    it("normalizes comma-separated string goals", () => {
      const goals = GoogleAdsConversionGoalMapper.normalizeGoals("phone_leads, contacts, purchase");
      expect(goals).toHaveLength(3);
      expect(goals[0].category).toBe("PHONE_CALL_LEAD");
      expect(goals[1].category).toBe("CONTACT");
      expect(goals[2].category).toBe("PURCHASE");
      expect(goals[2].origin).toBe("WEBSITE");
    });

    it("normalizes YouTube engagement and view goals", () => {
      const goals = GoogleAdsConversionGoalMapper.normalizeGoals(["engagements", "views", "reach", "youtube follow-on views"]);
      // Unique deduplicated by category~origin -> ENGAGEMENT~YOUTUBE_HOSTED
      expect(goals).toHaveLength(1);
      expect(goals[0]).toEqual({
        category: "ENGAGEMENT",
        origin: "YOUTUBE_HOSTED",
        biddable: true,
        originalGoal: "engagements"
      });
    });

    it("normalizes ecommerce and lead submission goals", () => {
      const goals = GoogleAdsConversionGoalMapper.normalizeGoals([
        "purchase",
        "submit_lead_form",
        "sign_up"
      ]);
      expect(goals).toHaveLength(3);
      expect(goals.map(g => g.category)).toEqual(["PURCHASE", "SUBMIT_LEAD_FORM", "SIGNUP"]);
      expect(goals.map(g => g.origin)).toEqual(["WEBSITE", "WEBSITE", "WEBSITE"]);
    });

    it("supports object arrays with category and origin", () => {
      const goals = GoogleAdsConversionGoalMapper.normalizeGoals([
        { category: "PURCHASE", origin: "WEBSITE", biddable: true },
        { category: "STORE_VISIT", origin: "STORE", biddable: false }
      ]);
      expect(goals).toHaveLength(2);
      expect(goals[0]).toEqual({
        category: "PURCHASE",
        origin: "WEBSITE",
        biddable: true,
        resourceName: undefined,
        originalGoal: "PURCHASE (WEBSITE)"
      });
      expect(goals[1]).toEqual({
        category: "STORE_VISIT",
        origin: "STORE",
        biddable: false,
        resourceName: undefined,
        originalGoal: "STORE_VISIT (STORE)"
      });
    });

    it("handles empty or unsupported goal lists gracefully", () => {
      expect(GoogleAdsConversionGoalMapper.normalizeGoals([])).toEqual([]);
      expect(GoogleAdsConversionGoalMapper.normalizeGoals("")).toEqual([]);
      expect(GoogleAdsConversionGoalMapper.normalizeGoals(null)).toEqual([]);
      expect(GoogleAdsConversionGoalMapper.normalizeGoals(undefined)).toEqual([]);
      expect(GoogleAdsConversionGoalMapper.normalizeGoals(["unsupported_random_goal"])).toEqual([]);
    });

    it("deduplicates identical category-origin pairs", () => {
      const goals = GoogleAdsConversionGoalMapper.normalizeGoals([
        "phone_leads",
        "phone call leads",
        "phone_call_leads"
      ]);
      expect(goals).toHaveLength(1);
      expect(goals[0].category).toBe("PHONE_CALL_LEAD");
    });
  });

  describe("Mutate Operations Builder (buildMutateOperations)", () => {
    it("constructs campaignConversionGoals:mutate operations with correct resourceName and updateMask", () => {
      const mappedGoals = [
        { category: "PHONE_CALL_LEAD", origin: "WEBSITE", biddable: true },
        { category: "CONTACT", origin: "WEBSITE", biddable: true }
      ];

      const ops = GoogleAdsConversionGoalMapper.buildMutateOperations(
        "123-456-7890",
        "customers/1234567890/campaigns/987654",
        mappedGoals
      );

      expect(ops).toEqual([
        {
          update: {
            resourceName: "customers/1234567890/campaignConversionGoals/987654~PHONE_CALL_LEAD~WEBSITE",
            biddable: true
          },
          updateMask: "biddable"
        },
        {
          update: {
            resourceName: "customers/1234567890/campaignConversionGoals/987654~CONTACT~WEBSITE",
            biddable: true
          },
          updateMask: "biddable"
        }
      ]);
    });
  });

  describe("App Promotion Bidding Strategy Goal Type Resolution (resolveAppBiddingGoalType)", () => {
    it("maps installs to OPTIMIZE_INSTALLS_TARGET_INSTALL_COST", () => {
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType("installs")).toBe("OPTIMIZE_INSTALLS_TARGET_INSTALL_COST");
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType(["app_installs"])).toBe("OPTIMIZE_INSTALLS_TARGET_INSTALL_COST");
    });

    it("maps engagement to OPTIMIZE_IN_APP_CONVERSIONS_TARGET_CONVERSION_COST", () => {
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType("engagement")).toBe("OPTIMIZE_IN_APP_CONVERSIONS_TARGET_CONVERSION_COST");
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType(["app_engagement"])).toBe("OPTIMIZE_IN_APP_CONVERSIONS_TARGET_CONVERSION_COST");
    });

    it("maps preregistration to OPTIMIZE_PRE_REGISTRATION_CONVERSION_VOLUME", () => {
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType("preregistration")).toBe("OPTIMIZE_PRE_REGISTRATION_CONVERSION_VOLUME");
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType("pre_registration")).toBe("OPTIMIZE_PRE_REGISTRATION_CONVERSION_VOLUME");
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType(["pre-registration"])).toBe("OPTIMIZE_PRE_REGISTRATION_CONVERSION_VOLUME");
    });

    it("defaults to OPTIMIZE_INSTALLS_TARGET_INSTALL_COST when empty", () => {
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType(null)).toBe("OPTIMIZE_INSTALLS_TARGET_INSTALL_COST");
      expect(GoogleAdsConversionGoalMapper.resolveAppBiddingGoalType([])).toBe("OPTIMIZE_INSTALLS_TARGET_INSTALL_COST");
    });
  });

  describe("Live Mutate Dispatcher (applyCampaignConversionGoals)", () => {
    it("successfully sends campaignConversionGoals:mutate request to Google Ads API v24", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          results: [
            { resourceName: "customers/1234567890/campaignConversionGoals/987654~PHONE_CALL_LEAD~WEBSITE" }
          ]
        }
      });

      const result = await GoogleAdsConversionGoalMapper.applyCampaignConversionGoals(
        "org-test-1",
        "123-456-7890",
        "customers/1234567890/campaigns/987654",
        ["phone_leads"],
        { Authorization: "Bearer test" },
        "TestService"
      );

      expect(result.goalConfigLevel).toBe("CAMPAIGN_LEVEL");
      expect(result.mappedGoals).toHaveLength(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://googleads.googleapis.com/v24/customers/1234567890/campaignConversionGoals:mutate",
        {
          operations: [
            {
              update: {
                resourceName: "customers/1234567890/campaignConversionGoals/987654~PHONE_CALL_LEAD~WEBSITE",
                biddable: true
              },
              updateMask: "biddable"
            }
          ]
        },
        { headers: { Authorization: "Bearer test" } }
      );
    });

    it("gracefully falls back to CUSTOMER_LEVEL (Inherited) when goal list is empty", async () => {
      const result = await GoogleAdsConversionGoalMapper.applyCampaignConversionGoals(
        "org-test-1",
        "123-456-7890",
        "customers/1234567890/campaigns/987654",
        [],
        { Authorization: "Bearer test" },
        "TestService"
      );

      expect(result.goalConfigLevel).toBe("CUSTOMER_LEVEL (Inherited)");
      expect(result.mappedGoals).toHaveLength(0);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("handles Google Ads API error without crashing and records inheritance notice", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            error: {
              message: "Cannot override customer-level goals for this campaign."
            }
          }
        }
      });

      const result = await GoogleAdsConversionGoalMapper.applyCampaignConversionGoals(
        "org-test-1",
        "123-456-7890",
        "customers/1234567890/campaigns/987654",
        ["purchase"],
        { Authorization: "Bearer test" },
        "TestService"
      );

      expect(result.goalConfigLevel).toBe("CUSTOMER_LEVEL (Inherited)");
      expect(result.skipReason).toBe("Cannot override customer-level goals for this campaign.");
    });
  });
});
