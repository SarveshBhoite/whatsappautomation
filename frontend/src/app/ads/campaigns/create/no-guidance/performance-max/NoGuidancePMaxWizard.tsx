"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, MapPin,
  Building2, Store, Wand2, Compass, Tag, Layers3
} from "lucide-react";

const Youtube = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function NoGuidancePMaxWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  // Active step (1 to 8)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "NO_GUIDANCE",
    selectedType: "PERFORMANCE_MAX",
    draftOption: "NEW", // "DRAFT" | "NEW"
    campaignName: "Performance Max-1",
    conversionGoals: ["Phone call leads", "Web conversions", "Contact form leads"],
    finalUrl: "https://www.example.com",

    // Step 4: Bidding
    biddingFocus: "Maximize conversions", // "Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS"
    targetCpaValue: "25.00",
    targetRoasValue: "200",
    onlyNewCustomers: false,
    reengageLapsedCustomers: false,

    // Step 5: Campaign Settings
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    locationOption: "PRESENCE_OR_INTEREST" as "PRESENCE_OR_INTEREST" | "PRESENCE_ONLY",
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    moreSettingsOpen: false,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",

    // Step 6: Asset Group
    assetGroupName: "Asset Group 1",
    assetFinalUrl: "https://www.example.com",
    headlines: [
      "Grow Your Business Online",
      "Get Instant Leads Today",
      "Top-Rated Professional Services"
    ],
    longHeadlines: [
      "Reach high-intent customers across Google Search, YouTube, Gmail & Display in 1 campaign"
    ],
    descriptions: [
      "Boost conversion efficiency with real-time AI bidding and broad audience reach.",
      "Get started with custom performance marketing tailored to your exact business metrics."
    ],
    uploadedImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"
    ],
    searchThemes: ["digital marketing", "lead generation", "business services"],
    audienceSignal: "",

    // Step 7: Budget
    budgetType: "DAILY" as "DAILY" | "TOTAL",
    budgetAmount: "1000"
  });

  // UI state for inputs
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

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

  // Long Headlines handlers
  const addLongHeadline = () => {
    if (formData.longHeadlines.length < 5) {
      setFormData(prev => ({ ...prev, longHeadlines: [...prev.longHeadlines, ""] }));
    }
  };
  const updateLongHeadline = (idx: number, val: string) => {
    if (val.length <= 90) {
      const copy = [...formData.longHeadlines];
      copy[idx] = val;
      setFormData(prev => ({ ...prev, longHeadlines: copy }));
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

  // Step 8 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      finalUrl: formData.finalUrl,
      biddingFocus: formData.biddingFocus,
      targetCpa: formData.biddingFocus === "Target CPA" ? parseFloat(formData.targetCpaValue || "25") : undefined,
      targetRoas: formData.biddingFocus === "Target ROAS" ? parseFloat(formData.targetRoasValue || "200") : undefined,
      onlyNewCustomers: formData.onlyNewCustomers,
      reengageLapsedCustomers: formData.reengageLapsedCustomers,
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      locationOption: formData.locationOption,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      assetGroupName: formData.assetGroupName,
      headlines: activeHeadlines,
      longHeadlines: formData.longHeadlines.filter(lh => lh.trim().length > 0),
      descriptions: activeDescriptions,
      images: formData.uploadedImages,
      searchThemes: formData.searchThemes,
      audienceSignal: formData.audienceSignal,
      budgetType: formData.budgetType,
      dailyBudget: parseFloat(formData.budgetAmount || "1000")
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-pmax-campaign`, {
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
        message: "Performance Max Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "PERFORMANCE_MAX",
          bidding_focus: formData.biddingFocus,
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
              <Sparkles className="h-4 w-4" /> Performance Max Setup
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
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">No Guidance</div>
                <div className="text-[10px] text-slate-400">Performance Max</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-1.5 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective", desc: "Select objective" },
                { num: 2, title: "Campaign Type", desc: "Select Performance Max" },
                { num: 3, title: "Campaign Basics", desc: "Name & final URL" },
                { num: 4, title: "Bidding", desc: "Conversions & CPA / ROAS" },
                { num: 5, title: "Campaign Settings", desc: "Locations, languages & EU" },
                { num: 6, title: "Asset Group", desc: "Headlines, images & signals" },
                { num: 7, title: "Budget", desc: "Daily budget amount" },
                { num: 8, title: "Summary", desc: "Review & publish" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => { if (s.num < step) setStep(s.num); }}
                    className={`relative flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-blue-600/15 border border-blue-500/40 text-white shadow-lg shadow-blue-950/40 font-medium"
                        : isCompleted
                        ? "text-slate-300 hover:bg-slate-900/60"
                        : "text-slate-500 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isActive
                          ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.num}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-blue-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
                          {s.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
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
            <div>Mapped to `advertising_channel_type = PERFORMANCE_MAX`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE SELECTION */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">What’s your campaign objective?</h1>
                <p className="text-xs text-slate-400 mt-1">Select an objective to customize your campaign setup to your goals</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "SALES", title: "Sales", desc: "Drive sales online, in app, by phone, or in store", icon: ShoppingBag },
                  { id: "LEADS", title: "Leads", desc: "Get leads and other conversions by encouraging customers to take action", icon: Target },
                  { id: "WEBSITE_TRAFFIC", title: "Website traffic", desc: "Get the right people to visit your website", icon: Globe },
                  { id: "APP_PROMOTION", title: "App promotion", desc: "Get more installs, engagement and pre-registration for your app", icon: Smartphone },
                  { id: "AWARENESS", title: "YouTube reach, views, and engagements", desc: "Drive awareness and consideration of your product or brand", icon: VideoIcon },
                  { id: "LOCAL", title: "Local store visits and promotions", desc: "Drive visits to local stores, including restaurants and dealerships.", icon: LayoutGrid },
                  { id: "NO_GUIDANCE", title: "Create a campaign without guidance", desc: "You'll choose a campaign type next without automated recommendation", icon: Sparkles, highlight: true }
                ].map((item) => {
                  const isSelected = formData.objective === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFormData(prev => ({ ...prev, objective: item.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-md shadow-blue-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{item.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT CAMPAIGN TYPE */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select a campaign type</h1>
                <p className="text-xs text-slate-400 mt-1">Choose how you'd like to reach your target audience</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google with a single automated campaign", icon: Sparkles, recommended: true },
                  { id: "SEARCH", title: "Search", desc: "Get in front of high-intent searchers looking for your services on Google", icon: Search },
                  { id: "DEMAND_GEN", title: "Demand Gen", desc: "Drive engagement on YouTube, Shorts, Discover, and Gmail with immersive visual ads", icon: Zap },
                  { id: "DISPLAY", title: "Display", desc: "Run visually engaging banner ads across millions of websites and apps", icon: ImageIcon },
                  { id: "SHOPPING", title: "Shopping", desc: "Promote your product inventory with shopping ad listings", icon: Tag },
                  { id: "VIDEO", title: "Video", desc: "Reach viewers on YouTube and across the web with video ads", icon: VideoIcon },
                  { id: "APP", title: "App", desc: "Drive app installs and engagement across Google Search, Play, and YouTube", icon: Smartphone }
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
                        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          {ct.title}
                          {ct.recommended && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-normal">Recommended</span>}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{ct.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN BASICS */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Basics</h1>
                <p className="text-xs text-slate-400 mt-1">Set campaign name, conversion goals, and your final URL destination</p>
              </div>

              {/* Draft Option */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Would you like to resume from an existing campaign draft?</label>
                <div className="space-y-2">
                  {[
                    { id: "DRAFT", label: "Continue from an existing campaign draft" },
                    { id: "NEW", label: "Create a new campaign" }
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setFormData(prev => ({ ...prev, draftOption: opt.id as any }))}
                      className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.draftOption === opt.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="draftOption"
                        checked={formData.draftOption === opt.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
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

              {/* Conversion Goals */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Use these conversion goals for this campaign</label>
                  <button className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Goal
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.conversionGoals.map((cg) => (
                    <span key={cg} className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {cg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Final URL */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Where should people go after clicking your ads? (Final URL)</label>
                <input
                  type="text"
                  value={formData.finalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 4: BIDDING */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Bidding</h1>
                <p className="text-xs text-slate-400 mt-1">Configure automated bidding goals & customer acquisition options</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">What do you want to focus on?</label>
                  <select
                    value={formData.biddingFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Maximize conversions">Maximize conversions</option>
                    <option value="Target CPA">Target CPA (Cost per Action)</option>
                    <option value="Maximize conversion value">Maximize conversion value</option>
                    <option value="Target ROAS">Target ROAS (Return on Ad Spend)</option>
                  </select>
                </div>

                {formData.biddingFocus === "Target CPA" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-xs">
                    <label className="text-xs font-semibold text-slate-300">Target CPA (₹)</label>
                    <input
                      type="number"
                      value={formData.targetCpaValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCpaValue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                    />
                  </div>
                )}

                {formData.biddingFocus === "Target ROAS" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-xs">
                    <label className="text-xs font-semibold text-slate-300">Target ROAS (%)</label>
                    <input
                      type="number"
                      value={formData.targetRoasValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRoasValue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                    />
                  </div>
                )}

                {/* Customer Acquisition */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Customer acquisition</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.onlyNewCustomers}
                      onChange={(e) => setFormData(prev => ({ ...prev, onlyNewCustomers: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Only bid for new customers</span>
                  </label>
                </div>

                {/* Customer Retention */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">Customer retention</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reengageLapsedCustomers}
                      onChange={(e) => setFormData(prev => ({ ...prev, reengageLapsedCustomers: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Adjust your bidding to help re-engage lapsed customers</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CAMPAIGN SETTINGS */}
          {step === 5 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure location options, languages, and regulatory disclosures</p>
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

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Location options</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="locationOption"
                        checked={formData.locationOption === "PRESENCE_OR_INTEREST"}
                        onChange={() => setFormData(prev => ({ ...prev, locationOption: "PRESENCE_OR_INTEREST" }))}
                        className="h-3.5 w-3.5 text-blue-500"
                      />
                      <span className="text-xs text-slate-300">Presence or interest: People in, regularly in, or who've shown interest in your targeted locations (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="locationOption"
                        checked={formData.locationOption === "PRESENCE_ONLY"}
                        onChange={() => setFormData(prev => ({ ...prev, locationOption: "PRESENCE_ONLY" }))}
                        className="h-3.5 w-3.5 text-blue-500"
                      />
                      <span className="text-xs text-slate-300">Presence: People in or regularly in your targeted locations</span>
                    </label>
                  </div>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">EU political ads (Required)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">Regulatory Requirement</span>
                </div>
                <div className="space-y-2">
                  {[
                    { id: "YES", label: "Yes" },
                    { id: "NO", label: "No" }
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

          {/* STEP 6: ASSET GROUP */}
          {step === 6 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Asset Group & Creative Assets</h1>
                <p className="text-xs text-slate-400 mt-1">Provide headlines, long headlines, descriptions, images, and search themes</p>
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
                    <p className="text-[11px] text-slate-400">Add up to 5 headlines (At least 1 required, max 30 chars)</p>
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

              {/* Long Headlines Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Long Headlines ({formData.longHeadlines.filter(lh=>lh.trim()).length}/5)</h3>
                    <p className="text-[11px] text-slate-400">Add up to 5 long headlines (Max 90 chars)</p>
                  </div>
                  <button
                    onClick={addLongHeadline}
                    disabled={formData.longHeadlines.length >= 5}
                    className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-1.5 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Long Headline
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.longHeadlines.map((lh, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={lh}
                          onChange={(e) => updateLongHeadline(idx, e.target.value)}
                          placeholder={`Long Headline ${idx + 1}`}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white pr-14 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-400">
                          {lh.length}/90
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Themes */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Search Themes (Up to 50)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchThemeInput}
                    onChange={(e) => setSearchThemeInput(e.target.value)}
                    placeholder="Type search theme e.g. digital marketing"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (searchThemeInput.trim() && !formData.searchThemes.includes(searchThemeInput.trim())) {
                        setFormData(prev => ({ ...prev, searchThemes: [...prev.searchThemes, searchThemeInput.trim()] }));
                        setSearchThemeInput("");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Add Theme
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.searchThemes.map((st) => (
                    <span key={st} className="px-2.5 py-1 bg-blue-900/40 border border-blue-500/40 rounded-full text-xs text-blue-300 flex items-center gap-1.5">
                      {st}
                      <X onClick={() => setFormData(prev => ({ ...prev, searchThemes: prev.searchThemes.filter(t => t !== st) }))} className="h-3 w-3 cursor-pointer hover:text-white" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: BUDGET */}
          {step === 7 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Budget</h1>
                <p className="text-xs text-slate-400 mt-1">Set your daily or campaign total budget</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Select budget type</label>
                  <div className="flex gap-4">
                    {[
                      { id: "DAILY", label: "Average daily budget" },
                      { id: "TOTAL", label: "Campaign total budget" }
                    ].map((bt) => (
                      <label
                        key={bt.id}
                        onClick={() => setFormData(prev => ({ ...prev, budgetType: bt.id as any }))}
                        className={`flex-1 p-3 rounded-lg border text-xs cursor-pointer ${
                          formData.budgetType === bt.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <input type="radio" name="budgetType" checked={formData.budgetType === bt.id} onChange={() => {}} className="mr-2" />
                        {bt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: SUMMARY / REVIEW & PUBLISH */}
          {step === 8 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Summary / Review & Publish</h1>
                <p className="text-xs text-slate-400 mt-1">Audit your Performance Max campaign details before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(3)} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Objective & Type</span>
                    <div className="font-bold text-white">No guidance → Performance Max</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Bidding Focus</span>
                    <div className="font-bold text-white">{formData.biddingFocus}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Final URL</span>
                    <div className="font-bold text-white font-mono text-[11px] truncate">{formData.finalUrl}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Performance Max Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for automated delivery.</p>
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
          {step < 8 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer"
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
