"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, Sparkles, Image as ImageIcon, Video as VideoIcon, Upload, Phone, DollarSign, Tag, FileText, MessageSquare, Smartphone, SlidersHorizontal, Globe, Users, Settings, Edit3, Lock, ShieldAlert, Layers
} from "lucide-react";

export default function WebsiteTrafficPerformanceMaxPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading campaign setup...</div>}>
      <WebsiteTrafficPerformanceMaxContent />
    </Suspense>
  );
}

function WebsiteTrafficPerformanceMaxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  const [wizardStep, setWizardStep] = useState<"BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY">("BIDDING");
  const [campaignName, setCampaignName] = useState<string>("Website traffic-Performance Max-1");
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      await fetch(`${BACKEND}/api/ads/campaign/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || accountInfo?.customerId || "default",
          campaignName: campaignName || "Website traffic-Performance Max-1",
          campaignType: "PERFORMANCE_MAX",
          biddingStrategy: biddingFocus || "Maximize conversion value",
          budget: typeof dailyBudgetValue !== "undefined" && dailyBudgetValue ? Number(dailyBudgetValue) : null,
          startDate: typeof startDate !== "undefined" && startDate ? startDate : new Date().toISOString().split("T")[0],
          endDate: typeof endDate !== "undefined" && endDate ? endDate : null,
          finalUrl: typeof finalUrl !== "undefined" ? finalUrl : null,
          headlines: typeof headlines !== "undefined" && Array.isArray(headlines) ? headlines.filter(Boolean) : [],
          descriptions: typeof descriptions !== "undefined" && Array.isArray(descriptions) ? descriptions.filter(Boolean) : [],
          searchThemes: typeof searchThemes !== "undefined" && Array.isArray(searchThemes) ? searchThemes : [],
          languages: typeof selectedLanguages !== "undefined" ? selectedLanguages : ["English"],
          geoTargets: typeof selectedLocation !== "undefined" && selectedLocation === "ALL" ? ["ALL"] : selectedLocation === "INDIA" ? ["INDIA"] : (typeof customLocationInput !== "undefined" && customLocationInput ? [customLocationInput] : ["ALL"]),
          draftData: {
            assetGroupName: typeof assetGroupName !== "undefined" ? assetGroupName : "Asset group 1",
            businessName: typeof businessName !== "undefined" ? businessName : "",
            longHeadlines: typeof longHeadlines !== "undefined" && Array.isArray(longHeadlines) ? longHeadlines.filter(Boolean) : [],
            ctaOption: typeof ctaOption !== "undefined" ? ctaOption : "Automated",
            uploadedImages: typeof uploadedImages !== "undefined" ? uploadedImages : [],
            uploadedVideos: typeof uploadedVideos !== "undefined" ? uploadedVideos : [],
            uploadedLogos: typeof uploadedLogos !== "undefined" ? uploadedLogos : [],
            wizardStep
          }
        })
      });
      setShowDraftModal(false);
      router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
    } catch (err) {
      console.error("Failed to save draft:", err);
      setShowDraftModal(false);
      router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Step 1: Bidding State
  const [openBiddingCard, setOpenBiddingCard] = useState<string | null>(null);
  const [biddingFocus, setBiddingFocus] = useState<"Maximize conversions" | "Target CPA" | "Maximize conversion value" | "Target ROAS">("Maximize conversion value");
  const [targetCpaValue, setTargetCpaValue] = useState<string>("166.11");
  const [targetRoasValue, setTargetRoasValue] = useState<string>("200");
  const [onlyBidNewCustomers, setOnlyBidNewCustomers] = useState<boolean>(false);
  const [adjustLapsedCustomers, setAdjustLapsedCustomers] = useState<boolean>(false);
  const [localCustomerOptimization, setLocalCustomerOptimization] = useState<boolean>(false);

  // Step 2: Campaign Settings State
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [isEUPoliticalAdsOpen, setIsEUPoliticalAdsOpen] = useState(false);
  const [showMoreCampaignSettings, setShowMoreCampaignSettings] = useState(false);
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
  const [isSearchingLanguages, setIsSearchingLanguages] = useState<boolean>(false);
  const [languageSearchResults, setLanguageSearchResults] = useState<string[]>([]);
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [audienceTab, setAudienceTab] = useState<"SEARCH" | "BROWSE">("SEARCH");
  const [audienceTargetingMode, setAudienceTargetingMode] = useState<"TARGETING" | "OBSERVATION">("OBSERVATION");
  const [adRotationMode, setAdRotationMode] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">("OPTIMIZE");
  const [showMoreSettings, setShowMoreSettings] = useState<boolean>(false);
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "12:00 AM", end: "12:00 AM" }
  ]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>("");
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");

  // Step 3: Asset Group State
  const [assetGroupName, setAssetGroupName] = useState<string>("Asset Group 1");
  const [businessName, setBusinessName] = useState<string>("JISNU Digital Solutions");
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");

  // Asset Group Cards Open/Closed States (Pen Edit Icon format)
  const [isAssetGroupInfoOpen, setIsAssetGroupInfoOpen] = useState<boolean>(false);
  const [isAssetsSectionOpen, setIsAssetsSectionOpen] = useState<boolean>(false);
  const [isAssetOptimizationCardOpen, setIsAssetOptimizationCardOpen] = useState<boolean>(false);
  const [isSignalsOpen, setIsSignalsOpen] = useState<boolean>(false);
  const [headlines, setHeadlines] = useState<string[]>([""]);
  const [longHeadlines, setLongHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedLogos, setUploadedLogos] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadedClips, setUploadedClips] = useState<string[]>([]);
  const [ctaOption, setCtaOption] = useState<string>("Automated (recommended)");

  // Saved Asset Extensions State
  const [savedSitelinks, setSavedSitelinks] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([]);
  const [savedPromotions, setSavedPromotions] = useState<Array<{ occasion: string; item: string; discount: string; url: string }>>([]);
  const [savedPrices, setSavedPrices] = useState<Array<{ type: string; price: string }>>([]);
  const [savedMessages, setSavedMessages] = useState<Array<{ platform: string }>>([]);
  const [savedSnippets, setSavedSnippets] = useState<Array<{ header: string; values: string[] }>>([]);
  const [savedLeadForms, setSavedLeadForms] = useState<Array<{ headline: string; business: string }>>([]);
  const [savedCallouts, setSavedCallouts] = useState<string[]>([]);

  // Modals & Calls State
  const [activeModal, setActiveModal] = useState<
    "SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | null
  >(null);
  const [callCountry, setCallCountry] = useState<string>("India (+91)");
  const [callPhone, setCallPhone] = useState<string>("");
  const [callConvAction, setCallConvAction] = useState<string>("Use account settings (Calls from ads)");
  const [callSchedules, setCallSchedules] = useState<Array<{ id: string; day: string; start: string; end: string }>>([
    { id: "cs-1", day: "All days", start: "00:00", end: "00:00" }
  ]);

  // Asset Optimization Toggles
  const [enableTextCustomization, setEnableTextCustomization] = useState<boolean>(true);
  const [enableFinalUrlExpansion, setEnableFinalUrlExpansion] = useState<boolean>(true);

  // Signals State
  const [searchThemes, setSearchThemes] = useState<string[]>([]);
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");
  const [audienceName, setAudienceName] = useState<string>("");

  // Step 4: Budget State
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [dailyBudgetValue, setDailyBudgetValue] = useState<string>("");
  const [selectedPresetBudget, setSelectedPresetBudget] = useState<string>("5080.90");
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("");

  const draftId = searchParams.get("draftId");

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

    if (draftId) {
      fetch(`${BACKEND}/api/ads/campaigns/drafts?orgId=${encodeURIComponent(orgId)}${customerId ? `&customerId=${encodeURIComponent(customerId)}` : ""}`)
        .then(r => r.json())
        .then(drafts => {
          if (Array.isArray(drafts)) {
            const found = drafts.find((d: any) => d.id === draftId || d.campaignId === draftId);
            if (found) {
              if (found.name) setCampaignName(found.name);
              if (found.biddingStrategy) setBiddingFocus(found.biddingStrategy);
              if (found.budget) {
                setDailyBudgetValue(String(found.budget));
                setSelectedPresetBudget("CUSTOM");
                setCustomBudgetValue(String(found.budget));
              }
              if (found.startDate) setStartDate(new Date(found.startDate).toISOString().split("T")[0]);
              if (found.endDate) setEndDate(new Date(found.endDate).toISOString().split("T")[0]);
              if (found.finalUrl) setFinalUrl(found.finalUrl);
              if (Array.isArray(found.headlines) && found.headlines.length > 0) setHeadlines(found.headlines);
              if (Array.isArray(found.descriptions) && found.descriptions.length > 0) setDescriptions(found.descriptions);
              if (Array.isArray(found.searchThemes) && found.searchThemes.length > 0) setSearchThemes(found.searchThemes);
              if (Array.isArray(found.languages) && found.languages.length > 0) setSelectedLanguages(found.languages);
              if (Array.isArray(found.geoTargets) && found.geoTargets.length > 0) {
                if (found.geoTargets[0] === "ALL" || found.geoTargets[0] === "INDIA") {
                  setSelectedLocation(found.geoTargets[0]);
                } else {
                  setSelectedLocation("CUSTOM");
                  setCustomLocationInput(found.geoTargets[0]);
                }
              }
              const dData = found.audienceSignal;
              if (dData && typeof dData === "object") {
                if (dData.assetGroupName) setAssetGroupName(dData.assetGroupName);
                if (dData.businessName) setBusinessName(dData.businessName);
                if (Array.isArray(dData.longHeadlines)) setLongHeadlines(dData.longHeadlines);
                if (Array.isArray(dData.uploadedImages)) setUploadedImages(dData.uploadedImages);
                if (Array.isArray(dData.uploadedLogos)) setUploadedLogos(dData.uploadedLogos);
                if (Array.isArray(dData.uploadedVideos)) setUploadedVideos(dData.uploadedVideos);
                if (dData.ctaOption) setCtaOption(dData.ctaOption);
              }
            }
          }
        })
        .catch(err => console.error("Error restoring draft:", err));
    }
  }, [customerId, draftId]);

  const activeBudgetValue = selectedPresetBudget === "CUSTOM"
    ? Number(customBudgetValue.replace(/,/g, "")) || 5080.90
    : Number(selectedPresetBudget) || 5080.90;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDraftModal(true)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-semibold">
            <span className="text-slate-500">Website traffic</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Performance Max Setup
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
        <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar">
          <div className="p-6 space-y-6">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Performance Max</span>
            </div>

            <nav className="space-y-2 text-xs">
              {/* Step 1: Bidding */}
              <div className="space-y-1">
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
                </div>
                {wizardStep === "BIDDING" && (
                  <div className="ml-4 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="cursor-pointer hover:text-slate-800" onClick={() => setOpenBiddingCard("bidding")}>Bidding</p>
                    <p className="cursor-pointer hover:text-slate-800" onClick={() => setOpenBiddingCard("acquisition")}>Customer acquisition</p>
                    <p className="cursor-pointer hover:text-slate-800" onClick={() => setOpenBiddingCard("retention")}>Customer retention</p>
                    <p className="cursor-pointer hover:text-slate-800" onClick={() => setOpenBiddingCard("local")}>Local customer optimization</p>
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

              {/* Step 3: Asset group */}
              <div
                onClick={() => setWizardStep("ASSET_GROUP")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "ASSET_GROUP"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">3</div>
                <span>Asset group</span>
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

              {/* Step 5: Summary */}
              <div
                onClick={() => setWizardStep("SUMMARY")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "SUMMARY"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">5</div>
                <span>Summary</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto pb-28">
          
          {/* STEP 1: BIDDING */}
          {wizardStep === "BIDDING" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Bidding</h1>

              {/* CARD 1: Bidding */}
              {openBiddingCard === "bidding" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBiddingCard(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Bidding</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-semibold">What do you want to focus on?</label>
                      <select
                        value={biddingFocus}
                        onChange={(e) => setBiddingFocus(e.target.value as any)}
                        className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
                      >
                        <option value="Maximize conversions">Maximize conversions</option>
                        <option value="Target CPA">Target CPA</option>
                        <option value="Maximize conversion value">Maximize conversion value</option>
                        <option value="Target ROAS">Target ROAS</option>
                      </select>
                    </div>

                    {biddingFocus === "Target CPA" && (
                      <div className="pt-2 space-y-2 animate-in fade-in duration-150 max-w-md">
                        <label className="block text-slate-700 font-semibold">Target CPA</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                          <input
                            type="number"
                            value={targetCpaValue}
                            onChange={(e) => setTargetCpaValue(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                          Alternative bid strategies like portfolios are available in settings after you create your campaign
                        </p>
                      </div>
                    )}

                    {biddingFocus === "Target ROAS" && (
                      <div className="pt-2 space-y-2 animate-in fade-in duration-150 max-w-md">
                        <label className="block text-slate-700 font-semibold">Target ROAS</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={targetRoasValue}
                            onChange={(e) => setTargetRoasValue(e.target.value)}
                            placeholder="200"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                        </div>
                        <p className="text-[10px] text-amber-500 mt-1 leading-relaxed font-semibold">
                          Before opting into target ROAS, wait until the account that set up conversion tracking has received at least 15 conversions in the last 30 days.
                        </p>
                        <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                          Alternative bid strategies like portfolios are available in settings after you create your campaign
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setOpenBiddingCard("bidding")}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Bidding</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {biddingFocus}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* CARD 2: Customer Acquisition */}
              {openBiddingCard === "acquisition" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBiddingCard(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Customer acquisition</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-4 text-xs">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyBidNewCustomers}
                        onChange={(e) => setOnlyBidNewCustomers(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-900 block">Only bid for new customers</span>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Your campaign will be limited to only new customers, regardless of your bid strategy
                        </p>
                      </div>
                    </label>

                    <p className="text-slate-500 text-[11px] leading-relaxed pt-2 border-t border-slate-200">
                      By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers.{" "}
                      <a
                        href="https://support.google.com/google-ads/answer/12080169?hl=en_US"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn more about customer acquisition
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setOpenBiddingCard("acquisition")}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Customer acquisition</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {onlyBidNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* CARD 3: Customer Retention */}
              {openBiddingCard === "retention" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBiddingCard(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Customer retention</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <label
                        onClick={() => setAdjustLapsedCustomers(true)}
                        className="flex items-center gap-3 cursor-not-allowed group w-fit"
                      >
                        <input
                          type="checkbox"
                          disabled
                          checked={false}
                          className="rounded bg-slate-50 border-slate-300 text-slate-600 h-4 w-4 cursor-not-allowed disabled:opacity-60"
                        />
                        <span className="text-slate-600 font-medium">
                          Adjust your bidding to help re-engage lapsed customers
                        </span>
                      </label>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        You can’t bid higher for lapsed customers because you don’t have a purchase goal in your account. Add a purchase goal to run campaigns that bid higher for specific customer types.
                      </span>
                    </div>

                    <p className="text-slate-500 text-[11px] leading-relaxed pt-2 border-t border-slate-200">
                      By default, your campaign does not adjust bidding to win back lapsed customers. However, you can configure your customer retention settings to optimize for winning back lapsed customers.{" "}
                      <a
                        href="https://support.google.com/google-ads/answer/14792043?hl=en_US"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn more about how to win back lapsed customers
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setOpenBiddingCard("retention")}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Customer retention</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Do not adjust bidding to re-engage lapsed customers
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* CARD 4: Local Customer Optimization */}
              {openBiddingCard === "local" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBiddingCard(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Local customer optimization</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-4 text-xs">
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Show your ad to potential customers who are close to or interested in your business area and are ready to visit, contact, or book immediately.{" "}
                      <a
                        href="https://support.google.com/google-ads/answer/17198659?hl=en_US"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn more about local customer optimization
                      </a>
                    </p>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">
                        Turn on local customer optimization
                      </span>
                      <button
                        type="button"
                        onClick={() => setLocalCustomerOptimization(!localCustomerOptimization)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          localCustomerOptimization ? "bg-primary" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            localCustomerOptimization ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setOpenBiddingCard("local")}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Local customer optimization</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {localCustomerOptimization ? "On" : "Off"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="mb-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
                <p className="text-slate-500 mt-1">To reach the right people, start by defining key settings for your campaign</p>
              </div>

              {/* Locations */}
              {isLocationsOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                    <button 
                      type="button"
                      onClick={() => setIsLocationsOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-4 pt-1">
                    <p className="text-slate-500">Select locations for this campaign</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="wtPmaxLoc" checked={selectedLocation === "ALL"} onChange={() => setSelectedLocation("ALL")} className="text-primary h-4 w-4" />
                        <span>All countries and territories</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="wtPmaxLoc" checked={selectedLocation === "INDIA"} onChange={() => setSelectedLocation("INDIA")} className="text-primary h-4 w-4" />
                        <span>India</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="wtPmaxLoc" checked={selectedLocation === "CUSTOM"} onChange={() => setSelectedLocation("CUSTOM")} className="text-primary h-4 w-4" />
                        <span>Enter another location</span>
                      </label>
                    </div>

                    {selectedLocation === "CUSTOM" && (
                      <div className="pt-2 max-w-md">
                        <input
                          type="text"
                          value={customLocationInput}
                          onChange={(e) => setCustomLocationInput(e.target.value)}
                          placeholder="Enter a location (e.g. Mumbai, India)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        />
                      </div>
                    )}

                    {/* Location Options Accordion */}
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowLocationOptions(!showLocationOptions)}
                        className="flex items-center justify-between w-full py-1 text-slate-700 font-semibold cursor-pointer"
                      >
                        <span>Location options</span>
                        <Edit3 className="h-3.5 w-3.5 text-slate-400 hover:text-primary" />
                      </button>

                      {showLocationOptions && (
                        <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 animate-in fade-in duration-150">
                          <span className="font-semibold text-slate-800 block">Include</span>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="locTargetType"
                              checked={locationTargetingType === "PRESENCE_INTEREST"}
                              onChange={() => setLocationTargetingType("PRESENCE_INTEREST")}
                              className="mt-0.5 text-primary h-4 w-4"
                            />
                            <div>
                              <span className="font-semibold text-slate-800 block">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</span>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-2">
                            <input
                              type="radio"
                              name="locTargetType"
                              checked={locationTargetingType === "PRESENCE"}
                              onChange={() => setLocationTargetingType("PRESENCE")}
                              className="mt-0.5 text-primary h-4 w-4"
                            />
                            <div>
                              <span className="font-semibold text-slate-800 block">Presence: People in or regularly in your included locations</span>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsLocationsOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom locations"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* Languages */}
              {isLanguagesOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                    <button 
                      type="button"
                      onClick={() => setIsLanguagesOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-4 pt-1">
                    <p className="text-slate-500">Select the languages your target visitors speak.</p>

                    <div className="relative max-w-md">
                      <input
                        type="text"
                        value={languageSearchInput}
                        onChange={(e) => setLanguageSearchInput(e.target.value)}
                        placeholder="Start typing or select a language"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                      />

                      {/* API search results popup */}
                      {languageSearchInput.trim() !== "" && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-md z-30 max-h-48 overflow-y-auto py-1 text-xs">
                          {isSearchingLanguages ? (
                            <p className="px-4 py-2 text-slate-500 font-mono">Searching languages...</p>
                          ) : languageSearchResults.length > 0 ? (
                            languageSearchResults.map((lang, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setSelectedLanguages(prev => [...prev, lang]);
                                  setLanguageSearchInput("");
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 cursor-pointer flex items-center justify-between"
                              >
                                <span>{lang}</span>
                                <Plus className="h-3.5 w-3.5 text-primary" />
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-2 text-slate-500">No matching languages found</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedLanguages.map((lang, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
                          {lang}
                          <button type="button" onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== idx))}>
                            <X className="h-3 w-3 hover:text-rose-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsLanguagesOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {selectedLanguages.join(", ") || "All languages"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* EU political ads */}
              {isEUPoliticalAdsOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">EU political ads</h2>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsEUPoliticalAdsOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    <p className="text-slate-700">Does your campaign have European Union political ads?</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="euPolWT" checked={euPoliticalAds === "YES"} onChange={() => setEuPoliticalAds("YES")} className="text-primary h-4 w-4" />
                      <span>Yes, this campaign has EU political ads</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="euPolWT" checked={euPoliticalAds === "NO"} onChange={() => setEuPoliticalAds("NO")} className="text-primary h-4 w-4" />
                      <span>No, this campaign doesn't have EU political ads</span>
                    </label>
                    <p className="text-[11px] text-slate-500 pt-1">EU regulation requires Google to ask this question. Learn how an EU political ad is defined</p>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsEUPoliticalAdsOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56 flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">EU political ads</h2>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {euPoliticalAds === "YES" ? "Yes, has EU political ads" : "No, does not have EU political ads"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* More settings Section */}
              <div className="mt-4 space-y-4">
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm group"
                  onClick={() => setShowMoreCampaignSettings(!showMoreCampaignSettings)}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">More settings</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>

                {showMoreCampaignSettings && (
                <div className="rounded-2xl border border-slate-200 bg-white/40 divide-y divide-slate-800 overflow-hidden shadow-sm">

                {/* Ad schedule */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700">Ad schedule</h4>
                  
                  {adScheduleList.map((sched, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <select
                        value={sched.day}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].day = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
                      >
                        {["All days", "Mondays - Fridays", "Saturdays - Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"].map((day, i) => (
                          <option key={i} value={day}>{day}</option>
                        ))}
                      </select>

                      <select
                        value={sched.start}
                        onChange={(e) => {
                          const updated = [...adScheduleList];
                          updated[idx].start = e.target.value;
                          setAdScheduleList(updated);
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
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
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                      >
                        {["00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"].map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>

                      {adScheduleList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAdScheduleList(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-500 hover:text-rose-400 ml-auto"
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
                </div>

                {/* Start and end dates with Date Inputs */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Start and end dates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
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

                {/* Campaign URL options & Custom Parameters */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Campaign URL options</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold">Tracking template</label>
                      <input
                        type="text"
                        value={trackingTemplate}
                        onChange={(e) => setTrackingTemplate(e.target.value)}
                        placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold">Final URL suffix</label>
                      <input
                        type="text"
                        value={finalUrlSuffix}
                        onChange={(e) => setFinalUrlSuffix(e.target.value)}
                        placeholder="Example: param1=value1&param2=value2"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Page feeds */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Page feeds</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Add page feeds to specify which URLs to use in your campaign. With Final URL expansion on, you will use all URLs Google knows about your website, including any page feeds. By turning Final URL expansion off, you will only use URLs from your page feeds. Learn more about page feeds</p>
                </div>

                {/* Devices */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-700">Devices</h4>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">Required</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Choose the devices where your ads can appear.</p>
                </div>

                {/* Brand exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Brand exclusions</h4>
                  <p className="text-[11px] text-slate-500">Exclude brands so your ads won't show on searches that mention those brands. Learn more about brand exclusions</p>
                </div>

                {/* Demographic exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Demographic exclusions</h4>
                  <p className="text-[11px] text-slate-500">Demographic exclusions will override any specific hints that are active on any asset groups within this campaign.</p>
                </div>

                {/* Your data exclusions */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Your data exclusions</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary h-4 w-4" />
                    <span>Enable your data exclusions</span>
                  </label>
                </div>

              </div>
            )}
            </div>
          </div>
        )}

          {/* STEP 3: ASSET GROUP */}
          {wizardStep === "ASSET_GROUP" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="mb-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Asset group</h1>
                <p className="text-slate-500 mt-1">Show high quality ads to the right people. Start by adding your assets, the building blocks of every ad.</p>
              </div>

              {/* Asset Group Name & Final URL */}
              {isAssetGroupInfoOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold text-slate-900">Asset group name & Final URL</h2>
                    <button 
                      type="button" 
                      onClick={() => setIsAssetGroupInfoOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700">Asset group name</label>
                      <input type="text" value={assetGroupName} onChange={(e) => setAssetGroupName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Final URL</label>
                      <input type="text" value={finalUrl} onChange={(e) => setFinalUrl(e.target.value)} placeholder="https://www.example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsAssetGroupInfoOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Asset group info</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {assetGroupName} &bull; <span className="font-mono text-slate-600">{finalUrl || "No URL set"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* Assets Section */}
              {isAssetsSectionOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold text-slate-900">Assets</h2>
                    <button 
                      type="button" 
                      onClick={() => setIsAssetsSectionOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-4 pt-1">
                    <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 text-[11px]">
                      Google AI isn't able to generate assets for your final url. You can still add assets yourself. Let's start adding ad assets
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold text-slate-700">Ad strength</span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 font-bold border border-amber-500/30">Incomplete</span>
                    </div>

                    {/* Asset Input Rows */}
                    <div className="space-y-4 pt-3 border-t border-slate-200">
                      
                      {/* 1) Calls Section at Top */}
                      <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-700">Calls</h4>
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
                        <div className="flex items-center gap-2 font-mono text-slate-800 text-xs">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span>Account-level: 077099 36965</span>
                        </div>
                      </div>

                      {/* 2) Headlines */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Headlines ({headlines.length})</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const aiGens = Array.from({ length: headlines.length }, (_, i) => `AI Headline ${i + 1}: Website Traffic`);
                                setHeadlines(aiGens);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[11px] font-semibold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" /> Generate headlines using AI
                            </button>
                            <button type="button" onClick={() => setHeadlines(prev => [...prev, ""])} className="text-primary font-semibold text-[11px] hover:underline">+ Add headline</button>
                          </div>
                        </div>
                        {headlines.map((hl, i) => (
                          <div key={i} className="space-y-1">
                            <input type="text" value={hl} onChange={(e) => { const u = [...headlines]; u[i] = e.target.value; setHeadlines(u); }} maxLength={30} placeholder="Headline" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none" />
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Text is {hl.length} characters out of 30</span>
                              <span>{hl.length} / 30</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 3) Long Headlines */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Long headlines ({longHeadlines.length})</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const aiGens = Array.from({ length: longHeadlines.length }, (_, i) => `AI Long Headline ${i + 1}: Drive qualified website traffic and engage visitors.`);
                                setLongHeadlines(aiGens);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[11px] font-semibold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" /> Generate long headlines using AI
                            </button>
                            <button type="button" onClick={() => setLongHeadlines(prev => [...prev, ""])} className="text-primary font-semibold text-[11px] hover:underline">+ Add long headline</button>
                          </div>
                        </div>
                        {longHeadlines.map((lh, i) => (
                          <div key={i} className="space-y-1">
                            <input type="text" value={lh} onChange={(e) => { const u = [...longHeadlines]; u[i] = e.target.value; setLongHeadlines(u); }} maxLength={90} placeholder="Long headline" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none" />
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Text is {lh.length} characters out of 90</span>
                              <span>{lh.length} / 90</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 4) Descriptions */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Descriptions ({descriptions.length})</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const aiGens = Array.from({ length: descriptions.length }, (_, i) => `AI Description ${i + 1}: Engaging ad copy to increase website visits.`);
                                setDescriptions(aiGens);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[11px] font-semibold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" /> Generate descriptions using AI
                            </button>
                            <button type="button" onClick={() => setDescriptions(prev => [...prev, ""])} className="text-primary font-semibold text-[11px] hover:underline">+ Add description</button>
                          </div>
                        </div>
                        {descriptions.map((desc, i) => (
                          <div key={i} className="space-y-1">
                            <input type="text" value={desc} onChange={(e) => { const u = [...descriptions]; u[i] = e.target.value; setDescriptions(u); }} maxLength={90} placeholder="Description" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none" />
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Text is {desc.length} characters out of 90</span>
                              <span>{desc.length} / 90</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 5) Images, Videos, Animated Clips Uploads */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                        {/* Images */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-center">
                          <ImageIcon className="h-5 w-5 text-primary mx-auto" />
                          <span className="font-semibold text-slate-800 block text-xs">Images ({uploadedImages.length})</span>
                          <label className="block w-full py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 text-xs cursor-pointer">
                            + Add images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  const filesArr = Array.from(e.target.files).map(f => f.name);
                                  setUploadedImages(prev => [...prev, ...filesArr]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {uploadedImages.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center pt-1">
                              {uploadedImages.map((img, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 truncate max-w-[100px]">{img}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Videos */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-center">
                          <VideoIcon className="h-5 w-5 text-primary mx-auto" />
                          <span className="font-semibold text-slate-800 block text-xs">Videos ({uploadedVideos.length})</span>
                          <label className="block w-full py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 text-xs cursor-pointer">
                            + Add videos
                            <input
                              type="file"
                              accept="video/*"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  const filesArr = Array.from(e.target.files).map(f => f.name);
                                  setUploadedVideos(prev => [...prev, ...filesArr]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {uploadedVideos.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center pt-1">
                              {uploadedVideos.map((vid, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 truncate max-w-[100px]">{vid}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Animated clips */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-center">
                          <Upload className="h-5 w-5 text-primary mx-auto" />
                          <span className="font-semibold text-slate-800 block text-xs">Animated clips ({uploadedClips.length})</span>
                          <label className="block w-full py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 text-xs cursor-pointer">
                            + Add animated clips
                            <input
                              type="file"
                              accept=".gif,video/*,image/*"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  const filesArr = Array.from(e.target.files).map(f => f.name);
                                  setUploadedClips(prev => [...prev, ...filesArr]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {uploadedClips.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center pt-1">
                              {uploadedClips.map((clip, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 truncate max-w-[100px]">{clip}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Business Name */}
                      <div className="space-y-1 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Business name</span>
                          <span className="text-[10px] text-slate-500">Required</span>
                        </div>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={25} placeholder="Business name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none" />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Text is {businessName.length} characters out of 25</span>
                          <span>{businessName.length} / 25</span>
                        </div>
                      </div>

                      {/* 9) Call-to-action Dropdown */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <label className="block text-slate-700 font-semibold">Call-to-action</label>
                        <select
                          value={ctaOption}
                          onChange={(e) => setCtaOption(e.target.value)}
                          className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
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
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-700">Sitelinks ({savedSitelinks.length})</h4>
                          <button
                            type="button"
                            onClick={() => setActiveModal("SITELINKS")}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Create sitelink
                          </button>
                        </div>

                        {savedSitelinks.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {savedSitelinks.map((st, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                                {st.text}
                                <button type="button" onClick={() => setSavedSitelinks(prev => prev.filter((_, idx) => idx !== i))}>
                                  <X className="h-3 w-3 hover:text-rose-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {["Sitelink 1", "Sitelink 2", "Sitelink 3", "Sitelink 4"].map((s, i) => (
                              <button key={i} type="button" onClick={() => setActiveModal("SITELINKS")} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer">{s} (Recommended)</button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 7 & 8) More asset types with Live Display of Saved Assets */}
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-700">More asset types</h4>
                        <p className="text-[11px] text-slate-500">Improve your ad performance and make your ad more interactive by adding more details about your business and website</p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <button type="button" onClick={() => setActiveModal("PROMOTIONS")} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold hover:border-primary cursor-pointer">
                            + Promotions {savedPromotions.length > 0 && `(${savedPromotions.length})`}
                          </button>
                          <button type="button" onClick={() => setActiveModal("PRICES")} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold hover:border-primary cursor-pointer">
                            + Prices {savedPrices.length > 0 && `(${savedPrices.length})`}
                          </button>
                          <button type="button" onClick={() => setActiveModal("APPS")} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold hover:border-primary cursor-pointer">
                            + Messages {savedMessages.length > 0 && `(${savedMessages.length})`}
                          </button>
                          <button type="button" onClick={() => setActiveModal("SNIPPETS")} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold hover:border-primary cursor-pointer">
                            + Structured snippets {savedSnippets.length > 0 && `(${savedSnippets.length})`}
                          </button>
                          <button type="button" onClick={() => setActiveModal("LEAD_FORMS")} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold hover:border-primary cursor-pointer">
                            + Lead forms {savedLeadForms.length > 0 && `(${savedLeadForms.length})`}
                          </button>
                          <button type="button" onClick={() => setActiveModal("BRAND_GUIDELINES")} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold hover:border-primary cursor-pointer">
                            + Callouts {savedCallouts.length > 0 && `(${savedCallouts.length})`}
                          </button>
                        </div>

                        {/* Display active saved extensions */}
                        {(savedPromotions.length > 0 || savedPrices.length > 0 || savedSnippets.length > 0 || savedCallouts.length > 0) && (
                          <div className="pt-2 space-y-2">
                            <span className="text-[11px] text-slate-500 font-semibold block">Added Extensions:</span>
                            <div className="flex flex-wrap gap-2">
                              {savedPromotions.map((p, i) => (
                                <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-lg font-semibold">Promo: {p.item || "Discount"}</span>
                              ))}
                              {savedPrices.map((pr, i) => (
                                <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-lg font-semibold">Price: {pr.price}</span>
                              ))}
                              {savedCallouts.map((co, i) => (
                                <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-lg font-semibold">Callout: {co}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsAssetsSectionOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Assets</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {headlines.filter(h => h.trim()).length} headlines &bull; {descriptions.filter(d => d.trim()).length} descriptions &bull; {uploadedImages.length} images &bull; {uploadedVideos.length} videos
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* Asset optimization Card */}
              {isAssetOptimizationCardOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold text-slate-900">Asset optimization</h2>
                    <button 
                      type="button" 
                      onClick={() => setIsAssetOptimizationCardOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>

                  <div className="space-y-4 pt-1">
                    <p className="text-slate-500">To show more relevant ads, Google AI can enhance or generate assets using the information you’ve provided.</p>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={enableTextCustomization} onChange={(e) => setEnableTextCustomization(e.target.checked)} className="mt-0.5 rounded text-primary h-4 w-4" />
                        <div>
                          <span className="font-semibold text-slate-800 block">Text Customization</span>
                          <span className="text-[11px] text-slate-500 block">Use text from your site, landing pages, ads, and provided assets to create customized ad copy.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 border-t border-slate-200 pt-2.5">
                        <input type="checkbox" checked={enableFinalUrlExpansion} onChange={(e) => setEnableFinalUrlExpansion(e.target.checked)} className="mt-0.5 rounded text-primary h-4 w-4" />
                        <div>
                          <span className="font-semibold text-slate-800 block">Final URL expansion</span>
                          <span className="text-[11px] text-slate-500 block">Send traffic to the most relevant URLs on your site when it's likely to result in better performance.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsAssetOptimizationCardOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Asset optimization</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Text customization: {enableTextCustomization ? "On" : "Off"} &bull; Final URL expansion: {enableFinalUrlExpansion ? "On" : "Off"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}

              {/* Signals Card */}
              {isSignalsOpen ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold text-slate-900">Signals</h2>
                    <button 
                      type="button" 
                      onClick={() => setIsSignalsOpen(false)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-primary font-bold rounded-lg text-xs cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>

                  <div className="space-y-4 pt-1">
                    <p className="text-slate-500">Signals provide valuable information about the people you want to reach.</p>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">Search themes</h3>
                      <input type="text" placeholder="Add search themes (up to 50)" className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors shadow-sm animate-in fade-in duration-200 group"
                  onClick={() => setIsSignalsOpen(true)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-16">
                    <div className="w-56">
                      <h2 className="text-sm font-semibold text-slate-900">Signals</h2>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      No audience signal added (optional)
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          )}
          

          {/* STEP 4: BUDGET */}
          {wizardStep === "BUDGET" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Budget</h1>
              <p className="text-slate-500">Decide how much you want to spend.</p>

              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">Budget</h2>
                <p className="text-slate-500 leading-relaxed">Your budget type (daily or campaign total) can’t be changed once this campaign has started. You can change your budget amount at any time.</p>

                {/* Select Budget Type */}
                <div className="space-y-3 pt-2">
                  <label className="block font-semibold text-slate-700">Select budget type</label>
                  
                  <div className="space-y-3">
                    {/* Daily Budget Option */}
                    <label className={`block p-4 rounded-xl border transition-all cursor-pointer ${budgetType === "DAILY" ? "bg-primary/10 border-primary" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="pmaxBudgetType"
                          checked={budgetType === "DAILY"}
                          onChange={() => setBudgetType("DAILY")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block">Average daily budget</span>
                          <span className="text-[11px] text-slate-500 block">Set your average daily budget for this campaign</span>
                        </div>
                      </div>
                    </label>

                    {/* Campaign Total Budget Option */}
                    <label className={`block p-4 rounded-xl border transition-all cursor-pointer ${budgetType === "TOTAL" ? "bg-primary/10 border-primary" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="pmaxBudgetType"
                          checked={budgetType === "TOTAL"}
                          onChange={() => setBudgetType("TOTAL")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block">Campaign total budget</span>
                          <span className="text-[11px] text-slate-500 block">Set a budget for the duration of your campaign</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Budget Amount Input */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <label className="block font-semibold text-slate-700">
                    {budgetType === "DAILY" ? "Average daily budget amount" : "Campaign total budget amount"}
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-500">₹</span>
                    <input
                      type="text"
                      value={dailyBudgetValue}
                      onChange={(e) => setDailyBudgetValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:border-primary focus:outline-none"
                    />
                  </div>
                  {!dailyBudgetValue && <p className="text-rose-400 font-semibold text-[11px]">Value is required</p>}
                </div>

                {/* Campaign Dates Card for Campaign Total Budget */}
                {budgetType === "TOTAL" && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 pt-3 border-t border-slate-200">
                    <div>
                      <h4 className="font-semibold text-slate-800">Campaign dates</h4>
                      <p className="text-[11px] text-slate-500">To set a campaign total budget add the dates of your campaign</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Start date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">End date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-400 font-semibold leading-relaxed pt-1">
                      Your campaign total budget is what the campaign should spend over its runtime. To use a campaign total budget, you must add an end date for your campaign.
                    </p>
                  </div>
                )}

                {/* Monthly Spending Note */}
                <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                  For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Your campaign is almost ready to publish</h1>

              {/* Issues Card */}
              <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  <h2 className="text-sm font-bold text-rose-200">Issues</h2>
                </div>
                <p className="font-semibold text-rose-200">Fix these issues to run your campaign</p>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-rose-300">
                  <li><strong>Add a budget:</strong> To publish your campaign, enter a budget</li>
                  <li><strong>Final URL:</strong> Enter a valid URL (ex. https://www.example.com)</li>
                  <li><strong>Budget:</strong> Value is required</li>
                </ul>
              </div>

              {/* Recommendations Card */}
              <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <h2 className="text-sm font-bold text-slate-900">Recommendations</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px]">1 / 2</span>
                </div>
                <p className="text-slate-700">Apply these recommendations to optimize campaign performance</p>
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-800 mt-2">
                  <span className="font-bold block text-blue-400">Add sitelinks</span>
                  <span>Draw more attention to your ads by adding at least 4 sitelinks.</span>
                </div>
              </div>

              {/* Overview Section Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Campaign name</span>
                    <span className="font-bold text-slate-900 text-sm">Website Traffic-Performance Max-1</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Campaign type</span>
                    <span className="font-bold text-slate-900 text-sm">Performance Max</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500 block text-[11px]">Goal</span>
                    <span className="font-bold text-slate-900">Website Traffic</span>
                  </div>
                </div>
              </div>

              {/* Bidding Section Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-semibold text-slate-900">Bidding</h2>
                  <button
                    type="button"
                    onClick={() => setWizardStep("BIDDING")}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Bidding focus</span>
                    <span className="font-bold text-slate-900">{biddingFocus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Customer acquisition</span>
                    <span className="text-slate-800">Bid equally for new and existing customers</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Customer retention</span>
                    <span className="text-slate-800">Do not adjust bidding to re-engage lapsed customers</span>
                  </div>
                </div>
              </div>

              {/* Campaign settings Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-semibold text-slate-900">Campaign settings</h2>
                  <button
                    type="button"
                    onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Locations</span>
                    <span className="font-medium text-slate-800">{selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : "Custom locations"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Languages</span>
                    <span className="font-medium text-slate-800">{selectedLanguages.join(", ") || "English"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">EU political ads</span>
                    <span className="font-medium text-slate-800">{euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}</span>
                  </div>
                </div>
              </div>

              {/* Asset group Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-semibold text-slate-900">Asset group</h2>
                  <button
                    type="button"
                    onClick={() => setWizardStep("ASSET_GROUP")}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Asset group name</span>
                    <span className="font-bold text-slate-900">{assetGroupName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Final URL</span>
                    <span className={finalUrl ? "font-mono text-emerald-400" : "font-semibold text-rose-400"}>
                      {finalUrl || "Enter a valid URL (ex. https://www.example.com)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Assets</span>
                    <span className="text-slate-700">
                      {headlines.filter(h => h).length > 0 || descriptions.filter(d => d).length > 0 || uploadedImages.length > 0 || uploadedVideos.length > 0
                        ? `${headlines.filter(h => h).length} headlines, ${longHeadlines.filter(lh => lh).length} long headlines, ${descriptions.filter(d => d).length} descriptions, ${uploadedImages.length} images, ${uploadedVideos.length} videos`
                        : "No assets"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Asset optimization</span>
                    <span className="text-slate-800">
                      {enableTextCustomization ? "Text customization" : ""}{enableTextCustomization && enableFinalUrlExpansion ? ", " : ""}{enableFinalUrlExpansion ? "final URL expansion" : ""}, and 2 more are turned on
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Search themes</span>
                      <span className="text-slate-500 italic">{searchThemes.length > 0 ? searchThemes.join(", ") : "No signals provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Audience</span>
                      <span className="text-slate-500 italic">{audienceName || "No signal provided"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Summary Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-semibold text-slate-900">Budget</h2>
                  <button
                    type="button"
                    onClick={() => setWizardStep("BUDGET")}
                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Budget</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {budgetType === "TOTAL" ? `Campaign total: ₹${dailyBudgetValue || "0.00"}` : `Daily: ₹${dailyBudgetValue || "0.00"}`}
                  </span>
                  {!dailyBudgetValue && <p className="text-rose-400 font-semibold text-[11px] mt-1">Value is required</p>}
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
            else if (wizardStep === "BUDGET") setWizardStep("ASSET_GROUP");
            else if (wizardStep === "ASSET_GROUP") setWizardStep("CAMPAIGN_SETTINGS");
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
                else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("ASSET_GROUP");
                else if (wizardStep === "ASSET_GROUP") setWizardStep("BUDGET");
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
                alert(`Website Traffic Performance Max campaign published successfully!`);
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

      {/* ── Add Calls Modal ── */}
      {activeModal === "CALLS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add calls to your campaign</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Campaign-level calls: Add calls to this campaign. Any calls added here can be used across campaigns.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add new call Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800">Add new call</h4>
                <span className="text-[11px] text-emerald-400 font-semibold">Call reporting on, call recording off</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold">Country</label>
                  <select
                    value={callCountry}
                    onChange={(e) => setCallCountry(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                  >
                    <option value="United States">United States</option>
                    <option value="India (+91)">India (+91)</option>
                    <option value="United Kingdom (+44)">United Kingdom (+44)</option>
                    <option value="Canada (+1)">Canada (+1)</option>
                    <option value="Australia (+61)">Australia (+61)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-semibold">Phone number</label>
                  <input
                    type="text"
                    value={callPhone}
                    onChange={(e) => setCallPhone(e.target.value)}
                    placeholder="Example: (201) 555-0123"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Conversion action */}
              <div className="space-y-1">
                <label className="block text-slate-500 font-semibold">Conversion action</label>
                <select
                  value={callConvAction}
                  onChange={(e) => setCallConvAction(e.target.value)}
                  className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                >
                  <option value="Use account settings (Calls from ads)">Use account settings (Calls from ads)</option>
                  <option value="Calls from ads">Calls from ads</option>
                  <option value="None">None</option>
                  <option value="Manage conversions">Manage conversions</option>
                </select>
              </div>

              {/* Advanced options - Days and hours */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h5 className="font-semibold text-slate-700">Advanced options</h5>
                <label className="block text-[11px] text-slate-500 font-semibold">Days and hours</label>

                {callSchedules.map((sched, idx) => (
                  <div key={sched.id} className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                    <select
                      value={sched.day}
                      onChange={(e) => {
                        const updated = [...callSchedules];
                        updated[idx].day = e.target.value;
                        setCallSchedules(updated);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
                    >
                      {["All days", "Mondays - Fridays", "Saturdays - Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"].map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>

                    <select
                      value={sched.start}
                      onChange={(e) => {
                        const updated = [...callSchedules];
                        updated[idx].start = e.target.value;
                        setCallSchedules(updated);
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
                        const updated = [...callSchedules];
                        updated[idx].end = e.target.value;
                        setCallSchedules(updated);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
                    >
                      {["00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"].map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>

                    {callSchedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCallSchedules(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-500 hover:text-rose-400 ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setCallSchedules(prev => [...prev, { id: Date.now().toString(), day: "All days", start: "00:00", end: "00:00" }])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add schedules
                </button>

                <p className="text-[11px] text-slate-500 leading-relaxed">To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. Learn more</p>
                <p className="text-[11px] text-slate-500 font-mono">Based on account time zone: (GMT+05:30) India Standard Time</p>
              </div>
            </div>

            {/* Ad Preview Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-semibold text-slate-700">Preview</h4>
              <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-blue-400 font-semibold block">{callPhone || "(201) 555-0123"}</span>
                  <span className="text-slate-500 text-[10px]">Call now • Available during specified hours</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads. Please make sure that your provided assets don't violate any Google policies or applicable laws.</p>
            </div>

            {/* Account-level calls */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="font-semibold text-slate-800">Account-level calls</h4>
              <p className="text-[11px] text-slate-500">The following calls are from your account and will be used in this campaign.</p>
              <div className="flex items-center gap-2 pt-1 font-mono text-slate-800 font-bold text-xs">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>077099 36965</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Call asset saved for ${callPhone || "account level call"}`);
                  setActiveModal(null);
                }}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                Save Call Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sitelinks Modal ── */}
      {activeModal === "SITELINKS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Create sitelink</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Sitelink 1</h4>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Sitelink text</label>
                <input id="sitelinkTextInp" type="text" maxLength={25} placeholder="Sitelink text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description line 1 (recommended)</label>
                <input id="sitelinkDesc1Inp" type="text" maxLength={35} placeholder="Description line 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 35</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description line 2 (recommended)</label>
                <input id="sitelinkDesc2Inp" type="text" maxLength={35} placeholder="Description line 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 35</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Final URL</label>
                <input id="sitelinkUrlInp" type="text" placeholder="https://www.example.com/sitelink1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button type="button" className="text-primary font-bold text-xs hover:underline">+ Sitelink 2</button>
              <button
                type="button"
                onClick={() => {
                  const txt = (document.getElementById("sitelinkTextInp") as HTMLInputElement)?.value || "Sitelink 1";
                  const d1 = (document.getElementById("sitelinkDesc1Inp") as HTMLInputElement)?.value || "";
                  const d2 = (document.getElementById("sitelinkDesc2Inp") as HTMLInputElement)?.value || "";
                  const url = (document.getElementById("sitelinkUrlInp") as HTMLInputElement)?.value || "";
                  setSavedSitelinks(prev => [...prev, { text: txt, desc1: d1, desc2: d2, url }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Sitelinks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Promotions Modal ── */}
      {activeModal === "PROMOTIONS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add promotions to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level promotions: Add promotions to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Add new promotion</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Occasion</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>None</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>English</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Currency</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>USD ($)</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Promotion type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>Monetary discount ($)</option></select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold">Item</label>
                <input id="promoItemInp" type="text" maxLength={20} placeholder="Item name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500">Text is 0 characters out of 20</span>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold">Final URL</label>
                <input id="promoUrlInp" type="text" placeholder="https://www.example.com/promo" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono" />
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const item = (document.getElementById("promoItemInp") as HTMLInputElement)?.value || "Special Discount";
                  const url = (document.getElementById("promoUrlInp") as HTMLInputElement)?.value || "";
                  setSavedPromotions(prev => [...prev, { occasion: "None", item, discount: "Monetary", url }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Prices Modal ── */}
      {activeModal === "PRICES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add prices to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level prices: Add prices to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Add new price</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>English</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>Brands</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Currency</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>USD ($)</option></select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold">Price qualifier</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>No qualifier</option></select>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSavedPrices(prev => [...prev, { type: "Brands", price: "$49.99" }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages Modal ── */}
      {activeModal === "APPS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-md text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add messages to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level messages: Add messages to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Set up your message asset</h4>
              <div>
                <label className="block text-slate-500 font-semibold">Select message platform</label>
                <select id="msgPlatformSel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900">
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS / Text Message</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const plat = (document.getElementById("msgPlatformSel") as HTMLSelectElement)?.value || "WhatsApp";
                  setSavedMessages(prev => [...prev, { platform: plat }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Structured Snippets Modal ── */}
      {activeModal === "SNIPPETS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Create structured snippet</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Header Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>English</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Select header type</label>
                  <select id="snippetHeaderSel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>Amenities</option><option>Brands</option><option>Services</option></select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">Values</label>
                {["Value 1", "Value 2", "Value 3"].map((valLabel, idx) => (
                  <div key={idx} className="space-y-1">
                    <input type="text" maxLength={25} placeholder={valLabel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                    <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
                  </div>
                ))}
              </div>
              <button type="button" className="text-primary font-bold text-xs hover:underline">+ Add value</button>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const hdr = (document.getElementById("snippetHeaderSel") as HTMLSelectElement)?.value || "Services";
                  setSavedSnippets(prev => [...prev, { header: hdr, values: ["Custom Value 1", "Custom Value 2"] }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Structured Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lead Forms Modal ── */}
      {activeModal === "LEAD_FORMS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add a lead form to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level lead forms: Add lead forms to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800">Create your lead form</h4>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Headline</label>
                <input id="lfHeadlineInp" type="text" maxLength={30} placeholder="Headline" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 30</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Business name</label>
                <input id="lfBizInp" type="text" maxLength={25} placeholder="Business name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description</label>
                <textarea rows={3} maxLength={200} placeholder="Description" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 200</span>
              </div>

              {/* Questions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="font-semibold text-slate-700">Contact information</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {["Name", "Email", "Phone number", "Country", "City", "Zip/Postal code"].map((f, i) => (
                    <label key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input type="checkbox" defaultChecked className="rounded text-primary h-3.5 w-3.5" />
                      <span>{f} (Pre-filled)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Submission Message */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="font-semibold text-slate-700">Form submission message</h5>
                <div className="space-y-1">
                  <label className="block text-slate-500 text-[11px]">Headline</label>
                  <input type="text" defaultValue="Thank you." maxLength={30} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  <span className="text-[10px] text-slate-500 block">Text is 10 characters out of 30</span>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 text-[11px]">Description</label>
                  <input type="text" defaultValue="We'll contact you soon." maxLength={200} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  <span className="text-[10px] text-slate-500 block">Text is 23 characters out of 200</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const hl = (document.getElementById("lfHeadlineInp") as HTMLInputElement)?.value || "Lead Form";
                  const biz = (document.getElementById("lfBizInp") as HTMLInputElement)?.value || "Business";
                  setSavedLeadForms(prev => [...prev, { headline: hl, business: biz }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Lead Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Callouts Modal ── */}
      {activeModal === "BRAND_GUIDELINES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add callouts to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level callouts: Add callouts to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Add new callout</h4>
              {["Callout text 1", "Callout text 2", "Callout text 3", "Callout text 4"].map((ct, idx) => (
                <div key={idx} className="space-y-1">
                  <input id={`calloutInp-${idx}`} type="text" maxLength={25} placeholder={ct} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <h5 className="font-semibold text-slate-700">Advanced options - Days and hours</h5>
                <div className="flex flex-wrap items-center gap-3">
                  <select defaultValue="All days" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"><option>All days</option></select>
                  <select defaultValue="00:00" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"><option>00:00</option></select>
                  <span className="text-slate-500">to</span>
                  <select defaultValue="00:00" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"><option>00:00</option></select>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button type="button" className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline">+ Add schedules</button>
              <button
                type="button"
                onClick={() => {
                  const co1 = (document.getElementById("calloutInp-0") as HTMLInputElement)?.value || "Fast Shipping";
                  setSavedCallouts(prev => [...prev, co1]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Callouts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sitelinks Modal ── */}
      {activeModal === "SITELINKS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Create sitelink</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800">Sitelink 1</h4>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Sitelink text</label>
                <input id="sitelinkTextInp" type="text" maxLength={25} placeholder="Sitelink text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description line 1 (recommended)</label>
                <input id="sitelinkDesc1Inp" type="text" maxLength={35} placeholder="Description line 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 35</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description line 2 (recommended)</label>
                <input id="sitelinkDesc2Inp" type="text" maxLength={35} placeholder="Description line 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 35</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Final URL</label>
                <input id="sitelinkUrlInp" type="text" placeholder="https://www.example.com/sitelink1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button type="button" className="text-primary font-bold text-xs hover:underline">+ Sitelink 2</button>
              <button
                type="button"
                onClick={() => {
                  const txt = (document.getElementById("sitelinkTextInp") as HTMLInputElement)?.value || "Sitelink 1";
                  const d1 = (document.getElementById("sitelinkDesc1Inp") as HTMLInputElement)?.value || "";
                  const d2 = (document.getElementById("sitelinkDesc2Inp") as HTMLInputElement)?.value || "";
                  const url = (document.getElementById("sitelinkUrlInp") as HTMLInputElement)?.value || "";
                  setSavedSitelinks(prev => [...prev, { text: txt, desc1: d1, desc2: d2, url }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Sitelinks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Promotions Modal ── */}
      {activeModal === "PROMOTIONS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add promotions to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level promotions: Add promotions to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Add new promotion</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Occasion</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>None</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>English</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Currency</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>USD ($)</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Promotion type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>Monetary discount ($)</option></select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold">Item</label>
                <input id="promoItemInp" type="text" maxLength={20} placeholder="Item name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500">Text is 0 characters out of 20</span>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold">Final URL</label>
                <input id="promoUrlInp" type="text" placeholder="https://www.example.com/promo" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono" />
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const item = (document.getElementById("promoItemInp") as HTMLInputElement)?.value || "Special Discount";
                  const url = (document.getElementById("promoUrlInp") as HTMLInputElement)?.value || "";
                  setSavedPromotions(prev => [...prev, { occasion: "None", item, discount: "Monetary", url }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Prices Modal ── */}
      {activeModal === "PRICES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add prices to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level prices: Add prices to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Add new price</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>English</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>Brands</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Currency</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>USD ($)</option></select>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold">Price qualifier</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>No qualifier</option></select>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSavedPrices(prev => [...prev, { type: "Brands", price: "$49.99" }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages Modal ── */}
      {activeModal === "APPS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-md text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add messages to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level messages: Add messages to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Set up your message asset</h4>
              <div>
                <label className="block text-slate-500 font-semibold">Select message platform</label>
                <select id="msgPlatformSel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900">
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS / Text Message</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const plat = (document.getElementById("msgPlatformSel") as HTMLSelectElement)?.value || "WhatsApp";
                  setSavedMessages(prev => [...prev, { platform: plat }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Structured Snippets Modal ── */}
      {activeModal === "SNIPPETS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Create structured snippet</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold">Header Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"><option>English</option></select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold">Select header type</label>
                  <select id="snippetHeaderSel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"><option>Amenities</option><option>Brands</option><option>Services</option></select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">Values</label>
                {["Value 1", "Value 2", "Value 3"].map((valLabel, idx) => (
                  <div key={idx} className="space-y-1">
                    <input type="text" maxLength={25} placeholder={valLabel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                    <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
                  </div>
                ))}
              </div>
              <button type="button" className="text-primary font-bold text-xs hover:underline">+ Add value</button>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const hdr = (document.getElementById("snippetHeaderSel") as HTMLSelectElement)?.value || "Services";
                  setSavedSnippets(prev => [...prev, { header: hdr, values: ["Custom Value 1", "Custom Value 2"] }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Structured Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lead Forms Modal ── */}
      {activeModal === "LEAD_FORMS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add a lead form to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level lead forms: Add lead forms to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800">Create your lead form</h4>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Headline</label>
                <input id="lfHeadlineInp" type="text" maxLength={30} placeholder="Headline" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 30</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Business name</label>
                <input id="lfBizInp" type="text" maxLength={25} placeholder="Business name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Description</label>
                <textarea rows={3} maxLength={200} placeholder="Description" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900" />
                <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 200</span>
              </div>

              {/* Questions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="font-semibold text-slate-700">Contact information</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {["Name", "Email", "Phone number", "Country", "City", "Zip/Postal code"].map((f, i) => (
                    <label key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input type="checkbox" defaultChecked className="rounded text-primary h-3.5 w-3.5" />
                      <span>{f} (Pre-filled)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Submission Message */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="font-semibold text-slate-700">Form submission message</h5>
                <div className="space-y-1">
                  <label className="block text-slate-500 text-[11px]">Headline</label>
                  <input type="text" defaultValue="Thank you." maxLength={30} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  <span className="text-[10px] text-slate-500 block">Text is 10 characters out of 30</span>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 text-[11px]">Description</label>
                  <input type="text" defaultValue="We'll contact you soon." maxLength={200} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  <span className="text-[10px] text-slate-500 block">Text is 23 characters out of 200</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const hl = (document.getElementById("lfHeadlineInp") as HTMLInputElement)?.value || "Lead Form";
                  const biz = (document.getElementById("lfBizInp") as HTMLInputElement)?.value || "Business";
                  setSavedLeadForms(prev => [...prev, { headline: hl, business: biz }]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Lead Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Callouts Modal ── */}
      {activeModal === "BRAND_GUIDELINES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-md text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add callouts to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level callouts: Add callouts to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Add new callout</h4>
              {["Callout text 1", "Callout text 2", "Callout text 3", "Callout text 4"].map((ct, idx) => (
                <div key={idx} className="space-y-1">
                  <input id={`calloutInp-${idx}`} type="text" maxLength={25} placeholder={ct} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900" />
                  <span className="text-[10px] text-slate-500 block">Text is 0 characters out of 25</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <h5 className="font-semibold text-slate-700">Advanced options - Days and hours</h5>
                <div className="flex flex-wrap items-center gap-3">
                  <select defaultValue="All days" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"><option>All days</option></select>
                  <select defaultValue="00:00" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"><option>00:00</option></select>
                  <span className="text-slate-500">to</span>
                  <select defaultValue="00:00" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"><option>00:00</option></select>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button type="button" className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline">+ Add schedules</button>
              <button
                type="button"
                onClick={() => {
                  const co1 = (document.getElementById("calloutInp-0") as HTMLInputElement)?.value || "Fast Shipping";
                  setSavedCallouts(prev => [...prev, co1]);
                  setActiveModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-bold hover:bg-secondary cursor-pointer transition-all"
              >
                Save Callouts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save as a campaign draft Modal ── */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Save as a campaign draft?</h3>
                <p className="text-xs text-slate-500">Come back later to edit or complete this campaign</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your campaign progress will be saved as a draft so you can resume anytime.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDraftModal(false);
                  router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={isSavingDraft}
                onClick={handleSaveDraft}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-primary hover:bg-secondary transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingDraft ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
