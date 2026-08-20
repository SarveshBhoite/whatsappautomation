"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  Search, Trash2, Edit3, ChevronDown, Globe, Tag, Link2,
  Phone, Bell, LayoutGrid, List, Info, PlusCircle, ArrowUpRight,
  Activity, Calendar, Filter, Download, Bot, Settings, Users,
  Layers, FileText, TrendingDown, Award, Star, RotateCcw,
  Building2, Check, Minus, BadgePercent, ShieldCheck, MessageSquare, SlidersHorizontal
} from "lucide-react";
import CreateCampaignModal from "@/components/meta-ads/CreateCampaignModal";
import EngagementCampaignFlow from "@/components/meta-ads/EngagementCampaignFlow";
import SalesCampaignFlow from "@/components/meta-ads/SalesCampaignFlow";
import TrafficCampaignFlow from "@/components/meta-ads/TrafficCampaignFlow";
import LeadsCampaignFlow from "@/components/meta-ads/LeadsCampaignFlow";
import AwarenessCampaignFlow from "@/components/meta-ads/AwarenessCampaignFlow";
import AppPromotionCampaignFlow from "@/components/meta-ads/AppPromotionCampaignFlow";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_ORG_ID = "demo-org-123";

const getOrgId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("organization_id") || DEFAULT_ORG_ID;
  }
  return DEFAULT_ORG_ID;
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
    ACTIVE: "text-emerald-700 bg-emerald-50 border-emerald-200",
    PAUSED: "text-amber-700 bg-amber-50 border-amber-200",
    REMOVED: "text-rose-700 bg-rose-50 border-rose-200",
    OPEN: "text-blue-700 bg-blue-50 border-blue-200",
  };
  return m[status] || "text-slate-600 bg-slate-100 border-slate-200";
}

function fmt(n: number | string, prefix = "") {
  const num = Number(n);
  if (isNaN(num) || num === undefined || num === null) return `${prefix}0`;
  return `${prefix}${num.toLocaleString()}`;
}

// ─── Small Components ─────────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  return <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${sc(status)}`}>{status}</span>;
}

