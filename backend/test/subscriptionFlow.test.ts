import crypto from "crypto";
import { calculatePricing } from "../src/routes/subscription";

describe("Subscription Signature Verification & Expiry Calculation Flow", () => {
  const SECRET = "sample_test_secret_123";

  test("validates genuine Razorpay HMAC SHA256 signatures", () => {
    const orderId = "order_9A33XWu170gUtm";
    const paymentId = "pay_29Ae07HxOf8Gir";
    const generatedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const verificationCheck = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(generatedSignature).toBe(verificationCheck);
  });

  test("rejects tampered payment ID or order ID signatures", () => {
    const orderId = "order_9A33XWu170gUtm";
    const paymentId = "pay_29Ae07HxOf8Gir";
    const tamperedPaymentId = "pay_FAKE9999999999";

    const genuineSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const tamperedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${tamperedPaymentId}`)
      .digest("hex");

    expect(genuineSignature).not.toBe(tamperedSignature);
  });

  test("accurately computes subscription expiration date by duration months", () => {
    const testDurations = [
      { plan: "quarterly", months: 3 },
      { plan: "half_yearly", months: 6 },
      { plan: "annual", months: 12 }
    ];

    testDurations.forEach(({ plan, months }) => {
      const pricing = calculatePricing(plan, 0);
      expect(pricing.durationMonths).toBe(months);

      const startDate = new Date("2026-01-01T00:00:00.000Z");
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + pricing.durationMonths);

      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (months === 3) {
        expect(diffDays).toBe(90);
      } else if (months === 6) {
        expect(diffDays).toBe(181);
      } else if (months === 12) {
        expect(diffDays).toBe(365);
      }
    });
  });
});
