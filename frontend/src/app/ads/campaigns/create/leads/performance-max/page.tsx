"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Search, LayoutGrid, Zap, AlertCircle, ChevronDown, ChevronUp, Info, Sparkles, Image as ImageIcon, Video as VideoIcon, Upload, Phone, DollarSign, Tag, FileText, MessageSquare, Smartphone, SlidersHorizontal, Globe, Users, Settings, Edit3, Lock
} from "lucide-react";

export default function LeadsPerformanceMaxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY"
  const [wizardStep, setWizardStep] = useState<"BIDDING" | "CAMPAIGN_SETTINGS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY">("BIDDING");

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
  const [showMoreSettings, setShowMoreSettings] = useState<boolean>(false);
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "12:00 AM", end: "12:00 AM" }
  ]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>("");

  // Step 3: Asset Group State
  const [assetGroupName, setAssetGroupName] = useState<string>("Asset Group 1");
  const [businessName, setBusinessName] = useState<string>("");
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [headlines, setHeadlines] = useState<string[]>([""]);
  const [longHeadlines, setLongHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedLogos, setUploadedLogos] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [ctaOption, setCtaOption] = useState<string>("GET_QUOTE");
  const [searchThemes, setSearchThemes] = useState<string[]>([]);
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");

  // Modals State
  const [activeModal, setActiveModal] = useState<
    "SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | null
  >(null);

  // Modal 1: Sitelinks State
  const [sitelinks, setSitelinks] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([
    { text: "", desc1: "", desc2: "", url: "" }
  ]);

  // Modal 2: Calls State
  const [callCountry, setCallCountry] = useState<string>("India (+91)");
  const [callPhone, setCallPhone] = useState<string>("");

  // Modal 6: Lead Forms State
  const [leadHeadline, setLeadHeadline] = useState<string>("Get a free quote today");
  const [leadBusiness, setLeadBusiness] = useState<string>("");
  const [leadDesc, setLeadDesc] = useState<string>("Fill in your details below and our team will get in touch with you shortly.");

  // Modal 8: Brand Guidelines State
  const [brandBusinessName, setBrandBusinessName] = useState<string>("");
  const [brandMainColor, setBrandMainColor] = useState<string>("#000000");
  const [brandAccentColor, setBrandAccentColor] = useState<string>("#3b82f6");

  // Modal 9: Audience Signal State
  const [audienceSignalName, setAudienceSignalName] = useState<string>("");
  const [audGender, setAudGender] = useState<{ female: boolean; male: boolean; unknown: boolean }>({ female: true, male: true, unknown: true });

  // Step 4: Budget State
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [selectedPresetBudget, setSelectedPresetBudget] = useState<string>("5080.90");
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("");

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
    ? Number(customBudgetValue.replace(/,/g, "")) || 5080.90
    : Number(selectedPresetBudget) || 5080.90;

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
            <span className="text-slate-400">Leads</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Performance Max Setup
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
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Performance Max</span>
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

              {/* Step 3: Asset group */}
              <div
                onClick={() => setWizardStep("ASSET_GROUP")}
                className={`p-2.5 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "ASSET_GROUP"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
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
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
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
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">5</div>
                <span>Summary</span>
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
                  <label className="block text-slate-300 font-semibold">What do you want to focus on for generating leads?</label>
                  <select
                    value={biddingFocus}
                    onChange={(e) => setBiddingFocus(e.target.value as any)}
                    className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium"
                  >
                    <optgroup label="Recommended for lead generation">
                      <option value="Conversions">Conversions (Get more leads)</option>
                      <option value="Conversion value">Conversion value (Maximize lead value)</option>
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
                        To bid only for new leads, you must select an existing lead audience segment with at least 100 active members in the last 30 days.{" "}
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
                    <span className="text-slate-200 font-medium">Adjust your bidding to help re-engage lapsed leads</span>
                  </label>

                  <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                    A lead conversion goal is required to bid higher for lapsed contacts than for existing active leads. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
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
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchPartnersNetwork}
                      onChange={(e) => setSearchPartnersNetwork(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Google Search Partners Network (recommended)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={displayNetwork}
                      onChange={(e) => setDisplayNetwork(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Google Display Network (recommended)</span>
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
                      name="leadsPmaxLoc"
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">All countries and territories</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="leadsPmaxLoc"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">India</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="leadsPmaxLoc"
                      checked={selectedLocation === "CUSTOM"}
                      onChange={() => setSelectedLocation("CUSTOM")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-medium">Enter another location</span>
                  </label>
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
                      onChange={(e) => setLanguageSearchInput(e.target.value)}
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
                      name="leadsEuPol"
                      checked={euPoliticalAds === "YES"}
                      onChange={() => setEuPoliticalAds("YES")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200">Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="leadsEuPol"
                      checked={euPoliticalAds === "NO"}
                      onChange={() => setEuPoliticalAds("NO")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200">No, this campaign doesn't have EU political ads</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ASSET GROUP */}
          {wizardStep === "ASSET_GROUP" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Leads Asset Group Setup</h1>
                <button
                  type="button"
                  onClick={() => setActiveModal("LEAD_FORMS")}
                  className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Attach Lead Form
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                {/* Asset Group Name */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Asset Group Name</label>
                  <input
                    type="text"
                    value={assetGroupName}
                    onChange={(e) => setAssetGroupName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Final URL & Business Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Final URL <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={finalUrl}
                      onChange={(e) => setFinalUrl(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-300">Business Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Business Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Headlines */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-200">Headlines (Max 15)</h3>
                    <span className="text-[11px] text-slate-400">Max 30 characters each</span>
                  </div>
                  {headlines.map((hl, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={hl}
                      onChange={(e) => {
                        const updated = [...headlines];
                        updated[idx] = e.target.value;
                        setHeadlines(updated);
                      }}
                      maxLength={30}
                      placeholder="Get a Free Consultation"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary"
                    />
                  ))}
                  {headlines.length < 15 && (
                    <button type="button" onClick={() => setHeadlines(prev => [...prev, ""])} className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer">+ Add headline</button>
                  )}
                </div>

                {/* Lead Form Modal Quick Trigger */}
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Lead Form Extension Attached</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">Collect lead info directly from your Performance Max ads</p>
                  </div>
                  <button type="button" onClick={() => setActiveModal("LEAD_FORMS")} className="px-3.5 py-1.5 rounded-lg bg-primary text-slate-950 font-bold text-xs">Configure Form</button>
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
                  <label className="block font-semibold text-slate-200">Set your average daily budget for this Lead Generation campaign</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div onClick={() => setSelectedPresetBudget("5080.90")} className={`p-4 rounded-xl border cursor-pointer ${selectedPresetBudget === "5080.90" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950"}`}>
                      <span className="text-xs text-slate-400 block">Recommended</span>
                      <span className="text-lg font-bold text-white block mt-1">₹5,080.90</span>
                    </div>
                    <div onClick={() => setSelectedPresetBudget("4064.72")} className={`p-4 rounded-xl border cursor-pointer ${selectedPresetBudget === "4064.72" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950"}`}>
                      <span className="text-xs text-slate-400 block">Balanced</span>
                      <span className="text-lg font-bold text-white block mt-1">₹4,064.72</span>
                    </div>
                    <div onClick={() => setSelectedPresetBudget("CUSTOM")} className={`p-4 rounded-xl border cursor-pointer ${selectedPresetBudget === "CUSTOM" ? "border-primary bg-primary/10" : "border-slate-800 bg-slate-950"}`}>
                      <span className="text-xs text-slate-400 block">Custom</span>
                      <span className="text-lg font-bold text-white block mt-1">Set custom</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Leads Campaign Review</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6 shadow-xl text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-semibold text-white">Leads - Performance Max</h2>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">Ready to Publish</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Objective</span>
                    <p className="text-slate-100 font-bold">Leads</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                    <span className="text-slate-400 font-semibold block">Budget</span>
                    <p className="text-slate-100 font-bold">₹{activeBudgetValue}/day</p>
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
            else if (wizardStep === "BUDGET") setWizardStep("ASSET_GROUP");
            else if (wizardStep === "ASSET_GROUP") setWizardStep("CAMPAIGN_SETTINGS");
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
                alert(`Leads Performance Max campaign "${assetGroupName}" published successfully!`);
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

      {/* Modal 6: Lead Forms Modal */}
      {activeModal === "LEAD_FORMS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">Lead Form Extension</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold">Headline (Max 30)</label>
                <input type="text" value={leadHeadline} onChange={(e) => setLeadHeadline(e.target.value)} maxLength={30} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold">Description (Max 200)</label>
                <textarea rows={3} value={leadDesc} onChange={(e) => setLeadDesc(e.target.value)} maxLength={200} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold">Save Lead Form</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
