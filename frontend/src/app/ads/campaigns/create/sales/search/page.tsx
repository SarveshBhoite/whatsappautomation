"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search as SearchIcon, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, Sparkles, Image as ImageIcon, Video as VideoIcon, Upload, Phone, DollarSign, Tag, FileText, MessageSquare, Smartphone, SlidersHorizontal, Globe, Users, Settings, Edit3, Lock, ShieldAlert, Cpu
} from "lucide-react";

export default function SalesSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "BIDDING" | "CAMPAIGN_SETTINGS" | "KEYWORDS_ADS" | "BUDGET" | "SUMMARY"
  const [wizardStep, setWizardStep] = useState<"BIDDING" | "CAMPAIGN_SETTINGS" | "KEYWORDS_ADS" | "BUDGET" | "SUMMARY">("BIDDING");

  // Step 1: Bidding State
  const [biddingFocus, setBiddingFocus] = useState<"Conversions" | "Conversion value" | "Clicks" | "Impression share">("Conversions");
  const [setTargetCpa, setSetTargetCpa] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("166.11");
  const [onlyBidNewCustomers, setOnlyBidNewCustomers] = useState<boolean>(false);
  const [adjustLapsedCustomers, setAdjustLapsedCustomers] = useState<boolean>(false);

  // Step 2: Campaign Settings State
  const [searchPartnersNetwork, setSearchPartnersNetwork] = useState<boolean>(true);
  const [displayNetwork, setDisplayNetwork] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [targetLocations, setTargetLocations] = useState<Array<{ name: string; type: string; reach: string }>>([
    { name: "Mumbai, Maharashtra, India", type: "City", reach: "21,400,000" }
  ]);
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE_INTEREST");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [audienceTab, setAudienceTab] = useState<"SEARCH" | "BROWSE">("SEARCH");
  const [audienceTargetingMode, setAudienceTargetingMode] = useState<"TARGETING" | "OBSERVATION">("OBSERVATION");
  const [adRotationMode, setAdRotationMode] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">("OPTIMIZE");

  // Search-Specific AI Max Settings State
  const [enableAiMax, setEnableAiMax] = useState<boolean>(true);
  const [enableTextCustomization, setEnableTextCustomization] = useState<boolean>(true);
  const [enableFinalUrlExpansion, setEnableFinalUrlExpansion] = useState<boolean>(true);
  const [brandInclusions, setBrandInclusions] = useState<string[]>([]);
  const [brandExclusions, setBrandExclusions] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState<string>("");
  const [aiGenFinalUrl, setAiGenFinalUrl] = useState<string>("https://www.example.com");

  // Expandable More Settings
  const [showMoreSettings, setShowMoreSettings] = useState<boolean>(false);
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "12:00 AM", end: "12:00 AM" }
  ]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>("");

  // Step 3: Keywords and Ads State
  const [adGroupName, setAdGroupName] = useState<string>("Ad Group 1");
  const [keywordsText, setKeywordsText] = useState<string>("whatsapp automation\ncampaign management\nlead generation software");
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [displayPath1, setDisplayPath1] = useState<string>("");
  const [displayPath2, setDisplayPath2] = useState<string>("");
  const [headlines, setHeadlines] = useState<string[]>(["Automation Software", "Lead Gen Tool", "WhatsApp Marketing"]);
  const [descriptions, setDescriptions] = useState<string[]>(["Automate your business communication with WhatsApp.", "Boost conversions with instant messaging."]);

  // Modals State
  const [activeModal, setActiveModal] = useState<
    "SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | null
  >(null);

  // Modal 1: Sitelinks State
  const [sitelinks, setSitelinks] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([
    { text: "Features", desc1: "Explore all features", desc2: "See what we offer", url: "https://www.example.com/features" }
  ]);

  // Modal 2: Calls State
  const [callCountry, setCallCountry] = useState<string>("India (+91)");
  const [callPhone, setCallPhone] = useState<string>("");

  // Step 4: Budget State
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [selectedPresetBudget, setSelectedPresetBudget] = useState<string>("1556.83");
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("");

  const languagesList = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu",
    "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German",
    "Chinese (simplified)", "Japanese", "Arabic", "Portuguese", "Russian"
  ];

  const locationSuggestionsList = [
    { name: "Mumbai, Maharashtra, India", type: "City", reach: "21,400,000" },
    { name: "Delhi, India", type: "Union territory", reach: "30,200,000" },
    { name: "Bengaluru, Karnataka, India", type: "City", reach: "13,100,000" },
    { name: "Hyderabad, Telangana, India", type: "City", reach: "10,500,000" },
    { name: "Pune, Maharashtra, India", type: "City", reach: "7,800,000" },
    { name: "United States", type: "Country", reach: "280,000,000" },
    { name: "United Kingdom", type: "Country", reach: "55,000,000" }
  ];

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

  const activeBudgetValue = selectedPresetBudget === "CUSTOM"
    ? Number(customBudgetValue.replace(/,/g, "")) || 1556.83
    : Number(selectedPresetBudget) || 1556.83;

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
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-semibold">
            <span className="text-slate-400">Sales</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <SearchIcon className="h-3.5 w-3.5 text-primary" />
              Search Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "658-735-5041 JISNU Digital Solutions PVT LTD"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <SearchIcon className="h-4 w-4 text-primary shrink-0" />
              <span>Search</span>
            </div>

            <nav className="space-y-2 text-xs">
              {/* Step 1: Bidding */}
              <div
                onClick={() => setWizardStep("BIDDING")}
                className={`p-2.5 rounded-xl space-y-1 cursor-pointer transition-all ${
                  wizardStep === "BIDDING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div>
                  <span>Bidding</span>
                </div>
                {wizardStep === "BIDDING" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="text-primary font-medium">Bidding</p>
                    <p className="hover:text-slate-200">Customer acquisition</p>
                    <p className="hover:text-slate-200">Customer retention</p>
                  </div>
                )}
              </div>

              {/* Step 2: Campaign settings */}
              <div
                onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "CAMPAIGN_SETTINGS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">2</div>
                <span>Campaign settings</span>
              </div>

              {/* Step 3: Keywords and ads */}
              <div
                onClick={() => setWizardStep("KEYWORDS_ADS")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "KEYWORDS_ADS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">3</div>
                <span>Keywords and ads</span>
              </div>

              {/* Step 4: Budget */}
              <div
                onClick={() => setWizardStep("BUDGET")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "BUDGET"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">4</div>
                <span>Budget</span>
              </div>

              {/* Step 5: Review */}
              <div
                onClick={() => setWizardStep("SUMMARY")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "SUMMARY"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">5</div>
                <span>Review</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
          
          {/* STEP 1: BIDDING */}
          {wizardStep === "BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Bidding</h1>

              {/* Card 1: Bidding Focus */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-semibold text-white">Bidding</h2>
                  <ChevronDown className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <label className="block text-slate-300 font-semibold">What do you want to focus on?</label>
                  <select
                    value={biddingFocus}
                    onChange={(e) => setBiddingFocus(e.target.value as any)}
                    className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium"
                  >
                    <optgroup label="Recommended for your campaign goal">
                      <option value="Conversions">Conversions</option>
                      <option value="Conversion value">Conversion value</option>
                    </optgroup>
                    <optgroup label="Other optimization options">
                      <option value="Clicks">Clicks</option>
                      <option value="Impression share">Impression share</option>
                    </optgroup>
                  </select>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setTargetCpa}
                        onChange={(e) => setSetTargetCpa(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                      />
                      <span className="text-slate-200 font-medium">Set a target cost per action (optional)</span>
                    </label>

                    {setTargetCpa && (
                      <div className="ml-7 pt-3 space-y-1.5 animate-in fade-in duration-200">
                        <label className="block text-[11px] text-slate-400 font-semibold">Target CPA</label>
                        <div className="relative max-w-xs">
                          <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">₹</span>
                          <input
                            type="text"
                            value={targetCpaValue}
                            onChange={(e) => setTargetCpaValue(e.target.value)}
                            placeholder="166.11"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Customer Acquisition */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-semibold text-white">Customer acquisition</h2>
                  <ChevronDown className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBidNewCustomers}
                      onChange={(e) => setOnlyBidNewCustomers(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Only bid for new customers</span>
                  </label>

                  {onlyBidNewCustomers && (
                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 space-y-2 animate-in fade-in duration-200">
                      <p className="font-bold text-rose-200 flex items-center gap-2 text-xs">
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        This campaign will not run.
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        To bid only for new customers, you must select an existing customer audience segment with at least 100 active members in the last 30 days.{" "}
                        <a href="#" onClick={e => e.preventDefault()} className="underline font-bold text-rose-200">Define existing customer list</a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Customer Retention */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-semibold text-white">Customer retention</h2>
                  <ChevronDown className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adjustLapsedCustomers}
                      onChange={(e) => setAdjustLapsedCustomers(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Adjust your bidding to help re-engage lapsed customers</span>
                  </label>

                  <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                    A purchase conversion goal is required to bid higher for lapsed customers than for existing active customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>

              {/* 1. Networks */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Networks</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchPartnersNetwork}
                      onChange={(e) => setSearchPartnersNetwork(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-slate-200 font-medium block">Google Search Partners Network (recommended)</span>
                      <span className="text-[11px] text-slate-400 block">Ads can appear near Google Search results and other Google sites when people search for terms related to your keywords.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer border-t border-slate-800/60 pt-2.5">
                    <input
                      type="checkbox"
                      checked={displayNetwork}
                      onChange={(e) => setDisplayNetwork(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-slate-200 font-medium block">Google Display Network (recommended)</span>
                      <span className="text-[11px] text-slate-400 block">Expand your reach by showing ads to relevant users as they browse the web and apps.</span>
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
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchLoc"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchLoc"
                      checked={selectedLocation === "CUSTOM"}
                      onChange={() => setSelectedLocation("CUSTOM")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Enter another location</span>
                  </label>

                  {selectedLocation === "CUSTOM" && (
                    <div className="ml-7 pt-2 space-y-3 animate-in fade-in duration-200">
                      <div className="relative max-w-md">
                        <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
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
                    <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearchInput}
                      onChange={(e) => setLanguageSearchInput(e.target.value)}
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Languages Checkbox Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 max-h-36 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950">
                    {languagesList.filter(l => l.toLowerCase().includes(languageSearchInput.toLowerCase())).map((lang, idx) => {
                      const isSelected = selectedLanguages.includes(lang);
                      return (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedLanguages(prev => [...prev, lang]);
                              else setSelectedLanguages(prev => prev.filter(l => l !== lang));
                            }}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span>{lang}</span>
                        </label>
                      );
                    })}
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
                      checked={euPoliticalAds === "YES"}
                      onChange={() => setEuPoliticalAds("YES")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="searchEuPol"
                      checked={euPoliticalAds === "NO"}
                      onChange={() => setEuPoliticalAds("NO")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200">No, this campaign doesn't have EU political ads</span>
                  </label>
                  {euPoliticalAds === "YES" && (
                    <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                      Your campaign can't run in the European Union.
                    </div>
                  )}
                </div>
              </div>

              {/* 5. AI Max for Search campaigns (Search-Specific Banner) */}
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-white">AI Max for Search campaigns</h2>
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">NEW</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAiMax}
                      onChange={(e) => setEnableAiMax(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-200">Optimize with AI Max</span>
                  </label>
                </div>

                {enableAiMax && (
                  <div className="space-y-4 text-xs animate-in fade-in duration-200">
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      <li>Automates keyword matching and creative generation for maximum ROI</li>
                      <li>Adapts ad headlines dynamically based on real-time user intent</li>
                      <li>Expands final URLs automatically to high-converting landing pages</li>
                    </ul>

                    {/* Text Customization Sub-card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">Text Customization</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableTextCustomization}
                            onChange={(e) => setEnableTextCustomization(e.target.checked)}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span className="text-[11px] text-slate-300">ON</span>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400">Tailors headlines and descriptions to match exact search query intent.</p>
                      <div className="flex gap-2">
                        <button type="button" className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-primary font-bold hover:border-primary/50">Add text guidelines</button>
                        <button type="button" className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white">View asset examples</button>
                      </div>
                    </div>

                    {/* Final URL Expansion Sub-card */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">Final URL Expansion</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableFinalUrlExpansion}
                            onChange={(e) => setEnableFinalUrlExpansion(e.target.checked)}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span className="text-[11px] text-slate-300">ON</span>
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-400">Allows Google AI to direct traffic to relevant pages across your website domain.</p>
                      <button type="button" className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white">Add URL exclusions</button>
                    </div>

                    {/* Brands Inclusions & Exclusions */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <h4 className="font-semibold text-slate-200">Brand Inclusions & Exclusions (Max 20 lists)</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={brandInput}
                          onChange={(e) => setBrandInput(e.target.value)}
                          placeholder="Enter a brand name"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (brandInput.trim()) {
                              setBrandInclusions(prev => [...prev, brandInput.trim()]);
                              setBrandInput("");
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary text-slate-950 font-bold text-xs"
                        >
                          Include
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {brandInclusions.map((b, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-200">
                            {b}
                            <button onClick={() => setBrandInclusions(prev => prev.filter((_, idx) => idx !== i))}><X className="h-3 w-3 hover:text-rose-400" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Keyword and Asset Generation (Beta Banner) */}
              <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">Keyword and asset generation</h2>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">BETA</span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  Enter your Final URL to let Google AI analyze your site and automatically generate targeted keywords, headlines, and descriptions.
                </p>

                <div className="space-y-2">
                  <label className="block font-semibold text-slate-200">Final URL <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={aiGenFinalUrl}
                    onChange={(e) => setAiGenFinalUrl(e.target.value)}
                    placeholder="https://www.example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold">Skip</button>
                  <button
                    type="button"
                    onClick={() => alert(`Generating AI keywords for ${aiGenFinalUrl}...`)}
                    className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate Keywords
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: KEYWORDS AND ADS */}
          {wizardStep === "KEYWORDS_ADS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Keywords and Ads Setup</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                {/* Ad Group Name */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Ad Group Name</label>
                  <input
                    type="text"
                    value={adGroupName}
                    onChange={(e) => setAdGroupName(e.target.value)}
                    className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                  />
                </div>

                {/* Keywords Box */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block font-semibold text-slate-200">Keywords (Enter one per line)</label>
                  <textarea
                    rows={6}
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                  />
                  <span className="text-[11px] text-slate-500 block">Match types: keyword = Broad, "keyword" = Phrase, [keyword] = Exact</span>
                </div>

                {/* Responsive Search Ad Setup */}
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <h3 className="font-semibold text-slate-200">Responsive Search Ad</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Final URL</label>
                      <input type="text" value={finalUrl} onChange={(e) => setFinalUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Display Path (Optional)</label>
                      <div className="flex gap-2">
                        <input type="text" value={displayPath1} onChange={(e) => setDisplayPath1(e.target.value)} placeholder="path1" className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                        <input type="text" value={displayPath2} onChange={(e) => setDisplayPath2(e.target.value)} placeholder="path2" className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Headlines */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-300">Headlines (Up to 15)</label>
                    {headlines.map((hl, i) => (
                      <input key={i} type="text" value={hl} onChange={(e) => { const u = [...headlines]; u[i] = e.target.value; setHeadlines(u); }} maxLength={30} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs" />
                    ))}
                    {headlines.length < 15 && <button type="button" onClick={() => setHeadlines(p => [...p, ""])} className="text-primary font-semibold hover:underline">+ Add headline</button>}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {wizardStep === "BUDGET" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Budget</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                <div className="space-y-3">
                  <label className="block font-semibold text-slate-200">Set your average daily budget for this Search campaign</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                      onClick={() => setSelectedPresetBudget("1556.83")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPresetBudget === "1556.83" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs text-slate-400 block">Recommended</span>
                      <span className="text-lg font-bold text-white block mt-1">₹1,556.83</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Highest performance potential</span>
                    </div>

                    <div
                      onClick={() => setSelectedPresetBudget("1200.00")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPresetBudget === "1200.00" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs text-slate-400 block">Balanced</span>
                      <span className="text-lg font-bold text-white block mt-1">₹1,200.00</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Good reach</span>
                    </div>

                    <div
                      onClick={() => setSelectedPresetBudget("CUSTOM")}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPresetBudget === "CUSTOM" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xs text-slate-400 block">Custom</span>
                      <span className="text-lg font-bold text-white block mt-1">Set custom</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Enter custom daily budget</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Search Campaign Review</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-semibold text-white">Sales - Search</h2>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Ready to Publish</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Bidding</span>
                    <p className="text-slate-100 font-bold">{biddingFocus} {setTargetCpa ? `(Target CPA: ₹${targetCpaValue})` : ""}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Keywords</span>
                    <p className="text-slate-100 font-bold">{keywordsText.split("\n").length} keywords added</p>
                  </div>
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
            if (wizardStep === "SUMMARY") setWizardStep("BUDGET");
            else if (wizardStep === "BUDGET") setWizardStep("KEYWORDS_ADS");
            else if (wizardStep === "KEYWORDS_ADS") setWizardStep("CAMPAIGN_SETTINGS");
            else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("BIDDING");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          {wizardStep === "BIDDING" ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {wizardStep !== "SUMMARY" ? (
            <button
              onClick={() => {
                if (wizardStep === "BIDDING") setWizardStep("CAMPAIGN_SETTINGS");
                else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("KEYWORDS_ADS");
                else if (wizardStep === "KEYWORDS_ADS") setWizardStep("BUDGET");
                else if (wizardStep === "BUDGET") setWizardStep("SUMMARY");
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={async () => {
                alert(`Search campaign "${adGroupName}" published successfully!`);
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
