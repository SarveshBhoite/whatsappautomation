"use client";
import { useState } from "react";
import {
  Sparkles, CheckCircle, AlertCircle, Loader2, X, RefreshCw, Zap,
  Globe, Tag, Link2, Phone, LayoutGrid, Info, PlusCircle, ArrowUpRight,
  Calendar, Settings, Users, Layers, FileText, ChevronDown, Check
} from "lucide-react";

interface EngagementCampaignFlowProps {
  orgId: string;
  backendUrl: string;
  fetchedPages: any[];
  fetchedIgAccounts: any[];
  fetchedWaNumbers: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function EngagementCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  fetchedWaNumbers,
  onClose,
  onPublished,
}: EngagementCampaignFlowProps) {
  // Step Navigation State (1: Campaign Level, 2: Ad Set Level, 3: Ad Level)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // ── STEP 1: CAMPAIGN LEVEL STATE ──
  const [campName, setCampName] = useState("New Engagement campaign");
  const [buyingType, setBuyingType] = useState<"AUCTION" | "RESERVATION">("AUCTION");
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [cboEnabled, setCboEnabled] = useState(true);
  const [budgetStrategy, setBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [budgetAmount, setBudgetAmount] = useState("1000");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [budgetScheduling, setBudgetScheduling] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [frequencyMode, setFrequencyMode] = useState<"TARGET" | "CAP">("CAP");
  const [frequencyCapCount, setFrequencyCapCount] = useState(2);
  const [frequencyCapDays, setFrequencyCapDays] = useState(7);
  const [abTestEnabled, setAbTestEnabled] = useState(false);

  // ── STEP 2: AD SET LEVEL STATE ──
  const [adSetName, setAdSetName] = useState("New Engagement ad set");
  const [conversionLocation, setConversionLocation] = useState("MESSAGING_APPS");
  const [engagementType, setEngagementType] = useState("VIDEO_VIEWS");
  const [performanceGoal, setPerformanceGoal] = useState("MAXIMIZE_THRUPLAY_VIEWS");
  const [locations, setLocations] = useState<string[]>(["India"]);
  const [minAge, setMinAge] = useState(18);
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [placementsAdvantage, setPlacementsAdvantage] = useState(true);

  // ── STEP 3: AD LEVEL STATE ──
  const [adName, setAdName] = useState("New Engagement ad");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccountId, setInstagramAccountId] = useState(fetchedIgAccounts[0]?.id || "jisnu_digitalsolution_pvt_ltd");
  const [threadsProfile, setThreadsProfile] = useState("USE_INSTAGRAM");
  const [whatsappNumber, setWhatsappNumber] = useState(fetchedWaNumbers[0]?.displayPhoneNumber || "+91 77099 36965");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);
  const [destinationType, setDestinationType] = useState("MESSAGING_APPS");
  const [mediaUrl, setMediaUrl] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [callToAction, setCallToAction] = useState("WHATSAPP_MESSAGE");
  const [urlParameters, setUrlParameters] = useState("key1=value1&key2=value2");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["ALL"]);

  // Publishing & Toast State
  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Live Meta Graph API Search state for Geo Locations & Detailed Targeting
  const [locQuery, setLocQuery] = useState("");
  const [locResults, setLocResults] = useState<any[]>([]);
  const [searchingLoc, setSearchingLoc] = useState(false);
  const [showLocDropdown, setShowLocDropdown] = useState(false);

  const [targetingQuery, setTargetingQuery] = useState("");
  const [targetingResults, setTargetingResults] = useState<any[]>([]);
  const [searchingTargeting, setSearchingTargeting] = useState(false);
  const [showTargetingDropdown, setShowTargetingDropdown] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<any[]>([]);

  // Search Meta Geo Locations via Graph API
  const handleSearchLocations = async (q: string) => {
    setLocQuery(q);
    if (!q.trim()) {
      setLocResults([]);
      setShowLocDropdown(false);
      return;
    }
    setSearchingLoc(true);
    setShowLocDropdown(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/search/locations?organizationId=${orgId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) setLocResults(data.results);
    } catch (e) {
      console.warn("Location search error:", e);
    } finally {
      setSearchingLoc(false);
    }
  };

  // Search Meta Detailed Targeting (Interests, Demographics, Behaviors) via Graph API
  const handleSearchTargeting = async (q: string) => {
    setTargetingQuery(q);
    if (!q.trim()) {
      setTargetingResults([]);
      setShowTargetingDropdown(false);
      return;
    }
    setSearchingTargeting(true);
    setShowTargetingDropdown(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/search/targeting?organizationId=${orgId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) setTargetingResults(data.results);
    } catch (e) {
      console.warn("Targeting search error:", e);
    } finally {
      setSearchingTargeting(false);
    }
  };

  const [langQuery, setLangQuery] = useState("");
  const [langResults, setLangResults] = useState<any[]>([]);
  const [searchingLang, setSearchingLang] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Search Meta Languages (Ad Locales) via Graph API
  const handleSearchLanguages = async (q: string) => {
    setLangQuery(q);
    if (!q.trim()) {
      setLangResults([]);
      setShowLangDropdown(false);
      return;
    }
    setSearchingLang(true);
    setShowLangDropdown(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/search/languages?organizationId=${orgId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results) setLangResults(data.results);
    } catch (e) {
      console.warn("Language search error:", e);
    } finally {
      setSearchingLang(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handlePublish = async () => {
    if (!campName.trim() || !adSetName.trim() || !adName.trim()) {
      showToast("Please fill in Campaign, Ad Set, and Ad names.");
      return;
    }

    if (conversionLocation === "ON_AD" && engagementType === "VIDEO_VIEWS" && !mediaUrl.trim()) {
      showToast("A video URL/file is required for Video Views.");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_ENGAGEMENT",
          buyingType,
          specialAdCategory,
          cboEnabled,
          bidStrategy,
          dailyBudget: Number(budgetAmount),
          adSetName,
          conversionLocation,
          engagementType,
          performanceGoal,
          adName,
          targeting: {
            locations,
            minAge,
            interests: selectedInterests.map(i => i.name),
            detailedTargeting: detailedTargeting || selectedInterests.map(i => i.name).join(", "),
          },
          facebookPageId,
          instagramAccountId,
          whatsappNumber,
          partnershipAdEnabled: partnershipAd,
          multiAdvertiserAdsEnabled: multiAdvertiser,
          destinationType,
          creativeHeadline: headline || "Chat with us on WhatsApp",
          creativeBody: primaryText || "Transform your business with high-converting Meta ads.",
          creativeDescription: description,
          creativeMediaUrl: mediaUrl || "https://example.com/video.mp4",
          callToAction,
          urlParameters,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Campaign publish failed.");

      showToast("Engagement Campaign created & published live to Meta! 🚀");
      onPublished();
    } catch (err: any) {
      showToast(`Publish error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 overflow-hidden animate-fadeIn">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-2xl flex items-center gap-2">
          <span>⚡</span> {toastMessage}
        </div>
      )}

      {/* ── Top Header Navigation Bar ── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Close Campaign Editor"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600">Meta Ads Manager</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">Engagement Setup</span>
            </div>
            <h1 className="font-bold text-slate-900 text-sm">{campName || "New Engagement campaign"}</h1>
          </div>
        </div>

        {/* 3 Step Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveStep(1)}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 1 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            1. Campaign Level
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 2 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            2. Ad Set Level
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 3 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            3. Ad Level
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
            In draft
          </span>
        </div>
      </header>

      {/* ── Main Workspace Body (2/3 Editor, 1/3 Preview & Metrics) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center Workspace Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-slate-200 max-w-4xl mx-auto">
          {/* ── STEP 1: CAMPAIGN LEVEL ── */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Campaign Header Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Campaign Overview</h3>
                  <p className="text-xs text-slate-500 mt-0.5">1 Campaign · 1 Ad set · 1 Ad</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-xs text-blue-600 hover:underline font-bold cursor-pointer">Edit</button>
                  <button type="button" className="text-xs text-blue-600 hover:underline font-bold cursor-pointer">Review</button>
                </div>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign name</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New Engagement campaign"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Special Ad Categories */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Special Ad Categories</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country. <button type="button" className="text-blue-600 hover:underline font-bold cursor-pointer">About Special Ad Categories</button>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Categories</label>
                  <select
                    value={specialAdCategory}
                    onChange={(e) => setSpecialAdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="NONE">Declare category if applicable</option>
                    <option value="CREDIT">Financial products and services (Credit)</option>
                    <option value="EMPLOYMENT">Employment</option>
                    <option value="HOUSING">Housing</option>
                    <option value="ISSUES_ELECTIONS_POLITICS">Social issues, elections or politics</option>
                  </select>
                </div>
              </div>

              {/* Buying Type */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Buying type</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setBuyingType("AUCTION")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${buyingType === "AUCTION" ? "bg-blue-50/70 border-blue-500 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}
                  >
                    <p className="text-xs font-bold text-slate-900">Auction</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Flexible bidding across Meta feeds & placements.</p>
                  </div>
                  <div
                    onClick={() => setBuyingType("RESERVATION")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${buyingType === "RESERVATION" ? "bg-blue-50/70 border-blue-500 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}
                  >
                    <p className="text-xs font-bold text-slate-900">Reservation</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Reserved reach and frequency booking.</p>
                  </div>
                </div>
              </div>

              {/* Budget & Strategy Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">Advantage+ campaign budget</h4>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">Advantage+ on</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automatically distribute your budget to the best opportunities across your campaign. <button type="button" className="text-blue-600 hover:underline font-bold">About campaign budget</button></p>
                  </div>
                </div>

                {/* Budget Strategy Switch */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Budget strategy</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setBudgetStrategy("CAMPAIGN")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${budgetStrategy === "CAMPAIGN" ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">Campaign budget</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Automatically distribute budget to best opportunities.</p>
                    </div>
                    <div
                      onClick={() => setBudgetStrategy("ADSET")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${budgetStrategy === "ADSET" ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">Ad set budget</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Set different bid strategies or budget schedules for each ad set.</p>
                    </div>
                  </div>
                </div>

                {/* Budget Mode & Currency Amount */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-400">Budget</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={budgetMode}
                      onChange={(e) => setBudgetMode(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="DAILY">Daily budget</option>
                      <option value="LIFETIME">Lifetime budget</option>
                    </select>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-400">INR</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                    You'll spend an average of <span className="font-bold text-slate-900">₹{Number(budgetAmount || 1000).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> per day. Your maximum daily spend is <span className="font-bold text-slate-900">₹{(Number(budgetAmount || 1000) * 1.75).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span> and your maximum weekly spend is <span className="font-bold text-slate-900">₹{(Number(budgetAmount || 1000) * 7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>. <button type="button" className="text-blue-600 hover:underline font-bold">About daily budget</button>
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium">⚠ Your spending may exceed ₹{Number(budgetAmount || 1000).toLocaleString("en-IN")} the first few days.</p>
                </div>

                {/* Campaign Bid Strategy */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Campaign bid strategy</label>
                    <button type="button" className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer">Edit</button>
                  </div>
                  <select
                    value={bidStrategy}
                    onChange={(e) => setBidStrategy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HIGHEST_VOLUME">Highest volume (Get the most results for your budget)</option>
                    <option value="COST_CAP">Cost per result goal (Aim for a certain cost per result while maximising volume)</option>
                    <option value="BID_CAP">Bid cap (Set the highest that you want to bid in any auction)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMoreSettings(!showMoreSettings)}
                  className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  {showMoreSettings ? "Hide settings" : "Show more settings"}
                </button>

                {/* Expanded Show More Settings */}
                {showMoreSettings && (
                  <div className="pt-3 border-t border-slate-100 space-y-4 animate-fadeIn">
                    {/* Budget scheduling */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">Budget scheduling</h5>
                          <p className="text-[11px] text-slate-500">Increase your budget during specific days or times.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={budgetScheduling} onChange={(e) => setBudgetScheduling(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Ad scheduling */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-900 text-xs">Ad scheduling</h5>
                        <button type="button" className="text-[11px] text-blue-600 hover:underline font-bold">Edit</button>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Run ads all the time</p>
                    </div>

                    {/* Campaign Frequency Control */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">Campaign frequency control</h5>
                          <p className="text-[11px] text-slate-500">Set a frequency if you have a specific number of times that you want people to see your ads. <button type="button" className="text-blue-600 hover:underline font-bold">Learn more</button></p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={frequencyControl} onChange={(e) => setFrequencyControl(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {frequencyControl && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                          <h6 className="font-bold text-slate-900 text-xs">Frequency control</h6>
                          <div className="grid grid-cols-2 gap-2">
                            <div onClick={() => setFrequencyMode("TARGET")} className={`p-3 rounded-xl border cursor-pointer transition-all ${frequencyMode === "TARGET" ? "bg-blue-50/70 border-blue-500 shadow-2xs" : "bg-white border-slate-200"}`}>
                              <p className="text-xs font-bold text-slate-900">Target</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">The average number of times that you want people to see your ads</p>
                            </div>
                            <div onClick={() => setFrequencyMode("CAP")} className={`p-3 rounded-xl border cursor-pointer transition-all ${frequencyMode === "CAP" ? "bg-blue-50/70 border-blue-500 shadow-2xs" : "bg-white border-slate-200"}`}>
                              <p className="text-xs font-bold text-slate-900">Cap</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">The maximum number of times that you want people to see your ads</p>
                            </div>
                          </div>

                          {frequencyMode === "CAP" && (
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                                <input type="number" value={frequencyCapCount} onChange={(e) => setFrequencyCapCount(Number(e.target.value))} min={1} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 text-center focus:outline-none" />
                                <span>times every</span>
                                <input type="number" value={frequencyCapDays} onChange={(e) => setFrequencyCapDays(Number(e.target.value))} min={1} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 text-center focus:outline-none" />
                                <span>days</span>
                              </div>
                              <p className="text-[11px] text-slate-500">As a maximum, we'll aim to stay under {frequencyCapCount} impressions every {frequencyCapDays} days.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* A/B Test */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">A/B test</h5>
                          <p className="text-[11px] text-slate-500">Help improve ad performance by comparing versions to see what works best. <button type="button" className="text-blue-600 hover:underline font-bold">About A/B tests</button></p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={abTestEnabled} onChange={(e) => setAbTestEnabled(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Navigation Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Proceed to Step 2: Ad Set Level →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: AD SET LEVEL ── */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{adSetName || "New Engagement ad set"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Hierarchy: {campName} → Ad Set</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">In draft</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ad set name</label>
                <input
                  type="text"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  placeholder="New Engagement ad set"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Conversion Location Dropdown */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Conversion location</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Choose where you want to drive engagement.</p>
                </div>
                <select
                  value={conversionLocation}
                  onChange={(e) => setConversionLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MESSAGING_APPS">Messaging apps (Messenger, WhatsApp or Instagram)</option>
                  <option value="ON_AD">On your ad (Video views, Post engagement, Event responses)</option>
                  <option value="CALLS">Calls (Get people to call your business)</option>
                  <option value="WEBSITE">Website (Get people to engage with your website)</option>
                  <option value="APP">App (Get people to engage with your app)</option>
                  <option value="INSTAGRAM_FACEBOOK">Instagram or Facebook (Engage with profile or Page)</option>
                </select>

                {/* Engagement Type selector when "On your ad" is selected */}
                {conversionLocation === "ON_AD" && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 animate-fadeIn">
                    <label className="block text-[11px] font-bold text-slate-700">Engagement type</label>
                    <select
                      value={engagementType}
                      onChange={(e) => setEngagementType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="VIDEO_VIEWS">Video views</option>
                      <option value="POST_ENGAGEMENT">Post engagement</option>
                      <option value="EVENT_RESPONSES">Event responses</option>
                      <option value="REMINDERS_SET">Reminders set</option>
                    </select>
                  </div>
                )}

                {/* Performance Goal dropdown */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Performance goal</label>
                  <select
                    value={performanceGoal}
                    onChange={(e) => setPerformanceGoal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    {engagementType === "VIDEO_VIEWS" ? (
                      <>
                        <option value="MAXIMIZE_THRUPLAY_VIEWS">Maximise ThruPlay views (Watch entire video &lt;15s or &gt;15s)</option>
                        <option value="MAXIMIZE_2SEC_CONTINUOUS_VIEWS">Maximise 2-second continuous video plays</option>
                      </>
                    ) : (
                      <>
                        <option value="MAXIMIZE_CONVERSATIONS">Maximise number of conversations</option>
                        <option value="MAXIMIZE_REPLIES">Maximise replies</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Advantage+ Audience Controls */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">Audience</h4>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">Advantage+ on</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Set up your audience using controls and suggestions.</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-3 border-t border-slate-100">
                  {/* Dynamic Geo Location Autocomplete from Graph API */}
                  <div className="space-y-1.5 relative">
                    <label className="block text-[11px] font-bold text-slate-700">Locations (Inclusion)</label>
                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                      {locations.map((loc, idx) => (
                        <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold shadow-2xs">
                          📍 {loc}
                          <button
                            type="button"
                            onClick={() => setLocations(locations.filter((_, i) => i !== idx))}
                            className="hover:text-red-600 ml-1 text-slate-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={locQuery}
                        onChange={(e) => handleSearchLocations(e.target.value)}
                        onFocus={() => locQuery && setShowLocDropdown(true)}
                        className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[140px]"
                        placeholder="Search Meta Geo Locations (e.g. India, Mumbai, Wakad)..."
                      />
                      {searchingLoc && <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin shrink-0" />}
                    </div>

                    {/* Location Autocomplete Dropdown */}
                    {showLocDropdown && locResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {locResults.map((item: any, i: number) => (
                          <div
                            key={i}
                            onClick={() => {
                              const displayName = item.name + (item.country_name ? `, ${item.country_name}` : "");
                              if (!locations.includes(displayName)) {
                                setLocations([...locations, displayName]);
                              }
                              setLocQuery("");
                              setShowLocDropdown(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{item.type} {item.country_name ? `• ${item.country_name}` : ""}</p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Add Location</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-amber-700 font-medium">To run ads in India, declare if your ads are related to securities and investments.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Minimum age</label>
                      <input
                        type="number"
                        value={minAge}
                        onChange={(e) => setMinAge(Number(e.target.value))}
                        min={18}
                        max={65}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none font-bold"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Unknown age on WhatsApp: Excluded</p>
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="block text-[11px] font-bold text-slate-700">Languages</label>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                        {selectedLanguages.map((lang, idx) => (
                          <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-2xs">
                            🗣️ {lang === "ALL" ? "All Languages" : lang}
                            {lang !== "ALL" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = selectedLanguages.filter((_, i) => i !== idx);
                                  setSelectedLanguages(next.length === 0 ? ["ALL"] : next);
                                }}
                                className="hover:text-red-600 ml-1 text-slate-400"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        <input
                          type="text"
                          value={langQuery}
                          onChange={(e) => handleSearchLanguages(e.target.value)}
                          onFocus={() => langQuery && setShowLangDropdown(true)}
                          className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[140px]"
                          placeholder="Search Meta languages (e.g. Hindi, English, Marathi)..."
                        />
                        {searchingLang && <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin shrink-0" />}
                      </div>

                      {/* Live Meta Graph API Languages Autocomplete Dropdown */}
                      {showLangDropdown && langResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {langResults.map((item: any, i: number) => (
                            <div
                              key={i}
                              onClick={() => {
                                const lName = item.name || item.key;
                                const cleaned = selectedLanguages.filter(l => l !== "ALL");
                                if (!cleaned.includes(lName)) {
                                  setSelectedLanguages([...cleaned, lName]);
                                }
                                setLangQuery("");
                                setShowLangDropdown(false);
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                <p className="text-[10px] text-slate-500">Meta Locale Key: {item.key}</p>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Add Language</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Detailed Targeting Autocomplete */}
                  <div className="space-y-1.5 relative">
                    <label className="block text-[11px] font-bold text-slate-700">Detailed targeting (Demographics, Interests, Behaviors)</label>
                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
                      {selectedInterests.map((interest, idx) => (
                        <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                          🏷️ {interest.name}
                          <button
                            type="button"
                            onClick={() => {
                              const next = selectedInterests.filter((_, i) => i !== idx);
                              setSelectedInterests(next);
                              setDetailedTargeting(next.map(n => n.name).join(", "));
                            }}
                            className="hover:text-red-600 ml-1 text-slate-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={targetingQuery}
                        onChange={(e) => handleSearchTargeting(e.target.value)}
                        onFocus={() => targetingQuery && setShowTargetingDropdown(true)}
                        className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[160px]"
                        placeholder="Search Meta Interests, Demographics (e.g. Digital Marketing)..."
                      />
                      {searchingTargeting && <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin shrink-0" />}
                    </div>

                    {/* Detailed Targeting Autocomplete Dropdown */}
                    {showTargetingDropdown && targetingResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {targetingResults.map((item: any, i: number) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (!selectedInterests.some(s => s.id === item.id)) {
                                const next = [...selectedInterests, item];
                                setSelectedInterests(next);
                                setDetailedTargeting(next.map(n => n.name).join(", "));
                              }
                              setTargetingQuery("");
                              setShowTargetingDropdown(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-all"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{item.topic || item.type || "Interest"} {item.audience_size ? `• ~${(item.audience_size / 1000000).toFixed(1)}M size` : ""}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Add Spec</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Placements Selection */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Placements</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Maximize your budget and show your ads to more people.</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${placementsAdvantage ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {placementsAdvantage ? "Advantage+ on" : "Manual placements"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div
                      onClick={() => setPlacementsAdvantage(true)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${placementsAdvantage ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">Advantage+ placements (Recommended)</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">We'll allocate your ad set's budget across multiple placements based on performance. Includes WhatsApp Status & Instagram Reels.</p>
                    </div>
                    <div
                      onClick={() => setPlacementsAdvantage(false)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${!placementsAdvantage ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">Manual placements</p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Manually choose the places to show your ad. The more placements selected, the more opportunities to reach your audience.</p>
                    </div>
                  </div>
                </div>

                {!placementsAdvantage && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                    <h5 className="font-bold text-slate-900 text-xs">Platforms & Placement Feeds</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        <span className="font-medium">Facebook & Instagram Feeds</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        <span className="font-medium">Stories & Reels (IG / FB)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        <span className="font-medium">In-stream ads for videos</span>
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        <span className="font-medium">Search results & WhatsApp Status</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Proceed to Step 3: Ad Level →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: AD LEVEL ── */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{adName || "New Engagement ad"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Hierarchy: {campName} → {adSetName} → Ad</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">In draft</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ad name</label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New Engagement ad"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Connected Identity Profiles */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Identity & Connected Accounts</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Profiles fetched dynamically from your connected Meta Ad Account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Page *</label>
                    <select
                      value={facebookPageId}
                      onChange={(e) => setFacebookPageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPages.length > 0 ? (
                        fetchedPages.map((p: any) => (
                          <option key={p.id} value={p.id}>📄 {p.name}</option>
                        ))
                      ) : (
                        <option value="">JISNU Digital Solutions Pvt.Ltd</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Instagram Account</label>
                    <select
                      value={instagramAccountId}
                      onChange={(e) => setInstagramAccountId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedIgAccounts.length > 0 ? (
                        fetchedIgAccounts.map((ig: any) => (
                          <option key={ig.id} value={ig.id}>📸 @{ig.username}</option>
                        ))
                      ) : (
                        <option value="jisnu_digitalsolution_pvt_ltd">📸 @jisnu_digitalsolution_pvt_ltd</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Threads Profile</label>
                    <select value={threadsProfile} onChange={(e) => setThreadsProfile(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500">
                      <option value="USE_INSTAGRAM">Use Instagram account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp Phone Number</label>
                    <select
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedWaNumbers.length > 0 ? (
                        fetchedWaNumbers.map((w: any, idx: number) => (
                          <option key={idx} value={w.displayPhoneNumber}>💬 {w.verifiedName || w.displayPhoneNumber} ({w.displayPhoneNumber})</option>
                        ))
                      ) : (
                        <option value="+91 77099 36965">💬 Jisnu Digital Solutions (+91 77099 36965)</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Destination Selector */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Destination</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tell us where to send people immediately after they tap or click your ad.</p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div onClick={() => setDestinationType("MESSAGING_APPS")} className={`p-3.5 rounded-2xl border cursor-pointer text-center transition-all ${destinationType === "MESSAGING_APPS" ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <p className="text-xs font-bold text-slate-900">Messaging apps</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">WhatsApp / IG / Messenger</p>
                  </div>
                  <div onClick={() => setDestinationType("INSTANT_EXPERIENCE")} className={`p-3.5 rounded-2xl border cursor-pointer text-center transition-all ${destinationType === "INSTANT_EXPERIENCE" ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <p className="text-xs font-bold text-slate-900">Instant Experience</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mobile experience</p>
                  </div>
                  <div onClick={() => setDestinationType("WEBSITE")} className={`p-3.5 rounded-2xl border cursor-pointer text-center transition-all ${destinationType === "WEBSITE" ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <p className="text-xs font-bold text-slate-900">Website</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Landing page URL</p>
                  </div>
                </div>
              </div>

              {/* Media & Copy Setup */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Ad creative & copy</h4>

                {conversionLocation === "ON_AD" && engagementType === "VIDEO_VIEWS" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-bold flex items-center gap-2">
                    <span>🎬</span> A video is required for Video Views. Upload or select a video to publish.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Media URL (Image or Video)</label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Text (Main Caption)</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Transform your business with high-converting Meta ads..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Chat with us on WhatsApp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Get instant quotes and answers"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Call to Action (CTA)</label>
                  <select
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="WHATSAPP_MESSAGE">Send WhatsApp Message</option>
                    <option value="SEND_MESSAGE">Send Message</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="WATCH_MORE">Watch More</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back to Step 2
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Live Engagement Campaign 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Real-Time Campaign Score & Live Ad Preview */}
        <div className="w-80 bg-slate-50 p-5 space-y-5 overflow-y-auto shrink-0 hidden lg:block border-l border-slate-200">
          {/* Score Gauge */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" /> Campaign Score
            </h4>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="74 26" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-700">74</span>
              </div>
              <div>
                <p className="text-[11px] text-amber-700 font-bold">Room to improve</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Lower costs by 9% (+26 pts)</p>
              </div>
            </div>
          </div>

          {/* Audience Meter */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs">Audience Definition</h4>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full w-3/4 rounded-full" />
            </div>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">Your audience is broad.</p>
          </div>

          {/* Live Ad Preview */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-600" /> Live Interactive Preview
            </h4>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">FB</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{fetchedPages[0]?.name || "JISNU Digital Solutions"}</p>
                  <p className="text-[9px] text-slate-400">Sponsored • 🌐</p>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{primaryText || "Transform your business with high-converting Meta ads."}</p>
              <div className="w-full h-32 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 text-xs font-semibold">
                {mediaUrl ? "Video/Image Preview Loaded" : "Add media to see ad examples"}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-900 truncate max-w-[150px]">{headline || "Chat with us on WhatsApp"}</p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{description || "Get instant responses"}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shadow-2xs shrink-0">
                  {callToAction === "WHATSAPP_MESSAGE" ? "WhatsApp" : "Learn More"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
