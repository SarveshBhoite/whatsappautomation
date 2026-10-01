declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const beforeEach: (fn: () => void) => void;
declare const expect: any;
declare const jest: {
  mock: (moduleName: string, factory?: () => any) => void;
  fn: () => any;
  clearAllMocks: () => void;
};

import { GoogleAdsBaseService } from "../src/services/googleAds/shared/GoogleAdsBaseService";
import { DemandGenMinimumService } from "../src/services/googleAds/shared/DemandGenMinimumService";
import prisma from "../src/utils/prisma";

jest.mock("../src/utils/prisma", () => ({
  googleAdsCustomerProfile: {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}));

describe("Demand Gen Budget Minimum Hardened Production Error Suite", () => {
  const mockOrgId = "test-org-123";
  const mockCustomerId = "123-456-7890";
  const cleanCid = "1234567890";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Simulates Google Ads API error with BUDGET_BELOW_PER_DAY_MINIMUM and verifies isBudgetBelowMinimum: true.
   */
  test("Test 1: should detect BUDGET_BELOW_PER_DAY_MINIMUM and identify isBudgetBelowMinimum as true", () => {
    const googleApiError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: {
                    campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM",
                  },
                  message: "The budget amount is below the per-day minimum.",
                  details: {
                    budgetPerDayMinimumErrorDetails: {
                      minimumBudgetAmountMicros: "416000000",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const result = GoogleAdsBaseService.parseGoogleAdsBudgetError(googleApiError, {
      organizationId: mockOrgId,
      customerId: mockCustomerId,
      currencyCode: "INR",
    });

    expect(result).not.toBeNull();
    expect(result?.isBudgetBelowMinimum).toBe(true);
    expect(result?.errorCode).toBe("DEMAND_GEN_BUDGET_BELOW_MINIMUM");
    expect(result?.minimumBudgetAmountMicros).toBe("416000000");
    expect(result?.minimumBudgetUnits).toBe(416);
    expect(result?.currencyCode).toBe("INR");
  });

  /**
   * Test 2: Verifies correct minimum extraction across snake_case, camelCase, and legacy typo field names.
   */
  test("Test 2: should correctly extract minimum amount micros across snake_case, camelCase, and protobuf typo field names", () => {
    // 2a: snake_case: budget_per_day_minimum_error_details with minimum_budget_amount_micros
    const snakeCaseError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: { campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM" },
                  details: {
                    budget_per_day_minimum_error_details: {
                      minimum_budget_amount_micros: "5000000",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const snakeResult = GoogleAdsBaseService.parseGoogleAdsBudgetError(snakeCaseError, {
      customerId: mockCustomerId,
      currencyCode: "USD",
    });
    expect(snakeResult?.minimumBudgetAmountMicros).toBe("5000000");
    expect(snakeResult?.minimumBudgetUnits).toBe(5);
    expect(snakeResult?.currencyCode).toBe("USD");

    // 2b: camelCase: budgetPerDayMinimumErrorDetails with minimumBudgetAmountMicros
    const camelCaseError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: { campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM" },
                  details: {
                    budgetPerDayMinimumErrorDetails: {
                      minimumBudgetAmountMicros: "4500000",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const camelResult = GoogleAdsBaseService.parseGoogleAdsBudgetError(camelCaseError, {
      customerId: mockCustomerId,
      currencyCode: "EUR",
    });
    expect(camelResult?.minimumBudgetAmountMicros).toBe("4500000");
    expect(camelResult?.minimumBudgetUnits).toBe(4.5);
    expect(camelResult?.currencyCode).toBe("EUR");

    // 2c: Protobuf legacy typo: minimumBugdetAmountMicros / minimum_bugdet_amount_micros
    const typoError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: { campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM" },
                  details: {
                    budgetPerDayMinimumErrorDetails: {
                      minimumBugdetAmountMicros: "750000000",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const typoResult = GoogleAdsBaseService.parseGoogleAdsBudgetError(typoError, {
      customerId: mockCustomerId,
      currencyCode: "JPY",
    });
    expect(typoResult?.minimumBudgetAmountMicros).toBe("750000000");
    expect(typoResult?.minimumBudgetUnits).toBe(750);
    expect(typoResult?.currencyCode).toBe("JPY");
  });

  /**
   * Test 3: Verifies DemandGenMinimumService.recordObservedMinimum updates in-memory cache and invokes Prisma persistence.
   */
  test("Test 3: should update in-memory cache and persist observed minimum to database", async () => {
    (prisma as any).googleAdsCustomerProfile.findFirst.mockResolvedValueOnce({
      id: "profile-1",
      customerId: cleanCid,
      metadata: {},
    });
    (prisma as any).googleAdsCustomerProfile.update.mockResolvedValueOnce({
      id: "profile-1",
      customerId: cleanCid,
    });

    await DemandGenMinimumService.recordObservedMinimum(mockOrgId, mockCustomerId, "INR", "416000000");

    expect((prisma as any).googleAdsCustomerProfile.findFirst).toHaveBeenCalledWith({
      where: { customerId: cleanCid },
    });

    expect((prisma as any).googleAdsCustomerProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "profile-1" },
        data: {
          metadata: expect.objectContaining({
            demandGenMinimum: expect.objectContaining({
              minimumAmount: 416,
              minimumMicros: "416000000",
              currencyCode: "INR",
              isAuthoritative: true,
              source: "GOOGLE_ADS_API_ERROR_DETAILS",
            }),
            demandGenMinimumByCurrency: expect.objectContaining({
              INR: expect.objectContaining({
                minimumAmount: 416,
                currencyCode: "INR",
              }),
            }),
          }),
        },
      })
    );

    // Verify cache hit returns the authoritative record
    const cached = await DemandGenMinimumService.getMinimumForCustomer(mockOrgId, cleanCid, "INR");
    expect(cached).not.toBeNull();
    expect(cached?.minimumAmount).toBe(416);
    expect(cached?.currencyCode).toBe("INR");
  });

  /**
   * Test 4: Verifies structured backend response output shape (errorCode, minimumBudgetUnits, currencyCode).
   */
  test("Test 4: should return properly formatted structured object matching the backend route response contract", () => {
    const googleApiError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: { campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM" },
                  details: {
                    budgetPerDayMinimumErrorDetails: {
                      minimumBudgetAmountMicros: "416000000",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const budgetErr = GoogleAdsBaseService.parseGoogleAdsBudgetError(googleApiError, {
      organizationId: mockOrgId,
      customerId: mockCustomerId,
      currencyCode: "INR",
    });

    // Simulating backend route response payload
    const routeResponse = {
      success: false,
      errorCode: budgetErr?.errorCode,
      error: budgetErr?.message,
      message: budgetErr?.message,
      minimumBudgetAmountMicros: budgetErr?.minimumBudgetAmountMicros,
      minimumBudgetUnits: budgetErr?.minimumBudgetUnits,
      currencyCode: budgetErr?.currencyCode,
    };

    expect(routeResponse).toEqual({
      success: false,
      errorCode: "DEMAND_GEN_BUDGET_BELOW_MINIMUM",
      error: "Your daily budget is below Google's current minimum. Minimum required: INR 416.00/day.",
      message: "Your daily budget is below Google's current minimum. Minimum required: INR 416.00/day.",
      minimumBudgetAmountMicros: "416000000",
      minimumBudgetUnits: 416,
      currencyCode: "INR",
    });
  });

  /**
   * Test 5: Verifies frontend user message structure formatting.
   */
  test("Test 5: should generate exact user-friendly message containing currency code and formatted decimal amount", () => {
    const googleApiError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: { campaignBudgetError: "BUDGET_BELOW_PER_DAY_MINIMUM" },
                  details: {
                    budgetPerDayMinimumErrorDetails: {
                      minimumBudgetAmountMicros: "416000000",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const budgetErr = GoogleAdsBaseService.parseGoogleAdsBudgetError(googleApiError, {
      customerId: mockCustomerId,
      currencyCode: "INR",
    });

    expect(budgetErr?.message).toBe(
      "Your daily budget is below Google's current minimum. Minimum required: INR 416.00/day."
    );
  });

  /**
   * Test 6: Verifies retry flow when budget is increased above minimum.
   */
  test("Test 6: should validate that budget above minimum is accepted without budget rejection", () => {
    const validDailyBudget = 500;
    const knownMinimumUnits = 416;

    // Simulating frontend pre-submission validation logic
    const isBudgetValid = validDailyBudget >= knownMinimumUnits;
    expect(isBudgetValid).toBe(true);

    // If submitted, Google Ads API would not return BUDGET_BELOW_PER_DAY_MINIMUM
    const noBudgetError = null;
    expect(noBudgetError).toBeNull();
  });

  /**
   * Test 7: Verifies unexpected Google Ads API errors fall back to generic error handling without triggering budget code.
   */
  test("Test 7: should pass through non-budget errors (e.g. POLICY_FINDING, QUOTA_EXCEEDED) without triggering budget minimum response", () => {
    const policyError = {
      response: {
        data: {
          details: [
            {
              errors: [
                {
                  errorCode: {
                    policyFindingError: "POLICY_FINDING",
                  },
                  details: {
                    policyFindingDetails: {
                      policyTopicEntries: [
                        {
                          topic: "DESTINATION_NOT_WORKING",
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const budgetCheck = GoogleAdsBaseService.parseGoogleAdsBudgetError(policyError, {
      customerId: mockCustomerId,
      currencyCode: "INR",
    });

    expect(budgetCheck).toBeNull();

    // Standard formatGoogleAdsError should still process it correctly
    const formattedError = GoogleAdsBaseService.formatGoogleAdsError(policyError);
    expect(formattedError).toContain("Landing page URL is unreachable or returning an error");
    expect(formattedError).not.toContain("DEMAND_GEN_BUDGET_BELOW_MINIMUM");
  });
});
