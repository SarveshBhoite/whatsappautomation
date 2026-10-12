import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GoogleAdsBaseService } from "../services/googleAds/shared/GoogleAdsBaseService";
import { DemandGenMinimumService } from "../services/googleAds/shared/DemandGenMinimumService";

describe("Demand Gen Budget Minimum Error Handling and Persistence", () => {
  const customerId = "1234567890";
  const organizationId = "org-test-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Scenario 1: Extracts structured minimum info when BUDGET_BELOW_PER_DAY_MINIMUM is returned
  it("Scenario 1: correctly extracts structured minimum budget info from Google Ads API error details", () => {
    const errorResponse = {
      response: {
        data: {
          error: {
            code: 400,
            message: "Request contains an invalid argument.",
            status: "INVALID_ARGUMENT",
            details: [
              {
                errors: [
                  {
                    errorCode: {
                      campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM"
                    },
                    message: "The budget amount is below the per day minimum of 417.84.",
                    trigger: {
                      int64Value: "100000000"
                    },
                    location: {
                      fieldPathElements: [
                        { fieldName: "operations", index: 0 },
                        { fieldName: "create" },
                        { fieldName: "amount_micros" }
                      ]
                    },
                    details: {
                      budgetPerDayMinimumErrorDetails: {
                        minimumBudgetAmountMicros: "417840000"
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    };

    const parsed = GoogleAdsBaseService.parseGoogleAdsBudgetError(errorResponse, {
      organizationId,
      customerId,
      currencyCode: "INR"
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.isBudgetBelowMinimum).toBe(true);
    expect(parsed?.errorCode).toBe("DEMAND_GEN_BUDGET_BELOW_MINIMUM");
    expect(parsed?.minimumBudgetAmountMicros).toBe("417840000");
    expect(parsed?.minimumBudgetUnits).toBe(417.84);
    expect(parsed?.currencyCode).toBe("INR");
    expect(parsed?.message).toContain("417.84");
  });

  // Scenario 2: Handles snake_case field variants from Google Ads API
  it("Scenario 2: handles snake_case field name variants (budget_per_day_minimum_error_details, minimum_budget_amount_micros)", () => {
    const snakeCaseError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: {
                    campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM"
                  },
                  details: {
                    budget_per_day_minimum_error_details: {
                      minimum_budget_amount_micros: "500000000"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    };

    const parsed = GoogleAdsBaseService.parseGoogleAdsBudgetError(snakeCaseError, {
      currencyCode: "USD"
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.isBudgetBelowMinimum).toBe(true);
    expect(parsed?.minimumBudgetAmountMicros).toBe("500000000");
    expect(parsed?.minimumBudgetUnits).toBe(500);
    expect(parsed?.currencyCode).toBe("USD");
  });

  // Scenario 3: Handles legacy misspelling bugdet variants
  it("Scenario 3: handles legacy Google Ads typo variants (minimumBugdetAmountMicros, minimum_bugdet_amount_micros)", () => {
    const typoError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: {
                    campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM"
                  },
                  details: {
                    budgetPerDayMinimumErrorDetails: {
                      minimumBugdetAmountMicros: "250000000"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    };

    const parsed = GoogleAdsBaseService.parseGoogleAdsBudgetError(typoError, {
      currencyCode: "EUR"
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.minimumBudgetAmountMicros).toBe("250000000");
    expect(parsed?.minimumBudgetUnits).toBe(250);
    expect(parsed?.currencyCode).toBe("EUR");
  });

  // Scenario 4: Persists observed minimum to in-memory cache and provides authoritative record
  it("Scenario 4: DemandGenMinimumService records observed minimum in memory with TTL and isAuthoritative flag", async () => {
    await DemandGenMinimumService.recordObservedMinimum(
      organizationId,
      customerId,
      "INR",
      "417840000"
    );

    const record = await DemandGenMinimumService.getMinimumForCustomer(
      organizationId,
      customerId,
      "INR"
    );

    expect(record).not.toBeNull();
    expect(record?.minimumAmount).toBe(417.84);
    expect(record?.minimumMicros).toBe("417840000");
    expect(record?.currencyCode).toBe("INR");
    expect(record?.isAuthoritative).toBe(true);
    expect(record?.source).toBe("GOOGLE_ADS_API_ERROR_DETAILS");
    expect(new Date(record!.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  // Scenario 5: Multiple currency isolation
  it("Scenario 5: DemandGenMinimumService isolates minimums by currency code correctly", async () => {
    await DemandGenMinimumService.recordObservedMinimum(
      organizationId,
      customerId,
      "USD",
      "5000000"
    );

    const usdRecord = await DemandGenMinimumService.getMinimumForCustomer(
      organizationId,
      customerId,
      "USD"
    );
    const eurRecord = await DemandGenMinimumService.getMinimumForCustomer(
      organizationId,
      customerId,
      "EUR"
    );

    expect(usdRecord?.minimumAmount).toBe(5);
    expect(usdRecord?.currencyCode).toBe("USD");
    expect(eurRecord).toBeNull();
  });

  // Scenario 6: Returns null for non-budget Google Ads errors (fallback behavior)
  it("Scenario 6: returns null when Google Ads returns other API errors so normal error handling applies", () => {
    const otherError = {
      response: {
        data: {
          error: {
            code: 400,
            message: "Headline too long",
            details: [
              {
                errors: [
                  {
                    errorCode: {
                      stringLengthError: "TOO_LONG"
                    },
                    message: "The string is too long."
                  }
                ]
              }
            ]
          }
        }
      }
    };

    const parsed = GoogleAdsBaseService.parseGoogleAdsBudgetError(otherError, {
      currencyCode: "INR"
    });

    expect(parsed).toBeNull();
  });

  // Scenario 7: Handles completely malformed or missing error payloads without throwing or crashing
  it("Scenario 7: handles empty, undefined, or unexpected error shapes without throwing or crashing", () => {
    expect(GoogleAdsBaseService.parseGoogleAdsBudgetError(null)).toBeNull();
    expect(GoogleAdsBaseService.parseGoogleAdsBudgetError(undefined)).toBeNull();
    expect(GoogleAdsBaseService.parseGoogleAdsBudgetError({})).toBeNull();
    expect(GoogleAdsBaseService.parseGoogleAdsBudgetError({ response: {} })).toBeNull();
    expect(GoogleAdsBaseService.parseGoogleAdsBudgetError({ response: { data: {} } })).toBeNull();
    expect(
      GoogleAdsBaseService.parseGoogleAdsBudgetError({
        response: { data: { details: "Not an array" } }
      })
    ).toBeNull();
  });
});
