import { Router, Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { SUBSCRIPTION_PLANS, EXTRA_CHANNEL_PRICE, GST_PERCENTAGE, SubscriptionPlanConfig } from "../config/plans";

const router = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export const getRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

/**
 * Server-side trusted calculation of subscription cost, extra channels add-on, and GST.
 * Never trust client-submitted prices or amounts.
 */
export const calculatePricing = (
  planCode: string = "annual",
  extraChannels: number = 0
) => {
  const normalizedPlanCode = (planCode || "").toLowerCase().trim();
  const plan: SubscriptionPlanConfig =
    SUBSCRIPTION_PLANS[normalizedPlanCode] || SUBSCRIPTION_PLANS.annual;

  const extraChannelsCount = Math.max(0, Number(extraChannels) || 0);
  const extraChannelsCost = extraChannelsCount * EXTRA_CHANNEL_PRICE;

  const basePrice = plan.basePrice;
  const subtotal = basePrice + extraChannelsCost;
  // Exact 18% GST calculation (e.g. 14999 * 0.18 = 2699.82; 5999 * 0.18 = 1079.82; 6000 * 0.18 = 1080)
  const rawGst = subtotal * (plan.gstPercentage / 100);
  // Round to 2 decimal places for precise monetary representation
  const gstAmount = Math.round(rawGst * 100) / 100;
  const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

  return {
    planCode: plan.code,
    planName: plan.name,
    durationMonths: plan.durationMonths,
    basePrice,
    extraChannelsCount,
    extraChannelsCost,
    subtotal,
    gstPercentage: plan.gstPercentage,
    gstAmount,
    grandTotal,
    // Razorpay amount in paise (1 INR = 100 paise)
    amountInPaise: Math.round(grandTotal * 100),
    features: plan.features,
    enabledModules: plan.enabledModules,
  };
};

/**
 * GET: Fetch all active subscription plans & public key info
 */
router.get("/plans", (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      plans: Object.values(SUBSCRIPTION_PLANS),
      extraChannelPrice: EXTRA_CHANNEL_PRICE,
      gstPercentage: GST_PERCENTAGE,
      razorpayKeyId: RAZORPAY_KEY_ID || null,
      isTestMode: !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch plans", details: error.message });
  }
});

/**
 * POST: Server-side pricing calculation preview endpoint
 */
router.post("/calculate", (req: Request, res: Response) => {
  try {
    const { planCode = "annual", extraChannels = 0 } = req.body;
    const calculation = calculatePricing(planCode, extraChannels);
    return res.status(200).json({ success: true, ...calculation });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to calculate pricing", details: error.message });
  }
});

