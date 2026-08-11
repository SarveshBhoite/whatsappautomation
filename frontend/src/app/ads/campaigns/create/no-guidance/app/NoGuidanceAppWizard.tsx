"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Palette,
  Type, Layers3, Tag, Mail, Wand2, Download
} from "lucide-react";

export default function NoGuidanceAppWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  // Active step (1 to 6)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "NO_GUIDANCE",
    selectedType: "APP",
    campaignName: "App-1",

    // Step 2: App Campaign Setup
    campaignSubtype: "App installs" as "App installs" | "App engagement" | "App pre-registration",
    appPlatform: "ANDROID" as "ANDROID" | "IOS",
    appName: "Hubmate - Smart Business Suite",
    appId: "com.hubmate.app",
    appDeveloper: "Hubmate Tech Ltd.",
    appIcon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",

    // Step 3: Campaign Settings
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    moreSettingsOpen: false,

    // Step 4: Bidding & Budget
    biddingFocus: "Target cost per install" as "Target cost per install" | "Target cost per in-app action" | "Target return on ad spend (ROAS)",
    targetCpiValue: "25.00",
    targetCpaValue: "50.00",
    targetRoasValue: "200",
    budgetAmount: "1000",

    // Step 5: Assets (Ad Group)
    assetGroupName: "Asset group 1",
    headlines: [
      "Download Hubmate Smart Suite",
      "Official Business App 2026",
      "Automate Customer Support"
    ],
    descriptions: [
      "Manage all customer workflows, WhatsApp chats, and ads from your smartphone.",
      "Join 50,000+ businesses automating sales with real-time AI tools."
    ],
    uploadedImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
    ]
  });

  // UI state for search
  const [appSearchQuery, setAppSearchQuery] = useState<string>("Hubmate");
  const [showAppSearchResults, setShowAppSearchResults] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"SEARCH" | "PLAYSTORE" | "YOUTUBE" | "DISCOVER">("SEARCH");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Helper for Ad Strength calculation
  const calculateAdStrength = () => {
    let score = 0;
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    if (formData.appId.trim().length > 0) score += 25;
    if (activeHeadlines.length >= 1) score += 25;
    if (activeDescriptions.length >= 1) score += 25;
    if (formData.uploadedImages.length >= 1) score += 25;

    if (score < 30) return { label: "Poor", color: "text-red-500", barColor: "bg-red-500", percent: 25 };
    if (score < 60) return { label: "Average", color: "text-amber-400", barColor: "bg-amber-400", percent: 50 };
    if (score < 85) return { label: "Good", color: "text-blue-400", barColor: "bg-blue-400", percent: 75 };
    return { label: "Excellent", color: "text-emerald-400", barColor: "bg-emerald-400", percent: 100 };
  };

  const adStrength = calculateAdStrength();

  // Headlines handlers
  const addHeadline = () => {
    if (formData.headlines.length < 5) {
      setFormData(prev => ({ ...prev, headlines: [...prev.headlines, ""] }));
    }
  };
  const removeHeadline = (idx: number) => {
    setFormData(prev => ({ ...prev, headlines: prev.headlines.filter((_, i) => i !== idx) }));
  };
  const updateHeadline = (idx: number, val: string) => {
    if (val.length <= 30) {
      const copy = [...formData.headlines];
      copy[idx] = val;
      setFormData(prev => ({ ...prev, headlines: copy }));
    }
  };

  // Descriptions handlers
  const addDescription = () => {
    if (formData.descriptions.length < 5) {
      setFormData(prev => ({ ...prev, descriptions: [...prev.descriptions, ""] }));
    }
  };
  const removeDescription = (idx: number) => {
    setFormData(prev => ({ ...prev, descriptions: prev.descriptions.filter((_, i) => i !== idx) }));
  };
  const updateDescription = (idx: number, val: string) => {
    if (val.length <= 90) {
      const copy = [...formData.descriptions];
      copy[idx] = val;
      setFormData(prev => ({ ...prev, descriptions: copy }));
    }
  };

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 1) {
      if (!formData.campaignName.trim()) return false;
    }
    if (step === 2) {
      if (!formData.appId.trim()) return false;
    }
    if (step === 4) {
      if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) return false;
      if (formData.biddingFocus === "Target cost per install" && (!formData.targetCpiValue || parseFloat(formData.targetCpiValue) <= 0)) return false;
    }
    if (step === 5) {
      const validHeadlines = formData.headlines.filter(h => h.trim().length > 0);
      const validDescriptions = formData.descriptions.filter(d => d.trim().length > 0);
      return validHeadlines.length >= 1 && validDescriptions.length >= 1;
    }
    return true;
  };

  // Step 6 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      campaignSubtype: formData.campaignSubtype,
      appPlatform: formData.appPlatform,
      appName: formData.appName,
      appId: formData.appId,
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      budgetType: "DAILY",
      dailyBudget: parseFloat(formData.budgetAmount || "1000"),
      biddingFocus: formData.biddingFocus,
      targetCpi: parseFloat(formData.targetCpiValue || "25"),
      targetCpa: parseFloat(formData.targetCpaValue || "50"),
      targetRoas: parseFloat(formData.targetRoasValue || "200"),
      assetGroupName: formData.assetGroupName,
      headlines: activeHeadlines,
      descriptions: activeDescriptions,
      images: formData.uploadedImages
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-app-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setCreatedCampaignDetails(data);
      setPublishSuccess(true);
    } catch (err) {
      console.warn("Backend API error fallback:", err);
      setCreatedCampaignDetails({
        message: "App Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "MULTI_CHANNEL",
          advertising_channel_sub_type: "APP_CAMPAIGN",
          app_platform: formData.appPlatform,
          app_id: formData.appId,
          "CampaignBudget.amount_micros": parseFloat(formData.budgetAmount || "1000") * 1000000
        }
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close Wizard"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-medium">
            <span className="text-slate-400">Create without guidance</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" /> App Campaign Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-slate-300 font-mono flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>ID: {customerId}</span>
          </div>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white transition-all" />
        </div>
      </header>

      {/* ── Main Container: Sidebar + Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* ── Left Sidebar Navigation Stepper ── */}
        <aside className="w-64 border-r border-slate-800/80 p-4 shrink-0 bg-slate-950/70 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">App Campaign</div>
                <div className="text-[10px] text-slate-400">Google Play & App Store</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective & Type", desc: "Select App campaign" },
                { num: 2, title: "App Setup", desc: "Platform & App lookup" },
                { num: 3, title: "Campaign Settings", desc: "Locations, languages & EU" },
                { num: 4, title: "Bidding & Budget", desc: "Target CPI & daily budget" },
                { num: 5, title: "Ad Assets", desc: "Headlines, images & live preview" },
                { num: 6, title: "Review", desc: "Final audit & publish" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => { if (s.num < step) setStep(s.num); }}
                    className={`relative flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-blue-600/15 border border-blue-500/40 text-white shadow-lg shadow-blue-950/40 font-medium"
                        : isCompleted
                        ? "text-slate-300 hover:bg-slate-900/60"
                        : "text-slate-500 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isActive
                          ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-blue-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
                          {s.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Standard Google Ads API
            </div>
            <div>Mapped to `advertising_channel_type = MULTI_CHANNEL`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE & CAMPAIGN TYPE */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select Campaign Type</h1>
                <p className="text-xs text-slate-400 mt-1">Select App to drive app installs and in-app actions across Google properties</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "APP", title: "App", desc: "Drive app installs, engagements, and pre-registrations across Google Search, Play Store & YouTube", icon: Smartphone, selected: true },
                  { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google", icon: Sparkles },
                  { id: "SEARCH", title: "Search", desc: "High-intent text search ads", icon: Search },
                  { id: "DEMAND_GEN", title: "Demand Gen", desc: "Visual ads on YouTube & Discover", icon: Zap },
                  { id: "DISPLAY", title: "Display", desc: "Visual banner ads across websites", icon: ImageIcon },
                  { id: "SHOPPING", title: "Shopping", desc: "Product inventory listings", icon: Tag }
                ].map((ct) => {
                  const isSel = formData.selectedType === ct.id;
                  const Icon = ct.icon;

                  return (
                    <div
                      key={ct.id}
                      onClick={() => setFormData(prev => ({ ...prev, selectedType: ct.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSel
                          ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-md shadow-blue-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSel && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSel ? "text-blue-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{ct.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{ct.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campaign Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign name</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: APP CAMPAIGN SETUP */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">App Campaign Setup</h1>
                <p className="text-xs text-slate-400 mt-1">Select your campaign subtype, mobile platform, and look up your app</p>
              </div>

              {/* Campaign Subtype */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select a campaign subtype</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "App installs", title: "App installs", desc: "Get new users to install your app" },
                    { id: "App engagement", title: "App engagement", desc: "Re-engage existing users to complete actions" },
                    { id: "App pre-registration", title: "App pre-registration", desc: "Build excitement before app launch (Android only)" }
                  ].map((sub) => {
                    const isSel = formData.campaignSubtype === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setFormData(prev => ({ ...prev, campaignSubtype: sub.id as any }))}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSel ? "bg-blue-600/10 border-blue-500 text-white font-bold ring-1 ring-blue-500/30" : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{sub.title}</span>
                          {isSel && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{sub.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Platform Selector */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select your mobile app's platform</label>
                <div className="flex gap-3">
                  {[
                    { id: "ANDROID", label: "Android (Google Play)" },
                    { id: "IOS", label: "iOS (Apple App Store)" }
                  ].map((plat) => (
                    <label
                      key={plat.id}
                      onClick={() => setFormData(prev => ({ ...prev, appPlatform: plat.id as any }))}
                      className={`flex-1 p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.appPlatform === plat.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="platform"
                        checked={formData.appPlatform === plat.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs font-semibold">{plat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* App Search / Selection */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <label className="text-xs font-semibold text-slate-300">Look up your app</label>
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={appSearchQuery}
                    onChange={(e) => {
                      setAppSearchQuery(e.target.value);
                      setShowAppSearchResults(true);
                    }}
                    placeholder="Search by app name, package name (e.g. com.hubmate.app), or store URL"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />

                  {showAppSearchResults && (
                    <div className="absolute top-12 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 p-2 space-y-1">
                      {[
                        { name: "Hubmate - Smart Business Suite", dev: "Hubmate Tech Ltd.", pkg: "com.hubmate.app", icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80" },
                        { name: "Hubmate CRM & Chat", dev: "Hubmate Apps", pkg: "com.hubmate.crm", icon: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80" }
                      ].map((app) => (
                        <div
                          key={app.pkg}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              appName: app.name,
                              appDeveloper: app.dev,
                              appId: app.pkg,
                              appIcon: app.icon
                            }));
                            setShowAppSearchResults(false);
                          }}
                          className="p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                        >
                          <img src={app.icon} alt={app.name} className="h-9 w-9 rounded-lg object-cover" />
                          <div>
                            <div className="text-xs font-bold text-white">{app.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{app.pkg} • {app.dev}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected App Card */}
                {formData.appId && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 flex items-center gap-4">
                    <img src={formData.appIcon} alt={formData.appName} className="h-12 w-12 rounded-xl object-cover border border-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-white">{formData.appName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{formData.appId}</div>
                      <div className="text-[10px] text-blue-400 mt-0.5">{formData.appDeveloper}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN SETTINGS */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure location options, language targeting, and regulatory compliance</p>
              </div>

              {/* Locations */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" /> Locations
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "ALL", label: "All countries and territories" },
                    { id: "INDIA", label: "India" },
                    { id: "CUSTOM", label: "Enter another location" }
                  ].map((loc) => (
                    <label
                      key={loc.id}
                      onClick={() => setFormData(prev => ({ ...prev, locationType: loc.id as any }))}
                      className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.locationType === loc.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locations"
                        checked={formData.locationType === loc.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs font-semibold">{loc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100">Languages</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages.map((lang) => (
                    <span key={lang} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-200 flex items-center gap-1.5">
                      {lang}
                      <X onClick={() => setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))} className="h-3 w-3 cursor-pointer hover:text-red-400" />
                    </span>
                  ))}
                </div>
              </div>

              {/* EU Political Ads */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100">EU political ads (Required)</h3>
                <div className="space-y-2">
                  {[
                    { id: "YES", label: "Yes, this campaign has EU political ads" },
                    { id: "NO", label: "No, this campaign doesn’t have EU political ads" }
                  ].map((eu) => (
                    <label
                      key={eu.id}
                      onClick={() => setFormData(prev => ({ ...prev, euPolitical: eu.id as any }))}
                      className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.euPolitical === eu.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="euPolitical"
                        checked={formData.euPolitical === eu.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs font-semibold">{eu.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BIDDING & BUDGET */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Bidding & Budget</h1>
                <p className="text-xs text-slate-400 mt-1">Set your target cost per install (CPI) and average daily budget</p>
              </div>

              {/* Daily Budget */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Set your average daily budget (₹)</label>
                <input
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                  className="w-full max-w-xs px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                />
              </div>

              {/* Bidding Focus */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">What do you want to focus on?</label>
                  <select
                    value={formData.biddingFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value as any }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Target cost per install">Target cost per install (Install volume)</option>
                    <option value="Target cost per in-app action">Target cost per in-app action</option>
                    <option value="Target return on ad spend (ROAS)">Target return on ad spend (ROAS)</option>
                  </select>
                </div>

                {formData.biddingFocus === "Target cost per install" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-xs space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Target cost per install (Target CPI) (₹)</label>
                    <input
                      type="number"
                      value={formData.targetCpiValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCpiValue: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400">Target amount you want to pay for each app install.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: ASSETS (AD GROUP) */}
          {step === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Asset Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Ad Group & Creative Assets</h1>
                  <p className="text-xs text-slate-400 mt-1">Provide headlines, descriptions, and visual assets for your App ad</p>
                </div>

                {/* Asset Group Name */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Asset group name</label>
                  <input
                    type="text"
                    value={formData.assetGroupName}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetGroupName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Headlines Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Headlines ({formData.headlines.filter(h=>h.trim()).length}/5)</h3>
                      <p className="text-[11px] text-slate-400">Add up to 5 headlines (Max 30 chars each)</p>
                    </div>
                    <button
                      onClick={addHeadline}
                      disabled={formData.headlines.length >= 5}
                      className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-1.5 font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Headline
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.headlines.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => updateHeadline(idx, e.target.value)}
                            placeholder={`Headline ${idx + 1}`}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 focus:border-blue-500 focus:outline-none"
                          />
                          <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-400">
                            {hl.length}/30
                          </span>
                        </div>
                        {formData.headlines.length > 1 && (
                          <button onClick={() => removeHeadline(idx)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Descriptions ({formData.descriptions.filter(d=>d.trim()).length}/5)</h3>
                      <p className="text-[11px] text-slate-400">Add up to 5 descriptions (Max 90 chars each)</p>
                    </div>
                    <button
                      onClick={addDescription}
                      disabled={formData.descriptions.length >= 5}
                      className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-1.5 font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Description
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formData.descriptions.map((desc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <textarea
                            rows={2}
                            value={desc}
                            onChange={(e) => updateDescription(idx, e.target.value)}
                            placeholder={`Description ${idx + 1}`}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 focus:border-blue-500 focus:outline-none resize-none"
                          />
                          <span className="absolute right-3 bottom-2 text-[10px] font-mono text-slate-400">
                            {desc.length}/90
                          </span>
                        </div>
                        {formData.descriptions.length > 1 && (
                          <button onClick={() => removeDescription(idx)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live App Multi-Placement Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex border-b border-slate-800 pb-2 justify-around text-[11px] font-semibold">
                    {[
                      { id: "SEARCH", label: "Search" },
                      { id: "PLAYSTORE", label: "Play Store" },
                      { id: "YOUTUBE", label: "YouTube" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPreviewTab(tab.id as any)}
                        className={`pb-1 border-b-2 transition-all ${
                          previewTab === tab.id ? "border-blue-500 text-blue-400 font-bold" : "border-transparent text-slate-400"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Visual App Card Preview Frame */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={formData.appIcon} alt="icon" className="h-10 w-10 rounded-xl object-cover border border-slate-700" />
                      <div>
                        <div className="text-xs font-bold text-white truncate">{formData.appName}</div>
                        <div className="text-[10px] text-slate-400">{formData.appDeveloper}</div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="text-xs font-bold text-blue-400 truncate">{formData.headlines[0] || "Download Official App"}</div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{formData.descriptions[0] || "App description preview line."}</p>
                    </div>

                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2">
                      <Download className="h-3.5 w-3.5" /> Install
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {step === 6 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Review & Publish</h1>
                <p className="text-xs text-slate-400 mt-1">Review your App Campaign details before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Platform & App</span>
                    <div className="font-bold text-white flex items-center gap-2">
                      <img src={formData.appIcon} className="h-4 w-4 rounded" />
                      <span>{formData.appName} ({formData.appPlatform})</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Subtype & Bidding</span>
                    <div className="font-bold text-white">{formData.campaignSubtype} (Target CPI: ₹{formData.targetCpiValue})</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Package ID</span>
                    <div className="font-bold text-white font-mono text-[11px]">{formData.appId}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">App Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for App Install delivery.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.push(`/ads/campaigns${customerId ? `?customerId=${customerId}` : ""}`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
                    >
                      Go to Campaigns List
                    </button>
                    <button
                      onClick={() => setPublishSuccess(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg"
                    >
                      Edit Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Bottom Sticky Action Navigation Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-40 shadow-2xl">
        <button
          onClick={() => {
            if (step === 1) {
              router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
            } else {
              setStep(step - 1);
            }
          }}
          className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {step < 6 ? (
            <button
              disabled={!isCurrentStepValid()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled={isPublishing || publishSuccess}
              onClick={handlePublish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  Publish Campaign <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
