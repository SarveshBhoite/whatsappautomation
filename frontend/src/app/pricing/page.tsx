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
  EyeOff,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Share2,
  Globe,
  Calendar,
  Inbox,
  Clock,
  Tag
} from "lucide-react";
import Footer from "@/components/Footer";
import HeroShowcase from "@/components/home/HeroShowcase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Instagram SVG Icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// YouTube SVG Icon
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.866.553 9.388.553 9.388.553s7.522 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export type PlanKey = "annual";

interface PlanItem {
  code: PlanKey;
  name: string;
  durationLabel: string;
  durationMonths: number;
  basePrice: number;
  originalPrice: number;
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

// 12 Standalone CRM Modules Valuation (Total Standalone Value: ₹72,000 / Year)
export const INDIVIDUAL_MODULES = [
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API Suite",
    desc: "Official Meta Embedded Connect, verified template broadcasts & multi-agent routing.",
    individualYearlyPrice: 12000,
    individualMonthlyRate: 1000,
    marketComparison: "Wati / AiSensy (₹1,500/mo)",
    icon: MessageSquare,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tag: "Core Messaging"
  },
  {
    id: "google_ads",
    name: "Google Ads Manager",
    desc: "1-Click Search & Performance Max suite with AI keyword bids and instant attribution.",
    individualYearlyPrice: 10000,
    individualMonthlyRate: 833,
    marketComparison: "AdEspresso / Agency suites ($49/mo)",
    icon: BarChart3,
    color: "text-sky-500",
    bgColor: "bg-sky-50 text-sky-700 border-sky-200",
    tag: "Search Ads"
  },
  {
    id: "meta_ads",
    name: "Meta (FB & IG) Ads Manager",
    desc: "Direct lead generation forms sync to team inbox and instant WhatsApp triggers.",
    individualYearlyPrice: 8000,
    individualMonthlyRate: 667,
    marketComparison: "LeadsBridge / Zapier ($30/mo)",
    icon: Share2,
    color: "text-blue-500",
    bgColor: "bg-blue-50 text-blue-700 border-blue-200",
    tag: "Social Ads"
  },
  {
    id: "ai_agent",
    name: "Autonomous 24/7 AI Agent",
    desc: "Bring Any LLM Key (OpenAI, Claude, Gemini) with zero per-token markup & private context.",
    individualYearlyPrice: 8000,
    individualMonthlyRate: 667,
    marketComparison: "Custom AI Bot SaaS (₹18,000/yr)",
    icon: Bot,
    color: "text-purple-500",
    bgColor: "bg-purple-50 text-purple-700 border-purple-200",
    tag: "Intelligence"
  },
  {
    id: "chatbot",
    name: "Drag-and-Drop Chatbot Builder",
    desc: "Visual workflow designer with branching conditions, qualification paths & CRM updates.",
    individualYearlyPrice: 6000,
    individualMonthlyRate: 500,
    marketComparison: "ManyChat Pro ($25/mo)",
    icon: MessageCircle,
    color: "text-teal-500",
    bgColor: "bg-teal-50 text-teal-700 border-teal-200",
    tag: "Automation"
  },
  {
    id: "reviews",
    name: "Google Reviews Sync & AI Replies",
    desc: "Google Business Profile reviews sync, sentiment analysis & 100% automated AI brand replies.",
    individualYearlyPrice: 6000,
    individualMonthlyRate: 500,
    marketComparison: "Birdeye / Podium ($30/mo)",
    icon: Star,
    color: "text-amber-500",
    bgColor: "bg-amber-50 text-amber-700 border-amber-200",
    tag: "Reputation"
  },
  {
    id: "inbox",
    name: "Multi-Agent Unified Team Inbox",
    desc: "Unified customer workspace for WhatsApp, Instagram, Gmail, and Google Review chats.",
    individualYearlyPrice: 5000,
    individualMonthlyRate: 417,
    marketComparison: "Freshdesk / Zendesk Seats",
    icon: Inbox,
    color: "text-brand-blue",
    bgColor: "bg-sky-50 text-sky-700 border-sky-200",
    tag: "Collaboration"
  },
  {
    id: "instagram",
    name: "Instagram DM & Comments Auto-Bot",
    desc: "Keyword triggered direct replies on reels, posts & automated lead capturing.",
    individualYearlyPrice: 5000,
    individualMonthlyRate: 417,
    marketComparison: "ManyChat IG Pro ($20/mo)",
    icon: InstagramIcon,
    color: "text-rose-500",
    bgColor: "bg-rose-50 text-rose-700 border-rose-200",
    tag: "Social Growth"
  },
  {
    id: "gmail",
    name: "Gmail AI Automation",
    desc: "Smart inbox sync, automated AI response drafts & high-converting follow-up sequences.",
    individualYearlyPrice: 4000,
    individualMonthlyRate: 333,
    marketComparison: "Mailshake / GMass ($20/mo)",
    icon: Mail,
    color: "text-orange-500",
    bgColor: "bg-orange-50 text-orange-700 border-orange-200",
    tag: "Email Outreach"
  },
  {
    id: "calendar",
    name: "Google Calendar Booking Sync",
    desc: "Direct meet scheduling, slot conflict resolution & instant calendar invitations.",
    individualYearlyPrice: 3000,
    individualMonthlyRate: 250,
    marketComparison: "Calendly Standard ($12/mo)",
    icon: Calendar,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    tag: "Scheduling"
  },
  {
    id: "linkedin",
    name: "LinkedIn Post Scheduler & B2B CRM",
    desc: "Plan and schedule B2B content, track executive page engagement and capture B2B leads.",
    individualYearlyPrice: 3000,
    individualMonthlyRate: 250,
    marketComparison: "Buffer / Hootsuite ($15/mo)",
    icon: Globe,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    tag: "B2B Pipeline"
  },
  {
    id: "youtube",
    name: "YouTube Sentiment Sync",
    desc: "Video comment listener, spam shield & automated brand responses right from CRM.",
    individualYearlyPrice: 2000,
    individualMonthlyRate: 167,
    marketComparison: "Brand Monitoring tools",
    icon: YoutubeIcon,
    color: "text-red-500",
    bgColor: "bg-red-50 text-red-700 border-red-200",
    tag: "Video CRM"
  }
];

