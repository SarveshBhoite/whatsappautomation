import { Router, Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { SUBSCRIPTION_PLANS, AnnualPricingConfig } from "../config/plans";

const router = Router();

// Retrieve Razorpay keys from environment variables or provide fallback for test mode
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

const getRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

// Helper: Calculate Annual pricing with One-Time or EMI (2 months compulsory upfront)
export const calculatePricing = (
  paymentMode: "ONE_TIME" | "EMI" = "ONE_TIME",
  extraChannels: number = 0
) => {
  const plan: AnnualPricingConfig = SUBSCRIPTION_PLANS.all_in_one;
  const isEmi = paymentMode === "EMI";

  // Base upfront amount due today
  // ONE_TIME: ₹14,999 full year
  // EMI: First 2 months compulsory upfront = 2 * ₹3,000 = ₹6,000
  const baseUpfrontAmount = isEmi
    ? plan.emiCompulsoryMonths * plan.emiMonthlyAmount
    : plan.oneTimeBasePrice;

  const extraChannelsCount = Math.max(0, Number(extraChannels) || 0);
  const extraChannelsCost = extraChannelsCount * plan.addOnChannelPrice;

  const subtotal = baseUpfrontAmount + extraChannelsCost;
  const gstAmount = Math.round(subtotal * (plan.gstPercentage / 100));
  const grandTotal = subtotal + gstAmount;

  return {
    plan,
    paymentMode,
    isEmi,
    contractDurationMonths: plan.contractDurationMonths,
    oneTimeBasePrice: plan.oneTimeBasePrice,
    emiMonthlyAmount: plan.emiMonthlyAmount,
    emiCompulsoryMonths: isEmi ? plan.emiCompulsoryMonths : 0,
    emiRemainingMonths: isEmi ? plan.emiRemainingMonths : 0,
    baseUpfrontAmount,
    extraChannelsCount,
    extraChannelsCost,
    subtotal,
    gstPercentage: plan.gstPercentage,
    gstAmount,
    grandTotal,
    amountInPaise: Math.round(grandTotal * 100),
  };
};

// GET: Fetch available subscription plans & calculation rules
router.get("/plans", (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      plan: SUBSCRIPTION_PLANS.all_in_one,
      plans: Object.values(SUBSCRIPTION_PLANS),
      razorpayKeyId: RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID : null,
      isTestMode: !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch plans", details: error.message });
  }
});

// POST: Calculate pricing preview with GST & Extra Channels
router.post("/calculate", (req: Request, res: Response) => {
  try {
    const { paymentMode = "ONE_TIME", extraChannels = 0 } = req.body;
    const calculation = calculatePricing(paymentMode, extraChannels);
    return res.status(200).json({ success: true, ...calculation });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to calculate pricing", details: error.message });
  }
});

// POST: Create Razorpay Order or Test Order
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { paymentMode = "ONE_TIME", email, name, phone, extraChannels = 0 } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const mode = paymentMode === "EMI" ? "EMI" : "ONE_TIME";
    const calculation = calculatePricing(mode, extraChannels);
    const { grandTotal, amountInPaise, plan, subtotal, gstAmount, extraChannelsCount } = calculation;

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          planCode: plan.code,
          planName: plan.name,
          paymentMode: mode,
          customerEmail: email,
          baseUpfront: calculation.baseUpfrontAmount,
          extraChannels: extraChannelsCount,
          gstAmount,
          grandTotal,
        },
      };

      const order = await razorpay.orders.create(options);

      // Save initial transaction
      await (prisma as any).paymentTransaction.create({
        data: {
          razorpayOrderId: order.id,
          amount: grandTotal,
          currency: "INR",
          status: "created",
          planCode: plan.code,
          billingCycle: mode === "EMI" ? "yearly_emi" : "yearly_full",
          customerEmail: email.trim().toLowerCase(),
          customerName: name || null,
          customerPhone: phone || null,
          metadata: {
            orderId: order.id,
            receipt: options.receipt,
            subtotal,
            gstAmount,
            extraChannels: extraChannelsCount,
            paymentMode: mode,
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
        plan,
      });
    } else {
      // Mock order mode
      const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      await (prisma as any).paymentTransaction.create({
        data: {
          razorpayOrderId: mockOrderId,
          amount: grandTotal,
          currency: "INR",
          status: "created",
          planCode: plan.code,
          billingCycle: mode === "EMI" ? "yearly_emi" : "yearly_full",
          customerEmail: email.trim().toLowerCase(),
          customerName: name || null,
          customerPhone: phone || null,
          metadata: {
            isMock: true,
            notice: "Configured without live Razorpay keys",
            subtotal,
            gstAmount,
            extraChannels: extraChannelsCount,
            paymentMode: mode,
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
        plan,
      });
    }
  } catch (error: any) {
    console.error("Error creating subscription order:", error);
    return res.status(500).json({ error: "Failed to initiate payment order", details: error.message });
  }
});

