"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, Settings, Sparkles, Image as ImageIcon, Video as VideoIcon, Edit3
} from "lucide-react";

export default function DisplayCampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Flow Step: "CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW"
  const [displayStep, setDisplayStep] = useState<"CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW">("CAMPAIGN_SETTINGS");

  // 1. Campaign Settings State
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);

  // 2. Budget and Bidding State
  const [dailyBudget, setDailyBudget] = useState<string>("");
  const [biddingFocus, setBiddingFocus] = useState<string>("Conversions");
  const [conversionBiddingType, setConversionBiddingType] = useState<"MAX_CONVERSIONS" | "TARGET_CPA">("MAX_CONVERSIONS");
  const [targetCpaValue, setTargetCpaValue] = useState<string>("");

  // 3. Targeting State
  const [useOptimizedTargeting, setUseOptimizedTargeting] = useState<boolean>(true);

  // 4. Ads Creation State
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [businessName, setBusinessName] = useState<string>("");
  const [headlines, setHeadlines] = useState<string[]>([""]);
  const [longHeadline, setLongHeadline] = useState<string>("");
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [logosList, setLogosList] = useState<string[]>([]);
  const [videosList, setVideosList] = useState<string[]>([]);

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = "demo-org-123";
    if (customerId) {
      fetch(`${BACKEND}/api/ads/customer-info?orgId=${orgId}&customerId=${customerId}`)
        .then(r => r.json())
        .then(d => {
          setAccountInfo({
            customerId: d.customerId || customerId,
            name: d.descriptiveName || `Account ${customerId}`
          });
        })
        .catch(() => {
          setAccountInfo({ customerId, name: `Account ${customerId}` });
        });
    }
  }, [customerId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-sm font-semibold text-slate-200">Display Campaign Setup</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sidebar Navigation matching user specification */}
        <aside className="w-64 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
              <span>Display</span>
            </div>

            <nav className="space-y-1 text-xs">
              {/* 1. Campaign settings */}
              <div
                onClick={() => setDisplayStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-xl space-y-1 cursor-pointer transition-all ${
                  displayStep === "CAMPAIGN_SETTINGS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Campaign settings</span>
                </div>
                {displayStep === "CAMPAIGN_SETTINGS" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="text-primary font-medium">Locations</p>
                    <p className="hover:text-slate-200">Languages</p>
                    <p className="hover:text-slate-200">EU political ads</p>
                  </div>
                )}
              </div>

              {/* 2. Budget and bidding */}
              <div
                onClick={() => setDisplayStep("BUDGET_BIDDING")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  displayStep === "BUDGET_BIDDING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Budget and bidding</span>
              </div>

              {/* 3. Targeting */}
              <div
                onClick={() => setDisplayStep("TARGETING")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  displayStep === "TARGETING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Targeting</span>
              </div>

              {/* 4. Ads */}
              <div
                onClick={() => setDisplayStep("ADS")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  displayStep === "ADS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Ads</span>
              </div>

              {/* 5. Review */}
              <div
                onClick={() => setDisplayStep("REVIEW")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  displayStep === "REVIEW"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Review</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
          
          {/* STEP 1: CAMPAIGN SETTINGS */}
          {displayStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>

              {/* Locations Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="text-xs text-slate-400">Select locations for this campaign</p>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="displayLoc"
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="displayLoc"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="displayLoc"
                      checked={selectedLocation === "CUSTOM"}
                      onChange={() => setSelectedLocation("CUSTOM")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">Enter another location</span>
                  </label>

                  {selectedLocation === "CUSTOM" && (
                    <div className="ml-7 pt-2 space-y-2 animate-in fade-in duration-200">
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
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setShowLocationOptions(!showLocationOptions)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
                      Location options
                    </button>
                  </div>
                </div>
              </div>

              {/* Languages Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="text-xs text-slate-400">Select the languages your customers speak.</p>

                <div className="space-y-3 text-xs">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearchInput}
                      onChange={(e) => setLanguageSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && languageSearchInput.trim()) {
                          setSelectedLanguages(prev => [...prev, languageSearchInput.trim()]);
                          setLanguageSearchInput("");
                        }
                      }}
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedLanguages.map((lang, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-medium">
                        {lang}
                        <button onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== idx))}>
                          <X className="h-3 w-3 hover:text-rose-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* EU Political Ads Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">EU political ads</h2>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-xs font-semibold text-slate-200">Does your campaign have European Union political ads?</p>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="euPolitical"
                      checked={euPoliticalAds === "YES"}
                      onChange={() => setEuPoliticalAds("YES")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="euPolitical"
                      checked={euPoliticalAds === "NO"}
                      onChange={() => setEuPoliticalAds("NO")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">No, this campaign doesn't have EU political ads</span>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  EU regulation requires Google to ask this question. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn how an EU political ad is defined</a>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BUDGET AND BIDDING */}
          {displayStep === "BUDGET_BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Budget and bidding</h1>

              {/* Budget Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Budget</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-xs font-semibold text-slate-200">Set your average daily budget for this campaign</p>

                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">₹</span>
                  <input
                    type="text"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The most you'll pay per month is your daily budget times 30.4 (the average number of days in a month). Some days you might spend more or less than your daily budget. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>
              </div>

              {/* Bidding Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Bidding</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">What do you want to focus on?</label>
                    <select
                      value={biddingFocus}
                      onChange={(e) => setBiddingFocus(e.target.value)}
                      className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                    >
                      <option value="Conversions">Conversions</option>
                      <option value="Conversion value">Conversion value</option>
                      <option value="Impressions">Viewable impressions</option>
                    </select>
                    <span className="text-[11px] text-emerald-400 block mt-1">Recommended for your campaign goal</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-semibold">How do you want to get conversions?</label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="convBidding"
                        checked={conversionBiddingType === "MAX_CONVERSIONS"}
                        onChange={() => setConversionBiddingType("MAX_CONVERSIONS")}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-slate-200">Automatically maximize conversions</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="convBidding"
                        checked={conversionBiddingType === "TARGET_CPA"}
                        onChange={() => setConversionBiddingType("TARGET_CPA")}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-slate-200">Set a target cost per action</span>
                    </label>

                    {conversionBiddingType === "TARGET_CPA" && (
                      <div className="ml-7 pt-2 space-y-1 animate-in fade-in duration-200">
                        <label className="block text-[11px] text-slate-400 font-semibold">Target CPA (₹)</label>
                        <input
                          type="text"
                          value={targetCpaValue}
                          onChange={(e) => setTargetCpaValue(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                    This campaign will use the Maximize conversions bid strategy to help you get the most conversions for your budget
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TARGETING */}
          {displayStep === "TARGETING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Targeting</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Optimized targeting is set up for you</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Optimized targeting helps you get more conversions by using information such as your landing page and assets. You can opt out or speed up optimization by adding targeting first. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Add targeting
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ADS CREATION */}
          {displayStep === "ADS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Ads</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Ad strength:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">Incomplete</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl">
                <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3">Ad creation</h2>

                {/* Final URL & Business Name */}
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Final URL <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={finalUrl}
                      onChange={(e) => setFinalUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-slate-300">Business name <span className="text-rose-400">*</span></label>
                      <span className="text-[10px] text-slate-500 font-mono">{businessName.length} / 25</span>
                    </div>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      maxLength={25}
                      placeholder="Business name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                    />
                    <span className="text-[10px] text-slate-500 block">Text is {businessName.length} characters out of 25</span>
                  </div>
                </div>

                {/* Assets: Images, Logos, Videos */}
                <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Images</h3>
                      <button type="button" className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add images
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Add up to 15 images. At least 1 landscape image and 1 square image required. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline">Learn more</a></p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Logos</h3>
                      <button type="button" className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add logos
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Add up to 5 logos</p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Videos</h3>
                      <button type="button" className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add videos
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">Optional (portrait and landscape around 30 seconds work best)</p>
                  </div>
                </div>

                {/* Headlines */}
                <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-200">Headlines</h3>
                    <span className="text-[11px] text-slate-400">Add up to 5 headlines</span>
                  </div>
                  {headlines.map((hl, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-400">Headline {idx + 1} <span className="text-rose-400">*</span></label>
                        <span className="text-[10px] text-slate-500 font-mono">{hl.length} / 30</span>
                      </div>
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => {
                          const updated = [...headlines];
                          updated[idx] = e.target.value;
                          setHeadlines(updated);
                        }}
                        maxLength={30}
                        placeholder="Headline"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  {headlines.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setHeadlines(prev => [...prev, ""])}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add headline
                    </button>
                  )}
                </div>

                {/* Long Headline */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-200">Long headline <span className="text-rose-400">*</span></label>
                    <span className="text-[10px] text-slate-500 font-mono">{longHeadline.length} / 90</span>
                  </div>
                  <input
                    type="text"
                    value={longHeadline}
                    onChange={(e) => setLongHeadline(e.target.value)}
                    maxLength={90}
                    placeholder="Long headline"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-slate-500 block">Text is {longHeadline.length} characters out of 90</span>
                </div>

                {/* Descriptions */}
                <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-200">Descriptions</h3>
                    <span className="text-[11px] text-slate-400">Add up to 5 descriptions</span>
                  </div>
                  {descriptions.map((desc, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-400">Description {idx + 1} <span className="text-rose-400">*</span></label>
                        <span className="text-[10px] text-slate-500 font-mono">{desc.length} / 90</span>
                      </div>
                      <input
                        type="text"
                        value={desc}
                        onChange={(e) => {
                          const updated = [...descriptions];
                          updated[idx] = e.target.value;
                          setDescriptions(updated);
                        }}
                        maxLength={90}
                        placeholder="Description"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  {descriptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setDescriptions(prev => [...prev, ""])}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add description
                    </button>
                  )}
                </div>

                {/* Preview Warning Notice */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-200">To unlock this format, add the following assets:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    <li>1 headline or long headline</li>
                    <li>1 disclaimer or description</li>
                    <li>1 horizontal image</li>
                  </ul>
                  <p className="pt-2 text-[11px] text-slate-500">Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads.</p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {displayStep === "REVIEW" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Review</h1>

              {/* Fix Errors Warning Card */}
              <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs space-y-2 shadow-lg">
                <h3 className="font-bold text-rose-200 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  Fix these errors to publish your campaign
                </h3>
                <ul className="list-disc pl-5 space-y-1 font-medium">
                  <li>Budget: Value is required</li>
                  <li>Your campaign can't run without an ad. <a href="#" onClick={e => e.preventDefault()} className="underline font-bold">Learn more</a></li>
                </ul>
              </div>

              {/* EEA Personalization Suggestion */}
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs space-y-1 shadow-lg">
                <p className="font-semibold text-amber-200">The following suggestions will greatly improve your campaign's performance</p>
                <p className="text-[11px] text-amber-300/80">
                  End-user consent signals are required to use ad personalization features in the European Economic Area (EEA). <a href="#" onClick={e => e.preventDefault()} className="underline font-bold">Learn more</a>
                </p>
              </div>

              {/* Campaign Review Details Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Campaign Review</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 block font-semibold">Campaign name</span>
                    <span className="text-slate-100 font-bold">Sales-Display-2</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 block font-semibold">Campaign type</span>
                    <span className="text-slate-100 font-bold">Display</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 block font-semibold">Objective</span>
                    <span className="text-slate-100 font-bold">Sales</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 block font-semibold">Goal</span>
                    <span className="text-slate-100 font-bold">Downloads, Phone call leads</span>
                  </div>
                </div>

                {/* Campaign settings summary */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Campaign settings</h3>
                  <p>Locations: <strong>{selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom"}</strong></p>
                  <p>Languages: <strong>{selectedLanguages.join(", ") || "English"}</strong></p>
                  <p>EU political ads: <strong>{euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}</strong></p>
                </div>

                {/* Budget & bidding summary */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Budget and bidding</h3>
                  <p className="text-rose-400 font-semibold">Budget: ₹{dailyBudget || "0.00"}/day (Value is required)</p>
                  <p>Bidding: <strong>Maximize conversions</strong></p>
                </div>

                {/* Ad group summary */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Ad group 1</h3>
                  <p>Optimized targeting: <strong className="text-emerald-400">On</strong></p>
                  <p>Ad creation: <strong className="text-rose-400">No ads</strong></p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (displayStep === "REVIEW") setDisplayStep("ADS");
            else if (displayStep === "ADS") setDisplayStep("TARGETING");
            else if (displayStep === "TARGETING") setDisplayStep("BUDGET_BIDDING");
            else if (displayStep === "BUDGET_BIDDING") setDisplayStep("CAMPAIGN_SETTINGS");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          {displayStep === "CAMPAIGN_SETTINGS" ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {displayStep !== "REVIEW" && (
            <button
              onClick={() => {
                if (displayStep === "CAMPAIGN_SETTINGS") setDisplayStep("BUDGET_BIDDING");
                else if (displayStep === "BUDGET_BIDDING") setDisplayStep("TARGETING");
                else if (displayStep === "TARGETING") setDisplayStep("ADS");
                else if (displayStep === "ADS") setDisplayStep("REVIEW");
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {displayStep === "REVIEW" && (
            <button
              onClick={() => {
                if (!dailyBudget) {
                  alert("Budget: Value is required");
                  return;
                }
                alert("Display campaign published successfully!");
                router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
            >
              Save & Publish
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
