import {
  CampaignNormalizationService,
  CampaignValidationError,
  CAMPAIGN_OBJECTIVE_COMPATIBILITY_MAP
} from "../src/services/googleAds/shared/CampaignNormalizationService";
import { GoogleAdsCampaignValidator } from "../src/services/googleAds/shared/GoogleAdsCampaignValidator";
import { CampaignPayloadBuilders, NormalizedCampaignContext } from "../src/services/googleAds/shared/CampaignPayloadBuilders";
import { validateCampaignAsset } from "../src/services/googleAds/shared/GoogleAdsAssetRules";

describe("Cross-Campaign Type and Objective Validation & Normalization Matrix Tests", () => {
  const baseSearchState = {
    customerId: "1234567890",
    campaignName: "Test Search Campaign",
    campaignType: "SEARCH",
    objective: "SALES",
    dailyBudget: "₹6,500",
    startDate: "2026-10-05",
    endDate: "2026-10-25",
    locations: ["India", "Mumbai"],
    languages: ["English", "Hindi"],
    biddingStrategy: "Target CPA",
    targetCpa: "₹560",
    website: "https://jisnudigital.com",
    headlines: ["Best Digital Solutions", "Transform Your Growth", "Proven ROI Today"],
    descriptions: ["Scale your customer acquisition with automated Google Ads strategies.", "Connect with top specialists for tailored business performance."],
    keywords: ["digital marketing agency", "b2b lead generation"]
  };

  describe("1. Strict Budget Parser", () => {
    it("correctly parses Indian Rupee format '₹6,500'", () => {
      const parsed = CampaignNormalizationService.parseBudget("₹6,500");
      expect(parsed).toBe(6500);
    });

    it("correctly parses rate strings like '6,500/day' and '500 per day'", () => {
      expect(CampaignNormalizationService.parseBudget("6,500/day")).toBe(6500);
      expect(CampaignNormalizationService.parseBudget("500 per day")).toBe(500);
    });

    it("rejects 0, negative values, NaN, and Infinity", () => {
      expect(() => CampaignNormalizationService.parseBudget(0)).toThrow(CampaignValidationError);
      expect(() => CampaignNormalizationService.parseBudget("-500")).toThrow(CampaignValidationError);
      expect(() => CampaignNormalizationService.parseBudget("invalid")).toThrow(CampaignValidationError);
      expect(() => CampaignNormalizationService.parseBudget(Infinity)).toThrow(CampaignValidationError);
    });
  });

  describe("2. Date Validation Before Budget Calculation", () => {
    it("accepts valid startDate and endDate and computes inclusive days", () => {
      const dates = CampaignNormalizationService.validateAndNormalizeDates("2026-10-01", "2026-10-10", "TOTAL");
      expect(dates.startDate).toBe("2026-10-01");
      expect(dates.endDate).toBe("2026-10-10");
      expect(dates.durationDays).toBe(10);
    });

    it("rejects endDate earlier than startDate without hiding via Math.max", () => {
      expect(() => {
        CampaignNormalizationService.validateAndNormalizeDates("2026-10-10", "2026-10-05", "DAILY");
      }).toThrow(/End date .* cannot be earlier than start date/);
    });

    it("requires endDate when budgetType is TOTAL", () => {
      expect(() => {
        CampaignNormalizationService.validateAndNormalizeDates("2026-10-01", undefined, "TOTAL");
      }).toThrow(/Campaign end date is required when using Campaign Total Budget/);
    });
  });

  describe("3. TOTAL vs DAILY Budget Capabilities", () => {
    it("allows TOTAL budget for supported campaign types (SEARCH, PMAX, DEMAND_GEN, SHOPPING)", () => {
      const dates = { startDate: "2026-10-01", endDate: "2026-10-10", durationDays: 10 };
      const searchRes = CampaignNormalizationService.normalizeBudget(
        { budgetType: "TOTAL", totalBudget: "10000", biddingStrategy: "MAXIMIZE_CONVERSIONS" },
        "SEARCH",
        dates
      );
      expect(searchRes.type).toBe("TOTAL");
      expect(searchRes.totalBudget).toBe(10000);
      expect(searchRes.dailyBudget).toBe(1000); // 10000 / 10 days
    });

    it("rejects TOTAL budget for DISPLAY campaigns in Google Ads API", () => {
      const dates = { startDate: "2026-10-01", endDate: "2026-10-10", durationDays: 10 };
      expect(() => {
        CampaignNormalizationService.normalizeBudget(
          { budgetType: "TOTAL", totalBudget: "10000" },
          "DISPLAY",
          dates
        );
      }).toThrow(/Campaign Total Budget \(CUSTOM_PERIOD\) is not supported for DISPLAY/);
    });

    it("rejects TOTAL budget for APP campaigns in Google Ads API", () => {
      const dates = { startDate: "2026-10-01", endDate: "2026-10-10", durationDays: 10 };
      expect(() => {
        CampaignNormalizationService.normalizeBudget(
          { budgetType: "TOTAL", totalBudget: "10000" },
          "APP",
          dates
        );
      }).toThrow(/Campaign Total Budget \(CUSTOM_PERIOD\) is not supported for APP/);
    });
  });

  describe("4. Bidding Strategy & Mutual Exclusivity", () => {
    it("normalizes UI bidding labels correctly", () => {
      const b1 = CampaignNormalizationService.normalizeBidding({ biddingStrategy: "Maximize conversions" }, "SEARCH", "DAILY");
      expect(b1.strategy).toBe("MAXIMIZE_CONVERSIONS");

      const b2 = CampaignNormalizationService.normalizeBidding({ biddingStrategy: "Target CPA", targetCpa: "500" }, "SEARCH", "DAILY");
      expect(b2.strategy).toBe("TARGET_CPA");
      expect(b2.targetCpa).toBe(500);
    });

    it("rejects when both Target CPA and Target ROAS are provided simultaneously", () => {
      expect(() => {
        CampaignNormalizationService.normalizeBidding(
          { biddingStrategy: "Maximize conversions", targetCpa: "500", targetRoas: "200%" },
          "SEARCH",
          "DAILY"
        );
      }).toThrow(/Target CPA and Target ROAS cannot both be specified simultaneously/);
    });

    it("rejects Target CPA when bidding strategy is Maximize Conversion Value", () => {
      expect(() => {
        CampaignNormalizationService.normalizeBidding(
          { biddingStrategy: "MAXIMIZE_CONVERSION_VALUE", targetCpa: "500" },
          "SEARCH",
          "DAILY"
        );
      }).toThrow(/Target CPA cannot be set when bidding strategy is MAXIMIZE_CONVERSION_VALUE/);
    });

    it("rejects Target ROAS when bidding strategy is Maximize Conversions", () => {
      expect(() => {
        CampaignNormalizationService.normalizeBidding(
          { biddingStrategy: "MAXIMIZE_CONVERSIONS", targetRoas: "350%" },
          "PERFORMANCE_MAX",
          "DAILY"
        );
      }).toThrow(/Target ROAS cannot be set when bidding strategy is MAXIMIZE_CONVERSIONS/);
    });
  });

  describe("5. Campaign Type + Objective Compatibility Matrix", () => {
    it("allows valid SEARCH objectives", () => {
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("SEARCH", "SALES")).not.toThrow();
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("SEARCH", "LEADS")).not.toThrow();
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("SEARCH", "WEBSITE_TRAFFIC")).not.toThrow();
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("SEARCH", "NO_GUIDANCE")).not.toThrow();
    });

    it("rejects unsupported objectives for SEARCH (e.g. APP_PROMOTION, AWARENESS)", () => {
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("SEARCH", "APP_PROMOTION")).toThrow(
        /Unsupported objective "APP_PROMOTION" for campaign type "SEARCH"/
      );
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("SEARCH", "AWARENESS")).toThrow(
        /Unsupported objective "AWARENESS" for campaign type "SEARCH"/
      );
    });

    it("allows only APP_PROMOTION for APP campaigns", () => {
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("APP", "APP_PROMOTION")).not.toThrow();
      expect(() => CampaignNormalizationService.validateObjectiveCompatibility("APP", "SALES")).toThrow(
        /Unsupported objective "SALES" for campaign type "APP"/
      );
    });

    it("normalizes aliases (NO-GUIDANCE -> NO_GUIDANCE, WEBSITE-TRAFFIC -> WEBSITE_TRAFFIC)", () => {
      expect(CampaignNormalizationService.normalizeObjective("NO-GUIDANCE")).toBe("NO_GUIDANCE");
      expect(CampaignNormalizationService.normalizeObjective("WITHOUT_GUIDANCE")).toBe("NO_GUIDANCE");
      expect(CampaignNormalizationService.normalizeObjective("WEBSITE-TRAFFIC")).toBe("WEBSITE_TRAFFIC");
      expect(CampaignNormalizationService.normalizeObjective("STORE-VISITS")).toBe("STORE_VISITS");
    });
  });

  describe("6. Language & Location Normalization", () => {
    it("separates UI 'All languages' from criteria array", () => {
      const res = CampaignNormalizationService.normalizeLanguages({ language: "All languages" });
      expect(res.unrestricted).toBe(true);
      expect(res.languages).toEqual(["All languages"]);
    });

    it("normalizes and deduplicates specific languages", () => {
      const res = CampaignNormalizationService.normalizeLanguages({ languages: ["Hindi, Bengali", "Hindi", "English"] });
      expect(res.unrestricted).toBe(false);
      expect(res.languages).toEqual(["Hindi", "Bengali", "English"]);
    });

    it("parses radius and location targeting", () => {
      const locRes = CampaignNormalizationService.normalizeLocations({ locations: ["25 km around Bengaluru", "Mumbai"] });
      expect(locRes.locations).toEqual(["25 km around Bengaluru", "Mumbai"]);
      expect(locRes.detailedLocations[0]).toEqual({
        name: "Bengaluru",
        radius: 25,
        radiusUnits: "KILOMETERS"
      });
      expect(locRes.detailedLocations[1]).toEqual({ name: "Mumbai" });
    });
  });

  describe("7. Regression Test: Existing Working Search Campaign", () => {
    it("validates the exact Jisnu Digital Search campaign specification", () => {
      const state = { ...baseSearchState };
      const campaignType = CampaignNormalizationService.normalizeCampaignType(state.campaignType);
      const objective = CampaignNormalizationService.normalizeObjective(state.objective);
      expect(campaignType).toBe("SEARCH");
      expect(objective).toBe("SALES");

      expect(() => CampaignNormalizationService.validateObjectiveCompatibility(campaignType, objective)).not.toThrow();

      const dates = CampaignNormalizationService.validateAndNormalizeDates(state.startDate, state.endDate, "DAILY");
      const budget = CampaignNormalizationService.normalizeBudget(state, campaignType, dates);
      const bidding = CampaignNormalizationService.normalizeBidding(state, campaignType, budget.type);
      const languages = CampaignNormalizationService.normalizeLanguages(state);
      const locations = CampaignNormalizationService.normalizeLocations(state);

      expect(budget.dailyBudget).toBe(6500);
      expect(bidding.strategy).toBe("TARGET_CPA");
      expect(bidding.targetCpa).toBe(560);
      expect(languages.languages).toEqual(["English", "Hindi"]);

      const validatorRes = GoogleAdsCampaignValidator.validate(state);
      expect(validatorRes.isValid).toBe(true);
      expect(validatorRes.errors).toHaveLength(0);
    });
  });

  describe("8. Zero Field Leakage Between Payload Builders", () => {
    it("ensures Search payload does not leak Shopping or App fields", () => {
      const ctx: NormalizedCampaignContext = {
        organizationId: "org-1",
        customerId: "1234567890",
        campaignType: "SEARCH",
        objective: "SALES",
        campaignName: "Test Search",
        budget: { type: "DAILY", amount: 1000, dailyBudget: 1000, effectiveDailyBudget: 1000, currencyCode: "INR" },
        dates: { startDate: "2026-10-01", endDate: "2026-10-31" },
        bidding: { strategy: "MAXIMIZE_CONVERSIONS", uiLabel: "Maximize conversions" },
        targeting: {
          locations: { locations: ["India"], detailedLocations: [{ name: "India" }] },
          languages: { unrestricted: true, languages: ["All languages"], rawInputs: [] }
        },
        assets: {
          headlines: ["Head 1", "Head 2", "Head 3"],
          longHeadlines: [],
          descriptions: ["Desc 1", "Desc 2"],
          images: [],
          logos: [],
          videos: []
        },
        rawState: {
          merchantCenterId: "12345", // Shopping field injected in state
          appId: "com.test.app", // App field injected in state
          networkSearch: true,
          networkDisplay: false
        }
      };

      const payload = CampaignPayloadBuilders.buildSearchPayload(ctx);
      expect((payload as any).merchantCenterId).toBeUndefined();
      expect((payload as any).appId).toBeUndefined();
      expect(payload.networkDisplay).toBe(false);
      expect(payload.networkSearch).toBe(true);
    });
  });

  describe("9. Display Campaign Image & Logo Asset System Tests", () => {
    describe("Display Images Validation", () => {
      it("1200 × 628 -> PASS (Landscape recommended)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 1200,
          height: 628,
          fileSizeBytes: 2 * 1024 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("landscape");
        expect(res.ratioLabel).toBe("1.91:1");
      });

      it("600 × 314 -> PASS (Landscape minimum)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 600,
          height: 314,
          fileSizeBytes: 1 * 1024 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("landscape");
        expect(res.ratioLabel).toBe("1.91:1");
      });

      it("1200 × 1200 -> PASS (Square recommended)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 1200,
          height: 1200,
          fileSizeBytes: 2 * 1024 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("square");
        expect(res.ratioLabel).toBe("1:1");
      });

      it("300 × 300 -> PASS (Square minimum)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 300,
          height: 300,
          fileSizeBytes: 500 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("square");
        expect(res.ratioLabel).toBe("1:1");
      });

      it("500 × 200 -> FAIL (Below minimum dimensions and ratio invalid)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 500,
          height: 200,
          fileSizeBytes: 1 * 1024 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.length).toBeGreaterThan(0);
      });

      it("200 × 200 -> FAIL (Below 300x300 minimum for square)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 200,
          height: 200,
          fileSizeBytes: 400 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.includes("minimum dimensions"))).toBe(true);
      });

      it("1200 × 500 -> FAIL (Invalid aspect ratio for Display)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 1200,
          height: 500,
          fileSizeBytes: 2 * 1024 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.includes("Aspect ratio") || e.includes("invalid"))).toBe(true);
      });

      it("6 MB -> FAIL (Exceeds maximum 5 MB)", () => {
        const res = validateCampaignAsset("DISPLAY", "IMAGE", {
          width: 1200,
          height: 628,
          fileSizeBytes: 6 * 1024 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.includes("5 MB"))).toBe(true);
      });
    });

    describe("Display Logos Validation", () => {
      it("1200 × 1200 -> PASS (Square logo recommended)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 1200,
          height: 1200,
          fileSizeBytes: 1 * 1024 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("square");
        expect(res.ratioLabel).toBe("1:1");
      });

      it("128 × 128 -> PASS (Square logo minimum)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 128,
          height: 128,
          fileSizeBytes: 100 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("square");
        expect(res.ratioLabel).toBe("1:1");
      });

      it("1200 × 300 -> PASS (Landscape logo recommended 4:1)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 1200,
          height: 300,
          fileSizeBytes: 1 * 1024 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("landscape");
        expect(res.ratioLabel).toBe("4:1");
      });

      it("512 × 128 -> PASS (Landscape logo minimum 4:1)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 512,
          height: 128,
          fileSizeBytes: 300 * 1024
        });
        expect(res.isValid).toBe(true);
        expect(res.format).toBe("landscape");
        expect(res.ratioLabel).toBe("4:1");
      });

      it("100 × 100 -> FAIL (Below 128x128 logo minimum)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 100,
          height: 100,
          fileSizeBytes: 200 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.includes("minimum dimensions"))).toBe(true);
      });

      it("400 × 100 -> FAIL (Below 512x128 logo minimum)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 400,
          height: 100,
          fileSizeBytes: 200 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.includes("minimum dimensions"))).toBe(true);
      });

      it("6 MB -> FAIL for logo (Exceeds maximum 5 MB)", () => {
        const res = validateCampaignAsset("DISPLAY", "LOGO", {
          width: 1200,
          height: 1200,
          fileSizeBytes: 6 * 1024 * 1024
        });
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.includes("5 MB"))).toBe(true);
      });
    });

    describe("Full Display Campaign Validator Rules", () => {
      it("validates compliant Display campaign state with landscape & square image and square logo", () => {
        const displayState = {
          customerId: "1234567890",
          campaignName: "Test Display Campaign",
          campaignType: "DISPLAY",
          objective: "SALES",
          dailyBudget: 1500,
          startDate: "2026-10-05",
          locations: ["India"],
          languages: ["English"],
          website: "https://jisnudigital.com",
          businessName: "Jisnu Digital",
          headlines: ["Scale Your Growth"],
          longHeadlines: ["Transform Your Business With Automated Google Display Ads"],
          descriptions: ["Award winning digital performance across Google Display Network."],
          images: [
            { url: "https://example.com/landscape.jpg", width: 1200, height: 628, aspectRatio: "1.91:1" },
            { url: "https://example.com/square.jpg", width: 1200, height: 1200, aspectRatio: "1:1" }
          ],
          logos: [
            { url: "https://example.com/logo.jpg", width: 1200, height: 1200, aspectRatio: "1:1" }
          ]
        };

        const res = GoogleAdsCampaignValidator.validate(displayState);
        expect(res.isValid).toBe(true);
        expect(res.errors).toHaveLength(0);
      });

      it("validates compliant Display campaign state with 4:1 landscape logo", () => {
        const displayState = {
          customerId: "1234567890",
          campaignName: "Test Display Campaign",
          campaignType: "DISPLAY",
          objective: "SALES",
          dailyBudget: 1500,
          startDate: "2026-10-05",
          locations: ["India"],
          languages: ["English"],
          website: "https://jisnudigital.com",
          businessName: "Jisnu Digital",
          headlines: ["Scale Your Growth"],
          longHeadlines: ["Transform Your Business With Automated Google Display Ads"],
          descriptions: ["Award winning digital performance across Google Display Network."],
          images: [
            { url: "https://example.com/landscape.jpg", width: 600, height: 314, aspectRatio: "1.91:1" },
            { url: "https://example.com/square.jpg", width: 300, height: 300, aspectRatio: "1:1" }
          ],
          logos: [
            { url: "https://example.com/logo-4x1.jpg", width: 1200, height: 300, aspectRatio: "4:1" }
          ]
        };

        const res = GoogleAdsCampaignValidator.validate(displayState);
        expect(res.isValid).toBe(true);
        expect(res.errors).toHaveLength(0);
      });

      it("validates compliant Display campaign state WITHOUT logos (logos are optional at launch)", () => {
        const displayStateNoLogo = {
          customerId: "1234567890",
          campaignName: "Test Display Campaign No Logo",
          campaignType: "DISPLAY",
          objective: "SALES",
          dailyBudget: 1500,
          startDate: "2026-10-05",
          locations: ["India"],
          languages: ["English"],
          website: "https://jisnudigital.com",
          businessName: "Jisnu Digital",
          headlines: ["Scale Your Growth"],
          longHeadlines: ["Transform Your Business With Automated Google Display Ads"],
          descriptions: ["Award winning digital performance across Google Display Network."],
          images: [
            { url: "https://example.com/landscape.jpg", width: 1200, height: 628, aspectRatio: "1.91:1" },
            { url: "https://example.com/square.jpg", width: 1200, height: 1200, aspectRatio: "1:1" }
          ],
          logos: [] // 0 logos -> completely optional!
        };

        const res = GoogleAdsCampaignValidator.validate(displayStateNoLogo);
        expect(res.isValid).toBe(true);
        expect(res.errors).toHaveLength(0);
      });

      it("blocks Display campaign missing landscape marketing image", () => {
        const displayState = {
          customerId: "1234567890",
          campaignName: "Test Display Campaign",
          campaignType: "DISPLAY",
          objective: "SALES",
          dailyBudget: 1500,
          startDate: "2026-10-05",
          locations: ["India"],
          languages: ["English"],
          website: "https://jisnudigital.com",
          businessName: "Jisnu Digital",
          headlines: ["Scale Your Growth"],
          longHeadlines: ["Transform Your Business With Automated Google Display Ads"],
          descriptions: ["Award winning digital performance across Google Display Network."],
          images: [
            { url: "https://example.com/square.jpg", width: 1200, height: 1200, aspectRatio: "1:1" }
          ],
          logos: [
            { url: "https://example.com/logo.jpg", width: 1200, height: 1200, aspectRatio: "1:1" }
          ]
        };

        const res = GoogleAdsCampaignValidator.validate(displayState);
        expect(res.isValid).toBe(false);
        expect(res.errors.some(e => e.code === "DISPLAY_MISSING_LANDSCAPE_IMAGE")).toBe(true);
      });

      it("ensures PMax and Search rules remain completely unaffected", () => {
        const searchState = {
          customerId: "1234567890",
          campaignName: "Test Search Campaign",
          campaignType: "SEARCH",
          objective: "SALES",
          dailyBudget: 1000,
          startDate: "2026-10-05",
          locations: ["India"],
          languages: ["English"],
          website: "https://jisnudigital.com",
          headlines: ["Headline 1", "Headline 2", "Headline 3"],
          descriptions: ["Description 1", "Description 2"],
          keywords: ["best agency"]
        };

        const res = GoogleAdsCampaignValidator.validate(searchState);
        expect(res.isValid).toBe(true);
        expect(res.errors).toHaveLength(0);
      });
    });
  });
});

