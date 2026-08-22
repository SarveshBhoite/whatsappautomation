"use client";
import { useState } from "react";
import {
  X, Loader2, DollarSign, Settings, Check, Globe, Phone, Zap, Tag, Sparkles, Plus, Code, Eye, Search, ShieldCheck, MessageSquare, ExternalLink, AlertTriangle
} from "lucide-react";

interface SalesCampaignFlowProps {
  orgId: string;
  backendUrl: string;
  fetchedPages: any[];
  fetchedIgAccounts: any[];
  fetchedWaNumbers: any[];
  fetchedPixels: any[];
  onClose: () => void;
  onPublished: () => void;
}

export default function SalesCampaignFlow({
  orgId,
  backendUrl,
  fetchedPages,
  fetchedIgAccounts,
  fetchedWaNumbers,
  fetchedPixels,
  onClose,
  onPublished,
}: SalesCampaignFlowProps) {
  // Current active step (1 to 4)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(2);

  // STEP 2: Campaign Level State
  const [campName, setCampName] = useState("New Sales campaign");
  const [liveVideoAd, setLiveVideoAd] = useState(false);
  const [liveVideoLocation, setLiveVideoLocation] = useState("FACEBOOK");
  const [buyingType, setBuyingType] = useState("AUCTION");
  const [salesAdvantageCatalogue, setSalesAdvantageCatalogue] = useState(true);
  const [salesAdvantagePlus, setSalesAdvantagePlus] = useState(true);
  const [budgetStrategy, setBudgetStrategy] = useState<"CAMPAIGN" | "ADSET">("CAMPAIGN");
  const [budgetMode, setBudgetMode] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [dailyBudget, setDailyBudget] = useState("800");
  const [salesBidStrategy, setSalesBidStrategy] = useState("HIGHEST_VOLUME");
  const [salesBudgetScheduling, setSalesBudgetScheduling] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abTestVariable, setAbTestVariable] = useState("CREATIVE");
  const [abTestDuration, setAbTestDuration] = useState("7_DAYS");
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [audienceTargetType, setAudienceTargetType] = useState<"ENGAGED" | "EXISTING">("ENGAGED");
  const [salesShowMoreNameOptions, setSalesShowMoreNameOptions] = useState(false);

  // STEP 3: Ad Set Level State
  const [adSetName, setAdSetName] = useState("New Sales ad set");
  const [salesLifecycleStrategy, setSalesLifecycleStrategy] = useState<"ALL_AUDIENCES" | "HIGH_VALUE">("ALL_AUDIENCES");
  const [salesConversionLocation, setSalesConversionLocation] = useState<"WEBSITE" | "APP" | "WEBSITE_AND_APP" | "MESSAGING_APPS" | "CALLS">("WEBSITE");
  const [salesPerformanceGoal, setSalesPerformanceGoal] = useState("MAXIMIZE_CONVERSIONS");
  const [pixelId, setPixelId] = useState(fetchedPixels[0]?.id || "189283719283");
  const [conversionEvent, setConversionEvent] = useState("PURCHASE");
  const [showEventModal, setShowEventModal] = useState(false);
  const [costPerResult, setCostPerResult] = useState("");
  const [attributionModel, setAttributionModel] = useState("STANDARD");
  const [deliveryType, setDeliveryType] = useState("STANDARD");

  // Audience & Placements
  const [locationInclusion, setLocationInclusion] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [gender, setGender] = useState("ALL");
  const [detailedTargeting, setDetailedTargeting] = useState("");
  const [salesShowEstimatedAudienceSize, setSalesShowEstimatedAudienceSize] = useState(true);
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [brandSuitability, setBrandSuitability] = useState("STANDARD");

  // STEP 4: Ad Level State
  const [adName, setAdName] = useState("New Sales ad");
  const [creativeSource, setCreativeSource] = useState<"CREATE_NEW" | "USE_EXISTING" | "USE_MOCK_CATALOG" | "META_CATALOG" | "INSTAGRAM_POSTS" | "MANUAL_UPLOAD">("CREATE_NEW");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [partnershipCode, setPartnershipCode] = useState("");

  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "@jisnudigital");
  const [whatsappPhone, setWhatsappPhone] = useState(fetchedWaNumbers[0]?.phoneNumber || "+91 9876543210");
  const [adFormat, setAdFormat] = useState<"SINGLE" | "CAROUSEL">("SINGLE");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);

  // Creative Inputs
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1523275335684-37898b6baf30");
  const [aiMedia, setAiMedia] = useState(false);
  const [headline, setHeadline] = useState("Exclusive Sales — Up to 50% OFF!");
  const [primaryText, setPrimaryText] = useState("Shop our best-selling products today. Fast shipping and instant WhatsApp customer support.");
  const [partnerText, setPartnerText] = useState("");
  const [callToAction, setCallToAction] = useState("SHOP_NOW");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com/checkout");

  // Modals: Promo Codes & UTM
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoMode, setPromoMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [manualPromoCode, setManualPromoCode] = useState("SAVE20");

  const [showUtmModal, setShowUtmModal] = useState(false);
  const [utmSource, setUtmSource] = useState("facebook_ad");
  const [utmMedium, setUtmMedium] = useState("cpc_sales");
  const [utmCampaign, setUtmCampaign] = useState("summer_sales_2026");

  // Conversations Chat Template
  const [chatGreeting, setChatGreeting] = useState("Hi! Thanks for checking our store. How can we help complete your order?");
  const [q1, setQ1] = useState("Do you have a discount promo code?");
  const [q2, setQ2] = useState("What are your return & refund policies?");
  const [q3, setQ3] = useState("Talk to sales representative");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handlePublish = async () => {
    if (!campName.trim() || !adSetName.trim() || !adName.trim()) {
      showToast("Please fill in Campaign, Ad Set, and Ad names.");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_SALES",
          dailyBudget: Number(dailyBudget),
          buyingType,
          liveVideoAd,
          liveVideoLocation,
          salesAdvantageCatalogue,
          salesAdvantagePlus,
          budgetStrategy,
          budgetMode,
          bidStrategy: salesBidStrategy,
          salesBudgetScheduling,
          frequencyControl,
          abTestEnabled,
          abTestVariable,
          abTestDuration,
          specialAdCategory,
          audienceTargetType,
          adSetName,
          salesLifecycleStrategy,
          conversionLocation: salesConversionLocation,
          performanceGoal: salesPerformanceGoal,
          pixelId,
          conversionEvent,
          costPerResult,
          attributionModel,
          deliveryType,
          securitiesDeclared,
          advantagePlacements,
          adName,
          creativeSource,
          partnershipAd,
          partnershipCode,
          facebookPageId,
          instagramAccount,
          whatsappPhone,
          adFormat,
          multiAdvertiser,
          creativeHeadline: headline,
          creativeBody: primaryText,
          partnerText,
          creativeMediaUrl: mediaUrl,
          aiMedia,
          callToAction,
          websiteUrl: `${websiteUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`,
          promoMode,
          manualPromoCode,
          chatGreeting,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sales Campaign publish failed.");

      showToast("Sales Campaign Created & Published Live! 🛍️");
      onPublished();
    } catch (err: any) {
      showToast(`Publish error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 overflow-hidden animate-fadeIn">
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-2xl">
          ⚡ {toastMessage}
        </div>
      )}

      {/* Header Stepper Navigation */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shrink-0 shadow-2xs">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                Step {activeStep} of 4
              </span>
              <span className="text-xs text-slate-500 font-mono">In Draft • 1 Ad set • 1 Ad</span>
            </div>
            <h1 className="font-bold text-slate-900 text-sm">{campName}</h1>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button onClick={() => setActiveStep(1)} className="px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            1. Objective
          </button>
          <button onClick={() => setActiveStep(2)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 2 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
            2. Campaign Parameters
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 3 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
            3. Ad Set Level
          </button>
          <button onClick={() => setActiveStep(4)} className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeStep === 4 ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>
            4. Ad Creative & Preview
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-4xl mx-auto border-r border-slate-200">

          {/* STEP 1: OBJECTIVE CHOICE REDIRECT */}
          {activeStep === 1 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-2xs">
              <Tag className="h-10 w-10 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Step 1: Choose a Campaign Objective</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Selected: <span className="text-blue-600 font-bold">Sales (OUTCOME_SALES)</span>
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 max-w-lg mx-auto">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" /> Sales Preview
                  </h4>
                  <a
                    href="https://www.facebook.com/business/help/1438417719786914"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    About campaign objectives <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-700">
                  Find people likely to purchase your products or services online or via direct messaging.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Conversions", "Catalog sales", "Messenger, Instagram and WhatsApp", "Calls"].map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Continue → Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NEW SALES CAMPAIGN */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 mb-1 cursor-pointer"
                  >
                    ← Change Objective
                  </button>
                  <h3 className="font-bold text-slate-900 text-sm">New Sales campaign</h3>
                  <p className="text-xs text-slate-500 mt-0.5">1 Ad set • 1 Ad</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">Step 2 of 4</span>
              </div>

              {/* 1. Campaign Name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Campaign name *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New Sales campaign"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setSalesShowMoreNameOptions(!salesShowMoreNameOptions)}
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  {salesShowMoreNameOptions ? "Hide details" : "Show more options ▾"}
                </button>
              </div>

              {/* 2. Live video ad toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Live video ad</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Suggested settings for live video product sales.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={liveVideoAd}
                      onChange={(e) => setLiveVideoAd(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {liveVideoAd && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Live video location</label>
                    <select
                      value={liveVideoLocation}
                      onChange={(e) => setLiveVideoLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="FACEBOOK">Facebook</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="AUDIENCE_NETWORK">Audience Network</option>
                      <option value="FACEBOOK_INSTAGRAM">Facebook &amp; Instagram</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Campaign details */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Campaign details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Buying type</label>
                    <select
                      value={buyingType}
                      onChange={(e) => setBuyingType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="AUCTION">Auction</option>
                      <option value="RESERVED">Reservation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Campaign objective</label>
                    <input
                      type="text"
                      disabled
                      value="Sales"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Advantage+ catalogue ads toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">Advantage+ catalogue ads</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${salesAdvantageCatalogue ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {salesAdvantageCatalogue ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Use dynamic product ads from your Meta product catalog.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={salesAdvantageCatalogue}
                      onChange={(e) => setSalesAdvantageCatalogue(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* 5. Budget (Advantage+ toggle & strategy) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">Budget</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${salesAdvantagePlus ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {salesAdvantagePlus ? "Advantage+ on" : "Advantage+ off"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={salesAdvantagePlus}
                      onChange={(e) => setSalesAdvantagePlus(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => setBudgetStrategy("CAMPAIGN")}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      budgetStrategy === "CAMPAIGN" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" checked={budgetStrategy === "CAMPAIGN"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Campaign budget (Advantage+ budget)</p>
                      <p className="text-[11px] text-slate-500">Automatically distribute your budget to best opportunities.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setBudgetStrategy("ADSET")}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      budgetStrategy === "ADSET" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" checked={budgetStrategy === "ADSET"} readOnly className="mt-1 h-4 w-4 accent-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Ad set budget</p>
                      <p className="text-[11px] text-slate-500">Set different strategies per ad set.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Budget mode</label>
                    <select
                      value={budgetMode}
                      onChange={(e: any) => setBudgetMode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="DAILY">Daily budget</option>
                      <option value="LIFETIME">Lifetime budget</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹ INR)</label>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Spend Info Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <p>Average per day: <span className="text-blue-600 font-bold">₹{dailyBudget}</span></p>
                  <p className="text-[11px] text-slate-500">
                    Max daily: <span className="font-semibold text-slate-800">₹{(Number(dailyBudget) * 1.75).toFixed(0)}</span> | Max weekly: <span className="font-semibold text-slate-800">₹{(Number(dailyBudget) * 7).toFixed(0)}</span>.{" "}
                    <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                      About daily budget
                    </a>
                  </p>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>⚠ spending may exceed ₹{dailyBudget} the first few days</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign bid strategy</label>
                  <select
                    value={salesBidStrategy}
                    onChange={(e) => setSalesBidStrategy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HIGHEST_VOLUME">Highest volume</option>
                    <option value="COST_CAP">Cost per result goal</option>
                    <option value="BID_CAP">Bid cap</option>
                  </select>
                </div>
              </div>

              {/* 6. Budget scheduling */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Budget scheduling</h4>
                    <p className="text-[11px] text-slate-500">Increase budget on specific days/times.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={salesBudgetScheduling}
                      onChange={(e) => setSalesBudgetScheduling(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* 7 & 8. Frequency & A/B test */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs">Campaign frequency control</h4>
                  <input
                    type="checkbox"
                    checked={frequencyControl}
                    onChange={(e) => setFrequencyControl(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                  <h4 className="font-bold text-slate-900 text-xs">A/B test</h4>
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                </div>
              </div>

              {abTestEnabled && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 animate-fadeIn shadow-2xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">What would you like to test?</label>
                    <select
                      value={abTestVariable}
                      onChange={(e) => setAbTestVariable(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="CREATIVE">Creative</option>
                      <option value="AUDIENCE">Audience</option>
                      <option value="PLACEMENT">Placement</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">How long should the test run?</label>
                    <select
                      value={abTestDuration}
                      onChange={(e) => setAbTestDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="7_DAYS">7 days</option>
                      <option value="3_DAYS">3 days</option>
                      <option value="14_DAYS">14 days</option>
                      <option value="30_DAYS">30 days</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 9. Special Ad Categories */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="NONE">Declare category if applicable</option>
                  <option value="FINANCIAL">Financial products and services</option>
                  <option value="EMPLOYMENT">Employment</option>
                  <option value="HOUSING">Housing</option>
                  <option value="SOCIAL_ISSUES">Social issues, elections or politics</option>
                </select>
              </div>

              {/* 10. Audience Radios */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Audience targeting strategy</h4>
                <div className="flex gap-4 text-xs font-medium">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="salesAud"
                      checked={audienceTargetType === "ENGAGED"}
                      onChange={() => setAudienceTargetType("ENGAGED")}
                      className="accent-blue-600"
                    />
                    Engaged audience
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="salesAud"
                      checked={audienceTargetType === "EXISTING"}
                      onChange={() => setAudienceTargetType("EXISTING")}
                      className="accent-blue-600"
                    />
                    Existing customers
                  </label>
                </div>
              </div>

              {/* 11. Campaign Score */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    66
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Campaign score</h4>
                    <p className="text-[11px] text-slate-500">Sales campaign configuration ready.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 1
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 3: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: NEW SALES AD SET */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                  Step 3 of 4
                </span>
                <h3 className="font-bold text-slate-900 text-sm pt-1">New Sales campaign → New Sales ad set</h3>
                <p className="text-xs text-slate-500">Configure customer lifecycle, pixel event tracking, and placements.</p>
              </div>

              {/* 1. Ad set name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Ad set name *</label>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  placeholder="New Sales ad set"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. Customer life cycle strategy */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Customer life cycle strategy</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSalesLifecycleStrategy("ALL_AUDIENCES")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      salesLifecycleStrategy === "ALL_AUDIENCES" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">ALL_AUDIENCES</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Get conversions from all audiences</p>
                  </div>

                  <div
                    onClick={() => setSalesLifecycleStrategy("HIGH_VALUE")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      salesLifecycleStrategy === "HIGH_VALUE" ? "bg-blue-50/70 border-blue-500 text-slate-900 shadow-2xs ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">HIGH_VALUE</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Target high-value customers (Prioritise repeat purchases)</p>
                  </div>
                </div>
              </div>

              {/* 3. Conversion & Event Modal Trigger */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Conversion Location</h4>
                <select
                  value={salesConversionLocation}
                  onChange={(e: any) => setSalesConversionLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="WEBSITE">Website</option>
                  <option value="APP">App</option>
                  <option value="WEBSITE_AND_APP">Website and App</option>
                  <option value="MESSAGING_APPS">Messaging apps (WhatsApp, Messenger)</option>
                  <option value="CALLS">Calls</option>
                </select>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-700">Conversion Event: </span>
                    <span className="text-xs font-mono text-blue-600 font-bold">{conversionEvent}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer hover:bg-blue-100"
                  >
                    Set up conversion event
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Performance goal</label>
                    <select
                      value={salesPerformanceGoal}
                      onChange={(e) => setSalesPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="MAXIMIZE_CONVERSIONS">Maximise number of conversions</option>
                      <option value="MAXIMIZE_VALUE">Maximise value of conversions</option>
                      <option value="MAXIMIZE_LANDING_PAGE_VIEWS">Maximise number of landing page views</option>
                      <option value="MAXIMIZE_LINK_CLICKS">Maximise number of link clicks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Attribution / delivery</label>
                    <select
                      value={attributionModel}
                      onChange={(e) => setAttributionModel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="STANDARD">Standard (7-day click or 1-day view)</option>
                      <option value="1_DAY_CLICK">1-day click</option>
                      <option value="7_DAY_CLICK">7-day click</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cost per result goal</label>
                  <input
                    type="text"
                    value={costPerResult}
                    onChange={(e) => setCostPerResult(e.target.value)}
                    placeholder="None"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4. Audience definition */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Audience definition</h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Locations (Inclusion)</label>
                  <input
                    type="text"
                    value={locationInclusion}
                    onChange={(e) => setLocationInclusion(e.target.value)}
                    placeholder="India..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs">Estimated audience size toggle</h4>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={salesShowEstimatedAudienceSize}
                      onChange={(e) => setSalesShowEstimatedAudienceSize(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* 5-8. Regulatory, Placements & Brand Safety */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 shrink-0"
                  />
                  <span>Policy and regulatory requirements (India) compliance verified.</span>
                </label>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs">Advantage+ placements</h4>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={advantagePlacements}
                      onChange={(e) => setAdvantagePlacements(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  Continue to Step 4: Ad Creative & Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NEW SALES AD */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">New Sales campaign → New Sales ad set → New Sales ad</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPromoModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 cursor-pointer"
                  >
                    🏷️ Manage Promo Codes
                  </button>
                </div>
              </div>

              {/* 1. Ad Name */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700">Ad name *</label>
                <input
                  type="text"
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New Sales ad"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. Ad Setup / Creative Source */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Ad setup / Creative source</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: "CREATE_NEW", label: "Create new ad" },
                    { id: "USE_EXISTING", label: "Use existing post" },
                    { id: "USE_MOCK_CATALOG", label: "Use mock catalog" },
                    { id: "META_CATALOG", label: "Meta Product Catalog" },
                    { id: "INSTAGRAM_POSTS", label: "Instagram Creator Posts" },
                    { id: "MANUAL_UPLOAD", label: "Manual Creative Upload" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCreativeSource(s.id as any)}
                      className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${creativeSource === s.id ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Partnership Ad Toggle */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Partnership ad</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Run sales ads with creators or partner brands.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={partnershipAd}
                      onChange={(e) => setPartnershipAd(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {partnershipAd && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowPartnershipModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold cursor-pointer"
                    >
                      Enter ad code or post info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPartnershipModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Select partnership
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Identity */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Facebook Page *</label>
                    <select
                      value={facebookPageId}
                      onChange={(e) => setFacebookPageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    >
                      {fetchedPages.map((p) => (
                        <option key={p.id} value={p.id}>📄 {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Instagram Profile</label>
                    <input
                      type="text"
                      value={instagramAccount}
                      onChange={(e) => setInstagramAccount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Creative */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Creative</h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Exclusive Sales — Up to 50% OFF!"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Body Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    placeholder="Shop our best-selling products today. Fast shipping and instant WhatsApp customer support."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Media URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("Fetched media from Meta Library!")}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Fetch Meta Library
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Partner Text</label>
                  <textarea
                    value={partnerText}
                    onChange={(e) => setPartnerText(e.target.value)}
                    placeholder="Add text from your partner..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 7. Tracking */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Tracking</h4>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-700">Website Pixel ID: <span className="font-mono text-blue-600 font-bold">{pixelId}</span></p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono text-[11px]">key1=value1&amp;key2=value2 → utm_source={utmSource}&amp;utm_medium={utmMedium}&amp;utm_campaign={utmCampaign}</span>
                    <button
                      type="button"
                      onClick={() => setShowUtmModal(true)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Build a URL parameter
                    </button>
                  </div>
                  <a href="https://www.facebook.com/business/help" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline block pt-1">
                    About third-party reporting
                  </a>
                </div>
              </div>

              {/* 10. Legal */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-500 shadow-2xs">
                <p>By clicking Publish Campaign Live, you agree to Meta's Sales &amp; E-Commerce Terms.</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(3)} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                  ← Back to Step 3
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Campaign Live 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Live Ad Preview Panel */}
        <div className="w-80 bg-slate-50 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-200">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-600" /> Ad preview
              </h4>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">Event: {conversionEvent}</span>
            </div>

            {/* Mobile Product Card Mockup */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden space-y-2.5 p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                  🛍️
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">JISNU Official Store</p>
                  <p className="text-[10px] text-slate-400">Sponsored • Code: {promoMode === "MANUAL" ? manualPromoCode : "AUTO"}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed">{primaryText}</p>

              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36">
                  <img src={mediaUrl} alt="Sales Banner" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{headline}</p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[150px]">Special Discount Applied</p>
                </div>
                <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-2xs">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Modals */}
      {showEventModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Set up conversion event</h3>
            <p className="text-xs text-slate-500">Configure web purchase, checkout, or lead events for your pixel dataset.</p>
            <div className="space-y-2">
              {[
                { id: "PURCHASE", label: "Purchase", desc: "Completed payment on website" },
                { id: "INITIATE_CHECKOUT", label: "Initiate Checkout", desc: "Click checkout button" },
                { id: "ADD_TO_CART", label: "Add to Cart", desc: "Added product to cart" },
                { id: "LEAD", label: "Lead", desc: "Form submission or query" },
                { id: "SUBSCRIBE", label: "Subscribe", desc: "Recurring payment plan" },
              ].map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setConversionEvent(ev.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${conversionEvent === ev.id ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  <p className="text-xs font-bold text-blue-700">{ev.label}</p>
                  <p className="text-[10px] text-slate-500">{ev.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-blue-600 italic">💡 Meta AI automatically optimizes delivery for users with high purchase intent.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEventModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={() => setShowEventModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                Save Conversion Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Manage promo codes</h3>
            <div className="space-y-3">
              <div
                onClick={() => setPromoMode("AUTO")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${promoMode === "AUTO" ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                <p className="text-xs font-bold text-slate-900">Automatically source promo codes (AUTO)</p>
                <p className="text-[10px] text-slate-500">Meta will detect active website promotion codes automatically.</p>
              </div>

              <div
                onClick={() => setPromoMode("MANUAL")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${promoMode === "MANUAL" ? "bg-blue-50/70 border-blue-500 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                <p className="text-xs font-bold text-slate-900">Manually add promo codes (MANUAL)</p>
                <p className="text-[10px] text-slate-500">Enter custom coupon code e.g. SAVE20, WELCOME10.</p>
              </div>
            </div>

            {promoMode === "MANUAL" && (
              <input
                type="text"
                value={manualPromoCode}
                onChange={(e) => setManualPromoCode(e.target.value)}
                placeholder="e.g. SAVE20, WELCOME10"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-blue-600 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
              />
            )}
            <div className="flex justify-end">
              <button onClick={() => setShowPromoModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showUtmModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Build a URL parameter</h3>
            <p className="text-xs text-slate-500">Add tracking parameters to measure traffic source and campaign effectiveness.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Source (utm_source)</label>
                <input type="text" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="facebook_ad" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Medium (utm_medium)</label>
                <input type="text" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="cpc_sales" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Name (utm_campaign)</label>
                <input type="text" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="summer_sales_2026" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUtmModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={() => setShowUtmModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {showPartnershipModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Enter partnership ad code, post ID or post URL</h3>
            <input
              type="text"
              value={partnershipCode}
              onChange={(e) => setPartnershipCode(e.target.value)}
              placeholder="SALES-PARTNER-123"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowPartnershipModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm">
                Save Partnership Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
