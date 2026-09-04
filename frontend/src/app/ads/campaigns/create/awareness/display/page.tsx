"use client";
import { LanguageDropdown } from "@/components/LanguageDropdown";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, Settings, Sparkles, Image as ImageIcon, Video as VideoIcon, Edit3
} from "lucide-react";

export default function AwarenessDisplayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);
  const [displayCampaignName, setDisplayCampaignName] = useState<string>(`YouTube-Display-${Date.now().toString().slice(-4)}`);

  // Flow Step: "CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW"
  const [displayStep, setDisplayStep] = useState<"CAMPAIGN_SETTINGS" | "BUDGET_BIDDING" | "TARGETING" | "ADS" | "REVIEW">("CAMPAIGN_SETTINGS");

  // 1. Campaign Settings Detailed States
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedCustomLocations, setSelectedCustomLocations] = useState<Array<{ name: string; canonicalName?: string; targetType?: string; id?: string }>>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState<boolean>(false);
  const [locationSearchResults, setLocationSearchResults] = useState<Array<{ name: string; canonicalName?: string; targetType?: string; id?: string }>>([]);
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE_INTEREST");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);

  // Live Location API Search
  useEffect(() => {
    if (customLocationInput.trim().length >= 1) {
      setIsSearchingLocations(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${BACKEND}/api/ads/geo-targets/search?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}&q=${encodeURIComponent(customLocationInput.trim())}`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.results || data.data || []);
            const formatted = list.map((item: any) => ({
              id: item.id || item.geoTargetConstant?.id || item.resourceName?.split("/").pop(),
              name: item.name || item.geoTargetConstant?.name || item.canonicalName || item.geoTargetConstant?.canonicalName,
              canonicalName: item.canonicalName || item.geoTargetConstant?.canonicalName || item.name,
              targetType: item.targetType || item.geoTargetConstant?.targetType || "Location"
            }));
            setLocationSearchResults(formatted);
          } else {
            // Fallback list of locations
            const localFallback = [
              { name: "Mumbai", canonicalName: "Mumbai, Maharashtra, India", targetType: "City" },
              { name: "Delhi", canonicalName: "Delhi, India", targetType: "Union territory" },
              { name: "Bengaluru", canonicalName: "Bengaluru, Karnataka, India", targetType: "City" },
              { name: "Hyderabad", canonicalName: "Hyderabad, Telangana, India", targetType: "City" },
              { name: "Ahmedabad", canonicalName: "Ahmedabad, Gujarat, India", targetType: "City" },
              { name: "Chennai", canonicalName: "Chennai, Tamil Nadu, India", targetType: "City" },
              { name: "Kolkata", canonicalName: "Kolkata, West Bengal, India", targetType: "City" },
              { name: "Pune", canonicalName: "Pune, Maharashtra, India", targetType: "City" },
              { name: "Surat", canonicalName: "Surat, Gujarat, India", targetType: "City" },
              { name: "Jaipur", canonicalName: "Jaipur, Rajasthan, India", targetType: "City" },
              { name: "United States", canonicalName: "United States", targetType: "Country" },
              { name: "United Kingdom", canonicalName: "United Kingdom", targetType: "Country" },
              { name: "Canada", canonicalName: "Canada", targetType: "Country" },
              { name: "Australia", canonicalName: "Australia", targetType: "Country" },
              { name: "United Arab Emirates", canonicalName: "United Arab Emirates", targetType: "Country" }
            ].filter(loc => loc.canonicalName.toLowerCase().includes(customLocationInput.toLowerCase()));
            setLocationSearchResults(localFallback);
          }
        } catch (err) {
          console.error("Location search error:", err);
          setLocationSearchResults([]);
        } finally {
          setIsSearchingLocations(false);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setLocationSearchResults([]);
      setIsSearchingLocations(false);
    }
  }, [customLocationInput, customerId]);

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
  const [openCampaignSetting, setOpenCampaignSetting] = useState<string | null>(null);
  const [showMoreSettingsOptions, setShowMoreSettingsOptions] = useState<boolean>(false);
  const [openBudgetBiddingSetting, setOpenBudgetBiddingSetting] = useState<string | null>(null);
  const [openPeopleSection, setOpenPeopleSection] = useState<boolean>(false);
  const [openContentSection, setOpenContentSection] = useState<boolean>(false);
  const [openTargetingSetting, setOpenTargetingSetting] = useState<string | null>(null);
  const [openAdSetting, setOpenAdSetting] = useState<string | null>(null);

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
  const [activeEditSetting, setActiveEditSetting] = useState<string | null>(null);
  const todayFormattedStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<string>(todayFormattedStr);
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
  const [landscapeImagesList, setLandscapeImagesList] = useState<string[]>([]);
  const [squareImagesList, setSquareImagesList] = useState<string[]>([]);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [logosList, setLogosList] = useState<string[]>([]);
  const [videosList, setVideosList] = useState<string[]>([]);

  // Crop & Ratio Selection Modal State
  const [cropModalData, setCropModalData] = useState<{
    isOpen: boolean;
    rawImage: string;
    originalWidth: number;
    originalHeight: number;
    targetType: "IMAGE" | "LOGO";
    selectedRatios: {
      landscape: boolean; // 1.91:1
      square: boolean;    // 1:1
    };
  } | null>(null);

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
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-sm font-semibold text-slate-800">Display Campaign Setup</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* Left Sidebar Navigation matching Performance Max style */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar">
          <div className="p-6 space-y-6">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
              <LayoutGrid className="h-4 w-4 text-primary shrink-0" />
              <span>Display</span>
            </div>

            <nav className="space-y-1.5 text-xs font-sans">
              {/* 1. Campaign settings */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("CAMPAIGN_SETTINGS")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${displayStep === "CAMPAIGN_SETTINGS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                >
                  <span>1. Campaign settings</span>
                </div>
                {displayStep === "CAMPAIGN_SETTINGS" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Locations</p>
                    <p className="hover:text-slate-800">Languages</p>
                    <p className="hover:text-slate-800">EU political ads</p>
                    <p className="hover:text-slate-800">Ad rotation</p>
                    <p className="hover:text-slate-800">Devices</p>
                    <p className="hover:text-slate-800">Ad Schedule</p>
                    <p className="hover:text-slate-800">Campaign URL options</p>
                    <p className="hover:text-slate-800">Dynamic ads</p>
                    <p className="hover:text-slate-800">Start and end dates</p>
                    <p className="hover:text-slate-800">Conversions</p>
                    <p className="hover:text-slate-800">Content exclusions</p>
                  </div>
                )}
              </div>

              {/* 2. Budget and bidding */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("BUDGET_BIDDING")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${displayStep === "BUDGET_BIDDING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                >
                  <span>2. Budget and bidding</span>
                </div>
                {displayStep === "BUDGET_BIDDING" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Budget</p>
                    <p className="hover:text-slate-800">Bidding</p>
                  </div>
                )}
              </div>

              {/* 3. Targeting */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("TARGETING")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${displayStep === "TARGETING"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                >
                  <span>3. Targeting</span>
                </div>
                {displayStep === "TARGETING" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Audience Segments</p>
                    <p className="hover:text-slate-800">Demographics</p>
                    <p className="hover:text-slate-800">Keywords</p>
                    <p className="hover:text-slate-800">Topics</p>
                    <p className="hover:text-slate-800">Placements</p>
                    <p className="hover:text-slate-800">Optimized targeting</p>
                  </div>
                )}
              </div>

              {/* 4. Ads */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("ADS")}
                  className={`p-2 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all ${displayStep === "ADS"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                >
                  <span>4. Ads</span>
                </div>
                {displayStep === "ADS" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Ad creation</p>
                  </div>
                )}
              </div>

              {/* 5. Review */}
              <div className="space-y-1">
                <div
                  onClick={() => setDisplayStep("REVIEW")}
                  className={`p-2 rounded-lg font-medium cursor-pointer transition-all ${displayStep === "REVIEW"
                    ? "bg-primary/10 text-primary border border-primary/30 font-bold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
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
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>

              {/* Locations Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                {openCampaignSetting === "locations" ? (
                  <>
                    <div
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500">Select locations for this campaign</p>

                    <div className="space-y-3 text-xs">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="displayLoc"
                          checked={selectedLocation === "ALL"}
                          onChange={() => setSelectedLocation("ALL")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-slate-800">All countries and territories</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="displayLoc"
                          checked={selectedLocation === "INDIA"}
                          onChange={() => setSelectedLocation("INDIA")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-slate-800">India</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="displayLoc"
                          checked={selectedLocation === "CUSTOM"}
                          onChange={() => setSelectedLocation("CUSTOM")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-slate-800">Enter another location</span>
                      </label>

                      {selectedLocation === "CUSTOM" && (
                        <div className="ml-7 pt-2 space-y-2 max-w-md animate-in fade-in duration-200">
                          <div className="relative">
                            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              value={customLocationInput}
                              onChange={(e) => setCustomLocationInput(e.target.value)}
                              placeholder="Enter a location to target (e.g. Mumbai, Maharashtra)"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                            />
                            {isSearchingLocations && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>

                          {/* Live Location Search Dropdown Suggestions */}
                          {locationSearchResults.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 z-10 relative">
                              {locationSearchResults.map((loc, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (!selectedCustomLocations.some(l => l.canonicalName === loc.canonicalName)) {
                                      setSelectedCustomLocations(prev => [...prev, loc]);
                                    }
                                    setCustomLocationInput(loc.canonicalName || loc.name);
                                    setLocationSearchResults([]);
                                  }}
                                  className="p-2.5 hover:bg-primary/10 cursor-pointer flex items-center justify-between transition-colors text-xs"
                                >
                                  <div>
                                    <span className="font-semibold text-slate-800 block">{loc.canonicalName || loc.name}</span>
                                    {loc.id && <span className="text-[10px] text-slate-500 font-mono">ID: {loc.id}</span>}
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                                    {loc.targetType || "Location"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Selected Custom Locations Chips */}
                          {selectedCustomLocations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {selectedCustomLocations.map((loc, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-semibold">
                                  {loc.canonicalName || loc.name}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCustomLocations(prev => prev.filter((_, idx) => idx !== i))}
                                    className="hover:text-rose-400"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 space-y-3">
                        <button
                          type="button"
                          onClick={() => setShowLocationOptions(!showLocationOptions)}
                          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
                          Location options
                        </button>

                        {showLocationOptions && (
                          <div className="pl-4 pt-2 space-y-3 animate-in fade-in duration-200 border-l-2 border-slate-200">
                            <span className="font-semibold text-slate-700 block">Include</span>
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
                                  <span className="text-slate-800 font-semibold block">Presence or interest:</span>
                                  <span className="text-[11px] text-slate-500 block">People in, regularly in, or who've shown interest in your included locations (recommended)</span>
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
                                  <span className="text-slate-800 font-semibold block">Presence:</span>
                                  <span className="text-[11px] text-slate-500 block">People in or regularly in your included locations</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => setOpenCampaignSetting("locations")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Locations</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom location"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("locations");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Languages Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                {openCampaignSetting === "languages" ? (
                  <>
                    <div
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500">Select the languages your customers speak.</p>

                    <div className="space-y-3 text-xs">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={languageSearchInput}
                          onChange={(e) => setLanguageSearchInput(e.target.value)}
                          placeholder="Start typing or select a language"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                        />

                        {/* API Search Suggestions Dropdown */}
                        {languageSearchResults.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-md z-20 max-h-48 overflow-y-auto divide-y divide-slate-800">
                            {languageSearchResults.map((langItem, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setSelectedLanguages(prev => [...prev, langItem]);
                                  setLanguageSearchInput("");
                                  setLanguageSearchResults([]);
                                }}
                                className="p-2.5 hover:bg-slate-100 text-xs text-slate-800 cursor-pointer flex items-center justify-between"
                              >
                                <span>{langItem}</span>
                                <Plus className="h-3.5 w-3.5 text-slate-500" />
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
                  </>
                ) : (
                  <div
                    onClick={() => setOpenCampaignSetting("languages")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Languages</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedLanguages.length === 0 ? "All languages" : selectedLanguages.join(", ")}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("languages");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* EU Political Ads Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                {openCampaignSetting === "euPolitical" ? (
                  <>
                    <div
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">EU political ads</h2>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-xs font-semibold text-slate-800">Does your campaign have European Union political ads?</p>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="euPolitical"
                          checked={euPoliticalAds === "YES"}
                          onChange={() => setEuPoliticalAds("YES")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-slate-800">Yes, this campaign has EU political ads</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="euPolitical"
                          checked={euPoliticalAds === "NO"}
                          onChange={() => setEuPoliticalAds("NO")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-slate-800">No, this campaign doesn't have EU political ads</span>
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1">
                      EU regulation requires Google to ask this question. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn how an EU political ad is defined</a>
                    </p>
                  </>
                ) : (
                  <div
                    onClick={() => setOpenCampaignSetting("euPolitical")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">EU political ads</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {euPoliticalAds === "YES" ? "Yes, EU political ads" : "No, this campaign doesn't have EU political ads"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("euPolitical");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Campaign URL Options Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
                {openCampaignSetting === "urlOptions" ? (
                  <>
                    <div
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Campaign URL options</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="space-y-4">
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

                      <div className="space-y-3 pt-1 border-t border-slate-200">
                        <label className="block text-slate-700 font-semibold">Custom parameters</label>

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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                              />
                            </div>
                            <span className="text-slate-500 font-bold text-base">=</span>
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                              />
                            </div>
                            {customParamsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setCustomParamsList(prev => prev.filter(p => p.id !== param.id))}
                                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-100 cursor-pointer"
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

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Tracking template is the URL you want the ad click to go to for tracking. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                      </p>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => setOpenCampaignSetting("urlOptions")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Campaign URL options</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {trackingTemplate || finalUrlSuffix || customParamsList.some(p => p.name || p.value) ? "Custom URL options set" : "No options set"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("urlOptions");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* More settings Section */}
              <div className="mt-8 space-y-4">
                <div
                  onClick={() => setShowMoreSettingsOptions(!showMoreSettingsOptions)}
                  className="flex items-center justify-between cursor-pointer px-1 text-slate-800 select-none hover:text-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="font-bold text-slate-800">More settings</span>
                  </div>
                  <span>{showMoreSettingsOptions ? "▲" : "▼"}</span>
                </div>

                {showMoreSettingsOptions && (
                  <div className="rounded-2xl border border-slate-200 bg-white/40 divide-y divide-slate-800 overflow-hidden shadow-sm animate-in slide-in-from-top-1 duration-150">

                    {/* Ad Rotation Row */}
                    {activeEditSetting === "ROTATION" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Ad rotation</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg">Save</button>
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
                              <span className="font-semibold text-slate-800 block">Optimize: Prefer best performing ads</span>
                              <span className="text-[11px] text-slate-500 block">Show ads that are expected to get more clicks or conversions. Recommended for most advertisers.</span>
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
                              <span className="font-semibold text-slate-800 block">Do not optimize: Rotate ads indefinitely</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("ROTATION")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Ad rotation</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">{adRotationOption === "OPTIMIZE" ? "Optimize: Prefer best performing ads" : "Do not optimize: Rotate ads indefinitely"}</div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                    {/* Ad Schedule Row */}
                    {activeEditSetting === "SCHEDULE" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Ad schedule</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg cursor-pointer">Save</button>
                        </div>

                        {/* Duplicate Day/Time Validation Banner */}
                        {(() => {
                          const seen = new Set<string>();
                          let hasDuplicate = false;
                          let duplicateDay = "";
                          for (const item of adScheduleList) {
                            const key = `${item.day}_${item.start}_${item.end}`;
                            if (seen.has(key)) {
                              hasDuplicate = true;
                              duplicateDay = item.day;
                              break;
                            }
                            seen.add(key);
                          }
                          if (hasDuplicate) {
                            return (
                              <div className="p-3 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-600 font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                <span>Duplicate ad schedule detected for "{duplicateDay}". Please select different days or times.</span>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <div className="space-y-3">
                          {adScheduleList.map((item, index) => {
                            // Convert HH:MM to minute index
                            const [startH, startM] = item.start.split(":").map(Number);
                            const startTotalMinutes = (isNaN(startH) ? 0 : startH) * 60 + (isNaN(startM) ? 0 : startM);

                            return (
                              <div key={item.id} className="flex flex-wrap items-center gap-3">
                                <select
                                  value={item.day}
                                  onChange={(e) => {
                                    const updated = [...adScheduleList];
                                    updated[index].day = e.target.value;
                                    setAdScheduleList(updated);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-primary"
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

                                {/* Start Time Select */}
                                <select
                                  value={item.start}
                                  onChange={(e) => {
                                    const newStart = e.target.value;
                                    const [newH, newM] = newStart.split(":").map(Number);
                                    const newStartMin = newH * 60 + newM;

                                    // Next valid 15-minute slot for end time
                                    const nextSlotMin = Math.min(newStartMin + 15, 24 * 60);
                                    const nextSlotH = String(Math.floor(nextSlotMin / 60)).padStart(2, "0");
                                    const nextSlotM = String(nextSlotMin % 60).padStart(2, "0");
                                    const nextSlotStr = `${nextSlotH}:${nextSlotM}`;

                                    const [currEndH, currEndM] = item.end.split(":").map(Number);
                                    const currEndMin = (isNaN(currEndH) ? 0 : currEndH) * 60 + (isNaN(currEndM) ? 0 : currEndM);

                                    const updated = [...adScheduleList];
                                    updated[index].start = newStart;
                                    if (currEndMin <= newStartMin) {
                                      updated[index].end = nextSlotStr;
                                    }
                                    setAdScheduleList(updated);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-primary"
                                >
                                  {Array.from({ length: 96 }).map((_, i) => {
                                    const h = String(Math.floor(i / 4)).padStart(2, "0");
                                    const m = String((i % 4) * 15).padStart(2, "0");
                                    const t = `${h}:${m}`;
                                    return <option key={`disp-s-${t}`} value={t}>{t}</option>;
                                  })}
                                </select>

                                <span className="text-slate-500 font-medium">to</span>

                                {/* End Time Select: Only show times strictly after start time */}
                                <select
                                  value={item.end}
                                  onChange={(e) => {
                                    const updated = [...adScheduleList];
                                    updated[index].end = e.target.value;
                                    setAdScheduleList(updated);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-primary"
                                >
                                  {Array.from({ length: 97 }).map((_, i) => {
                                    const h = String(Math.floor(i / 4)).padStart(2, "0");
                                    const m = String((i % 4) * 15).padStart(2, "0");
                                    const t = `${h}:${m}`;
                                    const totalMin = Math.floor(i / 4) * 60 + (i % 4) * 15;
                                    // End time must be strictly greater than start time
                                    if (totalMin <= startTotalMinutes) return null;
                                    return <option key={`disp-e-${t}`} value={t}>{t}</option>;
                                  })}
                                </select>

                                {adScheduleList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setAdScheduleList(prev => prev.filter(s => s.id !== item.id))}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => {
                              const newId = Date.now().toString();
                              // Pick next day or time
                              const existingDays = adScheduleList.map(s => s.day);
                              const allDays = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];
                              const unusedDay = allDays.find(d => !existingDays.includes(d)) || "Mondays";
                              setAdScheduleList(prev => [...prev, { id: newId, day: unusedDay, start: "09:00", end: "17:00" }]);
                            }}
                            className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add schedule
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("SCHEDULE")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Ad schedule</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">
                          {adScheduleList.length === 1 && adScheduleList[0].day === "All days" && adScheduleList[0].start === "00:00" && adScheduleList[0].end === "00:00"
                            ? "All day"
                            : adScheduleList.map(s => `${s.day}: ${s.start} - ${s.end}`).join(", ")}
                        </div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                    {/* Devices Row */}
                    {activeEditSetting === "DEVICES" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Devices</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg">Save</button>
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
                            <span className="text-slate-800 font-semibold">Show on all devices</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="devChoice"
                              checked={deviceOption === "SPECIFIC"}
                              onChange={() => setDeviceOption("SPECIFIC")}
                              className="text-primary h-4 w-4"
                            />
                            <span className="text-slate-800 font-semibold">Set specific targeting for devices</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("DEVICES")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Devices</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">{deviceOption === "ALL" ? "Show on all devices" : "Set specific targeting for devices"}</div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                    {/* Dynamic Ads Row */}
                    {activeEditSetting === "DYNAMIC_ADS" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Dynamic ads</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg">Save</button>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useDynamicFeed}
                            onChange={(e) => setUseDynamicFeed(e.target.checked)}
                            className="rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                          />
                          <span className="font-semibold text-slate-800">Use dynamic ads feed for personalized ads</span>
                        </label>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("DYNAMIC_ADS")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Dynamic ads</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">{useDynamicFeed ? "Dynamic feed active" : "No data feed"}</div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                    {/* Start and End Dates Row */}
                    {activeEditSetting === "DATES" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Start and end dates</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg cursor-pointer">Save</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-slate-700 font-semibold">Start date</label>
                            <input
                              type="date"
                              min={todayFormattedStr}
                              value={startDate}
                              onChange={(e) => {
                                const newStart = e.target.value;
                                setStartDate(newStart);
                                // If end date is <= newStart, adjust end date to day after newStart
                                if (newStart && endDate) {
                                  const sDate = new Date(newStart);
                                  const eDate = new Date(endDate);
                                  if (eDate <= sDate) {
                                    const nextDay = new Date(sDate);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    setEndDate(nextDay.toISOString().split("T")[0]);
                                  }
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                            />
                            <span className="text-[10px] text-slate-500">Must be today or a future date</span>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-slate-700 font-semibold">End date (optional)</label>
                            <input
                              type="date"
                              min={(() => {
                                if (!startDate) return todayFormattedStr;
                                const s = new Date(startDate);
                                s.setDate(s.getDate() + 1);
                                return s.toISOString().split("T")[0];
                              })()}
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                            />
                            <span className="text-[10px] text-slate-500">Must be after the start date</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("DATES")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Start and end dates</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">
                          Start date: {startDate ? new Date(startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not set"} • End date: {endDate ? new Date(endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "No end date"}
                        </div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                    {/* Conversions Row */}
                    {activeEditSetting === "CONVERSIONS" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Conversions</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg">Save</button>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeViewThrough}
                            onChange={(e) => setIncludeViewThrough(e.target.checked)}
                            className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">Include view-through conversions in your "Conversions" and "All conversions" columns</span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("CONVERSIONS")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Conversions</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">
                          {includeViewThrough ? "Include view-through conversions in your \"Conversions\" and \"All conversions\" columns" : "Don't include view-through conversions in your \"Conversions\" and \"All conversions\" columns"}
                        </div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                    {/* Content Exclusions Row */}
                    {activeEditSetting === "EXCLUSIONS" ? (
                      <div className="p-6 bg-white space-y-4 animate-in fade-in duration-150 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800">Content exclusions</span>
                          <button type="button" onClick={() => setActiveEditSetting(null)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg">Save</button>
                        </div>

                        {/* Label Exclusions */}
                        <div className="space-y-3">
                          <h3 className="font-bold text-slate-800">Content label (Display and GVP)</h3>
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
                                  className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                                />
                                <div>
                                  <span className="font-semibold text-slate-800 block">{lbl.title}</span>
                                  <span className="text-[11px] text-slate-500 block">{lbl.desc}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Content Type Exclusions */}
                        <div className="space-y-3 pt-3 border-t border-slate-200">
                          <h3 className="font-bold text-slate-800">Content type</h3>
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
                              <label key={ct.name} className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={!!contentTypeExclusions[ct.name]}
                                    onChange={(e) => setContentTypeExclusions(prev => ({ ...prev, [ct.name]: e.target.checked }))}
                                    className="rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                                  />
                                  <span className="text-slate-800">{ct.name}</span>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${ct.status === "Inactive" ? "bg-slate-100 text-slate-500" : "bg-emerald-500/20 text-emerald-400"
                                  }`}>
                                  {ct.status}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200 mt-3">
                          While content exclusions are completed to the best of our ability, we can't guarantee that all related content will be excluded.
                        </p>
                      </div>
                    ) : (
                      <div onClick={() => setActiveEditSetting("EXCLUSIONS")} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer group transition-all text-xs">
                        <div className="w-1/3 text-slate-500 font-semibold">Content exclusions</div>
                        <div className="w-2/3 text-slate-800 font-bold pr-8">
                          {Object.keys(contentTypeExclusions).filter(k => contentTypeExclusions[k]).join(", ") || "Parked domains"}
                        </div>
                        <Edit3 className="h-4 w-4 text-slate-500 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: BUDGET AND BIDDING */}
          {displayStep === "BUDGET_BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Budget and bidding</h1>
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                {openBudgetBiddingSetting === "budget" ? (
                  <>
                    <div
                      onClick={() => setOpenBudgetBiddingSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                        Budget <span className="text-rose-500 font-bold">*</span>
                      </h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-xs font-semibold text-slate-800">Set your average daily budget for this campaign <span className="text-rose-500 font-bold">*</span></p>

                    <div className="relative max-w-xs text-xs">
                      <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-500">₹</span>
                      <input
                        type="text"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      The most you'll pay per month is your daily budget times 30.4 (the average number of days in a month). Some days you might spend more or less than your daily budget. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                    </p>
                  </>
                ) : (
                  <div
                    onClick={() => setOpenBudgetBiddingSetting("budget")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          Budget <span className="text-rose-500 font-bold">*</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {dailyBudget ? `₹${dailyBudget} / day` : "Not set"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenBudgetBiddingSetting("budget");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bidding Card with Conditional Views */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
                {openBudgetBiddingSetting === "bidding" ? (
                  <>
                    <div
                      onClick={() => setOpenBudgetBiddingSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Bidding</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    {!showDirectBidStrategy ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1.5">What do you want to focus on?</label>
                          <select
                            value={biddingFocus}
                            onChange={(e) => setBiddingFocus(e.target.value)}
                            className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
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

                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <label className="block text-slate-700 font-semibold">How do you want to get conversions?</label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="dispConvBidding"
                                  checked={conversionBiddingType === "MANUAL"}
                                  onChange={() => setConversionBiddingType("MANUAL")}
                                  className="text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-slate-800">Manually set bids</span>
                              </label>

                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="dispConvBidding"
                                  checked={conversionBiddingType === "MAX_CONVERSIONS"}
                                  onChange={() => setConversionBiddingType("MAX_CONVERSIONS")}
                                  className="text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-slate-800">Automatically maximize conversions</span>
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
                                  <span className="text-slate-800 block">Set a target cost per action</span>
                                  {conversionBiddingType === "TARGET_CPA" && (
                                    <div className="pt-2 space-y-1">
                                      <label className="block text-[11px] text-slate-500 font-semibold">Target CPA (₹)</label>
                                      <input
                                        type="text"
                                        value={targetCpaValue}
                                        onChange={(e) => setTargetCpaValue(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                                      />
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
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

                            <div className="pt-2 border-t border-slate-200 space-y-2">
                              <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={setTargetRoas}
                                  onChange={(e) => setSetTargetRoas(e.target.checked)}
                                  className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                                />
                                <div>
                                  <span className="font-semibold text-slate-800 block">Set a target return on ad spend</span>
                                  {setTargetRoas && (
                                    <div className="pt-2 space-y-1">
                                      <label className="block text-[11px] text-slate-500 font-semibold">Target ROAS (%)</label>
                                      <input
                                        type="text"
                                        value={targetRoasValue}
                                        onChange={(e) => setTargetRoasValue(e.target.value)}
                                        placeholder="e.g. 200%"
                                        className="w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                                      />
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
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

                            <div className="space-y-1.5 pt-2 border-t border-slate-200">
                              <label className="block text-slate-700 font-semibold">Enter your viewable CPM bid for this ad group</label>
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-500">₹</span>
                                <input
                                  type="text"
                                  value={viewableCpmBid}
                                  onChange={(e) => setViewableCpmBid(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                                />
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                              You’ve chosen to focus on impressions using the Viewable CPM bid strategy, but your account tracks conversions. You could get more conversions by choosing to focus on conversions.
                            </p>
                          </div>
                        )}

                        {/* Or, select a bid strategy directly toggle */}
                        <div className="pt-3 border-t border-slate-200">
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
                          <span className="font-semibold text-slate-800">Select your bid strategy</span>
                          <button
                            type="button"
                            onClick={() => setShowDirectBidStrategy(false)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                          >
                            Back to focus options
                          </button>
                        </div>

                        <select
                          value={directBidStrategy}
                          onChange={(e) => setDirectBidStrategy(e.target.value)}
                          className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
                        >
                          <option value="Viewable CPM">Viewable CPM</option>
                          <option value="Maximize conversions">Maximize conversions</option>
                          <option value="Target CPA">Target CPA</option>
                        </select>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200">
                          <label className="block text-slate-700 font-semibold">Enter your viewable CPM bid for this ad group</label>
                          <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-500">₹</span>
                            <input
                              type="text"
                              value={viewableCpmBid}
                              onChange={(e) => setViewableCpmBid(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() => setOpenBudgetBiddingSetting("bidding")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Bidding</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {showDirectBidStrategy
                          ? `Direct: ${directBidStrategy}`
                          : `Focus: ${biddingFocus} (${conversionBiddingType === "MAX_CONVERSIONS" ? "Maximize conversions" : conversionBiddingType === "TARGET_CPA" ? `Target CPA ₹${targetCpaValue}` : "Manual"}`
                        }
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenBudgetBiddingSetting("bidding");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: TARGETING */}
          {displayStep === "TARGETING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Targeting</h1>

              {/* ── SECTION 1: PEOPLE ── */}
              <div className="space-y-4">
                <div
                  onClick={() => setOpenPeopleSection(!openPeopleSection)}
                  className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 select-none hover:bg-slate-100"
                >
                  <h2 className="uppercase tracking-wider">People</h2>
                  <span>{openPeopleSection ? "▲" : "▼"}</span>
                </div>

                {openPeopleSection && (
                  <div className="space-y-4 pl-2 border-l border-slate-200 animate-in slide-in-from-top-1 duration-150">
                    {/* 1. Audience Segments Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
                      {openTargetingSetting === "audienceSegments" ? (
                        <>
                          <div
                            onClick={() => setOpenTargetingSetting(null)}
                            className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                          >
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Audience Segments</h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">Suggest who should see your ads. You can create new segments in Audience Manager.</p>
                            </div>
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="space-y-3">
                            <div className="relative max-w-md">
                              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                value={audienceSearchInput}
                                onChange={(e) => setAudienceSearchInput(e.target.value)}
                                placeholder='Try "luxury shoppers"'
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                              />
                            </div>

                            <p className="text-[11px] text-slate-500">You’ll see recently selected segments and ideas here.</p>
                            <p className="text-[11px] text-slate-500 italic">Use search to start looking for a segment.</p>

                            <div className="pt-2 border-t border-slate-200">
                              <p className="font-semibold text-slate-700">
                                {selectedAudiences.length > 0 ? `Selected (${selectedAudiences.length}): ${selectedAudiences.join(", ")}` : "None selected"}
                              </p>
                              <p className="text-[11px] text-slate-500">Select one or more segments to target.</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => setOpenTargetingSetting("audienceSegments")}
                          className="flex items-center justify-between cursor-pointer select-none text-xs group"
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-56">
                              <span className="font-bold text-slate-800">Audience Segments</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {selectedAudiences.length > 0 ? `Selected segments (${selectedAudiences.length})` : "None selected"}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTargetingSetting("audienceSegments");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. Demographics Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm text-xs">
                      {openTargetingSetting === "demographics" ? (
                        <>
                          <div
                            onClick={() => setOpenTargetingSetting(null)}
                            className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                          >
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Demographics</h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">Suggest people based on age, gender, parental status, or household income</p>
                            </div>
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Gender */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1">Gender</h4>
                              {["Female", "Male", "Unknown"].map((g) => (
                                <label key={g} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!demographicsGender[g]}
                                    onChange={(e) => setDemographicsGender(prev => ({ ...prev, [g]: e.target.checked }))}
                                    className="rounded bg-slate-50 border-slate-300 text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-slate-700">{g}</span>
                                </label>
                              ))}
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1">Age</h4>
                              {["18 - 24", "25 - 34", "35 - 44", "45 - 54", "55 - 64", "65+", "Unknown"].map((a) => (
                                <label key={a} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!demographicsAge[a]}
                                    onChange={(e) => setDemographicsAge(prev => ({ ...prev, [a]: e.target.checked }))}
                                    className="rounded bg-slate-50 border-slate-300 text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-slate-700">{a}</span>
                                </label>
                              ))}
                            </div>

                            {/* Parental Status */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1">Parental status</h4>
                              {["Not a parent", "Parent", "Unknown"].map((p) => (
                                <label key={p} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!demographicsParental[p]}
                                    onChange={(e) => setDemographicsParental(prev => ({ ...prev, [p]: e.target.checked }))}
                                    className="rounded bg-slate-50 border-slate-300 text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-slate-700">{p}</span>
                                </label>
                              ))}
                            </div>

                            {/* Household Income */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1">Household income</h4>
                              {["Top 10%", "11 - 20%", "21 - 30%", "31 - 40%", "41 - 50%", "Lower 50%", "Unknown"].map((inc) => (
                                <label key={inc} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!demographicsIncome[inc]}
                                    onChange={(e) => setDemographicsIncome(prev => ({ ...prev, [inc]: e.target.checked }))}
                                    className="rounded bg-slate-50 border-slate-300 text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-slate-700">{inc}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-2">
                            Note: Household income targeting is only available in select countries. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                          </p>
                        </>
                      ) : (
                        <div
                          onClick={() => setOpenTargetingSetting("demographics")}
                          className="flex items-center justify-between cursor-pointer select-none text-xs group"
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-56">
                              <span className="font-bold text-slate-800">Demographics</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Configured demographic specifications
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTargetingSetting("demographics");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 2: CONTENT ── */}
              <div className="space-y-4 pt-2">
                <div
                  onClick={() => setOpenContentSection(!openContentSection)}
                  className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 select-none hover:bg-slate-100"
                >
                  <h2 className="uppercase tracking-wider">Content</h2>
                  <span>{openContentSection ? "▲" : "▼"}</span>
                </div>

                {openContentSection && (
                  <div className="space-y-4 pl-2 border-l border-slate-200 animate-in slide-in-from-top-1 duration-150">
                    {/* 3. Keywords Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
                      {openTargetingSetting === "keywords" ? (
                        <>
                          <div
                            onClick={() => setOpenTargetingSetting(null)}
                            className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                          >
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Keywords</h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">Suggest terms related to your products or services to target relevant websites</p>
                            </div>
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-slate-700 font-semibold">Enter or paste keywords, one per line</label>
                              <textarea
                                rows={5}
                                value={enteredKeywordsText}
                                onChange={(e) => setEnteredKeywordsText(e.target.value)}
                                placeholder="Enter keywords here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                              />
                            </div>

                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                              <h4 className="font-bold text-slate-800">Get keyword ideas</h4>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={ideaUrlInput}
                                  onChange={(e) => setIdeaUrlInput(e.target.value)}
                                  placeholder="Enter a related website"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                                />
                                <input
                                  type="text"
                                  value={ideaProductInput}
                                  onChange={(e) => setIdeaProductInput(e.target.value)}
                                  placeholder="Enter your product or service"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                                />
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                We only show keyword ideas that are relevant to your business. To get ideas, enter your landing page, a related website, or words or phrases that describe your product or service in the field above.
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200 space-y-2">
                            <h4 className="font-bold text-slate-800">Keyword setting</h4>

                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="dispKwSetting"
                                checked={keywordSetting === "AUDIENCE"}
                                onChange={() => setKeywordSetting("AUDIENCE")}
                                className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">Audience:</span>
                                <span className="text-[11px] text-slate-500 block">Show ads to people likely to be interested in these keywords and also on webpages, apps, and videos related to these keywords</span>
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
                                <span className="font-semibold text-slate-800 block">Content:</span>
                                <span className="text-[11px] text-slate-500 block">Only show ads on webpages, apps, and videos related to these keywords</span>
                              </div>
                            </label>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => setOpenTargetingSetting("keywords")}
                          className="flex items-center justify-between cursor-pointer select-none text-xs group"
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-56">
                              <span className="font-bold text-slate-800">Keywords</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {enteredKeywordsText ? "Custom keywords active" : "None configured"}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTargetingSetting("keywords");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 4. Topics Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
                      {openTargetingSetting === "topics" ? (
                        <>
                          <div
                            onClick={() => setOpenTargetingSetting(null)}
                            className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                          >
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Topics</h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">Suggest webpages, apps, and videos about a certain topic</p>
                            </div>
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="space-y-3">
                            <div className="relative max-w-md">
                              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                value={topicSearchInput}
                                onChange={(e) => setTopicSearchInput(e.target.value)}
                                placeholder="Search by word, phrase, or URL"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
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
                                <label key={topicItem} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedTopics.includes(topicItem)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedTopics(prev => [...prev, topicItem]);
                                      else setSelectedTopics(prev => prev.filter(t => t !== topicItem));
                                    }}
                                    className="rounded bg-slate-50 border-slate-300 text-primary h-3.5 w-3.5"
                                  />
                                  <span className="text-slate-700 truncate">{topicItem}</span>
                                </label>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                              <p className="font-semibold text-slate-700">
                                {selectedTopics.length > 0 ? `Selected Topics (${selectedTopics.length}): ${selectedTopics.join(", ")}` : "None selected"}
                              </p>
                              <p className="text-[11px] text-slate-500">Your ad will show to all topics that match your other targeting. Add specific topics to narrow your targeting.</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => setOpenTargetingSetting("topics")}
                          className="flex items-center justify-between cursor-pointer select-none text-xs group"
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-56">
                              <span className="font-bold text-slate-800">Topics</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {selectedTopics.length > 0 ? `Selected topics (${selectedTopics.length})` : "None selected"}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTargetingSetting("topics");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 5. Placements Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs">
                      {openTargetingSetting === "placements" ? (
                        <>
                          <div
                            onClick={() => setOpenTargetingSetting(null)}
                            className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                          >
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">Placements</h3>
                              <p className="text-[11px] text-slate-500 mt-0.5">Suggest websites, videos, or apps where you'd like to show your ads</p>
                            </div>
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="space-y-3">
                            <div className="relative max-w-md">
                              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                value={placementSearchInput}
                                onChange={(e) => setPlacementSearchInput(e.target.value)}
                                placeholder="Search by word, phrase, URL, or video ID"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                              />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {["Websites", "YouTube channels", "YouTube videos", "Apps", "App categories (141)"].map((plcCat) => (
                                <button
                                  key={plcCat}
                                  type="button"
                                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary text-slate-700 hover:text-slate-900 transition-all cursor-pointer font-medium"
                                >
                                  {plcCat}
                                </button>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                              <p className="font-semibold text-slate-700">
                                {selectedPlacements.length > 0 ? `Selected Placements (${selectedPlacements.length}): ${selectedPlacements.join(", ")}` : "None selected"}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                Your ad can appear on any YouTube or Display Network placements that match your other targeting. Add specific placements to narrow your targeting. If a specific website you target has an equivalent app, your ads can also show there.
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => setOpenTargetingSetting("placements")}
                          className="flex items-center justify-between cursor-pointer select-none text-xs group"
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-56">
                              <span className="font-bold text-slate-800">Placements</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {selectedPlacements.length > 0 ? `Selected placements (${selectedPlacements.length})` : "None selected"}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTargetingSetting("placements");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 6. Optimized Targeting Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg text-xs">
                      {openTargetingSetting === "optimizedTargeting" ? (
                        <>
                          <div
                            onClick={() => setOpenTargetingSetting(null)}
                            className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                          >
                            <h3 className="text-sm font-semibold text-slate-900">Optimized targeting</h3>
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          </div>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useOptimizedTargeting}
                              onChange={(e) => setUseOptimizedTargeting(e.target.checked)}
                              className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                            />
                            <div>
                              <span className="font-semibold text-slate-800 block">Use optimized targeting</span>
                              <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                                Optimized targeting helps you get more viewable impressions by using information such as your landing page and assets. You can opt out or speed up optimization by adding targeting first.
                              </span>
                            </div>
                          </label>
                        </>
                      ) : (
                        <div
                          onClick={() => setOpenTargetingSetting("optimizedTargeting")}
                          className="flex items-center justify-between cursor-pointer select-none text-xs group"
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-56">
                              <span className="font-bold text-slate-800">Optimized targeting</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {useOptimizedTargeting ? "Turned on" : "Turned off"}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenTargetingSetting("optimizedTargeting");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: ADS CREATION */}
          {displayStep === "ADS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Ads</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Ad strength:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">Incomplete</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
                <h2 className="text-base font-semibold">Final URL & Business Name</h2>
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "identity" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800">Ad URL & Business details</h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Final URL <span className="text-rose-400">*</span></label>
                          <input
                            type="text"
                            value={finalUrl}
                            onChange={(e) => setFinalUrl(e.target.value)}
                            placeholder="https://www.example.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="block font-semibold text-slate-700">Business name <span className="text-rose-400">*</span></label>
                            <span className="text-[10px] text-slate-500 font-mono">{businessName.length} / 25</span>
                          </div>
                          <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            maxLength={25}
                            placeholder="Business name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                          />
                          <span className="text-[10px] text-slate-500 block">Text is {businessName.length} characters out of 25</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("identity")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Ad URL & Business details</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {finalUrl || "https://"} • {businessName || "No business name"}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("identity");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Assets: Images, Logos, Videos with proper image/video preview & link */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "assets" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800 flex items-center gap-1">
                          Assets (Images, Logos, Videos) <span className="text-rose-500 font-bold">*</span>
                        </h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-4 pt-2 text-xs">
                        {/* Images Card */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-1">
                              Images <span className="text-rose-500 font-bold">*</span>
                            </h3>
                            <label className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                              <Plus className="h-3.5 w-3.5" /> Add images
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const rawData = reader.result as string;
                                      if (!rawData) return;
                                      const img = new Image();
                                      img.onload = () => {
                                        setCropModalData({
                                          isOpen: true,
                                          rawImage: rawData,
                                          originalWidth: img.width,
                                          originalHeight: img.height,
                                          targetType: "IMAGE",
                                          selectedRatios: {
                                            landscape: true,
                                            square: true
                                          }
                                        });
                                      };
                                      img.src = rawData;
                                    };
                                    reader.readAsDataURL(file);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Add images with required aspect ratios: <strong>Landscape (1.91:1)</strong> and <strong>Square (1:1)</strong> <span className="text-rose-500 font-bold">*</span>.
                          </p>

                          {/* Landscape Images section */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                              Landscape Images (1.91:1 - 1200×628)
                              <span className="text-[10px] font-normal text-slate-500">({landscapeImagesList.length})</span>
                            </span>
                            {landscapeImagesList.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {landscapeImagesList.map((imgUrl, i) => (
                                  <div key={i} className="relative group p-2 rounded-xl bg-white border border-slate-200 space-y-1">
                                    <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                                      <img src={imgUrl} alt={`Landscape ${i + 1}`} className="h-full w-full object-contain" />
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[9px] font-mono text-primary truncate flex-1">Landscape_{i + 1}.jpg</span>
                                      <button
                                        type="button"
                                        onClick={() => setLandscapeImagesList(prev => prev.filter((_, index) => index !== i))}
                                        className="text-slate-400 hover:text-rose-500 p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                At least 1 Landscape marketing image (1.91:1) is required.
                              </p>
                            )}
                          </div>

                          {/* Square Images section */}
                          <div className="space-y-1 pt-2">
                            <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                              Square Images (1:1 - 1200×1200)
                              <span className="text-[10px] font-normal text-slate-500">({squareImagesList.length})</span>
                            </span>
                            {squareImagesList.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {squareImagesList.map((imgUrl, i) => (
                                  <div key={i} className="relative group p-2 rounded-xl bg-white border border-slate-200 space-y-1">
                                    <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                                      <img src={imgUrl} alt={`Square ${i + 1}`} className="h-full w-full object-contain" />
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[9px] font-mono text-cyan-600 truncate flex-1">Square_{i + 1}.jpg</span>
                                      <button
                                        type="button"
                                        onClick={() => setSquareImagesList(prev => prev.filter((_, index) => index !== i))}
                                        className="text-slate-400 hover:text-rose-500 p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                At least 1 Square marketing image (1:1) is required.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Logos Card */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Logos</h3>
                            <label className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                              <Plus className="h-3.5 w-3.5" /> Add logos
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const rawData = reader.result as string;
                                      if (!rawData) return;
                                      const img = new Image();
                                      img.onload = () => {
                                        setCropModalData({
                                          isOpen: true,
                                          rawImage: rawData,
                                          originalWidth: img.width,
                                          originalHeight: img.height,
                                          targetType: "LOGO",
                                          selectedRatios: {
                                            landscape: false,
                                            square: true
                                          }
                                        });
                                      };
                                      img.src = rawData;
                                    };
                                    reader.readAsDataURL(file);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-500">Add up to 5 logos (1:1 square required)</p>

                          {logosList.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                              {logosList.map((logoUrl, i) => (
                                <div key={i} className="relative group p-2 rounded-xl bg-white border border-slate-200 space-y-2">
                                  <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                                    <img src={logoUrl} alt={`Logo ${i + 1}`} className="h-full w-full object-contain" />
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-mono text-emerald-600 truncate flex-1" title={logoUrl}>
                                      {logoUrl.startsWith("data:") ? `Logo_${i + 1}.jpg` : logoUrl}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setLogosList(prev => prev.filter((_, index) => index !== i))}
                                      className="text-slate-500 hover:text-rose-500 p-0.5"
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
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Videos</h3>
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
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const data = reader.result as string;
                                        setVideosList(prev => [...prev, data]);
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-500">Optional (portrait and landscape around 30 seconds work best)</p>

                          {videosList.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {videosList.map((vidUrl, i) => (
                                <div key={i} className="relative group p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                                  <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                                    <video src={vidUrl} controls className="h-full w-full object-cover" />
                                  </div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-mono text-cyan-600 truncate flex-1" title={vidUrl}>
                                      {vidUrl.startsWith("data:") ? `Video_${i + 1}.mp4` : vidUrl}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setVideosList(prev => prev.filter((_, index) => index !== i))}
                                      className="text-slate-500 hover:text-rose-500 p-0.5"
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
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("assets")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            Assets <span className="text-rose-500 font-bold">*</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {landscapeImagesList.length} Landscape, {squareImagesList.length} Square, {logosList.length} Logo(s), {videosList.length} Video(s)
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("assets");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Headlines */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "headlines" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800">Headlines</h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">Add up to 5 headlines</span>
                        </div>
                        {headlines.map((hl, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] text-slate-500">Headline {idx + 1} <span className="text-rose-400">*</span></label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
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
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("headlines")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Headlines</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {headlines.filter(h => h).length} headline(s) added
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("headlines");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Long Headlines */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "longHeadlines" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800">Long headlines</h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">Add up to 5 long headlines</span>
                        </div>
                        {longHeadlines.map((lhl, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] text-slate-500">Long headline {idx + 1} <span className="text-rose-400">*</span></label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
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
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("longHeadlines")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Long headlines</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {longHeadlines.filter(h => h).length} long headline(s) added
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("longHeadlines");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Descriptions */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "descriptions" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800">Descriptions</h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">Add up to 5 descriptions</span>
                        </div>
                        {descriptions.map((desc, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] text-slate-500">Description {idx + 1} <span className="text-rose-400">*</span></label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
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
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("descriptions")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Descriptions</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {descriptions.filter(d => d).length} description(s) added
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("descriptions");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Asset Optimization Section */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "assetOptimization" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800">Asset enhancements</h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useAssetEnhancements}
                            onChange={(e) => setUseAssetEnhancements(e.target.checked)}
                            className="mt-0.5 rounded bg-white border-slate-300 text-primary h-4 w-4"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">Use asset enhancements</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                              Let Google enhance your assets and optimize your ad layouts. This could improve ad performance. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useAutoGeneratedVideo}
                            onChange={(e) => setUseAutoGeneratedVideo(e.target.checked)}
                            className="mt-0.5 rounded bg-white border-slate-300 text-primary h-4 w-4"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">Use auto-generated video</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                              Let Google create your video ads using your headlines, descriptions and images. If you've added your own video content, then your ads won't use auto-generated video. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useNativeFormats}
                            onChange={(e) => setUseNativeFormats(e.target.checked)}
                            className="mt-0.5 rounded bg-white border-slate-300 text-primary h-4 w-4"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block">Use native formats</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                              Include native formats to expand your reach to more publishers. Adding native formats might also improve ad performance. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more</a>
                            </span>
                          </div>
                        </label>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("assetOptimization")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Asset enhancements</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Enhancements: {useAssetEnhancements ? "Yes" : "No"} • Auto Video: {useAutoGeneratedVideo ? "Yes" : "No"} • Native: {useNativeFormats ? "Yes" : "No"}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("assetOptimization");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Ad URL Options & Design Settings with More Options & Checkboxes */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
                  {openAdSetting === "adUrlOptions" ? (
                    <>
                      <div
                        onClick={() => setOpenAdSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer select-none"
                      >
                        <h4 className="font-bold text-slate-800">Ad URL options</h4>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="space-y-4 pt-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-700">More options</span>
                          <button
                            type="button"
                            onClick={() => setShowAdUrlMoreOptions(!showAdUrlMoreOptions)}
                            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdUrlMoreOptions ? "rotate-180" : ""}`} />
                            Configure options
                          </button>
                        </div>

                        {showAdUrlMoreOptions && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {/* Checkbox Options Selection */}
                            <div className="space-y-2 pb-2 border-b border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={enableCallToAction}
                                  onChange={(e) => setEnableCallToAction(e.target.checked)}
                                  className="rounded bg-white border-slate-300 text-primary h-4 w-4"
                                />
                                <span className="font-semibold text-slate-800">Call to action text</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={enableCustomColors}
                                  onChange={(e) => setEnableCustomColors(e.target.checked)}
                                  className="rounded bg-white border-slate-300 text-primary h-4 w-4"
                                />
                                <span className="font-semibold text-slate-800">Custom colors</span>
                              </label>
                            </div>

                            {/* Controls grid based on enabled checkboxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Call to action text */}
                              {enableCallToAction && (
                                <div className="space-y-1">
                                  <label className="block text-slate-700 font-semibold">Call to action text</label>
                                  <select
                                    value={callToActionText}
                                    onChange={(e) => setCallToActionText(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
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
                                  <label className="block text-slate-700 font-semibold">Custom colors</label>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={mainCustomColor}
                                        onChange={(e) => setMainCustomColor(e.target.value)}
                                        className="h-8 w-8 rounded bg-transparent cursor-pointer border border-slate-200"
                                      />
                                      <span className="text-[11px] font-mono text-slate-700">{mainCustomColor}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={accentCustomColor}
                                        onChange={(e) => setAccentCustomColor(e.target.value)}
                                        className="h-8 w-8 rounded bg-transparent cursor-pointer border border-slate-200"
                                      />
                                      <span className="text-[11px] font-mono text-slate-700">{accentCustomColor}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => setOpenAdSetting("adUrlOptions")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Ad URL options</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          CTA: {enableCallToAction ? callToActionText : "Default"} • Custom Colors: {enableCustomColors ? "Yes" : "No"}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenAdSetting("adUrlOptions");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Warning Notice */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 leading-relaxed space-y-1">
                  <p className="font-semibold text-slate-800">To unlock this format, add the following assets:</p>
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
                <p className="font-semibold text-slate-700">Fix these errors to publish your campaign</p>

                {!viewableCpmBid && biddingFocus === "Impressions" && (
                  <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 flex items-center justify-between text-rose-300">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>Viewable CPM bid: Enter a CPM bid</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDisplayStep("BUDGET_BIDDING")}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-900 font-bold text-xs transition-all cursor-pointer shadow"
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
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-900 font-bold text-xs transition-all cursor-pointer shadow"
                    >
                      Fix it
                    </button>
                  </div>
                )}
              </div>

              {/* EEA Personalization Suggestion Notice */}
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-700">The following suggestions will greatly improve your campaign's performance</p>
                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center gap-2 text-blue-300">
                  <Info className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>End-user consent signals are required to use ad personalization features in the European Economic Area (EEA). <a href="#" onClick={e => e.preventDefault()} className="underline font-bold">Learn more</a></span>
                </div>
              </div>

              {/* Main Campaign Review Section */}
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign Review</h1>

                {/* Top Summary Card (Name, Type, Objective, Goal) */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-medium">Campaign name</span>
                      <input
                        type="text"
                        value={displayCampaignName}
                        onChange={(e) => setDisplayCampaignName(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-slate-900 font-semibold focus:outline-none focus:border-primary text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-medium">Campaign type</span>
                      <span className="font-semibold text-slate-800">Display</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-medium">Objective</span>
                      <span className="font-semibold text-slate-800">YouTube</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 font-medium">Goal</span>
                      <span className="font-semibold text-slate-800">Downloads, Phone call leads</span>
                    </div>
                  </div>
                </div>

                {/* Campaign Settings Table Card */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700">Campaign settings</h3>
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-semibold w-32">Locations</span>
                      <span className="text-slate-800 font-medium flex-1">
                        {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-semibold w-32">Languages</span>
                      <span className="text-slate-800 font-medium flex-1">{selectedLanguages.join(", ") || "English"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold w-32">EU political ads</span>
                      <span className="text-slate-800 font-medium flex-1">
                        {euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget and Bidding Table Card */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-700">Budget and bidding</h3>
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-semibold w-32">Budget</span>
                      <span className="text-slate-800 font-medium flex-1 font-mono">₹{dailyBudget || "0.00"}/day</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold w-32">Bidding</span>
                      <span className="text-slate-800 font-medium flex-1">
                        {biddingFocus === "Impressions" ? "Viewable CPM" : biddingFocus === "Conversion value" ? "Maximize conversion value" : "Maximize conversions"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ad Group 1 Card with Edit Icon & Sub-sections */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      Ad group 1
                      <Edit3
                        className="h-4 w-4 text-slate-500 hover:text-primary cursor-pointer"
                        onClick={() => setDisplayStep("TARGETING")}
                      />
                    </h3>
                  </div>

                  {/* Bidding row inside Ad Group */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-700">Bidding</h4>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Viewable CPM bid</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        {viewableCpmBid ? `₹${viewableCpmBid}` : "Enter a CPM bid"}
                      </span>
                    </div>
                  </div>

                  {/* Targeting row inside Ad Group */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-700">Targeting</h4>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 font-semibold w-36">Demographics</span>
                        <span className="text-slate-800 font-medium flex-1">
                          Suggest people based on age, gender, parental status, or household income
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold w-36">Optimized targeting</span>
                        <span className="text-emerald-400 font-bold flex-1">
                          {useOptimizedTargeting ? "On" : "Off"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ads row inside Ad Group */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-700">Ads</h4>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Ad creation</span>
                      <span className={`font-bold ${(landscapeImagesList.length > 0 || squareImagesList.length > 0) ? "text-emerald-400" : "text-slate-500"}`}>
                        {(landscapeImagesList.length > 0 || squareImagesList.length > 0) ? `${landscapeImagesList.length} Landscape, ${squareImagesList.length} Square image(s)` : "No ads"}
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
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (displayStep === "REVIEW") setDisplayStep("ADS");
            else if (displayStep === "ADS") setDisplayStep("TARGETING");
            else if (displayStep === "TARGETING") setDisplayStep("BUDGET_BIDDING");
            else if (displayStep === "BUDGET_BIDDING") setDisplayStep("CAMPAIGN_SETTINGS");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
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
              onClick={async () => {
                // 1. Validation
                const cleanHeadlines = headlines.filter(h => h && h.trim().length > 0);
                const cleanDescriptions = descriptions.filter(d => d && d.trim().length > 0);
                const numBudget = Number(dailyBudget);

                if (!dailyBudget || isNaN(numBudget) || numBudget <= 0) {
                  alert("Daily Budget must be a positive number greater than 0.");
                  setDisplayStep("BUDGET_BIDDING");
                  return;
                }

                if (cleanHeadlines.length === 0) {
                  alert("At least 1 Headline is required for Display campaigns.");
                  setDisplayStep("ADS");
                  return;
                }

                if (cleanDescriptions.length === 0) {
                  alert("At least 1 Description is required for Display campaigns.");
                  setDisplayStep("ADS");
                  return;
                }

                try {
                  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                  const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
                  const targetCid = customerId || "6587355041";

                  const formattedImages: Array<{ data: string; fieldType: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" }> = [
                    ...landscapeImagesList.map(data => ({ data, fieldType: "MARKETING_IMAGE" as const })),
                    ...squareImagesList.map(data => ({ data, fieldType: "SQUARE_MARKETING_IMAGE" as const }))
                  ];

                  const payloadToLaunch = {
                    orgId,
                    customerId: targetCid,
                    campaignName: displayCampaignName.trim() || `YouTube-Display-${Date.now()}`,
                    channelType: "DISPLAY",
                    biddingStrategy: conversionBiddingType === "TARGET_CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
                    budget: numBudget,
                    targetCpa: conversionBiddingType === "TARGET_CPA" && targetCpaValue ? Number(targetCpaValue) : undefined,
                    startDate: startDate || new Date().toISOString().split("T")[0],
                    endDate: endDate || undefined,
                    finalUrl: finalUrl.trim() || "https://www.JDS-automation.com",
                    businessName: businessName.trim() || "JDS",
                    headlines: cleanHeadlines.length > 0 ? cleanHeadlines : ["Grow Your Business Online", "Digital Marketing Solutions", "Smart Business Automation"],
                    longHeadlines: (longHeadlines && longHeadlines.filter(h => h && h.trim().length > 0).length > 0)
                      ? longHeadlines.filter(h => h && h.trim().length > 0)
                      : ["Explore Smart Business Automation and Digital Marketing Solutions"],
                    descriptions: cleanDescriptions.length > 0 ? cleanDescriptions : [
                      "Get powerful digital marketing and automation solutions for your business.",
                      "Generate more leads and grow your business with smart automation."
                    ],
                    images: formattedImages.length > 0 ? formattedImages : [
                      { data: "https://ik.imagekit.io/automationjds/tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF/gads_dg_image_1788441362828_images_RKjVY-rHB.png", fieldType: "MARKETING_IMAGE" as const },
                      { data: "https://ik.imagekit.io/automationjds/tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF/gads_dg_image_1788441362828_images_RKjVY-rHB.png", fieldType: "SQUARE_MARKETING_IMAGE" as const }
                    ],
                    logos: logosList.length > 0 ? logosList : [
                      "https://ik.imagekit.io/automationjds/tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg"
                    ],
                    locations: selectedLocation === "INDIA" ? ["India"] : ["All countries and territories"],
                    languages: selectedLanguages.length > 0 ? selectedLanguages : ["English"],
                    euPolitical: euPoliticalAds
                  };

                  console.log("[YouTube -> Display Frontend] Launching payload:", JSON.stringify(payloadToLaunch, null, 2));

                  const res = await fetch(`${BACKEND}/api/ads/campaigns/youtube-reach/display-local`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadToLaunch)
                  });

                  if (res.ok) {
                    alert("Display campaign published successfully!");
                    router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
                  } else {
                    const errData = await res.json().catch(() => ({}));
                    alert(`Failed to publish Display campaign: ${errData.message || errData.error || "Unknown error"}`);
                  }
                } catch (err: any) {
                  alert(`Backend error: ${err.message}`);
                }
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
            >
              Save & Publish
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      {/* ── Crop & Aspect Ratio Selection Modal ── */}
      {cropModalData && cropModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Select Aspect Ratios for Upload
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose which aspect ratios to generate for your Display {cropModalData.targetType === "LOGO" ? "Logo" : "Marketing Image"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCropModalData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Original Image Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600">Original Dimensions: <strong className="text-slate-900">{cropModalData.originalWidth} × {cropModalData.originalHeight} px</strong></span>
              <span className="text-slate-500">Auto-cropped & padded to standard Google Ads spec</span>
            </div>

            {/* Ratio Selection Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Landscape 1.91:1 */}
              {cropModalData.targetType === "IMAGE" && (
                <div
                  onClick={() => {
                    setCropModalData(prev => prev ? {
                      ...prev,
                      selectedRatios: {
                        ...prev.selectedRatios,
                        landscape: !prev.selectedRatios.landscape
                      }
                    } : null);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-3 ${
                    cropModalData.selectedRatios.landscape
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cropModalData.selectedRatios.landscape}
                        onChange={() => {}}
                        className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="font-bold text-xs text-slate-800">Landscape (1.91:1)</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      1200 × 628
                    </span>
                  </div>
                  <div className="h-28 w-full rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={cropModalData.rawImage}
                      alt="Landscape preview"
                      className="h-full w-full object-contain"
                      style={{ aspectRatio: "1.91 / 1" }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Required for horizontal placements across Google Display Network</p>
                </div>
              )}

              {/* Square 1:1 */}
              <div
                onClick={() => {
                  setCropModalData(prev => prev ? {
                    ...prev,
                    selectedRatios: {
                      ...prev.selectedRatios,
                      square: !prev.selectedRatios.square
                    }
                  } : null);
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-3 ${
                  cropModalData.selectedRatios.square
                    ? "border-cyan-500 bg-cyan-500/5 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                } ${cropModalData.targetType === "LOGO" ? "sm:col-span-2" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cropModalData.selectedRatios.square}
                      onChange={() => {}}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-slate-800">
                      Square (1:1) {cropModalData.targetType === "LOGO" ? "Logo" : "Marketing Image"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    1200 × 1200
                  </span>
                </div>
                <div className="h-28 w-full rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={cropModalData.rawImage}
                    alt="Square preview"
                    className="h-full w-full object-contain"
                    style={{ aspectRatio: "1 / 1" }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {cropModalData.targetType === "LOGO"
                    ? "1:1 Square aspect ratio required by Google Ads for Logos"
                    : "Required for square placements in native and banner feeds"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCropModalData(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!cropModalData.selectedRatios.landscape && !cropModalData.selectedRatios.square}
                onClick={() => {
                  const rawData = cropModalData.rawImage;
                  const img = new Image();
                  img.onload = () => {
                    if (cropModalData.targetType === "LOGO") {
                      // Generate 1:1 Square Logo
                      const logoCanvas = document.createElement("canvas");
                      logoCanvas.width = 1200;
                      logoCanvas.height = 1200;
                      const ctx = logoCanvas.getContext("2d");
                      if (ctx) {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, 1200, 1200);
                        const scale = Math.min(1200 / img.width, 1200 / img.height);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        const x = (1200 - w) / 2;
                        const y = (1200 - h) / 2;
                        ctx.drawImage(img, x, y, w, h);
                        const logoData = logoCanvas.toDataURL("image/jpeg", 0.92);
                        setLogosList(prev => [...prev, logoData]);
                      }
                    } else {
                      // 1. Generate 1.91:1 Landscape if selected
                      if (cropModalData.selectedRatios.landscape) {
                        const landCanvas = document.createElement("canvas");
                        landCanvas.width = 1200;
                        landCanvas.height = 628;
                        const lctx = landCanvas.getContext("2d");
                        if (lctx) {
                          lctx.fillStyle = "#ffffff";
                          lctx.fillRect(0, 0, 1200, 628);
                          const scale = Math.min(1200 / img.width, 628 / img.height);
                          const w = img.width * scale;
                          const h = img.height * scale;
                          const x = (1200 - w) / 2;
                          const y = (628 - h) / 2;
                          lctx.drawImage(img, x, y, w, h);
                          const landData = landCanvas.toDataURL("image/jpeg", 0.92);
                          setLandscapeImagesList(prev => [...prev, landData]);
                        }
                      }

                      // 2. Generate 1:1 Square if selected
                      if (cropModalData.selectedRatios.square) {
                        const sqCanvas = document.createElement("canvas");
                        sqCanvas.width = 1200;
                        sqCanvas.height = 1200;
                        const sctx = sqCanvas.getContext("2d");
                        if (sctx) {
                          sctx.fillStyle = "#ffffff";
                          sctx.fillRect(0, 0, 1200, 1200);
                          const scale = Math.min(1200 / img.width, 1200 / img.height);
                          const w = img.width * scale;
                          const h = img.height * scale;
                          const x = (1200 - w) / 2;
                          const y = (1200 - h) / 2;
                          sctx.drawImage(img, x, y, w, h);
                          const sqData = sqCanvas.toDataURL("image/jpeg", 0.92);
                          setSquareImagesList(prev => [...prev, sqData]);
                        }
                      }
                    }
                    setCropModalData(null);
                  };
                  img.src = rawData;
                }}
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Apply Ratios & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}