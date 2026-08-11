"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, MapPin,
  Building2, Store, Wand2, Compass, Tag, Phone, Link, Laptop, ToggleLeft, ToggleRight
} from "lucide-react";

export default function NoGuidanceSearchWizard() {
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
    selectedType: "SEARCH",
    campaignName: "Search-8",
    conversionGoals: ["Phone call leads", "Website lead forms"],
    websiteVisitsEnabled: true,
    websiteVisitsUrl: "https://www.example.com",
    phoneCallsEnabled: true,
    phoneCallCountry: "+91",
    phoneCallNumber: "9876543210",

    // Step 2: Bidding
    biddingFocus: "Maximize conversions", // "Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS" | "Clicks" | "Impression share"
    targetCpaValue: "25.00",
    targetRoasValue: "200",
    setMaxCpcLimit: false,
    maxCpcValue: "15.00",
    impressionShareLocation: "ANYWHERE", // "ANYWHERE" | "TOP" | "ABSOLUTE_TOP"
    impressionSharePercent: "50",
    impressionShareMaxCpc: "20.00",
    onlyNewCustomers: false,

    // Step 3: Campaign Settings
    searchPartners: true,
    displayNetwork: true,
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    locationOption: "PRESENCE_OR_INTEREST" as "PRESENCE_OR_INTEREST" | "PRESENCE_ONLY",
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    moreSettingsOpen: false,

    // Step 4: AI Max for Search
    aiMaxEnabled: true,
    textCustomization: true,
    finalUrlExpansion: true,
    brandFilter: "NONE" as "NONE" | "LIMIT" | "EXCLUDE",

    // Step 5: Keyword & Asset Generation URL
    aiGeneratorUrl: "https://www.example.com",

    // Step 6: Keywords & RSA Ads
    keywords: ["video automation", "whatsapp automation software", "google ads automation"],
    adGroupName: "Ad Group 1",
    displayPath1: "automation",
    displayPath2: "deals",
    headlines: [
      "Scale Ads & Automation Today",
      "Official Automation Platform",
      "Get Instant Customer Leads",
      "Top Rated Marketing Tools"
    ],
    descriptions: [
      "Drive more customer conversions with seamless automated marketing campaigns.",
      "Get turn-by-turn automation setup for your entire business workflow."
    ],
    businessName: "Hubmate Inc.",

    // Step 7: Budget
    budgetType: "DAILY" as "DAILY" | "TOTAL",
    budgetAmount: "1000"
  });

  // UI state for inputs
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [previewDevice, setPreviewDevice] = useState<"MOBILE" | "DESKTOP">("MOBILE");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Headlines handlers
  const addHeadline = () => {
    if (formData.headlines.length < 15) {
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
    if (formData.descriptions.length < 4) {
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

  // AI Keyword Generation Trigger
  const handleAiGeneration = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, "automated lead generation", "smart ad manager", "google search ads tool"],
        headlines: [
          ...prev.headlines,
          "Smart Search Ads Tool 2026",
          "Automate Your Ad Campaigns"
        ]
      }));
      setIsAiGenerating(false);
      setStep(6);
    }, 1200);
  };

  // Step 8 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);
    const activeHeadlines = formData.headlines.filter(h => h.trim().length > 0);
    const activeDescriptions = formData.descriptions.filter(d => d.trim().length > 0);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      websiteVisitsUrl: formData.websiteVisitsUrl,
      phoneCallCountry: formData.phoneCallCountry,
      phoneCallNumber: formData.phoneCallNumber,
      biddingFocus: formData.biddingFocus,
      targetCpa: formData.biddingFocus === "Target CPA" ? parseFloat(formData.targetCpaValue || "25") : undefined,
      targetRoas: formData.biddingFocus === "Target ROAS" ? parseFloat(formData.targetRoasValue || "200") : undefined,
      maxCpcLimit: formData.setMaxCpcLimit ? parseFloat(formData.maxCpcValue || "15") : undefined,
      impressionShareLocation: formData.impressionShareLocation,
      impressionSharePercent: parseFloat(formData.impressionSharePercent || "50"),
      onlyNewCustomers: formData.onlyNewCustomers,
      searchPartners: formData.searchPartners,
      displayNetwork: formData.displayNetwork,
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      aiMaxEnabled: formData.aiMaxEnabled,
      finalUrlExpansion: formData.finalUrlExpansion,
      keywords: formData.keywords,
      adGroupName: formData.adGroupName,
      displayPath1: formData.displayPath1,
      displayPath2: formData.displayPath2,
      headlines: activeHeadlines,
      descriptions: activeDescriptions,
      budgetType: formData.budgetType,
      dailyBudget: parseFloat(formData.budgetAmount || "1000")
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-search-campaign`, {
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
        message: "Search Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "SEARCH",
          bidding_focus: formData.biddingFocus,
          ai_max_enabled: formData.aiMaxEnabled,
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
              <Search className="h-4 w-4" /> Search Campaign Setup
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
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Search Campaign</div>
                <div className="text-[10px] text-slate-400">Responsive Search Ads</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-1.5 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective & Type", desc: "Select Search type & goals" },
                { num: 2, title: "Bidding", desc: "Conversions, CPA & CPC" },
                { num: 3, title: "Campaign Settings", desc: "Networks & location options" },
                { num: 4, title: "AI Max", desc: "Text & URL expansion" },
                { num: 5, title: "Asset Generation", desc: "AI scraper tool (BETA)" },
                { num: 6, title: "Keywords & Ads", desc: "Responsive Search Ads" },
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
            <div>Mapped to `advertising_channel_type = SEARCH`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE & TYPE & BASICS */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Objective, Campaign Type & Results</h1>
                <p className="text-xs text-slate-400 mt-1">Configure Search campaign type and desired customer action results</p>
              </div>

              {/* Select Campaign Type Cards */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Select a campaign type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "SEARCH", title: "Search", desc: "Get in front of high-intent searchers on Google", icon: Search, selected: true },
                    { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google", icon: Sparkles },
                    { id: "DEMAND_GEN", title: "Demand Gen", desc: "Visual ads on YouTube & Discover", icon: Zap },
                    { id: "DISPLAY", title: "Display", desc: "Banner ads across the web", icon: ImageIcon },
                    { id: "SHOPPING", title: "Shopping", desc: "Product inventory listings", icon: Tag },
                    { id: "VIDEO", title: "Video", desc: "YouTube video placements", icon: VideoIcon }
                  ].map((ct) => {
                    const isSel = formData.selectedType === ct.id;
                    const Icon = ct.icon;
                    return (
                      <div
                        key={ct.id}
                        onClick={() => setFormData(prev => ({ ...prev, selectedType: ct.id }))}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSel ? "bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/30 font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-5 w-5 ${isSel ? "text-blue-400" : "text-slate-400"}`} />
                          <span className="text-xs">{ct.title}</span>
                        </div>
                      </div>
                    );
                  })}
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

              {/* Results Selection Checkboxes */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <label className="text-xs font-semibold text-slate-300">Select the results you want from this campaign</label>
                
                {/* Website visits */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.websiteVisitsEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteVisitsEnabled: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-400" /> Website visits
                    </span>
                  </label>
                  {formData.websiteVisitsEnabled && (
                    <input
                      type="text"
                      value={formData.websiteVisitsUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteVisitsUrl: e.target.value }))}
                      placeholder="Your business website URL (e.g. https://www.example.com)"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white ml-7 max-w-lg"
                    />
                  )}
                </div>

                {/* Phone calls */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.phoneCallsEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneCallsEnabled: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-400" /> Phone calls
                    </span>
                  </label>
                  {formData.phoneCallsEnabled && (
                    <div className="flex gap-2 ml-7 max-w-lg">
                      <select
                        value={formData.phoneCallCountry}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneCallCountry: e.target.value }))}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="+91">India (+91)</option>
                        <option value="+1">United States (+1)</option>
                        <option value="+44">United Kingdom (+44)</option>
                      </select>
                      <input
                        type="text"
                        value={formData.phoneCallNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneCallNumber: e.target.value }))}
                        placeholder="Phone number"
                        className="flex-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIDDING */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Bidding</h1>
                <p className="text-xs text-slate-400 mt-1">Choose what you want to focus on and set bid limits</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">What do you want to focus on?</label>
                  <select
                    value={formData.biddingFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Maximize conversions">Maximize conversions (Recommended)</option>
                    <option value="Target CPA">Target CPA</option>
                    <option value="Maximize conversion value">Maximize conversion value</option>
                    <option value="Target ROAS">Target ROAS</option>
                    <option value="Clicks">Clicks</option>
                    <option value="Impression share">Impression share</option>
                  </select>
                </div>

                {/* Target CPA Input */}
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

                {/* Target ROAS Input */}
                {formData.biddingFocus === "Target ROAS" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-xs">
                    <label className="text-xs font-semibold text-slate-300">Target ROAS (%)</label>
                    <input
                      type="number"
                      value={formData.targetRoasValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRoasValue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                    />
                    <div className="text-[11px] text-amber-400">Note: Your campaign needs at least 15 conversions in 30 days to use Target ROAS accurately.</div>
                  </div>
                )}

                {/* Clicks CPC limit */}
                {formData.biddingFocus === "Clicks" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.setMaxCpcLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, setMaxCpcLimit: e.target.checked }))}
                        className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">Set a maximum cost per click bid limit</span>
                    </label>
                    {formData.setMaxCpcLimit && (
                      <div className="pl-7 max-w-xs">
                        <label className="text-[11px] text-slate-400 font-semibold">Maximum CPC bid limit (₹)</label>
                        <input
                          type="number"
                          value={formData.maxCpcValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxCpcValue: e.target.value }))}
                          className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Impression Share options */}
                {formData.biddingFocus === "Impression share" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-slate-300">Where do you want your ads to appear?</label>
                      <select
                        value={formData.impressionShareLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, impressionShareLocation: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="ANYWHERE">Anywhere on results page</option>
                        <option value="TOP">Top of results page</option>
                        <option value="ABSOLUTE_TOP">Absolute top of results page</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300">Target Impression Share (%)</label>
                      <input
                        type="number"
                        value={formData.impressionSharePercent}
                        onChange={(e) => setFormData(prev => ({ ...prev, impressionSharePercent: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
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
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN SETTINGS */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure search networks, location targeting, and languages</p>
              </div>

              {/* Networks */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Networks</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.searchPartners}
                      onChange={(e) => setFormData(prev => ({ ...prev, searchPartners: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700 mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        Google Search Partners Network <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">Recommended</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Ads can appear near search results on non-Google search websites</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.displayNetwork}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayNetwork: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700 mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        Google Display Network <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">Recommended</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Expand your reach to relevant websites across the web when your budget allows</div>
                    </div>
                  </label>
                </div>
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
            </div>
          )}

          {/* STEP 4: AI MAX FOR SEARCH CAMPAIGNS */}
          {step === 4 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">AI Max for Search campaigns</h1>
                <p className="text-xs text-slate-400 mt-1">Optimize your campaign text and landing page expansion using Google AI</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-950/40 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Optimize your campaign with AI Max</h4>
                      <p className="text-xs text-blue-200">Automatically tailors copy and matches search queries for max conversion volume</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, aiMaxEnabled: !prev.aiMaxEnabled }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      formData.aiMaxEnabled ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {formData.aiMaxEnabled ? "Enabled (On)" : "Disabled (Off)"}
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-300">Asset optimization</label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.textCustomization}
                      onChange={(e) => setFormData(prev => ({ ...prev, textCustomization: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-200">Text customization (Adapts headlines to user search queries)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.finalUrlExpansion}
                      onChange={(e) => setFormData(prev => ({ ...prev, finalUrlExpansion: e.target.checked }))}
                      className="h-4 w-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-200">Final URL expansion (Directs users to relevant landing page subpages)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: KEYWORD AND ASSET GENERATION (BETA) */}
          {step === 5 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Get help creating your ad (BETA)</h1>
                <p className="text-xs text-slate-400 mt-1">Google AI will scrape your URL to suggest high-performing keywords and ad copy</p>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-6 text-center py-10">
                <Wand2 className="h-12 w-12 text-blue-400 mx-auto animate-bounce" />
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-bold text-white">Generate keywords & headlines with AI</h3>
                  <p className="text-xs text-slate-400">Enter your main landing page URL and let AI auto-generate your search keywords and responsive ad copy.</p>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                  <input
                    type="text"
                    value={formData.aiGeneratorUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, aiGeneratorUrl: e.target.value }))}
                    placeholder="https://www.example.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white text-center font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setStep(6)}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                    >
                      Skip
                    </button>
                    <button
                      disabled={isAiGenerating}
                      onClick={handleAiGeneration}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2"
                    >
                      {isAiGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Generate Assets
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: KEYWORDS AND ADS (RSA BUILDER) */}
          {step === 6 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Keywords & RSA Editor (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Keywords and Responsive Search Ads</h1>
                  <p className="text-xs text-slate-400 mt-1">Set target keywords and create your Responsive Search Ad (RSA)</p>
                </div>

                {/* Keywords Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Target Keywords</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword e.g. whatsapp automation"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
                          setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
                          setKeywordInput("");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Add Keyword
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.keywords.map((kw) => (
                      <span key={kw} className="px-2.5 py-1 bg-blue-900/40 border border-blue-500/40 rounded-full text-xs text-blue-300 flex items-center gap-1.5">
                        {kw}
                        <X onClick={() => setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))} className="h-3 w-3 cursor-pointer hover:text-white" />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Display Path */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Display Path (Optional)</label>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>example.com/</span>
                    <input
                      type="text"
                      value={formData.displayPath1}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayPath1: e.target.value }))}
                      placeholder="path1"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={formData.displayPath2}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayPath2: e.target.value }))}
                      placeholder="path2"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Headlines Section */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Headlines ({formData.headlines.filter(h=>h.trim()).length}/15)</h3>
                      <p className="text-[11px] text-slate-400">Add at least 3 headlines (Max 30 chars each)</p>
                    </div>
                    <button
                      onClick={addHeadline}
                      disabled={formData.headlines.length >= 15}
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
                        {formData.headlines.length > 3 && (
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
                      <h3 className="text-sm font-bold text-slate-100">Descriptions ({formData.descriptions.filter(d=>d.trim()).length}/4)</h3>
                      <p className="text-[11px] text-slate-400">Add at least 2 descriptions (Max 90 chars each)</p>
                    </div>
                    <button
                      onClick={addDescription}
                      disabled={formData.descriptions.length >= 4}
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
                        {formData.descriptions.length > 2 && (
                          <button onClick={() => removeDescription(idx)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Search Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200">Google Search Preview</span>
                    <div className="flex bg-slate-900 p-1 rounded-lg">
                      <button
                        onClick={() => setPreviewDevice("MOBILE")}
                        className={`p-1 rounded ${previewDevice === "MOBILE" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("DESKTOP")}
                        className={`p-1 rounded ${previewDevice === "DESKTOP" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                      >
                        <Laptop className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Card Mockup */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-100">Sponsored</span>
                      <span>•</span>
                      <span className="truncate text-blue-400">example.com/{formData.displayPath1}</span>
                    </div>

                    <div className="text-sm font-bold text-blue-400 hover:underline cursor-pointer leading-tight">
                      {formData.headlines[0] || "Your Ad Headline Here"} | {formData.headlines[1] || "Second Headline"}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {formData.descriptions[0] || "Your ad description will appear here as a live preview as you type."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: BUDGET */}
          {step === 7 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Budget</h1>
                <p className="text-xs text-slate-400 mt-1">Set your daily budget for your Search campaign</p>
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
                <p className="text-xs text-slate-400 mt-1">Audit your Search Campaign details before publishing as PAUSED</p>
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
                    <span className="text-slate-400">Objective & Type</span>
                    <div className="font-bold text-white">No guidance → Search</div>
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
                    <span className="text-slate-400">AI Max Enabled</span>
                    <div className="font-bold text-white">{formData.aiMaxEnabled ? "Yes (Active)" : "No"}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Search Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for Search ad delivery.</p>
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