export const TOTAL_STANDALONE_VALUE = INDIVIDUAL_MODULES.reduce((sum, m) => sum + m.individualYearlyPrice, 0);

const PLANS: PlanItem[] = [
  {
    code: "annual",
    name: "All-in-One Annual Plan",
    durationLabel: "1 Year / 12 Months",
    durationMonths: 12,
    basePrice: 14999,
    originalPrice: 72000,
    effectiveMonthlyRate: 1250,
    tagline: "Complete enterprise CRM automation with all 12 modules unlocked for the entire year.",
    isRecommended: true,
    badge: "SPECIAL LIMITED TIME OFFER • VALID TILL 31 DEC",
    savingsText: "Save ₹57,001 (79% OFF Official Total Value)",
    tierTheme: {
      accentPill: "bg-sky-50 text-brand-blue border-sky-200",
      borderActive: "border-brand-blue",
      badgeBg: "bg-gradient-to-r from-brand-blue via-emerald-600 to-amber-500 text-white",
      highlightLabel: "All 12 Modules Included"
    },
    features: [
      "1-Click Official Meta WhatsApp Cloud API (₹12,000 Value)",
      "1-Click Google Ads & Meta Ads Suite (₹18,000 Value)",
      "Google Business Profile Reviews Sync & AI Replies (₹6,000 Value)",
      "Visual Drag-and-Drop Chatbot Builder (₹6,000 Value)",
      "Multi-Agent Unified Customer Team Inbox (₹5,000 Value)",
      "Autonomous 24/7 AI Knowledge Base Agent (₹8,000 Value)",
      "Instagram DM & Comment Auto-Replies (₹5,000 Value)",
      "Gmail AI Drafting & Auto-Replies (₹4,000 Value)",
      "Google Calendar Appointment Booking (₹3,000 Value)",
      "LinkedIn Post Scheduler & B2B Pipeline (₹3,000 Value)",
      "YouTube Comment & Sentiment Sync (₹2,000 Value)",
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

  // Billing Mode State: "upfront" | "emi"
  const [billingMode, setBillingMode] = useState<"upfront" | "emi">("upfront");
  // Sub-EMI Option State: "autopay" (Company Direct Monthly AutoPay) | "bank_emi" (Bank / NBFC Instant Loan EMI)
  const [selectedEmiType, setSelectedEmiType] = useState<"autopay" | "bank_emi">("autopay");

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

  const activePlan = PLANS.find((p) => p.code === selectedPlanCode) || PLANS[0];

  // Price calculation based on user selection:
  // Option 1: Full Upfront Payment = 14,999 + 18% GST (₹17,698.82)
  // Option 2 (AutoPay EMI) & Option 3 (Card EMI) = 30,000 + 18% GST (₹35,400.00)
  const basePrice = billingMode === "emi" ? 30000 : activePlan.basePrice;
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
      // 1. Create order on backend (Server calculates trusted amount based on plan & billingMode)
      const orderRes = await fetch(`${BACKEND_URL}/api/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlanCode,
          extraChannels,
          billingMode,
          emiType: selectedEmiType,
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
        const orderDescription =
          billingMode === "upfront"
            ? `${activePlan.name} (12 Months Access)`
            : selectedEmiType === "autopay"
            ? "1st Month Downpayment (₹6,000) • 12 Months Access"
            : "Annual Plan (Bank / Card EMI)";

        const options: any = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: "Jisnu CRM",
          description: orderDescription,
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

        // Strict Payment Method Filtering:
        // Option 1: One-time full payment (₹14,999 + GST) -> NO EMI. Only UPI, Cards, Netbanking.
        // Option 2: AutoPay EMI -> UPI AutoPay / e-NACH mandate only.
        // Option 3: Card / Bank EMI -> Credit card & Debit card EMI only.
        if (billingMode === "upfront") {
          options.config = {
            display: {
              blocks: {
                standard: {
                  name: "Pay Full (No EMI)",
                  instruments: [
                    { method: "upi" },
                    { method: "card" },
                    { method: "netbanking" },
                    { method: "wallet" },
                  ],
                },
              },
              sequence: ["block.standard"],
              preferences: {
                show_default_blocks: false,
              },
            },
          };
        } else if (billingMode === "emi" && selectedEmiType === "autopay") {
          options.config = {
            display: {
              blocks: {
                autopay: {
                  name: "UPI AutoPay & Mandate Only",
                  instruments: [
                    { method: "upi" },
                  ],
                },
              },
              sequence: ["block.autopay"],
              preferences: {
                show_default_blocks: false,
              },
            },
          };
        } else if (billingMode === "emi" && selectedEmiType === "bank_emi") {
          options.config = {
            display: {
              blocks: {
                emi: {
                  name: "Card & Bank EMI Only",
                  instruments: [
                    {
                      method: "emi",
                    },
                  ],
                },
              },
              sequence: ["block.emi"],
              preferences: {
                show_default_blocks: false,
              },
            },
          };
        }

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
          billingMode,
          emiType: selectedEmiType,
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
      if (user.email) localStorage.setItem("user_email", user.email);
      if (phone.trim()) localStorage.setItem("user_phone", phone.trim());
      if (organizationName.trim()) localStorage.setItem("organization_name", organizationName.trim());
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

        {/* ── Interactive Billing Mode Switcher (Pay Upfront vs EMI & AutoPay) ── */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="p-1.5 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-inner flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setBillingMode("upfront")}
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                billingMode === "upfront"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200/80 ring-2 ring-brand-blue/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-brand-blue" />
              <span>Pay Upfront (Save 79% • ₹14,999)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Best Value
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBillingMode("emi")}
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                billingMode === "emi"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-200/80 ring-2 ring-brand-blue/30"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4 text-brand-orange" />
              <span>Flexible Monthly / EMI</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                2 Easy Options
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {billingMode === "upfront"
              ? "✓ Pay once, enjoy full 12 months with ₹57,001 savings (Offer till 31 Dec)"
              : "✓ Low monthly commitment with instant full-suite workspace activation"}
          </p>
        </div>

        {/* ── Content View 1: Upfront One-Time Payment (₹14,999 / Year) ── */}
        {billingMode === "upfront" && (
          <div className="w-full max-w-5xl mx-auto mt-6 animate-in fade-in duration-300">
            {(() => {
              const plan = PLANS[0];
              const cardExtraCost = extraChannels * EXTRA_CHANNEL_PRICE;
              const cardSubtotal = plan.basePrice + cardExtraCost;
              const cardGst = Math.round(cardSubtotal * (GST_PERCENTAGE / 100) * 100) / 100;
              const cardTotalWithGst = Math.round((cardSubtotal + cardGst) * 100) / 100;

              return (
                <div className="relative rounded-3xl bg-gradient-to-b from-sky-50/90 via-white to-white border-2 border-brand-blue shadow-2xl shadow-brand-blue/15 p-6 sm:p-10 ring-4 ring-brand-blue/10 overflow-hidden">
                  {/* Special Offer Ribbon Badge */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-l from-amber-500 via-brand-orange to-brand-blue text-white font-black text-[11px] sm:text-xs py-1.5 px-6 rounded-bl-2xl shadow-md uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Special Offer • Valid Till 31st Dec</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Column: Plan Details & Value Hook */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          <span>All 12 Platform Modules Unlocked</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                          {plan.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {plan.tagline} Includes full access to WhatsApp Cloud API, Google Ads, Meta Ads, AI Chatbots, Team Inbox, and Google Reviews.
                        </p>
                      </div>

                      {/* Anchoring Comparison Box */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Official Total Module Worth
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-400 line-through">
                              ₹{formatINR(plan.originalPrice)} / year
                            </span>
                          </div>
                          <div className="sm:text-right">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase">
                              <Tag className="w-3.5 h-3.5" />
                              79% Instant Savings
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                              Official Special Offer (In this Year)
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-2xl font-bold text-brand-blue">₹</span>
                              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                                {formatINR(cardSubtotal)}
                              </span>
                              <span className="text-xs font-bold text-slate-500">/ 12 Months</span>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Effective Cost</span>
                            <span className="text-base sm:text-lg font-black text-emerald-600">
                              ~₹{formatINR(plan.effectiveMonthlyRate)} / month
                            </span>
                            <span className="text-[10px] text-slate-400 block">Single upfront payment</span>
                          </div>
                        </div>

                        {/* GST & Extra Channels Breakdown */}
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>18% GST (Tax Invoice provided):</span>
                            <span className="font-bold text-slate-800">₹{formatINR(cardGst, true)}</span>
                          </div>
                          {extraChannels > 0 && (
                            <div className="flex items-center justify-between">
                              <span>{extraChannels} Extra Channel Account(s):</span>
                              <span className="font-bold text-brand-blue">+₹{formatINR(cardExtraCost)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between font-black text-slate-900 pt-1 border-t border-slate-100 text-sm">
                            <span>Total Amount Payable:</span>
                            <span className="text-brand-blue text-base">₹{formatINR(cardTotalWithGst, true)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCheckoutForPlan(plan.code)}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-blue via-sky-600 to-brand-blue-deep hover:brightness-110 text-white font-black text-base flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-blue/25 ring-2 ring-brand-blue/30 cursor-pointer"
                      >
                        <span>Unlock All 12 Modules for ₹14,999</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                      <p className="text-center text-xs text-slate-500 font-medium">
                        🔒 Zero hidden charges • Instant Razorpay verification • Full 12-month access
                      </p>
                    </div>

                    {/* Right Column: Key Inclusions Checklist */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Everything Included in ₹14,999:
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          12/12 Live
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <div className="h-4 w-4 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                            <span className="font-medium text-slate-800 leading-tight">{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-[11px] text-slate-600 leading-relaxed">
                        💡 <strong>Save ₹57,001:</strong> When bought individually, these 12 modules cost ₹72,000/yr. The ₹14,999 package unlocks the full ecosystem.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Content View 2: Flexible EMI & AutoPay Choices (Side-by-Side Comparison) ── */}
        {billingMode === "emi" && (
          <div className="w-full max-w-5xl mx-auto mt-6 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Option 1: Company Direct AutoPay */}
              <div className="relative rounded-3xl bg-white border-2 border-slate-200 hover:border-brand-blue/60 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-black text-[11px] uppercase tracking-wider border border-emerald-200">
                      Option 1: Company Direct AutoPay
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 12 Months Full Service
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      ₹6,000 Downpayment + 10 Months EMI
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay ₹6,000 today as 1st month downpayment, then ₹3,000/month for next 10 months. EMI completes in 11 months, enjoy full 12 months CRM service!
                    </p>
                  </div>

                  {/* Monthly Pricing Block */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1st Month Downpayment:</span>
                      <span className="text-xl font-black text-brand-blue">₹6,000 <span className="text-xs text-slate-400 font-normal">(Day 1)</span></span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next 10 Months EMI:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">₹3,000</span>
                        <span className="text-xs font-bold text-slate-500"> / month</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                      <span>Total EMI Tenure:</span>
                      <span className="font-bold text-slate-800">11 Months Completed</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <span>Service Duration Unlocked:</span>
                      <span>Full 12 Months Access (1 Month Free Bonus)</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>UPI AutoPay:</strong> GPay, PhonePe, Paytm (Instant Auto-Debit)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Debit Card e-NACH:</strong> All major Indian banks supported</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Complete 12-Month Access:</strong> Zero lock-in, pause or manage anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All 12 CRM platform modules unlocked immediately from Day 1</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmiType("autopay");
                      handleOpenCheckoutForPlan("annual");
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <span>Pay ₹6,000 Downpayment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[10px] text-slate-400">
                    ₹6,000 today • Then ₹3,000/mo for 10 months via AutoPay
                  </p>
                </div>
              </div>

              {/* Option 2: Dynamic Bank / Cardless NBFC Loan EMI */}
              <div className="relative rounded-3xl bg-gradient-to-b from-sky-50/70 via-white to-white border-2 border-brand-blue p-6 sm:p-8 flex flex-col justify-between shadow-xl ring-2 ring-brand-blue/20 transition-all space-y-6">
                {/* Popular Badge */}
                <div className="absolute -top-3.5 right-6">
                  <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-blue to-emerald-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                    Instant Bank Approval
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-brand-blue font-black text-[11px] uppercase tracking-wider">
                      Option 2: Bank &amp; Cardless Loan EMI
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Live Bank Rates
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Dynamic Bank &amp; Card EMI
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Instant 1-year workspace access unlocked directly with flexible monthly installments across credit cards, debit cards, and pre-approved loans.
                    </p>
                  </div>

                  {/* Clean Customer Facing EMI Block */}
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starting Monthly EMI:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-brand-blue">₹2,800 – ₹2,950</span>
                        <span className="text-xs font-bold text-slate-500"> / month</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-xs text-slate-600">
                      <span>EMI Tenures Available:</span>
                      <span className="font-semibold text-slate-800">3, 6, 9 &amp; 12 Months</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-xs text-brand-blue font-bold bg-sky-100/60 p-2 rounded-xl border border-sky-200">
                      <span>Affordability Guarantee:</span>
                      <span>Never more than ₹3,000 / month</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>All Major Banks:</strong> HDFC, SBI, ICICI, Axis, Kotak, Bank of Baroda</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Cardless &amp; NBFC Pre-approved:</strong> ZestMoney, EarlySalary, KreditBee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Instant Digital Activation:</strong> Full CRM unlocked without paperwork</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All 12 CRM platform modules unlocked immediately from Day 1</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmiType("bank_emi");
                      handleOpenCheckoutForPlan("annual");
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-deep hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-blue/30 cursor-pointer"
                  >
                    <span>Check Bank EMI Options</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[10px] text-slate-400">
                    Live bank rates shown instantly at checkout • Instant approval
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Comparison Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Tip for Maximum Savings:</strong> If you can pay upfront, the <strong>One-Time ₹14,999 Offer</strong> saves you an extra ₹19,500+ compared to any monthly installment!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBillingMode("upfront")}
                className="font-bold text-brand-blue hover:underline whitespace-nowrap cursor-pointer text-xs"
              >
                Switch to ₹14,999 Upfront →
              </button>
            </div>
          </div>
        )}

        {/* ── Individual Module Pricing Breakdown (12 Modules Separately = ₹72,000 / Year) ── */}
        <section className="w-full max-w-5xl mx-auto mt-16 pt-10 border-t border-slate-200 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              <Tag className="w-3.5 h-3.5 text-brand-blue" />
              <span>STANDALONE VALUATION BREAKDOWN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Individual Charges if Purchased Separately
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If purchased as separate point solutions across the industry, each module carries the following 12-month standalone price (Total: ₹72,000 / Year).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDIVIDUAL_MODULES.map((mod, idx) => {
              const ModIcon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl bg-slate-100 text-slate-700`}>
                          <ModIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Module {idx + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {mod.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[34px]">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-medium">Standalone 12-Month Rate:</span>
                      <span className="text-base font-black text-slate-900">
                        ₹{formatINR(mod.individualYearlyPrice)} / yr
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Equiv. Monthly:</span>
                      <span className="font-semibold text-slate-600">~₹{formatINR(mod.individualMonthlyRate)}/mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-0.5">
                      Market Comparison: {mod.marketComparison}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cumulative Summary Box */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Individual Value Across All 12 Modules
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 justify-center md:justify-start">
                <span className="line-through text-slate-500">₹72,000 / year</span>
                <span className="text-emerald-400 text-base sm:text-lg font-bold">→ Only ₹14,999 in Official 2026 Offer</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCheckoutForPlan("annual")}
              className="py-3 px-6 rounded-xl bg-brand-blue hover:bg-brand-blue-deep text-white font-black text-xs sm:text-sm shadow-md shadow-brand-blue/30 cursor-pointer shrink-0"
            >
              Get All 12 Modules at ₹14,999 →
            </button>
          </div>
        </section>

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

                  {/* Selected Plan & Payment Mode Display Inside Modal */}
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{PLANS[0].name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {billingMode === "upfront" ? "Upfront (12 Mos)" : selectedEmiType === "autopay" ? "Option 1: AutoPay" : "Option 2: Bank Loan EMI"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {billingMode === "upfront"
                          ? "All 12 Modules Included • ₹72,000 value for ₹14,999 (Valid till 31 Dec)"
                          : selectedEmiType === "autopay"
                          ? "₹6,000 Downpayment Today • Next 10 Months ₹3,000/mo (11 Mos EMI, 12 Mos Service)"
                          : "Flexible Bank & Cardless EMI (From ₹2,800/mo) • Instant Full 1-Year Access"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {billingMode === "upfront" ? (
                        <>
                          <span className="text-xs font-bold text-slate-400 line-through block">₹72,000</span>
                          <span className="text-base font-black text-brand-blue">₹{formatINR(PLANS[0].basePrice)}</span>
                        </>
                      ) : selectedEmiType === "autopay" ? (
                        <>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Due Today</span>
                          <span className="text-sm font-black text-brand-blue">₹6,000</span>
                          <span className="block text-[9px] text-slate-500 font-medium">+10x ₹3,000/mo</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting at</span>
                          <span className="text-sm font-black text-brand-blue">₹2,800/mo</span>
                          <span className="block text-[9px] text-emerald-600 font-bold">Max ₹3,000/mo</span>
                        </>
                      )}
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
                    {billingMode === "upfront" ? (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>{activePlan.name} (Full Payment):</span>
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
                          <span>Price Summary:</span>
                          <span className="text-brand-blue font-black text-base">₹{formatINR(grandTotalWithGst, true)}</span>
                        </div>
                      </>
                    ) : selectedEmiType === "autopay" ? (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>12 Months AutoPay Plan:</span>
                          <span className="font-semibold">₹30,000</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST (18%):</span>
                          <span className="font-semibold">₹{formatINR(gstAmount, true)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 border-t border-slate-200/80 pt-1">
                          <span>EMI Schedule:</span>
                          <span className="font-bold text-slate-800">₹6,000 Downpayment + 10x ₹3,000/mo</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200 text-xs font-bold">
                          <span>Service Duration:</span>
                          <span>Full 12 Months Active CRM Service</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 text-sm">
                          <span>Price Summary (Total Order Value):</span>
                          <span className="text-brand-blue font-black text-base">₹{formatINR(grandTotalWithGst, true)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>12 Months Bank &amp; Card Loan Value:</span>
                          <span className="font-semibold">₹30,000</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST (18%):</span>
                          <span className="font-semibold">₹{formatINR(gstAmount, true)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 border-t border-slate-200/80 pt-1">
                          <span>Allowed EMI Tenures:</span>
                          <span className="font-bold text-slate-900">3, 6, 9 &amp; 12 Months Only</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Starting Monthly EMI:</span>
                          <span className="font-bold text-brand-blue">₹2,800 – ₹2,950 / month</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200 text-xs font-bold">
                          <span>Service Duration Match:</span>
                          <span>Full 12 Months Access (18/24 Months Prohibited)</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 text-sm">
                          <span>Price Summary (Total Order Value):</span>
                          <span className="text-brand-blue font-black text-base">₹{formatINR(grandTotalWithGst, true)}</span>
                        </div>
                      </>
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
                      ) : billingMode === "upfront" ? (
                        <>
                          <span>Pay ₹{formatINR(grandTotalWithGst, true)} &amp; Unlock CRM</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : selectedEmiType === "autopay" ? (
                        <>
                          <span>Setup AutoPay (₹{formatINR(grandTotalWithGst, true)})</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Proceed to Card EMI (₹{formatINR(grandTotalWithGst, true)})</span>
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
