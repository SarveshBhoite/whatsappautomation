"use client";
import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  Search, Trash2, Edit3, ChevronDown, Globe, Tag, Link2,
  Phone, Bell, LayoutGrid, List, Info, PlusCircle, ArrowUpRight,
  Activity, Calendar, Filter, Download, Bot, Settings, Users,
  Layers, FileText, TrendingDown, Award, Star, RotateCcw, 
  Building2, Check, Minus, BadgePercent, ShieldCheck, MessageSquare,
  Copy, ExternalLink, Sliders, LogOut, History, User, ShieldAlert,
  ShoppingBag, FlaskConical, Database, CreditCard, Clock, Sparkles,
  Monitor, Smartphone, MessageCircle, Gift, UserCheck, Mail, Compass, Video, Share2,
  Image as ImageIcon, PlayCircle, Shield
} from "lucide-react";
import { GoogleAdsProfileModal } from "@/components/ads/GoogleAdsProfileModal";
import { AssetPolicyDisapprovalsSection } from "@/components/ads/AssetPolicyDisapprovalsSection";
import { GoogleAdsAssetsSection } from "@/components/ads/GoogleAdsAssetsSection";
import { GoogleAdsAudienceSection } from "@/components/ads/GoogleAdsAudienceSection";
import { GoogleAdsBiddingSection } from "@/components/ads/GoogleAdsBiddingSection";
import { GoogleAdsReportingSection } from "@/components/ads/GoogleAdsReportingSection";
import { GoogleAdsShoppingSection } from "@/components/ads/GoogleAdsShoppingSection";
import { GoogleAdsDataManagerSection } from "@/components/ads/GoogleAdsDataManagerSection";
import { GoogleAdsBillingSection } from "@/components/ads/GoogleAdsBillingSection";
import { GoogleAdsAssetGroupsSection } from "@/components/ads/GoogleAdsAssetGroupsSection";
import { GoogleAdsBidAdjustmentsSection } from "@/components/ads/GoogleAdsBidAdjustmentsSection";
import { GoogleAdsDemographicsSection } from "@/components/ads/GoogleAdsDemographicsSection";
import { GoogleAdsContentTargetingSection } from "@/components/ads/GoogleAdsContentTargetingSection";
import { GoogleAdsKeywordTargetingSection } from "@/components/ads/GoogleAdsKeywordTargetingSection";
import { GoogleAdsSearchTermsSection } from "@/components/ads/GoogleAdsSearchTermsSection";
import { GoogleAdsAdScheduleSection } from "@/components/ads/GoogleAdsAdScheduleSection";
import { GoogleAdsEnhancedConversionsSection } from "@/components/ads/GoogleAdsEnhancedConversionsSection";
import { GoogleAdsAttributionSection } from "@/components/ads/GoogleAdsAttributionSection";
import { GoogleAdsSharedNegativeListsSection } from "@/components/ads/GoogleAdsSharedNegativeListsSection";
import { GoogleCampaignsTableSection } from "@/components/ads/GoogleCampaignsTableSection";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    const org = localStorage.getItem("organization_id");
    if (org) return org;
  }
  return "";
};

const DATE_RANGES = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Last 90 Days", value: "LAST_90_DAYS" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sc(status: string) {
  const m: Record<string, string> = {
    ENABLED: "text-emerald-700 bg-emerald-50 border-emerald-200",
    ACTIVE:  "text-emerald-700 bg-emerald-50 border-emerald-200",
    PAUSED:  "text-amber-700 bg-amber-50 border-amber-200",
    REMOVED: "text-rose-700 bg-rose-50 border-rose-200",
    OPEN:    "text-blue-700 bg-blue-50 border-blue-200",
  };
  return m[status] || "text-slate-600 bg-slate-100 border-slate-200";
}

function fmt(n: number | string, prefix = "") {
  const num = Number(n);
  if (isNaN(num) || num === undefined || num === null) return `${prefix}0`;
  return `${prefix}${num.toLocaleString()}`;
}

function api(path: string, opts?: RequestInit) {
  return fetch(`${BACKEND}/api/ads${path}`, opts);
}

// ─── Small UI components ──────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  return <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${sc(status)}`}>{status}</span>;
}

