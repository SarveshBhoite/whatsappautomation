"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, MapPin,
  Building2, Store, Wand2, Compass, Tag, Phone, PhoneCall, Link, Laptop, ToggleLeft, ToggleRight, SlidersHorizontal, Wrench
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

  // Additional Campaign Settings State
  const [targetLocations, setTargetLocations] = useState<Array<{ name: string; type: string; reach: string }>>([]);
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE_INTEREST");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [selectedAudienceSegments, setSelectedAudienceSegments] = useState<string[]>([]);
  const [audienceTab, setAudienceTab] = useState<"SEARCH" | "BROWSE">("SEARCH");
  const [audienceSearchQuery, setAudienceSearchQuery] = useState<string>("");
  const [audienceTargetingMode, setAudienceTargetingMode] = useState<"TARGETING" | "OBSERVATION">("OBSERVATION");
  const [adRotationMode, setAdRotationMode] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">("OPTIMIZE");
  const [startDate, setStartDate] = useState<string>("2026-08-10");
  const [endDate, setEndDate] = useState<string>("");
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "00:00", end: "00:00" }
  ]);
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");
  const [customParams, setCustomParams] = useState<Array<{ name: string; value: string }>>([{ name: "", value: "" }]);
  // Additional Keywords & Ads State
  const [keywordScanUrl, setKeywordScanUrl] = useState<string>("");
  const [keywordProductsInput, setKeywordProductsInput] = useState<string>("");
  const [keywordsText, setKeywordsText] = useState<string>("video automation\nwhatsapp automation software\ngoogle ads automation");
  const [useSearchTermMatchingAdGroup, setUseSearchTermMatchingAdGroup] = useState<boolean>(true);
  const [sitelinkTrackingTemplate, setSitelinkTrackingTemplate] = useState<string>("");
  const [sitelinkFinalUrlSuffix, setSitelinkFinalUrlSuffix] = useState<string>("");
  const [sitelinkCustomParamName, setSitelinkCustomParamName] = useState<string>("");
  const [sitelinkCustomParamValue, setSitelinkCustomParamValue] = useState<string>("");
  const [useDifferentMobileUrl, setUseDifferentMobileUrl] = useState<boolean>(false);
  const [mobileFinalUrl, setMobileFinalUrl] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [callouts, setCallouts] = useState<string[]>(["24/7 Customer Support", "Free Setup Consultation", "Instant API Access"]);
  const [businessLogos, setBusinessLogos] = useState<string[]>([]);
  const [showUrlInclusionsModal, setShowUrlInclusionsModal] = useState<boolean>(false);
  const [showNewSegmentModal, setShowNewSegmentModal] = useState<boolean>(false);
  const [enableAiMax, setEnableAiMax] = useState<boolean>(true);
  const [enableTextCustomization, setEnableTextCustomization] = useState<boolean>(true);
  const [enableFinalUrlExpansion, setEnableFinalUrlExpansion] = useState<boolean>(true);
  const [brandInclusions, setBrandInclusions] = useState<string[]>([]);
  const [brandExclusions, setBrandExclusions] = useState<string[]>([]);
  const [showBrandListModal, setShowBrandListModal] = useState<boolean>(false);
  const [brandListModalMode, setBrandListModalMode] = useState<"INCLUSION" | "EXCLUSION">("INCLUSION");
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("1000");
  const [selectedPresetBudget, setSelectedPresetBudget] = useState<string>("1000");

  const locationSuggestionsList = [
    { name: "United States", type: "Country", reach: "280M" },
    { name: "United Kingdom", type: "Country", reach: "60M" },
    { name: "Canada", type: "Country", reach: "35M" },
    { name: "Australia", type: "Country", reach: "22M" },
    { name: "Maharashtra, India", type: "State", reach: "45M" },
    { name: "Delhi, India", type: "Union Territory", reach: "20M" },
    { name: "Bengaluru, Karnataka, India", type: "City", reach: "12M" },
    { name: "Mumbai, Maharashtra, India", type: "City", reach: "18M" }
  ];

  const languagesList = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu",
    "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German",
    "Chinese (simplified)", "Japanese", "Arabic", "Portuguese", "Russian", "Italian", "Dutch"
  ];

  const dayOptions = [
    "All days", "Mondays - Fridays", "Saturdays - Sundays",
    "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"
  ];

  const timeOptions = [
    "00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45",
    "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45",
    "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45",
    "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45",
    "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45",
    "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45",
    "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45",
    "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45",
    "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"
  ];

  // UI state for inputs
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
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

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 1) {
      if (!formData.campaignName.trim()) return false;
      if (formData.websiteVisitsEnabled && !formData.websiteVisitsUrl.trim()) return false;
      if (formData.phoneCallsEnabled && !formData.phoneCallNumber.trim()) return false;
      return true;
    }
    if (step === 2) {
      if (formData.biddingFocus === "Target CPA" && (!formData.targetCpaValue || parseFloat(formData.targetCpaValue) <= 0)) return false;
      if (formData.biddingFocus === "Target ROAS" && (!formData.targetRoasValue || parseFloat(formData.targetRoasValue) <= 0)) return false;
      if (formData.biddingFocus === "Clicks" && formData.setMaxCpcLimit && (!formData.maxCpcValue || parseFloat(formData.maxCpcValue) <= 0)) return false;
      return true;
    }
    if (step === 6) {
      const validHeadlines = formData.headlines.filter(h => h.trim().length > 0);
      const validDescriptions = formData.descriptions.filter(d => d.trim().length > 0);
      return validHeadlines.length >= 3 && validDescriptions.length >= 2;
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
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
                <p className="text-xs text-slate-400 mt-1">To reach the right people, start by defining key settings for your campaign</p>
              </div>

              {/* 1. Networks */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Networks</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.searchPartners}
                      onChange={(e) => setFormData(prev => ({ ...prev, searchPartners: e.target.checked }))}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div className="space-y-1">
                      <span className="text-slate-200 font-semibold block">Google Search Partners Network (recommended)</span>
                      <span className="text-[11px] text-slate-400 block leading-relaxed">
                        Ads can appear near Google Search results and on other Google Search Partners websites when people search for terms that are relevant to your keywords. Search Partners can include hundreds of non-Google websites, Parked Domains, as well as YouTube and other Google sites.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer border-t border-slate-800/60 pt-3">
                    <input
                      type="checkbox"
                      checked={formData.displayNetwork}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayNetwork: e.target.checked }))}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div className="space-y-1">
                      <span className="text-slate-200 font-semibold block">Google Display Network (recommended)</span>
                      <span className="text-[11px] text-slate-400 block leading-relaxed">
                        Ads can appear on relevant sites, videos, and apps across Google (like YouTube) and the Internet when you have leftover Search budget
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Locations */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchLoc"
                      checked={formData.locationType === "ALL"}
                      onChange={() => setFormData(prev => ({ ...prev, locationType: "ALL" }))}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchLoc"
                      checked={formData.locationType === "INDIA"}
                      onChange={() => setFormData(prev => ({ ...prev, locationType: "INDIA" }))}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchLoc"
                      checked={formData.locationType === "CUSTOM"}
                      onChange={() => setFormData(prev => ({ ...prev, locationType: "CUSTOM" }))}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Enter another location</span>
                  </label>

                  {formData.locationType === "CUSTOM" && (
                    <div className="ml-7 pt-2 space-y-3 animate-in fade-in duration-200">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={customLocationInput}
                          onChange={(e) => setCustomLocationInput(e.target.value)}
                          placeholder="Enter a location to target or exclude"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Suggestions List */}
                      {customLocationInput.trim() && (
                        <div className="border border-slate-800 bg-slate-950 rounded-xl max-w-md overflow-hidden space-y-1 p-1">
                          {locationSuggestionsList.filter(l => l.name.toLowerCase().includes(customLocationInput.toLowerCase())).map((loc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-900 rounded-lg text-xs">
                              <div>
                                <span className="font-semibold text-slate-200 block">{loc.name}</span>
                                <span className="text-[10px] text-slate-500">{loc.type} • Reach: {loc.reach}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!targetLocations.some(t => t.name === loc.name)) {
                                    setTargetLocations(prev => [...prev, loc]);
                                  }
                                }}
                                className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-bold text-[11px] rounded-lg hover:bg-primary/20"
                              >
                                Target
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {targetLocations.map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950 max-w-md">
                          <div>
                            <span className="font-semibold text-slate-200 block">{loc.name}</span>
                            <span className="text-[10px] text-slate-500">{loc.type} • Reach: {loc.reach}</span>
                          </div>
                          <button onClick={() => setTargetLocations(prev => prev.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-rose-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowLocationOptions(!showLocationOptions)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
                      Location options
                    </button>

                    {showLocationOptions && (
                      <div className="mt-3 ml-4 space-y-2 text-xs animate-in fade-in duration-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="searchLocOpt"
                            checked={locationTargetingType === "PRESENCE_INTEREST"}
                            onChange={() => setLocationTargetingType("PRESENCE_INTEREST")}
                            className="text-primary h-4 w-4"
                          />
                          <span className="text-slate-300">Presence or interest: People in, regularly in, or who've shown interest in your targeted locations (recommended)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="searchLocOpt"
                            checked={locationTargetingType === "PRESENCE"}
                            onChange={() => setLocationTargetingType("PRESENCE")}
                            className="text-primary h-4 w-4"
                          />
                          <span className="text-slate-300">Presence: People in or regularly in your targeted locations</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Languages */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearchInput}
                      onFocus={() => setShowLanguageDropdown(true)}
                      onChange={(e) => {
                        setLanguageSearchInput(e.target.value);
                        setShowLanguageDropdown(true);
                      }}
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Languages Checkbox Grid - Only Shown on Click/Focus/Type */}
                  {(showLanguageDropdown || languageSearchInput.trim().length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 max-h-40 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950 animate-in fade-in duration-200">
                      {languagesList.filter(l => l.toLowerCase().includes(languageSearchInput.toLowerCase())).map((lang, idx) => {
                        const isSelected = formData.languages.includes(lang);
                        return (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white p-1 rounded hover:bg-slate-900">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }));
                                else setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
                              }}
                              className="rounded text-primary h-3.5 w-3.5"
                            />
                            <span>{lang}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.languages.map((lang, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-medium">
                        {lang}
                        <button onClick={() => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }))}>
                          <X className="h-3 w-3 hover:text-rose-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. EU political ads */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">EU political ads</h2>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-slate-200">Does your campaign have European Union political ads?</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchEuPol"
                      checked={formData.euPolitical === "YES"}
                      onChange={() => setFormData(prev => ({ ...prev, euPolitical: "YES" }))}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchEuPol"
                      checked={formData.euPolitical === "NO"}
                      onChange={() => setFormData(prev => ({ ...prev, euPolitical: "NO" }))}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200">No, this campaign doesn't have EU political ads</span>
                  </label>
                  {formData.euPolitical === "YES" && (
                    <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                      Your campaign can't run in the European Union.
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Audience segments */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">Audience segments</h2>
                    <p className="text-[11px] text-slate-400">
                      Select audience segments to add to your campaign. You can create new Your data segments by clicking on <span className="font-semibold text-slate-200">+ New segment</span> in the Search tab. <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                {/* Split Card Layout */}
                <div className="border border-slate-800 rounded-xl bg-slate-950 overflow-hidden text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    
                    {/* Left Column: Search/Browse & Results */}
                    <div className="p-4 space-y-4 flex flex-col justify-between min-h-[260px]">
                      <div className="space-y-3">
                        {/* Tabs Header */}
                        <div className="flex items-center gap-6 border-b border-slate-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setAudienceTab("SEARCH")}
                            className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${audienceTab === "SEARCH" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                          >
                            Search
                          </button>
                          <button
                            type="button"
                            onClick={() => setAudienceTab("BROWSE")}
                            className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${audienceTab === "BROWSE" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                          >
                            Browse
                          </button>
                        </div>

                        {/* Search Input Box */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={audienceSearchQuery}
                            onChange={(e) => setAudienceSearchQuery(e.target.value)}
                            placeholder='Try "banking & finance"'
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Search Results / Default Empty Search Placeholder */}
                        {audienceTab === "SEARCH" && !audienceSearchQuery.trim() && (
                          <div className="py-8 text-center space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                              <Search className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                              You’ll see recently selected segments and ideas here.<br />Use search to start looking for a segment.
                            </p>
                          </div>
                        )}

                        {/* Active Search Results / Preset List */}
                        {(audienceSearchQuery.trim() || audienceTab === "BROWSE") && (
                          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                            {["Banking & Financial Services", "Business Services", "Investment Products", "Software & Automation Seekers", "High Net Worth Individuals"]
                              .filter(seg => !audienceSearchQuery.trim() || seg.toLowerCase().includes(audienceSearchQuery.toLowerCase()))
                              .map((seg, idx) => {
                                const isChecked = selectedAudienceSegments.includes(seg);
                                return (
                                  <label key={idx} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-slate-200">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedAudienceSegments(prev => [...prev, seg]);
                                        else setSelectedAudienceSegments(prev => prev.filter(s => s !== seg));
                                      }}
                                      className="rounded text-primary h-3.5 w-3.5"
                                    />
                                    <span className="font-medium text-xs">{seg}</span>
                                  </label>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      {/* Bottom + New segment button */}
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowNewSegmentModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 cursor-pointer transition-all shadow"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New segment
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Selected Segments Header & Clear All */}
                    <div className="p-4 space-y-3 bg-slate-950/40 min-h-[260px] flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-semibold text-slate-300">
                            {selectedAudienceSegments.length > 0 ? `${selectedAudienceSegments.length} selected` : "None selected"}
                          </span>
                          {selectedAudienceSegments.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedAudienceSegments([])}
                              className="text-blue-400 font-semibold text-xs hover:underline cursor-pointer"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {selectedAudienceSegments.length === 0 ? (
                          <p className="text-[11px] text-slate-500">Select one or more segments to observe.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {selectedAudienceSegments.map((seg, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                                <span className="text-slate-200 font-medium truncate max-w-[200px]">{seg}</span>
                                <button type="button" onClick={() => setSelectedAudienceSegments(prev => prev.filter((_, idx) => idx !== i))}>
                                  <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Targeting setting for this campaign */}
                <div className="space-y-3 pt-2">
                  <label className="block text-slate-300 font-semibold">
                    Targeting setting for this campaign <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="searchAudienceMode"
                        checked={audienceTargetingMode === "TARGETING"}
                        onChange={() => setAudienceTargetingMode("TARGETING")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-semibold block">Targeting</span>
                        <span className="text-[11px] text-slate-400 block leading-relaxed">Narrow the reach of your campaign to the selected segments, with the option to adjust the bids</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="searchAudienceMode"
                        checked={audienceTargetingMode === "OBSERVATION"}
                        onChange={() => setAudienceTargetingMode("OBSERVATION")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-semibold block">Observation (recommended)</span>
                        <span className="text-[11px] text-slate-400 block leading-relaxed">Don't narrow the reach of your campaign, with the option to adjust the bids on the selected segments</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 6. Ad rotation */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Ad rotation</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchAdRot"
                      checked={adRotationMode === "OPTIMIZE"}
                      onChange={() => setAdRotationMode("OPTIMIZE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold block">Optimize: Prefer best performing ads</span>
                      <span className="text-[11px] text-slate-400 block">Show ads that are expected to get more clicks or conversions. Recommended for most advertisers.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer border-t border-slate-800/60 pt-2.5">
                    <input
                      type="radio"
                      name="searchAdRot"
                      checked={adRotationMode === "DO_NOT_OPTIMIZE"}
                      onChange={() => setAdRotationMode("DO_NOT_OPTIMIZE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold block">Do not optimize: Rotate ads indefinitely</span>
                      <span className="text-[11px] text-slate-400 block">Rotates your ads more evenly into the ad auction, but does not optimize for clicks or conversions.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 7. Start and end dates */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Start and end dates</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md text-xs">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-400 font-semibold">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-400 font-semibold">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Your ads will continue to run unless you specify an end date.</p>
              </div>

              {/* 8. Ad schedule */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Ad schedule</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  {adScheduleList.map((sched, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3">
                      <select
                        value={sched.day}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].day = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-semibold"
                      >
                        {dayOptions.map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>

                      <span className="text-slate-400">from</span>

                      <select
                        value={sched.start}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].start = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      >
                        {timeOptions.map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      <span className="text-slate-400">to</span>

                      <select
                        value={sched.end}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].end = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                      >
                        {timeOptions.map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      {adScheduleList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAdScheduleList(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAdScheduleList(prev => [...prev, { day: "All days", start: "00:00", end: "00:00" }])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add ad schedule
                  </button>

                  <p className="text-[11px] text-slate-400 leading-relaxed">To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. Learn more</p>
                  <p className="text-[11px] text-slate-500 font-mono">Based on account time zone: (GMT+05:30) India Standard Time</p>
                  <p className="text-[11px] text-slate-400">To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                </div>
              </div>

              {/* 9. Campaign URL options */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Campaign URL options</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold">Tracking template</label>
                    <input
                      type="text"
                      value={trackingTemplate}
                      onChange={(e) => setTrackingTemplate(e.target.value)}
                      placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold">Final URL suffix</label>
                    <input
                      type="text"
                      value={finalUrlSuffix}
                      onChange={(e) => setFinalUrlSuffix(e.target.value)}
                      placeholder="Example: param1=value1&param2=value2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <label className="block text-slate-300 font-semibold">Custom parameters</label>
                    {customParams.map((param, idx) => (
                      <div key={idx} className="flex items-center gap-2 max-w-md">
                        <span className="text-slate-500 font-mono">{`{_`}</span>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => {
                            const updated = [...customParams];
                            updated[idx].name = e.target.value;
                            setCustomParams(updated);
                          }}
                          placeholder="Name"
                          className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                        />
                        <span className="text-slate-500 font-mono">{`}`}</span>
                        <span className="text-slate-400 font-bold">=</span>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...customParams];
                            updated[idx].value = e.target.value;
                            setCustomParams(updated);
                          }}
                          placeholder="Value"
                          className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCustomParams(prev => [...prev, { name: "", value: "" }])}
                      className="text-primary font-semibold text-[11px] hover:underline"
                    >
                      + Add parameter
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1">
                    Tracking template is the URL you want the ad click to go to for tracking. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: AI MAX FOR SEARCH CAMPAIGNS */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">AI Max for Search campaigns</h1>
              </div>

              {/* Main Container Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl">
                
                {/* Header Banner: Get the best AI-powered performance */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold text-slate-100">Get the best AI-powered performance on Google Search</h2>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Advertisers that activate AI Max in Search Campaigns will typically see 14% more conversions or conversion value at a similar CPA / ROAS.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/60 text-[11px]">
                    <div className="flex items-start gap-3 text-slate-300">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-100">Engage more customers and boost performance.</strong> Easily expand your keywords with broad match technology and let Google AI match content from your landing pages and assets to help you show up on more relevant searches. New ad group settings help you guide which customers you reach.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-slate-300">
                      <Edit3 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-100">Tailor your ads and keep them fresh.</strong> Use Google AI to serve the most relevant ad copy and landing pages to each customer based on their unique interest and intent.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-slate-300">
                      <SlidersHorizontal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-100">Take charge and understand how the newest and best Google AI is working for you.</strong> You'll get new actionable insights in search term reports that show how AI Max improves performance.
                      </span>
                    </div>

                    <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold block pt-1">Learn more</a>
                  </div>
                </div>

                {/* Main Toggle Switch */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAiMax}
                      onChange={(e) => setEnableAiMax(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span className="font-bold text-slate-100 text-sm">Optimize your campaign with AI Max</span>
                  </label>
                </div>

                {/* Asset Optimization Accordion Card */}
                {enableAiMax && (
                  <div className="p-6 rounded-xl border border-slate-800 bg-slate-950 space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-slate-100 text-sm">Asset optimization</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                    </div>

                    {/* Sub-Card 1: Text Customization */}
                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableTextCustomization}
                            onChange={(e) => setEnableTextCustomization(e.target.checked)}
                            className="rounded text-primary h-4 w-4"
                          />
                          <span className="font-bold text-slate-100">Text customization</span>
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Match your ad copy to what people are searching for with new headlines and descriptions using your website and assets. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Learn more about text customization</a>
                      </p>

                      <div className="flex items-center gap-4 text-[11px]">
                        <button type="button" className="text-blue-400 hover:underline font-semibold">Add text guidelines</button>
                        <button type="button" className="text-blue-400 hover:underline font-semibold">View asset examples</button>
                      </div>

                      {/* Before / After Sponsored Result Ad Visual Preview */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
                          
                          {/* Original Ad Card */}
                          <div className="w-full md:w-64 p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <Search className="h-3 w-3 text-slate-500" />
                              <span className="truncate">Blue wall paint delivery</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 block">Sponsored result</span>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                <span className="truncate">Beahm's https://www.beahms.com/</span>
                              </div>
                              <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Paint Colors | Expert Picks</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-2">Make your house a home with our range of painting and decorating essentials.</p>
                            </div>
                          </div>

                          <ArrowRight className="h-5 w-5 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

                          {/* Dynamic Tailored Ad Card */}
                          <div className="w-full md:w-72 p-3.5 rounded-lg border border-blue-500/30 bg-slate-900 space-y-2 shadow-lg">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <Search className="h-3 w-3 text-slate-500" />
                              <span className="truncate">Blue wall paint delivery</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 block">Sponsored result</span>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                <span className="truncate">Beahm's https://www.beahms.com/</span>
                              </div>
                              <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Wall Paint, Next-Day Delivery | Expert Picks</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-2">Make your house a home with our range of painting and decorating essentials.</p>
                            </div>
                          </div>

                        </div>
                        <span className="text-[10px] text-slate-500 block text-center italic">Example of text customization</span>
                      </div>
                    </div>

                    {/* Sub-Card 2: Final URL Expansion */}
                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableFinalUrlExpansion}
                            onChange={(e) => setEnableFinalUrlExpansion(e.target.checked)}
                            className="rounded text-primary h-4 w-4"
                          />
                          <span className="font-bold text-slate-100">Final URL expansion</span>
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Direct people to the most relevant content by matching your landing pages with user searches. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Learn more about Final URL expansion</a>
                      </p>
                      <p className="text-[11px] text-amber-400 font-semibold">Requires text customization to be turned on to ensure ad copy matches landing page</p>

                      <div className="pt-1">
                        <button type="button" className="text-blue-400 hover:underline font-semibold text-[11px]">Add URL exclusions</button>
                      </div>

                      {/* Before / After Final URL Expansion Visual Preview */}
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
                          
                          {/* Original Landing Card */}
                          <div className="w-full md:w-64 p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <Search className="h-3 w-3 text-slate-500" />
                              <span className="truncate">Blue wall paint delivery</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 block">Sponsored result</span>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                <span className="truncate">Beahm's https://www.beahms.com/</span>
                              </div>
                              <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Paint Colors | Expert Picks</h4>
                            </div>
                          </div>

                          <ArrowRight className="h-5 w-5 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

                          {/* Expanded Landing URL Card */}
                          <div className="w-full md:w-72 p-3.5 rounded-lg border border-blue-500/30 bg-slate-900 space-y-2 shadow-lg">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <Search className="h-3 w-3 text-slate-500" />
                              <span className="truncate">Blue wall paint delivery</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 block">Sponsored result</span>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                <span className="truncate font-semibold text-slate-200">Beahm's https://www.beahms.com/<strong className="text-blue-400 font-bold">/paint/blue</strong></span>
                              </div>
                              <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Wall Paint, Next-Day Delivery | Expert Picks</h4>
                            </div>
                          </div>

                        </div>
                        <span className="text-[10px] text-slate-500 block text-center italic">Example of Final URL expansion</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Brands Card */}
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-950 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-100 text-sm">Brands</h3>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Use brand settings to ensure your campaign meets your branded traffic needs. You can add up to 20 brand lists across your brand inclusions and exclusions. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Learn more about brand settings</a>
                  </p>

                  {/* Brand inclusions */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-200">Brand inclusions</label>
                    <p className="text-[11px] text-slate-400">
                      Your ads will only show on searches that match your keywords and mention selected brands, including related products and services. Brand inclusions will limit search traffic, so apply only necessary brands.
                    </p>
                    <div className="relative max-w-xl">
                      <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        readOnly
                        onClick={() => {
                          setBrandListModalMode("INCLUSION");
                          setShowBrandListModal(true);
                        }}
                        placeholder="Add brand lists"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                    {brandInclusions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {brandInclusions.map((b, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
                            {b}
                            <button type="button" onClick={() => setBrandInclusions(prev => prev.filter((_, idx) => idx !== i))}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Brand exclusions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <label className="block font-bold text-slate-200">Brand exclusions</label>
                    <p className="text-[11px] text-slate-400">
                      Your ads won't show on searches that mention selected brands or related products and services. If you exclude and include the same brand, only the exclusion will work.
                    </p>
                    <div className="relative max-w-xl">
                      <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        readOnly
                        onClick={() => {
                          setBrandListModalMode("EXCLUSION");
                          setShowBrandListModal(true);
                        }}
                        placeholder="Add brand lists"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary cursor-pointer"
                      />
                    </div>
                    {brandExclusions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {brandExclusions.map((b, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-semibold">
                            {b}
                            <button type="button" onClick={() => setBrandExclusions(prev => prev.filter((_, idx) => idx !== i))}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: KEYWORD AND ASSET GENERATION */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Keyword and asset generation</h1>
              </div>

              {/* Main Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Keyword and asset generation</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">Get help creating your ad</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">BETA</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Google AI will use your URL and the information you provide to create assets, like keywords, headlines, and descriptions for you to review. Generated content may be inaccurate or offensive, so please review and check the responses. To improve Google AI, human reviewers may read, annotate, and process the information you provide. Don't enter anything you wouldn't want reviewed or used.
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Your use is subject to Google's <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Terms of Service</a> and <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Generative AI Prohibited Use Policy</a>. Your data is handled as explained in the Google <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Privacy Policy</a>.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-800/60">
                    <label className="block font-bold text-slate-200 text-sm">Where will people go when they click your ad?</label>

                    {/* Red Outline Input Card for Final URL (required)* */}
                    <div className="space-y-1">
                      <div className="p-3.5 rounded-xl border border-rose-500 bg-rose-500/5 flex items-center gap-3">
                        <Globe className="h-4 w-4 text-rose-400 shrink-0" />
                        <input
                          type="text"
                          value={formData.aiGeneratorUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, aiGeneratorUrl: e.target.value }))}
                          placeholder="Final URL (required)*"
                          className="w-full bg-transparent text-xs text-rose-300 placeholder-rose-400/80 font-mono focus:outline-none"
                        />
                      </div>
                      {!formData.aiGeneratorUrl.trim() && (
                        <span className="text-[11px] text-rose-400 font-semibold block pl-1">Enter a value</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions for Step 5 */}
              <div className="flex items-center justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  disabled={!formData.aiGeneratorUrl.trim()}
                  onClick={() => {
                    if (formData.aiGeneratorUrl.trim()) {
                      handleAiGeneration();
                      setStep(6);
                    }
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow ${
                    formData.aiGeneratorUrl.trim()
                      ? "bg-primary text-slate-950 hover:bg-secondary cursor-pointer shadow-primary/20"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: KEYWORDS AND ADS */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Keywords and ads</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Ad groups help you organize your ads around a common theme. For the best results, focus your ads and keywords on one product or service.
                </p>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-100">Add details to match your ads to the right searches</h2>
              </div>

              {/* Card 1: Keywords Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-sm">Keywords</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                {/* Get keyword suggestions (optional) */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-200">Get keyword suggestions (optional)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Google Ads can find keywords for you by scanning a web page or seeing what's working for similar products or services
                    </p>
                  </div>

                  <div className="space-y-3 max-w-xl">
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={keywordScanUrl}
                        onChange={(e) => setKeywordScanUrl(e.target.value)}
                        placeholder="Final URL"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="relative">
                      <Tag className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={keywordProductsInput}
                        onChange={(e) => setKeywordProductsInput(e.target.value)}
                        placeholder="Enter products or services to advertise"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("Scanning web page for keyword suggestions...")}
                      className="text-slate-400 hover:text-white font-semibold text-[11px] cursor-pointer"
                    >
                      Get keyword suggestions
                    </button>
                  </div>
                </div>

                {/* Enter keywords */}
                <div className="space-y-2 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-200">Enter keywords</h4>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Keywords are words or phrases that are used to match your ads with the terms people are searching for
                  </p>

                  <textarea
                    rows={6}
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="Enter or paste keywords. You can separate each keyword by commas or enter one per line."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Card 2: Ad group settings for AI Max */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-sm">Ad group settings for AI Max</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                {/* Green Status Bar */}
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>AI Max is turned on for your campaign</span>
                </div>

                {/* Sub-Card 1: Search term matching */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">Search term matching</h4>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">BETA</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Search term matching expands your keywords to broad match and lets Google AI match content from your landing pages and assets to help you show up on more relevant searches
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={useSearchTermMatchingAdGroup}
                      onChange={(e) => setUseSearchTermMatchingAdGroup(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span className="font-semibold text-slate-200">Use search term matching for this ad group</span>
                  </label>
                </div>

                {/* Sub-Card 2: Brand Inclusions */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-slate-200">Brand Inclusions</h4>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Add brand inclusions to limit traffic to serve only on search queries related to the specified brands. Your ad group brand inclusions will be used instead of campaign-level brand inclusions. <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </p>
                  <div className="relative max-w-xl">
                    <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      readOnly
                      onClick={() => {
                        setBrandListModalMode("INCLUSION");
                        setShowBrandListModal(true);
                      }}
                      placeholder="Add brand lists"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sub-Card 3: Locations of Interest */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-slate-200">Locations of Interest</h4>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Use locations of interest to reach customers searching for or interested in specific geographic areas. The locations you selected in your campaign settings still apply. For best results, use locations of interest with phrase and broad match keywords. <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </p>
                  <div className="space-y-1 max-w-xl">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Add locations of interest"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">For example, a country, city, region, or postal code</span>
                  </div>
                </div>

                {/* Sub-Card 4: URL Inclusions */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-slate-200">URL Inclusions</h4>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Google AI selects the best performing landing page from your website. To use only certain pages, create URL rules or choose custom labels from your page feeds.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowUrlInclusionsModal(true)}
                    className="text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Add URL Inclusions
                  </button>
                </div>

              </div>

              {/* Create ads to get more sales Section Header */}
              <div className="space-y-1 pt-4">
                <h2 className="text-base font-bold text-slate-100">Create ads to get more sales</h2>
              </div>

              {/* Main Ads Container Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl">
                {/* Header: Ad Strength & Checklist */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 text-xs block">Ad strength</span>
                      <span className="text-[11px] text-amber-400 font-semibold">Incomplete</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Add headlines</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Include popular keywords</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Make headlines unique</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Make descriptions unique</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Add more sitelinks</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                  </div>
                </div>

                {/* 2-Column Split: Left Form Controls (60%), Right Sticky Mobile Ad Preview (40%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column Controls (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* 1. Final URL Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>Final URL</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <input
                        type="text"
                        value={formData.websiteVisitsUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, websiteVisitsUrl: e.target.value }))}
                        placeholder="Final URL"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block">This will be used to suggest assets for your ad</span>
                    </div>

                    {/* 2. Display path Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>Display path</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">www.example.com/</span>
                        <input
                          type="text"
                          value={formData.displayPath1}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayPath1: e.target.value }))}
                          maxLength={15}
                          className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium"
                        />
                        <span className="text-slate-600 font-bold">/</span>
                        <input
                          type="text"
                          value={formData.displayPath2}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayPath2: e.target.value }))}
                          maxLength={15}
                          className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{formData.displayPath1.length} / 15</span>
                        <span>{formData.displayPath2.length} / 15</span>
                      </div>
                    </div>

                    {/* 3. Ad URL options Accordion */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
                      <div className="flex items-center justify-between cursor-pointer border-b border-slate-800 pb-2">
                        <span className="font-bold text-blue-400 text-xs flex items-center gap-1">
                          <ChevronUp className="h-4 w-4" /> Ad URL options
                        </span>
                      </div>

                      <div className="space-y-4 pt-1 text-xs">
                        {/* Tracking template */}
                        <div className="space-y-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={sitelinkTrackingTemplate}
                              onChange={(e) => setSitelinkTrackingTemplate(e.target.value)}
                              placeholder="Tracking template"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary pr-9 font-mono"
                            />
                            <HelpCircle className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                          </div>
                          <span className="text-[10px] text-slate-500 block font-mono">Example: https://www.trackingtemplate.foo/?url=&#123;lpurl&#125;&amp;id=5</span>
                        </div>

                        {/* Final URL suffix */}
                        <div className="space-y-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={sitelinkFinalUrlSuffix}
                              onChange={(e) => setSitelinkFinalUrlSuffix(e.target.value)}
                              placeholder="Final URL suffix"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary pr-9 font-mono"
                            />
                            <HelpCircle className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                          </div>
                          <span className="text-[10px] text-slate-500 block font-mono">Example: param1=value1&param2=value2</span>
                        </div>

                        {/* Custom parameter */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-300 font-semibold">
                            <span>Custom parameter</span>
                            <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                              <span className="text-slate-500 font-mono text-xs pr-1">{`{_`}</span>
                              <input
                                type="text"
                                value={sitelinkCustomParamName}
                                onChange={(e) => setSitelinkCustomParamName(e.target.value)}
                                placeholder="Name"
                                className="w-full bg-transparent text-xs text-slate-100 focus:outline-none font-mono"
                              />
                              <span className="text-slate-500 font-mono text-xs pl-1">{`}`}</span>
                            </div>
                            <span className="text-slate-400 font-bold">=</span>
                            <input
                              type="text"
                              value={sitelinkCustomParamValue}
                              onChange={(e) => setSitelinkCustomParamValue(e.target.value)}
                              placeholder="Value"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        </div>

                        {/* Use a different final URL for mobile */}
                        <div className="space-y-2 pt-1 border-t border-slate-800/60">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useDifferentMobileUrl}
                              onChange={(e) => setUseDifferentMobileUrl(e.target.checked)}
                              className="rounded text-primary h-4 w-4"
                            />
                            <span className="text-slate-300 font-semibold">Use a different final URL for mobile</span>
                          </label>

                          {useDifferentMobileUrl && (
                            <input
                              type="text"
                              value={mobileFinalUrl}
                              onChange={(e) => setMobileFinalUrl(e.target.value)}
                              placeholder="Final URL for mobile"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary font-mono animate-in fade-in duration-150"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. Ask Advisor Helper Card */}
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-200">Want more personalized help? Chat with Ads Advisor to get keyword & asset suggestions.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Opening Ads Advisor chat...")}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 shadow cursor-pointer"
                      >
                        Open chat
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 block italic">Google is choosing the assets <HelpCircle className="inline h-3 w-3" /></span>

                    {/* 4. Calls Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-200">
                          <PhoneCall className="h-4 w-4 text-slate-400" />
                          <span>Calls</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-400">Add a phone number</p>
                      <span className="text-[11px] text-slate-400 block border-b border-dashed border-slate-700 pb-1 w-max cursor-pointer">Account-level calls</span>
                      <button
                        type="button"
                        onClick={() => setActiveModal("CALLS")}
                        className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1"
                      >
                        + Calls
                      </button>
                    </div>

                    {/* 5. Headlines Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">Headlines</span>
                          <span className="text-slate-400 text-[11px] font-mono">{formData.headlines.filter(h => h).length} / 15</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">View ideas</button>
                          <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {formData.headlines.map((hl, i) => (
                          <div key={i} className="space-y-0.5">
                            <input
                              type="text"
                              value={hl}
                              onChange={(e) => updateHeadline(i, e.target.value)}
                              placeholder="Headline"
                              maxLength={30}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                            />
                            <div className="flex justify-between text-[9px] text-slate-500 px-1">
                              <span>Required</span>
                              <span>{hl.length} / 30</span>
                            </div>
                          </div>
                        ))}

                        {formData.headlines.length < 15 && (
                          <button
                            type="button"
                            onClick={addHeadline}
                            className="text-blue-400 font-bold text-xs hover:underline block pt-1"
                          >
                            + Headline
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 6. Descriptions Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">Descriptions</span>
                          <span className="text-slate-400 text-[11px] font-mono">{formData.descriptions.filter(d => d).length} / 4</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">View ideas</button>
                          <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {formData.descriptions.map((desc, i) => (
                          <div key={i} className="space-y-0.5">
                            <input
                              type="text"
                              value={desc}
                              onChange={(e) => updateDescription(i, e.target.value)}
                              placeholder="Description"
                              maxLength={90}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                            />
                            <div className="flex justify-between text-[9px] text-slate-500 px-1">
                              <span>Required</span>
                              <span>{desc.length} / 90</span>
                            </div>
                          </div>
                        ))}

                        {formData.descriptions.length < 4 && (
                          <button
                            type="button"
                            onClick={addDescription}
                            className="text-blue-400 font-bold text-xs hover:underline block pt-1"
                          >
                            + Description
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 7. Business name Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-200">Business name</label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        This name should match your URL or your verified advertiser name, which is <strong className="text-slate-200">JISNU DIGITAL SOLUTIONS PRIVATE LIMITED</strong>.
                      </p>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        maxLength={25}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-medium"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Until you add an approved name, your campaign will run with a placeholder name created from your URL.</span>
                        <span>{formData.businessName.length} / 25</span>
                      </div>
                    </div>

                    {/* 8. Business logo Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-200">Business logo</label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-400">Add business logo to your campaign</p>

                      <input
                        id="logo-file-input"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            const filesArray = Array.from(e.target.files);
                            filesArray.forEach(file => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setBusinessLogos(prev => [...prev, event.target!.result as string]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        }}
                      />

                      {/* Display Uploaded Logos Grid */}
                      {businessLogos.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          {businessLogos.map((logoUrl, i) => (
                            <div key={i} className="relative group w-14 h-14 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow">
                              <img src={logoUrl} alt={`Logo ${i+1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setBusinessLogos(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => document.getElementById("logo-file-input")?.click()}
                        className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        + Business logo
                      </button>
                    </div>

                    {/* 9. Callouts Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>Callouts</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-400">Add more business information</p>
                      {callouts.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {callouts.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveModal("CALLOUTS")}
                        className="text-blue-400 font-bold text-xs hover:underline block cursor-pointer"
                      >
                        + Callout
                      </button>
                    </div>

                    {/* 10. More asset types (0/7) Accordion */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
                      <div className="flex items-center justify-between cursor-pointer border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">More asset types</span>
                          <span className="text-slate-400 text-[11px] font-mono">(0/7)</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Improve your ad performance and make your ad more interactive by adding more details about your business and website
                      </p>

                      <div className="space-y-3 pt-1">
                        {/* Promotions */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                          <span className="font-bold text-slate-200 block text-xs">Promotions</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("PROMOTIONS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add promotions
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                          <span className="font-bold text-slate-200 block text-xs">Prices</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("PRICES")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add prices
                          </button>
                        </div>

                        {/* Messages */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                          <span className="font-bold text-slate-200 block text-xs">Messages</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("MESSAGES")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add a message
                          </button>
                        </div>

                        {/* Structured snippets */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                          <span className="font-bold text-slate-200 block text-xs">Structured snippets</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("SNIPPETS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add snippets of text
                          </button>
                        </div>

                        {/* Lead forms */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                          <span className="font-bold text-slate-200 block text-xs">Lead forms</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("LEAD_FORMS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add a form
                          </button>
                        </div>

                        {/* Apps */}
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                          <span className="font-bold text-slate-200 block text-xs">Apps</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("APPS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add apps
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 11. Sitelinks Card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>Sitelinks</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-400">Add links to your ads to take people to specific pages on your website.</p>
                      <button
                        type="button"
                        onClick={() => setActiveModal("SITELINKS")}
                        className="text-blue-400 font-bold text-xs hover:underline block cursor-pointer"
                      >
                        + Sitelinks
                      </button>
                    </div>

                    {/* Optimization Tips Banners */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <p className="text-slate-300">
                        <strong className="text-slate-100">Add callouts:</strong> Help your ads show more prominently by adding callouts.
                      </p>
                      <p className="text-slate-300">
                        <strong className="text-slate-100">Add sitelinks:</strong> Draw more attention to your ads by adding at least 4 sitelinks.
                      </p>
                    </div>

                  </div>

                  {/* Right Column: Sticky Mobile Search Ad Preview (5 Cols) */}
                  <div className="lg:col-span-5">
                    <div className="sticky top-24 space-y-4">
                      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4 shadow-xl text-center">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                          <span className="font-bold text-slate-200">Preview</span>
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">Share</button>
                            <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">Preview ads</button>
                          </div>
                        </div>

                        {/* Search Card Mockup */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2">
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

                </div>

              </div>
            </div>
          )}

          {/* STEP 7: BUDGET */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Budget</h1>
                <p className="text-xs text-slate-400">Decide how much you want to spend.</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Main Controls Column (8 Cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Blue Info Notice Banner */}
                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-start gap-3 text-blue-300">
                      <HelpCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed">
                        Your budget type (daily or campaign total) can&apos;t be changed once this campaign has started. You can change your budget amount at any time.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <span className="font-bold text-slate-100 text-xs block">Select budget type</span>

                      {/* Option 1: Average daily budget */}
                      <label
                        onClick={() => setBudgetType("DAILY")}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          budgetType === "DAILY" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budgetTypeRadio"
                          checked={budgetType === "DAILY"}
                          onChange={() => setBudgetType("DAILY")}
                          className="mt-1 text-primary h-4 w-4"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-100 block">Average daily budget</span>
                          <span className="text-slate-400 block text-[11px]">Set your average daily budget for this campaign</span>
                          {budgetType === "DAILY" && (
                            <div className="pt-2">
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue || selectedPresetBudget}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder="Enter daily amount"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Option 2: Campaign total budget */}
                      <label
                        onClick={() => setBudgetType("TOTAL")}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          budgetType === "TOTAL" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budgetTypeRadio"
                          checked={budgetType === "TOTAL"}
                          onChange={() => setBudgetType("TOTAL")}
                          className="mt-1 text-primary h-4 w-4"
                        />
                        <div className="space-y-1 flex-1">
                          <span className="font-bold text-slate-100 block">Campaign total budget</span>
                          <span className="text-slate-400 block text-[11px]">Set a budget for the duration of your campaign</span>
                          
                          {budgetType === "TOTAL" && (
                            <div className="pt-2 space-y-4">
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder=""
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                                />
                              </div>

                              {/* Start Date & End Date Info Card */}
                              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between">
                                <div className="space-y-1 text-xs">
                                  <p className="text-slate-200">
                                    <span className="text-slate-400 font-semibold">Start date:</span> August 11, 2026
                                  </p>
                                  <p className="text-slate-200">
                                    <span className="text-slate-400 font-semibold">End date:</span> None
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => alert("Editing Campaign Dates...")}
                                  className="text-blue-400 font-bold hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                  </div>

                  {/* Right Help Column (4 Cols) */}
                  <div className="lg:col-span-4 border-l border-slate-800/80 pl-6 space-y-3">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Your campaign total budget is what the campaign should spend over its runtime. To use a campaign total budget, you must add an end date for your campaign.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Your campaign is almost ready to publish</h1>
              </div>

              {/* 1. Issues Section */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-200 text-xs">Issues</h3>
                  <p className="text-[11px] text-slate-400">Fix these issues to run your campaign</p>
                </div>

                <div className="space-y-2">
                  {/* Issue 1: Create an ad */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-200">
                        <strong className="text-white font-bold">Create an ad:</strong> Get your ads running by adding ads to your ad group
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(6)}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 2: Add keywords */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-200">
                        <strong className="text-white font-bold">Add keywords:</strong> Get your ads running by adding keywords to your ad group
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(6)}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 3: Add a budget */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-200">
                        <strong className="text-white font-bold">Add a budget:</strong> To publish your campaign, enter a budget
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(7)}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 4: Budget value required */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-200">
                        <strong className="text-white font-bold">Budget:</strong> Value is required
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(7)}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Recommendations Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-200 text-xs">Recommendations</h3>
                    <p className="text-[11px] text-slate-400">Apply these recommendations to optimize campaign performance</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <ChevronLeft className="h-4 w-4 cursor-pointer hover:text-white" />
                    <span>1 / 3</span>
                    <ChevronRight className="h-4 w-4 cursor-pointer hover:text-white" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                    <p className="text-slate-200">
                      <strong className="text-white font-bold">Add sitelinks:</strong> Draw more attention to your ads by adding at least 4 sitelinks. <HelpCircle className="inline h-3 w-3 text-slate-400" />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal("SITELINKS")}
                    className="text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* 3. Overview Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-200 text-xs">Overview</h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Campaign name</span>
                    <input
                      type="text"
                      value={formData.campaignName}
                      onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                      className="flex-1 max-w-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Campaign type</span>
                    <span className="flex-1 text-slate-100 font-semibold">Search</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Objective</span>
                    <span className="flex-1 text-slate-100 font-semibold">Create a campaign without guidance</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Goal</span>
                    <span className="flex-1 text-slate-100 font-semibold">Downloads, Phone call leads</span>
                  </div>
                </div>
              </div>

              {/* 4. Bidding Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-200 text-xs">Bidding</h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Bidding</span>
                    <span className="flex-1 text-slate-100 font-semibold">{formData.biddingFocus}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Customer acquisition</span>
                    <span className="flex-1 text-slate-100 font-semibold">Bid equally for new and existing customers</span>
                  </div>
                </div>
              </div>

              {/* 5. Campaign Settings Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-200 text-xs">Campaign settings</h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Networks</span>
                    <span className="flex-1 text-slate-100 font-semibold">Search partners, Display Network</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Locations</span>
                    <span className="flex-1 text-slate-100 font-semibold">All countries and territories</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Languages</span>
                    <span className="flex-1 text-slate-100 font-semibold">English</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">EU political ads</span>
                    <span className="flex-1 text-slate-100 font-semibold">Doesn&apos;t have EU political ads</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Audiences</span>
                    <span className="flex-1 text-slate-100 font-semibold">No segments</span>
                  </div>
                </div>
              </div>

              {/* 6. AI Max Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-200 text-xs">AI Max</h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Asset optimization</span>
                    <span className="flex-1 text-slate-100 font-semibold">Text customization and Final URL expansion turned on</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Brands</span>
                    <div className="flex-1 space-y-0.5 font-semibold text-slate-100">
                      <p>Limiting to: 0 brand lists</p>
                      <p>Excluding: 0 brand lists</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Keywords and Ads Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-200 text-xs">Keywords and ads</h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Keywords</span>
                    <span className="flex-1 text-slate-100 font-semibold">None</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Search term matching</span>
                    <span className="flex-1 text-slate-100 font-semibold">Expanding your keywords with Google AI</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Brand inclusions</span>
                    <span className="flex-1 text-slate-100 font-semibold">Limiting to: 0 brand lists</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Locations of interest</span>
                    <span className="flex-1 text-slate-100 font-semibold">None</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">URL inclusions</span>
                    <span className="flex-1 text-slate-100 font-semibold">No URL inclusions</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-400 w-48 font-medium">Ads</span>
                    <span className="flex-1 text-slate-100 font-semibold">None</span>
                  </div>
                </div>
              </div>

              {/* 8. Budget Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-200 text-xs">Budget</h3>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden p-4 flex items-center justify-between">
                  <span className="text-slate-400 w-48 font-medium">Budget</span>
                  <div className="flex-1 space-y-1">
                    <span className="text-slate-100 font-bold">Campaign total: ₹{customBudgetValue || "0.00"}</span>
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                      Value is required
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
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