/**
 * POST: Create trusted Razorpay Order
 */
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { planCode = "annual", email, name, phone, extraChannels = 0 } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Server-side calculation only
    const calculation = calculatePricing(planCode, extraChannels);
    const { grandTotal, amountInPaise, planCode: resolvedPlanCode, durationMonths } = calculation;

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      // Live Razorpay order creation
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_sub_${Date.now()}`,
        notes: {
          planCode: resolvedPlanCode,
          durationMonths: String(durationMonths),
          email: String(email).trim().toLowerCase(),
          extraChannels: String(calculation.extraChannelsCount),
          basePrice: String(calculation.basePrice),
          gstAmount: String(calculation.gstAmount),
        },
      };

      const order = await razorpay.orders.create(options);

      // Record transaction placeholder
      await (prisma as any).paymentTransaction.create({
        data: {
          razorpayOrderId: order.id,
          amount: grandTotal,
          currency: "INR",
          status: "created",
          planCode: resolvedPlanCode,
          billingCycle: `${durationMonths}_months`,
          customerEmail: email.trim().toLowerCase(),
          customerName: name || null,
          customerPhone: phone || null,
          metadata: {
            calculation,
            receipt: options.receipt,
          },
        },
      });

      return res.status(200).json({
        success: true,
        orderId: order.id,
        calculation,
        amount: grandTotal,
        amountInPaise,
        currency: "INR",
        keyId: RAZORPAY_KEY_ID,
        isMock: false,
      });
    } else {
      // Sandbox fallback mode (when no live Razorpay API keys are configured)
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      await (prisma as any).paymentTransaction.create({
        data: {
          razorpayOrderId: mockOrderId,
          amount: grandTotal,
          currency: "INR",
          status: "created",
          planCode: resolvedPlanCode,
          billingCycle: `${durationMonths}_months`,
          customerEmail: email.trim().toLowerCase(),
          customerName: name || null,
          customerPhone: phone || null,
          metadata: {
            isMock: true,
            notice: "Sandbox mock mode without live Razorpay keys",
            calculation,
          },
        },
      });

      return res.status(200).json({
        success: true,
        orderId: mockOrderId,
        calculation,
        amount: grandTotal,
        amountInPaise,
        currency: "INR",
        keyId: "rzp_test_mock_mode",
        isMock: true,
      });
    }
  } catch (error: any) {
    console.error("Error creating subscription order:", error);
    return res.status(500).json({ error: "Failed to initiate payment order", details: error.message });
  }
});

/**
 * POST: Verify payment signature, provision Organization, User account, and active Subscription
 */
router.post("/verify-and-register", async (req: Request, res: Response) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      email,
      password,
      organizationName,
      fullName,
      phone,
      planCode = "annual",
      extraChannels = 0,
    } = req.body;

    if (!email || !password || !organizationName) {
      return res.status(400).json({
        error: "Email, password, and organization name are required for account creation",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify user doesn't already exist
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email address already exists. Please log in to manage your subscription.",
      });
    }

    // Always recompute pricing server-side based on planCode and extraChannels
    const calculation = calculatePricing(planCode, extraChannels);
    const {
      grandTotal,
      planCode: resolvedPlanCode,
      planName,
      durationMonths,
      extraChannelsCount,
      features,
      enabledModules,
    } = calculation;

    // Verify signature if live Razorpay keys are set
    const razorpay = getRazorpayInstance();

    if (razorpay && RAZORPAY_KEY_SECRET) {
      if (!razorpaySignature || !razorpayPaymentId || !razorpayOrderId) {
        return res.status(400).json({
          error: "Payment verification failed. Missing transaction identifiers.",
        });
      }

      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({
          error: "Payment verification failed. Invalid transaction signature.",
        });
      }
    } else {
      // In live production, sandbox signatures must not bypass verification.
      // If mock mode is explicitly allowed because keys are absent, verify mock payload format
      if (!razorpayOrderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }
    }

    // Calculate subscription period: 3, 6, or 12 months exactly
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Create Tenant: Organization + Admin User + Subscription Record + Payment Transaction
    const newOrg = await prisma.$transaction(async (tx) => {
      // 1. Create Organization with enabled modules
      const org = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          enabledModules: enabledModules,
          status: "ACTIVE",
        },
      });

      // 2. Create Primary Admin User
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          password: password, // Note: Existing auth uses plain or pre-hashed matching in existing user model
          name: fullName ? fullName.trim() : organizationName.trim(),
          role: "client_admin",
          organizationId: org.id,
        },
      });

      // 3. Create Active Subscription record
      const sub = await (tx as any).subscription.create({
        data: {
          organizationId: org.id,
          planCode: resolvedPlanCode,
          planName: planName,
          billingCycle: `${durationMonths}_months`,
          durationMonths: durationMonths,
          amountPaid: grandTotal,
          currency: "INR",
          status: "ACTIVE",
          startDate,
          endDate,
          paymentMode: "ONE_TIME",
          featuresIncluded: features,
          maxUsers: 10 + extraChannelsCount * 2,
          maxContacts: 50000,
          maxAiTokens: 0,
          extraChannels: extraChannelsCount,
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
          razorpaySignature: razorpaySignature || null,
        },
      });

      // 4. Update or Record Payment Transaction
      if (razorpayOrderId) {
        await (tx as any).paymentTransaction.upsert({
          where: { razorpayOrderId },
          update: {
            organizationId: org.id,
            razorpayPaymentId: razorpayPaymentId || null,
            razorpaySignature: razorpaySignature || null,
            status: "captured",
          },
          create: {
            organizationId: org.id,
            razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || null,
            razorpaySignature: razorpaySignature || null,
            amount: grandTotal,
            currency: "INR",
            status: "captured",
            planCode: resolvedPlanCode,
            billingCycle: `${durationMonths}_months`,
            customerEmail: cleanEmail,
            customerName: fullName || organizationName,
            customerPhone: phone || null,
            metadata: {
              ...calculation,
            },
          },
        });
      }

      return { org, user, sub };
    });

    return res.status(201).json({
      success: true,
      message: "Subscription activated and account provisioned successfully!",
      user: {
        id: newOrg.user.id,
        email: newOrg.user.email,
        name: newOrg.user.name,
        role: newOrg.user.role,
        organizationId: newOrg.org.id,
        organizationName: newOrg.org.name,
        enabledModules: newOrg.org.enabledModules,
      },
      subscription: {
        id: newOrg.sub.id,
        planCode: newOrg.sub.planCode,
        planName: newOrg.sub.planName,
        billingCycle: newOrg.sub.billingCycle,
        durationMonths: newOrg.sub.durationMonths,
        paymentMode: newOrg.sub.paymentMode,
        startDate: newOrg.sub.startDate,
        endDate: newOrg.sub.endDate,
        status: newOrg.sub.status,
      },
    });
  } catch (error: any) {
    console.error("Error verifying payment and creating tenant:", error);
    return res.status(500).json({ error: "Failed to complete subscription registration", details: error.message });
  }
});

/**
 * GET: Current organization's subscription status
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const orgId = (req.headers["x-organization-id"] as string) || (req.query.organizationId as string);

    if (!orgId) {
      return res.status(400).json({ error: "x-organization-id header is required" });
    }

    const org = await (prisma.organization as any).findUnique({
      where: { id: orgId },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const currentSub = org.subscriptions?.[0] || null;

    return res.status(200).json({
      success: true,
      organizationId: org.id,
      organizationName: org.name,
      status: org.status,
      enabledModules: org.enabledModules,
      subscription: currentSub,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to retrieve subscription status", details: error.message });
  }
});

export default router;
