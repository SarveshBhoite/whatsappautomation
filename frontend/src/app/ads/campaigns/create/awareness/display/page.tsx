"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, Settings, Sparkles, Image as ImageIcon, Video as VideoIcon, Edit3
} from "lucide-react";

export default function YouTubeDisplayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Flow Step: "CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW"
  const [displayStep, setDisplayStep] = useState<"CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW">("CAMPAIGN_SETTINGS");

  // 1. Campaign Settings Detailed States
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE_INTEREST");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);

  // Languages API search state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [isSearchingLanguages, setIsSearchingLanguages] = useState<boolean>(false);
  const [languageSearchResults, setLanguageSearchResults] = useState<string[]>([]);

  const allAvailableLanguages = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu",
    "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German",
    "Chinese (simplified)", "Japanese", "Arabic", "Portuguese", "Russian", "Italian", "Dutch"
  ];

  useEffect(() => {
    if (languageSearchInput.trim()) {
      setIsSearchingLanguages(true);
      const timer = setTimeout(() => {
        const filtered = allAvailableLanguages.filter(l =>
          l.toLowerCase().includes(languageSearchInput.toLowerCase()) && !selectedLanguages.includes(l)
        );
        setLanguageSearchResults(filtered);
        setIsSearchingLanguages(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setLanguageSearchResults([]);
    }
  }, [languageSearchInput, selectedLanguages]);

  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");

  const [adRotationOption, setAdRotationOption] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">("OPTIMIZE");
  const [deviceOption, setDeviceOption] = useState<"ALL" | "SPECIFIC">("ALL");
  
  // Dynamic Ad Schedule Items Array
  const [adScheduleList, setAdScheduleList] = useState<Array<{ id: string; day: string; start: string; end: string }>>([
    { id: "1", day: "All days", start: "00:00", end: "00:00" }
  ]);

  // Campaign URL options & Dynamic Custom Parameters Array
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");
  const [customParamsList, setCustomParamsList] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);

  const [useDynamicFeed, setUseDynamicFeed] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("2026-08-11");
  const [endDate, setEndDate] = useState<string>("");
  const [includeViewThrough, setIncludeViewThrough] = useState<boolean>(false);

  // Content Exclusions State
  const [contentLabels, setContentLabels] = useState<Record<string, boolean>>({
    "DL-G": true,
    "DL-PG": true,
    "DL-T": true,
    "DL-MA": true,
    "NOT_YET_LABELED": false
  });
  const [sensitiveContent, setSensitiveContent] = useState<Record<string, boolean>>({
    "Tragedy and conflict": false,
    "Sensitive social issues": false,
    "Profanity and rough language": false,
    "Sexually suggestive": false,
    "Sensational and shocking": false
  });
  const [contentTypeExclusions, setContentTypeExclusions] = useState<Record<string, boolean>>({
    "Games": false,
    "Live streaming videos": false,
    "Embedded YouTube videos": false,
    "Below-the-fold": false,
    "G-mob mobile app non interstitial": false,
    "Parked domains": false,
    "In-video": false
  });

  // 2. Budget and Bidding State
  const [dailyBudget, setDailyBudget] = useState<string>("");
  const [biddingFocus, setBiddingFocus] = useState<string>("Conversions");
  const [conversionBiddingType, setConversionBiddingType] = useState<"MANUAL" | "MAX_CONVERSIONS" | "TARGET_CPA">("MAX_CONVERSIONS");
  const [targetCpaValue, setTargetCpaValue] = useState<string>("");
  const [setTargetRoas, setSetTargetRoas] = useState<boolean>(false);
  const [targetRoasValue, setTargetRoasValue] = useState<string>("");
  const [viewableCpmBid, setViewableCpmBid] = useState<string>("");
  const [showDirectBidStrategy, setShowDirectBidStrategy] = useState<boolean>(false);
  const [directBidStrategy, setDirectBidStrategy] = useState<string>("Viewable CPM");

  // 3. Targeting Detailed State
  const [audienceSearchInput, setAudienceSearchInput] = useState<string>("");
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [editingAudience, setEditingAudience] = useState<boolean>(false);

  const [demographicsGender, setDemographicsGender] = useState<Record<string, boolean>>({
    "Female": true, "Male": true, "Unknown": true
  });
  const [demographicsAge, setDemographicsAge] = useState<Record<string, boolean>>({
    "18 - 24": true, "25 - 34": true, "35 - 44": true, "45 - 54": true, "55 - 64": true, "65+": true, "Unknown": true
  });
  const [demographicsParental, setDemographicsParental] = useState<Record<string, boolean>>({
    "Not a parent": true, "Parent": true, "Unknown": true
  });
  const [demographicsIncome, setDemographicsIncome] = useState<Record<string, boolean>>({
    "Top 10%": true, "11 - 20%": true, "21 - 30%": true, "31 - 40%": true, "41 - 50%": true, "Lower 50%": true, "Unknown": true
  });
  const [editingDemographics, setEditingDemographics] = useState<boolean>(false);

  const [enteredKeywordsText, setEnteredKeywordsText] = useState<string>("");
  const [ideaUrlInput, setIdeaUrlInput] = useState<string>("");
  const [ideaProductInput, setIdeaProductInput] = useState<string>("");
  const [keywordSetting, setKeywordSetting] = useState<"AUDIENCE" | "CONTENT">("AUDIENCE");
  const [editingKeywords, setEditingKeywords] = useState<boolean>(false);

  const [topicSearchInput, setTopicSearchInput] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [editingTopics, setEditingTopics] = useState<boolean>(false);

  const [placementSearchInput, setPlacementSearchInput] = useState<string>("");
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [editingPlacements, setEditingPlacements] = useState<boolean>(false);

  const [useOptimizedTargeting, setUseOptimizedTargeting] = useState<boolean>(true);

  // 4. Ads Creation State
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [businessName, setBusinessName] = useState<string>("");
  const [headlines, setHeadlines] = useState<string[]>([""]);
  const [longHeadlines, setLongHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [logosList, setLogosList] = useState<string[]>([]);
  const [videosList, setVideosList] = useState<string[]>([]);

  // Optimization & Format Settings
  const [useAssetEnhancements, setUseAssetEnhancements] = useState<boolean>(true);
  const [useAutoGeneratedVideo, setUseAutoGeneratedVideo] = useState<boolean>(true);
  const [useNativeFormats, setUseNativeFormats] = useState<boolean>(true);

  // Ad URL & Design options
  const [showAdUrlMoreOptions, setShowAdUrlMoreOptions] = useState<boolean>(false);
  const [enableCallToAction, setEnableCallToAction] = useState<boolean>(true);
  const [enableCustomColors, setEnableCustomColors] = useState<boolean>(true);
  const [callToActionText, setCallToActionText] = useState<string>("Automated");
  const [mainCustomColor, setMainCustomColor] = useState<string>("#1a73e8");
  const [accentCustomColor, setAccentCustomColor] = useState<string>("#34a853");

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
            <span className="text-sm font-semibold text-slate-200">YouTube • Display</span>
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
        
        {/* Left Sidebar Navigation matching Performance Max style */}
        <aside className="w-72 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/80 hidden md:flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
              <span>Display</span>
            </div>

            <nav className="space-y-1.5 text-xs font-sans">
              {/* 1. Campaign settings */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("CAMPAIGN_SETTINGS")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    displayStep === "CAMPAIGN_SETTINGS"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>1. Campaign settings</span>
                </div>
                {displayStep === "CAMPAIGN_SETTINGS" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="hover:text-slate-200">Locations</p>
                    <p className="hover:text-slate-200">Languages</p>
                    <p className="hover:text-slate-200">EU political ads</p>
                    <p className="hover:text-slate-200">Ad rotation</p>
                    <p className="hover:text-slate-200">Devices</p>
                    <p className="hover:text-slate-200">Ad Schedule</p>
                    <p className="hover:text-slate-200">Campaign URL options</p>
                    <p className="hover:text-slate-200">Dynamic ads</p>
                    <p className="hover:text-slate-200">Start and end dates</p>
                    <p className="hover:text-slate-200">Conversions</p>
                    <p className="hover:text-slate-200">Content exclusions</p>
                  </div>
                )}
              </div>

              {/* 2. Budget and bidding */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("BUDGET_BIDDING")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    displayStep === "BUDGET_BIDDING"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>2. Budget and bidding</span>
                </div>
                {displayStep === "BUDGET_BIDDING" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="hover:text-slate-200">Budget</p>
                    <p className="hover:text-slate-200">Bidding</p>
                  </div>
                )}
              </div>

              {/* 3. Targeting */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("TARGETING")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    displayStep === "TARGETING"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>3. Targeting</span>
                </div>
                {displayStep === "TARGETING" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="hover:text-slate-200">Audience Segments</p>
                    <p className="hover:text-slate-200">Demographics</p>
                    <p className="hover:text-slate-200">Keywords</p>
                    <p className="hover:text-slate-200">Topics</p>
                    <p className="hover:text-slate-200">Placements</p>
                    <p className="hover:text-slate-200">Optimized targeting</p>
                  </div>
                )}
              </div>

              {/* 4. Ads */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("ADS")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    displayStep === "ADS"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>4. Ads</span>
                </div>
                {displayStep === "ADS" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3 py-1">
                    <p className="hover:text-slate-200">Ad creation</p>
                  </div>
                )}
              </div>

              {/* 5. Review */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("REVIEW")}
                  className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${
                    displayStep === "REVIEW"
                      ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span>5. Review</span>
                </div>
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

                  <div className="pt-2 border-t border-slate-800/80 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowLocationOptions(!showLocationOptions)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
                      Location options
                    </button>

                    {showLocationOptions && (
                      <div className="pl-4 pt-2 space-y-3 animate-in fade-in duration-200 border-l-2 border-slate-800">
                        <span className="font-semibold text-slate-300 block">Include</span>
                        <div className="space-y-2">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="locTargetType"
                              checked={locationTargetingType === "PRESENCE_INTEREST"}
                              onChange={() => setLocationTargetingType("PRESENCE_INTEREST")}
                              className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                            />
                            <div>
                              <span className="text-slate-200 font-semibold block">Presence or interest:</span>
                              <span className="text-[11px] text-slate-400 block">People in, regularly in, or who've shown interest in your included locations (recommended)</span>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="locTargetType"
                              checked={locationTargetingType === "PRESENCE"}
                              onChange={() => setLocationTargetingType("PRESENCE")}
                              className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                            />
                            <div>
                              <span className="text-slate-200 font-semibold block">Presence:</span>
                              <span className="text-[11px] text-slate-400 block">People in or regularly in your included locations</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
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
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />

                    {/* API Search Suggestions Dropdown */}
                    {languageSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-800">
                        {languageSearchResults.map((langItem, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedLanguages(prev => [...prev, langItem]);
                              setLanguageSearchInput("");
                              setLanguageSearchResults([]);
                            }}
                            className="p-2.5 hover:bg-slate-800 text-xs text-slate-200 cursor-pointer flex items-center justify-between"
                          >
                            <span>{langItem}</span>
                            <Plus className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    )}
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

              {/* 4. Ad Schedule Card (With Multi Schedule Add Button) */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Ad schedule</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3">
                  {adScheduleList.map((item, index) => (
                    <div key={item.id} className="flex flex-wrap items-center gap-3">
                      <select
                        value={item.day}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[index].day = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary"
                      >
                        <option value="All days">All days</option>
                        <option value="Mondays - Fridays">Mondays - Fridays</option>
                        <option value="Saturdays - Sundays">Saturdays - Sundays</option>
                        <option value="Mondays">Mondays</option>
                        <option value="Tuesdays">Tuesdays</option>
                        <option value="Wednesdays">Wednesdays</option>
                        <option value="Thursdays">Thursdays</option>
                        <option value="Fridays">Fridays</option>
                        <option value="Saturdays">Saturdays</option>
                        <option value="Sundays">Sundays</option>
                      </select>

                      <select
                        value={item.start}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[index].start = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary"
                      >
                        {Array.from({ length: 96 }).map((_, i) => {
                          const h = String(Math.floor(i / 4)).padStart(2, "0");
                          const m = String((i % 4) * 15).padStart(2, "0");
                          const t = `${h}:${m}`;
                          return <option key={`disp-s-${t}`} value={t}>{t}</option>;
                        })}
                      </select>

                      <span className="text-slate-400 font-medium">to</span>

                      <select
                        value={item.end}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[index].end = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary"
                      >
                        {Array.from({ length: 96 }).map((_, i) => {
                          const h = String(Math.floor(i / 4)).padStart(2, "0");
                          const m = String((i % 4) * 15).padStart(2, "0");
                          const t = `${h}:${m}`;
                          return <option key={`disp-e-${t}`} value={t}>{t}</option>;
                        })}
                      </select>

                      {adScheduleList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAdScheduleList(prev => prev.filter(s => s.id !== item.id))}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAdScheduleList(prev => [...prev, { id: Date.now().toString(), day: "Mondays", start: "09:00", end: "17:00" }])}
                    className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add schedule
                  </button>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 leading-relaxed pt-1">
                  <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a></p>
                  <p>Based on account time zone: <strong>(GMT+05:30) India Standard Time</strong></p>
                  <p className="text-amber-400/90 font-medium">Saving this removes the settings you changed and adds new ones, resetting any performance data.</p>
                  <p>To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                </div>
              </div>

              {/* 5. Ad Rotation Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Ad rotation</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="adRot"
                      checked={adRotationOption === "OPTIMIZE"}
                      onChange={() => setAdRotationOption("OPTIMIZE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">Optimize: Prefer best performing ads</span>
                      <span className="text-[11px] text-slate-400 block">Show ads that are expected to get more clicks or conversions. Recommended for most advertisers.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="adRot"
                      checked={adRotationOption === "DO_NOT_OPTIMIZE"}
                      onChange={() => setAdRotationOption("DO_NOT_OPTIMIZE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">Do not optimize: Rotate ads indefinitely</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 6. Devices Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Devices</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="devChoice"
                      checked={deviceOption === "ALL"}
                      onChange={() => setDeviceOption("ALL")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-semibold">Show on all devices</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="devChoice"
                      checked={deviceOption === "SPECIFIC"}
                      onChange={() => setDeviceOption("SPECIFIC")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-semibold">Set specific targeting for devices</span>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400">
                  Device targeting lets you choose the types of devices where your ad can appear.
                </p>
              </div>

              {/* 7. Campaign URL Options Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Campaign URL options</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-4">
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

                  <div className="space-y-3 pt-1 border-t border-slate-800">
                    <label className="block text-slate-300 font-semibold">Custom parameters</label>
                    
                    {customParamsList.map((param, index) => (
                      <div key={param.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => {
                              const updated = [...customParamsList];
                              updated[index].name = e.target.value;
                              setCustomParamsList(updated);
                            }}
                            placeholder="Name {_name}"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <span className="text-slate-400 font-bold text-base">=</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={param.value}
                            onChange={(e) => {
                              const updated = [...customParamsList];
                              updated[index].value = e.target.value;
                              setCustomParamsList(updated);
                            }}
                            placeholder="Value"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                          />
                        </div>
                        {customParamsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCustomParamsList(prev => prev.filter(p => p.id !== param.id))}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCustomParamsList(prev => [...prev, { id: Date.now().toString(), name: "", value: "" }])}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add parameter
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tracking template is the URL you want the ad click to go to for tracking. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                  </p>
                </div>
              </div>

              {/* 8. Dynamic Ads Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Dynamic ads</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDynamicFeed}
                    onChange={(e) => setUseDynamicFeed(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <span className="font-semibold text-slate-200">Use dynamic ads feed for personalized ads</span>
                </label>
              </div>

              {/* 9. Start and End Dates Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Start and end dates</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-semibold">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                    />
                    <p className="text-[10px] text-slate-500">Aug 11, 2026</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-semibold">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                    />
                    {!endDate ? (
                      <p className="text-[10px] text-slate-500">None (Select a date)</p>
                    ) : null}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Your ads will continue to run unless you specify an end date.
                </p>
              </div>

              {/* 10. Conversions Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Conversions</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200">View-through conversions</h4>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeViewThrough}
                      onChange={(e) => setIncludeViewThrough(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">Include view-through conversions in your "Conversions" and "All conversions" columns</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Only available for manual vCPM and Target CPA bid strategies that are paying for viewable impressions.
                      </span>
                    </div>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  View-through conversions are counted when someone views your ad, doesn't click it, then performs a conversion action later on. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>
              </div>

              {/* 11. Content Exclusions Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Content exclusions</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-300">Opt out of showing your ads on content that doesn't fit your brand</p>

                {/* Section A: Content label */}
                <div className="space-y-3 pt-1 border-t border-slate-800/80">
                  <h3 className="font-bold text-slate-200">Content label (Display and GVP)</h3>
                  <div className="space-y-2">
                    {[
                      { key: "DL-G", title: "DL‑G: General audiences", desc: "Content suitable for families" },
                      { key: "DL-PG", title: "DL‑PG: Most audiences with parental guidance", desc: "Most audiences" },
                      { key: "DL-T", title: "DL‑T: Teen and older audiences", desc: "Teens and adults" },
                      { key: "DL-MA", title: "DL‑MA: Mature audiences", desc: "Mature content" },
                      { key: "NOT_YET_LABELED", title: "Content not yet labeled", desc: "Unrated content" }
                    ].map((lbl) => (
                      <label key={lbl.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!contentLabels[lbl.key]}
                          onChange={(e) => setContentLabels(prev => ({ ...prev, [lbl.key]: e.target.checked }))}
                          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">{lbl.title}</span>
                          <span className="text-[11px] text-slate-400 block">{lbl.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section B: Sensitive content */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <h3 className="font-bold text-slate-200">Sensitive content</h3>
                  <div className="space-y-2">
                    {[
                      "Tragedy and conflict",
                      "Sensitive social issues",
                      "Profanity and rough language",
                      "Sexually suggestive",
                      "Sensational and shocking"
                    ].map((sens) => (
                      <label key={sens} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!sensitiveContent[sens]}
                          onChange={(e) => setSensitiveContent(prev => ({ ...prev, [sens]: e.target.checked }))}
                          className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                        />
                        <span className="text-slate-200">{sens}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section C: Content type */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <h3 className="font-bold text-slate-200">Content type</h3>
                  <div className="space-y-2">
                    {[
                      { name: "Games", status: "Inactive" },
                      { name: "Live streaming videos", status: "Active" },
                      { name: "Embedded YouTube videos", status: "Active" },
                      { name: "Below-the-fold", status: "Active" },
                      { name: "G-mob mobile app non interstitial", status: "Inactive" },
                      { name: "Parked domains", status: "Active" },
                      { name: "In-video", status: "Active" }
                    ].map((ct) => (
                      <label key={ct.name} className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-950">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!contentTypeExclusions[ct.name]}
                            onChange={(e) => setContentTypeExclusions(prev => ({ ...prev, [ct.name]: e.target.checked }))}
                            className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                          />
                          <span className="text-slate-200">{ct.name}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          ct.status === "Inactive" ? "bg-slate-800 text-slate-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {ct.status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                  While content exclusions are completed to the best of our ability, we can't guarantee that all related content will be excluded.
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

              {/* Bidding Card with Conditional Views */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Bidding</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                {!showDirectBidStrategy ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">What do you want to focus on?</label>
                      <select
                        value={biddingFocus}
                        onChange={(e) => setBiddingFocus(e.target.value)}
                        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-primary"
                      >
                        <optgroup label="Recommended">
                          <option value="Conversions">Conversions</option>
                          <option value="Conversion value">Conversion value</option>
                        </optgroup>
                        <optgroup label="Other optimization options">
                          <option value="Impressions">Viewable impressions</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* View A: Focus on Conversions */}
                    {biddingFocus === "Conversions" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <span className="text-[11px] text-emerald-400 font-medium block">
                          Recommended for your campaign goal
                        </span>

                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <label className="block text-slate-300 font-semibold">How do you want to get conversions?</label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="dispConvBidding"
                              checked={conversionBiddingType === "MANUAL"}
                              onChange={() => setConversionBiddingType("MANUAL")}
                              className="text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-slate-200">Manually set bids</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="dispConvBidding"
                              checked={conversionBiddingType === "MAX_CONVERSIONS"}
                              onChange={() => setConversionBiddingType("MAX_CONVERSIONS")}
                              className="text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-slate-200">Automatically maximize conversions</span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer pt-1">
                            <input
                              type="radio"
                              name="dispConvBidding"
                              checked={conversionBiddingType === "TARGET_CPA"}
                              onChange={() => setConversionBiddingType("TARGET_CPA")}
                              className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                            />
                            <div>
                              <span className="text-slate-200 block">Set a target cost per action</span>
                              {conversionBiddingType === "TARGET_CPA" && (
                                <div className="pt-2 space-y-1">
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
                          </label>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                          This campaign will use the Maximize conversions bid strategy to help you get the most conversions for your budget.
                        </p>
                      </div>
                    )}

                    {/* View B: Focus on Conversion value */}
                    {biddingFocus === "Conversion value" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <span className="text-[11px] text-emerald-400 font-medium block">
                          Recommended for your campaign goal
                        </span>

                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={setTargetRoas}
                              onChange={(e) => setSetTargetRoas(e.target.checked)}
                              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                            />
                            <div>
                              <span className="font-semibold text-slate-200 block">Set a target return on ad spend</span>
                              {setTargetRoas && (
                                <div className="pt-2 space-y-1">
                                  <label className="block text-[11px] text-slate-400 font-semibold">Target ROAS (%)</label>
                                  <input
                                    type="text"
                                    value={targetRoasValue}
                                    onChange={(e) => setTargetRoasValue(e.target.value)}
                                    placeholder="e.g. 200%"
                                    className="w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                                  />
                                </div>
                              )}
                            </div>
                          </label>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                          This campaign will use the Maximize conversion value bid strategy to help you get the most conversion value for your budget.
                        </p>
                      </div>
                    )}

                    {/* View C: Focus on Viewable impressions */}
                    {biddingFocus === "Impressions" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <span className="text-[11px] text-amber-400 font-medium block">
                          Conversions is recommended for your campaign goal
                        </span>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          <label className="block text-slate-300 font-semibold">Enter your viewable CPM bid for this ad group</label>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-400">₹</span>
                            <input
                              type="text"
                              value={viewableCpmBid}
                              onChange={(e) => setViewableCpmBid(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                          You’ve chosen to focus on impressions using the Viewable CPM bid strategy, but your account tracks conversions. You could get more conversions by choosing to focus on conversions.
                        </p>
                      </div>
                    )}

                    {/* Or, select a bid strategy directly toggle */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setShowDirectBidStrategy(true)}
                        className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                      >
                        Or, select a bid strategy directly (not recommended)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Direct Bid Strategy View */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Select your bid strategy</span>
                      <button
                        type="button"
                        onClick={() => setShowDirectBidStrategy(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                      >
                        Back to focus options
                      </button>
                    </div>

                    <select
                      value={directBidStrategy}
                      onChange={(e) => setDirectBidStrategy(e.target.value)}
                      className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="Viewable CPM">Viewable CPM</option>
                      <option value="Maximize conversions">Maximize conversions</option>
                      <option value="Target CPA">Target CPA</option>
                    </select>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <label className="block text-slate-300 font-semibold">Enter your viewable CPM bid for this ad group</label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-400">₹</span>
                        <input
                          type="text"
                          value={viewableCpmBid}
                          onChange={(e) => setViewableCpmBid(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: TARGETING */}
          {displayStep === "TARGETING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Targeting</h1>

              {/* ── SECTION 1: PEOPLE ── */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">People</h2>

                {/* 1. Audience Segments Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Audience Segments</h3>
                      <p className="text-[11px] text-slate-400">Suggest who should see your ads. You can create new segments in Audience Manager.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAudience(!editingAudience)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit targeted segments
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={audienceSearchInput}
                        onChange={(e) => setAudienceSearchInput(e.target.value)}
                        placeholder='Try "luxury shoppers"'
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">You’ll see recently selected segments and ideas here.</p>
                    <p className="text-[11px] text-slate-400 italic">Use search to start looking for a segment.</p>

                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="font-semibold text-slate-300">
                        {selectedAudiences.length > 0 ? `Selected (${selectedAudiences.length}): ${selectedAudiences.join(", ")}` : "None selected"}
                      </p>
                      <p className="text-[11px] text-slate-400">Select one or more segments to target.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Demographics Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Demographics</h3>
                      <p className="text-[11px] text-slate-400">Suggest people based on age, gender, parental status, or household income</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingDemographics(!editingDemographics)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit targeted demographics
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Gender */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Gender</h4>
                      {["Female", "Male", "Unknown"].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!demographicsGender[g]}
                            onChange={(e) => setDemographicsGender(prev => ({ ...prev, [g]: e.target.checked }))}
                            className="rounded bg-slate-950 border-slate-700 text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-300">{g}</span>
                        </label>
                      ))}
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Age</h4>
                      {["18 - 24", "25 - 34", "35 - 44", "45 - 54", "55 - 64", "65+", "Unknown"].map((a) => (
                        <label key={a} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!demographicsAge[a]}
                            onChange={(e) => setDemographicsAge(prev => ({ ...prev, [a]: e.target.checked }))}
                            className="rounded bg-slate-950 border-slate-700 text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-300">{a}</span>
                        </label>
                      ))}
                    </div>

                    {/* Parental Status */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Parental status</h4>
                      {["Not a parent", "Parent", "Unknown"].map((p) => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!demographicsParental[p]}
                            onChange={(e) => setDemographicsParental(prev => ({ ...prev, [p]: e.target.checked }))}
                            className="rounded bg-slate-950 border-slate-700 text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-300">{p}</span>
                        </label>
                      ))}
                    </div>

                    {/* Household Income */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Household income</h4>
                      {["Top 10%", "11 - 20%", "21 - 30%", "31 - 40%", "41 - 50%", "Lower 50%", "Unknown"].map((inc) => (
                        <label key={inc} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!demographicsIncome[inc]}
                            onChange={(e) => setDemographicsIncome(prev => ({ ...prev, [inc]: e.target.checked }))}
                            className="rounded bg-slate-950 border-slate-700 text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-300">{inc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                    Note: Household income targeting is only available in select countries. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                  </p>
                </div>
              </div>

              {/* ── SECTION 2: CONTENT ── */}
              <div className="space-y-4 pt-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content</h2>

                {/* 3. Keywords Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Keywords</h3>
                      <p className="text-[11px] text-slate-400">Suggest terms related to your products or services to target relevant websites</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingKeywords(!editingKeywords)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit targeted keywords
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold">Enter or paste keywords, one per line</label>
                      <textarea
                        rows={5}
                        value={enteredKeywordsText}
                        onChange={(e) => setEnteredKeywordsText(e.target.value)}
                        placeholder="Enter keywords here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <h4 className="font-bold text-slate-200">Get keyword ideas</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={ideaUrlInput}
                          onChange={(e) => setIdeaUrlInput(e.target.value)}
                          placeholder="Enter a related website"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={ideaProductInput}
                          onChange={(e) => setIdeaProductInput(e.target.value)}
                          placeholder="Enter your product or service"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        We only show keyword ideas that are relevant to your business. To get ideas, enter your landing page, a related website, or words or phrases that describe your product or service in the field above.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-200">Keyword setting</h4>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="dispKwSetting"
                        checked={keywordSetting === "AUDIENCE"}
                        onChange={() => setKeywordSetting("AUDIENCE")}
                        className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Audience:</span>
                        <span className="text-[11px] text-slate-400 block">Show ads to people likely to be interested in these keywords and also on webpages, apps, and videos related to these keywords</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="dispKwSetting"
                        checked={keywordSetting === "CONTENT"}
                        onChange={() => setKeywordSetting("CONTENT")}
                        className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Content:</span>
                        <span className="text-[11px] text-slate-400 block">Only show ads on webpages, apps, and videos related to these keywords</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 4. Topics Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Topics</h3>
                      <p className="text-[11px] text-slate-400">Suggest webpages, apps, and videos about a certain topic</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTopics(!editingTopics)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit targeted topics
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={topicSearchInput}
                        onChange={(e) => setTopicSearchInput(e.target.value)}
                        placeholder="Search by word, phrase, or URL"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 max-h-48 overflow-y-auto pr-2">
                      {[
                        "Arts & Entertainment", "Autos & Vehicles", "Beauty & Fitness", "Books & Literature",
                        "Business & Industrial", "Computers & Electronics", "Finance", "Food & Drink",
                        "Games", "Health", "Hobbies & Leisure", "Home & Garden",
                        "Internet & Telecom", "Jobs & Education", "Law & Government", "News",
                        "Online Communities", "People & Society", "Pets & Animals", "Real Estate",
                        "Reference", "Science", "Shopping & Retailers", "Sports",
                        "Travel & Transportation", "World Localities"
                      ].map((topicItem) => (
                        <label key={topicItem} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-950 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(topicItem)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTopics(prev => [...prev, topicItem]);
                              else setSelectedTopics(prev => prev.filter(t => t !== topicItem));
                            }}
                            className="rounded bg-slate-950 border-slate-700 text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-300 truncate">{topicItem}</span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="font-semibold text-slate-300">
                        {selectedTopics.length > 0 ? `Selected Topics (${selectedTopics.length}): ${selectedTopics.join(", ")}` : "None selected"}
                      </p>
                      <p className="text-[11px] text-slate-400">Your ad will show to all topics that match your other targeting. Add specific topics to narrow your targeting.</p>
                    </div>
                  </div>
                </div>

                {/* 5. Placements Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Placements</h3>
                      <p className="text-[11px] text-slate-400">Suggest websites, videos, or apps where you'd like to show your ads</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPlacements(!editingPlacements)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit targeted placements
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={placementSearchInput}
                        onChange={(e) => setPlacementSearchInput(e.target.value)}
                        placeholder="Search by word, phrase, URL, or video ID"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Websites", "YouTube channels", "YouTube videos", "Apps", "App categories (141)"].map((plcCat) => (
                        <button
                          key={plcCat}
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-primary text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
                        >
                          {plcCat}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="font-semibold text-slate-300">
                        {selectedPlacements.length > 0 ? `Selected Placements (${selectedPlacements.length}): ${selectedPlacements.join(", ")}` : "None selected"}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Your ad can appear on any YouTube or Display Network placements that match your other targeting. Add specific placements to narrow your targeting. If a specific website you target has an equivalent app, your ads can also show there.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. Optimized Targeting Card */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-100">Optimized targeting</h3>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useOptimizedTargeting}
                      onChange={(e) => setUseOptimizedTargeting(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">Use optimized targeting</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                        Optimized targeting helps you get more viewable impressions by using information such as your landing page and assets. You can opt out or speed up optimization by adding targeting first.
                      </span>
                    </div>
                  </label>
                </div>
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

                {/* Assets: Images, Logos, Videos with proper image/video preview & link */}
                <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                  {/* Images Card */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Images</h3>
                      <label className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const files = Array.from(e.target.files);
                              files.forEach(file => {
                                const localUrl = URL.createObjectURL(file);
                                const cdnUrl = `https://ik.imagekit.io/whatsappdemo/display_ads/${Date.now()}_${file.name}`;
                                setImagesList(prev => [...prev, localUrl || cdnUrl]);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">Add up to 15 images. At least 1 landscape image and 1 square image required. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline">Learn more</a></p>

                    {imagesList.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {imagesList.map((imgUrl, i) => (
                          <div key={i} className="relative group p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                              <img src={imgUrl} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-emerald-400 truncate flex-1" title={imgUrl}>
                                {imgUrl.startsWith("blob:") ? `https://ik.imagekit.io/demo/img_${i + 1}.png` : imgUrl}
                              </span>
                              <button
                                type="button"
                                onClick={() => setImagesList(prev => prev.filter((_, index) => index !== i))}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logos Card */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Logos</h3>
                      <label className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add logos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const files = Array.from(e.target.files);
                              files.forEach(file => {
                                const localUrl = URL.createObjectURL(file);
                                const cdnUrl = `https://ik.imagekit.io/whatsappdemo/logos/${Date.now()}_${file.name}`;
                                setLogosList(prev => [...prev, localUrl || cdnUrl]);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">Add up to 5 logos</p>

                    {logosList.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {logosList.map((logoUrl, i) => (
                          <div key={i} className="relative group p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-1">
                              <img src={logoUrl} alt={`Logo ${i + 1}`} className="h-full w-full object-contain" />
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-emerald-400 truncate flex-1" title={logoUrl}>
                                {logoUrl.startsWith("blob:") ? `https://ik.imagekit.io/demo/logo_${i + 1}.png` : logoUrl}
                              </span>
                              <button
                                type="button"
                                onClick={() => setLogosList(prev => prev.filter((_, index) => index !== i))}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos Card */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-200">Videos</h3>
                      <label className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                        <Plus className="h-3.5 w-3.5" /> Add videos
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const files = Array.from(e.target.files);
                              files.forEach(file => {
                                const localUrl = URL.createObjectURL(file);
                                const cdnUrl = `https://ik.imagekit.io/whatsappdemo/display_videos/${Date.now()}_${file.name}`;
                                setVideosList(prev => [...prev, localUrl || cdnUrl]);
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">Optional (portrait and landscape around 30 seconds work best)</p>

                    {videosList.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {videosList.map((vidUrl, i) => (
                          <div key={i} className="relative group p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                              <video src={vidUrl} controls className="h-full w-full object-cover" />
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-cyan-400 truncate flex-1" title={vidUrl}>
                                {vidUrl.startsWith("blob:") ? `https://ik.imagekit.io/demo/video_${i + 1}.mp4` : vidUrl}
                              </span>
                              <button
                                type="button"
                                onClick={() => setVideosList(prev => prev.filter((_, index) => index !== i))}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

                {/* Long Headlines (With Multi Add Button) */}
                <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-200">Long headlines</h3>
                    <span className="text-[11px] text-slate-400">Add up to 5 long headlines</span>
                  </div>
                  {longHeadlines.map((lhl, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-400">Long headline {idx + 1} <span className="text-rose-400">*</span></label>
                        <span className="text-[10px] text-slate-500 font-mono">{lhl.length} / 90</span>
                      </div>
                      <input
                        type="text"
                        value={lhl}
                        onChange={(e) => {
                          const updated = [...longHeadlines];
                          updated[idx] = e.target.value;
                          setLongHeadlines(updated);
                        }}
                        maxLength={90}
                        placeholder="Long headline"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  {longHeadlines.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setLongHeadlines(prev => [...prev, ""])}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add long headline
                    </button>
                  )}
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

                {/* Asset Optimization Section */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200">Select all options to optimize your ad's reach and performance.</h4>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAssetEnhancements}
                        onChange={(e) => setUseAssetEnhancements(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Use asset enhancements</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                          Let Google enhance your assets and optimize your ad layouts. This could improve ad performance. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAutoGeneratedVideo}
                        onChange={(e) => setUseAutoGeneratedVideo(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Use auto-generated video</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                          Let Google create your video ads using your headlines, descriptions and images. If you've added your own video content, then your ads won't use auto-generated video. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useNativeFormats}
                        onChange={(e) => setUseNativeFormats(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Use native formats</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                          Include native formats to expand your reach to more publishers. Adding native formats might also improve ad performance. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Ad URL Options & Design Settings with More Options & Checkboxes */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-slate-200">Ad URL options</h4>
                    <button
                      type="button"
                      onClick={() => setShowAdUrlMoreOptions(!showAdUrlMoreOptions)}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdUrlMoreOptions ? "rotate-180" : ""}`} />
                      More options
                    </button>
                  </div>

                  {showAdUrlMoreOptions && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Checkbox Options Selection */}
                      <div className="space-y-2 pb-2 border-b border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableCallToAction}
                            onChange={(e) => setEnableCallToAction(e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                          />
                          <span className="font-semibold text-slate-200">Call to action text</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableCustomColors}
                            onChange={(e) => setEnableCustomColors(e.target.checked)}
                            className="rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                          />
                          <span className="font-semibold text-slate-200">Custom colors</span>
                        </label>
                      </div>

                      {/* Controls grid based on enabled checkboxes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Call to action text */}
                        {enableCallToAction && (
                          <div className="space-y-1">
                            <label className="block text-slate-300 font-semibold">Call to action text</label>
                            <select
                              value={callToActionText}
                              onChange={(e) => setCallToActionText(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-primary"
                            >
                              <option value="Automated">Automated</option>
                              <option value="Apply Now">Apply Now</option>
                              <option value="Book Now">Book Now</option>
                              <option value="Contact Us">Contact Us</option>
                              <option value="Download">Download</option>
                              <option value="Learn More">Learn More</option>
                              <option value="Shop Now">Shop Now</option>
                              <option value="Sign Up">Sign Up</option>
                            </select>
                          </div>
                        )}

                        {/* Custom colors */}
                        {enableCustomColors && (
                          <div className="space-y-2">
                            <label className="block text-slate-300 font-semibold">Custom colors</label>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={mainCustomColor}
                                  onChange={(e) => setMainCustomColor(e.target.value)}
                                  className="h-8 w-8 rounded bg-transparent cursor-pointer border border-slate-800"
                                />
                                <span className="text-[11px] font-mono text-slate-300">{mainCustomColor}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={accentCustomColor}
                                  onChange={(e) => setAccentCustomColor(e.target.value)}
                                  className="h-8 w-8 rounded bg-transparent cursor-pointer border border-slate-800"
                                />
                                <span className="text-[11px] font-mono text-slate-300">{accentCustomColor}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              {/* Fix Errors Warning Header Box */}
              <div className="space-y-2">
                <p className="font-semibold text-slate-300">Fix these errors to publish your campaign</p>

                {!viewableCpmBid && biddingFocus === "Impressions" && (
                  <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 flex items-center justify-between text-rose-300">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Viewable CPM bid: Enter a CPM bid</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDisplayStep("BUDGET_BIDDING")}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer shadow"
                    >
                      Fix it
                    </button>
                  </div>
                )}

                {imagesList.length === 0 && (
                  <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 flex items-center justify-between text-rose-300">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Your campaign can't run without an ad. <a href="#" onClick={e => e.preventDefault()} className="underline font-bold">Learn more</a></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDisplayStep("ADS")}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer shadow"
                    >
                      Fix it
                    </button>
                  </div>
                )}
              </div>

              {/* EEA Personalization Suggestion Notice */}
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-300">The following suggestions will greatly improve your campaign's performance</p>
                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center gap-2 text-blue-300">
                  <Info className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>End-user consent signals are required to use ad personalization features in the European Economic Area (EEA). <a href="#" onClick={e => e.preventDefault()} className="underline font-bold">Learn more</a></span>
                </div>
              </div>

              {/* Main Campaign Review Section */}
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign Review</h1>

                {/* Top Summary Card (Name, Type, Objective, Goal) */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 font-medium">Campaign name</span>
                      <input
                        type="text"
                        defaultValue="Sales-Display-3"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-slate-100 font-semibold focus:outline-none focus:border-primary text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 font-medium">Campaign type</span>
                      <span className="font-semibold text-slate-200">Display</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 font-medium">Objective</span>
                      <span className="font-semibold text-slate-200">Sales</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <span className="text-slate-400 font-medium">Goal</span>
                      <span className="font-semibold text-slate-200">Downloads, Phone call leads</span>
                    </div>
                  </div>
                </div>

                {/* Campaign Settings Table Card */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-300">Campaign settings</h3>
                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400 font-semibold w-32">Locations</span>
                      <span className="text-slate-200 font-medium flex-1">
                        {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400 font-semibold w-32">Languages</span>
                      <span className="text-slate-200 font-medium flex-1">{selectedLanguages.join(", ") || "English"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold w-32">EU political ads</span>
                      <span className="text-slate-200 font-medium flex-1">
                        {euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget and Bidding Table Card */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-300">Budget and bidding</h3>
                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400 font-semibold w-32">Budget</span>
                      <span className="text-slate-200 font-medium flex-1 font-mono">₹{dailyBudget || "0.00"}/day</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold w-32">Bidding</span>
                      <span className="text-slate-200 font-medium flex-1">
                        {biddingFocus === "Impressions" ? "Viewable CPM" : biddingFocus === "Conversion value" ? "Maximize conversion value" : "Maximize conversions"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ad Group 1 Card with Edit Icon & Sub-sections */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Ad group 1
                      <Edit3
                        className="h-4 w-4 text-slate-400 hover:text-primary cursor-pointer"
                        onClick={() => setDisplayStep("TARGETING")}
                      />
                    </h3>
                  </div>

                  {/* Bidding row inside Ad Group */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-300">Bidding</h4>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                      <span className="text-slate-300 font-semibold">Viewable CPM bid</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        {viewableCpmBid ? `₹${viewableCpmBid}` : "Enter a CPM bid"}
                      </span>
                    </div>
                  </div>

                  {/* Targeting row inside Ad Group */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-300">Targeting</h4>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400 font-semibold w-36">Demographics</span>
                        <span className="text-slate-200 font-medium flex-1">
                          Suggest people based on age, gender, parental status, or household income
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold w-36">Optimized targeting</span>
                        <span className="text-emerald-400 font-bold flex-1">
                          {useOptimizedTargeting ? "On" : "Off"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ads row inside Ad Group */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-300">Ads</h4>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Ad creation</span>
                      <span className={`font-bold ${imagesList.length > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                        {imagesList.length > 0 ? `${imagesList.length} image(s) added` : "No ads"}
                      </span>
                    </div>
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
