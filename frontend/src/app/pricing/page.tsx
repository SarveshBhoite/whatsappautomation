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
  TrendingDown,
  CalendarCheck,
  Calendar
} from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const ONE_TIME_PRICE = 14999;
const EMI_MONTHLY_PRICE = 3000;
const EMI_COMPULSORY_MONTHS = 2; // 2 months compulsory upfront = ₹6,000
const EMI_DOWN_PAYMENT = EMI_MONTHLY_PRICE * EMI_COMPULSORY_MONTHS; // 6,000
const EXTRA_CHANNEL_PRICE = 2000;
const GST_PERCENTAGE = 18;

export default function PricingPage() {
  const router = useRouter();
  const [paymentMode, setPaymentMode] = useState<"ONE_TIME" | "EMI">("ONE_TIME");
  const [extraChannels, setExtraChannels] = useState<number>(0);

  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phone, setPhone] = useState("");

  const isEmi = paymentMode === "EMI";

  // Base upfront due today
  const baseUpfront = isEmi ? EMI_DOWN_PAYMENT : ONE_TIME_PRICE;
  const extraChannelsCost = extraChannels * EXTRA_CHANNEL_PRICE;
  const subtotal = baseUpfront + extraChannelsCost;

  // Savings comparison:
  // EMI full year cost: 12 * 3,000 = 36,000
  // One-time full year cost: 14,999
  // Savings: 36,000 - 14,999 = 21,001 (58% savings)
  const fullEmiYearlyCost = EMI_MONTHLY_PRICE * 12;
  const oneTimeSavings = fullEmiYearlyCost - ONE_TIME_PRICE;

  // GST calculation (only shown at checkout/payment time)
  const gstAmount = Math.round(subtotal * (GST_PERCENTAGE / 100));
  const grandTotalWithGst = subtotal + gstAmount;

  const handleOpenCheckout = () => {
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch(`${BACKEND_URL}/api/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMode,
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
          description: isEmi
            ? `1-Year Annual Suite (EMI - 2 Mo Activation)`
            : `1-Year Annual Suite (One-Time Payment)`,
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
          paymentMode,
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
            <span>ANNUAL CONTRACT • 1-YEAR UNLIMITED CRM ACCESS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Full 1-Year Access.{" "}
            <span className="bg-gradient-to-r from-brand-blue via-emerald-600 to-brand-orange bg-clip-text text-transparent">
              Pay Upfront or on EMI.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Every subscription is guaranteed for a complete 12-month contract with all modules unlocked. Choose a discounted one-time payment or flexible monthly EMI with a 2-month activation down payment.
          </p>

          {/* Payment Structure Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-slate-100 border border-slate-200 p-1.5 rounded-2xl inline-flex flex-col sm:flex-row items-center gap-2 shadow-xs">
              <button
                type="button"
                onClick={() => setPaymentMode("ONE_TIME")}
                className={`w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMode === "ONE_TIME"
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>One-Time Upfront (₹14,999)</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-black tracking-wide uppercase ${
                  paymentMode === "ONE_TIME" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  Save ₹21,001
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("EMI")}
                className={`w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMode === "EMI"
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Monthly EMI (₹3,000 / month)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                  paymentMode === "EMI" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800"
                }`}>
                  2 Mo. Activation
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="w-full max-w-4xl mx-auto mt-12 bg-white border-2 border-brand-blue/80 rounded-3xl shadow-xl shadow-brand-blue/10 overflow-hidden">
          {/* Top Announcement Banner */}
          <div className="bg-gradient-to-r from-brand-blue via-sky-600 to-indigo-600 text-white px-6 py-3 flex flex-wrap items-center justify-between text-xs font-bold gap-2">
            <span className="flex items-center gap-1.5">
              <Badge variant="secondary" className="bg-white text-brand-blue font-black text-[10px]">
                12-MONTH CONTRACT
              </Badge>
              All 12+ Modules Unlocked: WhatsApp API + Google Ads + Meta Ads + Reviews + AI Agent
            </span>
            <span className="text-sky-100">
              {paymentMode === "ONE_TIME"
                ? "Full 1-Year Paid in Advance"
                : "2-Month Activation + 10 Fixed Monthly EMIs"}
            </span>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: What's Included */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-blue">
                  Comprehensive Platform Access
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Jisnu CRM Complete Annual Suite
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Full production access to all 12+ workspace modules with 1-click channel connections for an entire year.
                </p>
              </div>

              {/* Payment Mode Highlight Box */}
              {isEmi ? (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <CalendarCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-black">Monthly EMI Payment Structure</span>
                  </div>
                  <ul className="text-slate-700 text-xs space-y-1.5 list-disc pl-4">
                    <li>
                      <span className="font-bold text-slate-900">First 2 Months Compulsory (₹6,000):</span> Due today for workspace activation and onboarding setup.
                    </li>
                    <li>
                      <span className="font-bold text-slate-900">Subsequent EMIs (₹3,000 / month):</span> Fixed monthly installment for the remaining 10 months of your annual contract.
                    </li>
                    <li>
                      <span className="font-bold text-slate-900">Uninterrupted Access:</span> Workspace stays active throughout your 1-year contract as EMIs are completed.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-black">One-Time Annual Payment Discount</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    Pay upfront and get the entire 12-month annual suite for just <span className="font-bold text-emerald-800">₹14,999</span> instead of ₹36,000 (12 × ₹3,000). You save <span className="font-bold text-emerald-700">₹21,001 (58% OFF)</span> with zero monthly recurring worries.
                  </p>
                </div>
              )}

              {/* Bring Any LLM Key Spotlight */}
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-950 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-brand-blue">
                  <Bot className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm font-black">Bring Any LLM Key of Your Choice</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Connect any AI model (OpenAI GPT, Google Gemini, or Claude). Power your 24/7 autonomous chatbot, auto-replies, and ad copy directly with your own LLM key with total data control and freedom.
                </p>
              </div>

              {/* 1-Click Features List */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Included in This Package:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "1-Click Official Meta WhatsApp Cloud API",
                    "1-Click Google Ads & Campaign Manager",
                    "1-Click Meta (FB & Instagram) Ads Suite",
                    "1-Click Google Business Profile Reviews Sync",
                    "Visual Drag-and-Drop Chatbot Builder",
                    "Multi-Agent Unified Customer Team Inbox",
                    "Autonomous 24/7 AI Knowledge Base Agent",
                    "Instagram DM & Comment Auto-Replies",
                    "Gmail Auto-Replies & AI Drafting",
                    "Google Calendar Appointment Booking",
                    "YouTube Comment & Sentiment Sync",
                    "Dedicated Multi-Tenant Database Isolation"
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Clean Pricing Summary & Channel Add-on */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
              <div className="space-y-5">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isEmi ? "EMI Initial Activation (2 Months)" : "Full Year Upfront Payment"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-500">₹</span>
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {baseUpfront.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 ml-1">
                      {isEmi ? "(for First 2 Months)" : "/year"}
                    </span>
                  </div>
                  {isEmi ? (
                    <p className="text-xs text-slate-600 font-semibold mt-1.5">
                      Subsequent 10 months fixed at ₹3,000 / month
                    </p>
                  ) : (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Save ₹{oneTimeSavings.toLocaleString("en-IN")} vs monthly EMI</span>
                    </div>
                  )}
                </div>

                {/* Multi-Channel Account Add-On Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Extra Channel Accounts
                      </span>
                      <p className="text-[11px] text-slate-500">
                        +₹2,000 / additional account (WhatsApp, YouTube, etc.)
                      </p>
                    </div>
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setExtraChannels(Math.max(0, extraChannels - 1))}
                        disabled={extraChannels === 0}
                        className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-700 cursor-pointer"
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
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                        title="Add extra channel"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clean Price Display (GST details kept for checkout modal) */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {isEmi ? "2 Months Compulsory Base:" : "Full Year Base Plan:"}
                    </span>
                    <span className="font-semibold">₹{baseUpfront.toLocaleString("en-IN")}</span>
                  </div>
                  {extraChannels > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {extraChannels} Extra Account(s) (₹2,000 each):
                      </span>
                      <span className="font-semibold">₹{extraChannelsCost.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {isEmi && (
                    <div className="flex justify-between text-slate-500 italic border-t border-slate-100 pt-1 text-[11px]">
                      <span>Remaining 10 EMIs:</span>
                      <span>₹3,000 / month</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                    <span>Due for Activation:</span>
                    <span className="text-brand-blue text-base">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <div>
                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-blue/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Select &amp; Subscribe</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Setup • 1-Click Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-4xl mx-auto mt-16 pt-10 border-t border-slate-200">
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

      {/* Checkout Modal (Shows final invoice with GST at payment time) */}
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
                  Jisnu CRM 1-Year Suite ({isEmi ? "EMI 2-Mo Activation" : "One-Time Payment"})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Base: ₹{baseUpfront.toLocaleString("en-IN")}
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
                /* Success Activation Screen */
                <div className="text-center py-6 space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900">Subscription Active!</h4>
                  <p className="text-sm text-slate-600">
                    Your account and organization workspace have been provisioned successfully with all modules unlocked.
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400">Organization:</span>{" "}
                      <span className="font-bold text-slate-900">{successData.user.organizationName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Login Email:</span>{" "}
                      <span className="font-bold text-slate-900">{successData.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Contract:</span>{" "}
                      <span className="font-bold text-brand-blue">1-Year Annual Suite</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment Option:</span>{" "}
                      <span className="font-bold text-slate-900">
                        {successData.subscription.paymentMode === "EMI"
                          ? `EMI (2 Months Paid, 10 Months Remaining @ ₹3,000/mo)`
                          : `One-Time Full Year Paid`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/whatsapp")}
                    className="w-full py-3 px-4 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-sm transition-all shadow-md cursor-pointer"
                  >
                    Go to Your Workspace Dashboard →
                  </button>
                </div>
              ) : (
                /* Registration & Checkout Form */
                <form onSubmit={handleProcessCheckout} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

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
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@yourbusiness.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
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
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  </div>

                  {/* Payment Invoice Summary with GST */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>
                        {isEmi
                          ? "First 2 Months Compulsory (₹3,000 × 2):"
                          : "1-Year Plan Base Price:"}
                      </span>
                      <span className="font-semibold">₹{baseUpfront.toLocaleString("en-IN")}</span>
                    </div>
                    {extraChannels > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>{extraChannels} Extra Account(s):</span>
                        <span className="font-semibold">₹{extraChannelsCost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 border-t border-slate-200/80 pt-1">
                      <span>Taxable Subtotal:</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%):</span>
                      <span className="font-semibold">₹{gstAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 text-sm">
                      <span>Total Due for Activation:</span>
                      <span className="text-brand-blue">₹{grandTotalWithGst.toLocaleString("en-IN")}</span>
                    </div>
                    {isEmi && (
                      <p className="text-[11px] text-slate-500 pt-1 italic">
                        * Remaining 10 monthly EMIs will be ₹3,000 (+18% GST) per month.
                      </p>
                    )}
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
                            Pay ₹{grandTotalWithGst.toLocaleString("en-IN")} &amp; Unlock CRM
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