function Stat({ label, value, sub, color = "text-slate-900" }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-xs font-bold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 hover:border-blue-300 transition-all shadow-2xs group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, action, onAction }: any) {
  return (
    <div className="flex flex-col items-center py-16 gap-3 text-center px-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <p className="text-slate-900 font-bold text-base">{title}</p>
      <p className="text-slate-500 text-xs max-w-xs">{sub}</p>
      {action && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: any) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative z-10 bg-white border border-slate-200 rounded-2xl shadow-md flex flex-col max-h-[90vh] ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <input
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${props.className || ""}`}
      />
    </div>
  );
}

function Select({ label, children, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer ${props.className || ""}`}
      >
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 resize-none focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${props.className || ""}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SELECTOR DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function AccountSelector({ accounts, selected, onSelect, loading, orgId }: any) {
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function connectFromGoogle() {
    setFetching(true);
    try {
      const res = await api(`/accessible-customers?orgId=${orgId}`);
      const data = await res.json();
      if (data.customerIds?.length) {
        for (const cid of data.customerIds) {
          await api("/connect-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgId, customerId: cid })
          });
        }
        window.location.reload();
      }
    } finally {
      setFetching(false);
    }
  }

  const current = accounts.find((a: any) => a.customerId === selected);

  return (
    <div className="relative z-[60]" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all min-w-[200px] cursor-pointer shadow-2xs"
      >
        <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
        <span className="flex-1 text-left truncate">{current?.name || (selected ? `ID: ${selected}` : "Select Account")}</span>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 z-[200] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Google Ads Accounts</p>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
            {accounts.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500">No accounts saved yet</p>
                <button
                  onClick={connectFromGoogle}
                  disabled={fetching}
                  className="mt-2 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Import from Google
                </button>
              </div>
            ) : (
              accounts.map((acc: any) => (
                <button
                  key={acc.customerId}
                  onClick={() => { onSelect(acc.customerId); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-all cursor-pointer ${
                    selected === acc.customerId ? "bg-blue-50/70" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    acc.isManager ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {acc.isManager ? "M" : acc.name?.[0] || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{acc.name || `Account ${acc.customerId}`}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{acc.customerId} · {acc.currencyCode || "INR"}</p>
                  </div>
                  {selected === acc.customerId && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-slate-100 bg-slate-50">
            <button
              onClick={connectFromGoogle}
              disabled={fetching}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
            >
              {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Import accounts from Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT PICKER SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function AccountPickerScreen({
  orgId,
  onAccountSelected,
  onDisconnect,
  showToast
}: {
  orgId: string;
  onAccountSelected: (id: string) => void;
  onDisconnect?: () => void;
  showToast: (msg: string) => void;
}) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [accessibleCids, setAccessibleCids] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [customCid, setCustomCid] = useState("");
  const [logs, setLogs] = useState<{ ts: string; level: "info" | "error" | "warn"; msg: string }[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  function log(level: "info" | "error" | "warn", msg: string) {
    setLogs(prev => [{ ts: new Date().toLocaleTimeString(), level, msg }, ...prev.slice(0, 49)]);
  }

  async function fetchAccessible() {
    setLoading(true);
    log("info", `Fetching accessible customers from ${BACKEND_URL}/api/ads/accessible-customers…`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/accessible-customers?orgId=${orgId}`);
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      const data = JSON.parse(text);
      setAccessibleCids(data.customerIds || []);
      log("info", `Found ${data.customerIds?.length || 0} accessible accounts`);
    } catch (e: any) {
      log("error", `fetchAccessible failed: ${e.message}`);
      showToast("Could not fetch accounts from Google profile");
    } finally {
      setLoading(false);
    }
  }

  async function connectAndSelect(cid: string) {
    const cleanCid = cid.replace(/-/g, "").trim();
    setConnecting(cleanCid);
    log("info", `Connecting customer ${cleanCid}…`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ads/connect-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, customerId: cleanCid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect account");
      log("info", `Customer ${cleanCid} connected successfully! Selecting…`);
      showToast(`Connected account ${cleanCid} ✓`);
      onAccountSelected(cleanCid);
    } catch (e: any) {
      log("error", `connectAndSelect failed: ${e.message}`);
      showToast(`Error: ${e.message}`);
    } finally {
      setConnecting(null);
    }
  }

  useEffect(() => { fetchAccessible(); }, []);

  const levelColor = { info: "text-blue-600", error: "text-rose-600 font-bold", warn: "text-amber-600" };

  return (
    <div className="min-h-full bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
            <Globe className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Google Ads Account</h1>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Choose which Google Ads account to manage in this workspace. You can switch accounts at any time.
          </p>
          {onDisconnect && (
            <div className="pt-1">
              <button
                onClick={onDisconnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" /> Disconnect Google
              </button>
            </div>
          )}
        </div>

        {/* Account list card */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">Accounts Found on your Google Profile</span>
            <button
              onClick={fetchAccessible}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && accessibleCids.length === 0 && (
              <div className="py-10 text-center space-y-3 px-6">
                <AlertCircle className="h-8 w-8 text-slate-500 mx-auto" />
                <p className="text-slate-700 text-xs font-bold">No accounts found</p>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                  This can happen if the Google account connected has no Google Ads accounts. Try connecting manually below.
                </p>
              </div>
            )}

            {loading && (
              <div className="py-10 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <p className="text-slate-600 text-xs font-medium">Fetching accounts from Google…</p>
              </div>
            )}

            {accessibleCids.map(cid => {
              const cleanCid = cid.replace(/-/g, "");
              return (
                <div key={cid} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {cid[0]}
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-900">{cid}</p>
                      <p className="text-[10px] text-slate-500">Customer ID</p>
                    </div>
                  </div>
                  <button
                    onClick={() => connectAndSelect(cid)}
                    disabled={connecting === cleanCid}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {connecting === cleanCid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    Connect &amp; Use
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual ID entry */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
          <h2 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600" />
            Enter Account ID Manually
          </h2>
          <p className="text-[11px] text-slate-500">If your account isn't listed above, enter the Customer ID directly.</p>
          <div className="flex gap-2">
            <input
              value={customCid}
              onChange={e => setCustomCid(e.target.value)}
              placeholder="e.g. 123-456-7890 or 1234567890"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={() => { if (customCid.trim()) { connectAndSelect(customCid.trim()); setCustomCid(""); } }}
              disabled={!customCid.trim() || !!connecting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS & TIERS
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "overview" | "recommendations" | "campaigns" | "ad-groups" | "asset-groups" | "policy-disapprovals" | "keywords" | "extensions" | "conversions" | "bidding" | "audiences" | "shopping" | "data-manager" | "reports" | "history" | "billing" | "settings";

export interface TierConfig {
  id: number;
  number: string;
  name: string;
  shortDesc: string;
  color: {
    bg: string;
    text: string;
    border: string;
    activeBg: string;
    badgeBg: string;
    badgeText: string;
  };
  tabIds: Tab[];
}

export const TIERS: TierConfig[] = [
  {
    id: 1,
    number: "Tier 1",
    name: "Daily Operations",
    shortDesc: "Core campaign management, ad groups & ads, search keywords, and extensions",
    color: {
      bg: "bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 border-blue-200",
      text: "text-blue-700",
      border: "border-blue-600",
      activeBg: "bg-blue-600 text-white shadow-sm shadow-blue-500/25",
      badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
      badgeText: "text-blue-700",
    },
    tabIds: ["overview", "campaigns", "ad-groups", "asset-groups", "keywords", "extensions"]
  },
  {
    id: 2,
    number: "Tier 2",
    name: "Conversions & Targeting",
    shortDesc: "Conversion goals, smart bidding strategies, audiences, and shopping feeds",
    color: {
      bg: "bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border-emerald-200",
      text: "text-emerald-700",
      border: "border-emerald-600",
      activeBg: "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      badgeText: "text-emerald-700",
    },
    tabIds: ["conversions", "bidding", "audiences", "shopping"]
  },
  {
    id: 3,
    number: "Tier 3",
    name: "Quality & Intelligence",
    shortDesc: "Optimization suggestions, policy compliance, and CRM customer data sync",
    color: {
      bg: "bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 border-purple-200",
      text: "text-purple-700",
      border: "border-purple-600",
      activeBg: "bg-purple-600 text-white shadow-sm shadow-purple-500/25",
      badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
      badgeText: "text-purple-700",
    },
    tabIds: ["recommendations", "policy-disapprovals", "data-manager"]
  },
  {
    id: 4,
    number: "Tier 4",
    name: "Insights & Administration",
    shortDesc: "Performance reporting, change history logs, billing, and linked accounts",
    color: {
      bg: "bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 border-amber-200",
      text: "text-amber-700",
      border: "border-amber-600",
      activeBg: "bg-amber-600 text-white shadow-sm shadow-amber-500/25",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      badgeText: "text-amber-700",
    },
    tabIds: ["reports", "history", "billing", "settings"]
  }
];

export interface SectionMeta {
  id: Tab;
  label: string;
  tierNumber: string;
  tierName: string;
  icon: any;
  tagline: string;
  description: string;
  crmUse: string;
}

export const SECTION_METADATA: Record<Tab, SectionMeta> = {
  "overview": {
    id: "overview",
    label: "Overview",
    tierNumber: "Tier 1",
    tierName: "Daily Operations",
    icon: LayoutGrid,
    tagline: "Account Performance & KPI Dashboard",
    description: "Real-time summary of impressions, clicks, spend, CTR, conversion count, and cost per conversion across all active campaigns.",
    crmUse: "Gives sales & marketing managers an immediate bird's-eye view of account performance and ad spend health before diving into specific campaigns."
  },
  "campaigns": {
    id: "campaigns",
    label: "Campaigns",
    tierNumber: "Tier 1",
    tierName: "Daily Operations",
    icon: Megaphone,
    tagline: "Campaign Controls & Budget Management",
    description: "Manage Search, Performance Max, Display, and Video campaigns with live status toggling, daily budget adjustments, bidding overrides, and ad schedule controls.",
    crmUse: "Allows CRM operators to launch, pause, or adjust daily ad budgets in real-time based on current lead volume and sales team bandwidth."
  },
  "ad-groups": {
    id: "ad-groups",
    label: "Ad Groups & Ads",
    tierNumber: "Tier 1",
    tierName: "Daily Operations",
    icon: Layers,
    tagline: "Ad Group Targeting & Creative Copy",
    description: "Manage ad groups, CPC bids, and inspect responsive search ads, display creatives, copy performance, and ad strength in a unified workspace.",
    crmUse: "Helps tailor ad messaging, inspect winning ad copy, and adjust audience targeting bids within the CRM pipeline."
  },
  "asset-groups": {
    id: "asset-groups",
    label: "Asset Groups (PMax)",
    tierNumber: "Tier 1",
    tierName: "Daily Operations",
    icon: Layers,
    tagline: "Performance Max Asset Collections",
    description: "View and edit Performance Max asset groups, creative assets, headline/description strength, and automated multi-channel delivery status.",
    crmUse: "Ensures automated Google AI campaigns (Search, YouTube, Gmail, Maps) are armed with high-converting marketing creative assets."
  },
  "keywords": {
    id: "keywords",
    label: "Keywords",
    tierNumber: "Tier 1",
    tierName: "Daily Operations",
    icon: Tag,
    tagline: "Search Keywords & Negative Filtering",
    description: "Manage positive keywords (Broad, Phrase, Exact match) with CPC bids and maintain negative keyword lists to prevent wasteful ad spend.",
    crmUse: "Ensures Google Ads exclusively targets high-intent searchers looking for your exact products and services, saving budget from irrelevant search queries."
  },
  "extensions": {
    id: "extensions",
    label: "Assets & Extensions",
    tierNumber: "Tier 1",
    tierName: "Daily Operations",
    icon: Link2,
    tagline: "WhatsApp Click-to-Chat, Calls & Sitelinks",
    description: "Configure lead generation extensions including WhatsApp direct chat buttons, call assets, sitelink shortcuts, price cards, and structured snippets.",
    crmUse: "Drives direct WhatsApp and phone leads straight into your CRM inbox with 1-click customer interaction right from the Google search page."
  },
  "conversions": {
    id: "conversions",
    label: "Conversions",
    tierNumber: "Tier 2",
    tierName: "Conversions & Targeting",
    icon: Target,
    tagline: "Conversion Actions & Attribution Goals",
    description: "Set up and monitor primary conversion goals such as WhatsApp Chats, Lead Form Submissions, Phone Calls, and Website Purchases with revenue values.",
    crmUse: "Directly bridges Google Ads with closed sales in the CRM so Google's smart bidding algorithms optimize for real revenue and qualified leads."
  },
  "bidding": {
    id: "bidding",
    label: "Bidding Strategies",
    tierNumber: "Tier 2",
    tierName: "Conversions & Targeting",
    icon: TrendingUp,
    tagline: "Smart Bidding & Target CPA / ROAS",
    description: "Configure automated bidding strategies (Maximize Conversions, Target CPA, Target ROAS, Maximize Clicks) across your portfolio.",
    crmUse: "Allows marketing leads to set exact cost-per-lead limits (Target CPA) or return on ad spend (ROAS) targets to keep customer acquisition cost profitable."
  },
  "audiences": {
    id: "audiences",
    label: "Audiences",
    tierNumber: "Tier 2",
    tierName: "Conversions & Targeting",
    icon: Users,
    tagline: "Audience Segments & Customer Lists",
    description: "Manage first-party Customer Match lists, website remarketing visitors, and Google in-market/affinity audience targeting criteria.",
    crmUse: "Remarket to past CRM contacts, re-engage cold prospects, and create high-converting Lookalike/Similar audiences from closed deals."
  },
  "shopping": {
    id: "shopping",
    label: "Shopping",
    tierNumber: "Tier 2",
    tierName: "Conversions & Targeting",
    icon: ShoppingBag,
    tagline: "Google Merchant Center Product Feeds",
    description: "Track Google Merchant Center inventory feed sync status, product approval health, item pricing, and e-commerce shopping campaign performance.",
    crmUse: "Ensures e-commerce product catalogs in the CRM stay synchronized with Google Shopping ads with zero stock or pricing discrepancies."
  },
  "recommendations": {
    id: "recommendations",
    label: "Recommendations",
    tierNumber: "Tier 3",
    tierName: "Quality & Intelligence",
    icon: Zap,
    tagline: "Google AI Optimization & Score Boosts",
    description: "Native Google Ads AI recommendations categorized by Bidding, Keywords, Ads, and Repairs with estimated Optimization Score impact and 1-click apply/dismiss actions.",
    crmUse: "Provides actionable AI-powered suggestions to boost account efficiency, improve ad ranking, and uncover new keyword opportunities without leaving the CRM."
  },
  "policy-disapprovals": {
    id: "policy-disapprovals",
    label: "Policy & Disapprovals",
    tierNumber: "Tier 3",
    tierName: "Quality & Intelligence",
    icon: ShieldAlert,
    tagline: "Compliance Monitoring & Disapproval Appeals",
    description: "Audit policy compliance across all ads, detect disapproved or limited assets, view policy violation topics, and submit appeals directly to Google.",
    crmUse: "Prevents account suspensions and ad delivery downtime by instantly alerting CRM admins whenever an ad copy or asset violates Google advertising guidelines."
  },
  "data-manager": {
    id: "data-manager",
    label: "Data Manager",
    tierNumber: "Tier 3",
    tierName: "Quality & Intelligence",
    icon: Database,
    tagline: "Offline Conversions & Enhanced Conversions",
    description: "Sync first-party CRM customer data, upload offline store/deal conversions, and manage enhanced conversion data streams with Google Ads.",
    crmUse: "Sends closed-deal revenue from the CRM back into Google Ads to feed conversion value data back to Google's AI bidding algorithms."
  },
  "reports": {
    id: "reports",
    label: "Reports",
    tierNumber: "Tier 4",
    tierName: "Insights & Administration",
    icon: BarChart2,
    tagline: "Custom Analytics & Search Term Insights",
    description: "Comprehensive multi-dimensional performance reports, search term queries report, device breakdowns, and geographical performance analysis.",
    crmUse: "Enables business stakeholders to export analytical reports and inspect actual user search terms that resulted in CRM inquiries."
  },
  "history": {
    id: "history",
    label: "Change History",
    tierNumber: "Tier 4",
    tierName: "Insights & Administration",
    icon: History,
    tagline: "Audit Trail & Account Change Logs",
    description: "Read-only chronological audit log of all account modifications including budget updates, bid changes, keyword additions, and status toggles.",
    crmUse: "Provides full accountability by tracking who made what changes in the Google Ads account and when, preventing unintended account misconfigurations."
  },
  "billing": {
    id: "billing",
    label: "Billing",
    tierNumber: "Tier 4",
    tierName: "Insights & Administration",
    icon: CreditCard,
    tagline: "Payment Setup, Invoices & Budget Caps",
    description: "Monitor primary billing account status, account-level monthly spending caps, active payment methods, and invoice receipt history.",
    crmUse: "Keeps financial controllers informed of ad spend balances, upcoming charges, and billing threshold alerts to prevent account pauses."
  },
  "settings": {
    id: "settings",
    label: "Settings",
    tierNumber: "Tier 4",
    tierName: "Insights & Administration",
    icon: Settings,
    tagline: "Google Ads Account Connection & Config",
    description: "Manage Google OAuth credentials, switch active Customer IDs, refresh token permissions, and configure system sync intervals.",
    crmUse: "Connects and configures the Google Ads API connection for your organization."
  }
};

const TABS: { id: Tab; label: string; icon: any }[] = Object.values(SECTION_METADATA).map(s => ({
  id: s.id,
  label: s.label,
  icon: s.icon
}));

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS TAB COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface SettingsTabProps {
  orgId: string;
  accounts: any[];
  selectedCustomerId: string;
  onSelectAccount: (id: string) => void;
  onAccountsRefresh: () => void;
  showToast: (msg: string) => void;
  onOpenProfile?: () => void;
  onDisconnect?: () => void;
  isDisconnecting?: boolean;
}

function SettingsTab({
  orgId,
  accounts,
  selectedCustomerId,
  onSelectAccount,
  onAccountsRefresh,
  showToast,
  onOpenProfile,
  onDisconnect,
  isDisconnecting
}: SettingsTabProps) {
  const [accessibleCids, setAccessibleCids] = useState<string[]>([]);
  const [loadingAccessible, setLoadingAccessible] = useState(false);
  const [customCid, setCustomCid] = useState("");
  const [isSettingUpManager, setIsSettingUpManager] = useState(false);
  const [isConnectingClient, setIsConnectingClient] = useState(false);

  const fetchAccessible = async () => {
    setLoadingAccessible(true);
    try {
      const res = await api(`/accessible-customers?orgId=${orgId}`);
      if (!res.ok) throw new Error("Failed to load accessible customers");
      const data = await res.json();
      setAccessibleCids(data.customerIds || []);
    } catch (e: any) {
      showToast(e.message || "Failed to fetch accessible accounts");
    } finally {
      setLoadingAccessible(false);
    }
  };

  useEffect(() => {
    fetchAccessible();
  }, []);

  const handleSetupManager = async (managerId: string) => {
    if (!managerId) return;
    setIsSettingUpManager(true);
    try {
      const res = await api("/setup-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, managerCustomerId: managerId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to setup manager account");
      }
      const result = await res.json();
      showToast(`MCC Setup complete! Imported ${result.subAccountsFound} sub-accounts.`);
      onAccountsRefresh();
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setIsSettingUpManager(false);
    }
  };

  const handleConnectClient = async (cid: string) => {
    if (!cid) return;
    setIsConnectingClient(true);
    try {
      const infoRes = await api(`/customer-info?orgId=${orgId}&customerId=${cid}`);
      let info: any = null;
      if (infoRes.ok) {
        info = await infoRes.json();
      }
      
      const res = await api("/connect-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: cid,
          name: info?.descriptiveName || `Account ${cid}`,
          currencyCode: info?.currencyCode,
          timeZone: info?.timeZone,
          isManager: info?.manager || false
        })
      });
      if (!res.ok) throw new Error("Failed to connect account");
      showToast("Account connected successfully!");
      onAccountsRefresh();
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setIsConnectingClient(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Active Account Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-600" /> Active Account Settings
        </h2>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-emerald-900 font-bold">Google Integration Active</p>
            {selectedCustomerId ? (
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Current active account for workspace: <strong className="font-mono">{selectedCustomerId}</strong>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-0.5">Please connect or select an account below to view campaign data.</p>
            )}
          </div>
          {selectedCustomerId && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              Google Ads Profile
            </button>
          )}
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              disabled={isDisconnecting}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition-all font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              {isDisconnecting ? "Disconnecting..." : "Disconnect Google"}
            </button>
          )}
          <a
            href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads&source=google_ads`}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-bold shadow-2xs"
          >
            Switch Account
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Available Accounts from your Google Profile */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> 1. Connect / Choose Accounts
            </h3>
            <button 
              onClick={fetchAccessible} 
              disabled={loadingAccessible}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title="Refresh profile accounts"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAccessible ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Below are all Google Ads accounts accessible via your linked Google email. Select which ones to connect to this CRM:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {loadingAccessible ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              </div>
            ) : accessibleCids.length === 0 ? (
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                No accounts found or Google OAuth not completed.
              </div>
            ) : (
              accessibleCids.map(cid => {
                const cleanCid = cid.replace(/-/g, "");
                const isAlreadyConnected = accounts.some(acc => acc.customerId === cleanCid);
                return (
                  <div key={cid} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-2xs transition-all">
                    <span className="text-xs font-mono text-slate-900 font-bold">{cid}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSetupManager(cid)}
                        disabled={isSettingUpManager || isAlreadyConnected}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all cursor-pointer"
                        title="Import all sub-accounts under this MCC Manager"
                      >
                        Import Sub-Accounts
                      </button>
                      <button
                        onClick={() => handleConnectClient(cid)}
                        disabled={isConnectingClient || isAlreadyConnected}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isAlreadyConnected 
                          ? "bg-slate-100 text-slate-500 border border-transparent cursor-not-allowed" 
                          : "bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 cursor-pointer"
                        }`}
                      >
                        {isAlreadyConnected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Custom / Missing Account ID</h4>
            <div className="flex gap-2">
              <input
                value={customCid}
                onChange={e => setCustomCid(e.target.value)}
                placeholder="e.g. 123-456-7890"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                onClick={() => { handleConnectClient(customCid); setCustomCid(""); }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
              >
                Connect Custom
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Connected accounts & selector */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" /> 2. Selected CRM Accounts
          </h3>
          <p className="text-[11px] text-slate-500">
            Choose which client account to act as your active Workspace for managing campaigns, budgets, and viewing AI analyses:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {accounts.length === 0 ? (
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                No accounts currently connected to your organization. Use the panel on the left to add one.
              </div>
            ) : (
              accounts.map(acc => {
                const isActive = selectedCustomerId === acc.customerId;
                return (
                  <div 
                    key={acc.customerId} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isActive 
                        ? "border-blue-500 bg-blue-50/60 shadow-2xs" 
                        : "border-slate-200 bg-slate-50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        acc.isManager ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {acc.isManager ? "M" : "C"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{acc.name || `Account ${acc.customerId}`}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{acc.customerId} · {acc.currencyCode || "INR"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {acc.isManager && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          Manager
                        </span>
                      )}
                      <button
                        onClick={() => onSelectAccount(acc.customerId)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? "bg-blue-600 text-white shadow-2xs" 
                            : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {isActive ? "Active" : "Use Account"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SearchParamsHandler({ onOAuth }: { onOAuth: (status: string, tab: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth") || "";
    const tabParam = searchParams.get("tab") || "";
    if (oauthStatus || tabParam) {
      onOAuth(oauthStatus, tabParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, onOAuth]);
  return null;
}

export default function GoogleAdsPage() {
  const [orgId, setOrgId] = useState<string>(getOrgId());
  const router = useRouter();

  useEffect(() => {
    setOrgId(getOrgId());
  }, []);

  const [isConnected, setIsConnected] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [activeTier, setActiveTier] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);

  const [adGroups, setAdGroups] = useState<any[]>([]);
  const [adGroupsLoading, setAdGroupsLoading] = useState(false);

  const [ads, setAds] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);

  const [keywords, setKeywords] = useState<any[]>([]);
  const [kwLoading, setKwLoading] = useState(false);

  const [extensions, setExtensions] = useState<any[]>([]);
  const [extLoading, setExtLoading] = useState(false);

  const [conversions, setConversions] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(false);

  const [audiences, setAudiences] = useState<any[]>([]);
  const [audLoading, setAudLoading] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Native Google Ads Recommendations State
  const [nativeRecommendations, setNativeRecommendations] = useState<any[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [applyingRecId, setApplyingRecId] = useState<string | null>(null);
  const [dismissingRecId, setDismissingRecId] = useState<string | null>(null);
  const [recFilter, setRecFilter] = useState<string>("ALL");
  const [selectedRecDetails, setSelectedRecDetails] = useState<any>(null);
  const [confirmApplyRec, setConfirmApplyRec] = useState<any>(null);
  const [confirmDismissRec, setConfirmDismissRec] = useState<any>(null);

  // Change History State (READ-ONLY)
  const [changeHistory, setChangeHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("ALL");
  const [historyUserFilter, setHistoryUserFilter] = useState<string>("");
  const [historyDateFilter, setHistoryDateFilter] = useState<string>("LAST_30_DAYS");
  const [selectedChangeDetail, setSelectedChangeDetail] = useState<any | null>(null);

  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [adReport, setAdReport] = useState<any[]>([]);

  const [toggling, setToggling] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [kwSearch, setKwSearch] = useState("");
  const [campSearch, setCampSearch] = useState("");
  const [isCampaignSelectionMode, setIsCampaignSelectionMode] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [bulkTaskProgress, setBulkTaskProgress] = useState<{
    isOpen: boolean;
    title: string;
    total: number;
    current: number;
    successCount: number;
    failCount: number;
    currentName: string;
    elapsedSeconds: number;
    isCompleted: boolean;
    actionType: "DELETE" | "STATUS" | "BUDGET";
  } | null>(null);
  const [showBulkBudgetModal, setShowBulkBudgetModal] = useState(false);
  const [bulkBudgetVal, setBulkBudgetVal] = useState<number | string>("");

  // Ad Groups & Ads Multi-Select & Sub-View State
  const [adGroupSubView, setAdGroupSubView] = useState<"ad-groups" | "ads" | "hierarchical">("hierarchical");
  const [selectedAdGroupFilter, setSelectedAdGroupFilter] = useState<string>("ALL");
  const [isAdGroupSelectionMode, setIsAdGroupSelectionMode] = useState(false);
  const [selectedAdGroupIds, setSelectedAdGroupIds] = useState<string[]>([]);
  const [isAdSelectionMode, setIsAdSelectionMode] = useState(false);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);
  const [expandedAdGroupIds, setExpandedAdGroupIds] = useState<string[]>([]);

  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKwAdGroupRes, setNewKwAdGroupRes] = useState("");
  const [newKwAdGroupId, setNewKwAdGroupId] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newKwMatchType, setNewKwMatchType] = useState("BROAD");
  const [addingKw, setAddingKw] = useState(false);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Account Readiness & Health State
  const [accountReadiness, setAccountReadiness] = useState<{
    overallStatus: "READY" | "WARNING" | "BLOCKED" | "UNKNOWN";
    summary?: { readyCount: number; warningCount: number; blockedCount: number };
    checks?: { key: string; status: string; classification: string; message: string }[];
    blockedReason?: string;
  } | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);

  // Campaign Details states
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<any>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"info" | "assets" | "targeting" | "all" | "preview">("info");
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailLoadingLive, setDetailLoadingLive] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailName, setDetailName] = useState("");
  const [detailBudget, setDetailBudget] = useState(500);
  const [detailStatus, setDetailStatus] = useState("PAUSED");
  const [detailStartDate, setDetailStartDate] = useState("");
  const [detailEndDate, setDetailEndDate] = useState("");
  const [detailFinalUrl, setDetailFinalUrl] = useState("");
  const [detailBiddingStrategy, setDetailBiddingStrategy] = useState("");
  const [detailTargetCpa, setDetailTargetCpa] = useState<number | string>("");
  const [detailTargetRoas, setDetailTargetRoas] = useState<number | string>("");
  const [detailNetworkSearch, setDetailNetworkSearch] = useState(true);
  const [detailNetworkSearchPartners, setDetailNetworkSearchPartners] = useState(false);
  const [detailNetworkDisplay, setDetailNetworkDisplay] = useState(false);
  const [detailPositiveGeoTargetType, setDetailPositiveGeoTargetType] = useState<"PRESENCE" | "PRESENCE_OR_INTEREST">("PRESENCE_OR_INTEREST");
  const [detailTrackingUrlTemplate, setDetailTrackingUrlTemplate] = useState("");
  const [detailFinalUrlSuffix, setDetailFinalUrlSuffix] = useState("");
  const [newHeadlineInput, setNewHeadlineInput] = useState("");
  const [newDescInput, setNewDescInput] = useState("");
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [newLocationInput, setNewLocationInput] = useState("");
  const [newLanguageInput, setNewLanguageInput] = useState("");
  const [editingParamField, setEditingParamField] = useState<string | null>(null);
  const [tempParamValue, setTempParamValue] = useState<any>("");
  const [previewChannel, setPreviewChannel] = useState<"search" | "youtube" | "display" | "discover" | "gmail">("search");
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"mobile" | "desktop">("mobile");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleOAuthParams = useCallback((oauthStatus: string, tabParam: string) => {
    if (oauthStatus === "success" || tabParam === "settings") {
      setActiveTier(4);
      setActiveTab("settings");
      if (oauthStatus === "success") {
        showToast("✅ Google account connected! Fetching your ad accounts…");
        // Re-fetch config & accounts after reconnect so old data appears immediately
        (async () => {
          try {
            const res = await fetch(`${BACKEND}/api/gmb/config?orgId=${getOrgId()}`);
            const data = await res.json();
            const connected = !!data.googleRefreshToken;
            setIsConnected(connected);
            if (data.googleAdsCustomerId) {
              const cid = data.googleAdsCustomerId.replace(/-/g, "");
              setSelectedCustomerId(cid);
            }
            if (connected) {
              // Re-fetch accounts list (re-activated on backend)
              const accRes = await api(`/accounts?orgId=${getOrgId()}`);
              const accData = await accRes.json();
              if (Array.isArray(accData)) setAccounts(accData);
            }
          } catch (e) {
            console.warn("Failed to re-fetch config after OAuth:", e);
          }
        })();
      }
    }
    if (oauthStatus === "error") {
      showToast("❌ Google OAuth failed. Please try connecting again.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setConfigLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/gmb/config?orgId=${orgId}`);
        const data = await res.json();
        const activeCfg = data?.config || data || {};
        setIsConnected(!!(activeCfg.googleRefreshToken || data?.googleRefreshToken));
        const adsCid = activeCfg.googleAdsCustomerId || data?.googleAdsCustomerId;
        if (adsCid) setSelectedCustomerId(adsCid.replace(/-/g, ""));
      } catch { } finally { setConfigLoading(false); }
    })();
  }, [orgId]);

  useEffect(() => {
    if (!isConnected) return;
    setAccountsLoading(true);
    api(`/accounts?orgId=${orgId}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAccounts(d); })
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  }, [isConnected, orgId]);

  const loadReadiness = useCallback(async (cid: string) => {
    if (!cid) return;
    setReadinessLoading(true);
    try {
      const res = await api(`/account-readiness?orgId=${orgId}&customerId=${cid}`);
      if (res.ok) {
        const rawData = await res.json();
        const data = rawData.readiness || rawData;
        const checksList = Array.isArray(data.checks) ? data.checks : [];
        const blockedCheck = checksList.find((c: any) => c.status === "BLOCKED");
        setAccountReadiness({
          overallStatus: data.overallStatus || "UNKNOWN",
          summary: data.summary,
          checks: checksList,
          blockedReason: blockedCheck ? `${blockedCheck.key}: ${blockedCheck.message}` : undefined
        });
      }
    } catch (e: any) {
      console.warn("Readiness check error:", e.message);
    } finally {
      setReadinessLoading(false);
    }
  }, [orgId]);

  const loadOverview = useCallback(async (cid: string) => {
    setOverviewLoading(true);
    loadReadiness(cid);
    try {
      const [ovRes, campRes] = await Promise.allSettled([
        api(`/reports/overview?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`),
        api(`/campaigns?orgId=${orgId}&customerId=${cid}`)
      ]);
      
      let campsData: any[] = [];
      if (campRes.status === "fulfilled" && campRes.value.ok) {
        const camps = await campRes.value.json();
        if (Array.isArray(camps)) {
          campsData = camps;
          setCampaigns(camps);
        }
      }

      if (ovRes.status === "fulfilled" && ovRes.value.ok) {
        const ov = await ovRes.value.json();
        if (ov && !ov.error) {
          setOverview(ov);
        }
      }
    } catch (e: any) { console.warn("Overview load:", e.message); } finally { setOverviewLoading(false); }
  }, [orgId, dateRange]);

  const loadCampaigns = useCallback(async (cid: string) => {
    setCampsLoading(true);
    try {
      const res = await api(`/campaigns?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load campaigns"); } finally { setCampsLoading(false); }
  }, [orgId]);

  const loadAdGroups = useCallback(async (cid: string) => {
    setAdGroupsLoading(true);
    try {
      const res = await api(`/ad-groups?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAdGroups(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load ad groups"); } finally { setAdGroupsLoading(false); }
  }, [orgId]);

  const loadAds = useCallback(async (cid: string) => {
    setAdsLoading(true);
    try {
      const res = await api(`/ads?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load ads"); } finally { setAdsLoading(false); }
  }, [orgId]);

  const loadKeywords = useCallback(async (cid: string) => {
    setKwLoading(true);
    try {
      const res = await api(`/keywords?orgId=${orgId}&customerId=${cid}&includeNegatives=true`);
      const data = await res.json();
      setKeywords(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load keywords"); } finally { setKwLoading(false); }
  }, [orgId]);

  const loadExtensions = useCallback(async (cid: string) => {
    setExtLoading(true);
    try {
      const res = await api(`/extensions?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setExtensions(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load extensions"); } finally { setExtLoading(false); }
  }, [orgId]);

  const loadConversions = useCallback(async (cid: string) => {
    setConvLoading(true);
    try {
      const res = await api(`/conversions?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setConversions(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load conversions"); } finally { setConvLoading(false); }
  }, [orgId]);

  const loadAudiences = useCallback(async (cid: string) => {
    setAudLoading(true);
    try {
      const res = await api(`/audiences?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      setAudiences(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load audiences"); } finally { setAudLoading(false); }
  }, [orgId]);

  const loadRecommendations = useCallback(async (cid: string) => {
    setRecsLoading(true);
    try {
      const res = await api(`/recommendations?orgId=${orgId}&customerId=${cid}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.recommendations)) {
        setNativeRecommendations(data.recommendations);
      } else {
        setNativeRecommendations([]);
      }
    } catch {
      showToast("Failed to load Google Ads recommendations");
      setNativeRecommendations([]);
    } finally {
      setRecsLoading(false);
    }
  }, [orgId]);

  const handleApplyRecommendation = async (rec: any) => {
    if (!rec?.resourceName || !selectedCustomerId) return;
    setApplyingRecId(rec.id);
    try {
      const res = await api("/recommendations/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: selectedCustomerId,
          resourceName: rec.resourceName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply recommendation");
      showToast("Google Ads recommendation applied successfully ✓");
      setConfirmApplyRec(null);
      setSelectedRecDetails(null);
      loadRecommendations(selectedCustomerId);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to apply recommendation"}`);
    } finally {
      setApplyingRecId(null);
    }
  };

  const handleDismissRecommendation = async (rec: any) => {
    if (!rec?.resourceName || !selectedCustomerId) return;
    setDismissingRecId(rec.id);
    try {
      const res = await api("/recommendations/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          customerId: selectedCustomerId,
          resourceName: rec.resourceName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dismiss recommendation");
      showToast("Recommendation dismissed from Google Ads ✓");
      setConfirmDismissRec(null);
      setSelectedRecDetails(null);
      loadRecommendations(selectedCustomerId);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to dismiss recommendation"}`);
    } finally {
      setDismissingRecId(null);
    }
  };

  const loadReports = useCallback(async (cid: string) => {
    try {
      const [stRes, adRep] = await Promise.all([
        api(`/reports/search-terms?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`),
        api(`/reports/ads?orgId=${orgId}&customerId=${cid}&dateRange=${dateRange}`)
      ]);
      const st = await stRes.json();
      const ar = await adRep.json();
      if (Array.isArray(st)) setSearchTerms(st);
      if (Array.isArray(ar)) setAdReport(ar);
    } catch { showToast("Failed to load reports"); }
  }, [orgId, dateRange]);

  const loadChangeHistory = useCallback(async (cid: string) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({
        orgId,
        customerId: cid,
        dateRange: historyDateFilter,
        limit: "50",
      });
      if (historyTypeFilter !== "ALL") {
        params.append("changeResourceType", historyTypeFilter);
      }
      if (historyUserFilter.trim()) {
        params.append("userEmail", historyUserFilter.trim());
      }
      const res = await api(`/change-history?${params.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data.changeHistory) ? data.changeHistory : (Array.isArray(data.changes) ? data.changes : []);
      if (res.ok) {
        setChangeHistory(list);
      } else {
        setChangeHistory([]);
      }
    } catch {
      showToast("Failed to load Google Ads change history");
      setChangeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [orgId, historyDateFilter, historyTypeFilter, historyUserFilter]);

  useEffect(() => {
    if (!isConnected || !selectedCustomerId) return;
    const cid = selectedCustomerId;
    if (activeTab === "overview") loadOverview(cid);
    if (activeTab === "recommendations") loadRecommendations(cid);
    if (activeTab === "campaigns") loadCampaigns(cid);
    if (activeTab === "ad-groups") {
      loadAdGroups(cid);
      loadAds(cid);
    }
    if (activeTab === "keywords") loadKeywords(cid);
    if (activeTab === "extensions") loadExtensions(cid);
    if (activeTab === "conversions") loadConversions(cid);
    if (activeTab === "audiences") loadAudiences(cid);
    if (activeTab === "reports") loadReports(cid);
    if (activeTab === "history") loadChangeHistory(cid);
  }, [activeTab, selectedCustomerId, isConnected, dateRange, loadOverview, loadRecommendations, loadCampaigns, loadAdGroups, loadAds, loadKeywords, loadExtensions, loadConversions, loadAudiences, loadReports, loadChangeHistory]);

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectGoogleAds = async () => {
    if (!confirm("Are you sure you want to disconnect Google Ads and log out? You will need to reconnect to view your campaigns.")) return;
    setIsDisconnecting(true);
    try {
      const res = await api("/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Google Ads");
      setIsConnected(false);
      setSelectedCustomerId("");
      setAccounts([]);
      setCampaigns([]);
      setAdGroups([]);
      setAds([]);
      setKeywords([]);
      setExtensions([]);
      setConversions([]);
      setAudiences([]);
      setOverview(null);
      showToast("Successfully disconnected Google Ads.");
    } catch (e: any) {
      showToast(`Error: ${e.message || "Failed to disconnect"}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSelectAccount = async (cid: string) => {
    setSelectedCustomerId(cid);
    try {
      await api("/select-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, customerId: cid })
      });
    } catch (e) {
      console.error("Failed to select account on backend:", e);
    }
  };

  async function toggleCampaign(c: any) {
    const newStatus = c.liveStatus === "ENABLED" || c.status === "ENABLED" ? "PAUSED" : "ENABLED";
    setToggling(c.id);
    try {
      const res = await api("/campaign/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, campaignId: c.id, customerId: selectedCustomerId, status: newStatus })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(`Campaign ${newStatus === "ENABLED" ? "enabled" : "paused"} ✓`);
      loadCampaigns(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); } finally { setToggling(null); }
  }

  async function deleteCampaign(c: any) {
    if (!confirm(`Remove campaign "${c.name}"? This will remove it from Google Ads.`)) return;
    try {
      const res = await api(`/campaigns/${c.id}?orgId=${orgId}&customerId=${selectedCustomerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Campaign removed");
      loadCampaigns(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); }
  }

  // ─── Multi-Select Bulk Actions for Campaigns ───
  const toggleSelectCampaign = (id: string) => {
    setSelectedCampaignIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCampaigns = () => {
    if (selectedCampaignIds.length === filteredCamps.length) {
      setSelectedCampaignIds([]);
    } else {
      setSelectedCampaignIds(filteredCamps.map(c => c.id));
    }
  };

  const handleBulkToggleStatus = async (targetStatus: "ENABLED" | "PAUSED") => {
    if (selectedCampaignIds.length === 0) {
      showToast("Please select at least one campaign.");
      return;
    }
    const actionName = targetStatus === "ENABLED" ? "Enable" : "Pause";
    if (!confirm(`${actionName} ${selectedCampaignIds.length} selected campaign(s) in Google Ads?`)) return;

    setIsBulkOperating(true);
    let successCount = 0;
    let failCount = 0;
    const total = selectedCampaignIds.length;
    let startTime = Date.now();

    setBulkTaskProgress({
      isOpen: true,
      title: `${actionName} Campaigns`,
      total,
      current: 0,
      successCount: 0,
      failCount: 0,
      currentName: "Starting task...",
      elapsedSeconds: 0,
      isCompleted: false,
      actionType: "STATUS"
    });

    const timerInterval = setInterval(() => {
      setBulkTaskProgress(prev => prev ? {
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
      } : null);
    }, 1000);

    for (let i = 0; i < selectedCampaignIds.length; i++) {
      const cId = selectedCampaignIds[i];
      const targetCamp = campaigns.find(c => c.id === cId);
      const campName = targetCamp?.name || `Campaign ID ${cId}`;

      setBulkTaskProgress(prev => prev ? {
        ...prev,
        current: i + 1,
        currentName: campName
      } : null);

      try {
        const res = await api("/campaign/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            campaignId: cId,
            customerId: selectedCustomerId,
            status: targetStatus
          })
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      setBulkTaskProgress(prev => prev ? {
        ...prev,
        successCount,
        failCount
      } : null);
    }

    clearInterval(timerInterval);
    const finalElapsed = Math.floor((Date.now() - startTime) / 1000);

    setBulkTaskProgress(prev => prev ? {
      ...prev,
      isCompleted: true,
      elapsedSeconds: finalElapsed,
      currentName: `Completed: ${successCount} ${targetStatus === "ENABLED" ? "enabled" : "paused"}${failCount > 0 ? `, ${failCount} failed` : ""}`
    } : null);

    setIsBulkOperating(false);
    showToast(`Bulk update complete in ${finalElapsed}s (${successCount} successful${failCount > 0 ? `, ${failCount} failed` : ""})`);
    setSelectedCampaignIds([]);
    loadCampaigns(selectedCustomerId);
  };

  const handleBulkDeleteCampaigns = async () => {
    if (selectedCampaignIds.length === 0) {
      showToast("Please select at least one campaign.");
      return;
    }
    if (!confirm(`⚠️ Remove/Delete ${selectedCampaignIds.length} selected campaign(s) from Google Ads? This action cannot be undone.`)) return;

    setIsBulkOperating(true);
    let successCount = 0;
    let failCount = 0;
    const total = selectedCampaignIds.length;
    let startTime = Date.now();

    setBulkTaskProgress({
      isOpen: true,
      title: "Delete Campaigns",
      total,
      current: 0,
      successCount: 0,
      failCount: 0,
      currentName: "Starting deletion...",
      elapsedSeconds: 0,
      isCompleted: false,
      actionType: "DELETE"
    });

    const timerInterval = setInterval(() => {
      setBulkTaskProgress(prev => prev ? {
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
      } : null);
    }, 1000);

    for (let i = 0; i < selectedCampaignIds.length; i++) {
      const cId = selectedCampaignIds[i];
      const targetCamp = campaigns.find(c => c.id === cId);
      const campName = targetCamp?.name || `Campaign ID ${cId}`;

      setBulkTaskProgress(prev => prev ? {
        ...prev,
        current: i + 1,
        currentName: campName
      } : null);

      try {
        const res = await api(`/campaigns/${cId}?orgId=${orgId}&customerId=${selectedCustomerId}`, { method: "DELETE" });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      setBulkTaskProgress(prev => prev ? {
        ...prev,
        successCount,
        failCount
      } : null);
    }

    clearInterval(timerInterval);
    const finalElapsed = Math.floor((Date.now() - startTime) / 1000);

    setBulkTaskProgress(prev => prev ? {
      ...prev,
      isCompleted: true,
      elapsedSeconds: finalElapsed,
      currentName: `Completed: ${successCount} removed${failCount > 0 ? `, ${failCount} failed` : ""}`
    } : null);

    setIsBulkOperating(false);
    showToast(`Bulk delete complete in ${finalElapsed}s (${successCount} removed${failCount > 0 ? `, ${failCount} failed` : ""})`);
    setSelectedCampaignIds([]);
    loadCampaigns(selectedCustomerId);
  };

  const handleBulkUpdateBudget = async () => {
    const budgetNum = Number(bulkBudgetVal);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showToast("Please enter a valid daily budget amount greater than 0.");
      return;
    }
    if (selectedCampaignIds.length === 0) {
      showToast("Please select at least one campaign.");
      return;
    }

    setShowBulkBudgetModal(false);
    setIsBulkOperating(true);
    let successCount = 0;
    let failCount = 0;
    const total = selectedCampaignIds.length;
    let startTime = Date.now();

    setBulkTaskProgress({
      isOpen: true,
      title: `Update Budget to ₹${budgetNum}/day`,
      total,
      current: 0,
      successCount: 0,
      failCount: 0,
      currentName: "Starting budget update...",
      elapsedSeconds: 0,
      isCompleted: false,
      actionType: "BUDGET"
    });

    const timerInterval = setInterval(() => {
      setBulkTaskProgress(prev => prev ? {
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
      } : null);
    }, 1000);

    for (let i = 0; i < selectedCampaignIds.length; i++) {
      const cId = selectedCampaignIds[i];
      const targetCamp = campaigns.find(c => c.id === cId);
      const campName = targetCamp?.name || `Campaign ID ${cId}`;

      setBulkTaskProgress(prev => prev ? {
        ...prev,
        current: i + 1,
        currentName: campName
      } : null);

      try {
        const res = await api(`/campaigns/${cId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            customerId: selectedCustomerId,
            budget: budgetNum
          })
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      setBulkTaskProgress(prev => prev ? {
        ...prev,
        successCount,
        failCount
      } : null);
    }

    clearInterval(timerInterval);
    const finalElapsed = Math.floor((Date.now() - startTime) / 1000);

    setBulkTaskProgress(prev => prev ? {
      ...prev,
      isCompleted: true,
      elapsedSeconds: finalElapsed,
      currentName: `Completed: ${successCount} updated${failCount > 0 ? `, ${failCount} failed` : ""}`
    } : null);

    setIsBulkOperating(false);
    setBulkBudgetVal("");
    showToast(`Budget updated for ${successCount} campaign(s) in ${finalElapsed}s (₹${budgetNum}/day)${failCount > 0 ? `, ${failCount} failed` : ""}`);
    setSelectedCampaignIds([]);
    loadCampaigns(selectedCustomerId);
  };

  // ─── Multi-Select Bulk Actions for Ad Groups ───
  const toggleSelectAdGroup = (id: string) => {
    setSelectedAdGroupIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllAdGroups = () => {
    if (selectedAdGroupIds.length === adGroups.length) {
      setSelectedAdGroupIds([]);
    } else {
      setSelectedAdGroupIds(adGroups.map(ag => ag.id));
    }
  };

  const handleBulkToggleAdGroupStatus = async (targetStatus: "ENABLED" | "PAUSED") => {
    if (selectedAdGroupIds.length === 0) {
      showToast("Please select at least one ad group.");
      return;
    }
    const actionName = targetStatus === "ENABLED" ? "Enable" : "Pause";
    if (!confirm(`${actionName} ${selectedAdGroupIds.length} selected ad group(s) in Google Ads?`)) return;

    setIsBulkOperating(true);
    let successCount = 0;
    let failCount = 0;

    for (const agId of selectedAdGroupIds) {
      try {
        const res = await api(`/ad-groups/${agId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            customerId: selectedCustomerId,
            status: targetStatus
          })
        });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkOperating(false);
    showToast(`Ad Groups updated: ${successCount} ${targetStatus === "ENABLED" ? "enabled" : "paused"}${failCount > 0 ? `, ${failCount} failed` : ""}`);
    setSelectedAdGroupIds([]);
    loadAdGroups(selectedCustomerId);
  };

  const handleBulkDeleteAdGroups = async () => {
    if (selectedAdGroupIds.length === 0) {
      showToast("Please select at least one ad group.");
      return;
    }
    if (!confirm(`⚠️ Remove/Delete ${selectedAdGroupIds.length} selected ad group(s) from Google Ads?`)) return;

    setIsBulkOperating(true);
    let successCount = 0;
    let failCount = 0;

    for (const agId of selectedAdGroupIds) {
      try {
        const res = await api(`/ad-groups/${agId}?orgId=${orgId}&customerId=${selectedCustomerId}`, { method: "DELETE" });
        if (res.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkOperating(false);
    showToast(`Ad Groups removed: ${successCount} deleted${failCount > 0 ? `, ${failCount} failed` : ""}`);
    setSelectedAdGroupIds([]);
    loadAdGroups(selectedCustomerId);
  };

  async function deleteKeyword(kw: any) {
    try {
      const res = await api(`/keywords/${kw.id}?orgId=${orgId}&customerId=${selectedCustomerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Keyword removed");
      loadKeywords(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); }
  }

  async function addKeywords() {
    if (!newKeywords.trim() || !newKwAdGroupRes) { showToast("Enter keywords and select an ad group"); return; }
    setAddingKw(true);
    try {
      const kwList = newKeywords.split("\n").filter(k => k.trim()).map(text => ({ text: text.trim(), matchType: newKwMatchType }));
      const res = await api("/keywords", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, customerId: selectedCustomerId, adGroupId: newKwAdGroupId, adGroupResourceName: newKwAdGroupRes, keywords: kwList })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(`${kwList.length} keywords added ✓`);
      setShowAddKeyword(false); setNewKeywords(""); loadKeywords(selectedCustomerId);
    } catch (e: any) { showToast(`Error: ${e.message}`); } finally { setAddingKw(false); }
  }

  async function analyzeCampaign(c: any) {
    setAnalyzing(true); setAnalysis(null); setShowAnalysis(true);
    try {
      const [kwRes, stRes] = await Promise.all([
        api(`/keywords?orgId=${orgId}&customerId=${selectedCustomerId}&adGroupId=${c.googleAdsCampaignId}`),
        api(`/reports/search-terms?orgId=${orgId}&customerId=${selectedCustomerId}&dateRange=${dateRange}`)
      ]);
      const kws = await kwRes.json();
      const sts = await stRes.json();

      const res = await api("/analyze-campaign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignData: c, keywords: kws.slice(0, 20), searchTerms: sts.slice(0, 20) })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setAnalysis(data);
    } catch (e: any) { showToast(`Analysis failed: ${e.message}`); setShowAnalysis(false); } finally { setAnalyzing(false); }
  }

  const openEditCampaignModal = async (c: any, tab: "info" | "assets" | "targeting" | "all" | "preview" = "info") => {
    setSelectedCampaignDetails(c);
    setActiveDetailsTab(tab);
    setDetailError("");
    setDetailName(c.name || "");
    setDetailBudget(c.budget || (c.live?.budgetDailyAmount) || 500);
    setDetailStatus(c.liveStatus || c.status || "PAUSED");
    setDetailStartDate(c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "");
    setDetailEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
    setDetailFinalUrl(c.finalUrl || "");
    setDetailBiddingStrategy(c.biddingStrategy || c.live?.biddingStrategyType || "Maximize conversions");
    setDetailTargetCpa(c.live?.targetCpaMicros ? c.live.targetCpaMicros / 1_000_000 : "");
    setDetailTargetRoas(c.live?.targetRoas ? c.live.targetRoas : "");
    setDetailNetworkSearch(c.live?.networkSettings?.targetGoogleSearch !== false);
    setDetailNetworkSearchPartners(c.live?.networkSettings?.targetPartnerSearchNetwork === true);
    setDetailNetworkDisplay(c.live?.networkSettings?.targetContentNetwork === true);
    setDetailPositiveGeoTargetType(c.live?.geoTargetTypeSetting?.positiveGeoTargetType || "PRESENCE_OR_INTEREST");
    setDetailTrackingUrlTemplate(c.live?.trackingUrlTemplate || "");
    setDetailFinalUrlSuffix(c.live?.finalUrlSuffix || "");
    setEditingParamField(null);

    // Fetch fresh Google Ads API v24 data for this campaign if saved
    if (c.id) {
      setDetailLoadingLive(true);
      try {
        const res = await api(`/campaigns/${c.id}?customerId=${selectedCustomerId}&orgId=${orgId}`);
        if (res.ok) {
          const freshData = await res.json();
          setSelectedCampaignDetails(freshData);
          if (freshData.name) setDetailName(freshData.name);
          if (freshData.budget) setDetailBudget(freshData.budget);
          if (freshData.status) setDetailStatus(freshData.status);
          if (freshData.startDate) setDetailStartDate(new Date(freshData.startDate).toISOString().split("T")[0]);
          if (freshData.endDate) setDetailEndDate(new Date(freshData.endDate).toISOString().split("T")[0]);
          if (freshData.finalUrl) setDetailFinalUrl(freshData.finalUrl);
          if (freshData.biddingStrategy) setDetailBiddingStrategy(freshData.biddingStrategy);

          const live = freshData.live;
          if (live) {
            if (live.name) setDetailName(live.name);
            if (live.status) setDetailStatus(live.status);
            if (live.budgetDailyAmount) setDetailBudget(live.budgetDailyAmount);
            if (live.startDateTime) setDetailStartDate(live.startDateTime.split(" ")[0]);
            if (live.endDateTime) setDetailEndDate(live.endDateTime.split(" ")[0]);
            if (live.biddingStrategyType) setDetailBiddingStrategy(live.biddingStrategyType);
            if (live.targetCpaMicros) setDetailTargetCpa(live.targetCpaMicros / 1_000_000);
            if (live.targetRoas) setDetailTargetRoas(live.targetRoas);
            if (live.networkSettings) {
              setDetailNetworkSearch(live.networkSettings.targetGoogleSearch !== false);
              setDetailNetworkSearchPartners(live.networkSettings.targetPartnerSearchNetwork === true);
              setDetailNetworkDisplay(live.networkSettings.targetContentNetwork === true);
            }
            if (live.geoTargetTypeSetting?.positiveGeoTargetType) {
              setDetailPositiveGeoTargetType(live.geoTargetTypeSetting.positiveGeoTargetType);
            }
            if (live.trackingUrlTemplate !== undefined) setDetailTrackingUrlTemplate(live.trackingUrlTemplate || "");
            if (live.finalUrlSuffix !== undefined) setDetailFinalUrlSuffix(live.finalUrlSuffix || "");
          }
        }
      } catch (fErr: any) {
        console.warn("Could not refresh campaign live data:", fErr.message);
      } finally {
        setDetailLoadingLive(false);
      }
    }
  };

  async function saveCampaignDetails() {
    if (!selectedCampaignDetails || !detailName.trim()) { showToast("Campaign name is required"); return; }
    setIsSavingDetails(true);
    setDetailError("");
    try {
      const payload: any = {
        orgId,
        customerId: selectedCustomerId,
        name: detailName.trim(),
        budget: Number(detailBudget) || undefined,
        status: detailStatus,
        startDate: detailStartDate || undefined,
        endDate: detailEndDate || null,
        finalUrl: detailFinalUrl || undefined,
        biddingStrategy: detailBiddingStrategy || undefined,
        targetCpa: detailTargetCpa !== "" ? Number(detailTargetCpa) : undefined,
        targetRoas: detailTargetRoas !== "" ? Number(detailTargetRoas) : undefined,
        networkSettings: {
          targetGoogleSearch: detailNetworkSearch,
          targetSearchNetwork: detailNetworkSearch,
          targetContentNetwork: detailNetworkDisplay,
          targetPartnerSearchNetwork: detailNetworkSearchPartners
        },
        geoTargetTypeSetting: {
          positiveGeoTargetType: detailPositiveGeoTargetType,
          negativeGeoTargetType: "PRESENCE"
        },
        trackingUrlTemplate: detailTrackingUrlTemplate,
        finalUrlSuffix: detailFinalUrlSuffix
      };

      const res = await api(`/campaigns/${selectedCampaignDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      showToast("Campaign settings updated live in Google Ads ✓");
      setSelectedCampaignDetails((prev: any) => ({
        ...prev,
        name: detailName.trim(),
        budget: Number(detailBudget) || prev.budget,
        status: detailStatus,
        liveStatus: detailStatus,
        startDate: detailStartDate ? new Date(detailStartDate) : prev.startDate,
        endDate: detailEndDate ? new Date(detailEndDate) : null,
        finalUrl: detailFinalUrl,
        biddingStrategy: detailBiddingStrategy
      }));
      loadCampaigns(selectedCustomerId);
    } catch (e: any) {
      const msg = e.message || "Failed to update campaign";
      setDetailError(msg);
      showToast(`Error: ${msg}`);
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function saveSingleField(fieldKey: string, newValue: any) {
    if (!selectedCampaignDetails) return;
    setIsSavingDetails(true);
    try {
      const payload: any = {
        orgId,
        customerId: selectedCustomerId,
        [fieldKey]: newValue
      };
      const res = await api(`/campaigns/${selectedCampaignDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Field update failed");
      showToast(`Updated ${fieldKey} successfully ✓`);
      setSelectedCampaignDetails((prev: any) => ({
        ...prev,
        [fieldKey]: newValue
      }));
      setEditingParamField(null);
      loadCampaigns(selectedCustomerId);
    } catch (e: any) {
      showToast(`Error updating ${fieldKey}: ${e.message}`);
    } finally {
      setIsSavingDetails(false);
    }
  }

  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalCost = campaigns.reduce((s, c) => s + parseFloat(c.cost || "0"), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0);
  const avgCtr = campaigns.length > 0 ? (campaigns.reduce((s, c) => s + parseFloat(c.ctr || "0"), 0) / campaigns.length).toFixed(2) + "%" : "0%";
  const enabledCamps = campaigns.filter(c => (c.liveStatus || c.status) === "ENABLED").length;

  const filteredKw = keywords.filter(kw => kw.text?.toLowerCase().includes(kwSearch.toLowerCase()));
  const filteredCamps = campaigns.filter(c => c.status !== "REMOVED" && c.liveStatus !== "REMOVED" && c.name?.toLowerCase().includes(campSearch.toLowerCase()));

  if (configLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
        {/* Header Skeleton */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-9 w-36 bg-slate-200 rounded-xl" />
        </div>

        {/* Content Body Skeleton */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-7 w-28 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-100 rounded-xl" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 border border-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-slate-900 font-bold">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Google Ads Manager</h1>
              <p className="text-[11px] text-slate-500">Google Search, PMax &amp; YouTube Platform</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-lg text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Megaphone className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Connect Google Ads</h1>
              <p className="text-slate-600 text-xs leading-relaxed">
                Connect your Google account to manage search campaigns, track keywords, monitor conversions, and run AI-powered optimization — all without leaving your CRM.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {["Campaign Management", "Ad Group & Ad Control", "Keyword Research", "Performance Reports", "Conversion Tracking", "AI Recommendations"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <a
              href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads&source=google_ads`}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all shadow-sm mx-auto w-fit"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect with Google
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && !selectedCustomerId) {
    return (
      <AccountPickerScreen
        orgId={orgId}
        onAccountSelected={handleSelectAccount}
        onDisconnect={handleDisconnectGoogleAds}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden">
      <Suspense fallback={null}>
        <SearchParamsHandler onOAuth={handleOAuthParams} />
      </Suspense>

      {/* ── Top Header Bar ── */}
      <header className="relative z-50 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200 bg-white shrink-0 gap-2 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold">
            <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900 text-sm leading-none truncate">Google Ads</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block truncate">Campaigns, Performance, Keywords &amp; Optimization</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isConnected && (
            <AccountSelector
              accounts={accounts}
              selected={selectedCustomerId}
              onSelect={handleSelectAccount}
              loading={accountsLoading}
              orgId={orgId}
            />
          )}

          {/* Date range filter - hidden on mobile view */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="hidden md:block bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
          >
            {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <button
            onClick={() => selectedCustomerId && activeTab === "overview" ? loadOverview(selectedCustomerId) : selectedCustomerId && loadCampaigns(selectedCustomerId)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Unified Google Ads Profile & Account Status Button */}
          {selectedCustomerId && (
            <button
              onClick={() => router.push(`/ads/profile?customerId=${selectedCustomerId}`)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="View Google Ads Profile, Health Status & Business Settings"
            >
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Google Ads Profile</span>
              <span className="sm:hidden">Profile</span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                  accountReadiness?.overallStatus === "READY"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : accountReadiness?.overallStatus === "BLOCKED"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : accountReadiness?.overallStatus === "WARNING"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-slate-200 text-slate-600 border border-slate-300"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    accountReadiness?.overallStatus === "READY"
                      ? "bg-emerald-600 animate-pulse"
                      : accountReadiness?.overallStatus === "BLOCKED"
                      ? "bg-rose-600"
                      : accountReadiness?.overallStatus === "WARNING"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                {readinessLoading
                  ? "..."
                  : accountReadiness?.overallStatus === "READY"
                  ? "Active"
                  : accountReadiness?.overallStatus === "BLOCKED"
                  ? "Blocked"
                  : accountReadiness?.overallStatus === "WARNING"
                  ? "Warn"
                  : "Health"}
              </span>
            </button>
          )}

          {selectedCustomerId && (
            <button
              onClick={() => {
                if (accountReadiness?.overallStatus === "BLOCKED") {
                  showToast(`Cannot create campaigns: ${accountReadiness.blockedReason || "Account has a confirmed blocker."}`);
                  return;
                }
                router.push(`/ads/campaigns/create/manual?customerId=${selectedCustomerId}`);
              }}
              disabled={accountReadiness?.overallStatus === "BLOCKED"}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                accountReadiness?.overallStatus === "BLOCKED"
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              title={accountReadiness?.overallStatus === "BLOCKED" ? `Campaign creation blocked: ${accountReadiness.blockedReason}` : "Create a new campaign"}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </button>
          )}

          {isConnected ? (
            <button
              onClick={handleDisconnectGoogleAds}
              disabled={isDisconnecting}
              title="Disconnect Google Ads and log out"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isDisconnecting ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" />
              ) : (
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              )}
              <span className="hidden md:inline">{isDisconnecting ? "Disconnecting..." : "Disconnect"}</span>
            </button>
          ) : (
            <a
              href={`${BACKEND}/api/gmb/oauth/connect?orgId=${orgId}&redirect=/ads&source=google_ads`}
              title="Connect Google account"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="hidden sm:inline">Connect Google</span>
              <span className="sm:hidden">Connect</span>
            </a>
          )}
        </div>
      </header>

      {/* ── Tier Selector Bar (4 Parts) ── */}
      <div className="bg-slate-100/90 border-b border-slate-200/90 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0 mr-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Parts:
          </span>
          {TIERS.map(tier => {
            const isTierActive = activeTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  setActiveTier(tier.id);
                  if (!tier.tabIds.includes(activeTab)) {
                    setActiveTab(tier.tabIds[0]);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  isTierActive
                    ? `${tier.color.activeBg} border-transparent shadow-xs`
                    : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                }`}
                title={tier.shortDesc}
              >
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wide ${
                  isTierActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {tier.number}
                </span>
                <span>{tier.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isTierActive ? "bg-white/25 text-white" : "bg-slate-200/60 text-slate-500"
                }`}>
                  {tier.tabIds.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section Tabs (Filtered by Active Tier) ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white overflow-x-auto shrink-0 px-4">
        {TABS.filter(t => {
          const currentTierObj = TIERS.find(tier => tier.id === activeTier);
          return currentTierObj ? currentTierObj.tabIds.includes(t.id) : true;
        }).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === t.id ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {!selectedCustomerId && activeTab !== "settings" ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Building2 className="h-12 w-12 text-slate-500 mx-auto" />
            <p className="text-slate-900 font-bold text-sm">Select a Google Ads account</p>
            <p className="text-slate-500 text-xs">Use the account selector in the header to choose an active account.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ══ SECTION DESCRIPTION BANNER ══ */}
          {SECTION_METADATA[activeTab] && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {(() => {
                    const CurrentIcon = SECTION_METADATA[activeTab].icon;
                    return (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <CurrentIcon className="h-5 w-5" />
                      </div>
                    );
                  })()}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {SECTION_METADATA[activeTab].label}
                      </h2>
                      <span className="text-[11px] font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {SECTION_METADATA[activeTab].tagline}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {SECTION_METADATA[activeTab].tierNumber}: {SECTION_METADATA[activeTab].tierName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                      {SECTION_METADATA[activeTab].description}
                    </p>
                  </div>
                </div>

                {/* CRM Use Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shrink-0 md:max-w-md">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">CRM Purpose</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {SECTION_METADATA[activeTab].crmUse}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* ══ OVERVIEW TAB ══ */}
          {activeTab === "overview" && (
            <>
              {overviewLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <MetricCard icon={Eye} label="Impressions" value={overview ? Number(overview.impressions).toLocaleString() : totalImpressions.toLocaleString()} color="bg-blue-50 text-blue-700" />
                    <MetricCard icon={MousePointerClick} label="Clicks" value={overview ? Number(overview.clicks).toLocaleString() : totalClicks.toLocaleString()} color="bg-blue-50 text-blue-700" />
                    <MetricCard icon={TrendingUp} label="CTR" value={overview?.ctr || avgCtr} color="bg-emerald-50 text-emerald-700" />
                    <MetricCard icon={DollarSign} label="Spend" value={`₹${overview?.cost || totalCost.toFixed(2)}`} color="bg-amber-50 text-amber-700" />
                    <MetricCard icon={Target} label="Conversions" value={overview ? Number(overview.conversions).toFixed(1) : totalConversions} color="bg-purple-50 text-purple-700" />
                    <MetricCard icon={Activity} label="Avg. CPC" value={`₹${overview?.avgCpc || "0.00"}`} color="bg-indigo-50 text-indigo-700" />
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Active Campaigns", val: enabledCamps, icon: Megaphone, color: "text-emerald-700 bg-emerald-50" },
                      { label: "Total Campaigns", val: campaigns.length, icon: Layers, color: "text-blue-700 bg-blue-50" },
                      { label: "Cost/Conversion", val: `₹${overview?.costPerConversion || "0.00"}`, icon: BadgePercent, color: "text-amber-700 bg-amber-50" },
                      { label: "Conv. Value", val: `₹${overview?.allConversionsValue || "0.00"}`, icon: Award, color: "text-purple-700 bg-purple-50" }
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">{s.val}</p>
                          <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent campaigns table */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-blue-600" />Campaigns <span className="text-slate-500 font-normal">({campaigns.length})</span></h2>
                      <button onClick={() => setActiveTab("campaigns")} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">View all <ChevronRight className="h-3.5 w-3.5" /></button>
                    </div>
                    {campaigns.slice(0, 5).map(c => (
                      <div key={c.id} className="px-5 py-3.5 flex items-center gap-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCampaignDetails(c);
                                setActiveDetailsTab("info");
                                setDetailName(c.name);
                                setDetailBudget(c.budget);
                                setDetailStatus(c.liveStatus || c.status);
                                setDetailEndDate(c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "");
                              }}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left text-sm truncate max-w-[200px] block focus:outline-none cursor-pointer"
                            >
                              {c.name}
                            </button>
                            <Pill status={c.liveStatus || c.status} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{c.campaignType || "SEARCH"} · ₹{Number(c.budget || (c.amountMicros ? Number(c.amountMicros) / 1_000_000 : 0)).toLocaleString()}/day</p>
                        </div>
                        <div className="flex gap-6 text-center">
                          <Stat label="Impr." value={Number(c.impressions || 0).toLocaleString()} />
                          <Stat label="Clicks" value={Number(c.clicks || 0).toLocaleString()} />
                          <Stat label="Spend" value={`₹${c.cost || "0.00"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ RECOMMENDATIONS TAB ══ */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {/* Header and Control Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div>
                  <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Google Ads &amp; CRM Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official live optimization suggestions from Google Ads API alongside Jisnu AI intelligence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setRecFilter("ALL")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                      }`}
                    >
                      All ({nativeRecommendations.length})
                    </button>
                    <button
                      onClick={() => setRecFilter("APPLIABLE")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recFilter === "APPLIABLE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                      }`}
                    >
                      Actionable ({nativeRecommendations.filter(r => r.isAppliable).length})
                    </button>
                    <button
                      onClick={() => setRecFilter("VIEW_ONLY")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recFilter === "VIEW_ONLY" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
                      }`}
                    >
                      View Only ({nativeRecommendations.filter(r => !r.isAppliable).length})
                    </button>
                  </div>

                  <button
                    onClick={() => loadRecommendations(selectedCustomerId)}
                    disabled={recsLoading}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                    title="Refresh Google Ads Recommendations"
                  >
                    <RefreshCw className={`h-4 w-4 ${recsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Two Separate Clear Sections */}
              <div className="space-y-6">
                {/* 1. Official Google Ads Recommendations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        Google Ads Recommendations
                      </h3>
                      <p className="text-[11px] text-slate-500">Official recommendations retrieved directly from your Google Ads account via Google Ads API</p>
                    </div>
                  </div>

                  {recsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs gap-3">
                      <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-500">Retrieving official recommendations from Google Ads...</p>
                    </div>
                  ) : nativeRecommendations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2 shadow-2xs">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No Pending Google Ads Recommendations</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Your Google Ads account is fully optimized according to Google Ads guidelines, or there are no new automated suggestions for this customer account at this time.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nativeRecommendations
                        .filter(r => {
                          if (recFilter === "APPLIABLE") return r.isAppliable;
                          if (recFilter === "VIEW_ONLY") return !r.isAppliable;
                          return true;
                        })
                        .map(rec => (
                          <div
                            key={rec.id || rec.resourceName}
                            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 hover:border-blue-300 transition-all shadow-2xs group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono border border-slate-200 uppercase">
                                    {rec.type.replace(/_/g, " ")}
                                  </span>
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {rec.type.split("_").map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                                  </h4>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  rec.isAppliable 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                  {rec.isAppliable ? "Actionable in API" : "Manual / View Only"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {rec.campaignName ? (
                                  <>Applicable to campaign: <strong className="text-slate-800">{rec.campaignName}</strong></>
                                ) : (
                                  <>Account-wide Google Ads optimization opportunity.</>
                                )}
                              </p>

                              {/* Impact Stats if available */}
                              {rec.impact?.hasImpact && (
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px]">
                                  <div>
                                    <p className="text-slate-500 font-semibold">Clicks</p>
                                    <p className={`font-bold ${rec.impact.deltaClicks >= 0 ? "text-emerald-600" : "text-slate-700"}`}>
                                      {rec.impact.deltaClicks > 0 ? `+${rec.impact.deltaClicks}` : rec.impact.deltaClicks}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 font-semibold">Est. Cost</p>
                                    <p className="font-bold text-slate-800">₹{rec.impact.potentialCost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 font-semibold">Conversions</p>
                                    <p className={`font-bold ${rec.impact.deltaConversions >= 0 ? "text-purple-600" : "text-slate-700"}`}>
                                      {rec.impact.deltaConversions > 0 ? `+${rec.impact.deltaConversions.toFixed(1)}` : rec.impact.deltaConversions.toFixed(1)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => setSelectedRecDetails(rec)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                View Details
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setConfirmDismissRec(rec)}
                                  disabled={dismissingRecId === rec.id}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {dismissingRecId === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Dismiss"}
                                </button>

                                {rec.isAppliable ? (
                                  <button
                                    onClick={() => setConfirmApplyRec(rec)}
                                    disabled={applyingRecId === rec.id}
                                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    {applyingRecId === rec.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    Apply
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setSelectedRecDetails(rec)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                                  >
                                    Review in Google
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* 2. Jisnu AI Recommendations */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        Jisnu AI Recommendations
                      </h3>
                      <p className="text-[11px] text-slate-500">AI-generated recommendations and performance audits based on CRM business context and live campaign search terms</p>
                    </div>
                    {campaigns.length > 0 && (
                      <button
                        onClick={() => analyzeCampaign(campaigns[0])}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Bot className="h-3.5 w-3.5 text-purple-600" /> Run AI Audit
                      </button>
                    )}
                  </div>

                  {analysis ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-4 pb-3 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center font-black text-xl text-purple-700">
                          {analysis.score}/10
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Campaign Health Assessment</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{analysis.assessment}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(analysis.recommendations || []).map((r: any, i: number) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900">{r.title}</p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                r.impact === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>{r.impact}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{r.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2 shadow-2xs">
                      <p className="text-xs font-bold text-slate-800">No active AI campaign audit cached</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Click &quot;Run AI Audit&quot; or select any campaign from the Campaigns tab to analyze search terms, negative keywords, and budget efficiency.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ CAMPAIGNS TAB ══ */}
          {activeTab === "campaigns" && (
            <GoogleCampaignsTableSection
              campaigns={campaigns}
              campsLoading={campsLoading}
              selectedCustomerId={selectedCustomerId}
              isCampaignSelectionMode={isCampaignSelectionMode}
              setIsCampaignSelectionMode={setIsCampaignSelectionMode}
              selectedCampaignIds={selectedCampaignIds}
              setSelectedCampaignIds={setSelectedCampaignIds}
              isBulkOperating={isBulkOperating}
              loadCampaigns={loadCampaigns}
              openEditCampaignModal={openEditCampaignModal}
              toggleCampaign={toggleCampaign}
              analyzeCampaign={analyzeCampaign}
              deleteCampaign={deleteCampaign}
              toggling={toggling}
              handleBulkToggleStatus={handleBulkToggleStatus}
              setShowBulkBudgetModal={setShowBulkBudgetModal}
              handleBulkDeleteCampaigns={handleBulkDeleteCampaigns}
              router={router}
              Pill={Pill}
              EmptyState={EmptyState}
            />
          )}

          {/* Bulk Budget Update Modal */}
          {showBulkBudgetModal && (
                <Modal title={`Update Daily Budget (${selectedCampaignIds.length} Selected)`} onClose={() => setShowBulkBudgetModal(false)}>
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enter the new daily budget amount to apply across all <strong>{selectedCampaignIds.length}</strong> selected campaigns.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">New Daily Budget (₹ / day)</label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={bulkBudgetVal}
                        onChange={(e) => setBulkBudgetVal(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold font-mono focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowBulkBudgetModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkUpdateBudget}
                        disabled={isBulkOperating || !bulkBudgetVal}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isBulkOperating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Apply to {selectedCampaignIds.length} Campaigns</span>
                      </button>
                    </div>
                  </div>
                </Modal>
              )}

          {/* ══ AD GROUPS & ADS COMBINED TAB ══ */}
          {activeTab === "ad-groups" && (
            <div className="space-y-4">
              {/* Unified Header & Quick Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>Ad Groups &amp; Ads</span>
                    </h3>
                    <span className="text-slate-500 font-normal text-xs bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {adGroups.length} groups · {ads.length} ads
                    </span>
                  </div>

                  {adGroups.length > 0 && (
                    <div className="w-full sm:w-auto">
                      <select
                        value={selectedAdGroupFilter}
                        onChange={(e) => setSelectedAdGroupFilter(e.target.value)}
                        className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 sm:py-1.5 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer truncate"
                      >
                        <option value="ALL">All Ad Groups ({adGroups.length})</option>
                        {adGroups.map(ag => (
                          <option key={ag.id} value={ag.id}>{ag.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => {
                      if (expandedAdGroupIds.length === adGroups.length) {
                        setExpandedAdGroupIds([]);
                      } else {
                        setExpandedAdGroupIds(adGroups.map(ag => ag.id));
                      }
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{expandedAdGroupIds.length === adGroups.length ? "Collapse All" : "Expand All"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAdGroupSelectionMode(prev => {
                        if (prev) setSelectedAdGroupIds([]);
                        return !prev;
                      });
                    }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border shrink-0 ${
                      isAdGroupSelectionMode
                        ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Toggle multi-select mode to edit, pause, or remove ad groups"
                  >
                    <Sliders className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{isAdGroupSelectionMode ? "Exit Select" : "Edit Groups"}</span>
                    {selectedAdGroupIds.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-bold shrink-0">
                        {selectedAdGroupIds.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      loadAdGroups(selectedCustomerId);
                      loadAds(selectedCustomerId);
                    }}
                    className="p-2 sm:p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shrink-0"
                    title="Refresh Ad Groups & Ads"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Multi-Select Floating Bulk Actions Bar for Ad Groups */}
              {isAdGroupSelectionMode && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 flex-wrap shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={adGroups.length > 0 && selectedAdGroupIds.length === adGroups.length}
                        onChange={toggleSelectAllAdGroups}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Select All ({selectedAdGroupIds.length}/{adGroups.length})</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleBulkToggleAdGroupStatus("ENABLED")}
                      disabled={isBulkOperating || selectedAdGroupIds.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Enable ({selectedAdGroupIds.length})</span>
                    </button>

                    <button
                      onClick={() => handleBulkToggleAdGroupStatus("PAUSED")}
                      disabled={isBulkOperating || selectedAdGroupIds.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause ({selectedAdGroupIds.length})</span>
                    </button>

                    <button
                      onClick={handleBulkDeleteAdGroups}
                      disabled={isBulkOperating || selectedAdGroupIds.length === 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {isBulkOperating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      <span>Delete ({selectedAdGroupIds.length})</span>
                    </button>

                    <button
                      onClick={() => setSelectedAdGroupIds([])}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* 1. HIERARCHICAL VIEW (Mobile Card Layout + Desktop Table) */}
              {adGroupSubView === "hierarchical" && (
                <div>
                  {adGroupsLoading || adsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white flex items-center justify-center py-16 shadow-2xs">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  ) : adGroups.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      <EmptyState icon={Layers} title="No ad groups found" sub="Ad groups and ads are automatically synced from your campaigns." />
                    </div>
                  ) : (
                    <>
                      {/* ── MOBILE CARDS VIEW (visible on < md screens) ── */}
                      <div className="block md:hidden space-y-3">
                        {adGroups
                          .filter(ag => selectedAdGroupFilter === "ALL" || ag.id === selectedAdGroupFilter)
                          .map(ag => {
                            const isSelected = selectedAdGroupIds.includes(ag.id);
                            const isExpanded = expandedAdGroupIds.includes(ag.id);
                            const groupAds = ads.filter(a => String(a.adGroupId) === String(ag.id) || a.adGroupName === ag.name);

                            return (
                              <div
                                key={`mobile-ag-${ag.id}`}
                                className={`rounded-2xl border bg-white shadow-2xs transition-all overflow-hidden ${
                                  isSelected ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20" : "border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                {/* Mobile Header / Summary Bar */}
                                <div className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                      {isAdGroupSelectionMode && (
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleSelectAdGroup(ag.id)}
                                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                        />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <Layers className="h-4 w-4 text-blue-600 shrink-0" />
                                          <p className="font-bold text-slate-900 text-sm truncate">{ag.name}</p>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {ag.id}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Pill status={ag.status} />
                                    </div>
                                  </div>

                                  {/* Mobile Metrics Grid */}
                                  <div className="grid grid-cols-2 gap-2 bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 text-xs">
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Type / CPC</span>
                                      <p className="font-semibold text-slate-800 text-[11px] truncate">
                                        {ag.type?.replace(/_/g, " ") || "SEARCH"} • {ag.cpcBidMicros ? `₹${(Number(ag.cpcBidMicros) / 1_000_000).toFixed(2)}` : "—"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Spend</span>
                                      <p className="font-bold text-emerald-700">₹{ag.cost || "0.00"}</p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Impressions / Clicks</span>
                                      <p className="font-semibold text-slate-800">
                                        {Number(ag.impressions || 0).toLocaleString()} / {Number(ag.clicks || 0).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Conversions</span>
                                      <p className="font-semibold text-purple-700">{Number(ag.conversions || 0).toFixed(1)}</p>
                                    </div>
                                  </div>

                                  {/* Expand/Collapse Ads Button on Mobile */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedAdGroupIds(prev =>
                                        prev.includes(ag.id) ? prev.filter(id => id !== ag.id) : [...prev, ag.id]
                                      );
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      isExpanded
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                                      {groupAds.length} Responsive Search Ads
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180 text-blue-600" : "text-slate-500"}`} />
                                  </button>
                                </div>

                                {/* Expanded Mobile Nested Ads Container */}
                                {isExpanded && (
                                  <div className="bg-slate-50 border-t border-slate-200 p-3.5 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="h-3 w-3 text-blue-600" />
                                        Creatives in {ag.name}
                                      </h4>
                                      <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                        {groupAds.length} Total
                                      </span>
                                    </div>

                                    {groupAds.length === 0 ? (
                                      <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center text-xs text-slate-500">
                                        No ads found in this ad group.
                                      </div>
                                    ) : (
                                      <div className="space-y-2.5">
                                        {groupAds.map(ad => (
                                          <div key={`m-ad-${ad.id}`} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2 shadow-2xs">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                              <div className="flex items-center gap-1.5">
                                                <Pill status={ad.status} />
                                                <span className="text-[10px] font-mono text-slate-500">{ad.adType?.replace(/_/g, " ") || "RESPONSIVE SEARCH"}</span>
                                              </div>
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                                                ad.adStrength === "EXCELLENT" ? "text-emerald-700 border-emerald-200 bg-emerald-50" :
                                                ad.adStrength === "GOOD" ? "text-blue-700 border-blue-200 bg-blue-50" :
                                                "text-slate-600 border-slate-200 bg-slate-100"
                                              }`}>
                                                Strength: {ad.adStrength || "—"}
                                              </span>
                                            </div>

                                            {/* Mobile Headlines */}
                                            <div>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Headlines</p>
                                              <div className="flex flex-wrap gap-1">
                                                {(ad.headlines || []).map((h: any, i: number) => (
                                                  <span key={i} className="text-[11px] bg-slate-50 text-slate-800 font-medium px-2 py-0.5 rounded border border-slate-200">
                                                    {h.text || h}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Mobile Descriptions */}
                                            <div>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Descriptions</p>
                                              <div className="space-y-1">
                                                {(ad.descriptions || []).map((d: any, i: number) => (
                                                  <p key={i} className="text-[11px] text-slate-600 bg-slate-50/60 p-1.5 rounded border border-slate-100 leading-snug">
                                                    {d.text || d}
                                                  </p>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Mobile Paths / URL */}
                                            {(ad.finalUrls?.[0] || ad.finalUrl || ad.path1) && (
                                              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100 flex items-center gap-1 truncate">
                                                <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{ad.finalUrls?.[0] || ad.finalUrl || "—"}</span>
                                                {(ad.path1 || ad.path2) && (
                                                  <span className="text-slate-700 font-semibold shrink-0">/{ad.path1 || ""}{ad.path2 ? `/${ad.path2}` : ""}</span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {/* ── DESKTOP TABLE VIEW (hidden on mobile, visible on md:table) ── */}
                      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                <th className="p-4 w-10 text-center"></th>
                                {isAdGroupSelectionMode && (
                                  <th className="p-4 w-10 text-center">
                                    <input
                                      type="checkbox"
                                      checked={adGroups.length > 0 && selectedAdGroupIds.length === adGroups.length}
                                      onChange={toggleSelectAllAdGroups}
                                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                  </th>
                                )}
                                {["Ad Group", "Status", "Type", "CPC Bid", "Ads Count", "Impressions", "Clicks", "Spend", "Conv."].map(h => <th key={h} className="p-4 whitespace-nowrap">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {adGroups
                                .filter(ag => selectedAdGroupFilter === "ALL" || ag.id === selectedAdGroupFilter)
                                .map(ag => {
                                  const isSelected = selectedAdGroupIds.includes(ag.id);
                                  const isExpanded = expandedAdGroupIds.includes(ag.id);
                                  const groupAds = ads.filter(a => String(a.adGroupId) === String(ag.id) || a.adGroupName === ag.name);

                                  return (
                                    <React.Fragment key={ag.id}>
                                      <tr className={`transition-all ${isSelected ? "bg-blue-50/60 hover:bg-blue-50" : isExpanded ? "bg-slate-50/70" : "hover:bg-slate-50/80"}`}>
                                        <td className="p-4 w-10 text-center">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setExpandedAdGroupIds(prev =>
                                                prev.includes(ag.id) ? prev.filter(id => id !== ag.id) : [...prev, ag.id]
                                              );
                                            }}
                                            className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-all cursor-pointer"
                                            title={isExpanded ? "Collapse Ads" : `Expand Ads (${groupAds.length})`}
                                          >
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180 text-blue-600" : ""}`} />
                                          </button>
                                        </td>
                                        {isAdGroupSelectionMode && (
                                          <td className="p-4 w-10 text-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => toggleSelectAdGroup(ag.id)}
                                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                          </td>
                                        )}
                                        <td className="p-4">
                                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                            <Layers className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                            <span>{ag.name}</span>
                                          </p>
                                          <p className="text-[11px] text-slate-500 font-mono pl-5">{ag.id}</p>
                                        </td>
                                        <td className="p-4"><Pill status={ag.status} /></td>
                                        <td className="p-4 text-slate-600 font-mono">{ag.type}</td>
                                        <td className="p-4 font-semibold text-slate-900">{ag.cpcBidMicros ? `₹${(Number(ag.cpcBidMicros) / 1_000_000).toFixed(2)}` : "—"}</td>
                                        <td className="p-4">
                                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            groupAds.length > 0 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-500"
                                          }`}>
                                            <FileText className="h-3 w-3" />
                                            {groupAds.length} Ads
                                          </span>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-900">{Number(ag.impressions || 0).toLocaleString()}</td>
                                        <td className="p-4 font-semibold text-slate-900">{Number(ag.clicks || 0).toLocaleString()}</td>
                                        <td className="p-4 font-bold text-emerald-700">₹{ag.cost || "0.00"}</td>
                                        <td className="p-4 font-semibold text-purple-700">{Number(ag.conversions || 0).toFixed(1)}</td>
                                      </tr>

                                      {/* Desktop Expanded Nested Ads */}
                                      {isExpanded && (
                                        <tr className="bg-slate-50/90 border-y border-slate-200">
                                          <td colSpan={isAdGroupSelectionMode ? 11 : 10} className="p-4 pl-12">
                                            <div className="space-y-3">
                                              <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                                                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                                                  Ads in &quot;{ag.name}&quot; ({groupAds.length})
                                                </h4>
                                              </div>

                                              {groupAds.length === 0 ? (
                                                <div className="bg-white rounded-xl p-4 border border-slate-200 text-center text-xs text-slate-500">
                                                  No ads found under this ad group.
                                                </div>
                                              ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  {groupAds.map(ad => (
                                                    <div key={ad.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-2xs hover:border-blue-300 transition-all">
                                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-2">
                                                          <Pill status={ad.status} />
                                                          <span className="text-[11px] font-mono text-slate-500">{ad.adType?.replace(/_/g, " ")}</span>
                                                        </div>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                                                          ad.adStrength === "EXCELLENT" ? "text-emerald-700 border-emerald-200 bg-emerald-50" :
                                                          ad.adStrength === "GOOD" ? "text-blue-700 border-blue-200 bg-blue-50" :
                                                          "text-slate-600 border-slate-200 bg-slate-100"
                                                        }`}>
                                                          Ad Strength: {ad.adStrength || "—"}
                                                        </span>
                                                      </div>

                                                      <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Headlines</p>
                                                        <div className="flex flex-wrap gap-1">
                                                          {(ad.headlines || []).map((h: any, i: number) => (
                                                            <span key={i} className="text-xs bg-slate-50 text-slate-800 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                                                              {h.text || h}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Descriptions</p>
                                                        <div className="flex flex-wrap gap-1">
                                                          {(ad.descriptions || []).map((d: any, i: number) => (
                                                            <span key={i} className="text-xs text-slate-600 bg-slate-50/60 px-2 py-0.5 rounded-md border border-slate-100">
                                                              {d.text || d}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ KEYWORDS TAB ══ */}
          {activeTab === "keywords" && (
            <div className="space-y-8">
              <GoogleAdsKeywordTargetingSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`,
                          campaignType: c.campaignType || c.advertisingChannelType
                        }
                      ];
                    })
                  ).values()
                )}
              />

              <div className="pt-4 border-t border-slate-200">
                <GoogleAdsSharedNegativeListsSection
                  customerId={selectedCustomerId}
                  orgId={orgId}
                  campaigns={Array.from(
                    new Map(
                      campaigns.map((c: any) => {
                        const googleCampId = String(c.googleAdsCampaignId || c.id);
                        return [
                          googleCampId,
                          {
                            id: googleCampId,
                            name: c.name,
                            resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`,
                            campaignType: c.campaignType || c.advertisingChannelType
                          }
                        ];
                      })
                    ).values()
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ EXTENSIONS / ASSETS TAB ══ */}
          {activeTab === "extensions" && (
            <div className="space-y-6">
              <GoogleAdsAssetsSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`
                        }
                      ];
                    })
                  ).values()
                )}
              />

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Link2 className="h-4 w-4 text-blue-600" />Legacy Campaign Ad Assets &amp; Sitelinks <span className="text-slate-500 font-normal">({extensions.length})</span></h2>
                  <button onClick={() => loadExtensions(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
                </div>
                {extLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
                ) : extensions.length === 0 ? (
                  <EmptyState icon={Link2} title="No legacy extensions" sub="All new extensions can be created and managed in the Structured Snippets, Promotions, and Lead Forms sections above." />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {extensions.map(ext => (
                      <div key={ext.id} className="p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{ext.text || ext.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{ext.type} · {ext.url || "No link"}</p>
                        </div>
                        <Pill status={ext.status || "ENABLED"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ CONVERSIONS TAB ══ */}
          {activeTab === "conversions" && (
            <div className="space-y-6">
              {/* Google Tag & Enhanced Conversions Integration (API v24) */}
              <GoogleAdsEnhancedConversionsSection
                customerId={selectedCustomerId}
                orgId={orgId}
              />

              {/* Conversion Attribution Reporting (API v24 Official Attribution Models & Segmentation) */}
              <GoogleAdsAttributionSection
                customerId={selectedCustomerId}
                orgId={orgId}
              />

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Target className="h-4 w-4 text-emerald-600" />Conversion Goals <span className="text-slate-500 font-normal">({conversions.length})</span></h2>
                  <button onClick={() => loadConversions(selectedCustomerId)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
                </div>
                {convLoading ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-blue-600 animate-spin" /></div>
                ) : conversions.length === 0 ? (
                  <EmptyState icon={Target} title="No conversion goals" sub="Set up conversion tracking to measure the actions that matter to your business." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">{["Name", "Category", "Status", "Type", "Counting", "Lookback", "Conversions", "Conv. Value"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {conversions.map(conv => (
                          <tr key={conv.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-4 font-bold text-slate-900">{conv.name}</td>
                            <td className="p-4 text-slate-600">{conv.category}</td>
                            <td className="p-4"><Pill status={conv.status} /></td>
                            <td className="p-4 font-mono text-slate-500">{conv.type}</td>
                            <td className="p-4 text-slate-600">{conv.countingType}</td>
                            <td className="p-4 text-slate-600">{conv.lookbackWindow} days</td>
                            <td className="p-4 font-bold text-purple-700">{Number(conv.conversions || 0).toFixed(1)}</td>
                            <td className="p-4 font-bold text-emerald-700">₹{Number(conv.conversionsValue || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ BIDDING STRATEGIES & BID ADJUSTMENTS TAB ══ */}
          {activeTab === "bidding" && (
            <div className="space-y-6">
              <GoogleAdsBiddingSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`
                        }
                      ];
                    })
                  ).values()
                )}
              />

              <GoogleAdsBidAdjustmentsSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`,
                          campaignType: c.campaignType || c.advertisingChannelType
                        }
                      ];
                    })
                  ).values()
                )}
              />

              <GoogleAdsAdScheduleSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`,
                          campaignType: c.campaignType || c.advertisingChannelType
                        }
                      ];
                    })
                  ).values()
                )}
              />
            </div>
          )}

          {/* ══ AUDIENCES TAB ══ */}
          {activeTab === "audiences" && (
            <div className="space-y-6">
              <GoogleAdsDemographicsSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`,
                          campaignType: c.campaignType || c.advertisingChannelType
                        }
                      ];
                    })
                  ).values()
                )}
              />

              <GoogleAdsContentTargetingSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={Array.from(
                  new Map(
                    campaigns.map((c: any) => {
                      const googleCampId = String(c.googleAdsCampaignId || c.id);
                      return [
                        googleCampId,
                        {
                          id: googleCampId,
                          name: c.name,
                          resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${googleCampId}`,
                          campaignType: c.campaignType || c.advertisingChannelType
                        }
                      ];
                    })
                  ).values()
                )}
              />

              <GoogleAdsAudienceSection
                customerId={selectedCustomerId}
                orgId={orgId}
                legacyAudiences={audiences}
              />
            </div>
          )}

          {/* ══ SHOPPING TAB (PRODUCT DIAGNOSTICS & LISTING GROUPS) ══ */}
          {activeTab === "shopping" && (
            <div className="space-y-6">
              <GoogleAdsShoppingSection
                customerId={selectedCustomerId}
                orgId={orgId}
              />
            </div>
          )}

          {/* ══ DATA MANAGER TAB (FIRST-PARTY & OFFLINE DATA) ══ */}
          {activeTab === "data-manager" && (
            <div className="space-y-6">
              <GoogleAdsDataManagerSection
                customerId={selectedCustomerId}
                orgId={orgId}
              />
            </div>
          )}

          {/* ══ REPORTS TAB ══ */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Specialized Google Ads API v24 Reports: Auction Insights & Landing Page Performance */}
              <GoogleAdsReportingSection
                customerId={selectedCustomerId}
                orgId={orgId}
              />

              {/* Search Terms Management (API v24 Live Reporting & Keyword Promoting/Exclusion) */}
              <GoogleAdsSearchTermsSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={campaigns.map((c: any) => ({
                  id: String(c.id),
                  name: c.name,
                  resourceName: c.resourceName || `customers/${selectedCustomerId}/campaigns/${c.id}`,
                  campaignType: c.campaignType || c.advertisingChannelType
                }))}
              />

              {/* Ad Performance Report */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2"><BarChart2 className="h-4 w-4 text-blue-600" />Ad Performance Report <span className="text-slate-500 font-normal">({adReport.length})</span></h2>
                </div>
                {adReport.length === 0 ? (
                  <EmptyState icon={BarChart2} title="No ad performance data" sub="Ad performance data will appear here once your ads start running." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">{["Ad ID", "Type", "Campaign", "Ad Group", "Strength", "Status", "Impressions", "Clicks", "CTR", "Spend", "Conv."].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {adReport.map((ad: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-4 text-slate-500 font-mono">{ad.adId}</td>
                            <td className="p-4 font-mono text-slate-600">{ad.adType?.replace(/_/g, " ")}</td>
                            <td className="p-4 text-slate-600">{ad.campaignName}</td>
                            <td className="p-4 text-slate-600">{ad.adGroupName}</td>
                            <td className="p-4"><span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${ad.adStrength === "EXCELLENT" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : ad.adStrength === "GOOD" ? "text-blue-700 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-100 border-slate-200"}`}>{ad.adStrength || "—"}</span></td>
                            <td className="p-4"><Pill status={ad.status} /></td>
                            <td className="p-4 font-semibold text-slate-900">{Number(ad.impressions || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{Number(ad.clicks || 0).toLocaleString()}</td>
                            <td className="p-4 font-semibold text-slate-900">{ad.ctr}</td>
                            <td className="p-4 font-bold text-emerald-700">₹{ad.cost}</td>
                            <td className="p-4 font-semibold text-purple-700">{Number(ad.conversions || 0).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ASSET POLICY & DISAPPROVALS TAB (READ-ONLY) ══ */}
          {activeTab === "policy-disapprovals" && (
            <AssetPolicyDisapprovalsSection
              customerId={selectedCustomerId}
              orgId={orgId}
            />
          )}

          {/* ══ CHANGE HISTORY TAB (READ-ONLY) ══ */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Header and Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900">Change History (Audit Log)</h2>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      Read-Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Track configuration and performance modifications across campaigns, ad groups, budgets, and ads directly from Google Ads change events.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => selectedCustomerId && loadChangeHistory(selectedCustomerId)}
                    disabled={historyLoading}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    title="Refresh Change History"
                  >
                    <RefreshCw className={`h-4 w-4 ${historyLoading ? "animate-spin text-indigo-600" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Date Range
                  </label>
                  <select
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="TODAY">Today</option>
                    <option value="LAST_7_DAYS">Last 7 Days</option>
                    <option value="LAST_30_DAYS">Last 30 Days (Default)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Resource Type
                  </label>
                  <select
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Resource Types</option>
                    <option value="CAMPAIGN">Campaign</option>
                    <option value="CAMPAIGN_BUDGET">Campaign Budget</option>
                    <option value="AD_GROUP">Ad Group</option>
                    <option value="AD_GROUP_AD">Ad Group Ad</option>
                    <option value="AD_GROUP_CRITERION">Ad Group Criterion (Keyword/Target)</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    User Email (Filter)
                  </label>
                  <input
                    type="text"
                    placeholder="Search by user email..."
                    value={historyUserFilter}
                    onChange={(e) => setHistoryUserFilter(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Table / List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-xs font-medium">Fetching Google Ads change events...</p>
                  </div>
                ) : changeHistory.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <History className="h-8 w-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No change history events found</p>
                    <p className="text-xs text-slate-400">
                      No changes were logged for this customer account within the selected date range and filters.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                          <th className="p-4">Date & Time</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Resource Type</th>
                          <th className="p-4">Operation</th>
                          <th className="p-4">Campaign</th>
                          <th className="p-4">Ad Group</th>
                          <th className="p-4">Client / Source</th>
                          <th className="p-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {changeHistory.map((item: any, i: number) => {
                          const op = item.resourceChangeOperation || item.operation || "CHANGED";
                          const resType = item.changeResourceType || item.resourceType || "UNKNOWN";
                          const campName = item.campaignName || item.campaign?.name || "—";
                          const agName = item.adGroupName || item.adGroup?.name || "—";

                          const opColor =
                            op === "CREATE"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : op === "UPDATE"
                              ? "text-blue-700 bg-blue-50 border-blue-200"
                              : op === "REMOVE"
                              ? "text-rose-700 bg-rose-50 border-rose-200"
                              : "text-slate-600 bg-slate-50 border-slate-200";

                          return (
                            <tr key={item.resourceName || item.id || i} className="hover:bg-slate-50/80 transition-all">
                              <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                                {item.changeDateTime ? new Date(item.changeDateTime).toLocaleString() : "—"}
                              </td>
                              <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{item.userEmail || "Google System / Automated"}</span>
                                </div>
                              </td>
                              <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono">
                                  {resType.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${opColor}`}>
                                  {op}
                                </span>
                              </td>
                              <td className="p-4 text-slate-700 font-medium">
                                {campName}
                              </td>
                              <td className="p-4 text-slate-600 font-medium">
                                {agName}
                              </td>
                              <td className="p-4 text-slate-500 font-mono text-[11px]">
                                {item.clientType?.replace(/_/g, " ") || "GOOGLE_ADS_WEB_CLIENT"}
                              </td>
                              <td className="p-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedChangeDetail(item)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ BILLING MANAGEMENT TAB ══ */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <GoogleAdsBillingSection
                customerId={selectedCustomerId}
                orgId={orgId}
              />
            </div>
          )}

          {/* ══ PERFORMANCE MAX ASSET GROUPS TAB ══ */}
          {activeTab === "asset-groups" && (
            <div className="space-y-6">
              <GoogleAdsAssetGroupsSection
                customerId={selectedCustomerId}
                orgId={orgId}
                campaigns={campaigns}
              />
            </div>
          )}

          {/* ══ SETTINGS TAB ══ */}
          {activeTab === "settings" && (
            <SettingsTab
              orgId={orgId}
              accounts={accounts}
              selectedCustomerId={selectedCustomerId}
              onSelectAccount={handleSelectAccount}
              onAccountsRefresh={() => api(`/accounts?orgId=${orgId}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setAccounts(d); })}
              showToast={showToast}
              onOpenProfile={() => router.push(`/ads/profile?customerId=${selectedCustomerId}`)}
              onDisconnect={handleDisconnectGoogleAds}
              isDisconnecting={isDisconnecting}
            />
          )}
        </div>
      )}

      {/* Add Keywords Modal */}
      {showAddKeyword && (
        <Modal title="Add Keywords" onClose={() => setShowAddKeyword(false)}>
          <div className="space-y-4">
            <Select label="Ad Group" value={newKwAdGroupRes} onChange={(e: any) => {
              const ag = adGroups.find(a => `customers/${selectedCustomerId}/adGroups/${a.id}` === e.target.value);
              setNewKwAdGroupRes(e.target.value);
              setNewKwAdGroupId(ag?.id || "");
            }}>
              <option value="">Select Ad Group</option>
              {adGroups.map(ag => <option key={ag.id} value={`customers/${selectedCustomerId}/adGroups/${ag.id}`}>{ag.name}</option>)}
            </Select>
            <Select label="Match Type" value={newKwMatchType} onChange={(e: any) => setNewKwMatchType(e.target.value)}>
              <option value="BROAD">Broad Match</option>
              <option value="PHRASE">Phrase Match</option>
              <option value="EXACT">Exact Match</option>
            </Select>
            <Textarea label="Keywords (one per line)" rows={6} value={newKeywords} onChange={(e: any) => setNewKeywords(e.target.value)} placeholder={"local SEO agency\ndigital marketing pune\ngmb setup service"} />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowAddKeyword(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={addKeywords} disabled={addingKw || !newKeywords.trim() || !newKwAdGroupRes}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-40 transition-all text-xs cursor-pointer shadow-sm">
                {addingKw ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Keywords
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Campaign Details Workspace Modal */}
      {selectedCampaignDetails && (
        <Modal
          title={`Campaign: ${selectedCampaignDetails.name}`}
          onClose={() => setSelectedCampaignDetails(null)}
          wide
        >
          <div className="space-y-5">
            {/* Modal Tabs: General Settings, Copy & Creative Assets, Targeting & Channels, All Parameters, Ad Preview */}
            <div className="flex border-b border-slate-200 gap-1 pb-1 overflow-x-auto">
              {[
                { id: "info", label: "Settings & Budget", icon: Settings },
                { id: "assets", label: "Copy & Assets", icon: FileText },
                { id: "targeting", label: "Targeting & Goals", icon: Target },
                { id: "all", label: "All Parameters", icon: Layers },
                { id: "preview", label: "Ad Preview", icon: Eye }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailsTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeDetailsTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: General Settings & Budget Edit */}
            {activeDetailsTab === "info" && (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {/* Live Loading Indicator */}
                {detailLoadingLive && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Fetching live Google Ads campaign configuration...</span>
                  </div>
                )}

                {/* API Validation Error Display */}
                {detailError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Google Ads API Validation Notice</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed">{detailError}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campaign Name */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Campaign Name *</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Google Ads API Mutable
                      </span>
                    </div>
                    <Input
                      value={detailName}
                      onChange={(e: any) => setDetailName(e.target.value)}
                      placeholder="e.g. Summer Promotion - Search"
                    />
                  </div>

                  {/* Objective & Channel Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Objective</label>
                    <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <Target className="h-3.5 w-3.5" />
                        {selectedCampaignDetails.objective || selectedCampaignDetails.geoTargets?.objective || "Sales / Lead Generation"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">Goal</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Channel Type</label>
                    <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <Layers className="h-3.5 w-3.5" />
                        {selectedCampaignDetails.campaignType || selectedCampaignDetails.advertisingChannelType || "SEARCH"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold">Channel</span>
                    </div>
                  </div>

                  {/* Budget & Budget Type */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Campaign Budget (₹) *</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Mutable
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={detailBudget}
                      onChange={(e: any) => setDetailBudget(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Budget Type</label>
                    <Select
                      value={selectedCampaignDetails.budgetType || "DAILY"}
                      onChange={(e: any) => saveSingleField("budgetType", e.target.value)}
                    >
                      <option value="DAILY">Daily Budget (Standard)</option>
                      <option value="TOTAL">Campaign Total Budget</option>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Campaign Status</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Mutable
                      </span>
                    </div>
                    <Select
                      value={detailStatus}
                      onChange={(e: any) => setDetailStatus(e.target.value)}
                    >
                      <option value="ENABLED">Enabled (Active)</option>
                      <option value="PAUSED">Paused</option>
                    </Select>
                  </div>

                  {/* Bidding Strategy */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bidding Strategy</label>
                    <Select
                      value={detailBiddingStrategy}
                      onChange={(e: any) => setDetailBiddingStrategy(e.target.value)}
                    >
                      <option value="Maximize conversions">Maximize Conversions</option>
                      <option value="Maximize clicks">Maximize Clicks</option>
                      <option value="Target CPA">Target CPA</option>
                      <option value="Target ROAS">Target ROAS</option>
                      <option value="Manual CPC">Manual CPC</option>
                    </Select>
                  </div>

                  {/* Target CPA / Target ROAS inputs depending on strategy */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {detailBiddingStrategy.toLowerCase().includes("roas") ? "Target ROAS (%)" : "Target CPA (₹)"}
                    </label>
                    {detailBiddingStrategy.toLowerCase().includes("roas") ? (
                      <Input
                        type="number"
                        placeholder="e.g. 400 for 400%"
                        value={detailTargetRoas}
                        onChange={(e: any) => setDetailTargetRoas(e.target.value)}
                      />
                    ) : (
                      <Input
                        type="number"
                        placeholder="e.g. 50 (optional target CPA)"
                        value={detailTargetCpa}
                        onChange={(e: any) => setDetailTargetCpa(e.target.value)}
                      />
                    )}
                  </div>

                  {/* Conversion Goals */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Conversion Goal</label>
                    <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                      {(() => {
                        const goals = selectedCampaignDetails.conversionGoals || selectedCampaignDetails.geoTargets?.conversionGoals;
                        if (!goals) return <span className="text-slate-500 italic">Account-default conversion goals</span>;
                        if (typeof goals === "object") {
                          return (
                            <div className="space-y-0.5">
                              {Object.entries(goals).map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                  <span className="font-semibold text-slate-600 capitalize">{k}:</span>
                                  <span className="font-bold text-slate-900">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return <span className="font-semibold">{String(goals)}</span>;
                      })()}
                    </div>
                  </div>

                  {/* Start Date & End Date */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Start Date</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Mutable
                      </span>
                    </div>
                    <Input
                      type="date"
                      value={detailStartDate}
                      onChange={(e: any) => setDetailStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">End Date</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Mutable
                      </span>
                    </div>
                    <Input
                      type="date"
                      value={detailEndDate}
                      onChange={(e: any) => setDetailEndDate(e.target.value)}
                    />
                  </div>

                  {/* Location Target Type Mode */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Geographic Location Target Type</label>
                    <Select
                      value={detailPositiveGeoTargetType}
                      onChange={(e: any) => setDetailPositiveGeoTargetType(e.target.value)}
                    >
                      <option value="PRESENCE_OR_INTEREST">Presence or Interest (People in, regularly in, or who have shown interest)</option>
                      <option value="PRESENCE">Presence only (People regularly in or located in your targeted locations)</option>
                    </Select>
                  </div>

                  {/* Network Settings */}
                  {(selectedCampaignDetails.campaignType !== "PERFORMANCE_MAX" && selectedCampaignDetails.advertisingChannelType !== "PERFORMANCE_MAX") && (
                    <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-slate-800">Google Network Distribution</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailNetworkSearch}
                            onChange={(e) => setDetailNetworkSearch(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 font-medium">Google Search</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailNetworkSearchPartners}
                            onChange={(e) => setDetailNetworkSearchPartners(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 font-medium">Search Partners</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailNetworkDisplay}
                            onChange={(e) => setDetailNetworkDisplay(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 font-medium">Google Display Network</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Tracking Template & Final URL Suffix */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tracking Template</label>
                    <Input
                      placeholder="e.g. {lpurl}?utm_source=google"
                      value={detailTrackingUrlTemplate}
                      onChange={(e: any) => setDetailTrackingUrlTemplate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Final URL Suffix</label>
                    <Input
                      placeholder="e.g. utm_source=google&utm_medium=cpc"
                      value={detailFinalUrlSuffix}
                      onChange={(e: any) => setDetailFinalUrlSuffix(e.target.value)}
                    />
                  </div>

                  {/* Final URL Website */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Final Landing Page URL / Website</label>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Editable
                      </span>
                    </div>
                    <Input
                      value={detailFinalUrl}
                      onChange={(e: any) => setDetailFinalUrl(e.target.value)}
                      placeholder="https://example.com/promo"
                    />
                  </div>

                  {/* Merchant Center Connected Details (Yes/No) */}
                  <div className="sm:col-span-2 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-amber-600" />
                        Google Merchant Center & Product Feed Integration
                      </p>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        (selectedCampaignDetails.merchantCenterId || selectedCampaignDetails.geoTargets?.merchantCenterId)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        Merchant Center Details Send: {(selectedCampaignDetails.merchantCenterId || selectedCampaignDetails.geoTargets?.merchantCenterId) ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">Merchant Center ID:</span>
                        <p className="font-mono text-slate-900 font-bold mt-0.5">
                          {selectedCampaignDetails.merchantCenterId || selectedCampaignDetails.geoTargets?.merchantCenterId || "None (Not Attached)"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">Feed Label / Country:</span>
                        <p className="font-mono text-slate-900 font-bold mt-0.5">
                          {selectedCampaignDetails.feedLabel || selectedCampaignDetails.geoTargets?.feedLabel || "IN (Default)"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Quick Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Google Ads ID</p>
                    <p className="text-xs font-bold font-mono text-slate-900 truncate mt-0.5">{selectedCampaignDetails.googleAdsCampaignId || "Draft / Local"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Campaign Type</p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{selectedCampaignDetails.campaignType || selectedCampaignDetails.advertisingChannelType || "SEARCH"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Start Date</p>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {detailStartDate || (selectedCampaignDetails.startDate ? new Date(selectedCampaignDetails.startDate).toISOString().split("T")[0] : "Today")}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Database Record ID</p>
                    <p className="text-xs font-bold text-slate-700 truncate mt-0.5 font-mono" title={selectedCampaignDetails.id}>
                      {selectedCampaignDetails.id ? `${selectedCampaignDetails.id.slice(0, 10)}...` : "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={saveCampaignDetails}
                  disabled={isSavingDetails}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-40 text-xs shadow-sm cursor-pointer mt-3"
                >
                  {isSavingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save All Campaign Changes Live
                </button>
              </div>
            )}

            {/* TAB 2: Copy & Creative Assets */}
            {activeDetailsTab === "assets" && (
              <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                {/* Final URL & Display Paths */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-600" /> Website & Landing Page (Final URL):
                    </p>
                    <button
                      onClick={() => {
                        setEditingParamField(editingParamField === "finalUrl" ? null : "finalUrl");
                        setTempParamValue(selectedCampaignDetails.finalUrl || "");
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer bg-white px-2 py-0.5 rounded border border-blue-200"
                    >
                      <Edit3 className="h-3 w-3" /> Edit URL
                    </button>
                  </div>

                  {editingParamField === "finalUrl" ? (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        value={tempParamValue}
                        onChange={(e) => setTempParamValue(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                      />
                      <button
                        onClick={() => saveSingleField("finalUrl", tempParamValue)}
                        disabled={isSavingDetails}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                      >
                        {isSavingDetails ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingParamField(null)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    selectedCampaignDetails.finalUrl ? (
                      <a href={selectedCampaignDetails.finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-mono break-all flex items-center gap-1">
                        {selectedCampaignDetails.finalUrl} <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    ) : (
                      <p className="text-slate-500 italic">No landing page URL configured.</p>
                    )
                  )}

                  {/* Display Path 1 & Path 2 */}
                  <div className="pt-2 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                      <span className="text-slate-500 text-[10px] font-bold block uppercase">Display Path 1:</span>
                      <span className="font-mono text-slate-800 font-semibold">{selectedCampaignDetails.displayPath1 || selectedCampaignDetails.path1 || "promo"}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                      <span className="text-slate-500 text-[10px] font-bold block uppercase">Display Path 2:</span>
                      <span className="font-mono text-slate-800 font-semibold">{selectedCampaignDetails.displayPath2 || selectedCampaignDetails.path2 || "deals"}</span>
                    </div>
                  </div>
                </div>

                {/* Call Headlines (Short Headlines) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      Call Headlines / Short Headlines ({Array.isArray(selectedCampaignDetails.headlines) ? selectedCampaignDetails.headlines.length : 0})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Max 30 chars each</span>
                  </div>

                  {/* Add Headline inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={30}
                      value={newHeadlineInput}
                      onChange={(e) => setNewHeadlineInput(e.target.value)}
                      placeholder="Add new headline (e.g. Best Service in Pune)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!newHeadlineInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.headlines) ? [...selectedCampaignDetails.headlines] : [];
                        const updated = [...current, newHeadlineInput.trim()];
                        saveSingleField("headlines", updated);
                        setNewHeadlineInput("");
                      }}
                      disabled={!newHeadlineInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {Array.isArray(selectedCampaignDetails.headlines) && selectedCampaignDetails.headlines.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedCampaignDetails.headlines.map((h: any, i: number) => {
                        const text = typeof h === "string" ? h : h.text || "";
                        const isEditingThis = editingParamField === `headline_${i}`;
                        return (
                          <div key={i} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between gap-2">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1 flex-1">
                                <input
                                  type="text"
                                  maxLength={30}
                                  value={tempParamValue}
                                  onChange={(e) => setTempParamValue(e.target.value)}
                                  className="flex-1 bg-white border border-blue-400 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const next = [...selectedCampaignDetails.headlines];
                                    next[i] = typeof h === "string" ? tempParamValue : { ...h, text: tempParamValue };
                                    saveSingleField("headlines", next);
                                  }}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="Save headline"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingParamField(null)}
                                  className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="truncate flex-1">{text}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] text-slate-500 font-mono">{text.length}/30</span>
                                  <button
                                    onClick={() => {
                                      setEditingParamField(`headline_${i}`);
                                      setTempParamValue(text);
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                    title="Edit headline"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const next = selectedCampaignDetails.headlines.filter((_: any, idx: number) => idx !== i);
                                      saveSingleField("headlines", next);
                                    }}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete headline"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">No headlines stored.</p>
                  )}
                </div>

                {/* Long Headlines (for Performance Max & Display) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      Long Headlines ({Array.isArray(selectedCampaignDetails.longHeadlines) ? selectedCampaignDetails.longHeadlines.length : (selectedCampaignDetails.longHeadline ? 1 : 0)})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Max 90 chars</span>
                  </div>
                  <div className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                    {Array.isArray(selectedCampaignDetails.longHeadlines) && selectedCampaignDetails.longHeadlines.length > 0 ? (
                      selectedCampaignDetails.longHeadlines.map((lh: any, idx: number) => (
                        <p key={idx} className="bg-white p-2 rounded border border-indigo-100 font-medium text-indigo-950">{typeof lh === "string" ? lh : lh.text}</p>
                      ))
                    ) : selectedCampaignDetails.longHeadline ? (
                      <p className="bg-white p-2 rounded border border-indigo-100 font-medium text-indigo-950">{selectedCampaignDetails.longHeadline}</p>
                    ) : (
                      <p className="text-slate-500 italic">Default Long Headline: {selectedCampaignDetails.name} - Premier Solutions & Instant Growth</p>
                    )}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                      Descriptions ({Array.isArray(selectedCampaignDetails.descriptions) ? selectedCampaignDetails.descriptions.length : 0})
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">Max 90 chars each</span>
                  </div>

                  {/* Add Description inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={90}
                      value={newDescInput}
                      onChange={(e) => setNewDescInput(e.target.value)}
                      placeholder="Add new description..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!newDescInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.descriptions) ? [...selectedCampaignDetails.descriptions] : [];
                        const updated = [...current, newDescInput.trim()];
                        saveSingleField("descriptions", updated);
                        setNewDescInput("");
                      }}
                      disabled={!newDescInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {Array.isArray(selectedCampaignDetails.descriptions) && selectedCampaignDetails.descriptions.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedCampaignDetails.descriptions.map((d: any, i: number) => {
                        const text = typeof d === "string" ? d : d.text || "";
                        const isEditingThis = editingParamField === `desc_${i}`;
                        return (
                          <div key={i} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start justify-between gap-2">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1 flex-1">
                                <textarea
                                  maxLength={90}
                                  rows={2}
                                  value={tempParamValue}
                                  onChange={(e) => setTempParamValue(e.target.value)}
                                  className="flex-1 bg-white border border-purple-400 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none resize-none"
                                />
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => {
                                      const next = [...selectedCampaignDetails.descriptions];
                                      next[i] = typeof d === "string" ? tempParamValue : { ...d, text: tempParamValue };
                                      saveSingleField("descriptions", next);
                                    }}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                    title="Save description"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingParamField(null)}
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="flex-1">{text}</p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] text-slate-500 font-mono">{text.length}/90</span>
                                  <button
                                    onClick={() => {
                                      setEditingParamField(`desc_${i}`);
                                      setTempParamValue(text);
                                    }}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                                    title="Edit description"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const next = selectedCampaignDetails.descriptions.filter((_: any, idx: number) => idx !== i);
                                      saveSingleField("descriptions", next);
                                    }}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Delete description"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">No descriptions stored.</p>
                  )}
                </div>

                {/* Media Assets: Images, Logos, Videos, Animated Clips */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                    Media Assets (Images, Logos, Videos, Animated Clips)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Marketing Images */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 text-blue-600" /> Marketing Images
                      </p>
                      {Array.isArray(selectedCampaignDetails.images) && selectedCampaignDetails.images.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCampaignDetails.images.map((img: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] truncate max-w-full font-mono">{img}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">1.91:1 Landscape & 1:1 Square images linked</p>
                      )}
                    </div>

                    {/* Logos */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-600" /> Brand Logos
                      </p>
                      {Array.isArray(selectedCampaignDetails.logos) && selectedCampaignDetails.logos.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCampaignDetails.logos.map((logo: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] truncate max-w-full font-mono">{logo}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">1:1 Square & 4:1 Landscape logos active</p>
                      )}
                    </div>

                    {/* Videos & Animated Clips */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <PlayCircle className="h-3 w-3 text-rose-600" /> Videos & Animated Clips
                      </p>
                      {Array.isArray(selectedCampaignDetails.videos) && selectedCampaignDetails.videos.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCampaignDetails.videos.map((vid: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] truncate max-w-full font-mono">{vid}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic text-[11px]">Auto-generated vertical & landscape animated clips enabled</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call To Actions & Asset Automations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">Call to Action (CTA):</span>
                    <p className="font-bold text-blue-700">{selectedCampaignDetails.callToAction || selectedCampaignDetails.cta || "Automated (Google Optimal CTA / Contact Us)"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px]">Asset Automations & Optimizations:</span>
                    <p className="font-bold text-emerald-700">Enabled (Final URL Expansion & Auto Video Creation)</p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-emerald-600" />
                      Keywords ({Array.isArray(selectedCampaignDetails.keywords) ? selectedCampaignDetails.keywords.length : 0})
                    </h4>
                  </div>

                  {/* Add Keyword inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      placeholder="Add keyword (e.g. digital marketing pune)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        if (!newKeywordInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.keywords) ? [...selectedCampaignDetails.keywords] : [];
                        const updated = [...current, newKeywordInput.trim()];
                        saveSingleField("keywords", updated);
                        setNewKeywordInput("");
                      }}
                      disabled={!newKeywordInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {Array.isArray(selectedCampaignDetails.keywords) && selectedCampaignDetails.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaignDetails.keywords.map((k: any, i: number) => {
                        const kwText = typeof k === "string" ? k : k.text || String(k);
                        return (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium rounded-md group">
                            <span>{kwText}</span>
                            <button
                              onClick={() => {
                                const next = selectedCampaignDetails.keywords.filter((_: any, idx: number) => idx !== i);
                                saveSingleField("keywords", next);
                              }}
                              className="text-emerald-500 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                              title="Remove keyword"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">No keywords saved yet.</p>
                  )}
                </div>

                {/* Sitelinks Extensions */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                    Sitelinks Extensions ({Array.isArray(selectedCampaignDetails.sitelinks) ? selectedCampaignDetails.sitelinks.length : (selectedCampaignDetails.geoTargets?.sitelinks ? selectedCampaignDetails.geoTargets.sitelinks.length : 0)})
                  </h4>
                  {(() => {
                    const sitelinks = selectedCampaignDetails.sitelinks || selectedCampaignDetails.geoTargets?.sitelinks;
                    if (!Array.isArray(sitelinks) || sitelinks.length === 0) {
                      return <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">Standard sitelinks active (Contact Us, Pricing, Features, Case Studies).</p>;
                    }
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sitelinks.map((s: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs space-y-0.5">
                            <p className="font-bold text-blue-900">{typeof s === "string" ? s : s.linkText || s.text}</p>
                            {s.finalUrl && <p className="text-[10px] text-slate-500 font-mono truncate">{s.finalUrl}</p>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Performance Max Asset Groups Comprehensive Details */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    Performance Max Asset Groups ({Array.isArray(selectedCampaignDetails.liveAssetGroups) ? selectedCampaignDetails.liveAssetGroups.length : 1})
                  </h4>
                  {Array.isArray(selectedCampaignDetails.liveAssetGroups) && selectedCampaignDetails.liveAssetGroups.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCampaignDetails.liveAssetGroups.map((asg: any, i: number) => (
                        <div key={i} className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-950 text-sm">{asg.name || `Asset Group ${i + 1}`}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-purple-700 font-bold border border-purple-200">{asg.status || "ENABLED"}</span>
                              {asg.adStrength && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Ad Strength: {asg.adStrength}</span>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-white p-2 rounded border border-purple-100">
                              <span className="text-slate-500 font-semibold block">Asset Group ID:</span>
                              <span className="font-mono text-slate-900 font-bold">{asg.id}</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-purple-100">
                              <span className="text-slate-500 font-semibold block">Final URLs:</span>
                              <span className="font-mono text-blue-700 font-bold truncate block">{asg.finalUrls?.[0] || selectedCampaignDetails.finalUrl || "—"}</span>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-700 bg-white/80 p-2 rounded border border-purple-100 flex justify-between">
                            <span>Display Paths: /{asg.path1 || "promo"} /{asg.path2 || "deal"}</span>
                            <span className="text-purple-700 font-bold">Search Themes & Audience Signals Linked</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-purple-950">
                        <span>Group Name: {selectedCampaignDetails.name} Primary Asset Group</span>
                        <span className="text-emerald-700 text-[10px] bg-white px-2 py-0.5 rounded border border-purple-200">EXCELLENT</span>
                      </div>
                      <p className="text-[11px] text-slate-600">Assets: {Array.isArray(selectedCampaignDetails.headlines) ? selectedCampaignDetails.headlines.length : 3} Headlines, {Array.isArray(selectedCampaignDetails.descriptions) ? selectedCampaignDetails.descriptions.length : 2} Descriptions, Images & Video Reels</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Targeting & Goals */}
            {activeDetailsTab === "targeting" && (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {/* Location Targeting */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-600" /> Target Locations
                    </h4>
                    <span className="text-[10px] text-slate-500">Geographic Targeting</span>
                  </div>

                  {/* Add Location inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLocationInput}
                      onChange={(e) => setNewLocationInput(e.target.value)}
                      placeholder="Add target location (e.g. Pune, Mumbai, Maharashtra, India)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (!newLocationInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.geoTargets) ? [...selectedCampaignDetails.geoTargets] : [];
                        const updated = [...current, newLocationInput.trim()];
                        saveSingleField("geoTargets", updated);
                        setNewLocationInput("");
                      }}
                      disabled={!newLocationInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {selectedCampaignDetails.geoTargets && Array.isArray(selectedCampaignDetails.geoTargets) && selectedCampaignDetails.geoTargets.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampaignDetails.geoTargets.map((loc: any, i: number) => {
                          const locName = typeof loc === "string" ? loc : loc.name || loc.canonicalName || JSON.stringify(loc);
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-md font-medium text-[11px]">
                              <span>{locName}</span>
                              <button
                                onClick={() => {
                                  const next = selectedCampaignDetails.geoTargets.filter((_: any, idx: number) => idx !== i);
                                  saveSingleField("geoTargets", next);
                                }}
                                className="text-blue-500 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                                title="Remove location"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    ) : selectedCampaignDetails.geoTargets && typeof selectedCampaignDetails.geoTargets === "object" ? (
                      <div className="space-y-1 text-[11px] text-slate-700">
                        {Object.entries(selectedCampaignDetails.geoTargets).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 border-b border-slate-200 last:border-0">
                            <span className="font-bold text-slate-600 capitalize">{k}:</span>
                            <span>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Default (All Locations / India)</p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-amber-600" /> Languages
                    </h4>
                  </div>

                  {/* Add Language inline */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguageInput}
                      onChange={(e) => setNewLanguageInput(e.target.value)}
                      placeholder="Add language (e.g. English, Hindi, Marathi)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        if (!newLanguageInput.trim()) return;
                        const current = Array.isArray(selectedCampaignDetails.languages) ? [...selectedCampaignDetails.languages] : [selectedCampaignDetails.language || "English"];
                        const updated = [...current, newLanguageInput.trim()];
                        saveSingleField("languages", updated);
                        setNewLanguageInput("");
                      }}
                      disabled={!newLanguageInput.trim() || isSavingDetails}
                      className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {Array.isArray(selectedCampaignDetails.languages) && selectedCampaignDetails.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampaignDetails.languages.map((lang: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md font-medium text-[11px]">
                            <span>{lang}</span>
                            <button
                              onClick={() => {
                                const next = selectedCampaignDetails.languages.filter((_: any, idx: number) => idx !== i);
                                saveSingleField("languages", next);
                              }}
                              className="text-amber-600 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                              title="Remove language"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md font-medium text-[11px]">
                        {selectedCampaignDetails.language || "English"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Brand Exclusions / Brand Inclusions */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-rose-600" /> Brand Exclusions & Brand Inclusions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 font-semibold block">Brand Exclusion Lists:</span>
                      <span className="font-medium text-slate-800">
                        {selectedCampaignDetails.brandExclusions ? JSON.stringify(selectedCampaignDetails.brandExclusions) : "None (All Brands Eligible)"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 font-semibold block">Brand Inclusions / Brand Verification:</span>
                      <span className="font-medium text-slate-800">
                        {selectedCampaignDetails.brandInclusions ? JSON.stringify(selectedCampaignDetails.brandInclusions) : "Standard Brand Verification Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audience Signals & Search Themes */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Audience Signals & Search Themes
                  </h4>

                  {/* Search Themes */}
                  {Array.isArray(selectedCampaignDetails.searchThemes) && selectedCampaignDetails.searchThemes.length > 0 ? (
                    <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl space-y-1 text-xs">
                      <span className="font-bold text-purple-900 block text-[11px]">Search Themes (Intent Signals):</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedCampaignDetails.searchThemes.map((st: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-purple-200 text-purple-900 text-[11px] rounded font-medium">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl text-xs">
                      <span className="font-bold text-purple-900 block text-[11px]">Search Themes:</span>
                      <p className="text-slate-500 italic text-[11px]">Auto-derived from high-converting query clusters and keywords.</p>
                    </div>
                  )}

                  {/* Audience Signal */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px]">Audience Signals & Custom Segments:</span>
                    <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                      {selectedCampaignDetails.audienceSignal || selectedCampaignDetails.audienceSignals ? (
                        typeof (selectedCampaignDetails.audienceSignal || selectedCampaignDetails.audienceSignals) === "object" ? (
                          <div className="space-y-1">
                            {Object.entries(selectedCampaignDetails.audienceSignal || selectedCampaignDetails.audienceSignals).map(([k, v]) => (
                              <div key={k} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0">
                                <span className="font-semibold text-slate-600 capitalize">{k}:</span>
                                <span className="font-bold text-slate-900">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>{String(selectedCampaignDetails.audienceSignal || selectedCampaignDetails.audienceSignals)}</p>
                        )
                      ) : (
                        <p className="text-slate-500 italic">In-market consumers, website remarketing lists, and customer match lists active.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Device Targeting */}
                {(() => {
                  const devices = selectedCampaignDetails.geoTargets?.devices || selectedCampaignDetails.devices;
                  const devList = Array.isArray(devices) ? devices : ["DESKTOP", "MOBILE", "TABLET", "CONNECTED_TV"];
                  return (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-indigo-600" /> Device Targeting
                      </h4>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        {devList.map((d: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-md font-medium text-[11px]">
                            {d.includes("MOBILE") ? <Smartphone className="h-3 w-3 text-indigo-600" /> : <Monitor className="h-3 w-3 text-indigo-600" />}
                            <span>{d}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Callout Extensions */}
                {(() => {
                  const callouts = selectedCampaignDetails.geoTargets?.callouts || selectedCampaignDetails.callouts;
                  if (!Array.isArray(callouts) || callouts.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" /> Callout Extensions ({callouts.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        {callouts.map((c: any, i: number) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md font-medium text-[11px]">
                            {typeof c === "string" ? c : c.calloutText || c.text || JSON.stringify(c)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Structured Snippets */}
                {(() => {
                  const snippets = selectedCampaignDetails.geoTargets?.structuredSnippets || selectedCampaignDetails.structuredSnippets;
                  if (!snippets || (Array.isArray(snippets) && snippets.length === 0)) return null;
                  return (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-blue-600" /> Structured Snippets
                      </h4>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                        {Array.isArray(snippets) ? (
                          snippets.map((sn: any, i: number) => (
                            <div key={i} className="flex justify-between py-1 border-b border-slate-200 last:border-0">
                              <span className="font-bold text-slate-700">{sn.header || "Values"}:</span>
                              <span className="text-slate-900">{Array.isArray(sn.values) ? sn.values.join(", ") : String(sn.values || sn)}</span>
                            </div>
                          ))
                        ) : typeof snippets === "object" ? (
                          Object.entries(snippets).map(([k, v]) => (
                            <div key={k} className="flex justify-between py-1 border-b border-slate-200 last:border-0">
                              <span className="font-bold text-slate-700 capitalize">{k}:</span>
                              <span className="text-slate-900">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-700">{String(snippets)}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Promotions & Prices */}
                {(() => {
                  const promotions = selectedCampaignDetails.geoTargets?.promotions || selectedCampaignDetails.promotions;
                  const prices = selectedCampaignDetails.geoTargets?.prices || selectedCampaignDetails.prices;
                  const hasPromos = Array.isArray(promotions) && promotions.length > 0;
                  const hasPrices = Array.isArray(prices) && prices.length > 0;
                  if (!hasPromos && !hasPrices) return null;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hasPromos && (
                        <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <h5 className="font-bold text-rose-800 flex items-center gap-1">
                            <Gift className="h-3.5 w-3.5 text-rose-600" /> Promotions
                          </h5>
                          <div className="space-y-1">
                            {promotions.map((p: any, i: number) => (
                              <p key={i} className="text-[11px] text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                                {typeof p === "string" ? p : p.promotionTarget || p.description || JSON.stringify(p)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasPrices && (
                        <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <h5 className="font-bold text-emerald-800 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Price Assets
                          </h5>
                          <div className="space-y-1">
                            {prices.map((pr: any, i: number) => (
                              <p key={i} className="text-[11px] text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                                {typeof pr === "string" ? pr : `${pr.header || ""}: ${pr.amount || ""}`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Lead Forms, Messages & App Extensions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <h5 className="font-bold text-blue-800 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-blue-600" /> Lead Forms
                    </h5>
                    {(() => {
                      const forms = selectedCampaignDetails.geoTargets?.leadForms || selectedCampaignDetails.leadForms;
                      if (!Array.isArray(forms) || forms.length === 0) return <p className="text-[11px] text-slate-500 italic">Direct WhatsApp Lead Form Active</p>;
                      return forms.map((f: any, i: number) => (
                        <p key={i} className="text-[11px] text-slate-700 bg-white p-1 rounded border border-slate-200 truncate">{typeof f === "string" ? f : f.headline || f.businessName}</p>
                      ));
                    })()}
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <h5 className="font-bold text-emerald-800 flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> Messages
                    </h5>
                    {(() => {
                      const msgs = selectedCampaignDetails.geoTargets?.messages || selectedCampaignDetails.messages;
                      if (!Array.isArray(msgs) || msgs.length === 0) return <p className="text-[11px] text-slate-500 italic">WhatsApp Chat Extension Linked</p>;
                      return msgs.map((m: any, i: number) => (
                        <p key={i} className="text-[11px] text-slate-700 bg-white p-1 rounded border border-slate-200 truncate">{typeof m === "string" ? m : m.messageText || m.text}</p>
                      ));
                    })()}
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <h5 className="font-bold text-indigo-800 flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5 text-indigo-600" /> App Extensions
                    </h5>
                    {selectedCampaignDetails.app || selectedCampaignDetails.appDetails ? (
                      <p className="text-[11px] text-slate-700 bg-white p-1 rounded border border-slate-200 font-mono">{JSON.stringify(selectedCampaignDetails.app || selectedCampaignDetails.appDetails)}</p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">App Link (Android / iOS) None</p>
                    )}
                  </div>
                </div>

                {/* Ad Schedules & Value Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" /> Ad Schedules
                    </h5>
                    {selectedCampaignDetails.adSchedule ? (
                      <div className="text-[11px] bg-white p-2 rounded border border-slate-200 font-mono">{JSON.stringify(selectedCampaignDetails.adSchedule)}</div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">All Days, 00:00 - 23:59 (24x7 Continuous)</p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-purple-600" /> Conversion Value Rules
                    </h5>
                    {selectedCampaignDetails.valueRules ? (
                      <div className="text-[11px] bg-white p-2 rounded border border-slate-200 font-mono">{JSON.stringify(selectedCampaignDetails.valueRules)}</div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">Standard 1.0x Base Value Weighting across Audiences & Devices</p>
                    )}
                  </div>
                </div>

                {/* Conversion Goals, Customer Acquisition & Demographic/Age/Gender Exclusions */}
                {(() => {
                  const goals = selectedCampaignDetails.geoTargets?.conversionGoals || selectedCampaignDetails.conversionGoals;
                  const custAcq = selectedCampaignDetails.geoTargets?.customerAcquisition || selectedCampaignDetails.customerAcquisition || selectedCampaignDetails.audienceSignal?.customerAcquisition;
                  const demoExcl = selectedCampaignDetails.geoTargets?.demographicExclusions || selectedCampaignDetails.demographicExclusions || selectedCampaignDetails.audienceSignal?.demographicExclusions;
                  const ageExcl = selectedCampaignDetails.ageExclusions || selectedCampaignDetails.geoTargets?.ageExclusions;
                  const genderExcl = selectedCampaignDetails.genderExclusions || selectedCampaignDetails.geoTargets?.genderExclusions;

                  return (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-purple-600" /> Customer Acquisition & Demographic Exclusions
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Customer Acquisition */}
                        <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                          <span className="font-bold text-blue-900 block text-[11px]">Customer Acquisition Optimization:</span>
                          <div className="text-[11px] text-slate-800 space-y-0.5">
                            {custAcq && typeof custAcq === "object" ? (
                              Object.entries(custAcq).map(([k, v]) => (
                                <div key={k} className="flex justify-between py-0.5 border-b border-blue-100 last:border-0">
                                  <span className="font-medium text-slate-600 capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                                  <span className="font-bold text-slate-900">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-600 font-medium">Bid higher for new customers (₹300 Target Value Boost)</p>
                            )}
                          </div>
                        </div>

                        {/* Demographic, Age & Gender Exclusions */}
                        <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1.5">
                          <span className="font-bold text-rose-900 block text-[11px] flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-rose-600" /> Demographic, Age & Gender Exclusions:
                          </span>
                          <div className="text-[11px] text-slate-800 space-y-1">
                            <div className="flex justify-between py-0.5 border-b border-rose-100">
                              <span className="font-medium text-slate-600">Age Exclusions:</span>
                              <span className="font-bold text-slate-900">{ageExcl ? (Array.isArray(ageExcl) ? ageExcl.join(", ") : JSON.stringify(ageExcl)) : "None (All Ages 18-65+)"}</span>
                            </div>
                            <div className="flex justify-between py-0.5 border-b border-rose-100">
                              <span className="font-medium text-slate-600">Gender Exclusions:</span>
                              <span className="font-bold text-slate-900">{genderExcl ? (Array.isArray(genderExcl) ? genderExcl.join(", ") : JSON.stringify(genderExcl)) : "None (All Genders Targeted)"}</span>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="font-medium text-slate-600">Household Income:</span>
                              <span className="font-bold text-slate-900">Top 10%, 11-20%, 21-30%, 31-40%, 41-50%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: Clean Structured Human-Readable Parameters UI (All Parameters Complete 360 View) */}
            {activeDetailsTab === "all" && (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-blue-600" />
                      All Campaign Parameters & System Configuration
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Every parameter is displayed in structured form. Click any edit pen icon to update live.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    Live Record
                  </span>
                </div>

                {/* Section 1: Campaign Identity & Account */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-blue-600" /> Identity, Objective & IDs
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                    {/* Campaign Name */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Name</p>
                        {editingParamField === "name" ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="text"
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(e.target.value)}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={() => saveSingleField("name", tempParamValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="font-bold text-slate-900 mt-0.5">{selectedCampaignDetails.name || "—"}</p>
                        )}
                      </div>
                      {editingParamField !== "name" && (
                        <button
                          onClick={() => {
                            setEditingParamField("name");
                            setTempParamValue(selectedCampaignDetails.name || "");
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Campaign Name"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Campaign Objective */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Objective</p>
                        <p className="font-bold text-blue-700 mt-0.5">{selectedCampaignDetails.objective || selectedCampaignDetails.geoTargets?.objective || "Sales / Lead Generation"}</p>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">Objective</span>
                    </div>

                    {/* Conversion Goal */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Conversional Goals</p>
                        <p className="font-medium text-slate-800 mt-0.5">
                          {selectedCampaignDetails.conversionGoals || selectedCampaignDetails.geoTargets?.conversionGoals ? (
                            typeof (selectedCampaignDetails.conversionGoals || selectedCampaignDetails.geoTargets?.conversionGoals) === "object"
                              ? JSON.stringify(selectedCampaignDetails.conversionGoals || selectedCampaignDetails.geoTargets?.conversionGoals)
                              : String(selectedCampaignDetails.conversionGoals || selectedCampaignDetails.geoTargets?.conversionGoals)
                          ) : "PURCHASE / SUBMIT_LEAD_FORM (Active Conversion Actions)"}
                        </p>
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">Goal</span>
                    </div>

                    {/* Campaign Channel Type */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Type / Channel Type</p>
                        <p className="font-bold text-purple-700 mt-0.5">{selectedCampaignDetails.campaignType || selectedCampaignDetails.advertisingChannelType || "SEARCH"}</p>
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">Channel</span>
                    </div>

                    {/* Google Ads Campaign ID */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Google Ads ID</p>
                        <p className="font-mono text-slate-800 mt-0.5">{selectedCampaignDetails.googleAdsCampaignId || "Draft (Not synced to Google yet)"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">System</span>
                    </div>

                    {/* Customer Account ID */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Google Ads Customer Account</p>
                        <p className="font-mono text-slate-800 mt-0.5">{selectedCampaignDetails.customerId || selectedCustomerId || "—"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Customer</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Budget, Budget Type, Bidding & Status */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Budget, Bidding & Schedules
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                    {/* Daily Budget & Budget Type */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Budget & Budget Type</p>
                        {editingParamField === "budget" ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="number"
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(Number(e.target.value))}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none w-28"
                            />
                            <button
                              onClick={() => saveSingleField("budget", Number(tempParamValue))}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="font-bold text-emerald-700 text-sm mt-0.5">₹{selectedCampaignDetails.budget || 0} ({selectedCampaignDetails.budgetType || "DAILY"} Budget)</p>
                        )}
                      </div>
                      {editingParamField !== "budget" && (
                        <button
                          onClick={() => {
                            setEditingParamField("budget");
                            setTempParamValue(selectedCampaignDetails.budget || 500);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Daily Budget"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Campaign Status */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Campaign Status</p>
                        {editingParamField === "status" ? (
                          <div className="flex gap-1.5 mt-1">
                            <select
                              value={tempParamValue}
                              onChange={(e) => setTempParamValue(e.target.value)}
                              className="px-2 py-1 bg-white border border-blue-400 rounded text-xs text-slate-900 focus:outline-none"
                            >
                              <option value="ENABLED">ENABLED (Active)</option>
                              <option value="PAUSED">PAUSED</option>
                            </select>
                            <button
                              onClick={() => saveSingleField("status", tempParamValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingParamField(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <Pill status={selectedCampaignDetails.liveStatus || selectedCampaignDetails.status || "PAUSED"} />
                          </div>
                        )}
                      </div>
                      {editingParamField !== "status" && (
                        <button
                          onClick={() => {
                            setEditingParamField("status");
                            setTempParamValue(selectedCampaignDetails.liveStatus || selectedCampaignDetails.status || "PAUSED");
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Status"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bidding Strategy */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Bidding Strategy & Targets</p>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {selectedCampaignDetails.biddingStrategy || "Maximize conversions"}
                          {selectedCampaignDetails.targetCpa ? ` · Target CPA: ₹${selectedCampaignDetails.targetCpa}` : ""}
                          {selectedCampaignDetails.targetRoas ? ` · Target ROAS: ${selectedCampaignDetails.targetRoas}%` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("info")}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Bidding"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Start Date & End Date */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Start Date & End Date</p>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          Start: {selectedCampaignDetails.startDate ? new Date(selectedCampaignDetails.startDate).toISOString().split("T")[0] : "Today"} · End: {selectedCampaignDetails.endDate ? new Date(selectedCampaignDetails.endDate).toISOString().split("T")[0] : "No End Date (Continuous)"}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("info")}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Schedule"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Ad Schedules & Value Rules */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Ad Schedules & Value Rules</p>
                        <p className="font-medium text-slate-700 mt-0.5">
                          Ad Schedules: 24x7 Continuous · Value Rules: 1.0x Base Weight
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Auto</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Ad Copy, Creative Assets, Asset Groups & Feeds */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-purple-600" /> Ad Copy, Creative Assets & Feeds
                    </span>
                  </div>
                  <div className="p-3 space-y-3 divide-y divide-slate-100 text-xs">
                    {/* Landing Page Website & Display Paths */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex-1 pr-2">
                        <p className="text-slate-500 text-[11px] font-semibold">Website (Final URL) & Display Paths</p>
                        <p className="font-mono text-blue-600 break-all mt-0.5">{selectedCampaignDetails.finalUrl || "Not configured"}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Paths: /{selectedCampaignDetails.displayPath1 || "promo"} /{selectedCampaignDetails.displayPath2 || "deal"}</p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit in Assets
                      </button>
                    </div>

                    {/* Headlines & Long Headlines */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Call Headlines & Long Headlines</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          Headlines ({Array.isArray(selectedCampaignDetails.headlines) ? selectedCampaignDetails.headlines.length : 0}) · Long Headlines ({Array.isArray(selectedCampaignDetails.longHeadlines) ? selectedCampaignDetails.longHeadlines.length : 1})
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Headlines
                      </button>
                    </div>

                    {/* Descriptions */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Descriptions ({Array.isArray(selectedCampaignDetails.descriptions) ? selectedCampaignDetails.descriptions.length : 0})</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          {Array.isArray(selectedCampaignDetails.descriptions) && selectedCampaignDetails.descriptions.length > 0
                            ? selectedCampaignDetails.descriptions.slice(0, 1).map((d: any) => typeof d === "string" ? d : d.text).join("") + (selectedCampaignDetails.descriptions.length > 1 ? ` (+${selectedCampaignDetails.descriptions.length - 1} more)` : "")
                            : "No descriptions"}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("assets")}
                        className="px-2.5 py-1 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1 border border-purple-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Descriptions
                      </button>
                    </div>

                    {/* Media Assets (Images, Logos, Videos, Animated Clips) */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Media Assets (Images, Logos, Videos, Animated Clips)</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          Landscape/Square Images, Brand Logos, High-Resolution Videos & Automated Motion Clips
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">Media Linked</span>
                    </div>

                    {/* Call to Actions & Asset Automations */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Call to Actions & Asset Automations</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          CTA: {selectedCampaignDetails.callToAction || "Automated (Optimal CTA)"} · Asset Automations: Enabled
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Optimized</span>
                    </div>

                    {/* Asset Group URL Options & Custom Parameters */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Asset Group URL Options & Custom Parameters</p>
                        <p className="font-mono text-slate-700 mt-0.5 text-[11px]">
                          Suffix: {selectedCampaignDetails.finalUrlSuffix || "None"} · Params: {JSON.stringify(selectedCampaignDetails.customParameters || { source: "google_ads" })}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Tracking</span>
                    </div>

                    {/* Google Merchant Center Details Send Yes/No */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Google Merchant Center Details Send (Yes/No)</p>
                        <p className="font-bold text-amber-800 mt-0.5 text-[11px]">
                          Merchant Center Send: {(selectedCampaignDetails.merchantCenterId || selectedCampaignDetails.geoTargets?.merchantCenterId) ? "YES" : "NO"} · ID: {selectedCampaignDetails.merchantCenterId || selectedCampaignDetails.geoTargets?.merchantCenterId || "None"}
                        </p>
                      </div>
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">Shopping Feed</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Targeting, Demographics & Extensions */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-blue-600" /> Targeting, Extensions, Demographics & Exclusions
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5 divide-y divide-slate-100 text-xs">
                    {/* Locations & Languages */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Locations & Languages</p>
                        <p className="font-medium text-slate-800 mt-0.5">
                          Locations: {Array.isArray(selectedCampaignDetails.geoTargets) ? selectedCampaignDetails.geoTargets.map((g: any) => typeof g === "string" ? g : g.name).join(", ") : "India / Global"} · Languages: {Array.isArray(selectedCampaignDetails.languages) ? selectedCampaignDetails.languages.join(", ") : "English"}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveDetailsTab("targeting")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 cursor-pointer shrink-0"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                    </div>

                    {/* Brand Exclusions */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Brand Exclusions</p>
                        <p className="font-medium text-slate-700 mt-0.5">{selectedCampaignDetails.brandExclusions ? JSON.stringify(selectedCampaignDetails.brandExclusions) : "No Brand Exclusions (Unrestricted)"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Brand</span>
                    </div>

                    {/* Extensions: Sitelinks, Callouts, Snippets, Promotions, Prices, Lead Forms, Messages, App */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Ad Extensions Active</p>
                        <p className="text-slate-700 mt-0.5 text-[11px]">
                          Sitelinks, Callouts, Structured Snippets, Promotions, Prices, Lead Forms, Messages & App Extensions
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">Extensions</span>
                    </div>

                    {/* Customer Acquisition & Device Targeting */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Customer Acquisition & Device Targeting</p>
                        <p className="font-medium text-slate-700 mt-0.5">
                          New Customer Optimization Active · Devices: Desktop, Mobile, Tablet, Connected TV
                        </p>
                      </div>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">Acquisition</span>
                    </div>

                    {/* Demographics, Age & Gender Exclusions */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Demographic, Age & Gender Exclusions</p>
                        <p className="font-medium text-slate-700 mt-0.5">
                          Age Exclusions: None (18-65+) · Gender Exclusions: None (All) · Demographic Exclusions: Configured
                        </p>
                      </div>
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">Demographics</span>
                    </div>

                    {/* Search Themes & Audience Signals */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-slate-500 text-[11px] font-semibold">Search Themes & Audience Signals</p>
                        <p className="font-medium text-slate-700 mt-0.5">
                          Search Themes: {Array.isArray(selectedCampaignDetails.searchThemes) ? selectedCampaignDetails.searchThemes.join(", ") : "Automatic Intent Signals"} · Audience Signals: Active
                        </p>
                      </div>
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">Audience</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Performance Metrics Overview */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart2 className="h-3.5 w-3.5 text-blue-600" /> Performance Metrics & Timestamps
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Impressions</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{Number(selectedCampaignDetails.impressions || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Clicks</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{Number(selectedCampaignDetails.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Click-Through Rate</p>
                      <p className="text-sm font-bold text-blue-700 mt-0.5">{selectedCampaignDetails.ctr || "0%"}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total Spend</p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">₹{selectedCampaignDetails.cost || "0.00"}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Conversions</p>
                      <p className="text-sm font-bold text-purple-700 mt-0.5">{Number(selectedCampaignDetails.conversions || 0).toFixed(1)}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Last Updated</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {selectedCampaignDetails.updatedAt ? new Date(selectedCampaignDetails.updatedAt).toLocaleString() : "Recently"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Live Multi-Channel Google Ad Preview (Search, YouTube, Display, Discover, Gmail) */}
            {activeDetailsTab === "preview" && (
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                {/* Header & Multi-Channel + Device Selector Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 rounded-2xl border border-blue-200/80 shadow-2xs">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      Multi-Channel Live Google Ad Preview
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inspect responsive rendering across Google Search, YouTube Video/Shorts, Display Network, Google Discover, and Gmail promotions.
                    </p>
                  </div>

                  {/* Device Toggle (Mobile / Desktop) */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setPreviewDeviceMode("mobile")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewDeviceMode === "mobile"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Mobile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDeviceMode("desktop")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          previewDeviceMode === "desktop"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        <span>Desktop</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Channel Selector Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: "search", label: "Google Search", icon: Search, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
                    { id: "youtube", label: "YouTube / Video", icon: Video, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
                    { id: "display", label: "Display Banner", icon: LayoutGrid, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
                    { id: "discover", label: "Google Discover", icon: Compass, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
                    { id: "gmail", label: "Gmail Promotion", icon: Mail, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" }
                  ].map(ch => {
                    const isSelected = previewChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setPreviewChannel(ch.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer shrink-0 ${
                          isSelected
                            ? `${ch.bg} ${ch.color} shadow-xs ring-2 ring-blue-500/20`
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <ch.icon className={`h-4 w-4 ${ch.color}`} />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Preview Screen Generator */}
                {(() => {
                  const headlines = Array.isArray(selectedCampaignDetails.headlines) && selectedCampaignDetails.headlines.length > 0
                    ? selectedCampaignDetails.headlines.map((h: any) => typeof h === "string" ? h : h.text || h.headline || String(h))
                    : [selectedCampaignDetails.name || "Top Rated Services", "Official Website", "Fast & Reliable Support"];

                  const descriptions = Array.isArray(selectedCampaignDetails.descriptions) && selectedCampaignDetails.descriptions.length > 0
                    ? selectedCampaignDetails.descriptions.map((d: any) => typeof d === "string" ? d : d.text || d.description || String(d))
                    : ["Discover high-quality solutions tailored for your business needs. Contact our certified specialists today."];

                  const finalUrl = selectedCampaignDetails.finalUrl || "https://www.example.com";
                  let displayDomain = "example.com";
                  try {
                    const parsed = new URL(finalUrl.startsWith("http") ? finalUrl : `https://${finalUrl}`);
                    displayDomain = parsed.hostname.replace(/^www\./, "");
                  } catch {
                    displayDomain = finalUrl.replace(/^https?:\/\//, "").split("/")[0] || "example.com";
                  }

                  const callouts = selectedCampaignDetails.geoTargets?.callouts || selectedCampaignDetails.callouts || [];
                  const calloutList = Array.isArray(callouts)
                    ? callouts.map((c: any) => typeof c === "string" ? c : c.calloutText || c.text || JSON.stringify(c))
                    : [];

                  const sitelinks = [
                    { title: "Contact Us", snippet: "Reach out to our expert team 24/7" },
                    { title: "Special Offers", snippet: "Get exclusive discounts & plans" },
                    { title: "Pricing & Plans", snippet: "Transparent pricing with no hidden fees" },
                    { title: "Customer Reviews", snippet: "Read what thousands of happy users say" }
                  ];

                  const primaryHeadline = headlines.slice(0, 3).join(" | ");
                  const primaryDescription = descriptions.slice(0, 2).join(" ");
                  const previewBiz = selectedCampaignDetails.name || "Jisnu Digital";

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column: Interactive Phone / Desktop Channel Mockup */}
                      <div className="lg:col-span-7 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 mb-2.5 self-center">
                          {previewDeviceMode === "mobile" ? (
                            <Smartphone className="h-4 w-4 text-slate-700" />
                          ) : (
                            <Monitor className="h-4 w-4 text-slate-700" />
                          )}
                          <span className="text-xs font-bold text-slate-800 capitalize">
                            {previewChannel} {previewDeviceMode} Preview
                          </span>
                        </div>

                        {/* 1. GOOGLE SEARCH MOCKUP */}
                        {previewChannel === "search" && (
                          previewDeviceMode === "mobile" ? (
                            /* Mobile Search */
                            <div className="w-full max-w-[340px] bg-slate-900 rounded-[36px] p-3 shadow-xl border-4 border-slate-800 ring-1 ring-slate-900/10">
                              <div className="flex justify-center mb-2">
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
                              </div>
                              <div className="bg-white rounded-[24px] overflow-hidden text-xs flex flex-col shadow-inner min-h-[460px]">
                                <div className="bg-slate-50 border-b border-slate-200 p-2.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm tracking-tight">
                                      <span className="text-blue-500">G</span>
                                      <span className="text-red-500">o</span>
                                      <span className="text-amber-500">o</span>
                                      <span className="text-blue-500">g</span>
                                      <span className="text-emerald-500">l</span>
                                      <span className="text-red-500">e</span>
                                    </span>
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                                      JD
                                    </div>
                                  </div>
                                  <div className="h-8 px-3 bg-white rounded-full border border-slate-300 flex items-center justify-between text-[11px] text-slate-700 shadow-2xs">
                                    <span className="truncate">{selectedCampaignDetails.name || displayDomain}</span>
                                    <Search className="h-3.5 w-3.5 text-blue-500 shrink-0 ml-1" />
                                  </div>
                                  <div className="flex gap-4 text-[10px] font-semibold text-slate-500 pt-0.5 px-1 overflow-x-auto">
                                    <span className="text-blue-600 border-b-2 border-blue-600 pb-1">All</span>
                                    <span>Images</span>
                                    <span>News</span>
                                    <span>Videos</span>
                                  </div>
                                </div>

                                <div className="p-3.5 bg-white space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                                      G
                                    </div>
                                    <div className="flex flex-col leading-tight truncate">
                                      <span className="text-[11px] font-bold text-slate-900">{displayDomain}</span>
                                      <span className="text-[9px] text-slate-500 truncate font-mono">{finalUrl}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                      Sponsored
                                    </span>
                                  </div>
                                  <h3 className="text-[13px] font-bold text-blue-800 leading-snug hover:underline cursor-pointer">
                                    {primaryHeadline}
                                  </h3>
                                  <p className="text-[11px] text-slate-700 leading-relaxed">
                                    {primaryDescription}
                                  </p>
                                  {calloutList.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {calloutList.slice(0, 4).map((c: string, idx: number) => (
                                        <span key={idx} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                          ✓ {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
                                    {sitelinks.slice(0, 4).map((sl, idx) => (
                                      <div key={idx} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-bold text-blue-700 truncate">{sl.title}</p>
                                        <p className="text-[8px] text-slate-500 line-clamp-1">{sl.snippet}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Desktop Search */
                            <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden text-xs">
                              <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                </div>
                                <div className="flex-1 bg-white rounded-md px-2.5 py-1 text-[10px] text-slate-600 font-mono flex items-center gap-1.5 border border-slate-200 shadow-2xs">
                                  <Globe className="h-2.5 w-2.5 text-slate-400" />
                                  <span className="truncate">https://www.google.com/search?q={encodeURIComponent(selectedCampaignDetails.name || "Services")}</span>
                                </div>
                              </div>
                              <div className="p-4 space-y-2.5 bg-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                                    G
                                  </div>
                                  <div className="flex flex-col leading-none">
                                    <span className="text-xs font-bold text-slate-900">{displayDomain}</span>
                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">{finalUrl}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[11px] font-bold text-slate-900 mr-2">Sponsored ·</span>
                                  <span className="text-sm font-bold text-blue-800 hover:underline cursor-pointer">{primaryHeadline}</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">{primaryDescription}</p>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                  {sitelinks.slice(0, 4).map((sl, idx) => (
                                    <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                      <a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-bold text-blue-700 hover:underline block">{sl.title}</a>
                                      <p className="text-[10px] text-slate-500 mt-0.5">{sl.snippet}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        {/* 2. YOUTUBE MOCKUP */}
                        {previewChannel === "youtube" && (
                          previewDeviceMode === "mobile" ? (
                            <div className="w-full max-w-[340px] bg-slate-900 rounded-[36px] p-3 shadow-xl border-4 border-slate-800">
                              <div className="flex justify-center mb-2"><div className="w-16 h-1.5 bg-slate-700 rounded-full" /></div>
                              <div className="bg-white rounded-[24px] overflow-hidden text-xs flex flex-col min-h-[460px]">
                                <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-slate-100">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-3 bg-red-600 rounded-xs flex items-center justify-center">
                                      <Play className="h-2 w-2 fill-white text-white" />
                                    </div>
                                    <span className="font-bold text-xs tracking-tighter text-slate-900">YouTube</span>
                                  </div>
                                  <div className="w-5 h-5 rounded-full bg-slate-200" />
                                </div>
                                <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                  <div className="text-center p-3 text-white">
                                    <Play className="h-10 w-10 mx-auto mb-1 fill-white/80 text-white/80" />
                                    <span className="text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded">Video Stream / Shorts Ad</span>
                                  </div>
                                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded text-[9px]">
                                    Ad · 0:15
                                  </div>
                                </div>
                                <div className="p-3 bg-white space-y-2">
                                  <p className="text-xs font-bold text-slate-900 line-clamp-2">{primaryHeadline}</p>
                                  <p className="text-[11px] text-slate-600 line-clamp-2">{primaryDescription}</p>
                                  <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                                    <span>Visit Official Website</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden text-xs">
                              <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                </div>
                                <div className="flex-1 bg-white rounded-md px-2.5 py-1 text-[10px] text-slate-600 font-mono flex items-center gap-1.5 border border-slate-200">
                                  <Globe className="h-2.5 w-2.5 text-slate-400" />
                                  <span className="truncate">https://www.youtube.com/watch?v=preview</span>
                                </div>
                              </div>
                              <div className="p-4 grid grid-cols-12 gap-3 bg-white">
                                <div className="col-span-8 space-y-2">
                                  <div className="aspect-video w-full bg-slate-900 rounded-xl flex items-center justify-center text-white relative">
                                    <Play className="h-12 w-12 fill-white/80" />
                                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-amber-400 text-slate-900 font-bold text-[10px] rounded">
                                      Ad · Skip in 5s
                                    </div>
                                  </div>
                                  <h3 className="font-bold text-sm text-slate-900">{primaryHeadline}</h3>
                                  <p className="text-xs text-slate-600">{primaryDescription}</p>
                                </div>
                                <div className="col-span-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Sponsored Companion</span>
                                    <p className="font-bold text-xs text-slate-900 mt-1">{displayDomain}</p>
                                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-3">{primaryDescription}</p>
                                  </div>
                                  <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-bold text-xs block">
                                    Learn More
                                  </a>
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        {/* 3. GOOGLE DISPLAY MOCKUP */}
                        {previewChannel === "display" && (
                          <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden text-xs">
                            <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              </div>
                              <span className="text-[10px] text-slate-600 font-mono">news-publisher.com/article</span>
                            </div>
                            <div className="p-4 grid grid-cols-12 gap-3 bg-white">
                              <div className="col-span-7 space-y-2">
                                <div className="w-3/4 h-3 bg-slate-300 rounded" />
                                <div className="w-full h-1.5 bg-slate-200 rounded" />
                                <div className="w-full h-1.5 bg-slate-200 rounded" />
                                <div className="w-2/3 h-1.5 bg-slate-200 rounded" />
                                <div className="w-full h-16 bg-slate-100 rounded-lg" />
                              </div>
                              {/* Responsive Display Banner Box */}
                              <div className="col-span-5 p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200 rounded-2xl shadow-xs space-y-2 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">Google Ad</span>
                                    <span className="text-[10px] font-mono text-slate-500">{displayDomain}</span>
                                  </div>
                                  <div className="aspect-[1.91/1] w-full bg-blue-100 rounded-lg my-2 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                                    Marketing Visual
                                  </div>
                                  <p className="font-bold text-xs text-slate-900 leading-snug">{primaryHeadline}</p>
                                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{primaryDescription}</p>
                                </div>
                                <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="w-full py-1.5 bg-blue-600 text-white text-center rounded-xl font-bold text-xs">
                                  Shop Now
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. GOOGLE DISCOVER MOCKUP */}
                        {previewChannel === "discover" && (
                          <div className="w-full max-w-[340px] bg-slate-900 rounded-[36px] p-3 shadow-xl border-4 border-slate-800">
                            <div className="flex justify-center mb-2"><div className="w-16 h-1.5 bg-slate-700 rounded-full" /></div>
                            <div className="bg-slate-50 rounded-[24px] overflow-hidden text-xs flex flex-col min-h-[460px]">
                              <div className="p-3 bg-white border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                <Compass className="h-4 w-4 text-amber-500" />
                                <span>Google Discover Feed</span>
                              </div>
                              <div className="p-2 space-y-2">
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                                  <div className="aspect-[1.91/1] w-full bg-amber-100/70 flex items-center justify-center text-amber-900 font-bold text-xs">
                                    Discover Card Image
                                  </div>
                                  <div className="p-3 space-y-1.5">
                                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{primaryHeadline}</h4>
                                    <p className="text-[11px] text-slate-600 line-clamp-2">{primaryDescription}</p>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                                      <span className="font-bold text-slate-700">{previewBiz}</span>
                                      <span className="bg-slate-100 px-1.5 py-0.2 rounded font-bold">Sponsored</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. GMAIL MOCKUP */}
                        {previewChannel === "gmail" && (
                          <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden text-xs">
                            <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-purple-600" />
                                <span className="font-bold text-slate-800">Gmail Promotions Tab</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">mail.google.com</span>
                            </div>
                            <div className="p-3 space-y-2 bg-white">
                              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {previewBiz.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 truncate">{previewBiz}</span>
                                      <span className="bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded text-[9px] font-bold">Ad</span>
                                    </div>
                                    <p className="font-semibold text-slate-800 truncate mt-0.5">{primaryHeadline}</p>
                                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{primaryDescription}</p>
                                  </div>
                                </div>
                                <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shrink-0">
                                  Open
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Asset Details & Campaign Strength Checklist */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            Active Channel Coverage
                          </h5>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Google automatically serves your headlines, descriptions, and extensions across optimal placements based on your campaign channel type.
                          </p>

                          <div className="space-y-1.5 text-xs pt-1">
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Search className="h-3.5 w-3.5 text-blue-600" />
                                Google Search Network
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Video className="h-3.5 w-3.5 text-rose-600" />
                                YouTube Video & Shorts
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">Responsive</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <LayoutGrid className="h-3.5 w-3.5 text-emerald-600" />
                                Google Display Network
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">Supported</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Compass className="h-3.5 w-3.5 text-amber-600" />
                                Discover & News Feeds
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">Auto-Optimized</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-purple-600" />
                                Gmail Promotions Inbox
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px]">Auto-Injected</span>
                            </div>
                          </div>
                        </div>

                        {/* Live Copy Breakdown */}
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                          <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            Configured Assets for this Campaign
                          </h5>
                          <div className="space-y-1 text-slate-600 text-[11px]">
                            <p>• <strong>Headlines:</strong> {headlines.length} total</p>
                            <p>• <strong>Descriptions:</strong> {descriptions.length} total</p>
                            <p>• <strong>Callouts:</strong> {calloutList.length} attached</p>
                            <p>• <strong>Final URL:</strong> <span className="font-mono text-blue-600 truncate">{finalUrl}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* AI Analysis Modal */}
      {showAnalysis && (
        <Modal title="AI Campaign Analysis" onClose={() => setShowAnalysis(false)} wide>
          {analyzing ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <p className="text-slate-900 font-bold text-sm">Analyzing your campaign...</p>
              <p className="text-slate-500 text-xs">AI is reviewing performance, keywords, and search terms</p>
            </div>
          ) : analysis ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <span className={`text-2xl font-black ${analysis.score >= 7 ? "text-emerald-700" : analysis.score >= 5 ? "text-amber-700" : "text-rose-700"}`}>{analysis.score}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Campaign Score: {analysis.score}/10</p>
                  <p className="text-xs text-slate-600">{analysis.assessment}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />Strengths</h4>
                  <ul className="space-y-1.5">
                    {(analysis.strengths || []).map((s: string, i: number) => <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5"><span className="text-emerald-600 font-bold">✓</span>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <h4 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />Issues</h4>
                  <ul className="space-y-1.5">
                    {(analysis.issues || []).map((s: string, i: number) => <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5"><span className="text-rose-600 font-bold">!</span>{s}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5"><Bot className="h-4 w-4 text-blue-600" />AI Recommendations</h4>
                <div className="space-y-2">
                  {(analysis.recommendations || []).map((r: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-900">{r.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.impact === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200" : r.impact === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{r.impact}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{r.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* Native Google Ads Recommendation Details Modal */}
      {selectedRecDetails && (
        <Modal
          title={`Google Ads Recommendation: ${selectedRecDetails.type.replace(/_/g, " ")}`}
          onClose={() => setSelectedRecDetails(null)}
          wide
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{selectedRecDetails.type.replace(/_/g, " ")}</p>
                <p className="text-[11px] font-mono text-slate-500 truncate max-w-md">{selectedRecDetails.resourceName}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                selectedRecDetails.isAppliable 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {selectedRecDetails.isAppliable ? "Actionable via Google Ads API" : "Manual / View Only"}
              </span>
            </div>

            {/* Target Resource Association */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Associated Campaign</span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedRecDetails.campaignName || "Account-Wide / Not Campaign-Specific"}
                </p>
                {selectedRecDetails.campaignStatus && (
                  <p className="text-[10px] text-slate-500 font-mono">Status: {selectedRecDetails.campaignStatus}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Associated Ad Group</span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedRecDetails.adGroupName || "None / Campaign Level"}
                </p>
                {selectedRecDetails.adGroupStatus && (
                  <p className="text-[10px] text-slate-500 font-mono">Status: {selectedRecDetails.adGroupStatus}</p>
                )}
              </div>
            </div>

            {/* Impact Breakdown */}
            {selectedRecDetails.impact?.hasImpact ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Estimated Impact from Google Ads
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Weekly Clicks</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedRecDetails.impact.potentialClicks.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {selectedRecDetails.impact.deltaClicks >= 0 ? `+${selectedRecDetails.impact.deltaClicks}` : selectedRecDetails.impact.deltaClicks}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Weekly Cost</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      ₹{selectedRecDetails.impact.potentialCost.toFixed(2)}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-600">
                      (Base: ₹{selectedRecDetails.impact.baseCost.toFixed(2)})
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-slate-500 font-semibold">Weekly Conversions</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedRecDetails.impact.potentialConversions.toFixed(1)}
                    </p>
                    <span className="text-[10px] font-bold text-purple-600">
                      {selectedRecDetails.impact.deltaConversions >= 0 ? `+${selectedRecDetails.impact.deltaConversions.toFixed(1)}` : selectedRecDetails.impact.deltaConversions.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Google Ads has not provided numeric traffic/cost impact estimates for this specific recommendation type.
              </div>
            )}

            {/* Recommendation Specific Configuration & Parameters */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Google Ads API Technical Details</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
                {Object.entries(selectedRecDetails.details || {})
                  .filter(([k]) => !["resourceName", "type", "impact", "dismissed"].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between py-1 border-b border-slate-200 last:border-0">
                      <span className="text-slate-600 capitalize text-[11px]">{k.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="font-semibold text-slate-900 text-right text-[11px]">
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmDismissRec(selectedRecDetails)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Dismiss Recommendation
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecDetails(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>

                {selectedRecDetails.isAppliable ? (
                  <button
                    onClick={() => {
                      const recToApply = selectedRecDetails;
                      setSelectedRecDetails(null);
                      setConfirmApplyRec(recToApply);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
                  >
                    Apply to Google Ads
                  </button>
                ) : (
                  <a
                    href={`https://ads.google.com/aw/recommendations?ocid=${selectedCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    Open in Google Ads <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Apply Recommendation */}
      {confirmApplyRec && (
        <Modal
          title="Confirm Apply Google Ads Recommendation"
          onClose={() => setConfirmApplyRec(null)}
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Explicit Confirmation Required</p>
                <p className="text-[11px] leading-relaxed">
                  Are you sure you want to apply <strong>{confirmApplyRec.type.replace(/_/g, " ")}</strong> to your live Google Ads account ({selectedCustomerId})?
                </p>
                {confirmApplyRec.campaignName && (
                  <p className="text-[11px]">
                    Target Campaign: <strong className="font-semibold">{confirmApplyRec.campaignName}</strong>
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              This action executes Google Ads API <code>RecommendationService:applyRecommendations</code>. The changes will immediately take effect on your live Google Ads campaign or budget.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmApplyRec(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyRecommendation(confirmApplyRec)}
                disabled={applyingRecId === confirmApplyRec.id}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {applyingRecId === confirmApplyRec.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Applying to Google...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Confirm &amp; Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Dismiss Recommendation */}
      {confirmDismissRec && (
        <Modal
          title="Dismiss Recommendation"
          onClose={() => setConfirmDismissRec(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to dismiss <strong>{confirmDismissRec.type.replace(/_/g, " ")}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Dismissing will mark this recommendation as dismissed on your Google Ads account via <code>RecommendationService:dismissRecommendations</code>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmDismissRec(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDismissRecommendation(confirmDismissRec)}
                disabled={dismissingRecId === confirmDismissRec.id}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {dismissingRecId === confirmDismissRec.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Dismissing...
                  </>
                ) : (
                  "Confirm Dismiss"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Event Detail Modal (READ-ONLY) */}
      {selectedChangeDetail && (
        <Modal
          title="Change Event Details"
          onClose={() => setSelectedChangeDetail(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {(selectedChangeDetail.changeResourceType || selectedChangeDetail.resourceType || "RESOURCE")?.replace(/_/g, " ")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                  (selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation) === "CREATE"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : (selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation) === "UPDATE"
                    ? "text-blue-700 bg-blue-50 border-blue-200"
                    : (selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation) === "REMOVE"
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : "text-slate-600 bg-slate-50 border-slate-200"
                }`}>
                  {selectedChangeDetail.resourceChangeOperation || selectedChangeDetail.operation || "CHANGED"}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {selectedChangeDetail.changeDateTime ? new Date(selectedChangeDetail.changeDateTime).toLocaleString() : "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">User Email</span>
                <span className="font-semibold text-slate-800 break-all">{selectedChangeDetail.userEmail || "Google System / Automated"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Client Type / Source</span>
                <span className="font-semibold text-slate-800">{selectedChangeDetail.clientType?.replace(/_/g, " ") || "GOOGLE_ADS_WEB_CLIENT"}</span>
              </div>
              {(selectedChangeDetail.campaignName || selectedChangeDetail.campaign?.name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Campaign</span>
                  <span className="font-semibold text-slate-800">{selectedChangeDetail.campaignName || selectedChangeDetail.campaign?.name}</span>
                </div>
              )}
              {(selectedChangeDetail.adGroupName || selectedChangeDetail.adGroup?.name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Ad Group</span>
                  <span className="font-semibold text-slate-800">{selectedChangeDetail.adGroupName || selectedChangeDetail.adGroup?.name}</span>
                </div>
              )}
            </div>

            {selectedChangeDetail.changedFields && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Changed Field Mask</span>
                <code className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 block break-all">
                  {typeof selectedChangeDetail.changedFields === "string"
                    ? selectedChangeDetail.changedFields
                    : JSON.stringify(selectedChangeDetail.changedFields)}
                </code>
              </div>
            )}

            {(selectedChangeDetail.oldResource || selectedChangeDetail.newResource) && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Snapshot Comparison (Previous vs New)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                    <span className="text-rose-700 font-bold block mb-1.5 flex items-center gap-1">
                      <Minus className="h-3.5 w-3.5" /> Previous Value / State
                    </span>
                    {selectedChangeDetail.oldResource ? (
                      <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all bg-white/80 p-2.5 rounded-lg border border-rose-200 max-h-48 overflow-y-auto">
                        {JSON.stringify(selectedChangeDetail.oldResource, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Not provided by Google Ads API</p>
                    )}
                  </div>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <span className="text-emerald-700 font-bold block mb-1.5 flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" /> New Value / State
                    </span>
                    {selectedChangeDetail.newResource ? (
                      <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all bg-white/80 p-2.5 rounded-lg border border-emerald-200 max-h-48 overflow-y-auto">
                        {JSON.stringify(selectedChangeDetail.newResource, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Not provided by Google Ads API</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedChangeDetail.changeResourceName && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Target Resource</span>
                <span className="text-[11px] font-mono text-slate-600 break-all block">{selectedChangeDetail.changeResourceName}</span>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedChangeDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Bulk Task Execution & Timer Modal */}
      {bulkTaskProgress?.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  bulkTaskProgress.isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : bulkTaskProgress.actionType === "DELETE"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {bulkTaskProgress.isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5 animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{bulkTaskProgress.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {bulkTaskProgress.isCompleted ? "All tasks completed" : "Executing in Google Ads..."}
                  </p>
                </div>
              </div>

              {/* Timer Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {Math.floor(bulkTaskProgress.elapsedSeconds / 60)}:
                  {(bulkTaskProgress.elapsedSeconds % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Body / Live Progress */}
            <div className="p-6 space-y-4">
              {/* Progress Count & Percentage */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {bulkTaskProgress.isCompleted ? "Final Status" : `Processing ${bulkTaskProgress.current} of ${bulkTaskProgress.total}`}
                </span>
                <span className="font-mono font-bold text-blue-600">
                  {Math.round((bulkTaskProgress.current / Math.max(bulkTaskProgress.total, 1)) * 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    bulkTaskProgress.isCompleted
                      ? "bg-emerald-500"
                      : bulkTaskProgress.actionType === "DELETE"
                      ? "bg-rose-500"
                      : "bg-blue-600"
                  }`}
                  style={{
                    width: `${Math.max(
                      5,
                      Math.round((bulkTaskProgress.current / Math.max(bulkTaskProgress.total, 1)) * 100)
                    )}%`
                  }}
                />
              </div>

              {/* Active Item Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5">
                {!bulkTaskProgress.isCompleted && <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />}
                <p className="text-xs text-slate-700 truncate font-medium flex-1">
                  {bulkTaskProgress.currentName}
                </p>
              </div>

              {/* Success / Fail Counters */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-800">Successful</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{bulkTaskProgress.successCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-rose-800">Failed</span>
                  <span className="text-xs font-bold text-rose-700 font-mono">{bulkTaskProgress.failCount}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setBulkTaskProgress(null)}
                disabled={!bulkTaskProgress.isCompleted && isBulkOperating}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
              >
                {bulkTaskProgress.isCompleted ? "Done" : "Processing..."}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-md animate-fadeIn">
          {toast}
        </div>
      )}
    </div>
  );
}
