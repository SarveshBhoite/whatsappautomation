"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Building,
  CreditCard,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Bot,
  Plus,
  Minus,
  Star,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Footer from "@/components/Footer";
import HeroShowcase from "@/components/home/HeroShowcase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export type PlanKey = "quarterly" | "half_yearly" | "annual";

interface PlanItem {
  code: PlanKey;
  name: string;
  durationLabel: string;
  durationMonths: number;
  basePrice: number;
  tagline: string;
  isRecommended?: boolean;
  badge?: string;
  savingsText?: string;
  effectiveMonthlyRate: number;
  tierTheme: {
    accentPill: string;
    borderActive: string;
    badgeBg: string;
    highlightLabel: string;
  };
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    code: "quarterly",
    name: "Quarterly Plan",
    durationLabel: "3 Months Access",
    durationMonths: 3,
    basePrice: 5999,
    effectiveMonthlyRate: 2000,
    tagline: "Ideal agile starter package to kickstart WhatsApp automation and lead capture.",
    savingsText: "Standard Quarterly Rate",
    tierTheme: {
      accentPill: "bg-slate-100 text-slate-700 border-slate-200",
      borderActive: "border-slate-300",
      badgeBg: "bg-slate-800 text-white",
      highlightLabel: "Starter Flexibility"
    },
    features: [
      "1-Click Official Meta WhatsApp Cloud API",
      "1-Click Google Ads & Meta Ads Suite",
      "1-Click Google Business Profile Reviews Sync",
      "Visual Drag-and-Drop Chatbot Builder",
      "Multi-Agent Unified Customer Team Inbox",
      "Autonomous 24/7 AI Knowledge Base Agent",
      "Instagram DM & Comment Auto-Replies",
      "Gmail AI Drafting & Auto-Replies",
      "Google Calendar Appointment Booking",
      "YouTube Comment & Sentiment Sync",
      "Dedicated Multi-Tenant Database Isolation"
    ]
  },
  {
    code: "half_yearly",
    name: "Half-Yearly Plan",
    durationLabel: "6 Months Access",
    durationMonths: 6,
    basePrice: 9999,
    effectiveMonthlyRate: 1667,
    tagline: "Extended flexibility and continuous campaigns for growing marketing teams.",
    savingsText: "Save ~17% vs Quarterly run-rate",
    tierTheme: {
      accentPill: "bg-emerald-50 text-emerald-800 border-emerald-200",
      borderActive: "border-emerald-500",
      badgeBg: "bg-emerald-600 text-white",
      highlightLabel: "Growing Teams"
    },
    features: [
      "1-Click Official Meta WhatsApp Cloud API",
      "1-Click Google Ads & Meta Ads Suite",
      "1-Click Google Business Profile Reviews Sync",
      "Visual Drag-and-Drop Chatbot Builder",
      "Multi-Agent Unified Customer Team Inbox",
      "Autonomous 24/7 AI Knowledge Base Agent",
      "Instagram DM & Comment Auto-Replies",
      "Gmail AI Drafting & Auto-Replies",
      "Google Calendar Appointment Booking",
      "YouTube Comment & Sentiment Sync",
      "Dedicated Multi-Tenant Database Isolation"
    ]
  },
  {
    code: "annual",
    name: "Annual Plan",
    durationLabel: "1 Year / 12 Months",
    durationMonths: 12,
    basePrice: 14999,
    effectiveMonthlyRate: 1250,
    tagline: "Maximum value & complete enterprise automation with year-round peace of mind.",
    isRecommended: true,
    badge: "MOST POPULAR • BEST VALUE",
    savingsText: "Save ₹8,997 (37% OFF vs Quarterly)",
    tierTheme: {
      accentPill: "bg-sky-50 text-brand-blue border-sky-200",
      borderActive: "border-brand-blue",
      badgeBg: "bg-gradient-to-r from-brand-blue to-emerald-600 text-white",
      highlightLabel: "Maximum Value • Year-Round"
    },
    features: [
      "1-Click Official Meta WhatsApp Cloud API",
      "1-Click Google Ads & Meta Ads Suite",
      "1-Click Google Business Profile Reviews Sync",
      "Visual Drag-and-Drop Chatbot Builder",
      "Multi-Agent Unified Customer Team Inbox",
      "Autonomous 24/7 AI Knowledge Base Agent",
      "Instagram DM & Comment Auto-Replies",
      "Gmail AI Drafting & Auto-Replies",
      "Google Calendar Appointment Booking",
      "YouTube Comment & Sentiment Sync",
      "Dedicated Multi-Tenant Database Isolation"
    ]
  }
];

