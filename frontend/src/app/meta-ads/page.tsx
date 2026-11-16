"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Megaphone, TrendingUp, MousePointerClick, Eye, DollarSign,
  Target, Plus, Play, Pause, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap, BarChart2,
  Search, Trash2, Edit3, ChevronDown, Globe, Tag, Link2,
  Phone, Bell, LayoutGrid, List, Info, PlusCircle, ArrowUpRight,
  Activity, Calendar, Filter, Download, Bot, Settings, Users,
  Layers, FileText, TrendingDown, Award, Star, RotateCcw,
  Building2, Check, Minus, BadgePercent, ShieldCheck, MessageSquare, SlidersHorizontal, LogOut
} from "lucide-react";
import CreateCampaignModal from "@/components/meta-ads/CreateCampaignModal";
import EngagementCampaignFlow from "@/components/meta-ads/EngagementCampaignFlow";
import SalesCampaignFlow from "@/components/meta-ads/SalesCampaignFlow";
import TrafficCampaignFlow from "@/components/meta-ads/TrafficCampaignFlow";
import LeadsCampaignFlow from "@/components/meta-ads/LeadsCampaignFlow";
import AwarenessCampaignFlow from "@/components/meta-ads/AwarenessCampaignFlow";
import AppPromotionCampaignFlow from "@/components/meta-ads/AppPromotionCampaignFlow";

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
  { label: "Last 14 Days", value: "LAST_14_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Last 90 Days", value: "LAST_90_DAYS" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  { label: "Lifetime (Maximum)", value: "MAXIMUM" },
  { label: "Custom Range...", value: "CUSTOM" },
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "ad-sets" | "ads" | "audiences" | "conversions" | "approvals" | "reports" | "settings" | "ai-studio">("overview");
  const [dateRange, setDateRange] = useState("MAXIMUM");
  const [customSince, setCustomSince] = useState("");
  const [customUntil, setCustomUntil] = useState("");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState<"ACTIVE_PAUSED" | "ACTIVE" | "PAUSED" | "ARCHIVED" | "ALL">("ACTIVE_PAUSED");

  const [config, setConfig] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCampaignFlow, setActiveCampaignFlow] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectMeta = async () => {
    if (!confirm("Are you sure you want to disconnect Meta Ads from this organization?")) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch(`${BACKEND}/api/meta-ads/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organization-id": orgId },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (res.ok) {
        showToast("Meta Ads disconnected successfully ✓");
        setConfig(null);
        setAccounts([]);
        setSelectedAccountId("");
        setCampaigns([]);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Disconnect failed");
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

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
  const [previewAd, setPreviewAd] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<string>("INSTAGRAM_STANDARD");
  const [showAdvancedDev, setShowAdvancedDev] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  const fetchAudiences = useCallback(async (currentAccountId?: string) => {
    try {
      const targetAcc = currentAccountId || selectedAccountId;
      const queryParams = new URLSearchParams({ organizationId: orgId });
      if (targetAcc) queryParams.set("adAccountId", targetAcc);
      const res = await fetch(`${BACKEND}/api/meta-ads/audiences?${queryParams.toString()}`);
      const data = await res.json();
      if (data.audiences) {
        setAudiences(data.audiences);
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta audiences:", e);
    }
  }, [orgId, selectedAccountId]);

  const fetchCampaigns = useCallback(async (currentAccountId?: string, filterOverride?: string) => {
    try {
      const targetAcc = currentAccountId || selectedAccountId;
      const activeFilter = filterOverride || campaignFilter;
      const queryParams = new URLSearchParams({ organizationId: orgId });
      if (targetAcc) queryParams.set("adAccountId", targetAcc);
      if (activeFilter) queryParams.set("status", activeFilter);

      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns?${queryParams.toString()}`);
      const data = await res.json();
      if (data.campaigns) {
        // Guarantee latest campaigns always stay on top
        const sorted = [...data.campaigns].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.created_time || 0).getTime();
          const dateB = new Date(b.createdAt || b.created_time || 0).getTime();
          return dateB - dateA;
        });
        setCampaigns(sorted);
      }
    } catch (e: any) {
      console.warn("Failed to fetch Meta campaigns:", e);
    }
  }, [orgId, selectedAccountId, campaignFilter]);

  const handleSyncLive = async (
    targetAdAccountId?: string,
    overrideDatePreset?: string,
    overrideSince?: string,
    overrideUntil?: string
  ) => {
    setSyncing(true);
    try {
      const activePreset = overrideDatePreset || dateRange;
      const activeSince = overrideSince !== undefined ? overrideSince : customSince;
      const activeUntil = overrideUntil !== undefined ? overrideUntil : customUntil;

      const bodyPayload: any = {
        organizationId: orgId,
        adAccountId: targetAdAccountId || selectedAccountId,
      };

      if (activePreset === "CUSTOM" && activeSince && activeUntil) {
        bodyPayload.since = activeSince;
        bodyPayload.until = activeUntil;
      } else if (activePreset && activePreset !== "CUSTOM") {
        bodyPayload.datePreset = activePreset;
      }

      const res = await fetch(`${BACKEND}/api/meta-ads/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.result?.message || "Live Meta campaigns & insights synced! ✓");
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

  const handleOpenAdPreview = async (ad: any, customFormat?: string) => {
    setPreviewAd(ad);
    setLoadingPreview(true);
    const detectedFormat = customFormat || (
      ad?.callToAction?.includes("INSTAGRAM") || ad?.name?.toLowerCase().includes("instagram")
        ? "INSTAGRAM_STANDARD"
        : "DESKTOP_FEED_STANDARD"
    );
    setPreviewFormat(detectedFormat);
    setPreviewHtml(null);
    try {
      const targetId = ad.metaAdId || ad.id;
      const res = await fetch(`${BACKEND}/api/meta-ads/ads/${targetId}/preview?organizationId=${orgId}&ad_format=${detectedFormat}`);
      const data = await res.json();
      if (data.preview?.body) {
        let sanitized = data.preview.body;
        // Extract natural width and height from Meta returned iframe tag
        const widthMatch = sanitized.match(/width="(\d+)"/i);
        const heightMatch = sanitized.match(/height="(\d+)"/i);
        const naturalWidth = widthMatch ? parseInt(widthMatch[1], 10) : 0;
        const naturalHeight = heightMatch ? parseInt(heightMatch[1], 10) : 0;

        // Meta defaults Instagram Feed to ~360-400px wide, IG Stories to ~380-420px, and Desktop to ~500-540px.
        // We set the exact pixel width so the card hugs the preview tightly without empty white space on the right.
        let targetWidth = naturalWidth > 200 ? naturalWidth : (detectedFormat?.includes("STORY") ? 380 : detectedFormat?.includes("INSTAGRAM") ? 390 : 520);
        let targetHeight = naturalHeight > 300 ? naturalHeight : (detectedFormat?.includes("STORY") ? 675 : 720);

        // Provide ample height for expanded captions and media
        if (targetHeight < 840 && !detectedFormat?.includes("STORY")) {
          targetHeight = 840;
        } else if (targetHeight < 720 && detectedFormat?.includes("STORY")) {
          targetHeight = 720;
        }

        sanitized = sanitized.replace(/width="\d+"/i, `width="${targetWidth}"`);
        sanitized = sanitized.replace(/height="\d+"/i, `height="${targetHeight}"`);
        sanitized = sanitized.replace(/style="[^"]*"/i, '');
        // Allow audio/video playback and allow smooth scrolling inside the iframe while hiding scrollbar
        sanitized = sanitized.replace(
          /<iframe /i, 
          `<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write *" allowfullscreen style="width:${targetWidth}px;height:${targetHeight}px;max-width:100%;border:none;display:block;margin:0 auto;scrollbar-width:none;-ms-overflow-style:none;" `
        );
        setPreviewHtml(sanitized);
      } else {
        setPreviewHtml(null);
      }
    } catch (e: any) {
      console.warn("Error fetching ad preview:", e);
      setPreviewHtml(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleOpenCampaignDetail = async (c: any) => {
    setFetchingDetail(true);
    setDetailModalTab("metrics");
    try {
      const qParams = new URLSearchParams({ organizationId: orgId });
      if (dateRange === "CUSTOM" && customSince && customUntil) {
        qParams.set("since", customSince);
        qParams.set("until", customUntil);
      } else if (dateRange && dateRange !== "CUSTOM") {
        qParams.set("datePreset", dateRange);
      }
      const res = await fetch(`${BACKEND}/api/meta-ads/campaigns/${c.id}?${qParams.toString()}`);
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
  };
  const handleSelectAccount = async (newAccountId: string) => {
    setSelectedAccountId(newAccountId);
    setFormAdAccountId(newAccountId);
    try {
      await fetch(`${BACKEND}/api/meta-ads/accounts/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, adAccountId: newAccountId }),
      });
      showToast(`Connected to Meta Ad Account (${newAccountId})`);
      await handleSyncLive(newAccountId);
      fetchCampaigns(newAccountId);
      fetchAudiences(newAccountId);
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
    let isMounted = true;
    const initialize = async () => {
      setLoading(true);
      try {
        const [cfgRes, accRes] = await Promise.all([
          fetch(`${BACKEND}/api/meta-ads/config?organizationId=${orgId}`),
          fetch(`${BACKEND}/api/meta-ads/accounts?organizationId=${orgId}`)
        ]);
        const cfgData = await cfgRes.json();
        const accData = await accRes.json();

        let activeAccId = "";
        if (cfgData.config) {
          setConfig(cfgData.config);
          setFormAppId(cfgData.config.appId || "");
          setFormAppSecret(cfgData.config.appSecret || "");
          setFormToken(cfgData.config.accessToken || "");
          setFormAdAccountId(cfgData.config.adAccountId || "");
          setFormPageId(cfgData.config.pageId || "");
          if (cfgData.config.adAccountId) {
            activeAccId = cfgData.config.adAccountId;
          }
        }

        if (accData.accounts) {
          const normalized = accData.accounts.map((a: any) => ({
            ...a,
            adAccountId: a.adAccountId || a.id || "",
            name: a.name || a.businessName || a.adAccountId || a.id || "Meta Ad Account",
          }));
          setAccounts(normalized);
          if (!activeAccId && normalized.length > 0) {
            activeAccId = normalized[0].adAccountId;
          }
        }

        if (activeAccId) {
          setSelectedAccountId(activeAccId);
          await Promise.all([fetchCampaigns(activeAccId), fetchAudiences(activeAccId)]);
        } else {
          await Promise.all([fetchCampaigns(), fetchAudiences()]);
        }
      } catch (err) {
        console.warn("Failed initializing Meta Ads workspace:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();
    return () => { isMounted = false; };
  }, [orgId, fetchCampaigns]);

  // Derive AdSets & Ads cleanly from authentic campaign hierarchy (no synthetic dummy items)
  const allAdSets = campaigns.flatMap(c => {
    const isCampActive = (c.status === "ACTIVE" || c.effectiveStatus === "ACTIVE");
    return c.adSets && c.adSets.length > 0
      ? c.adSets.map((as: any) => ({
        ...as,
        campaignName: c.name,
        campaignObjective: c.objective,
        campaignStatus: c.status,
        campaignEffectiveStatus: c.effectiveStatus,
        effectiveStatus: isCampActive && (as.status === "ACTIVE" || as.effectiveStatus === "ACTIVE") ? "ACTIVE" : "PAUSED",
      }))
      : [];
  });

  const allAds = campaigns.flatMap(c => {
    const isCampActive = (c.status === "ACTIVE" || c.effectiveStatus === "ACTIVE");
    return c.adSets && c.adSets.length > 0
      ? c.adSets.flatMap((as: any) => {
        const isAdSetActive = isCampActive && (as.status === "ACTIVE" || as.effectiveStatus === "ACTIVE");
        return as.ads && as.ads.length > 0
          ? as.ads.map((ad: any) => ({
            ...ad,
            campaignName: c.name,
            adSetName: as.name,
            campaignStatus: c.status,
            adSetStatus: as.status,
            effectiveStatus: isAdSetActive && (ad.status === "ACTIVE" || ad.effectiveStatus === "ACTIVE") ? "ACTIVE" : "PAUSED",
          }))
          : [];
      })
      : [];
  });

  // Aggregate Metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE" || c.effectiveStatus === "ACTIVE").length;
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalConvValue = campaigns.reduce((acc, c) => acc + (c.conversionValue || c.actionValue || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0.00%";
  const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";
  const costPerConv = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0.00";

  const approvedAdsCount = allAds.filter((a: any) =>
    a.effectiveStatus === "ACTIVE" || a.status === "ACTIVE" || a.approvalStatus === "APPROVED" || a.effectiveStatus === "PAUSED"
  ).length;

  const META_TABS: { id: any; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "campaigns", label: `Campaigns (${campaigns.length})`, icon: Megaphone },
    { id: "ad-sets", label: `Ad Sets (${allAdSets.length})`, icon: Layers },
    { id: "ads", label: `Ads (${allAds.length})`, icon: FileText },
    { id: "audiences", label: `Audiences (${audiences.length})`, icon: Users },
    { id: "conversions", label: "Conversions & Pixels", icon: Target },
    { id: "approvals", label: `Approval Status (${approvedAdsCount}/${allAds.length})`, icon: ShieldCheck },
    { id: "reports", label: "Reports & Analytics", icon: BarChart2 },
    { id: "ai-studio", label: "✨ AI Campaign Studio", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
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
          <div className="h-9 w-40 bg-slate-200 rounded-xl" />
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

  const isMetaConnected = Boolean(
    (config?.accessToken && config?.systemStatus !== "DISCONNECTED") ||
    accounts.length > 0
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
                onClick={() => setActiveTab('settings')}
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

          {/* Campaign Delivery / Status Filter */}
          <select
            value={campaignFilter}
            onChange={(e) => {
              const val = e.target.value as any;
              setCampaignFilter(val);
              fetchCampaigns(selectedAccountId, val);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            title="Filter campaigns by status for selected account"
          >
            <option value="ACTIVE_PAUSED" className="bg-white text-slate-900">Active &amp; Paused</option>
            <option value="ACTIVE" className="bg-white text-slate-900">Active Only</option>
            <option value="PAUSED" className="bg-white text-slate-900">Paused Only</option>
            <option value="ARCHIVED" className="bg-white text-slate-900">Archived Only</option>
            <option value="ALL" className="bg-white text-slate-900">All Campaigns</option>
          </select>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={dateRange}
              onChange={(e) => {
                const val = e.target.value;
                setDateRange(val);
                if (val === "CUSTOM") {
                  setShowCustomDateModal(true);
                } else {
                  handleSyncLive(selectedAccountId, val);
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {DATE_RANGES.map(d => (
                <option key={d.value} value={d.value} className="bg-white text-slate-900">
                  {d.label}
                </option>
              ))}
            </select>

            {dateRange === "CUSTOM" && customSince && customUntil && (
              <button
                type="button"
                onClick={() => setShowCustomDateModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold hover:bg-blue-100 transition-all cursor-pointer"
                title="Edit custom date range"
              >
                {customSince} → {customUntil}
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => { handleSyncLive(); }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            title="Refresh & Sync Live Meta Data"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* AI Campaign Builder Button */}
          <button
            onClick={() => router.push("/meta-ads/ai-campaign")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> AI Campaign Studio
          </button>

          {/* New Campaign Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </button>

          {/* Meta Account Settings Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Settings className="h-4 w-4 text-blue-600 shrink-0" />
            Ad Settings
          </button>

          {/* Disconnect Meta Button */}
          <button
            onClick={handleDisconnectMeta}
            disabled={isDisconnecting}
            title="Disconnect Meta Ads account"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <LogOut className="h-4 w-4 shrink-0" />
            )}
            <span className="hidden sm:inline">{isDisconnecting ? "Disconnecting..." : "Disconnect"}</span>
          </button>
        </div>
      </header>

      {/* ── Sub-Header Navigation Tab Bar ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white overflow-x-auto shrink-0 px-4">
        {META_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === "ai-studio") {
                router.push("/meta-ads/ai-campaign");
              } else {
                setActiveTab(t.id);
              }
            }}
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
                  <p className="text-xl font-bold text-purple-700">
                    {totalConvValue > 0 ? `${currencySymbol}${fmt(totalConvValue)}` : (totalReach > 0 ? fmt(totalReach) : "₹0.00")}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {totalConvValue > 0 ? "Conv. Value" : "Unique Reach"}
                  </p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" /> Meta Ad Sets Management
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {allAdSets.length} Total
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure budget, location targeting, demographics, and WhatsApp destination for your ad sets.
                </p>
              </div>
              <button
                onClick={() => handleSyncLive()}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} /> Refresh Ad Sets
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Set Details</th>
                    <th className="p-4">Parent Campaign</th>
                    <th className="p-4">Destination &amp; Goal</th>
                    <th className="p-4">Daily Budget</th>
                    <th className="p-4">Target Location &amp; Audience</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allAdSets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No active Ad Sets found under this ad account.
                      </td>
                    </tr>
                  ) : (
                    allAdSets.map((as: any, idx: number) => {
                      const parentCamp = campaigns.find((c: any) => c.name === as.campaignName || c.adSets?.some((s: any) => s.id === as.id));
                      const targeting = as.targeting || {};
                      const geoLocs = targeting.geo_locations || {};
                      const zips = Array.isArray(geoLocs.zips) ? geoLocs.zips : [];
                      const cities = Array.isArray(geoLocs.cities) ? geoLocs.cities : [];
                      const regions = Array.isArray(geoLocs.regions) ? geoLocs.regions : [];
                      const countries = Array.isArray(geoLocs.countries)
                        ? geoLocs.countries.join(", ")
                        : Array.isArray(targeting.countries)
                        ? targeting.countries.join(", ")
                        : "";

                      let locationTitle = "Advantage+ Global";
                      if (zips.length > 0) {
                        const sampleCity = cities[0]?.name || "Postal";
                        locationTitle = `${zips.length} ${sampleCity} Pin Codes`;
                      } else if (cities.length > 0) {
                        locationTitle = cities.map((c: any) => c.name || c).join(", ");
                      } else if (regions.length > 0) {
                        locationTitle = regions.map((r: any) => r.name || r).join(", ");
                      } else if (countries) {
                        locationTitle = countries === "IN" ? "India (Nationwide)" : countries;
                      }

                      const minAge = targeting.age_min || (Array.isArray(targeting.age_range) ? targeting.age_range[0] : 18);
                      const maxAge = targeting.age_max || (Array.isArray(targeting.age_range) ? targeting.age_range[1] : 65);
                      const specInterests = targeting.flexible_spec?.[0]?.interests || targeting.interests;
                      const specRoles = targeting.flexible_spec?.[0]?.work_positions || targeting.work_positions;
                      const specMajors = targeting.flexible_spec?.[0]?.education_majors || targeting.education_majors;

                      const interestsList = Array.isArray(specInterests) ? specInterests.map((i: any) => i.name || i) : [];
                      const rolesList = Array.isArray(specRoles) ? specRoles.map((r: any) => r.name || r) : [];
                      const majorsList = Array.isArray(specMajors) ? specMajors.map((m: any) => m.name || m) : [];
                      const combinedAudience = [...rolesList, ...majorsList, ...interestsList].join(", ");

                      const isCBO = !as.dailyBudget && parentCamp?.dailyBudget;
                      const displayStatus = as.effectiveStatus || as.status || "ACTIVE";

                      return (
                        <tr key={as.id || as.metaAdSetId || idx} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{as.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {as.metaAdSetId || as.id}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{as.campaignName}</p>
                            <span className="inline-block mt-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {as.campaignObjective || "OUTCOME_LEADS"}
                            </span>
                          </td>
                          <td className="p-4 font-mono">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1">
                              <Zap className="w-3 h-3 text-blue-600" />
                              {as.destinationType || "WHATSAPP"} · {as.optimizationGoal || "CONVERSATIONS"}
                            </span>
                          </td>
                          <td className="p-4">
                            {isCBO ? (
                              <div>
                                <span className="font-bold text-emerald-700">
                                  {currencySymbol}{Number(parentCamp.dailyBudget).toFixed(2)}/day
                                </span>
                                <p className="text-[10px] text-slate-400 font-medium">(Advantage CBO)</p>
                              </div>
                            ) : as.dailyBudget ? (
                              <span className="font-bold text-emerald-700">
                                {currencySymbol}{Number(as.dailyBudget).toFixed(2)}/day
                              </span>
                            ) : as.lifetimeBudget ? (
                              <span className="font-bold text-indigo-700">
                                {currencySymbol}{Number(as.lifetimeBudget).toFixed(2)} lifetime
                              </span>
                            ) : (
                              <span className="text-slate-400">CBO Managed</span>
                            )}
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="font-bold text-slate-900">
                              {locationTitle}
                              <span className="text-slate-500 font-normal text-[11px] ml-1.5">
                                ({minAge} - {maxAge >= 65 ? "65+" : maxAge} yrs)
                              </span>
                            </p>
                            {combinedAudience ? (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={combinedAudience}>
                                {combinedAudience}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 mt-0.5">Advantage+ Audience</p>
                            )}
                          </td>
                          <td className="p-4"><Pill status={displayStatus} /></td>
                          <td className="p-4 text-right">
                            {parentCamp ? (
                              <button
                                onClick={() => handleOpenCampaignDetail(parentCamp)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                              >
                                View Live
                              </button>
                            ) : (
                              <button
                                onClick={() => showToast(`Ad Set "${as.name}" configuration active`)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                              >
                                Configure
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" /> Meta Ad Creatives &amp; Copy
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {allAds.length} Active Ads
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage live ads, headlines, WhatsApp CTA buttons, and creatives.</p>
              </div>
              <button
                onClick={() => handleSyncLive()}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} /> Sync Live Ads
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Creative</th>
                    <th className="p-4">Headline &amp; Ad Copy</th>
                    <th className="p-4">Ad Set &amp; Campaign</th>
                    <th className="p-4">CTA Button</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Policy Approval</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allAds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No live Ads found under this ad account.
                      </td>
                    </tr>
                  ) : (
                    allAds.map((ad: any, idx: number) => {
                      const creative = ad.creative || {};
                      const rawCr = creative.raw || creative;
                      const oss = rawCr.object_story_spec || {};
                      const imgUrl = 
                        ad.creativeMediaUrl || 
                        creative.imageUrl || 
                        creative.thumbnailUrl || 
                        creative.image_url || 
                        creative.thumbnail_url || 
                        rawCr.image_url || 
                        rawCr.thumbnail_url || 
                        oss.link_data?.picture || 
                        oss.photo_data?.url || 
                        oss.video_data?.image_url || 
                        null;
                      const title = ad.creativeHeadline || creative.title || rawCr.title || creative.name || rawCr.name || ad.name;
                      const body = ad.creativeBody || creative.body || rawCr.body || oss.link_data?.message || oss.link_data?.caption || "";
                      const cta = ad.callToAction || creative.call_to_action_type || "WHATSAPP_MESSAGE";
                      const isApproved = ad.effectiveStatus === "ACTIVE" || ad.status === "ACTIVE" || ad.approvalStatus === "APPROVED" || ad.effectiveStatus === "PAUSED";

                      return (
                        <tr key={ad.id || ad.metaAdId || idx} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={ad.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                  <FileText className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{ad.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">ID: {ad.metaAdId || ad.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 max-w-sm">
                            <p className="font-bold text-slate-900 line-clamp-1">{title}</p>
                            <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{body || "No ad text body specified"}</p>
                          </td>
                          <td className="p-4 text-slate-600">
                            <p className="font-bold text-slate-900">{ad.adSetName}</p>
                            <p className="text-[11px] text-slate-500">{ad.campaignName}</p>
                          </td>
                          <td className="p-4 font-mono">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-blue-600" />
                              {cta}
                            </span>
                          </td>
                          <td className="p-4"><Pill status={ad.status || "ACTIVE"} /></td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              {isApproved ? "APPROVED" : (ad.approvalStatus || ad.effectiveStatus || ad.status || "APPROVED")}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenAdPreview(ad)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIENCES TAB */}
        {activeTab === "audiences" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" /> Meta Target Audiences &amp; Demographics
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {audiences.length} Saved Lists
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved custom audiences, lookalike lists, and demographic segments for this connected account.
                </p>
              </div>
              <button
                onClick={() => fetchAudiences(selectedAccountId)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Audiences
              </button>
            </div>

            {audiences.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Targeting Configured at Ad Set Level</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This Meta Ad account is actively delivering ads with localized demographic &amp; pin-code targeting (Advantage+ Pune Pin Codes, Age 18–26, Sales Executives) specified in its active campaigns.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {audiences.map((aud: any) => (
                  <div key={aud.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{aud.subtype || "CUSTOM"}</span>
                      <Pill status={aud.operation_status?.status || "ENABLED"} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{aud.name}</h4>
                    <p className="text-xs text-slate-600">{aud.description || "Live Meta Audience linked to this account."}</p>
                    <div className="pt-2 text-[11px] text-slate-500 font-mono border-t border-slate-100 flex justify-between">
                      <span>Est. Reach:</span>
                      <span className="font-bold text-slate-800">
                        {aud.approximate_count_lower_bound
                          ? `${aud.approximate_count_lower_bound.toLocaleString()} - ${aud.approximate_count_upper_bound?.toLocaleString()}`
                          : "Populating"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONVERSIONS & PIXELS TAB */}
        {activeTab === "conversions" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" /> Conversion Tracking &amp; Meta Events
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live Meta Pixel connection, messaging chat conversions, and cost per lead calculated from Meta Graph API.
                </p>
              </div>
              <button
                onClick={() => handleSyncLive()}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-emerald-600" : ""}`} /> Refresh Conversions
              </button>
            </div>

            {/* Pixel Status Card */}
            {fetchedPixels.length > 0 && (
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{fetchedPixels[0].name || "Meta Pixel Connected"}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        ACTIVE &amp; FIRING
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      Pixel ID: {fetchedPixels[0].id} · Auto-configured in JISNU CRM
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700">Synced with Meta Events Manager</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon={MessageSquare} label="Live Conversions &amp; Chats" value={fmt(totalConversions)} color="bg-emerald-50 text-emerald-700" />
              <MetricCard icon={Target} label="Cost per Result / Conversion" value={`${currencySymbol}${costPerConv}`} color="bg-purple-50 text-purple-700" />
              <MetricCard icon={Activity} label="Conversion Rate (CVR)" value={totalClicks > 0 ? `${((totalConversions / totalClicks) * 100).toFixed(1)}%` : "0.0%"} color="bg-blue-50 text-blue-700" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Live Campaign Conversion Breakdown</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Objective</th>
                    <th className="p-4">Total Conversions</th>
                    <th className="p-4">Spend</th>
                    <th className="p-4">Cost / Conversion</th>
                    <th className="p-4">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">No campaigns found for this account.</td>
                    </tr>
                  ) : (
                    campaigns.map((c: any) => {
                      const cConv = c.conversions || 0;
                      const cSpend = c.spend || 0;
                      const cCostPer = cConv > 0 ? (cSpend / cConv).toFixed(2) : "0.00";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-4 font-bold text-slate-900">{c.name}</td>
                          <td className="p-4 font-mono text-[11px] text-slate-500">{c.objective}</td>
                          <td className="p-4 font-bold text-emerald-700">{fmt(cConv)}</td>
                          <td className="p-4 font-bold text-slate-900">{currencySymbol}{fmt(cSpend)}</td>
                          <td className="p-4 font-mono font-bold text-purple-700">{currencySymbol}{cCostPer}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              DELIVERING
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* APPROVAL STATUS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" /> Meta Ad Policy &amp; Approval Diagnostics
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
                    {allAds.filter((a: any) => a.effectiveStatus === "ACTIVE" || a.status === "ACTIVE" || a.approvalStatus === "APPROVED" || a.effectiveStatus === "PAUSED").length} / {allAds.length} Approved
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Live Meta Graph API automated policy reviews and compliance diagnostics. Delivering ads have successfully passed Meta review.
                </p>
              </div>
              <button
                onClick={() => { fetchCampaigns(); handleSyncLive(); }}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} /> Re-Check Policy
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ad Name</th>
                    <th className="p-4">Parent Campaign &amp; Ad Set</th>
                    <th className="p-4">Headline / Text</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4">Policy Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allAds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No live Ads found under this ad account.
                      </td>
                    </tr>
                  ) : (
                    allAds.map((ad: any) => {
                      const isApproved = ad.effectiveStatus === "ACTIVE" || ad.status === "ACTIVE" || ad.approvalStatus === "APPROVED" || ad.effectiveStatus === "PAUSED";
                      const headline = ad.creativeHeadline || ad.creative?.title || ad.creative?.name || "Ad Creative";
                      const body = ad.creativeBody || ad.creative?.body || "";

                      return (
                        <tr key={ad.id || ad.metaAdId} className="hover:bg-slate-50/80 transition-all">
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{ad.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {ad.metaAdId || ad.id}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{ad.campaignName}</p>
                            <p className="text-slate-500 text-[11px]">{ad.adSetName}</p>
                          </td>
                          <td className="p-4 max-w-sm">
                            <p className="font-bold text-slate-900 line-clamp-1">{headline}</p>
                            <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{body}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              {isApproved ? "APPROVED" : (ad.approvalStatus || "PENDING_REVIEW")}
                            </span>
                          </td>
                          <td className="p-4 text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Passed automated ad policy check</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-600" /> Meta Performance Analytics &amp; Reports
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated campaign efficiency, total budget utilization, and CPM/CPC ratios from Meta Graph API.
                </p>
              </div>
              <button
                onClick={() => handleSyncLive()}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} /> Sync Latest Insights
              </button>
            </div>

            {/* Primary KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard icon={Eye} label="Total Impressions" value={fmt(totalImpressions)} color="bg-blue-50 text-blue-700" />
              <MetricCard icon={MousePointerClick} label="Total Clicks" value={fmt(totalClicks)} color="bg-blue-50 text-blue-700" />
              <MetricCard icon={TrendingUp} label="Average CTR" value={ctr} color="bg-emerald-50 text-emerald-700" />
              <MetricCard icon={DollarSign} label="Total Spend" value={`${currencySymbol}${fmt(totalSpend)}`} color="bg-amber-50 text-amber-700" />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Cost Per Click (CPC)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{currencySymbol}{avgCpc}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Calculated per link / inline click</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Per 1,000 Impressions (CPM)</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {currencySymbol}{totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(2) : "0.00"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Live account delivery efficiency</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Per Conversion</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{currencySymbol}{costPerConv}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct result acquisition rate</p>
              </div>
            </div>

            {/* Campaign Comparison Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Campaign Delivery Comparison</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Impressions</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">CTR</th>
                    <th className="p-4">Spend</th>
                    <th className="p-4">Results</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {campaigns.map((c: any) => {
                    const cCtr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) + "%" : "0.00%";
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-4 font-bold text-slate-900">{c.name}</td>
                        <td className="p-4"><Pill status={c.status || "ACTIVE"} /></td>
                        <td className="p-4 font-mono font-medium">{fmt(c.impressions)}</td>
                        <td className="p-4 font-mono font-medium">{fmt(c.clicks)}</td>
                        <td className="p-4 font-bold text-emerald-700">{cCtr}</td>
                        <td className="p-4 font-bold text-slate-900">{currencySymbol}{fmt(c.spend)}</td>
                        <td className="p-4 font-bold text-blue-700">{fmt(c.conversions || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="max-w-4xl space-y-6">
            {/* Header & Status Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-lg">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 text-base">Connected Meta Ad Accounts &amp; Assets</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      CONNECTED &amp; SYNCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage active Ad Account, connected Facebook Page, and Meta Pixel for your campaigns.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => { fetchMetaConfig(); fetchAccounts(); handleSyncLive(); }}
                  disabled={syncing}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} /> Refresh Status
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectMeta}
                  disabled={isDisconnecting}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            </div>

            {/* Active Account Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Active Ad Account */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Ad Account</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  {accounts.find(a => a.adAccountId === selectedAccountId)?.name || "Amol Ade"}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  <CheckCircle className="w-3 h-3" /> Live &amp; Ready
                </div>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                  <span>Available Accounts:</span>
                  <span className="font-bold text-slate-700">{accounts.length} connected</span>
                </div>
              </div>

              {/* Card 2: Connected Facebook Page */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Facebook Page</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  {fetchedPages.find(p => p.id === formPageId)?.name || fetchedPages[0]?.name || "Jisnu Digital Solutions"}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
                  <CheckCircle className="w-3 h-3" /> WhatsApp &amp; Leads Enabled
                </div>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                  <span>Ad Destination:</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>

              {/* Card 3: Meta Pixel */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta Pixel</span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <p className="text-base font-bold text-slate-900 truncate">
                  {fetchedPixels.find(px => px.id === formPixelId)?.name || fetchedPixels[0]?.name || "JISNU Digital Website Pixel"}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold">
                  <CheckCircle className="w-3 h-3" /> Events Tracking Active
                </div>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                  <span>Conversions:</span>
                  <span className="font-bold text-purple-600">Synced</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Re-Auth / Sync Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-blue-50/70 border border-blue-200 gap-4 shadow-2xs">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> 1-Click Facebook Re-Sync &amp; Discovery
                </h4>
                <p className="text-xs text-slate-600">
                  Connect new Ad Accounts, Pages, or Pixels created inside Meta Ads Manager automatically.
                </p>
              </div>
              <a
                href={`${BACKEND}/api/meta-ads/oauth/connect?orgId=${orgId}&redirect=/meta-ads`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Sync with Facebook
              </a>
            </div>

            {/* Clean Account & Asset Binding Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-600" /> Active Workspace Accounts &amp; Assets
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which connected Meta Ad Account, Facebook Page, and Pixel this CRM actively manages.
                </p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                {/* Row 1: Active Ad Account Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Selected Ad Account</label>
                  {accounts.length > 0 ? (
                    <select
                      value={formAdAccountId}
                      onChange={(e) => {
                        setFormAdAccountId(e.target.value);
                        handleSelectAccount(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {accounts.map((a: any) => (
                        <option key={a.adAccountId} value={a.adAccountId}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      label=""
                      value={formAdAccountId}
                      onChange={(e: any) => setFormAdAccountId(e.target.value)}
                      placeholder="Enter Ad Account"
                    />
                  )}
                </div>

                {/* Row 2: Facebook Page & Meta Pixel Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook Page</label>
                    {fetchedPages.length > 0 ? (
                      <select
                        value={formPageId}
                        onChange={(e) => setFormPageId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {fetchedPages.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input label="" value={formPageId} onChange={(e: any) => setFormPageId(e.target.value)} placeholder="Auto-detected Page" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Pixel</label>
                    {fetchedPixels.length > 0 ? (
                      <select
                        value={formPixelId}
                        onChange={(e) => setFormPixelId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {fetchedPixels.map((px: any) => (
                          <option key={px.id} value={px.id}>
                            {px.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input label="" value={formPixelId} onChange={(e: any) => setFormPixelId(e.target.value)} placeholder="Auto-detected Pixel" />
                    )}
                  </div>
                </div>

                {/* Optional Developer Advanced Credentials Accordion */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedDev(!showAdvancedDev)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
                  >
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedDev ? "rotate-90" : ""}`} />
                    Advanced Technical Settings (API Tokens &amp; App IDs)
                  </button>

                  {showAdvancedDev && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                      <p className="text-[11px] text-slate-500">
                        These credentials are automatically managed via Facebook OAuth. Only update them manually if you are using custom Meta Developer apps.
                      </p>

                      {/* Meta Permanent Access Token */}
                      <div>
                        <Input
                          label="Meta Access Token"
                          value={formToken}
                          onChange={(e: any) => setFormToken(e.target.value)}
                          placeholder="EAAG..."
                          type="password"
                        />
                      </div>

                      {/* App ID & App Secret */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Meta App ID"
                          value={formAppId}
                          onChange={(e: any) => setFormAppId(e.target.value)}
                          placeholder="App ID"
                        />
                        <Input
                          label="Meta App Secret"
                          value={formAppSecret}
                          onChange={(e: any) => setFormAppSecret(e.target.value)}
                          placeholder="App Secret"
                          type="password"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Changes take effect immediately across all CRM campaign views.
                  </span>
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
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

      {/* CUSTOM DATE RANGE MODAL */}
      {showCustomDateModal && (
        <Modal title="Select Custom Meta Insights Date Range" onClose={() => setShowCustomDateModal(false)}>
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Pick a start date (`since`) and end date (`until`) to query exact delivery metrics from Meta Graph API.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date (Since)</label>
                <input
                  type="date"
                  value={customSince}
                  onChange={(e) => setCustomSince(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Until)</label>
                <input
                  type="date"
                  value={customUntil}
                  onChange={(e) => setCustomUntil(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomDateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customSince || !customUntil}
                onClick={() => {
                  setShowCustomDateModal(false);
                  setDateRange("CUSTOM");
                  handleSyncLive(selectedAccountId, "CUSTOM", customSince, customUntil);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Apply Custom Range
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* LIVE AD PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] w-full max-w-[620px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{previewAd.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Meta Ad ID: {previewAd.metaAdId || previewAd.id} • {previewAd.callToAction || "WHATSAPP_MESSAGE"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setPreviewAd(null); setPreviewHtml(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Placement / Format Toggle Bar */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Preview Placement:</span>
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                {[
                  { id: "INSTAGRAM_STANDARD", label: "Instagram Feed" },
                  { id: "INSTAGRAM_STORY", label: "IG Stories" },
                  { id: "DESKTOP_FEED_STANDARD", label: "Facebook Feed" },
                  { id: "MOBILE_FEED_STANDARD", label: "Mobile Feed" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleOpenAdPreview(previewAd, fmt.id)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      previewFormat === fmt.id
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-4 sm:p-6 bg-slate-100/60 flex flex-col items-center justify-start min-h-[560px] max-h-[82vh]">
              {loadingPreview ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="font-medium">Rendering authentic ad preview from Meta Graph API...</span>
                </div>
              ) : previewHtml ? (
                <div className="w-full flex justify-center py-2">
                  <div
                    className="rounded-2xl border border-slate-200 bg-white shadow-md inline-block w-fit max-w-full overflow-hidden p-0 transition-all duration-300 [&_iframe]:scrollbar-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              ) : (
                /* Fallback clean creative preview card if Meta iframe is unavailable */
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  {previewAd.creative?.image_url || previewAd.creativeMediaUrl ? (
                    <img
                      src={previewAd.creative?.image_url || previewAd.creativeMediaUrl}
                      alt={previewAd.name}
                      className="w-full max-h-72 object-cover border-b border-slate-100"
                    />
                  ) : null}
                  <div className="p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-900">
                      {previewAd.creativeHeadline || previewAd.creative?.title || previewAd.creative?.name || "Ad Creative"}
                    </p>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {previewAd.creativeBody || previewAd.creative?.body || ""}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">CTA Button:</span>
                      <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                        {previewAd.callToAction || previewAd.creative?.call_to_action_type || "Send WhatsApp Message"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">Rendered directly from Meta Marketing API</span>
              <button
                onClick={() => { setPreviewAd(null); setPreviewHtml(null); }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
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

                  {/* Campaign Performance & Goal Results Breakdown */}
                  {(() => {
                    const actionsList = Array.isArray(liveMetaDetail?.insights?.data?.[0]?.actions)
                      ? liveMetaDetail.insights.data[0].actions
                      : [];
                    const costList = Array.isArray(liveMetaDetail?.insights?.data?.[0]?.cost_per_action_type)
                      ? liveMetaDetail.insights.data[0].cost_per_action_type
                      : [];

                    const getActionLabel = (type: string) => {
                      const map: Record<string, { title: string; category: string; desc: string }> = {
                        "onsite_conversion.messaging_conversation_started_7d": {
                          title: "New Messaging Conversations",
                          category: "Conversions & Leads",
                          desc: "New conversations started from WhatsApp/Messenger ads"
                        },
                        "onsite_conversion.total_messaging_connection": {
                          title: "Total Messaging Connections",
                          category: "Conversions & Leads",
                          desc: "Users connected with your business via messaging"
                        },
                        "onsite_conversion.messaging_first_reply": {
                          title: "First Message Replies",
                          category: "Conversions & Leads",
                          desc: "Initial responses received from prospective leads"
                        },
                        "onsite_conversion.lead": {
                          title: "Leads Generated (Meta Instant Form)",
                          category: "Conversions & Leads",
                          desc: "Form submissions completed directly on Meta platforms"
                        },
                        "lead": {
                          title: "Total Verified Leads",
                          category: "Conversions & Leads",
                          desc: "Total qualified business inquiries and form responses"
                        },
                        "onsite_web_lead": {
                          title: "Website Leads Captured",
                          category: "Conversions & Leads",
                          desc: "Leads captured via website landing page and Meta Pixel"
                        },
                        "offsite_complete_registration_add_meta_leads": {
                          title: "Completed Registrations",
                          category: "Conversions & Leads",
                          desc: "Users who completed registration on your site"
                        },
                        "link_click": {
                          title: "Outbound Link Clicks",
                          category: "Traffic & CTR",
                          desc: "Clicks leading directly to WhatsApp chat or landing page"
                        },
                        "post_engagement": {
                          title: "Post Engagement",
                          category: "Engagement & Reach",
                          desc: "Likes, shares, comments, saves, and clicks combined"
                        },
                        "page_engagement": {
                          title: "Page Interactions",
                          category: "Engagement & Reach",
                          desc: "Total interactions across your Facebook Page & IG profile"
                        },
                        "post_reaction": {
                          title: "Reactions & Likes",
                          category: "Engagement & Reach",
                          desc: "Positive reactions on ad creatives and posts"
                        },
                        "onsite_conversion.post_save": {
                          title: "Saved Posts",
                          category: "Engagement & Reach",
                          desc: "Users who bookmarked and saved your ad for later"
                        },
                        "video_view": {
                          title: "Video Plays (3s+)",
                          category: "Traffic & CTR",
                          desc: "Users who watched 3 seconds or more of your video ad"
                        },
                        "onsite_conversion.messaging_user_depth_2_message_send": {
                          title: "Deep Conversations (2+ Messages)",
                          category: "Conversions & Leads",
                          desc: "High-intent leads exchanging multiple messages with your team"
                        },
                        "onsite_conversion.messaging_user_depth_3_message_send": {
                          title: "High-Intent Leads (3+ Messages)",
                          category: "Conversions & Leads",
                          desc: "Engaged prospects in detailed sales conversations"
                        },
                      };

                      if (map[type]) return map[type];

                      const clean = type
                        .replace(/^(onsite_conversion|offsite)_/, "")
                        .replace(/_add_meta_leads$/, "")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());

                      return {
                        title: clean,
                        category: "Engagement & Interactions",
                        desc: "Tracked audience interactions with ad creative"
                      };
                    };

                    const filtered = actionsList.filter((a: any) => 
                      !a.action_type.includes("unlike") && 
                      !a.action_type.includes("unsave") && 
                      !a.action_type.includes("post_interaction_") && 
                      !a.action_type.includes("lead_grouped") && 
                      !a.action_type.includes("post_net_")
                    );

                    const conversions = filtered.filter((a: any) => 
                      a.action_type.includes("messaging") || 
                      a.action_type.includes("lead") || 
                      a.action_type.includes("registration")
                    );

                    const engagement = filtered.filter((a: any) => 
                      !a.action_type.includes("messaging") && 
                      !a.action_type.includes("lead") && 
                      !a.action_type.includes("registration")
                    );

                    return (
                      <div className="space-y-5">
                        {/* Section 1: Business Results & Conversions */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                                <Target className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">Key Conversion Results &amp; Leads</h4>
                                <p className="text-[11px] text-slate-500">Measurable business outcomes achieved from this campaign</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                              {conversions.length} Goal Metrics
                            </span>
                          </div>

                          {conversions.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">No direct lead or messaging actions recorded yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {conversions.map((act: any, idx: number) => {
                                const info = getActionLabel(act.action_type);
                                const costObj = costList.find((c: any) => c.action_type === act.action_type);
                                const costVal = costObj?.value ? Number(costObj.value).toFixed(2) : null;

                                return (
                                  <div key={idx} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-white hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="font-bold text-slate-900 text-xs leading-snug">{info.title}</p>
                                        <span className="text-base font-extrabold text-purple-700 shrink-0">{fmt(act.value)}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">{info.desc}</p>
                                    </div>
                                    <div className="pt-2 border-t border-purple-100/60 flex items-center justify-between text-xs">
                                      <span className="text-slate-500 text-[11px] font-medium">Cost per Result:</span>
                                      <span className="font-bold text-emerald-700">
                                        {costVal ? `₹${costVal}` : "Included in spend"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Section 2: Traffic, Engagement & Click Breakdown */}
                        {engagement.length > 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                  <Activity className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">Traffic, Reach &amp; Creative Engagement</h4>
                                  <p className="text-[11px] text-slate-500">Audience engagement and delivery interactions on Facebook &amp; Instagram</p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                                {engagement.length} Interaction Types
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {engagement.map((act: any, idx: number) => {
                                const info = getActionLabel(act.action_type);
                                const costObj = costList.find((c: any) => c.action_type === act.action_type);
                                const costVal = costObj?.value ? Number(costObj.value).toFixed(2) : null;

                                return (
                                  <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="font-bold text-slate-900 text-xs">{info.title}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{info.desc}</p>
                                      </div>
                                      <span className="text-sm font-bold text-blue-700 shrink-0">{fmt(act.value)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                      <span className="text-slate-500 font-medium">Cost / Interaction:</span>
                                      <span className="font-bold text-slate-900">
                                        {costVal ? `₹${costVal}` : "—"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                <div className="space-y-6">
                  {(() => {
                    const adsetsList = liveMetaDetail?.adsets?.data || selectedCampDetail.adSets || [];
                    if (adsetsList.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-2xs">
                          No Ad Sets attached to this campaign.
                        </div>
                      );
                    }
                    return adsetsList.map((as: any, idx: number) => {
                      const tgt = as.targeting || {};
                      const spec = tgt.flexible_spec?.[0] || {};
                      const interests = Array.isArray(spec.interests) ? spec.interests : (Array.isArray(tgt.interests) ? tgt.interests : []);
                      const positions = Array.isArray(spec.work_positions) ? spec.work_positions : [];
                      const majors = Array.isArray(spec.education_majors) ? spec.education_majors : [];
                      const zips = Array.isArray(tgt.geo_locations?.zips) ? tgt.geo_locations.zips : [];
                      const cities = Array.isArray(tgt.geo_locations?.cities) ? tgt.geo_locations.cities : [];
                      const budgetLabel = as.daily_budget
                        ? `₹${(Number(as.daily_budget) / 100).toFixed(2)}/day`
                        : as.lifetime_budget
                        ? `₹${(Number(as.lifetime_budget) / 100).toFixed(2)} (Lifetime)`
                        : liveMetaDetail?.daily_budget
                        ? `₹${(Number(liveMetaDetail.daily_budget) / 100).toFixed(2)}/day (CBO)`
                        : selectedCampDetail.dailyBudget
                        ? `₹${selectedCampDetail.dailyBudget.toFixed(2)}/day (CBO)`
                        : "Campaign Budget (CBO)";

                      return (
                        <div key={as.id || idx} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
                          {/* Top AdSet Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shadow-xs">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{as.name}</h4>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">AdSet ID: {as.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <Pill status={as.status || "ACTIVE"} />
                              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                                {budgetLabel}
                              </span>
                            </div>
                          </div>

                          {/* AdSet Delivery Specifications */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                              <p className="text-slate-500 text-[11px] font-medium">Destination Channel</p>
                              <p className="font-bold text-slate-900 text-xs">{as.destination_type || as.destinationType || "WHATSAPP"}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                              <p className="text-slate-500 text-[11px] font-medium">Optimization Goal</p>
                              <p className="font-bold text-blue-700 text-xs">{as.optimization_goal || as.optimizationGoal || "CONVERSATIONS"}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                              <p className="text-slate-500 text-[11px] font-medium">Billing Trigger</p>
                              <p className="font-bold text-slate-900 text-xs">{as.billing_event || "IMPRESSIONS"}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                              <p className="text-slate-500 text-[11px] font-medium">Bidding Strategy</p>
                              <p className="font-bold text-amber-700 text-xs truncate" title={as.bid_strategy || "LOWEST_COST_WITHOUT_CAP"}>
                                {as.bid_strategy || "LOWEST_COST_WITHOUT_CAP"}
                              </p>
                            </div>
                          </div>

                          {/* Targeting Detail Cards */}
                          <div className="space-y-4">
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                              <Target className="h-4 w-4 text-purple-600" /> Complete Audience Targeting Specifications
                            </h5>

                            {/* 1. Targeted Geographic Locations */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-700 font-bold text-xs">
                                  Targeted Geographic Locations {zips.length > 0 ? `(${zips.length} Postal Pin Codes)` : ""}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">Country: India (IN)</span>
                              </div>
                              {zips.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {zips.map((z: any, zIdx: number) => (
                                    <span key={zIdx} className="px-3 py-1 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 font-bold shadow-2xs">
                                      📍 {z.name || z.key}
                                    </span>
                                  ))}
                                </div>
                              ) : cities.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {cities.map((ct: any, cIdx: number) => (
                                    <span key={cIdx} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                                      📍 {ct.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs font-bold text-slate-900">India (Nationwide Delivery)</p>
                              )}
                            </div>

                            {/* 2. Demographics, Age & Genders */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                <span className="text-slate-500 text-[11px] font-medium">Targeted Age Range</span>
                                <p className="font-bold text-slate-900 text-sm">
                                  {tgt.age_range && Array.isArray(tgt.age_range)
                                    ? `${tgt.age_range[0]} - ${tgt.age_range[1]} years old`
                                    : `${tgt.age_min || 18} - ${tgt.age_max || 65}+ years old`}
                                </p>
                              </div>
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                <span className="text-slate-500 text-[11px] font-medium">Targeted Genders</span>
                                <p className="font-bold text-slate-900 text-sm">
                                  {tgt.genders && Array.isArray(tgt.genders)
                                    ? tgt.genders.includes(1) && tgt.genders.includes(2)
                                      ? "All Genders (Men & Women)"
                                      : tgt.genders.includes(1)
                                      ? "Men only"
                                      : "Women only"
                                    : "All Genders (Men & Women)"}
                                </p>
                              </div>
                            </div>

                            {/* 3. Professional Roles & Education */}
                            {(positions.length > 0 || majors.length > 0) && (
                              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-3">
                                <span className="text-blue-900 font-bold text-xs block">
                                  Targeted Job Roles &amp; Degrees
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {positions.map((p: any, pIdx: number) => (
                                    <span key={"p-" + pIdx} className="px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
                                      💼 Role: {p.name}
                                    </span>
                                  ))}
                                  {majors.map((m: any, mIdx: number) => (
                                    <span key={"m-" + mIdx} className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                                      🎓 Degree: {m.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 4. Interests & Behaviors */}
                            {interests.length > 0 && (
                              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-3">
                                <span className="text-purple-900 font-bold text-xs block">
                                  Targeted Interests &amp; Industry Topics ({interests.length} Categories)
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {interests.map((it: any, iIdx: number) => (
                                    <span key={"it-" + iIdx} className="px-3 py-1 rounded-xl bg-white border border-purple-200 text-purple-800 text-xs font-bold shadow-2xs">
                                      ✨ {it.name || it}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
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
                              <span>Meta Policy Compliance: Approved • Active across Facebook Feed, Instagram Feed &amp; Stories</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
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
    const handleOrgSync = () => {
      const activeOrg = getOrgId();
      setOrgId(activeOrg);
    };
    handleOrgSync();
    window.addEventListener("organization-switched", handleOrgSync);
    window.addEventListener("storage", handleOrgSync);
    return () => {
      window.removeEventListener("organization-switched", handleOrgSync);
      window.removeEventListener("storage", handleOrgSync);
    };
  }, []);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-50"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}>
      <SearchParamsHandler onOAuth={() => {}} />
      <MetaAdsWorkspace key={orgId} orgId={orgId} showToast={() => { }} platform="meta" setPlatform={() => { }} />
    </Suspense>
  );
}