// POST: Verify payment, provision Organization, User account, and active Subscription
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
      paymentMode = "ONE_TIME",
      extraChannels = 0,
    } = req.body;

    if (!email || !password || !organizationName) {
      return res.status(400).json({
        error: "Email, password, and organization name are required for account creation",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const mode = paymentMode === "EMI" ? "EMI" : "ONE_TIME";
    const calculation = calculatePricing(mode, extraChannels);
    const { grandTotal, plan, extraChannelsCount, isEmi } = calculation;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email address already exists. Please log in to manage your subscription.",
      });
    }

    // Verify signature if live Razorpay keys are configured
    const razorpay = getRazorpayInstance();

    if (razorpay && RAZORPAY_KEY_SECRET && razorpaySignature && razorpayPaymentId) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ error: "Payment verification failed. Invalid transaction signature." });
      }
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    let nextEmiDueDate: Date | null = null;

    if (isEmi) {
      // 2 months compulsory upfront: active for 2 months (60 days), next installment due in 60 days
      endDate.setDate(endDate.getDate() + 60);
      nextEmiDueDate = new Date();
      nextEmiDueDate.setDate(nextEmiDueDate.getDate() + 60);
    } else {
      // Full year upfront: active for 365 days
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create Tenant: Organization + Admin User + Subscription Record + Payment Transaction
    const newOrg = await prisma.$transaction(async (tx) => {
      // 1. Create Organization with all enabled modules
      const org = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          enabledModules: plan.enabledModules,
          status: "ACTIVE",
        },
      });

      // 2. Create Primary Admin User
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          password: password,
          name: fullName ? fullName.trim() : organizationName.trim(),
          role: "client_admin",
          organizationId: org.id,
        },
      });

      // 3. Create Active Subscription
      const sub = await (tx as any).subscription.create({
        data: {
          organizationId: org.id,
          planCode: plan.code,
          planName: plan.name,
          billingCycle: isEmi ? "yearly_emi" : "yearly_full",
          amountPaid: grandTotal,
          currency: "INR",
          status: "ACTIVE",
          startDate,
          endDate,
          paymentMode: mode,
          emiMonthsPaid: isEmi ? 2 : 12,
          emiTotalMonths: 12,
          emiMonthlyAmount: plan.emiMonthlyAmount,
          nextEmiDueDate,
          featuresIncluded: plan.features,
          maxUsers: 10 + extraChannelsCount * 2,
          maxContacts: 50000,
          maxAiTokens: 0,
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
            planCode: plan.code,
            billingCycle: isEmi ? "yearly_emi" : "yearly_full",
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
        paymentMode: newOrg.sub.paymentMode,
        emiMonthsPaid: newOrg.sub.emiMonthsPaid,
        emiTotalMonths: newOrg.sub.emiTotalMonths,
        nextEmiDueDate: newOrg.sub.nextEmiDueDate,
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

// GET: Current organization's subscription status
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