const EXTRA_CHANNEL_PRICE = 2000;
const GST_PERCENTAGE = 18;

// Helper: Format INR with standard comma grouping
const formatINR = (val: number, includeDecimals = false): string => {
  if (includeDecimals || val % 1 !== 0) {
    return val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return val.toLocaleString("en-IN");
};

export default function PricingPage() {
  const router = useRouter();

  // Selected Plan state (default: recommended Annual plan)
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanKey>("annual");
  const [extraChannels, setExtraChannels] = useState<number>(0);

  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Registration Form Fields - Initialized empty for genuine new first-time customer signup
  const [organizationName, setOrganizationName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const activePlan = PLANS.find((p) => p.code === selectedPlanCode) || PLANS[2];

  // Upfront calculations
  const basePrice = activePlan.basePrice;
  const extraChannelsCost = extraChannels * EXTRA_CHANNEL_PRICE;
  const subtotal = basePrice + extraChannelsCost;

  // 18% GST calculation (exact precision)
  const gstAmount = Math.round(subtotal * (GST_PERCENTAGE / 100) * 100) / 100;
  const grandTotalWithGst = Math.round((subtotal + gstAmount) * 100) / 100;

  const handleOpenCheckoutForPlan = (planCode: PlanKey) => {
    setSelectedPlanCode(planCode);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!organizationName.trim()) {
      setErrorMsg("Please enter your business / organization name.");
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your confirm password.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order on backend (Server calculates trusted amount)
      const orderRes = await fetch(`${BACKEND_URL}/api/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlanCode,
          extraChannels,
          email: email.trim(),
          name: fullName.trim(),
          phone: phone.trim(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate payment order");
      }

      // 2. Razorpay checkout
      const isMock = orderData.isMock || !window.Razorpay;

      if (!isMock && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: "Jisnu CRM",
          description: `${activePlan.name} (${activePlan.durationLabel})`,
          image: "/icon.jpeg",
          order_id: orderData.orderId,
          prefill: {
            name: fullName,
            email: email,
            contact: phone,
          },
          theme: {
            color: "#0284c7",
          },
          handler: async function (response: any) {
            await verifyAndActivateAccount({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setErrorMsg(response.error.description || "Payment failed. Please try again.");
          setSubmitting(false);
        });
        rzp.open();
      } else {
        // Mock Sandbox Payment Mode
        await verifyAndActivateAccount({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature_approved",
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to process checkout. Please try again.");
      setSubmitting(false);
    }
  };

  const verifyAndActivateAccount = async (paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    try {
      const verifyRes = await fetch(`${BACKEND_URL}/api/subscription/verify-and-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentDetails,
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          organizationName: organizationName.trim(),
          phone: phone.trim(),
          planCode: selectedPlanCode,
          extraChannels,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Failed to activate subscription and account.");
      }

      // Set user session in LocalStorage
      const user = verifyData.user;
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("organization_id", user.organizationId);
      localStorage.setItem("user_name", user.name || user.email);
      if (user.enabledModules) {
        localStorage.setItem("enabled_modules", JSON.stringify(user.enabledModules));
      }

      setSuccessData(verifyData);
      setSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Account activation encountered an error.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-mesh-canvas text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* ── Sticky Frosted Glass Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl overflow-hidden border border-slate-200/90 p-0.5 bg-white shadow-2xs group-hover:border-brand-blue/60 transition-colors">
              <img src="/icon.jpeg" alt="Jisnu CRM Logo" className="h-full w-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
                Jisnu <span className="text-brand-blue">CRM</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Automation
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/#cockpit" className="hover:text-brand-blue transition-colors">
              Cockpit
            </Link>
            <Link href="/#workflow" className="hover:text-brand-blue transition-colors">
              Workflow
            </Link>
            <Link href="/#modules" className="hover:text-brand-blue transition-colors">
              All 12 Modules
            </Link>
            <Link href="/#bento-features" className="hover:text-brand-blue transition-colors">
              Capabilities
            </Link>
            <Link href="/#comparison" className="hover:text-brand-blue transition-colors">
              Comparison
            </Link>
            <Link href="/#calculator" className="hover:text-brand-blue transition-colors">
              ROI Impact
            </Link>
            <Link href="/pricing" className="text-brand-blue font-bold">
              Pricing &amp; Plans
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-bold text-slate-700">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="default" size="default" className="shadow-md shadow-brand-blue/20">
                Dashboard <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col items-center w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header & Tagline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
            <span>TRANSPARENT UPFRONT PRICING • FULL CRM SUITE UNLOCKED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Simple, Transparent Plans.{" "}
            <span className="bg-gradient-to-r from-brand-blue via-emerald-600 to-brand-orange bg-clip-text text-transparent">
              All Modules Included.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Choose the subscription duration that fits your business stage. Every plan includes full access to all 12+ CRM modules with zero hidden charges.
          </p>
        </div>

        {/* Global Multi-Channel Add-on Notice */}
        <div className="w-full max-w-5xl mx-auto mt-8 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Extra Channel Account Add-on Available
              </p>
              <p className="text-xs text-slate-500">
                Need more than 1 WhatsApp number or YouTube channel? Add extra accounts at ₹2,000 / account anytime during checkout.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500">Quantity for checkout:</span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setExtraChannels(Math.max(0, extraChannels - 1))}
                disabled={extraChannels === 0}
                className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                title="Remove extra channel"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-900">
                {extraChannels}
              </span>
              <button
                type="button"
                onClick={() => setExtraChannels(extraChannels + 1)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Add extra channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Tier Pricing Cards Grid */}
        <div className="w-full max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const isRec = plan.isRecommended;
            const cardExtraCost = extraChannels * EXTRA_CHANNEL_PRICE;
            const cardSubtotal = plan.basePrice + cardExtraCost;
            const cardGst = Math.round(cardSubtotal * (GST_PERCENTAGE / 100) * 100) / 100;
            const cardTotalWithGst = Math.round((cardSubtotal + cardGst) * 100) / 100;

            return (
              <div
                key={plan.code}
                className={`relative flex flex-col justify-between rounded-3xl transition-all duration-300 ${
                  isRec
                    ? "bg-gradient-to-b from-sky-50/70 via-white to-white border-2 border-brand-blue shadow-2xl shadow-brand-blue/20 md:-translate-y-3 ring-4 ring-brand-blue/15 z-10"
                    : plan.code === "half_yearly"
                    ? "bg-white border-2 border-emerald-500/40 shadow-lg hover:border-emerald-500 hover:shadow-xl transition-all"
                    : "bg-white border border-slate-200/90 shadow-md hover:border-slate-300 hover:shadow-lg transition-all"
                }`}
              >
                {/* Highlight Badge on Top for Annual Plan */}
                {isRec ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-blue via-sky-600 to-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-brand-blue/30 ring-2 ring-white">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      {plan.badge || "MOST POPULAR • BEST VALUE"}
                    </span>
                  </div>
                ) : (
                  <div className="absolute -top-3 right-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${plan.tierTheme.accentPill}`}>
                      {plan.tierTheme.highlightLabel}
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Plan Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          {plan.name}
                          {isRec && (
                            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-brand-blue bg-sky-100/80 px-2 py-0.5 rounded-md">
                              VIP Choice
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                          {plan.durationLabel}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2.5 min-h-[34px] leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Block with Effective Monthly Breakdown */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isRec 
                      ? "bg-sky-50/60 border-sky-200/80 shadow-2xs" 
                      : "bg-slate-50/70 border-slate-100"
                  }`}>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-500">₹</span>
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                          {formatINR(cardSubtotal)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Effective</span>
                        <span className={`text-sm font-black ${isRec ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>
                          ~₹{formatINR(plan.effectiveMonthlyRate)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Savings Tag */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className={`font-black text-[11px] px-2 py-0.5 rounded-md ${
                        isRec 
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/50" 
                          : plan.code === "half_yearly"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-200/70 text-slate-600"
                      }`}>
                        {plan.savingsText}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Billed upfront</span>
                    </div>

                    {extraChannels > 0 ? (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Base Plan ({plan.durationLabel}):</span>
                          <span className="font-semibold text-slate-800">₹{formatINR(plan.basePrice)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{extraChannels} Extra Account(s):</span>
                          <span className="font-semibold text-brand-blue">+₹{formatINR(cardExtraCost)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>GST (18%):</span>
                          <span className="font-semibold text-slate-700">₹{formatINR(cardGst, true)}</span>
                        </div>
                        <div className="flex items-center justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 text-xs">
                          <span>Total Payable:</span>
                          <span className="text-brand-blue text-sm">₹{formatINR(cardTotalWithGst, true)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>18% GST:</span>
                          <span className="font-semibold text-slate-700">+₹{formatINR(cardGst, true)}</span>
                        </div>
                        <div className="flex items-center justify-between font-black text-slate-900 text-xs pt-0.5">
                          <span>Total Payable:</span>
                          <span className={`${isRec ? "text-brand-blue" : "text-slate-900"} text-sm font-black`}>
                            ₹{formatINR(cardTotalWithGst, true)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Included Features */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        {isRec ? "Full Enterprise Suite Unlocked:" : "What's Included:"}
                      </p>
                      {isRec && (
                        <span className="text-[10px] font-bold text-brand-blue flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> All 12 Modules
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isRec 
                              ? "bg-brand-blue text-white shadow-2xs" 
                              : plan.code === "half_yearly"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <span className={`leading-tight ${isRec ? "font-medium text-slate-900" : ""}`}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTA Bottom */}
                <div className="p-6 sm:p-8 pt-0">
                  <button
                    type="button"
                    onClick={() => handleOpenCheckoutForPlan(plan.code)}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isRec
                        ? "bg-gradient-to-r from-brand-blue via-sky-600 to-brand-blue-deep hover:brightness-110 text-white shadow-brand-blue/30 ring-2 ring-brand-blue/40"
                        : plan.code === "half_yearly"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                    {isRec ? "★ Recommended for highest ROI & continuous operations" : "Single upfront payment • Instant workspace activation"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bring Any LLM Spotlight Banner */}
        <div className="w-full max-w-5xl mx-auto mt-14 p-6 rounded-3xl bg-sky-50/80 border border-sky-200 text-sky-950 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-brand-blue">
              <Bot className="w-5 h-5 text-brand-blue" />
              <span className="text-base font-black">Bring Any LLM Key of Your Choice</span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Connect any AI model (OpenAI GPT, Google Gemini, or Claude). Power your 24/7 autonomous chatbot, auto-replies, and ad copy directly with your own LLM key with total data control and freedom.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-sky-200 text-brand-blue text-xs font-bold shadow-2xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Zero Platform Token Markup
            </span>
          </div>
        </div>

        {/* ── Live Cockpit & CRM Capability Showcase ── */}
        <section id="cockpit" className="w-full max-w-6xl mx-auto mt-16 pt-10 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-brand-blue text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE INTERACTIVE SHOWCASE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              See How Jisnu CRM Powers Your Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore how all 12 modules work in harmony: ingest leads from WhatsApp &amp; Meta Ads, trigger sub-5s AI replies, sync Google Reviews, and monitor cross-channel analytics.
            </p>
          </div>
          <HeroShowcase />
        </section>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-5xl mx-auto mt-16 pt-10 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Built for Effortless Scalability</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connect channels in 1 click, power your AI with any LLM, and expand accounts smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">1-Click Channel Connect</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless embedded sign-up and OAuth for WhatsApp, Google Ads, Meta Ads, and Google Business Profile.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Connect Any LLM Key</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plug in your own OpenAI, Gemini, or Claude key. Power full AI chatbots and content generators with zero token limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="h-9 w-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Channel Freedom</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Expand to multiple WhatsApp numbers, YouTube channels, or ad accounts at ₹2,000 per additional account.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" />
                  Self-Service Checkout
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Jisnu CRM {activePlan.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validity: {activePlan.durationLabel} • Base: ₹{formatINR(basePrice)}
                  {extraChannels > 0 && ` + ${extraChannels} Extra Account(s)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!submitting) {
                    setIsModalOpen(false);
                    setSuccessData(null);
                  }
                }}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {successData ? (
                /* Success Screen with 6 to 12 Hour Approval Notice */
                <div className="text-center py-6 space-y-4">
                  <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
                      Payment Received • Verification in Progress
                    </span>
                    <h4 className="text-2xl font-black text-slate-900">
                      Approval Turnaround: 6 to 12 Hours
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                      Your company subscription payment is verified. Your tenant workspace is submitted to Super Admin and will be activated within <strong>6 to 12 hours</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400">Company Name:</span>{" "}
                      <span className="font-bold text-slate-900">{successData.user.organizationName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Company Login Email:</span>{" "}
                      <span className="font-bold text-slate-900">{successData.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Password:</span>{" "}
                      <span className="font-mono text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                        Saved as chosen by your company
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Plan &amp; Validity:</span>{" "}
                      <span className="font-bold text-brand-blue">
                        {successData.subscription.planName} ({successData.subscription.durationMonths} Months)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Current Status:</span>{" "}
                      <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                        PENDING SUPER ADMIN APPROVAL (6-12h)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-left text-xs text-sky-900">
                    <p className="font-bold text-brand-blue">What happens next?</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Our system verifies your company details and allocates multi-tenant database isolation. Once approved, you can log in directly at the Sign In page with your company email and password.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="w-full py-3 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <span>Go to Sign In Page</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Registration & Checkout Form */
                <form onSubmit={handleProcessCheckout} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Plan Switcher Inside Modal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Selected Plan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLANS.map((p) => (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => setSelectedPlanCode(p.code)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            selectedPlanCode === p.code
                              ? "border-brand-blue bg-sky-50/60 ring-2 ring-brand-blue/20"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <p className="text-xs font-black text-slate-900">{p.name}</p>
                          <p className="text-[11px] font-semibold text-brand-blue mt-0.5">₹{formatINR(p.basePrice)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Business / Organization Name *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. Acme Media Labs"
                        autoComplete="organization"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        autoComplete="name"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company / Business Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@company.com"
                        autoComplete="email"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">This official company email will be your login ID for Jisnu CRM.</p>
                  </div>

                  {/* Password & Confirm Password Side-by-Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          autoComplete="new-password"
                          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                          className={`w-full pl-10 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 ${
                            confirmPassword && confirmPassword !== password
                              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                              : "border-slate-200 focus:border-brand-blue focus:ring-brand-blue"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Phone (for WhatsApp notifications)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        autoComplete="tel"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Extra Channels Stepper Inside Modal */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Extra Channels</p>
                      <p className="text-[11px] text-slate-500">₹2,000 / additional account</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setExtraChannels(Math.max(0, extraChannels - 1))}
                        disabled={extraChannels === 0}
                        className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {extraChannels}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExtraChannels(extraChannels + 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Payment Invoice Summary with GST */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>{activePlan.name} ({activePlan.durationLabel}):</span>
                      <span className="font-semibold">₹{formatINR(basePrice)}</span>
                    </div>
                    {extraChannels > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>{extraChannels} Extra Account(s) (₹2,000 each):</span>
                        <span className="font-semibold">₹{formatINR(extraChannelsCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 border-t border-slate-200/80 pt-1">
                      <span>Taxable Subtotal:</span>
                      <span className="font-semibold">₹{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%):</span>
                      <span className="font-semibold">₹{formatINR(gstAmount, true)}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 text-sm">
                      <span>Total Payable:</span>
                      <span className="text-brand-blue">₹{formatINR(grandTotalWithGst, true)}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-blue/25 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <span>Processing Payment &amp; Provisioning...</span>
                      ) : (
                        <>
                          <span>
                            Pay ₹{formatINR(grandTotalWithGst, true)} &amp; Unlock CRM
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mt-2.5">
                      <Shield className="w-3.5 h-3.5 text-brand-blue" />
                      <span>Secured with Razorpay 256-bit encryption</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
