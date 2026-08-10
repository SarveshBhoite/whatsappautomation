"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, Settings, Sparkles, Image as ImageIcon, Video as VideoIcon, Edit3, Target, SlidersHorizontal
} from "lucide-react";

// Objective configuration pattern
const CAMPAIGN_CONFIGS = {
  SALES: {
    objective: "SALES",
    objectiveLabel: "Sales",
    performanceMaxName: "Sales-Performance Max",
    goals: "Sales, Purchases, Conversion value"
  },
  LEADS: {
    objective: "LEADS",
    objectiveLabel: "Leads",
    performanceMaxName: "Leads-Performance Max-7",
    goals: "Downloads, Phone call leads"
  }
};

export default function PerformanceMaxCampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const rawObjective = (searchParams.get("objective") || "LEADS").toUpperCase();
  const currentConfig = rawObjective === "SALES" ? CAMPAIGN_CONFIGS.SALES : CAMPAIGN_CONFIGS.LEADS;

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Flow Step State: "BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY"
  const [pmaxStep, setPmaxStep] = useState<"BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY">("BIDDING");

  // 1. Bidding State
  const [biddingFocus, setBiddingFocus] = useState<string>("Conversions");
  const [targetCpaOption, setTargetCpaOption] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("");
  const [onlyNewCustomers, setOnlyNewCustomers] = useState<boolean>(false);
  const [reengageLapsedCustomers, setReengageLapsedCustomers] = useState<boolean>(false);

  // 2. Campaign Settings State
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [adScheduleDays, setAdScheduleDays] = useState<string>("All days");
  const [adScheduleStartTime, setAdScheduleStartTime] = useState<string>("00:00");
  const [adScheduleEndTime, setAdScheduleEndTime] = useState<string>("00:00");
  const [startDateStr, setStartDateStr] = useState<string>("Aug 10, 2026");
  const [endDateMode, setEndDateMode] = useState<"NONE" | "SELECT">("NONE");
  const [endDateStr, setEndDateStr] = useState<string>("None");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);

  // Advanced Settings States
  const [trackingTemplatePmax, setTrackingTemplatePmax] = useState<string>("");
  const [finalUrlSuffixPmax, setFinalUrlSuffixPmax] = useState<string>("");
  const [customParamsPmax, setCustomParamsPmax] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);
  const [devicesComputers, setDevicesComputers] = useState<boolean>(true);
  const [devicesMobile, setDevicesMobile] = useState<boolean>(true);
  const [devicesTablets, setDevicesTablets] = useState<boolean>(true);
  const [devicesTv, setDevicesTv] = useState<boolean>(true);
  const [turnOnAgeExclusionsPmax, setTurnOnAgeExclusionsPmax] = useState<boolean>(false);
  const [turnOnGenderExclusionsPmax, setTurnOnGenderExclusionsPmax] = useState<boolean>(false);
  const [enableDataExclusionsPmax, setEnableDataExclusionsPmax] = useState<boolean>(false);

  // 3. Asset Group State
  const [assetGroupName, setAssetGroupName] = useState<string>("Asset Group 1");
  const [finalUrl, setFinalUrl] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [headlines, setHeadlines] = useState<string[]>(["", "", ""]);
  const [longHeadlines, setLongHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>(["", ""]);
  const [callToAction, setCallToAction] = useState<string>("Automated");
  const [searchThemesInput, setSearchThemesInput] = useState<string>("");
  const [audienceName, setAudienceName] = useState<string>("");

  // 4. Budget State
  const [budgetTypeOption, setBudgetTypeOption] = useState<"DAILY" | "TOTAL">("DAILY");
  const [dailyBudget, setDailyBudget] = useState<string>("");

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
            <span className="text-sm font-semibold text-slate-200">Performance Max Setup</span>
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
        
        {/* Left Navigation Sidebar matching exact prompt specification */}
        <aside className="w-64 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Performance Max</span>
            </div>

            <nav className="space-y-1 text-xs">
              {/* Bidding Step */}
              <div
                onClick={() => setPmaxStep("BIDDING")}
                className={`p-2.5 rounded-xl space-y-1 cursor-pointer transition-all ${
                  pmaxStep === "BIDDING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Target className="h-4 w-4" />
                  <span>Bidding</span>
                </div>
                {pmaxStep === "BIDDING" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="text-primary font-medium">Bidding</p>
                    <p className="hover:text-slate-200">Customer acquisition</p>
                    <p className="hover:text-slate-200">Customer retention</p>
                  </div>
                )}
              </div>

              {/* Campaign settings */}
              <div
                onClick={() => setPmaxStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  pmaxStep === "CAMPAIGN_SETTINGS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Campaign settings</span>
              </div>

              {/* Asset group */}
              <div
                onClick={() => setPmaxStep("ASSET_GROUP")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  pmaxStep === "ASSET_GROUP"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Asset group</span>
              </div>

              {/* Budget */}
              <div
                onClick={() => setPmaxStep("BUDGET")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  pmaxStep === "BUDGET"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Budget</span>
              </div>

              {/* Summary */}
              <div
                onClick={() => setPmaxStep("SUMMARY")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  pmaxStep === "SUMMARY"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Summary</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
          
          {/* STEP 1: BIDDING */}
          {pmaxStep === "BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Bidding</h1>

              {/* Bidding Focus Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Bidding</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">What do you want to focus on?</label>
                  <select
                    value={biddingFocus}
                    onChange={(e) => setBiddingFocus(e.target.value)}
                    className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                  >
                    <option value="Conversions">Conversions</option>
                    <option value="Conversion value">Conversion value</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={targetCpaOption}
                    onChange={(e) => setTargetCpaOption(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-200 block">Set a target cost per action (optional)</span>
                  </div>
                </label>

                {targetCpaOption && (
                  <div className="ml-7 pt-1 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={targetCpaValue}
                      onChange={(e) => setTargetCpaValue(e.target.value)}
                      placeholder="Target CPA (₹)"
                      className="w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Customer Acquisition Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Customer acquisition</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyNewCustomers}
                    onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-200 block">Only bid for new customers</span>
                    <span className="text-[11px] text-slate-400 block">Your campaign will be limited to only new customers, regardless of your bid strategy</span>
                  </div>
                </label>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                  By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about customer acquisition</a>
                </p>
              </div>

              {/* Customer Retention Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Customer retention</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reengageLapsedCustomers}
                    onChange={(e) => setReengageLapsedCustomers(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <span className="font-semibold text-slate-200">Adjust your bidding to help re-engage lapsed customers</span>
                </label>

                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                  You can't bid higher for lapsed customers because you don't have a purchase goal in your account. Add a purchase goal to run campaigns that bid higher for specific customer types.
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                  By default, your campaign does not adjust bidding to re-engage lapsed customers. However, you can configure your customer acquisition settings to optimize for winning back lapsed customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about how to re-engage lapsed customers</a>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {pmaxStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
              <p className="text-xs text-slate-400">To reach the right people, start by defining key settings for your campaign</p>

              {/* Locations Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="text-slate-400">Select locations for this campaign</p>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pmaxLoc"
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pmaxLoc"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pmaxLoc"
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
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="text-slate-400">Select the languages your customers speak.</p>

                <div className="space-y-3">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearchInput}
                      onChange={(e) => setLanguageSearchInput(e.target.value)}
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 font-medium">English</span>
                  </div>
                </div>
              </div>

              {/* EU Political Ads Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">EU political ads</h2>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="font-semibold text-slate-200">Does your campaign have European Union political ads?</p>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="euPolPmax"
                      checked={euPoliticalAds === "YES"}
                      onChange={() => setEuPoliticalAds("YES")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="euPolPmax"
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

              {/* Ad Schedule Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Ad schedule</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select value={adScheduleDays} onChange={(e) => setAdScheduleDays(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold">
                    <option value="All days">All days</option>
                    <option value="Mondays - Fridays">Mondays - Fridays</option>
                    <option value="Saturdays - Sundays">Saturdays - Sundays</option>
                  </select>

                  <select value={adScheduleStartTime} onChange={(e) => setAdScheduleStartTime(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold">
                    <option value="00:00">00:00</option>
                    <option value="06:00">06:00</option>
                    <option value="09:00">09:00</option>
                  </select>

                  <span className="text-slate-400 font-medium">to</span>

                  <select value={adScheduleEndTime} onChange={(e) => setAdScheduleEndTime(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold">
                    <option value="00:00">00:00</option>
                    <option value="17:00">17:00</option>
                    <option value="23:59">23:59</option>
                  </select>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 leading-relaxed">
                  <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a></p>
                  <p>Based on account time zone: <strong>(GMT+05:30) India Standard Time</strong></p>
                  <p className="text-amber-400">Saving this removes the settings you changed and adds new ones, resetting any performance data</p>
                  <p>To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                </div>
              </div>

              {/* Campaign URL Options Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Campaign URL options</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Tracking template</label>
                  <input
                    type="text"
                    value={trackingTemplatePmax}
                    onChange={(e) => setTrackingTemplatePmax(e.target.value)}
                    placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Final URL suffix</label>
                  <input
                    type="text"
                    value={finalUrlSuffixPmax}
                    onChange={(e) => setFinalUrlSuffixPmax(e.target.value)}
                    placeholder="Example: param1=value1&param2=value2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-300">Custom parameters</label>
                    <button
                      type="button"
                      onClick={() => setCustomParamsPmax(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add custom parameters
                    </button>
                  </div>
                  {customParamsPmax.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{`{_`}</span>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => { const u = [...customParamsPmax]; u[idx].name = e.target.value; setCustomParamsPmax(u); }}
                        placeholder="Name"
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                      />
                      <span className="font-mono text-slate-400">{`}`}</span>
                      <span className="font-mono text-slate-400">=</span>
                      <input
                        type="text"
                        value={p.value}
                        onChange={(e) => { const u = [...customParamsPmax]; u[idx].value = e.target.value; setCustomParamsPmax(u); }}
                        placeholder="Value"
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tracking template is the URL you want the ad click to go to for tracking. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>
              </div>

              {/* Start and End Dates Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Start and end dates</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-400 font-semibold">Start date</label>
                    <input
                      type="text"
                      value={startDateStr}
                      onChange={(e) => setStartDateStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-400 font-semibold">End date</label>
                    <select
                      value={endDateMode}
                      onChange={(e) => setEndDateMode(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-medium"
                    >
                      <option value="NONE">None</option>
                      <option value="SELECT">Select a date</option>
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Your ads will continue to run unless you specify an end date.
                </p>
              </div>

              {/* Page Feeds Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Page feeds</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400 leading-relaxed">
                  Add page feeds to specify which URLs to use in your campaign. With Final URL expansion on, you will use all URLs Google knows about your website, including any page feeds. By turning Final URL expansion off, you will only use URLs from your page feeds. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about page feeds</a>
                </p>

                <div className="flex items-center justify-between pt-1">
                  <button type="button" className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add a page feed
                  </button>
                  <span className="text-[11px] text-slate-500">You don't have any page feeds. You can add page feeds in Business Data.</span>
                </div>
              </div>

              {/* Devices Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">Devices</h2>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400">Choose the devices where your ads can appear.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                    <input type="checkbox" checked={devicesComputers} onChange={(e) => setDevicesComputers(e.target.checked)} className="rounded bg-slate-900 text-primary h-4 w-4" />
                    <span className="text-slate-200 font-medium">Computers</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                    <input type="checkbox" checked={devicesMobile} onChange={(e) => setDevicesMobile(e.target.checked)} className="rounded bg-slate-900 text-primary h-4 w-4" />
                    <span className="text-slate-200 font-medium">Mobile phones</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                    <input type="checkbox" checked={devicesTablets} onChange={(e) => setDevicesTablets(e.target.checked)} className="rounded bg-slate-900 text-primary h-4 w-4" />
                    <span className="text-slate-200 font-medium">Tablets</span>
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                    <input type="checkbox" checked={devicesTv} onChange={(e) => setDevicesTv(e.target.checked)} className="rounded bg-slate-900 text-primary h-4 w-4" />
                    <span className="text-slate-200 font-medium">TV screens</span>
                  </label>
                </div>
              </div>

              {/* Brand Exclusions Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Brand exclusions</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400 leading-relaxed">
                  Exclude brands so your ads won't show on searches that mention those brands. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about brand exclusions</a>
                </p>

                <button type="button" className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer pt-1">
                  <Plus className="h-3.5 w-3.5" /> Use brand lists to exclude brands
                </button>
              </div>

              {/* Demographic Exclusions Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Demographic exclusions</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400 leading-relaxed">
                  Demographic exclusions will override any specific hints that are active on any asset groups within this campaign.
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={turnOnAgeExclusionsPmax}
                      onChange={(e) => setTurnOnAgeExclusionsPmax(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-semibold">Turn on age exclusions</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={turnOnGenderExclusionsPmax}
                      onChange={(e) => setTurnOnGenderExclusionsPmax(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-semibold">Turn on gender exclusions</span>
                  </label>
                </div>
              </div>

              {/* Your Data Exclusions Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Your data exclusions</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDataExclusionsPmax}
                    onChange={(e) => setEnableDataExclusionsPmax(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <span className="text-slate-200 font-semibold">Enable your data exclusions</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: ASSET GROUP */}
          {pmaxStep === "ASSET_GROUP" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Asset group</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Show high quality ads to the right people. Start by adding your assets, the building blocks of every ad. Google will test different combinations to create high performing ads across the formats and networks that work best for your goals and the audiences you want to reach.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                {/* Asset group name */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Asset group name</label>
                  <input
                    type="text"
                    value={assetGroupName}
                    onChange={(e) => setAssetGroupName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                {/* Final URL */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Final URL</label>
                  <input
                    type="text"
                    value={finalUrl}
                    onChange={(e) => setFinalUrl(e.target.value)}
                    placeholder="Final URL (e.g. https://www.example.com)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                {/* Brand guidelines */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-semibold text-slate-200">Brand guidelines</h3>
                    <button type="button" className="text-primary font-semibold hover:underline">More options</button>
                  </div>
                  <p className="text-slate-400">Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about brand guidelines</a></p>
                  <div className="space-y-1 max-w-md">
                    <label className="block text-slate-300 font-semibold">Business name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      maxLength={25}
                      placeholder="Business name"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                    <span className="text-[10px] text-slate-500 block">Text is {businessName.length} characters out of 25</span>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-400">
                    Logos 0/5 • <button type="button" className="text-primary font-semibold hover:underline">Add visual and text guidelines</button>
                  </div>
                </div>

                {/* Assets Alert & Ad Strength */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 space-y-1">
                  <p className="font-semibold text-amber-200">Google AI isn't able to generate assets for your final url. You can still add assets yourself.</p>
                  <p className="text-[11px] text-amber-300/80">Let's start adding ad assets. Ad strength: <strong className="text-amber-400">Incomplete</strong></p>
                </div>

                {/* Assets Input Section */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-200 block">Headline (0)</label>
                    {headlines.map((hl, i) => (
                      <input
                        key={i}
                        type="text"
                        value={hl}
                        onChange={(e) => { const u = [...headlines]; u[i] = e.target.value; setHeadlines(u); }}
                        maxLength={30}
                        placeholder="Headline"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary mb-2"
                      />
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <label className="font-semibold text-slate-200 block">Long headlines (0)</label>
                    <input
                      type="text"
                      value={longHeadlines[0] || ""}
                      onChange={(e) => setLongHeadlines([e.target.value])}
                      maxLength={90}
                      placeholder="Long headline"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <label className="font-semibold text-slate-200 block">Descriptions (0)</label>
                    {descriptions.map((desc, i) => (
                      <input
                        key={i}
                        type="text"
                        value={desc}
                        onChange={(e) => { const u = [...descriptions]; u[i] = e.target.value; setDescriptions(u); }}
                        maxLength={90}
                        placeholder="Description"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary mb-2"
                      />
                    ))}
                  </div>

                  {/* Sitelinks List */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <h3 className="font-semibold text-slate-200">Sitelinks</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Sitelink 1", "Sitelink 2", "Sitelink 3", "Sitelink 4", "Sitelink 5", "Sitelink 6"].map((s, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                          <span>{s}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Recommended</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Call to action */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Call to action</span>
                    <span className="text-primary font-bold">Automated</span>
                  </div>
                </div>

                {/* Signals Section */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Signals</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Signals provide valuable information about the people you want to reach. They help guide who sees your ads on Google Search, YouTube, and more.
                  </p>
                  
                  <div className="space-y-2 pt-1">
                    <label className="block text-slate-300 font-semibold">Search themes</label>
                    <p className="text-[11px] text-slate-400">What are some words or phrases people use when searching for your products or services?</p>
                    <input
                      type="text"
                      value={searchThemesInput}
                      onChange={(e) => setSearchThemesInput(e.target.value)}
                      placeholder="Add search themes (up to 50)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-slate-300 font-semibold">Audience signal</label>
                    <p className="text-[11px] text-slate-400 mb-2">Reach the right customers faster across Google with an audience signal.</p>
                    <input
                      type="text"
                      value={audienceName}
                      onChange={(e) => setAudienceName(e.target.value)}
                      placeholder="Enter audience name"
                      className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {pmaxStep === "BUDGET" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Budget</h1>
              <p className="text-xs text-slate-400">Decide how much you want to spend.</p>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Budget</h2>
                  <p className="text-slate-400 mt-1">Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.</p>
                </div>

                <div className="space-y-3">
                  <span className="font-semibold text-slate-200 block">Select budget type</span>

                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      value={budgetTypeOption}
                      onChange={(e) => setBudgetTypeOption(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                    >
                      <option value="DAILY">Average daily budget</option>
                      <option value="TOTAL">Campaign total budget</option>
                    </select>

                    <div className="relative w-48">
                      <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">₹</span>
                      <input
                        type="text"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(e.target.value)}
                        placeholder="Required"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-100 placeholder-amber-400/70 font-medium"
                      />
                    </div>
                  </div>

                  {!dailyBudget && (
                    <span className="text-rose-400 text-[11px] block font-semibold">Value is required</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY */}
          {pmaxStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Your campaign is almost ready to publish</h1>

              {/* Issues Card */}
              <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs space-y-2 shadow-lg">
                <h3 className="font-bold text-rose-200 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  Fix these issues to run your campaign
                </h3>
                <ul className="list-disc pl-5 space-y-1 font-semibold">
                  <li>Add a budget: To publish your campaign, enter a budget</li>
                  <li>Final URL: Enter a valid URL (ex. https://www.example.com)</li>
                  <li>Budget: Value is required</li>
                </ul>
              </div>

              {/* Overview Details */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Campaign name</span>
                    <span className="text-slate-100 font-bold">{currentConfig.performanceMaxName}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Campaign type</span>
                    <span className="text-slate-100 font-bold">Performance Max</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Objective</span>
                    <span className="text-slate-100 font-bold">{currentConfig.objectiveLabel}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Goal</span>
                    <span className="text-slate-100 font-bold">{currentConfig.goals}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Bidding</h3>
                  <p>Bidding: <strong>Maximize conversions</strong></p>
                  <p>Customer acquisition: <strong>Bid equally for new and existing customers</strong></p>
                  <p>Customer retention: <strong>Do not adjust bidding to re-engage lapsed customers</strong></p>
                </div>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Campaign settings</h3>
                  <p>Locations: <strong>{selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom"}</strong></p>
                  <p>Languages: <strong>{selectedLanguages.join(", ")}</strong></p>
                  <p>EU political ads: <strong>{euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}</strong></p>
                </div>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Asset group</h3>
                  <p>Asset group name: <strong>{assetGroupName}</strong></p>
                  <p>Final URL: <strong className="text-rose-400">{finalUrl || "Enter a valid URL (ex. https://www.example.com)"}</strong></p>
                  <p>Assets: <strong>No assets</strong></p>
                  <p>Search themes: <strong>No signals provided</strong></p>
                  <p>Audience: <strong>No signal provided</strong></p>
                </div>

                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Budget</h3>
                  <p className="text-rose-400 font-semibold">Budget: ₹{dailyBudget || "0.00"}/day (Value is required)</p>
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
            if (pmaxStep === "SUMMARY") setPmaxStep("BUDGET");
            else if (pmaxStep === "BUDGET") setPmaxStep("ASSET_GROUP");
            else if (pmaxStep === "ASSET_GROUP") setPmaxStep("CAMPAIGN_SETTINGS");
            else if (pmaxStep === "CAMPAIGN_SETTINGS") setPmaxStep("BIDDING");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          {pmaxStep === "BIDDING" ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {pmaxStep !== "SUMMARY" && (
            <button
              onClick={() => {
                if (pmaxStep === "BIDDING") setPmaxStep("CAMPAIGN_SETTINGS");
                else if (pmaxStep === "CAMPAIGN_SETTINGS") setPmaxStep("ASSET_GROUP");
                else if (pmaxStep === "ASSET_GROUP") setPmaxStep("BUDGET");
                else if (pmaxStep === "BUDGET") setPmaxStep("SUMMARY");
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {pmaxStep === "SUMMARY" && (
            <button
              onClick={() => {
                if (!dailyBudget) {
                  alert("Add a budget: To publish your campaign, enter a budget");
                  return;
                }
                alert("Performance Max campaign published successfully!");
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