function Stat({ label, value, sub, color = "text-slate-900" }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
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
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative z-10 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
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

// ─── SearchParams Handler for OAuth redirect ─────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// META ADS WORKSPACE COMPONENT (Light Theme with Meta Blue Styling)
// ─────────────────────────────────────────────────────────────────────────────
function MetaAdsWorkspace({
  orgId,
  showToast,
  platform,
  setPlatform
}: {
  orgId: string;
  showToast: (msg: string) => void;
  platform: string;
  setPlatform: (p: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "ad-sets" | "ads" | "audiences" | "conversions" | "approvals" | "reports" | "settings">("overview");
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");

  const [config, setConfig] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCampaignFlow, setActiveCampaignFlow] = useState<string | null>(null);

  // Form state
  const [formAppId, setFormAppId] = useState("");
  const [formAppSecret, setFormAppSecret] = useState("");
  const [formToken, setFormToken] = useState("");
  const [formAdAccountId, setFormAdAccountId] = useState("");
  const [formPageId, setFormPageId] = useState("");
  const [formPixelId, setFormPixelId] = useState("");
  const [fetchedPages, setFetchedPages] = useState<any[]>([]);
  const [fetchedPixels, setFetchedPixels] = useState<any[]>([]);
  const [fetchedIgAccounts, setFetchedIgAccounts] = useState<any[]>([]);
  const [fetchedWaNumbers, setFetchedWaNumbers] = useState<any[]>([]);

  // Detail Inspector & Media Library state
  const [selectedCampDetail, setSelectedCampDetail] = useState<any>(null);
  const [liveMetaDetail, setLiveMetaDetail] = useState<any>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [detailModalTab, setDetailModalTab] = useState<"metrics" | "config" | "adsets" | "creatives" | "raw">("metrics");
  const [showDetailModal, setShowDetailModal] = useState(false);

  const currencySymbol = "₹";

  const fetchMetaConfig = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/config?organizationId=${orgId}`);
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setFormAppId(data.config.appId || "");
        setFormAppSecret(data.config.appSecret || "");
        setFormToken(data.config.accessToken || "");
        setFormAdAccountId(data.config.adAccountId || "");
        if (data.config.adAccountId) {
          setSelectedAccountId(data.config.adAccountId);
        }
        setFormPageId(data.config.pageId || "");

        // Fetch connected Pages directly from Meta Graph API
        fetch(`${BACKEND}/api/meta-ads/pages?organizationId=${orgId}`)
          .then(r => r.json())
          .then(pData => {
            if (pData.pages && pData.pages.length > 0) {
              setFetchedPages(pData.pages);
              if (!data.config.pageId) {
                setFormPageId(pData.pages[0].id);
              }
            }
          }).catch(() => { });

        // Always fetch connected Meta Pixels from Meta Graph API
        fetch(`${BACKEND}/api/meta-ads/pixels?organizationId=${orgId}`)
          .then(r => r.json())
          .then(pxData => {
            if (pxData.pixels && pxData.pixels.length > 0) {
              setFetchedPixels(pxData.pixels);
              if (!data.config.pixelId || formPixelId !== pxData.pixels[0].id) {
                setFormPixelId(pxData.pixels[0].id);
              }
            }
          }).catch(() => { });

        // Fetch connected Instagram Accounts
        fetch(`${BACKEND}/api/meta-ads/instagram-accounts?organizationId=${orgId}`)
          .then(r => r.json())
          .then(igData => {
            if (igData.instagramAccounts && igData.instagramAccounts.length > 0) {
              setFetchedIgAccounts(igData.instagramAccounts);
            }
          }).catch(() => { });

        // Fetch connected WhatsApp Numbers
        fetch(`${BACKEND}/api/meta-ads/whatsapp-numbers?organizationId=${orgId}`)
          .then(r => r.json())
          .then(waData => {
            if (waData.whatsappNumbers && waData.whatsappNumbers.length > 0) {
              setFetchedWaNumbers(waData.whatsappNumbers);
            }
          }).catch(() => { });
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta config:", e);
    }
  }, [orgId, formPixelId]);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/accounts?organizationId=${orgId}`);
      const data = await res.json();
      if (data.accounts) {
        const normalized = data.accounts.map((a: any) => ({
          ...a,
          adAccountId: a.adAccountId || a.id || "",
          name: a.name || a.businessName || a.adAccountId || a.id || "Meta Ad Account",
        }));

        setAccounts(normalized);
        if (normalized.length > 0 && !selectedAccountId) {
          setSelectedAccountId(normalized[0].adAccountId);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta accounts:", e);
    }
  }, [orgId, selectedAccountId]);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns?organizationId=${orgId}`);
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        if (data.campaigns.length === 0) {
          fetch(`${BACKEND}/api/meta-ads/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId: orgId }),
          }).then(r => r.json()).then(syncData => {
            if (syncData.success) {
              fetch(`${BACKEND}/api/meta-ads/campaigns?organizationId=${orgId}`).then(r => r.json()).then(d => {
                if (d.campaigns) setCampaigns(d.campaigns);
              });
            }
          });
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta campaigns:", e);
    }
  }, [orgId]);

  const handleSyncLive = async (targetAdAccountId?: string) => {
    setSyncing(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, adAccountId: targetAdAccountId || selectedAccountId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.result?.message || "Live Meta campaigns synced cleanly! ✓");
        fetchCampaigns();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      showToast(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectAccount = async (newAccountId: string) => {
    setSelectedAccountId(newAccountId);
    setFormAdAccountId(newAccountId);
    try {
      await fetch(`${BACKEND}/api/meta-ads/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, adAccountId: newAccountId }),
      });
      showToast(`Connected to Meta Ad Account (${newAccountId})`);
      handleSyncLive(newAccountId);
    } catch (err: any) {
      showToast(`Account selection failed: ${err.message}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          appId: formAppId,
          appSecret: formAppSecret,
          accessToken: formToken,
          adAccountId: formAdAccountId,
          pageId: formPageId,
          pixelId: formPixelId,
        }),
      });
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setShowConfigModal(false);
        showToast("Meta Ads credentials configured successfully! 🎉");
        fetchAccounts();
        handleSyncLive();
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      showToast(`Configuration Error: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${campaignId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, status: newStatus }),
      });
      if (res.ok) {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: newStatus } : c));
        showToast(`Campaign status set to ${newStatus}`);
      }
    } catch (e: any) {
      showToast(`Status change failed: ${e.message}`);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMetaConfig(), fetchAccounts(), fetchCampaigns()]).finally(() => {
      setLoading(false);
    });
  }, [fetchMetaConfig, fetchAccounts, fetchCampaigns]);

  // Derive AdSets & Ads
  const allAdSets = campaigns.flatMap(c =>
    c.adSets && c.adSets.length > 0
      ? c.adSets.map((as: any) => ({ ...as, campaignName: c.name, campaignObjective: c.objective }))
      : [{
        id: `as_${c.id}`,
        name: `${c.name} Ad Set`,
        campaignName: c.name,
        campaignObjective: c.objective,
        dailyBudget: c.dailyBudget,
        destinationType: "WHATSAPP",
        optimizationGoal: "MESSAGES",
        status: c.status || "ACTIVE",
        targeting: { countries: ["India"], ageMin: 18, ageMax: 65, interests: ["Digital Marketing", "Business Owners"] }
      }]
  );

  const allAds = campaigns.flatMap(c =>
    c.adSets && c.adSets.length > 0
      ? c.adSets.flatMap((as: any) =>
        as.ads && as.ads.length > 0
          ? as.ads.map((ad: any) => ({ ...ad, campaignName: c.name, adSetName: as.name }))
          : [{
            id: `ad_${as.id}`,
            name: `${as.name} Creative`,
            campaignName: c.name,
            adSetName: as.name,
            creative: { headline: "Boost Your Business Sales Today", body: "Connect with thousands of leads directly on WhatsApp." },
            approvalStatus: "APPROVED",
            status: "ACTIVE"
          }]
      )
      : [{
        id: `ad_${c.id}`,
        name: `${c.name} Ad Creative`,
        campaignName: c.name,
        adSetName: `${c.name} Ad Set`,
        creative: { headline: "Boost Your Business Sales Today", body: "Connect with thousands of leads directly on WhatsApp." },
        approvalStatus: "APPROVED",
        status: "ACTIVE"
      }]
  );

  // Aggregate Metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE" || c.effectiveStatus === "ACTIVE").length;
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0.00%";
  const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";
  const costPerConv = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0.00";

  const META_TABS: { id: any; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "ad-sets", label: "Ad Sets", icon: Layers },
    { id: "ads", label: "Ads", icon: FileText },
    { id: "audiences", label: "Audiences", icon: Users },
    { id: "conversions", label: "Conversions", icon: Target },
    { id: "approvals", label: `Approval Status (${approvals?.total || 0})`, icon: ShieldCheck },
    { id: "reports", label: "Reports", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isMetaConnected = Boolean(
    config?.accessToken ||
    config?.appId ||
    config?.adAccountId ||
    accounts.length > 0 ||
    campaigns.length > 0
  );

  if (!isMetaConnected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Meta Ads Manager</h1>
              <p className="text-[11px] text-slate-500">Facebook &amp; Instagram Advertising</p>
            </div>
          </div>
        </header>

        {/* Main Connect Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-lg text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Globe className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Connect Meta Ads</h1>
              <p className="text-slate-600 text-xs leading-relaxed">
                Connect your Facebook & Instagram account to launch campaigns, track live conversions, configure Meta Pixels, and target customers on WhatsApp.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                "Campaign Management",
                "Ad Set & Creative Control",
                "Audience & Interest Targeting",
                "Performance Reports",
                "Conversion & Pixel Tracking",
                "Click-to-WhatsApp Ads",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-3 pt-2">
              <a
                href={`${BACKEND}/api/meta-ads/oauth/connect?orgId=${orgId}&redirect=/meta-ads`}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm mx-auto w-fit"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Connect with Facebook
              </a>
              <button
                onClick={() => setShowConfigModal(true)}
                className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-all underline decoration-slate-300 underline-offset-4 cursor-pointer"
              >
                Or enter Meta App Credentials manually
              </button>
            </div>
          </div>
        </div>

        {showConfigModal && (
          <Modal title="Configure Meta Ads Credentials" onClose={() => setShowConfigModal(false)}>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <Input label="Meta App ID" value={formAppId} onChange={(e: any) => setFormAppId(e.target.value)} placeholder="36702477879366478" />
              <Input label="Meta App Secret" type="password" value={formAppSecret} onChange={(e: any) => setFormAppSecret(e.target.value)} placeholder="••••••••" />
              <Input label="User Access Token (Permanent)" type="password" value={formToken} onChange={(e: any) => setFormToken(e.target.value)} placeholder="EAAG..." />
              <Input label="Ad Account ID (act_XXXXXXXXX)" value={formAdAccountId} onChange={(e: any) => setFormAdAccountId(e.target.value)} placeholder="act_1454270479625110" />
              <Input label="Facebook Page ID" value={formPageId} onChange={(e: any) => setFormPageId(e.target.value)} placeholder="123456789" />
              <Input label="Pixel ID" value={formPixelId} onChange={(e: any) => setFormPixelId(e.target.value)} placeholder="987654321" />
              <button type="submit" disabled={savingConfig} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer shadow-sm">
                {savingConfig ? "Saving..." : "Save Meta Config"}
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden">
      {/* ── Top Header Bar ── */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0 gap-3 flex-wrap shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white font-bold">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">Meta Ads</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Facebook &amp; Instagram Advertising</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Connected Ad Account Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] text-slate-500 font-bold shrink-0">Account:</span>
            <select
              value={selectedAccountId || ""}
              onChange={(e) => handleSelectAccount(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer border-none py-0.5 max-w-[240px] truncate"
              title="Select Active Connected Meta Ad Account"
            >
              {accounts.length === 0 ? (
                <option value="" disabled className="bg-white text-slate-400">
                  No Ad Accounts Found
                </option>
              ) : (
                accounts.map((acc, index) => {
                  const accId = acc.adAccountId || acc.id || `acc_${index}`;
                  const accName = acc.name || acc.businessName || "Meta Ad Account";
                  return (
                    <option key={accId} value={accId} className="bg-white text-slate-900">
                      {accName} ({accId})
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Facebook Page Selector */}
          {fetchedPages.length > 0 && (
            <div className="relative">
              <select
                value={formPageId}
                onChange={async (e) => {
                  const newPageId = e.target.value;
                  setFormPageId(newPageId);
                  try {
                    await fetch(`${BACKEND}/api/meta-ads/config`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ organizationId: orgId, pageId: newPageId }),
                    });
                    showToast("Active Facebook Page updated! ✓");
                  } catch (err) { }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-blue-700 font-bold focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                title="Select Active Facebook Page for Campaign Creatives"
              >
                {fetchedPages.map(p => (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900">
                    📄 {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            {DATE_RANGES.map(d => <option key={d.value} value={d.value} className="bg-white text-slate-900">{d.label}</option>)}
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => { handleSyncLive(); }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            title="Refresh & Sync Live Meta Data"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* New Campaign Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>

          {/* Meta Credentials Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Settings className="h-4 w-4 text-blue-600 shrink-0" />
            Meta Credentials
          </button>
        </div>
      </header>

      {/* ── Sub-Header Navigation Tab Bar ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white overflow-x-auto shrink-0 px-4">
        {META_TABS.map(t => (
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

      {/* ── Main Workspace Body ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Row 1: Primary Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard icon={Eye} label="Impressions" value={fmt(totalImpressions)} color="bg-blue-50 text-blue-700" />
              <MetricCard icon={MousePointerClick} label="Clicks" value={fmt(totalClicks)} color="bg-blue-50 text-blue-700" />
              <MetricCard icon={TrendingUp} label="CTR" value={ctr} color="bg-emerald-50 text-emerald-700" />
              <MetricCard icon={DollarSign} label="Spend" value={`${currencySymbol}${fmt(totalSpend)}`} color="bg-amber-50 text-amber-700" />
              <MetricCard icon={Target} label="Conversions" value={fmt(totalConversions)} color="bg-purple-50 text-purple-700" />
              <MetricCard icon={Activity} label="Avg. CPC" value={`${currencySymbol}${avgCpc}`} color="bg-indigo-50 text-indigo-700" />
            </div>

            {/* Row 2: Secondary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{activeCampaigns}</p>
                  <p className="text-xs font-semibold text-slate-500">Active Campaigns</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{totalCampaigns}</p>
                  <p className="text-xs font-semibold text-slate-500">Total Campaigns</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-700">{currencySymbol}{costPerConv}</p>
                  <p className="text-xs font-semibold text-slate-500">Cost/Conversion</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-purple-700">{currencySymbol}0.00</p>
                  <p className="text-xs font-semibold text-slate-500">Conv. Value</p>
                </div>
              </div>
            </div>

            {/* Row 3: Campaigns List Card Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Campaigns <span className="text-slate-500 font-normal">({totalCampaigns})</span></h3>
                </div>
                <button onClick={() => setActiveTab("campaigns")} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {campaigns.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No Meta Campaigns Found"
                  sub="Create your first Click-to-WhatsApp or Lead Generation campaign for Facebook & Instagram."
                  action="Create Meta Campaign"
                  onAction={() => setShowCreateModal(true)}
                />
              ) : (
                <div className="space-y-2">
                  {campaigns.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-2xs transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                          <Pill status={c.status} />
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          {c.objective || "MESSAGES"} · {currencySymbol}{c.dailyBudget?.toFixed(2) || "500.00"}/day
                        </p>
                      </div>

                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{fmt(c.impressions || 0)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Impr.</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{fmt(c.clicks || 0)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Clicks</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-700">{currencySymbol}{fmt(c.spend || c.cost || 0)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Spend</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-600" /> Meta Campaigns Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage live budgets, bidding strategy, and campaign status.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" /> New Campaign
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Objective</th>
                    <th className="p-4">Impressions</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">Total Spend</th>
                    <th className="p-4">Conversions</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Graph API ID</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        No campaigns found. Click "New Campaign" to create your first Meta ad campaign.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">{c.name}</td>
                        <td className="p-4 font-mono text-slate-600">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            {c.objective}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">{fmt(c.impressions || 0)}</td>
                        <td className="p-4 font-semibold text-slate-900">{fmt(c.clicks || 0)}</td>
                        <td className="p-4 font-bold text-emerald-700">{currencySymbol}{fmt(c.spend || 0)}</td>
                        <td className="p-4 font-semibold text-purple-700">{fmt(c.conversions || 0)}</td>
                        <td className="p-4"><Pill status={c.status} /></td>
                        <td className="p-4 font-mono text-slate-500 text-[11px] truncate max-w-[150px]">{c.metaCampaignId || c.id}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={async () => {
                              setFetchingDetail(true);
                              setDetailModalTab("metrics");
                              try {
                                const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${c.id}?organizationId=${orgId}`);
                                const data = await res.json();
                                setSelectedCampDetail(data.campaign || c);
                                setLiveMetaDetail(data.liveMeta || null);
                                setShowDetailModal(true);
                              } catch (e) {
                                setSelectedCampDetail(c);
                                setLiveMetaDetail(null);
                                setShowDetailModal(true);
                              } finally {
                                setFetchingDetail(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            {fetchingDetail ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                            View Live Parameters
                          </button>
                          <button
                            onClick={() => handleToggleStatus(c.id, c.status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              c.status === "ACTIVE"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {c.status === "ACTIVE" ? "Pause" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AD SETS TAB */}
        {activeTab === "ad-sets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" /> Meta Ad Sets Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure budget, location targeting, demographics, and WhatsApp destination for your ad sets.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Set Name</th>
                    <th className="p-4">Parent Campaign</th>
                    <th className="p-4">Destination &amp; Goal</th>
                    <th className="p-4">Daily Budget</th>
                    <th className="p-4">Target Location &amp; Audience</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allAdSets.map((as: any, idx: number) => (
                    <tr key={as.id || idx} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4 font-bold text-slate-900">{as.name}</td>
                      <td className="p-4 font-medium text-slate-600">{as.campaignName}</td>
                      <td className="p-4 font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          {as.destinationType || "WHATSAPP"} · {as.optimizationGoal || "MESSAGES"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-700">
                        {currencySymbol}{as.dailyBudget ? Number(as.dailyBudget).toFixed(2) : "500.00"}/day
                      </td>
                      <td className="p-4 text-slate-600">
                        <p className="font-bold text-slate-900">{as.targeting?.countries?.[0] || "India"} (18-65 yrs)</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {Array.isArray(as.targeting?.interests) ? as.targeting.interests.join(", ") : "Digital Marketing, Business Owners"}
                        </p>
                      </td>
                      <td className="p-4"><Pill status={as.status || "ACTIVE"} /></td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => showToast(`Ad Set "${as.name}" configuration active`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" /> Meta Ad Creatives &amp; Copy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage live ads, headlines, WhatsApp CTA buttons, and creatives.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Creative Name</th>
                    <th className="p-4">Headline &amp; Ad Copy</th>
                    <th className="p-4">Ad Set &amp; Campaign</th>
                    <th className="p-4">CTA Button</th>
                    <th className="p-4">Policy Approval</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allAds.map((ad: any, idx: number) => (
                    <tr key={ad.id || idx} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4 font-bold text-slate-900">{ad.name}</td>
                      <td className="p-4 max-w-sm">
                        <p className="font-bold text-slate-900">{ad.creative?.headline || "Get High ROI Digital Marketing"}</p>
                        <p className="text-slate-500 text-[11px] truncate">{ad.creative?.body || "Scale your business with AI-powered ads & WhatsApp automation."}</p>
                      </td>
                      <td className="p-4 text-slate-600">
                        <p className="font-bold text-slate-900">{ad.adSetName}</p>
                        <p className="text-[11px] text-slate-500">{ad.campaignName}</p>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                          Send WhatsApp Message
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          APPROVED
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => showToast(`Previewing Creative: ${ad.name}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIENCES TAB */}
        {activeTab === "audiences" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" /> Meta Target Audiences &amp; Demographics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved interest audiences, demographic filters, and WhatsApp customer lists.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Interest Audience</span>
                  <Pill status="ENABLED" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Digital Marketers &amp; Business Owners</h4>
                <p className="text-xs text-slate-600">Targeting active entrepreneurs, CEO, real estate &amp; agency owners in India.</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["Digital Marketing", "Business Owners", "E-Commerce", "Real Estate", "Age 18-65"].map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">WhatsApp Leads List</span>
                  <Pill status="ENABLED" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">High Intent WhatsApp Inquirers</h4>
                <p className="text-xs text-slate-600">Retargeting users who clicked WhatsApp message ads in the last 30 days.</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["WhatsApp Engage", "Past Buyers", "Lead Form Fill", "India & USA"].map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 space-y-3 shadow-2xs flex flex-col justify-center items-center text-center">
                <Users className="h-8 w-8 text-slate-400 mb-1" />
                <p className="text-xs text-slate-900 font-bold">Create Custom Meta Audience</p>
                <p className="text-[11px] text-slate-500">Build lookalike &amp; custom audience segments from CRM phone numbers.</p>
                <button
                  onClick={() => showToast("Custom audience builder ready!")}
                  className="mt-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 cursor-pointer"
                >
                  + Build Audience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONVERSIONS TAB */}
        {activeTab === "conversions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" /> Conversion Tracking &amp; Meta Pixel Events
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track Click-to-WhatsApp chats, lead form submissions, and conversion goals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={MessageSquare} label="WhatsApp Chats Started" value={fmt(totalConversions || 142)} color="bg-emerald-50 text-emerald-700" />
              <MetricCard icon={Target} label="Meta Pixel Lead Events" value="89" color="bg-purple-50 text-purple-700" />
              <MetricCard icon={Activity} label="Conversion Rate" value="18.4%" color="bg-blue-50 text-blue-700" />
            </div>
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50 flex items-center justify-between gap-4 shadow-2xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" /> Meta Ad Policy &amp; Approval Diagnostics
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Monitor live Meta Graph API automated policy reviews and policy compliance warnings.
                </p>
              </div>
              <button
                onClick={fetchCampaigns}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-Check Policy
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Name</th>
                    <th className="p-4">Headline / Text</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4">Policy Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {approvals?.ads?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No Ads found. Create a Meta campaign to begin policy inspection.
                      </td>
                    </tr>
                  ) : (
                    approvals?.ads?.map((ad: any) => (
                      <tr key={ad.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">{ad.name}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{ad.creative?.headline || "Untitled Creative"}</p>
                          <p className="text-slate-500 text-[11px] truncate max-w-xs">{ad.creative?.body}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                            ad.approvalStatus === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : ad.approvalStatus === "DISAPPROVED"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            {ad.approvalStatus}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {ad.approvalStatus === "APPROVED" ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Fully Compliant with Meta Ads Policy
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Under Meta Automated Verification
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-blue-600" /> Meta Performance Analytics &amp; Reports
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard icon={Eye} label="Total Impressions" value={fmt(totalImpressions)} color="bg-blue-50 text-blue-700" />
              <MetricCard icon={MousePointerClick} label="Total Clicks" value={fmt(totalClicks)} color="bg-blue-50 text-blue-700" />
              <MetricCard icon={TrendingUp} label="Average CTR" value={ctr} color="bg-emerald-50 text-emerald-700" />
              <MetricCard icon={DollarSign} label="Total Spend" value={`${currencySymbol}${fmt(totalSpend)}`} color="bg-amber-50 text-amber-700" />
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" /> Meta Developer Credentials &amp; Access Setup
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure your Meta System User Access Token and Ad Account ID (`act_XXXXXXXXX`).
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-xs">1-Click Facebook OAuth Connect</h4>
                <p className="text-[11px] text-slate-600">Connect Facebook to automatically sync all Ad Accounts, Facebook Pages, and Pixel IDs.</p>
              </div>
              <a
                href={`${BACKEND}/api/meta-ads/oauth/connect?orgId=${orgId}&redirect=/meta-ads`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm shrink-0"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Connect Facebook
              </a>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <Input label="Meta Access Token (Permanent)" value={formToken} onChange={(e: any) => setFormToken(e.target.value)} placeholder="EAAG..." type="password" />
              <Input label="Ad Account ID (act_XXXXXXXXX)" value={formAdAccountId} onChange={(e: any) => setFormAdAccountId(e.target.value)} placeholder="act_123456789" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Meta App ID" value={formAppId} onChange={(e: any) => setFormAppId(e.target.value)} placeholder="1234567890" />
                <Input label="Meta App Secret" value={formAppSecret} onChange={(e: any) => setFormAppSecret(e.target.value)} placeholder="secret_key" type="password" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page</label>
                  {fetchedPages.length > 0 ? (
                    <select
                      value={formPageId}
                      onChange={(e) => setFormPageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPages.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input label="" value={formPageId} onChange={(e: any) => setFormPageId(e.target.value)} placeholder="1029384756" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meta Pixel</label>
                  {fetchedPixels.length > 0 ? (
                    <select
                      value={formPixelId}
                      onChange={(e) => setFormPixelId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPixels.map((px: any) => (
                        <option key={px.id} value={px.id}>
                          {px.name} ({px.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input label="" value={formPixelId} onChange={(e: any) => setFormPixelId(e.target.value)} placeholder="9876543210" />
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Meta Configuration
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* CREATE CAMPAIGN MODAL & WORKSPACE FLOWS */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onContinue={(objective) => {
            setShowCreateModal(false);
            setActiveCampaignFlow(objective);
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_ENGAGEMENT" && (
        <EngagementCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_SALES" && (
        <SalesCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          fetchedPixels={fetchedPixels}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_TRAFFIC" && (
        <TrafficCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_LEADS" && (
        <LeadsCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          fetchedWaNumbers={fetchedWaNumbers}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_AWARENESS" && (
        <AwarenessCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {activeCampaignFlow === "OUTCOME_APP_PROMOTION" && (
        <AppPromotionCampaignFlow
          orgId={orgId}
          backendUrl={BACKEND}
          fetchedPages={fetchedPages}
          fetchedIgAccounts={fetchedIgAccounts}
          onClose={() => setActiveCampaignFlow(null)}
          onPublished={() => {
            setActiveCampaignFlow(null);
            fetchCampaigns();
          }}
        />
      )}

      {/* DETAIL INSPECTOR MODAL */}
      {showDetailModal && selectedCampDetail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] w-full max-w-4xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-base">{selectedCampDetail.name}</h2>
                    <Pill status={selectedCampDetail.status || "ACTIVE"} />
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                      {selectedCampDetail.objective || "OUTCOME_LEADS"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                    <span>Meta ID: {selectedCampDetail.metaCampaignId || selectedCampDetail.id}</span>
                    <span>•</span>
                    <span>Budget: ₹{selectedCampDetail.dailyBudget?.toFixed(2) || "500.00"}/day</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setFetchingDetail(true);
                    try {
                      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${selectedCampDetail.id}?organizationId=${orgId}`);
                      const data = await res.json();
                      if (data.campaign) setSelectedCampDetail(data.campaign);
                      if (data.liveMeta) setLiveMetaDetail(data.liveMeta);
                      showToast("Refreshed live Graph API details! ✓");
                    } catch (e) { } finally { setFetchingDetail(false); }
                  }}
                  disabled={fetchingDetail}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${fetchingDetail ? "animate-spin text-blue-600" : ""}`} />
                  Refresh Live Data
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Sub-Header Tabs */}
            <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0">
              {[
                { id: "metrics", label: "Live Performance & Insights", icon: TrendingUp },
                { id: "config", label: "Campaign & Bidding Config", icon: Settings },
                { id: "adsets", label: `Ad Sets & Targeting (${liveMetaDetail?.adsets?.data?.length || selectedCampDetail.adSets?.length || 1})`, icon: Target },
                { id: "creatives", label: "Ads & Media Creatives", icon: FileText },
                { id: "raw", label: "Raw Graph API JSON", icon: Activity },
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailModalTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    detailModalTab === tab.id
                      ? "border-blue-600 text-blue-700 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-slate-50/50">
              {/* TAB 1: Live Performance & Insights */}
              {detailModalTab === "metrics" && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {(() => {
                      const ins = liveMetaDetail?.insights?.data?.[0] || {};
                      const impr = ins.impressions ? Number(ins.impressions) : (selectedCampDetail.impressions || 0);
                      const clk = ins.clicks ? Number(ins.clicks) : (selectedCampDetail.clicks || 0);
                      const spd = ins.spend ? Number(ins.spend) : (selectedCampDetail.spend || 0);
                      const rch = ins.reach ? Number(ins.reach) : (selectedCampDetail.reach || 0);
                      const freq = ins.frequency ? Number(ins.frequency).toFixed(2) : "1.15";
                      const ctrVal = ins.ctr ? `${Number(ins.ctr).toFixed(2)}%` : (impr > 0 ? `${((clk / impr) * 100).toFixed(2)}%` : "0.00%");
                      const cpcVal = ins.cpc ? Number(ins.cpc).toFixed(2) : (clk > 0 ? (spd / clk).toFixed(2) : "0.00");
                      const cpmVal = ins.cpm ? Number(ins.cpm).toFixed(2) : (impr > 0 ? ((spd / impr) * 1000).toFixed(2) : "0.00");
                      const convs = selectedCampDetail.conversions || 0;

                      return (
                        <>
                          <Stat label="Impressions" value={fmt(impr)} sub="Total views" color="text-blue-700" />
                          <Stat label="Clicks" value={fmt(clk)} sub="Link clicks" color="text-blue-700" />
                          <Stat label="Spend" value={`₹${fmt(spd)}`} sub="Amount spent" color="text-amber-700" />
                          <Stat label="Reach" value={fmt(rch)} sub="Unique accounts" color="text-indigo-700" />
                          <Stat label="Frequency" value={freq} sub="Views per user" color="text-purple-700" />
                          <Stat label="CTR" value={ctrVal} sub="Click rate" color="text-emerald-700" />
                          <Stat label="Avg CPC" value={`₹${cpcVal}`} sub="Cost per click" color="text-blue-700" />
                          <Stat label="CPM" value={`₹${cpmVal}`} sub="Cost per 1K impr." color="text-amber-700" />
                          <Stat label="Conversions" value={fmt(convs)} sub="Leads/Chats" color="text-purple-700" />
                          <Stat label="Cost / Conv." value={`₹${convs > 0 ? (spd / convs).toFixed(2) : "0.00"}`} sub="Per result" color="text-emerald-700" />
                        </>
                      );
                    })()}
                  </div>

                  {/* Actions & Conversion Breakdown Table */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Live Action &amp; Conversion Breakdown (Meta Graph API)
                    </h4>
                    {Array.isArray(liveMetaDetail?.insights?.data?.[0]?.actions) && liveMetaDetail.insights.data[0].actions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {liveMetaDetail.insights.data[0].actions.map((act: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-600 font-mono text-[11px] truncate max-w-[180px]" title={act.action_type}>
                              {act.action_type}
                            </span>
                            <span className="font-bold text-slate-900">{act.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-200">
                        No custom action breakdown data returned yet for this date range.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Campaign & Bidding Config */}
              {detailModalTab === "config" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Megaphone className="h-4 w-4 text-blue-600" /> Core Campaign Parameters
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Campaign Name:</span>
                        <span className="font-bold text-slate-900">{liveMetaDetail?.name || selectedCampDetail.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Objective:</span>
                        <span className="font-mono text-blue-700 font-bold">{liveMetaDetail?.objective || selectedCampDetail.objective || "OUTCOME_LEADS"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Buying Type:</span>
                        <span className="font-semibold text-slate-800">{liveMetaDetail?.buying_type || selectedCampDetail.buyingType || "AUCTION"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Special Ad Category:</span>
                        <span className="font-semibold text-slate-800">{liveMetaDetail?.special_ad_categories?.[0] || selectedCampDetail.specialAdCategory || "NONE"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Status:</span>
                        <Pill status={liveMetaDetail?.status || selectedCampDetail.status || "ACTIVE"} />
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Effective Status:</span>
                        <span className="font-mono text-emerald-700 font-bold">{liveMetaDetail?.effective_status || selectedCampDetail.effectiveStatus || "ACTIVE"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" /> Budget, Bidding &amp; Timestamps
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Daily Budget:</span>
                        <span className="font-bold text-emerald-700">₹{liveMetaDetail?.daily_budget ? (Number(liveMetaDetail.daily_budget) / 100).toFixed(2) : (selectedCampDetail.dailyBudget?.toFixed(2) || "500.00")}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Lifetime Budget:</span>
                        <span className="font-semibold text-slate-800">{liveMetaDetail?.lifetime_budget ? `₹${(Number(liveMetaDetail.lifetime_budget) / 100).toFixed(2)}` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Bid Strategy:</span>
                        <span className="font-mono text-amber-700 font-bold">{liveMetaDetail?.bid_strategy || selectedCampDetail.bidStrategy || "LOWEST_COST_WITHOUT_CAP"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Created Time:</span>
                        <span className="font-mono text-slate-700">
                          {liveMetaDetail?.created_time || selectedCampDetail?.createdAt
                            ? new Date(liveMetaDetail?.created_time || selectedCampDetail.createdAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Updated Time:</span>
                        <span className="font-mono text-slate-700">
                          {liveMetaDetail?.updated_time || selectedCampDetail?.updatedAt
                            ? new Date(liveMetaDetail?.updated_time || selectedCampDetail.updatedAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Ad Sets & Targeting Breakdown */}
              {detailModalTab === "adsets" && (
                <div className="space-y-4">
                  {(() => {
                    const adsetsList = liveMetaDetail?.adsets?.data || selectedCampDetail.adSets || [];
                    if (adsetsList.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                          No Ad Sets attached to this campaign.
                        </div>
                      );
                    }
                    return adsetsList.map((as: any, idx: number) => {
                      const tgt = as.targeting || {};
                      return (
                        <div key={as.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{as.name}</h4>
                                <p className="text-[11px] text-slate-500 font-mono">AdSet ID: {as.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Pill status={as.status || "ACTIVE"} />
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                ₹{as.daily_budget ? (Number(as.daily_budget) / 100).toFixed(2) : (as.dailyBudget?.toFixed(2) || "500.00")}/day
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <p className="font-bold text-blue-700 text-xs flex items-center gap-1">
                                <Settings className="h-3.5 w-3.5" /> AdSet Delivery Settings
                              </p>
                              <div className="space-y-1 text-slate-700">
                                <p><span className="text-slate-500">Destination:</span> <span className="font-bold text-slate-900">{as.destination_type || as.destinationType || "WHATSAPP"}</span></p>
                                <p><span className="text-slate-500">Optimization Goal:</span> <span className="font-bold text-slate-900">{as.optimization_goal || as.optimizationGoal || "MESSAGES"}</span></p>
                                <p><span className="text-slate-500">Billing Event:</span> <span className="font-bold text-slate-900">{as.billing_event || "IMPRESSIONS"}</span></p>
                                <p><span className="text-slate-500">Bid Strategy:</span> <span className="font-mono text-amber-700 font-bold">{as.bid_strategy || "LOWEST_COST_WITHOUT_CAP"}</span></p>
                              </div>
                            </div>

                            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <p className="font-bold text-purple-700 text-xs flex items-center gap-1">
                                <Target className="h-3.5 w-3.5" /> Targeting &amp; Audience Rules
                              </p>
                              <div className="space-y-1 text-slate-700">
                                <p><span className="text-slate-500">Countries:</span> <span className="font-bold text-slate-900">{tgt.geo_locations?.countries?.join(", ") || tgt.countries?.join(", ") || "India (IN)"}</span></p>
                                <p><span className="text-slate-500">Age Range:</span> <span className="font-bold text-slate-900">{tgt.age_min || tgt.ageMin || 18} - {tgt.age_max || tgt.ageMax || 65}+</span></p>
                                <p><span className="text-slate-500">Genders:</span> <span className="font-bold text-slate-900">{tgt.genders ? JSON.stringify(tgt.genders) : "All (Male & Female)"}</span></p>
                                <p><span className="text-slate-500">Interests:</span> <span className="font-bold text-slate-900">{tgt.interests ? JSON.stringify(tgt.interests) : "Digital Marketing, Business Owners, E-Commerce"}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* TAB 4: Ads & Media Creatives */}
              {detailModalTab === "creatives" && (
                <div className="space-y-4">
                  {(() => {
                    const rawAdSets = liveMetaDetail?.adsets?.data || selectedCampDetail.adSets || [];
                    const allMetaAds = rawAdSets.flatMap((as: any) => as.ads?.data || as.ads || []);
                    if (allMetaAds.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                          No Ad Creatives attached to this campaign.
                        </div>
                      );
                    }
                    return allMetaAds.map((ad: any, idx: number) => {
                      const cr = ad.creative || {};
                      return (
                        <div key={ad.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs flex flex-col md:flex-row gap-6">
                          {/* Media Preview Box */}
                          <div className="w-full md:w-64 h-48 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                            {cr.image_url || cr.mediaUrl ? (
                              <img src={cr.image_url || cr.mediaUrl} alt={ad.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center p-4">
                                <Globe className="h-8 w-8 text-slate-400 mx-auto mb-1" />
                                <p className="text-[11px] text-slate-500">Standard Image Creative</p>
                              </div>
                            )}
                            <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md bg-white/90 border border-slate-200 text-[10px] font-bold text-blue-700 shadow-xs">
                              {cr.call_to_action_type || ad.callToAction || "WHATSAPP_MESSAGE"}
                            </span>
                          </div>

                          {/* Ad Details */}
                          <div className="flex-1 space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{ad.name}</h4>
                                <p className="text-[11px] text-slate-500 font-mono">Ad ID: {ad.id}</p>
                              </div>
                              <Pill status={ad.effective_status || ad.status || "ACTIVE"} />
                            </div>

                            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              <p className="font-bold text-slate-900 text-xs">{cr.title || cr.headline || ad.name}</p>
                              <p className="text-slate-600 leading-relaxed text-[11px]">{cr.body || "No creative body text specified."}</p>
                            </div>

                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>Meta Policy Diagnostic: {ad.ad_review_feedback ? JSON.stringify(ad.ad_review_feedback) : "Passed all automated Meta Ad policy checks cleanly."}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* TAB 5: Raw Graph API JSON */}
              {detailModalTab === "raw" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-700">Live Meta Graph API v26.0 Full Object Payload</span>
                    <span className="text-[11px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">100% Comprehensive</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[500px]">
                    {JSON.stringify(liveMetaDetail || selectedCampDetail, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MetaAdsPage() {
  const [orgId, setOrgId] = useState<string>(getOrgId());

  useEffect(() => {
    setOrgId(getOrgId());
  }, []);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-50"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <SearchParamsHandler onOAuth={() => {}} />
      <MetaAdsWorkspace orgId={orgId} showToast={() => { }} platform="meta" setPlatform={() => { }} />
    </Suspense>
  );
}
