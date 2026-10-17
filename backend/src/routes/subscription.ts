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
  extraChannels: number = 0,
  billingMode: "upfront" | "emi" = "upfront",
  emiType: "autopay" | "bank_emi" = "autopay"
) => {
  const normalizedPlanCode = (planCode || "").toLowerCase().trim();
  const plan: SubscriptionPlanConfig =
    SUBSCRIPTION_PLANS[normalizedPlanCode] || SUBSCRIPTION_PLANS.annual;

  const extraChannelsCount = Math.max(0, Number(extraChannels) || 0);
  const extraChannelsCost = extraChannelsCount * EXTRA_CHANNEL_PRICE;

  let basePrice = plan.basePrice; // Default 14,999 for upfront full payment
  
  // If user selected EMI (AutoPay or Card/Bank EMI), Price Summary is 30K + 18% GST (30,000 + 5,400 = 35,400)
  if (billingMode === "emi") {
    basePrice = 30000;
  }

  const subtotal = basePrice + extraChannelsCost;
  // Exact 18% GST calculation (e.g. 14999 * 0.18 = 2699.82; 30000 * 0.18 = 5400)
  const rawGst = subtotal * (plan.gstPercentage / 100);
  // Round to 2 decimal places for precise monetary representation
  const gstAmount = Math.round(rawGst * 100) / 100;
  const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

  return {
    planCode: plan.code,
    planName: billingMode === "emi" && emiType === "autopay" ? "Annual Plan (AutoPay Downpayment)" : plan.name,
    durationMonths: plan.durationMonths,
    basePrice,
    extraChannelsCount,
    extraChannelsCost,
    subtotal,
    gstPercentage: plan.gstPercentage,
    gstAmount,
    grandTotal,
    billingMode,
    emiType,
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
    const {
      planCode = "annual",
      email,
      name,
      phone,
      extraChannels = 0,
      billingMode = "upfront",
      emiType = "autopay",
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Server-side calculation only
    const calculation = calculatePricing(planCode, extraChannels, billingMode, emiType);
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
          billingMode,
          emiType,
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
            billingMode,
            emiType,
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
            billingMode,
            emiType,
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
      billingMode = "upfront",
      emiType = "autopay",
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

    // Always recompute pricing server-side based on planCode, extraChannels, billingMode, and emiType
    const calculation = calculatePricing(planCode, extraChannels, billingMode, emiType);
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
      // 1. Create Organization with enabled modules, status set to PENDING_APPROVAL pending Super Admin verification
      const org = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          enabledModules: enabledModules,
          status: "PENDING_APPROVAL",
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

      // 3. Create Subscription record (status set to PENDING_APPROVAL)
      const sub = await (tx as any).subscription.create({
        data: {
          organizationId: org.id,
          planCode: resolvedPlanCode,
          planName: planName,
          billingCycle: `${durationMonths}_months`,
          durationMonths: durationMonths,
          amountPaid: grandTotal,
          currency: "INR",
          status: "PENDING_APPROVAL",
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
      pendingApproval: true,
      approvalTurnaround: "6 to 12 hours",
      message: "Payment successful! Your company account is registered and submitted for verification. Approval will be completed within 6 to 12 hours.",
      user: {
        id: newOrg.user.id,
        email: newOrg.user.email,
        name: newOrg.user.name,
        role: newOrg.user.role,
        organizationId: newOrg.org.id,
        organizationName: newOrg.org.name,
        phone: phone ? phone.trim() : null,
        enabledModules: newOrg.org.enabledModules,
        status: newOrg.org.status,
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
 * POST: Upgrade or renew subscription for an existing organization
 * When an organization already has an active plan:
 * - If the current plan has not expired yet, the new plan becomes UPCOMING (starts exactly when current plan ends).
 * - If the current plan has expired, the new plan starts immediately (ACTIVE).
 */
router.post("/upgrade", async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      planCode = "annual",
      extraChannels = 0,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }

    const org = await (prisma.organization as any).findUnique({
      where: { id: organizationId },
      include: {
        subscriptions: {
          orderBy: { endDate: "desc" },
        },
      },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Server-side calculation only
    const calculation = calculatePricing(planCode, extraChannels);
    const {
      grandTotal,
      planCode: resolvedPlanCode,
      planName,
      durationMonths,
      extraChannelsCount,
      features,
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
    }

    // Determine startDate and endDate:
    // Check if there is a currently running subscription
    const now = new Date();
    const activeSub = org.subscriptions?.find(
      (s: any) => s.status === "ACTIVE" && new Date(s.endDate).getTime() > now.getTime()
    );

    let startDate: Date;
    let status: string;

    if (activeSub) {
      // The new plan is queued to start immediately upon current plan expiration
      startDate = new Date(activeSub.endDate);
      status = "UPCOMING";
    } else {
      // Current plan expired or none exists -> starts now
      startDate = new Date();
      status = "ACTIVE";
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const newSub = await (prisma as any).subscription.create({
      data: {
        organizationId: org.id,
        planCode: resolvedPlanCode,
        planName,
        billingCycle: `${durationMonths}_months`,
        durationMonths,
        amountPaid: grandTotal,
        currency: "INR",
        status,
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

    // Record Payment Transaction
    if (razorpayOrderId) {
      await (prisma as any).paymentTransaction.upsert({
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
          customerEmail: org.name || "workspace@jisnucrm.com",
          metadata: {
            isUpgrade: true,
            status,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            calculation,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "UPCOMING"
          ? `Upcoming plan scheduled! Will automatically activate on ${startDate.toLocaleString("en-IN")}.`
          : `Plan activated successfully until ${endDate.toLocaleString("en-IN")}!`,
      subscription: newSub,
      currentPlanActive: activeSub || null,
      upcomingPlan: status === "UPCOMING" ? newSub : null,
    });
  } catch (error: any) {
    console.error("Error creating upgraded subscription:", error);
    return res.status(500).json({ error: "Failed to upgrade subscription", details: error.message });
  }
});

/**
 * GET: Current organization's subscription status
 * Returns current plan, upcoming plan (if queued), and full history
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
          orderBy: { startDate: "asc" },
        },
        users: {
          select: { id: true, email: true, name: true, role: true, phone: true },
        },
        paymentTransactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { customerPhone: true, customerEmail: true, customerName: true },
        },
      },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const nowTime = Date.now();
    const subs: any[] = org.subscriptions || [];

    // Find current active subscription:
    // Status is ACTIVE and current time is within [startDate, endDate]
    let currentSub = subs.find((s) => {
      const sStart = new Date(s.startDate).getTime();
      const sEnd = new Date(s.endDate).getTime();
      return (s.status === "ACTIVE" || !s.status) && sStart <= nowTime && sEnd >= nowTime;
    });

    // If no sub precisely within time range, pick latest sub marked ACTIVE or most recent
    if (!currentSub && subs.length > 0) {
      currentSub = subs[subs.length - 1];
    }

    // Find upcoming subscription:
    // Sub with status UPCOMING or with startDate > nowTime
    const upcomingSub = subs.find((s) => {
      const sStart = new Date(s.startDate).getTime();
      return (s.status === "UPCOMING" || sStart > nowTime) && s.id !== currentSub?.id;
    });

    const primaryUser = (org.users || []).find((u: any) => u.role === "admin" || u.role === "client_admin") || org.users?.[0] || null;
    const contactPhone = primaryUser?.phone || org.paymentTransactions?.[0]?.customerPhone || null;

    return res.status(200).json({
      success: true,
      organizationId: org.id,
      organizationName: org.name,
      pendingBusinessName: org.pendingBusinessName || null,
      businessCategory: org.businessCategory || null,
      businessAddress: org.businessAddress || null,
      businessWebsite: org.businessWebsite || null,
      aboutBusiness: org.aboutBusiness || null,
      gstin: org.gstin || null,
      status: org.status,
      suspensionReason: org.suspensionReason || null,
      enabledModules: org.enabledModules,
      subscription: currentSub || null,
      upcomingSubscription: upcomingSub || null,
      allSubscriptions: subs,
      primaryUser: primaryUser ? {
        id: primaryUser.id,
        email: primaryUser.email,
        name: primaryUser.name,
        role: primaryUser.role,
        phone: primaryUser.phone || null,
      } : null,
      contactPhone,
      users: org.users || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to retrieve subscription status", details: error.message });
  }
});

export default router;
