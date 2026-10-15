import { calculatePricing } from "../src/routes/subscription";
import { SUBSCRIPTION_PLANS, EXTRA_CHANNEL_PRICE, GST_PERCENTAGE } from "../src/config/plans";

describe("Subscription Plans & Pricing Rules", () => {
  test("defines exactly 3 valid subscription plans: quarterly, half_yearly, and annual", () => {
    const planCodes = Object.keys(SUBSCRIPTION_PLANS);
    expect(planCodes).toEqual(["quarterly", "half_yearly", "annual"]);

    // Quarterly Plan: 3 Months, ₹5,999 base
    expect(SUBSCRIPTION_PLANS.quarterly.durationMonths).toBe(3);
    expect(SUBSCRIPTION_PLANS.quarterly.basePrice).toBe(5999);

    // Half-Yearly Plan: 6 Months, ₹9,999 base
    expect(SUBSCRIPTION_PLANS.half_yearly.durationMonths).toBe(6);
    expect(SUBSCRIPTION_PLANS.half_yearly.basePrice).toBe(9999);

    // Annual Plan: 12 Months, ₹14,999 base
    expect(SUBSCRIPTION_PLANS.annual.durationMonths).toBe(12);
    expect(SUBSCRIPTION_PLANS.annual.basePrice).toBe(14999);
    expect(SUBSCRIPTION_PLANS.annual.isRecommended).toBe(true);
  });

  test("calculates accurate 18% GST and grand totals for base plans without add-ons", () => {
    // 1. Quarterly (3 Months @ ₹5,999)
    // 5,999 + 18% GST (1,079.82) = ₹7,078.82
    const quarterlyCalc = calculatePricing("quarterly", 0);
    expect(quarterlyCalc.basePrice).toBe(5999);
    expect(quarterlyCalc.durationMonths).toBe(3);
    expect(quarterlyCalc.extraChannelsCost).toBe(0);
    expect(quarterlyCalc.subtotal).toBe(5999);
    expect(quarterlyCalc.gstAmount).toBe(1079.82);
    expect(quarterlyCalc.grandTotal).toBe(7078.82);
    expect(quarterlyCalc.amountInPaise).toBe(707882);

    // 2. Half-Yearly (6 Months @ ₹9,999)
    // 9,999 + 18% GST (1,799.82) = ₹11,798.82
    const halfYearlyCalc = calculatePricing("half_yearly", 0);
    expect(halfYearlyCalc.basePrice).toBe(9999);
    expect(halfYearlyCalc.durationMonths).toBe(6);
    expect(halfYearlyCalc.gstAmount).toBe(1799.82);
    expect(halfYearlyCalc.grandTotal).toBe(11798.82);
    expect(halfYearlyCalc.amountInPaise).toBe(1179882);

    // 3. Annual (12 Months @ ₹14,999)
    // 14,999 + 18% GST (2,699.82) = ₹17,698.82
    const annualCalc = calculatePricing("annual", 0);
    expect(annualCalc.basePrice).toBe(14999);
    expect(annualCalc.durationMonths).toBe(12);
    expect(annualCalc.gstAmount).toBe(2699.82);
    expect(annualCalc.grandTotal).toBe(17698.82);
    expect(annualCalc.amountInPaise).toBe(1769882);
  });

  test("correctly factors in ₹2,000 extra channel account add-ons", () => {
    // Quarterly with 2 extra channels: 5,999 + (2 * 2,000) = 9,999 taxable. GST 18% = 1,799.82 -> 11,798.82
    const calc = calculatePricing("quarterly", 2);
    expect(calc.extraChannelsCount).toBe(2);
    expect(calc.extraChannelsCost).toBe(4000);
    expect(calc.subtotal).toBe(9999);
    expect(calc.gstAmount).toBe(1799.82);
    expect(calc.grandTotal).toBe(11798.82);
    expect(calc.amountInPaise).toBe(1179882);
  });

  test("server ignores tampered or unknown plan codes and defaults securely to trusted config", () => {
    // Client passes invalid plan code or attempts tampering
    const tampered = calculatePricing("non_existent_cheap_plan", 0);
    expect(tampered.planCode).toBe("annual");
    expect(tampered.basePrice).toBe(14999);
    expect(tampered.durationMonths).toBe(12);
  });

  test("no EMI or instalment properties exist on calculated plan", () => {
    const calc = calculatePricing("annual", 0) as any;
    expect(calc.emiMonthlyAmount).toBeUndefined();
    expect(calc.emiCompulsoryMonths).toBeUndefined();
    expect(calc.emiRemainingMonths).toBeUndefined();
  });
});
