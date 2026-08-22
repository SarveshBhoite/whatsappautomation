"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search as SearchIcon, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info, Sparkles, Image as ImageIcon, Video as VideoIcon, Upload, Phone, DollarSign, Tag, FileText, MessageSquare, Smartphone, SlidersHorizontal, Globe, Users, Settings, Edit3, Lock, ShieldAlert, Cpu, Wrench
} from "lucide-react";

export default function WebsiteTrafficSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "BIDDING" | "CAMPAIGN_SETTINGS" | "KEYWORDS_ADS" | "BUDGET" | "SUMMARY"
  const [wizardStep, setWizardStep] = useState<"BIDDING" | "CAMPAIGN_SETTINGS" | "KEYWORDS_ADS" | "BUDGET" | "SUMMARY">("BIDDING");
  const [campaignName, setCampaignName] = useState<string>("Website Traffic - Search 1");

  // Step 1: Bidding State
  const [biddingFocus, setBiddingFocus] = useState<"Conversions" | "Conversion value" | "Clicks" | "Impression share">("Conversions");
  const [setTargetCpa, setSetTargetCpa] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("166.11");
  const [setTargetRoas, setSetTargetRoas] = useState<boolean>(false);
  const [targetRoasValue, setTargetRoasValue] = useState<string>("200");
  const [setMaxCpc, setSetMaxCpc] = useState<boolean>(false);
  const [maxCpcLimit, setMaxCpcLimit] = useState<string>("");
  const [impressionShareLocation, setImpressionShareLocation] = useState<string>("Anywhere on results page");
  const [targetImpressionSharePercent, setTargetImpressionSharePercent] = useState<string>("50");
  const [maxCpcImpressionShare, setMaxCpcImpressionShare] = useState<string>("");
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

  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [audienceSearchQuery, setAudienceSearchQuery] = useState<string>("");
  const [selectedAudienceSegments, setSelectedAudienceSegments] = useState<string[]>([]);
  const [showNewSegmentModal, setShowNewSegmentModal] = useState<boolean>(false);

  // Expandable More Settings
  const [showMoreSettings, setShowMoreSettings] = useState<boolean>(false);
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");
  const [customParams, setCustomParams] = useState<Array<{ name: string; value: string }>>([
    { name: "", value: "" }
  ]);
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "00:00", end: "00:00" }
  ]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>("");

  // Step 3: Keywords and Ads State
  const [adGroupName, setAdGroupName] = useState<string>("Ad Group 1");
  const [keywordScanUrl, setKeywordScanUrl] = useState<string>("");
  const [keywordProductsInput, setKeywordProductsInput] = useState<string>("");
  const [keywordsText, setKeywordsText] = useState<string>("website traffic\nvisit website\nonline business services");
  const [useSearchTermMatchingAdGroup, setUseSearchTermMatchingAdGroup] = useState<boolean>(true);
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [displayPath1, setDisplayPath1] = useState<string>("");
  const [displayPath2, setDisplayPath2] = useState<string>("");
  const [headlines, setHeadlines] = useState<string[]>(["Visit Our Website", "Discover Premium Services", "Learn More Today"]);
  const [descriptions, setDescriptions] = useState<string[]>(["Explore our range of solutions and drive your business forward.", "Visit our website for full details and instant access."]);
  const [businessName, setBusinessName] = useState<string>("JISNU DIGITAL SOLUTIONS PRIVATE LIMITED");
  const [businessLogos, setBusinessLogos] = useState<string[]>([]);
  const [callouts, setCallouts] = useState<string[]>([]);
  const [sitelinkTrackingTemplate, setSitelinkTrackingTemplate] = useState<string>("");
  const [sitelinkFinalUrlSuffix, setSitelinkFinalUrlSuffix] = useState<string>("");
  const [sitelinkCustomParamName, setSitelinkCustomParamName] = useState<string>("");
  const [sitelinkCustomParamValue, setSitelinkCustomParamValue] = useState<string>("");
  const [useDifferentMobileUrl, setUseDifferentMobileUrl] = useState<boolean>(false);
  const [mobileFinalUrl, setMobileFinalUrl] = useState<string>("");
  const [callPhone, setCallPhone] = useState<string>("091580 38487");
  const [showUrlInclusionsModal, setShowUrlInclusionsModal] = useState<boolean>(false);

  // Modals State
  const [activeModal, setActiveModal] = useState<
    "SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "MESSAGES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | "CALLOUTS" | null
  >(null);

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
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-semibold">
            <span className="text-slate-500">Website traffic</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <SearchIcon className="h-3.5 w-3.5 text-primary" />
              Search Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "658-735-5041 JISNU Digital Solutions PVT LTD"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200 p-4 space-y-4 shrink-0 bg-slate-50/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
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
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div>
                  <span>Bidding</span>
                </div>
                {wizardStep === "BIDDING" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="text-primary font-medium">Bidding</p>
                    <p className="hover:text-slate-800">Customer acquisition</p>
                    <p className="hover:text-slate-800">Customer retention</p>
                  </div>
                )}
              </div>

              {/* Step 2: Campaign settings */}
              <div
                onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "CAMPAIGN_SETTINGS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
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
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
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
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
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
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
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
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Bidding</h1>

              {/* Card 1: Bidding Focus */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-base font-semibold text-slate-900">Bidding</h2>
                  <ChevronDown className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-slate-700 font-semibold">What do you want to focus on for driving website traffic?</label>
                    <select
                      value={biddingFocus}
                      onChange={(e) => setBiddingFocus(e.target.value as any)}
                      className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
                    >
                      <optgroup label="Recommended for website traffic">
                        <option value="Conversions">Conversions (Get traffic to convert)</option>
                        <option value="Conversion value">Conversion value</option>
                      </optgroup>
                      <optgroup label="Other optimization options">
                        <option value="Clicks">Clicks (Maximize site visits)</option>
                        <option value="Impression share">Impression share</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* i) Conversions */}
                  {biddingFocus === "Conversions" && (
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setTargetCpa}
                          onChange={(e) => setSetTargetCpa(e.target.checked)}
                          className="rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                        />
                        <span className="text-slate-800 font-medium">Set a target cost per action (optional)</span>
                      </label>

                      {setTargetCpa && (
                        <div className="ml-7 space-y-1.5 animate-in fade-in duration-200">
                          <label className="block text-[11px] text-slate-500 font-semibold">Target CPA</label>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                            <input
                              type="text"
                              value={targetCpaValue}
                              onChange={(e) => setTargetCpaValue(e.target.value)}
                              placeholder="166.11"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ii) Conversion value */}
                  {biddingFocus === "Conversion value" && (
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setTargetRoas}
                          onChange={(e) => setSetTargetRoas(e.target.checked)}
                          className="rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                        />
                        <span className="text-slate-800 font-medium">Set a target return on ad spend (optional)</span>
                      </label>

                      {setTargetRoas && (
                        <div className="ml-7 space-y-1.5 animate-in fade-in duration-200">
                          <label className="block text-[11px] text-slate-500 font-semibold">Target ROAS (%)</label>
                          <div className="relative max-w-xs">
                            <input
                              type="text"
                              value={targetRoasValue}
                              onChange={(e) => setTargetRoasValue(e.target.value)}
                              placeholder="200"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-500">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* iii) Clicks */}
                  {biddingFocus === "Clicks" && (
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setMaxCpc}
                          onChange={(e) => setSetMaxCpc(e.target.checked)}
                          className="rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                        />
                        <span className="text-slate-800 font-medium">Set a maximum cost per click bid limit</span>
                      </label>

                      {setMaxCpc && (
                        <div className="ml-7 space-y-1.5 animate-in fade-in duration-200">
                          <label className="block text-[11px] text-slate-500 font-semibold">Maximum CPC bid limit</label>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                            <input
                              type="text"
                              value={maxCpcLimit}
                              onChange={(e) => setMaxCpcLimit(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* iv) Impression share */}
                  {biddingFocus === "Impression share" && (
                    <div className="space-y-4 pt-2 border-t border-slate-200">
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-semibold">Where do you want your ads to appear</label>
                        <select
                          value={impressionShareLocation}
                          onChange={(e) => setImpressionShareLocation(e.target.value)}
                          className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                        >
                          <option value="Anywhere on results page">Anywhere on results page</option>
                          <option value="Top of results page">Top of results page</option>
                          <option value="Absolute top of results page">Absolute top of results page</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-semibold">Percent (%) impression share to target</label>
                        <div className="relative max-w-xs">
                          <input
                            type="text"
                            value={targetImpressionSharePercent}
                            onChange={(e) => setTargetImpressionSharePercent(e.target.value)}
                            placeholder="50"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-500">%</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-semibold">Maximum CPC bid limit</label>
                        <div className="relative max-w-xs">
                          <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                          <input
                            type="text"
                            value={maxCpcImpressionShare}
                            onChange={(e) => setMaxCpcImpressionShare(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-blue-400 font-semibold leading-relaxed pt-1">
                        Bid more efficiently with Maximize clicks: Get more clicks with a fully automated bid strategy
                      </p>
                    </div>
                  )}

                  {/* Portfolio Strategy Disclaimer Notice */}
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    Alternative bid strategies like portfolios are available in settings after you create your campaign
                  </p>
                </div>
              </div>

              {/* Card 2: Customer Acquisition */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-base font-semibold text-slate-900">Customer acquisition</h2>
                  <ChevronDown className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBidNewCustomers}
                      onChange={(e) => setOnlyBidNewCustomers(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                    />
                    <div className="space-y-1">
                      <span className="text-slate-800 font-semibold block">Only bid for new customers</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed">
                        Your campaign will be limited to only new customers, regardless of your bid strategy
                      </span>
                    </div>
                  </label>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                    By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more about customer acquisition</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
                <p className="text-xs text-slate-500 mt-1">To reach the right people, start by defining key settings for your campaign</p>
              </div>

              {/* 1. Networks */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Networks</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchPartnersNetwork}
                      onChange={(e) => setSearchPartnersNetwork(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                    />
                    <div className="space-y-1">
                      <span className="text-slate-800 font-semibold block">Google Search Partners Network (recommended)</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed">
                        Ads can appear near Google Search results and on other Google Search Partners websites when people search for terms that are relevant to your keywords. Search Partners can include hundreds of non-Google websites, Parked Domains, as well as YouTube and other Google sites.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-3">
                    <input
                      type="checkbox"
                      checked={displayNetwork}
                      onChange={(e) => setDisplayNetwork(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                    />
                    <div className="space-y-1">
                      <span className="text-slate-800 font-semibold block">Google Display Network (recommended)</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed">
                        Ads can appear on relevant sites, videos, and apps across Google (like YouTube) and the Internet when you have leftover Search budget
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Locations */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wtSearchLoc"
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-800 font-medium">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wtSearchLoc"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-800 font-medium">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wtSearchLoc"
                      checked={selectedLocation === "CUSTOM"}
                      onChange={() => setSelectedLocation("CUSTOM")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-800 font-medium">Enter another location</span>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Suggestions List */}
                      {customLocationInput.trim() && (
                        <div className="border border-slate-200 bg-slate-50 rounded-xl max-w-md overflow-hidden space-y-1 p-1">
                          {locationSuggestionsList.filter(l => l.name.toLowerCase().includes(customLocationInput.toLowerCase())).map((loc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-white rounded-lg text-xs">
                              <div>
                                <span className="font-semibold text-slate-800 block">{loc.name}</span>
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
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 max-w-md">
                          <div>
                            <span className="font-semibold text-slate-800 block">{loc.name}</span>
                            <span className="text-[10px] text-slate-500">{loc.type} • Reach: {loc.reach}</span>
                          </div>
                          <button onClick={() => setTargetLocations(prev => prev.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-rose-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200">
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
                            name="wtSearchLocOpt"
                            checked={locationTargetingType === "PRESENCE_INTEREST"}
                            onChange={() => setLocationTargetingType("PRESENCE_INTEREST")}
                            className="text-primary h-4 w-4"
                          />
                          <span className="text-slate-700">Presence or interest: People in, regularly in, or who've shown interest in your targeted locations (recommended)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="wtSearchLocOpt"
                            checked={locationTargetingType === "PRESENCE"}
                            onChange={() => setLocationTargetingType("PRESENCE")}
                            className="text-primary h-4 w-4"
                          />
                          <span className="text-slate-700">Presence: People in or regularly in your targeted locations</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Languages */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="relative max-w-md">
                    <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearchInput}
                      onFocus={() => setShowLanguageDropdown(true)}
                      onChange={(e) => {
                        setLanguageSearchInput(e.target.value);
                        setShowLanguageDropdown(true);
                      }}
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Languages Checkbox Grid - Only Shown on Click/Focus/Type */}
                  {(showLanguageDropdown || languageSearchInput.trim().length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 animate-in fade-in duration-200">
                      {languagesList.filter(l => l.toLowerCase().includes(languageSearchInput.toLowerCase())).map((lang, idx) => {
                        const isSelected = selectedLanguages.includes(lang);
                        return (
                          <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 p-1 rounded hover:bg-white">
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
                  )}

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
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">EU political ads</h2>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-slate-800">Does your campaign have European Union political ads?</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wtSearchEuPol"
                      checked={euPoliticalAds === "YES"}
                      onChange={() => setEuPoliticalAds("YES")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-800">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wtSearchEuPol"
                      checked={euPoliticalAds === "NO"}
                      onChange={() => setEuPoliticalAds("NO")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-800">No, this campaign doesn't have EU political ads</span>
                  </label>
                  {euPoliticalAds === "YES" && (
                    <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                      Your campaign can't run in the European Union.
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Audience segments */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Audience segments</h2>
                    <p className="text-[11px] text-slate-500">
                      Select audience segments to add to your campaign. You can create new Your data segments by clicking on <span className="font-semibold text-slate-800">+ New segment</span> in the Search tab. <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                {/* Split Card Layout */}
                <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    
                    {/* Left Column: Search/Browse & Results */}
                    <div className="p-4 space-y-4 flex flex-col justify-between min-h-[260px]">
                      <div className="space-y-3">
                        {/* Tabs Header */}
                        <div className="flex items-center gap-6 border-b border-slate-200 pb-2">
                          <button
                            type="button"
                            onClick={() => setAudienceTab("SEARCH")}
                            className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${audienceTab === "SEARCH" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                          >
                            Search
                          </button>
                          <button
                            type="button"
                            onClick={() => setAudienceTab("BROWSE")}
                            className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${audienceTab === "BROWSE" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                          >
                            Browse
                          </button>
                        </div>

                        {/* Search Input Box */}
                        <div className="relative">
                          <SearchIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={audienceSearchQuery}
                            onChange={(e) => setAudienceSearchQuery(e.target.value)}
                            placeholder='Try "banking & finance"'
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Search Results / Default Empty Search Placeholder */}
                        {audienceTab === "SEARCH" && !audienceSearchQuery.trim() && (
                          <div className="py-8 text-center space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                              <SearchIcon className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
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
                                  <label key={idx} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer text-slate-800">
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
                      <div className="pt-2 border-t border-slate-200">
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
                    <div className="p-4 space-y-3 bg-slate-50/40 min-h-[260px] flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-semibold text-slate-700">
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
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                                <span className="text-slate-800 font-medium truncate max-w-[200px]">{seg}</span>
                                <button type="button" onClick={() => setSelectedAudienceSegments(prev => prev.filter((_, idx) => idx !== i))}>
                                  <X className="h-3.5 w-3.5 text-slate-500 hover:text-rose-400" />
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
                  <label className="block text-slate-700 font-semibold">
                    Targeting setting for this campaign <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="wtSearchAudienceMode"
                        checked={audienceTargetingMode === "TARGETING"}
                        onChange={() => setAudienceTargetingMode("TARGETING")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-semibold block">Targeting</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">Narrow the reach of your campaign to the selected segments, with the option to adjust the bids</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="wtSearchAudienceMode"
                        checked={audienceTargetingMode === "OBSERVATION"}
                        onChange={() => setAudienceTargetingMode("OBSERVATION")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-semibold block">Observation (recommended)</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">Don't narrow the reach of your campaign, with the option to adjust the bids on the selected segments</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 6. Ad rotation */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Ad rotation</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="wtSearchAdRot"
                      checked={adRotationMode === "OPTIMIZE"}
                      onChange={() => setAdRotationMode("OPTIMIZE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-slate-800 font-semibold block">Optimize: Prefer best performing ads</span>
                      <span className="text-[11px] text-slate-500 block">Show ads that are expected to get more clicks or conversions. Recommended for most advertisers.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-2.5">
                    <input
                      type="radio"
                      name="wtSearchAdRot"
                      checked={adRotationMode === "DO_NOT_OPTIMIZE"}
                      onChange={() => setAdRotationMode("DO_NOT_OPTIMIZE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-slate-800 font-semibold block">Do not optimize: Rotate ads indefinitely</span>
                      <span className="text-[11px] text-slate-500 block">Rotates your ads more evenly into the ad auction, but does not optimize for clicks or conversions.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 7. Start and end dates */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Start and end dates</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md text-xs">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500 font-semibold">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-500 font-semibold">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Your ads will continue to run unless you specify an end date.</p>
              </div>

              {/* 8. Ad schedule */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Ad schedule</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
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
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold"
                      >
                        {["All days", "Mondays - Fridays", "Saturdays - Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"].map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>

                      <span className="text-slate-500">from</span>

                      <select
                        value={sched.start}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].start = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                      >
                        {["00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"].map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      <span className="text-slate-500">to</span>

                      <select
                        value={sched.end}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].end = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                      >
                        {["00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"].map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      {adScheduleList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAdScheduleList(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
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

                  <p className="text-[11px] text-slate-500 leading-relaxed">To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. Learn more</p>
                  <p className="text-[11px] text-slate-500 font-mono">Based on account time zone: (GMT+05:30) India Standard Time</p>
                  <p className="text-[11px] text-slate-500">To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                </div>
              </div>

              {/* 9. Campaign URL options */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Campaign URL options</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Tracking template</label>
                    <input
                      type="text"
                      value={trackingTemplate}
                      onChange={(e) => setTrackingTemplate(e.target.value)}
                      placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Final URL suffix</label>
                    <input
                      type="text"
                      value={finalUrlSuffix}
                      onChange={(e) => setFinalUrlSuffix(e.target.value)}
                      placeholder="Example: param1=value1&param2=value2"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block text-slate-700 font-semibold">Custom parameters</label>
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
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                        />
                        <span className="text-slate-500 font-mono">{`}`}</span>
                        <span className="text-slate-500 font-bold">=</span>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...customParams];
                            updated[idx].value = e.target.value;
                            setCustomParams(updated);
                          }}
                          placeholder="Value"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
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

                  <p className="text-[11px] text-slate-500 pt-1">
                    Tracking template is the URL you want the ad click to go to for tracking. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: KEYWORDS AND ADS */}
          {wizardStep === "KEYWORDS_ADS" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Keywords and ads</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Ad groups help you organize your ads around a common theme. For the best results, focus your ads and keywords on one product or service.
                </p>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">Add details to match your ads to the right searches</h2>
              </div>

              {/* Card 1: Keywords Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Keywords</h3>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                {/* Get keyword suggestions (optional) */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-800">Get keyword suggestions (optional)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="relative">
                      <Tag className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={keywordProductsInput}
                        onChange={(e) => setKeywordProductsInput(e.target.value)}
                        placeholder="Enter products or services to advertise"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("Scanning web page for keyword suggestions...")}
                      className="text-slate-500 hover:text-slate-900 font-semibold text-[11px] cursor-pointer"
                    >
                      Get keyword suggestions
                    </button>
                  </div>
                </div>

                {/* Enter keywords */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-800">Enter keywords</h4>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Keywords are words or phrases that are used to match your ads with the terms people are searching for
                  </p>

                  <textarea
                    rows={6}
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="Enter or paste keywords. You can separate each keyword by commas or enter one per line."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Card 2: Ad group settings for AI Max */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Ad group settings for AI Max</h3>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                {/* Green Status Bar */}
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>AI Max is turned on for your campaign</span>
                </div>

                {/* Sub-Card 1: Search term matching */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">Search term matching</h4>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">BETA</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Search term matching expands your keywords to broad match and lets Google AI match content from your landing pages and assets to help you show up on more relevant searches
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={useSearchTermMatchingAdGroup}
                      onChange={(e) => setUseSearchTermMatchingAdGroup(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span className="font-semibold text-slate-800">Use search term matching for this ad group</span>
                  </label>
                </div>

                {/* Sub-Card 2: Brand Inclusions */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-800">Brand Inclusions</h4>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Add brand inclusions to limit traffic to serve only on search queries related to the specified brands. Your ad group brand inclusions will be used instead of campaign-level brand inclusions. <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </p>
                  <div className="relative max-w-xl">
                    <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Add brand lists"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sub-Card 3: Locations of Interest */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-800">Locations of Interest</h4>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Use locations of interest to reach customers searching for or interested in specific geographic areas. The locations you selected in your campaign settings still apply. For best results, use locations of interest with phrase and broad match keywords. <HelpCircle className="inline h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </p>
                  <div className="space-y-1 max-w-xl">
                    <div className="relative">
                      <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Add locations of interest"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">For example, a country, city, region, or postal code</span>
                  </div>
                </div>

                {/* Sub-Card 4: URL Inclusions */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-800">URL Inclusions</h4>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
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

              {/* Create ads to get more website traffic Section Header */}
              <div className="space-y-1 pt-4">
                <h2 className="text-base font-bold text-slate-900">Create ads to get more website traffic</h2>
              </div>

              {/* Main Ads Container Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
                {/* Header: Ad Strength & Checklist */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Ad strength</span>
                      <span className="text-[11px] text-amber-400 font-semibold">Incomplete</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Add headlines</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Include popular keywords</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Make headlines unique</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>Make descriptions unique</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline text-[10px]">View ideas</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
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
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>Final URL</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <input
                        type="text"
                        value={finalUrl}
                        onChange={(e) => setFinalUrl(e.target.value)}
                        placeholder="Final URL"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block">This will be used to suggest assets for your ad</span>
                    </div>

                    {/* 2. Display path Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>Display path</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">www.example.com/</span>
                        <input
                          type="text"
                          value={displayPath1}
                          onChange={(e) => setDisplayPath1(e.target.value)}
                          maxLength={15}
                          className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
                        />
                        <span className="text-slate-600 font-bold">/</span>
                        <input
                          type="text"
                          value={displayPath2}
                          onChange={(e) => setDisplayPath2(e.target.value)}
                          maxLength={15}
                          className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{displayPath1.length} / 15</span>
                        <span>{displayPath2.length} / 15</span>
                      </div>
                    </div>

                    {/* 3. Ad URL options Accordion */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                      <div className="flex items-center justify-between cursor-pointer border-b border-slate-200 pb-2">
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
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary pr-9 font-mono"
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
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary pr-9 font-mono"
                            />
                            <HelpCircle className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                          </div>
                          <span className="text-[10px] text-slate-500 block font-mono">Example: param1=value1&param2=value2</span>
                        </div>

                        {/* Custom parameter */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-700 font-semibold">
                            <span>Custom parameter</span>
                            <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                              <span className="text-slate-500 font-mono text-xs pr-1">{`{_`}</span>
                              <input
                                type="text"
                                value={sitelinkCustomParamName}
                                onChange={(e) => setSitelinkCustomParamName(e.target.value)}
                                placeholder="Name"
                                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none font-mono"
                              />
                              <span className="text-slate-500 font-mono text-xs pl-1">{`}`}</span>
                            </div>
                            <span className="text-slate-500 font-bold">=</span>
                            <input
                              type="text"
                              value={sitelinkCustomParamValue}
                              onChange={(e) => setSitelinkCustomParamValue(e.target.value)}
                              placeholder="Value"
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        </div>

                        {/* Use a different final URL for mobile */}
                        <div className="space-y-2 pt-1 border-t border-slate-200">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useDifferentMobileUrl}
                              onChange={(e) => setUseDifferentMobileUrl(e.target.checked)}
                              className="rounded text-primary h-4 w-4"
                            />
                            <span className="text-slate-700 font-semibold">Use a different final URL for mobile</span>
                          </label>

                          {useDifferentMobileUrl && (
                            <input
                              type="text"
                              value={mobileFinalUrl}
                              onChange={(e) => setMobileFinalUrl(e.target.value)}
                              placeholder="Final URL for mobile"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-mono animate-in fade-in duration-150"
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
                          <p className="text-xs font-semibold text-slate-800">Want more personalized help? Chat with Ads Advisor to get keyword & asset suggestions.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Opening Ads Advisor chat...")}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs shrink-0 shadow cursor-pointer"
                      >
                        Open chat
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 block italic">Google is choosing the assets <HelpCircle className="inline h-3 w-3" /></span>

                    {/* 4. Calls Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-800">
                          <PhoneCall className="h-4 w-4 text-slate-500" />
                          <span>Calls</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-500">Add a phone number</p>
                      <span className="text-[11px] text-slate-500 block border-b border-dashed border-slate-300 pb-1 w-max cursor-pointer">Account-level calls</span>
                      <button
                        type="button"
                        onClick={() => setActiveModal("CALLS")}
                        className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1"
                      >
                        + Calls
                      </button>
                    </div>

                    {/* 5. Headlines Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Headlines</span>
                          <span className="text-slate-500 text-[11px] font-mono">{headlines.filter(h => h).length} / 15</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">View ideas</button>
                          <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {headlines.map((hl, i) => (
                          <div key={i} className="space-y-0.5">
                            <input
                              type="text"
                              value={hl}
                              onChange={(e) => {
                                const updated = [...headlines];
                                updated[i] = e.target.value;
                                setHeadlines(updated);
                              }}
                              placeholder="Headline"
                              maxLength={30}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                            />
                            <div className="flex justify-between text-[9px] text-slate-500 px-1">
                              <span>Required</span>
                              <span>{hl.length} / 30</span>
                            </div>
                          </div>
                        ))}

                        {headlines.length < 15 && (
                          <button
                            type="button"
                            onClick={() => setHeadlines(prev => [...prev, ""])}
                            className="text-blue-400 font-bold text-xs hover:underline block pt-1"
                          >
                            + Headline
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 6. Descriptions Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Descriptions</span>
                          <span className="text-slate-500 text-[11px] font-mono">{descriptions.filter(d => d).length} / 4</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">View ideas</button>
                          <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {descriptions.map((desc, i) => (
                          <div key={i} className="space-y-0.5">
                            <input
                              type="text"
                              value={desc}
                              onChange={(e) => {
                                const updated = [...descriptions];
                                updated[i] = e.target.value;
                                setDescriptions(updated);
                              }}
                              placeholder="Description"
                              maxLength={90}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                            />
                            <div className="flex justify-between text-[9px] text-slate-500 px-1">
                              <span>Required</span>
                              <span>{desc.length} / 90</span>
                            </div>
                          </div>
                        ))}

                        {descriptions.length < 4 && (
                          <button
                            type="button"
                            onClick={() => setDescriptions(prev => [...prev, ""])}
                            className="text-blue-400 font-bold text-xs hover:underline block pt-1"
                          >
                            + Description
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 7. Business name Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800">Business name</label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        This name should match your URL or your verified advertiser name, which is <strong className="text-slate-800">JISNU DIGITAL SOLUTIONS PRIVATE LIMITED</strong>.
                      </p>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        maxLength={25}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Until you add an approved name, your campaign will run with a placeholder name created from your URL.</span>
                        <span>{businessName.length} / 25</span>
                      </div>
                    </div>

                    {/* 8. Business logo Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800">Business logo</label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-500">Add business logo to your campaign</p>

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
                            <div key={i} className="relative group w-14 h-14 rounded-xl border border-slate-200 bg-white overflow-hidden shadow">
                              <img src={logoUrl} alt={`Logo ${i+1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setBusinessLogos(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-50/80 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
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
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>Callouts</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-500">Add more business information</p>
                      {callouts.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {callouts.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-semibold">
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
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                      <div className="flex items-center justify-between cursor-pointer border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">More asset types</span>
                          <span className="text-slate-500 text-[11px] font-mono">(0/7)</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Improve your ad performance and make your ad more interactive by adding more details about your business and website
                      </p>

                      <div className="space-y-3 pt-1">
                        {/* Promotions */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Promotions</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("PROMOTIONS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add promotions
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Prices</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("PRICES")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add prices
                          </button>
                        </div>

                        {/* Messages */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Messages</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("MESSAGES")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add a message
                          </button>
                        </div>

                        {/* Structured snippets */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Structured snippets</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("SNIPPETS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add snippets of text
                          </button>
                        </div>

                        {/* Lead forms */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Lead forms</span>
                          <button
                            type="button"
                            onClick={() => setActiveModal("LEAD_FORMS")}
                            className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            + Add a form
                          </button>
                        </div>

                        {/* Apps */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Apps</span>
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
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>Sitelinks</span>
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </label>
                        <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                      </div>
                      <p className="text-[11px] text-slate-500">Add links to your ads to take people to specific pages on your website.</p>
                      <button
                        type="button"
                        onClick={() => setActiveModal("SITELINKS")}
                        className="text-blue-400 font-bold text-xs hover:underline block cursor-pointer"
                      >
                        + Sitelinks
                      </button>
                    </div>

                    {/* Optimization Tips Banners */}
                    <div className="space-y-2 pt-2 border-t border-slate-200 text-[11px]">
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Add callouts:</strong> Help your ads show more prominently by adding callouts.
                      </p>
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Add sitelinks:</strong> Draw more attention to your ads by adding at least 4 sitelinks.
                      </p>
                    </div>

                  </div>

                  {/* Right Column: Sticky Mobile Search Ad Preview (5 Cols) */}
                  <div className="lg:col-span-5">
                    <div className="sticky top-24 space-y-4">
                      <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 shadow-sm text-center">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
                          <span className="font-bold text-slate-800">Preview</span>
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">Share</button>
                            <button type="button" className="text-blue-400 text-[11px] font-semibold hover:underline">Preview ads</button>
                          </div>
                        </div>

                        {/* Mobile Phone Mockup Frame */}
                        <div className="relative mx-auto max-w-[280px] p-4 rounded-[32px] border-4 border-slate-200 bg-white shadow-md text-left space-y-3">
                          {/* Search Header Mockup */}
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] text-slate-500">
                            <span className="font-bold text-slate-900">Google</span>
                            <SearchIcon className="h-3 w-3 text-slate-500" />
                          </div>

                          {/* Sponsored Search Ad Preview */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                              <span className="truncate">{finalUrl || "www.example.com"}</span>
                            </div>

                            <h4 className="font-bold text-blue-400 text-sm leading-snug line-clamp-2">
                              {headlines[0] || "Headline 1"} - {headlines[1] || "Headline 2"}
                            </h4>

                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                              {descriptions[0] || "Description 1 placeholder text..."}
                            </p>

                            {/* Call Action Preview */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-800">
                              <Phone className="h-3.5 w-3.5 text-primary" />
                              <span>Call {callPhone || "091580 38487"}</span>
                            </div>
                          </div>

                          {/* Pagination Carousel Dots */}
                          <div className="flex justify-center items-center gap-1.5 pt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto text-center pt-2">
                          Previews shown here are examples and don&apos;t include all possible formats. You&apos;re responsible for the content of your ads. Please make sure that your provided assets don&apos;t violate any Google policies or applicable laws.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {wizardStep === "BUDGET" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Budget</h1>
                <p className="text-xs text-slate-500">Decide how much you want to spend.</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm text-xs">
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
                      <span className="font-bold text-slate-900 text-xs block">Select budget type</span>

                      {/* Option 1: Average daily budget */}
                      <label
                        onClick={() => setBudgetType("DAILY")}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          budgetType === "DAILY" ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"
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
                          <span className="font-bold text-slate-900 block">Average daily budget</span>
                          <span className="text-slate-500 block text-[11px]">Set your average daily budget for this campaign</span>
                          {budgetType === "DAILY" && (
                            <div className="pt-2">
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue || selectedPresetBudget}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder="Enter daily amount"
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
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
                          budgetType === "TOTAL" ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"
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
                          <span className="font-bold text-slate-900 block">Campaign total budget</span>
                          <span className="text-slate-500 block text-[11px]">Set a budget for the duration of your campaign</span>
                          
                          {budgetType === "TOTAL" && (
                            <div className="pt-2 space-y-4">
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder=""
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                                />
                              </div>

                              {/* Start Date & End Date Info Card */}
                              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                                <div className="space-y-1 text-xs">
                                  <p className="text-slate-800">
                                    <span className="text-slate-500 font-semibold">Start date:</span> August 11, 2026
                                  </p>
                                  <p className="text-slate-800">
                                    <span className="text-slate-500 font-semibold">End date:</span> None
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
                  <div className="lg:col-span-4 border-l border-slate-200 pl-6 space-y-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your campaign total budget is what the campaign should spend over its runtime. To use a campaign total budget, you must add an end date for your campaign.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Your campaign is almost ready to publish</h1>
              </div>

              {/* 1. Issues Section */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-800 text-xs">Issues</h3>
                  <p className="text-[11px] text-slate-500">Fix these issues to run your campaign</p>
                </div>

                <div className="space-y-2">
                  {/* Issue 1: Create an ad */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Create an ad:</strong> Get your ads running by adding ads to your ad group
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("KEYWORDS_ADS")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 2: Add keywords */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Add keywords:</strong> Get your ads running by adding keywords to your ad group
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("KEYWORDS_ADS")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 3: Add a budget */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Add a budget:</strong> To publish your campaign, enter a budget
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("BUDGET")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 4: Budget value required */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Budget:</strong> Value is required
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("BUDGET")}
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
                    <h3 className="font-bold text-slate-800 text-xs">Recommendations</h3>
                    <p className="text-[11px] text-slate-500">Apply these recommendations to optimize campaign performance</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                    <ChevronLeft className="h-4 w-4 cursor-pointer hover:text-slate-900" />
                    <span>1 / 3</span>
                    <ChevronRight className="h-4 w-4 cursor-pointer hover:text-slate-900" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                    <p className="text-slate-800">
                      <strong className="text-slate-900 font-bold">Add sitelinks:</strong> Draw more attention to your ads by adding at least 4 sitelinks. <HelpCircle className="inline h-3 w-3 text-slate-500" />
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
                <h3 className="font-bold text-slate-800 text-xs">Overview</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Campaign name</span>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="flex-1 max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Campaign type</span>
                    <span className="flex-1 text-slate-900 font-semibold">Search</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Objective</span>
                    <span className="flex-1 text-slate-900 font-semibold">Website Traffic</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Goal</span>
                    <span className="flex-1 text-slate-900 font-semibold">Downloads, Phone call leads</span>
                  </div>
                </div>
              </div>

              {/* 4. Bidding Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Bidding</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Bidding</span>
                    <span className="flex-1 text-slate-900 font-semibold">{biddingFocus}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Customer acquisition</span>
                    <span className="flex-1 text-slate-900 font-semibold">Bid equally for new and existing customers</span>
                  </div>
                </div>
              </div>

              {/* 5. Campaign Settings Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Campaign settings</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Networks</span>
                    <span className="flex-1 text-slate-900 font-semibold">Search partners, Display Network</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Locations</span>
                    <span className="flex-1 text-slate-900 font-semibold">All countries and territories</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Languages</span>
                    <span className="flex-1 text-slate-900 font-semibold">English</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">EU political ads</span>
                    <span className="flex-1 text-slate-900 font-semibold">Doesn&apos;t have EU political ads</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Audiences</span>
                    <span className="flex-1 text-slate-900 font-semibold">No segments</span>
                  </div>
                </div>
              </div>

              {/* 6. AI Max Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">AI Max</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Asset optimization</span>
                    <span className="flex-1 text-slate-900 font-semibold">Text customization and Final URL expansion turned on</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Brands</span>
                    <div className="flex-1 space-y-0.5 font-semibold text-slate-900">
                      <p>Limiting to: 0 brand lists</p>
                      <p>Excluding: 0 brand lists</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Keywords and Ads Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Keywords and ads</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Keywords</span>
                    <span className="flex-1 text-slate-900 font-semibold">None</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Search term matching</span>
                    <span className="flex-1 text-slate-900 font-semibold">Expanding your keywords with Google AI</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Brand inclusions</span>
                    <span className="flex-1 text-slate-900 font-semibold">Limiting to: 0 brand lists</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Locations of interest</span>
                    <span className="flex-1 text-slate-900 font-semibold">None</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">URL inclusions</span>
                    <span className="flex-1 text-slate-900 font-semibold">No URL inclusions</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Ads</span>
                    <span className="flex-1 text-slate-900 font-semibold">None</span>
                  </div>
                </div>
              </div>

              {/* 8. Budget Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Budget</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden p-4 flex items-center justify-between">
                  <span className="text-slate-500 w-48 font-medium">Budget</span>
                  <div className="flex-1 space-y-1">
                    <span className="text-slate-900 font-bold">Campaign total: ₹0.00</span>
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                      Value is required
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (wizardStep === "SUMMARY") setWizardStep("BUDGET");
            else if (wizardStep === "BUDGET") setWizardStep("KEYWORDS_ADS");
            else if (wizardStep === "KEYWORDS_ADS") setWizardStep("CAMPAIGN_SETTINGS");
            else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("BIDDING");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
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
                alert(`Website Traffic Search campaign "${adGroupName}" published successfully!`);
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
