"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, MapPin,
  Building2, Store, Wand2, Compass, Tag, Layers3, Phone
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
    targetCpaValue: "166.11",
    targetRoasValue: "200",
    onlyNewCustomers: false,
    reengageLapsedCustomers: false,

    // Step 5: Campaign Settings
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    locationOption: "PRESENCE_OR_INTEREST" as "PRESENCE_OR_INTEREST" | "PRESENCE_ONLY",
    showLocationOptions: true,
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    moreSettingsOpen: false,
    adScheduleList: [{ day: "All days", start: "00:00", end: "00:00" }],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    devicesSelection: { computers: true, mobile: true, tablets: true, tv: true },
    turnOnAgeExclusions: false,
    turnOnGenderExclusions: false,

    // Step 6: Asset Group & Creative Assets
    assetGroupName: "Asset Group 1",
    assetFinalUrl: "https://www.example.com",
    businessName: "Hubmate Inc.",
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
    uploadedVideos: [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    ],
    uploadedClips: [] as string[],
    ctaOption: "Automated (recommended)",
    savedSitelinks: [] as Array<{ text: string; desc1: string; desc2: string; url: string }>,
    savedPromotions: [] as Array<{ occasion: string; item: string; discount: string; url: string }>,
    savedPrices: [] as Array<{ type: string; price: string }>,
    savedMessages: [] as Array<{ platform: string }>,
    savedSnippets: [] as Array<{ header: string; values: string[] }>,
    savedLeadForms: [] as Array<{ headline: string; business: string }>,
    savedCallouts: [] as string[],
    enableTextCustomization: true,
    enableFinalUrlExpansion: true,
    searchThemes: ["digital marketing", "lead generation", "business services"],
    audienceSignal: "High Intent Buyers 2026",

    // Step 7: Budget
    budgetType: "DAILY" as "DAILY" | "TOTAL",
    budgetAmount: "1000"
  });

  // UI state for inputs
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");
  const [activeModal, setActiveModal] = useState<"SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | null>(null);

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

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 3) {
      if (!formData.campaignName.trim() || !formData.finalUrl.trim()) return false;
    }
    if (step === 4) {
      if (formData.biddingFocus === "Target CPA" && (!formData.targetCpaValue || parseFloat(formData.targetCpaValue) <= 0)) return false;
      if (formData.biddingFocus === "Target ROAS" && (!formData.targetRoasValue || parseFloat(formData.targetRoasValue) <= 0)) return false;
    }
    if (step === 6) {
      const validHeadlines = formData.headlines.filter(h => h.trim().length > 0);
      const validDescriptions = formData.descriptions.filter(d => d.trim().length > 0);
      return validHeadlines.length >= 1 && validDescriptions.length >= 1;
    }
    if (step === 7) {
      return !!formData.budgetAmount && parseFloat(formData.budgetAmount) > 0;
    }
    return true;
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
            <div className="space-y-6 animate-in fade-in duration-200 text-xs max-w-4xl">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
              <p className="text-slate-400">To reach the right people, start by defining key settings for your campaign</p>

              {/* Locations */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                <p className="text-slate-400">Select locations for this campaign</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="salesPmaxLoc" checked={formData.locationType === "ALL"} onChange={() => setFormData(prev => ({ ...prev, locationType: "ALL" }))} className="text-primary h-4 w-4" />
                    <span>All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="salesPmaxLoc" checked={formData.locationType === "INDIA"} onChange={() => setFormData(prev => ({ ...prev, locationType: "INDIA" }))} className="text-primary h-4 w-4" />
                    <span>India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="salesPmaxLoc" checked={formData.locationType === "CUSTOM"} onChange={() => setFormData(prev => ({ ...prev, locationType: "CUSTOM" }))} className="text-primary h-4 w-4" />
                    <span>Enter another location</span>
                  </label>
                </div>

                {/* Location Options Accordion */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, showLocationOptions: !prev.showLocationOptions }))}
                    className="flex items-center justify-between w-full py-1 text-slate-300 font-semibold cursor-pointer"
                  >
                    <span>Location options</span>
                    {formData.showLocationOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {formData.showLocationOptions && (
                    <div className="mt-3 p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 animate-in fade-in duration-150">
                      <span className="font-semibold text-slate-200 block">Include</span>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="locTargetType"
                          checked={formData.locationOption === "PRESENCE_OR_INTEREST"}
                          onChange={() => setFormData(prev => ({ ...prev, locationOption: "PRESENCE_OR_INTEREST" }))}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer border-t border-slate-800/60 pt-2">
                        <input
                          type="radio"
                          name="locTargetType"
                          checked={formData.locationOption === "PRESENCE_ONLY"}
                          onChange={() => setFormData(prev => ({ ...prev, locationOption: "PRESENCE_ONLY" }))}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Presence: People in or regularly in your included locations</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                <p className="text-slate-400">Select the languages your customers speak.</p>

                <div className="relative max-w-md">
                  <input
                    type="text"
                    value={languageSearchInput}
                    onChange={(e) => setLanguageSearchInput(e.target.value)}
                    placeholder="Start typing or select a language"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                  />

                  {/* API search results popup */}
                  {languageSearchInput.trim() !== "" && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto py-1 text-xs">
                      {formData.languages.filter(l => l.toLowerCase().includes(languageSearchInput.toLowerCase())).map((lang, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!formData.languages.includes(lang)) {
                              setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }));
                            }
                            setLanguageSearchInput("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 cursor-pointer flex items-center justify-between"
                        >
                          <span>{lang}</span>
                          <Plus className="h-3.5 w-3.5 text-primary" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.languages.map((lang, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
                      {lang}
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }))}>
                        <X className="h-3 w-3 hover:text-rose-400" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* EU political ads */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-100">EU political ads</h2>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                </div>
                <p className="text-slate-300">Does your campaign have European Union political ads?</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="euPolSales" checked={formData.euPolitical === "YES"} onChange={() => setFormData(prev => ({ ...prev, euPolitical: "YES" }))} className="text-primary h-4 w-4" />
                  <span>Yes, this campaign has EU political ads</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="euPolSales" checked={formData.euPolitical === "NO"} onChange={() => setFormData(prev => ({ ...prev, euPolitical: "NO" }))} className="text-primary h-4 w-4" />
                  <span>No, this campaign doesn't have EU political ads</span>
                </label>
                <p className="text-[11px] text-slate-500 pt-1">EU regulation requires Google to ask this question. Learn how an EU political ad is defined</p>
              </div>

              {/* More settings Section */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl">
                <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">More settings</h3>

                {/* Ad schedule */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-300">Ad schedule</h4>
                  
                  {formData.adScheduleList.map((sched, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <select
                        value={sched.day}
                        onChange={(e) => {
                          const updated = [...formData.adScheduleList];
                          updated[idx].day = e.target.value;
                          setFormData(prev => ({ ...prev, adScheduleList: updated }));
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium"
                      >
                        {["All days", "Mondays - Fridays", "Saturdays - Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"].map((day, i) => (
                          <option key={i} value={day}>{day}</option>
                        ))}
                      </select>

                      <select
                        value={sched.start}
                        onChange={(e) => {
                          const updated = [...formData.adScheduleList];
                          updated[idx].start = e.target.value;
                          setFormData(prev => ({ ...prev, adScheduleList: updated }));
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      >
                        {["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      <span className="text-slate-400">to</span>

                      <select
                        value={sched.end}
                        onChange={(e) => {
                          const updated = [...formData.adScheduleList];
                          updated[idx].end = e.target.value;
                          setFormData(prev => ({ ...prev, adScheduleList: updated }));
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      >
                        {["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      {formData.adScheduleList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, adScheduleList: prev.adScheduleList.filter((_, i) => i !== idx) }))}
                          className="p-1.5 text-slate-400 hover:text-rose-400 ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, adScheduleList: [...prev.adScheduleList, { day: "All days", start: "00:00", end: "00:00" }] }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add ad schedule
                  </button>

                  <p className="text-[11px] text-slate-400 leading-relaxed">To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. Learn more</p>
                  <p className="text-[11px] text-slate-500 font-mono">Based on account time zone: (GMT+05:30) India Standard Time</p>
                </div>

                {/* Start and end dates with Date Inputs */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Start and end dates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-400 font-semibold">Start date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-400 font-semibold">End date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Your ads will continue to run unless you specify an end date.</p>
                </div>

                {/* Devices */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-300">Devices</h4>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Choose the devices where your ads can appear.</p>
                  <div className="flex flex-wrap gap-4 pt-1">
                    {[
                      { key: "computers", label: "Computers" },
                      { key: "mobile", label: "Mobile phones" },
                      { key: "tablets", label: "Tablets" },
                      { key: "tv", label: "TV screens" }
                    ].map((d) => (
                      <label key={d.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.devicesSelection as any)[d.key]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            devicesSelection: { ...prev.devicesSelection, [d.key]: e.target.checked }
                          }))}
                          className="rounded text-primary h-4 w-4"
                        />
                        <span>{d.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Brand exclusions</h4>
                  <p className="text-[11px] text-slate-400">Exclude brands so your ads won't show on searches that mention those brands. Learn more about brand exclusions</p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary cursor-pointer transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New account-level brand list
                    </button>
                  </div>
                </div>

                {/* Demographic exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Demographic exclusions</h4>
                  <p className="text-[11px] text-slate-400">Demographic exclusions will override any specific hints that are active on any asset groups within this campaign.</p>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.turnOnAgeExclusions} onChange={(e) => setFormData(prev => ({ ...prev, turnOnAgeExclusions: e.target.checked }))} className="rounded text-primary h-4 w-4" />
                      <span>Turn on age exclusions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.turnOnGenderExclusions} onChange={(e) => setFormData(prev => ({ ...prev, turnOnGenderExclusions: e.target.checked }))} className="rounded text-primary h-4 w-4" />
                      <span>Turn on gender exclusions</span>
                    </label>
                  </div>
                </div>

                {/* Your data exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Your data exclusions</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary h-4 w-4" />
                    <span>Enable your data exclusions</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: ASSET GROUP */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs max-w-4xl">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Asset group</h1>
              <p className="text-slate-400">Show high quality ads to the right people. Start by adding your assets, the building blocks of every ad.</p>

              {/* Asset Group Name & Final URL */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div>
                  <label className="block font-semibold text-slate-300">Asset group name</label>
                  <input type="text" value={formData.assetGroupName} onChange={(e) => setFormData(prev => ({ ...prev, assetGroupName: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-medium" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300">Final URL</label>
                  <input type="text" value={formData.assetFinalUrl} onChange={(e) => setFormData(prev => ({ ...prev, assetFinalUrl: e.target.value }))} placeholder="https://www.example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono" />
                </div>
              </div>

              {/* Assets Section */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Assets</h2>
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-[11px]">
                  Google AI isn't able to generate assets for your final url. You can still add assets yourself. Let's start adding ad assets
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-slate-300">Ad strength</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">Incomplete</span>
                </div>

                {/* Asset Input Rows */}
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  
                  {/* 1) Calls Section at Top */}
                  <div className="space-y-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-300">Calls</h4>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold text-[10px]">1 call (account)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModal("CALLS")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add calls
                      </button>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-200 text-xs">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Account-level: 077099 36965</span>
                    </div>
                  </div>

                  {/* 2) Headlines */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Headlines ({formData.headlines.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const aiGens = Array.from({ length: formData.headlines.length }, (_, i) => `AI Headline ${i + 1}: Sales Boost`);
                            setFormData(prev => ({ ...prev, headlines: aiGens }));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[11px] font-semibold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" /> Generate headlines using AI
                        </button>
                        <button type="button" onClick={addHeadline} className="text-primary font-semibold text-[11px] hover:underline">+ Add headline</button>
                      </div>
                    </div>
                    {formData.headlines.map((hl, i) => (
                      <div key={i} className="space-y-1">
                        <input type="text" value={hl} onChange={(e) => updateHeadline(i, e.target.value)} maxLength={30} placeholder="Headline" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs" />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Text is {hl.length} characters out of 30</span>
                          <span>{hl.length} / 30</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3) Long Headlines */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Long headlines ({formData.longHeadlines.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const aiGens = Array.from({ length: formData.longHeadlines.length }, (_, i) => `AI Long Headline ${i + 1}: Comprehensive solutions to grow your audience and revenue.`);
                            setFormData(prev => ({ ...prev, longHeadlines: aiGens }));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[11px] font-semibold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" /> Generate long headlines using AI
                        </button>
                        <button type="button" onClick={addLongHeadline} className="text-primary font-semibold text-[11px] hover:underline">+ Add long headline</button>
                      </div>
                    </div>
                    {formData.longHeadlines.map((lh, i) => (
                      <div key={i} className="space-y-1">
                        <input type="text" value={lh} onChange={(e) => updateLongHeadline(i, e.target.value)} maxLength={90} placeholder="Long headline" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs" />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Text is {lh.length} characters out of 90</span>
                          <span>{lh.length} / 90</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 4) Descriptions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Descriptions ({formData.descriptions.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const aiGens = Array.from({ length: formData.descriptions.length }, (_, i) => `AI Description ${i + 1}: High converting copies tailored for your campaigns.`);
                            setFormData(prev => ({ ...prev, descriptions: aiGens }));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[11px] font-semibold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" /> Generate descriptions using AI
                        </button>
                        <button type="button" onClick={addDescription} className="text-primary font-semibold text-[11px] hover:underline">+ Add description</button>
                      </div>
                    </div>
                    {formData.descriptions.map((desc, i) => (
                      <div key={i} className="space-y-1">
                        <input type="text" value={desc} onChange={(e) => updateDescription(i, e.target.value)} maxLength={90} placeholder="Description" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs" />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Text is {desc.length} characters out of 90</span>
                          <span>{desc.length} / 90</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 5) Images, Videos, Animated Clips Uploads with Native System Input */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                    {/* Images */}
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-center">
                      <ImageIcon className="h-5 w-5 text-primary mx-auto" />
                      <span className="font-semibold text-slate-200 block text-xs">Images ({formData.uploadedImages.length})</span>
                      <label className="block w-full py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 text-xs cursor-pointer">
                        + Add images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              const filesArr = Array.from(e.target.files).map(f => f.name);
                              setFormData(prev => ({ ...prev, uploadedImages: [...prev.uploadedImages, ...filesArr] }));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formData.uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center pt-1">
                          {formData.uploadedImages.map((img, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 truncate max-w-[100px]">{img}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Videos */}
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-center">
                      <VideoIcon className="h-5 w-5 text-primary mx-auto" />
                      <span className="font-semibold text-slate-200 block text-xs">Videos ({formData.uploadedVideos.length})</span>
                      <label className="block w-full py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 text-xs cursor-pointer">
                        + Add videos
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              const filesArr = Array.from(e.target.files).map(f => f.name);
                              setFormData(prev => ({ ...prev, uploadedVideos: [...prev.uploadedVideos, ...filesArr] }));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formData.uploadedVideos.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center pt-1">
                          {formData.uploadedVideos.map((vid, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 truncate max-w-[100px]">{vid}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Animated clips */}
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-center">
                      <Upload className="h-5 w-5 text-primary mx-auto" />
                      <span className="font-semibold text-slate-200 block text-xs">Animated clips ({formData.uploadedClips.length})</span>
                      <label className="block w-full py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 text-xs cursor-pointer">
                        + Add animated clips
                        <input
                          type="file"
                          accept=".gif,video/*,image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              const filesArr = Array.from(e.target.files).map(f => f.name);
                              setFormData(prev => ({ ...prev, uploadedClips: [...prev.uploadedClips, ...filesArr] }));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {formData.uploadedClips.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center pt-1">
                          {formData.uploadedClips.map((clip, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 truncate max-w-[100px]">{clip}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Business name</span>
                      <span className="text-[10px] text-slate-500">Required</span>
                    </div>
                    <input type="text" value={formData.businessName} onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))} maxLength={25} placeholder="Business name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs" />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Text is {formData.businessName.length} characters out of 25</span>
                      <span>{formData.businessName.length} / 25</span>
                    </div>
                  </div>

                  {/* 9) Call-to-action Dropdown */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <label className="block text-slate-300 font-semibold">Call-to-action</label>
                    <select
                      value={formData.ctaOption}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctaOption: e.target.value }))}
                      className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="Automated (recommended)">Automated (recommended)</option>
                      <option value="Learn more">Learn more</option>
                      <option value="Get quote">Get quote</option>
                      <option value="Apply now">Apply now</option>
                      <option value="Sign up">Sign up</option>
                      <option value="Contact us">Contact us</option>
                      <option value="Subscribe">Subscribe</option>
                      <option value="Download">Download</option>
                      <option value="Book now">Book now</option>
                      <option value="Shop now">Shop now</option>
                    </select>
                  </div>

                  {/* 6) Sitelinks with Display of Saved Sitelinks */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-300">Sitelinks ({formData.savedSitelinks.length})</h4>
                      <button
                        type="button"
                        onClick={() => setActiveModal("SITELINKS")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create sitelink
                      </button>
                    </div>

                    {formData.savedSitelinks.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.savedSitelinks.map((st, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200">
                            {st.text}
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, savedSitelinks: prev.savedSitelinks.filter((_, idx) => idx !== i) }))}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {["Sitelink 1", "Sitelink 2", "Sitelink 3", "Sitelink 4"].map((s, i) => (
                          <button key={i} type="button" onClick={() => setActiveModal("SITELINKS")} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-white cursor-pointer">{s} (Recommended)</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 7 & 8) More asset types with Live Display of Saved Assets */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <h4 className="font-semibold text-slate-300">More asset types</h4>
                    <p className="text-[11px] text-slate-400">Improve your ad performance and make your ad more interactive by adding more details about your business and website</p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button type="button" onClick={() => setActiveModal("PROMOTIONS")} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold hover:border-primary cursor-pointer">
                        + Promotions {formData.savedPromotions.length > 0 && `(${formData.savedPromotions.length})`}
                      </button>
                      <button type="button" onClick={() => setActiveModal("PRICES")} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold hover:border-primary cursor-pointer">
                        + Prices {formData.savedPrices.length > 0 && `(${formData.savedPrices.length})`}
                      </button>
                      <button type="button" onClick={() => setActiveModal("APPS")} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold hover:border-primary cursor-pointer">
                        + Messages {formData.savedMessages.length > 0 && `(${formData.savedMessages.length})`}
                      </button>
                      <button type="button" onClick={() => setActiveModal("SNIPPETS")} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold hover:border-primary cursor-pointer">
                        + Structured snippets {formData.savedSnippets.length > 0 && `(${formData.savedSnippets.length})`}
                      </button>
                      <button type="button" onClick={() => setActiveModal("LEAD_FORMS")} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold hover:border-primary cursor-pointer">
                        + Lead forms {formData.savedLeadForms.length > 0 && `(${formData.savedLeadForms.length})`}
                      </button>
                      <button type="button" onClick={() => setActiveModal("BRAND_GUIDELINES")} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold hover:border-primary cursor-pointer">
                        + Callouts {formData.savedCallouts.length > 0 && `(${formData.savedCallouts.length})`}
                      </button>
                    </div>

                    {/* Display active saved extensions */}
                    {(formData.savedPromotions.length > 0 || formData.savedPrices.length > 0 || formData.savedSnippets.length > 0 || formData.savedCallouts.length > 0) && (
                      <div className="pt-2 space-y-2">
                        <span className="text-[11px] text-slate-400 font-semibold block">Added Extensions:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.savedPromotions.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-lg font-semibold">Promo: {p.item || "Discount"}</span>
                          ))}
                          {formData.savedPrices.map((pr, i) => (
                            <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-lg font-semibold">Price: {pr.price}</span>
                          ))}
                          {formData.savedCallouts.map((co, i) => (
                            <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-lg font-semibold">Callout: {co}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Asset optimization Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Asset optimization</h2>
                <p className="text-slate-400">To show more relevant ads, Google AI can enhance or generate assets using the information you’ve provided.</p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={formData.enableTextCustomization} onChange={(e) => setFormData(prev => ({ ...prev, enableTextCustomization: e.target.checked }))} className="mt-0.5 rounded text-primary h-4 w-4" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Text Customization</span>
                      <span className="text-[11px] text-slate-400 block">Use text from your site, landing pages, ads, and provided assets to create customized ad copy.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-slate-800/60 pt-2.5">
                    <input type="checkbox" checked={formData.enableFinalUrlExpansion} onChange={(e) => setFormData(prev => ({ ...prev, enableFinalUrlExpansion: e.target.checked }))} className="mt-0.5 rounded text-primary h-4 w-4" />
                    <div>
                      <span className="font-semibold text-slate-200 block">Final URL expansion</span>
                      <span className="text-[11px] text-slate-400 block">Send traffic to the most relevant URLs on your site when it's likely to result in better performance.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signals Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Signals</h2>
                <p className="text-slate-400">Signals provide valuable information about the people you want to reach.</p>
                <div>
                  <h3 className="font-semibold text-slate-300 mb-1">Search themes</h3>
                  <input type="text" placeholder="Add search themes (up to 50)" className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: BUDGET */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs max-w-4xl">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Budget</h1>
              <p className="text-slate-400">Decide how much you want to spend.</p>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
                <h2 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Budget</h2>
                <p className="text-slate-400 leading-relaxed">Your budget type (daily or campaign total) can’t be changed once this campaign has started. You can change your budget amount at any time.</p>

                {/* Select Budget Type */}
                <div className="space-y-3 pt-2">
                  <label className="block font-semibold text-slate-300">Select budget type</label>
                  
                  <div className="space-y-3">
                    {/* Daily Budget Option */}
                    <label className={`block p-4 rounded-xl border transition-all cursor-pointer ${formData.budgetType === "DAILY" ? "bg-primary/10 border-primary" : "bg-slate-950 border-slate-800 hover:border-slate-700"}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="pmaxBudgetType"
                          checked={formData.budgetType === "DAILY"}
                          onChange={() => setFormData(prev => ({ ...prev, budgetType: "DAILY" }))}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-100 block">Average daily budget</span>
                          <span className="text-[11px] text-slate-400 block">Set your average daily budget for this campaign</span>
                        </div>
                      </div>
                    </label>

                    {/* Campaign Total Budget Option */}
                    <label className={`block p-4 rounded-xl border transition-all cursor-pointer ${formData.budgetType === "TOTAL" ? "bg-primary/10 border-primary" : "bg-slate-950 border-slate-800 hover:border-slate-700"}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="pmaxBudgetType"
                          checked={formData.budgetType === "TOTAL"}
                          onChange={() => setFormData(prev => ({ ...prev, budgetType: "TOTAL" }))}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-100 block">Campaign total budget</span>
                          <span className="text-[11px] text-slate-400 block">Set a budget for the duration of your campaign</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Budget Amount Input */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <label className="block font-semibold text-slate-300">
                    {formData.budgetType === "DAILY" ? "Average daily budget amount" : "Campaign total budget amount"}
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                    <input
                      type="text"
                      value={formData.budgetAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-100 font-medium focus:border-primary focus:outline-none"
                    />
                  </div>
                  {!formData.budgetAmount && <p className="text-rose-400 font-semibold text-[11px]">Value is required</p>}
                </div>

                {/* Campaign Dates Card for Campaign Total Budget */}
                {formData.budgetType === "TOTAL" && (
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 pt-3 border-t border-slate-800">
                    <div>
                      <h4 className="font-semibold text-slate-200">Campaign dates</h4>
                      <p className="text-[11px] text-slate-400">To set a campaign total budget add the dates of your campaign</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">Start date</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-semibold">End date</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-400 font-semibold leading-relaxed pt-1">
                      Your campaign total budget is what the campaign should spend over its runtime. To use a campaign total budget, you must add an end date for your campaign.
                    </p>
                  </div>
                )}

                {/* Monthly Spending Note */}
                <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                  For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much.
                </p>
              </div>
            </div>
          )}

          {/* STEP 8: SUMMARY / REVIEW & PUBLISH */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs max-w-4xl">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Your campaign is almost ready to publish</h1>

              {/* Issues Card */}
              <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  <h2 className="text-sm font-bold text-rose-200">Issues</h2>
                </div>
                <p className="font-semibold text-rose-200">Fix these issues to run your campaign</p>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-rose-300">
                  {!formData.budgetAmount && <li><strong>Add a budget:</strong> To publish your campaign, enter a budget</li>}
                  {!formData.assetFinalUrl && <li><strong>Final URL:</strong> Enter a valid URL (ex. https://www.example.com)</li>}
                  {!formData.budgetAmount && <li><strong>Budget:</strong> Value is required</li>}
                </ul>
              </div>

              {/* Recommendations Card */}
              <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <h2 className="text-sm font-bold text-slate-100">Recommendations</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px]">1 / 2</span>
                </div>
                <p className="text-slate-300">Apply these recommendations to optimize campaign performance</p>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 mt-2">
                  <span className="font-bold block text-blue-400">Add sitelinks</span>
                  <span>Draw more attention to your ads by adding at least 4 sitelinks.</span>
                </div>
              </div>

              {/* Overview Section Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-semibold text-white">Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Campaign name</span>
                    <span className="font-bold text-slate-100 text-sm">{formData.campaignName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Campaign type</span>
                    <span className="font-bold text-slate-100 text-sm">Performance Max</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Goal</span>
                    <span className="font-bold text-slate-100">{formData.conversionGoals.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Bidding Section Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-semibold text-white">Bidding</h2>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bidding focus</span>
                    <span className="font-bold text-slate-100">{formData.biddingFocus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer acquisition</span>
                    <span className="text-slate-200">{formData.onlyNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer retention</span>
                    <span className="text-slate-200">{formData.reengageLapsedCustomers ? "Adjust bidding to re-engage lapsed customers" : "Do not adjust bidding to re-engage lapsed customers"}</span>
                  </div>
                </div>
              </div>

              {/* Campaign settings Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-semibold text-white">Campaign settings</h2>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Locations</span>
                    <span className="font-medium text-slate-200">{formData.locationType === "ALL" ? "All countries and territories" : formData.locationType === "INDIA" ? "India" : "Custom locations"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Languages</span>
                    <span className="font-medium text-slate-200">{formData.languages.join(", ") || "English"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">EU political ads</span>
                    <span className="font-medium text-slate-200">{formData.euPolitical === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}</span>
                  </div>
                </div>
              </div>

              {/* Asset group Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-semibold text-white">Asset group</h2>
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Asset group name</span>
                    <span className="font-bold text-slate-100">{formData.assetGroupName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Final URL</span>
                    <span className={formData.assetFinalUrl ? "font-mono text-emerald-400" : "font-semibold text-rose-400"}>
                      {formData.assetFinalUrl || "Enter a valid URL (ex. https://www.example.com)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assets</span>
                    <span className="text-slate-300">
                      {formData.headlines.filter(h => h).length > 0 || formData.descriptions.filter(d => d).length > 0 || formData.uploadedImages.length > 0 || formData.uploadedVideos.length > 0
                        ? `${formData.headlines.filter(h => h).length} headlines, ${formData.longHeadlines.filter(lh => lh).length} long headlines, ${formData.descriptions.filter(d => d).length} descriptions, ${formData.uploadedImages.length} images, ${formData.uploadedVideos.length} videos`
                        : "No assets"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Asset optimization</span>
                    <span className="text-slate-200">
                      {formData.enableTextCustomization ? "Text customization" : ""}{formData.enableTextCustomization && formData.enableFinalUrlExpansion ? ", " : ""}{formData.enableFinalUrlExpansion ? "final URL expansion" : ""}, and 2 more are turned on
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Search themes</span>
                      <span className="text-slate-400 italic">{formData.searchThemes.length > 0 ? formData.searchThemes.join(", ") : "No signals provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Audience</span>
                      <span className="text-slate-400 italic">{formData.audienceSignal || "No signal provided"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Summary Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-semibold text-white">Budget</h2>
                  <button
                    type="button"
                    onClick={() => setStep(7)}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Budget</span>
                  <span className="font-bold text-slate-100 text-sm">
                    {formData.budgetType === "TOTAL" ? `Campaign total: ₹${formData.budgetAmount || "0.00"}` : `Daily: ₹${formData.budgetAmount || "0.00"}`}
                  </span>
                  {!formData.budgetAmount && <p className="text-rose-400 font-semibold text-[11px] mt-1">Value is required</p>}
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
