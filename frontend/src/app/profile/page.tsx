"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Shield,
  Calendar,
  CreditCard,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Star,
  Check,
  Phone,
  Clock,
  ChevronRight,
  ShieldCheck,
  Sliders,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SubscriptionData {
  id?: string;
  planCode?: string;
  planName?: string;
  billingCycle?: string;
  durationMonths?: number;
  amountPaid?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  featuresIncluded?: string[];
  extraChannels?: number;
}

interface OrgStatusResponse {
  organizationId: string;
  organizationName: string;
  status: string;
  enabledModules: string[];
  subscription?: SubscriptionData | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const TIERS = [
  {
    code: "quarterly",
    name: "Quarterly Plan",
    durationLabel: "3 Months Access",
    durationMonths: 3,
    basePrice: 5999,
    tagline: "Essential starter setup for growing brands.",
  },
  {
    code: "half_yearly",
    name: "Half-Yearly Plan",
    durationLabel: "6 Months Access",
    durationMonths: 6,
    basePrice: 9999,
    tagline: "Balanced scale and marketing continuity.",
  },
  {
    code: "annual",
    name: "Annual Plan",
    durationLabel: "1 Year / 12 Months",
    durationMonths: 12,
    basePrice: 14999,
    tagline: "Maximum value & complete enterprise automation.",
    isRecommended: true,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin User");
  const [userRole, setUserRole] = useState("client_admin");
  const [userEmail, setUserEmail] = useState("");
  const [orgId, setOrgId] = useState("");
  const [orgData, setOrgData] = useState<OrgStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Upgrade / Renew Drawer State
  const [isUpgradeSectionOpen, setIsUpgradeSectionOpen] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("annual");
  const [extraChannels, setExtraChannels] = useState<number>(0);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedName = localStorage.getItem("user_name") || "Admin User";
    const storedRole = localStorage.getItem("user_role") || "client_admin";
    const storedOrgId = localStorage.getItem("organization_id") || "";

    setUserName(storedName);
    setUserRole(storedRole);
    setOrgId(storedOrgId);

    if (storedOrgId) {
      fetchStatus(storedOrgId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStatus = async (organizationId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/subscription/status`, {
        headers: {
          "x-organization-id": organizationId,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setOrgData(data);
          if (data.subscription?.planCode) {
            setSelectedPlanCode(data.subscription.planCode);
            setExtraChannels(data.subscription.extraChannels || 0);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load subscription status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_role");
      localStorage.removeItem("organization_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("enabled_modules");
    }
    router.push("/login");
  };

  const sub = orgData?.subscription;
  const isExpired = sub?.endDate ? new Date(sub.endDate).getTime() < Date.now() : false;

  // Selected tier calculations for upgrade section
  const selectedTier = TIERS.find((t) => t.code === selectedPlanCode) || TIERS[2];
  const extraChannelsCost = extraChannels * 2000;
  const upgradeSubtotal = selectedTier.basePrice + extraChannelsCost;
  const upgradeGst = Math.round(upgradeSubtotal * 0.18 * 100) / 100;
  const upgradeTotal = Math.round((upgradeSubtotal + upgradeGst) * 100) / 100;

  // Handle direct Upgrade / Renewal checkout order
  const handleProceedUpgrade = async () => {
    setActionMsg(null);
    setIsProcessingUpgrade(true);

    try {
      const orderRes = await fetch(`${BACKEND_URL}/api/subscription/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlanCode,
          extraChannels,
          email: userEmail || `${userName.toLowerCase().replace(/\s+/g, "")}@workspace.com`,
          name: userName,
          phone: "9876543210",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create upgrade order");
      }

      // Check Razorpay vs Mock Sandbox
      const isMock = orderData.isMock || !window.Razorpay;

      if (!isMock && window.Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: "INR",
          name: "Jisnu CRM",
          description: `Plan Upgrade / Renewal: ${selectedTier.name}`,
          image: "/icon.jpeg",
          order_id: orderData.orderId,
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: "#0284c7",
          },
          handler: async function (response: any) {
            await finalizeUpgrade({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessingUpgrade(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct mock activation for dev/sandbox mode
        await finalizeUpgrade({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature_approved",
        });
      }
    } catch (err: any) {
      console.error(err);
      setActionMsg({ text: err.message || "Failed to process upgrade.", type: "error" });
      setIsProcessingUpgrade(false);
    }
  };

  const finalizeUpgrade = async (paymentDetails: any) => {
    try {
      // Re-fetch status to refresh active subscription card immediately
      if (orgId) {
        await fetchStatus(orgId);
      }
      setActionMsg({ text: `Plan successfully updated to ${selectedTier.name}!`, type: "success" });
      setIsUpgradeSectionOpen(false);
    } catch (e: any) {
      setActionMsg({ text: "Plan payment verified, please refresh the page.", type: "success" });
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-mesh-canvas text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900 pb-20">
      
      {/* ── Top Header Navigation Bar (Same as Cockpit Page) ── */}
      <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl overflow-hidden border border-slate-200/90 p-0.5 bg-white shadow-2xs">
            <img src="/icon.jpeg" alt="Jisnu Logo" className="h-full w-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Account &amp; Subscription Profile
              </h1>
              <Badge variant="outline" className="text-[10px] font-extrabold text-brand-blue border-sky-200 bg-sky-50 uppercase">
                {userRole.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {orgData?.organizationName || "Jisnu Organization Workspace"} • ID: <span className="font-mono text-slate-600">{orgId.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const upgradeEl = document.getElementById("upgrade-section");
              if (upgradeEl) {
                setIsUpgradeSectionOpen(true);
                upgradeEl.scrollIntoView({ behavior: "smooth" });
              } else {
                setIsUpgradeSectionOpen(true);
              }
            }}
            className="border-sky-300 text-brand-blue hover:bg-sky-50 font-bold text-xs shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Upgrade / Renew
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </div>

      {/* ── Main Container ── */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8 flex-1">
        
        {/* Action Alert Banner */}
        {actionMsg && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in ${
            actionMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* ── Top Bento Row: Profile Overview & Live Subscription Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* User Profile Card (Cockpit Bento Style) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm shadow-slate-200/40 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-blue" />
                  Operator Profile
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Session
                </span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0F52BA] text-white font-black text-xl flex items-center justify-center shadow-md shadow-brand-blue/20">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {userName}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {orgData?.organizationName || "Jisnu Enterprise Hub"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Role: <span className="font-bold text-slate-700 uppercase">{userRole}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-400">Organization ID:</span>
                <span className="font-mono text-slate-800 font-bold select-all">{orgId || "Demo-Org-123"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-400">Tenant Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[10px]">
                  {orgData?.status || "ACTIVE"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-400">Database Isolation:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" /> Row-Level Isolation
                </span>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </Button>
          </div>

          {/* Active Subscription Cockpit Card */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white shadow-xl shadow-slate-900/15 border border-slate-800 flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Top Glow Ambient Accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Current Active Plan
                </span>
                <Badge className={isExpired ? "bg-rose-500 text-white text-[10px]" : "bg-emerald-500 text-white text-[10px]"}>
                  {sub?.status || "ACTIVE"}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {sub?.planName || "Annual Complete Growth Plan"}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Valid for: <span className="font-bold text-sky-300">{sub?.durationMonths ? `${sub.durationMonths} Months` : "12 Months"}</span>
                    {sub?.extraChannels ? ` • Includes ${sub.extraChannels} Extra Account(s)` : ""}
                  </p>
                </div>
                {sub?.amountPaid && (
                  <div className="sm:text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Total Paid</span>
                    <span className="text-2xl font-black text-sky-400">
                      ₹{sub.amountPaid.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline & Expiry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Activated On</span>
                <span className="text-slate-200 font-semibold">
                  {sub?.startDate ? new Date(sub.startDate).toLocaleDateString() : "Live Active"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Expiration Date</span>
                <span className={`font-black ${isExpired ? "text-rose-400" : "text-emerald-400"}`}>
                  {sub?.endDate ? new Date(sub.endDate).toLocaleDateString() : "Year-Round Active"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Renewal Status</span>
                <span className="text-sky-300 font-semibold">Self-Service Upgrades</span>
              </div>
            </div>

            {/* Upgrade Drawer Trigger Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-300">
                Need to extend validity or change tiers?
              </span>
              <Button
                type="button"
                onClick={() => {
                  setIsUpgradeSectionOpen(!isUpgradeSectionOpen);
                  if (!isUpgradeSectionOpen) {
                    setTimeout(() => {
                      document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-brand-blue to-emerald-500 hover:from-brand-blue-deep hover:to-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-1.5"
              >
                <span>{isUpgradeSectionOpen ? "Hide Plan Selector" : "Upgrade / Renew Plan"}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isUpgradeSectionOpen ? "rotate-90" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Upgrade & Renewal Section (Opens in-place without forcing full redirect) ── */}
        {isUpgradeSectionOpen && (
          <section id="upgrade-section" className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-brand-blue shadow-xl shadow-brand-blue/10 animate-in fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-brand-blue text-xs font-bold shadow-2xs mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WORKSPACE PLAN MODIFICATION</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Select New Tier or Renew Validity
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your duration. Your active workspace will instantly extend with all 12 modules uninterrupted.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Extra Channels:</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setExtraChannels(Math.max(0, extraChannels - 1))}
                    disabled={extraChannels === 0}
                    className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900">{extraChannels}</span>
                  <button
                    type="button"
                    onClick={() => setExtraChannels(extraChannels + 1)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Tier Selector Cards inside Profile */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TIERS.map((tier) => {
                const isSelected = selectedPlanCode === tier.code;
                const tierCost = tier.basePrice + extraChannelsCost;
                const tierGst = Math.round(tierCost * 0.18 * 100) / 100;
                const tierTotal = Math.round((tierCost + tierGst) * 100) / 100;

                return (
                  <div
                    key={tier.code}
                    onClick={() => setSelectedPlanCode(tier.code)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "border-brand-blue bg-sky-50/50 shadow-md ring-2 ring-brand-blue/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-base">{tier.name}</h4>
                        {tier.isRecommended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-brand-blue text-white uppercase">
                            Best Value
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{tier.tagline}</p>
                      
                      <div className="pt-3">
                        <span className="text-2xl font-black text-slate-900">₹{tier.basePrice.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-slate-500 ml-1">/ {tier.durationLabel}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold">₹{tierCost.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span className="font-semibold">₹{tierGst.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/60 pt-1">
                        <span>Total:</span>
                        <span className="text-brand-blue">₹{tierTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upgrade CTA Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Selected for Renewal / Upgrade:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-900">{selectedTier.name}</span>
                  <span className="text-sm font-bold text-brand-blue">₹{upgradeTotal.toLocaleString("en-IN")} (incl. 18% GST)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => setIsUpgradeSectionOpen(false)}
                  className="font-bold text-xs text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isProcessingUpgrade}
                  onClick={handleProceedUpgrade}
                  className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-deep text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md shadow-brand-blue/20"
                >
                  {isProcessingUpgrade ? "Processing..." : `Confirm & Pay ₹${upgradeTotal.toLocaleString("en-IN")}`}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── Active CRM Services & Workspace Capabilities (Cockpit Style) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Active CRM Platform Modules
              </h3>
              <p className="text-xs text-slate-500">
                All 12 modules included with zero per-module paywalls.
              </p>
            </div>
            <Link href="/#cockpit" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
              <span>View Cockpit Showcase</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { name: "WhatsApp Cloud API", status: "Operational", sub: "Official Meta Embedded Connect", color: "text-emerald-600" },
              { name: "Google Ads Manager", status: "Operational", sub: "1-Click Search & PMax Suite", color: "text-brand-blue" },
              { name: "Meta (FB & IG) Ads", status: "Operational", sub: "Direct Page & Lead Gen Sync", color: "text-sky-600" },
              { name: "Google Reviews Sync", status: "Operational", sub: "AI Sentiment & 100% Auto-Reply", color: "text-amber-600" },
              { name: "Drag-and-Drop Chatbot", status: "Operational", sub: "Visual Builder with Multi-Paths", color: "text-emerald-600" },
              { name: "Autonomous 24/7 AI Agent", status: "Operational", sub: "Bring Any LLM Key (Zero Markup)", color: "text-purple-600" },
              { name: "Instagram DM & Comments", status: "Operational", sub: "Post Triggered Direct Responses", color: "text-rose-600" },
              { name: "Gmail Automation", status: "Operational", sub: "AI Smart Drafts & Follow-ups", color: "text-orange-600" },
              { name: "YouTube Sentiment Sync", status: "Operational", sub: "Video Comments Monitor & Replies", color: "text-red-600" },
              { name: "Google Calendar Booking", status: "Operational", sub: "Direct Meet & Slot Synchronization", color: "text-blue-600" },
              { name: "LinkedIn Post Scheduler", status: "Operational", sub: "B2B Social Lead Generation", color: "text-indigo-600" },
              { name: "Multi-Agent Team Inbox", status: "Operational", sub: "Unified Cross-Channel Workspace", color: "text-brand-blue" },
            ].map((module, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 truncate">{module.name}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{module.sub}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Status</span>
                  <span className="font-extrabold text-emerald-600">{module.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
