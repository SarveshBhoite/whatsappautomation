"use client";
import { useState } from "react";
import {
  X, Loader2, DollarSign, Settings, Check, Globe, Phone, Zap, Tag, Sparkles, Plus, Code, Eye, Search, ShieldCheck, MessageSquare
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
  const [buyingType, setBuyingType] = useState("AUCTION");
  const [cboEnabled, setCboEnabled] = useState(true);
  const [dailyBudget, setDailyBudget] = useState("1500");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [shareBudgetPercent, setShareBudgetPercent] = useState(false);
  const [frequencyControl, setFrequencyControl] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");
  const [formPageId, setFormPageId] = useState(fetchedPages[0]?.id || "");

  // STEP 3: Ad Set Level State
  const [adSetName, setAdSetName] = useState("New Sales ad set");
  const [salesLifecycleStrategy, setSalesLifecycleStrategy] = useState("ALL_CUSTOMERS");
  const [conversionLocation, setConversionLocation] = useState<"WEBSITE" | "APP" | "WEBSITE_AND_APP" | "MESSAGING_APPS" | "CALLS">("WEBSITE");
  const [salesPerformanceGoal, setSalesPerformanceGoal] = useState("MAXIMIZE_CONVERSIONS");
  const [pixelId, setPixelId] = useState(fetchedPixels[0]?.id || "189283719283");
  const [conversionEvent, setConversionEvent] = useState("PURCHASE");
  const [showEventModal, setShowEventModal] = useState(false);
  const [costPerResult, setCostPerResult] = useState("");
  const [attributionModel, setAttributionModel] = useState("7_DAY_CLICK_1_DAY_VIEW");
  const [deliveryType, setDeliveryType] = useState("STANDARD");
  const [securitiesDeclared, setSecuritiesDeclared] = useState(false);
  const [advantagePlacements, setAdvantagePlacements] = useState(true);
  const [brandSuitability, setBrandSuitability] = useState("STANDARD");
  const [showAudienceSize, setShowAudienceSize] = useState(true);

  // STEP 4: Ad Level State
  const [adName, setAdName] = useState("New Sales ad");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccount, setInstagramAccount] = useState(fetchedIgAccounts[0]?.username || "@jisnudigital");
  const [whatsappPhone, setWhatsappPhone] = useState(fetchedWaNumbers[0]?.phoneNumber || "+91 9876543210");
  const [adSetupMode, setAdSetupMode] = useState<"CREATE" | "EXISTING">("CREATE");
  const [adFormat, setAdFormat] = useState<"SINGLE" | "CAROUSEL">("SINGLE");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);
  const [mediaUrl, setMediaUrl] = useState("https://images.unsplash.com/photo-1523275335684-37898b6baf30");
  const [aiMedia, setAiMedia] = useState(false);
  const [primaryText, setPrimaryText] = useState("Get 30% OFF our best-selling digital products during our limited-time seasonal sale!");
  const [headline, setHeadline] = useState("Shop Premium Deals Today");
  const [description, setDescription] = useState("Free shipping and instant digital delivery.");
  const [testimonialText, setTestimonialText] = useState("Rated 4.9/5 stars by over 2,000+ satisfied buyers!");
  const [callToAction, setCallToAction] = useState("SHOP_NOW");
  const [adDestinationRadio, setAdDestinationRadio] = useState<"INSTANT" | "WEBSITE" | "CALL" | "MESSAGING">("WEBSITE");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com/checkout");

  // Conversations Chat Template
  const [chatGreeting, setChatGreeting] = useState("Hi! Thanks for checking our store. How can we help complete your order?");
  const [q1, setQ1] = useState("Do you have a discount promo code?");
  const [q2, setQ2] = useState("What are your return & refund policies?");
  const [q3, setQ3] = useState("Talk to sales representative");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Modals: Promo Codes & UTM
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoMode, setPromoMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [manualPromoCode, setManualPromoCode] = useState("SAVE30");

  const [showUtmModal, setShowUtmModal] = useState(false);
  const [utmSource, setUtmSource] = useState("facebook");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("sales_promo_2026");

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
      const res = await fetch(`${backendUrl}/api/meta-ads/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          name: campName,
          objective: "OUTCOME_SALES",
          dailyBudget: Number(dailyBudget),
          buyingType,
          liveVideoAd,
          cboEnabled,
          bidStrategy,
          specialAdCategory,
          adSetName,
          salesLifecycleStrategy,
          conversionLocation,
          performanceGoal: salesPerformanceGoal,
          pixelId,
          conversionEvent,
          costPerResult,
          attributionModel,
          deliveryType,
          securitiesDeclared,
          advantagePlacements,
          brandSuitability,
          adName,
          partnershipAd,
          facebookPageId: formPageId || facebookPageId,
          instagramAccount,
          whatsappPhone,
          adSetupMode,
          adFormat,
          multiAdvertiser,
          creativeHeadline: headline,
          creativeBody: primaryText,
          creativeDescription: description,
          creativeMediaUrl: mediaUrl,
          testimonialText,
          callToAction,
          adDestinationRadio,
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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden animate-fadeIn">
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-purple-500/50 text-purple-300 text-xs font-bold shadow-2xl">
          ⚡ {toastMessage}
        </div>
      )}

      {/* Header Stepper Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold uppercase">
                Step {activeStep} of 4
              </span>
              <span className="text-xs text-slate-400 font-mono">In Draft</span>
            </div>
            <h1 className="font-bold text-slate-100 text-sm">{campName}</h1>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button onClick={() => setActiveStep(1)} className="px-3 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-white">
            1. Objective
          </button>
          <button onClick={() => setActiveStep(2)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-purple-500 text-slate-950" : "text-slate-400"}`}>
            2. Campaign Parameters
          </button>
          <button onClick={() => setActiveStep(3)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-purple-500 text-slate-950" : "text-slate-400"}`}>
            3. Ad Set Level
          </button>
          <button onClick={() => setActiveStep(4)} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeStep === 4 ? "bg-purple-500 text-slate-950" : "text-slate-400"}`}>
            4. Ad Creative & Preview
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-4xl mx-auto border-r border-slate-800">

          {/* STEP 1: OBJECTIVE CHOICE REDIRECT */}
          {activeStep === 1 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <Tag className="h-10 w-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Step 1: Sales Objective Selected</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Find people likely to purchase your products or services online or via direct messaging.
              </p>
              <button
                onClick={() => setActiveStep(2)}
                className="px-6 py-2.5 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs"
              >
                Proceed to Step 2: Configure Campaign Parameters →
              </button>
            </div>
          )}

          {/* STEP 2: CONFIGURE SALES CAMPAIGN PARAMETERS */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 shadow-md">
                <div>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 2 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">Configure Sales Campaign Parameters</h3>
                  <p className="text-xs text-slate-400">Set budget, bidding strategies, and Advantage+ shopping parameters for purchase conversions.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 hover:text-white"
                >
                  ← Change Objective
                </button>
              </div>

              {/* 1. Campaign Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="New Sales campaign"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* 2. Live video ad toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Live video ad</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use settings suggested for live stream product sales.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={liveVideoAd}
                    onChange={(e) => setLiveVideoAd(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {/* 3. Campaign details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Campaign details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Buying type</label>
                    <select
                      value={buyingType}
                      onChange={(e) => setBuyingType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="AUCTION">Auction</option>
                      <option value="RESERVED">Reservation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Campaign objective</label>
                    <input
                      type="text"
                      disabled
                      value="Sales"
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Advantage+ campaign budget toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Advantage+ campaign budget</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Distribute sales budget across ad sets automatically.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={cboEnabled}
                      onChange={(e) => setCboEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                {cboEnabled && (
                  <div className="pt-3 space-y-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Budget (₹ INR)</label>
                        <input
                          type="number"
                          value={dailyBudget}
                          onChange={(e) => setDailyBudget(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Bid Strategy</label>
                        <select
                          value={bidStrategy}
                          onChange={(e) => setBidStrategy(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                        >
                          <option value="HIGHEST_VOLUME">Highest volume (Max conversions)</option>
                          <option value="COST_CAP">Cost cap / Target ROAS</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={shareBudgetPercent}
                        onChange={(e) => setShareBudgetPercent(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-500"
                      />
                      Share up to 20% of your budget with other ad sets
                    </label>
                  </div>
                )}
              </div>

              {/* 5 & 6. Campaign Frequency Control & A/B Test */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Campaign frequency control</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Set view limit.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={frequencyControl}
                    onChange={(e) => setFrequencyControl(e.target.checked)}
                    className="accent-purple-500 h-4 w-4"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">A/B test</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Compare versions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={abTestEnabled}
                    onChange={(e) => setAbTestEnabled(e.target.checked)}
                    className="accent-purple-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* 7. Special Ad Categories */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs">Special Ad Categories</h4>
                <select
                  value={specialAdCategory}
                  onChange={(e) => setSpecialAdCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="NONE">None — Declare category if applicable</option>
                  <option value="CREDIT">Credit — Financial products & loans</option>
                  <option value="EMPLOYMENT">Employment — Jobs & hiring</option>
                  <option value="HOUSING">Housing — Real estate & property</option>
                  <option value="ISSUES_ELECTIONS_POLITICS">Social Issues, Elections or Politics</option>
                </select>
              </div>

              {/* 8. Facebook Page */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Facebook Page</label>
                <select
                  value={formPageId}
                  onChange={(e) => setFormPageId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {fetchedPages.map((p: any) => (
                    <option key={p.id} value={p.id}>📄 {p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              {/* 9. Campaign score */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xs">
                    66
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Campaign score</h4>
                    <p className="text-[11px] text-slate-400">Advantage+ sales optimization active.</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Check className="h-3 w-3" /> All edits saved
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  Cancel
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 3: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD SET (SALES) */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 3 of 4
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">Advantage+ Sales Campaign</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm pt-1">Step 3 — Sales Ad Set Configuration</h3>
                <p className="text-xs text-slate-400">Configure pixel events, conversion location, and lifecycle strategies.</p>
              </div>

              {/* Ad set name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Ad set name *</label>
                <input
                  type="text"
                  required
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* Lifecycle Strategy & Conversion Location */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Customer Lifecycle & Conversion Location</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lifecycle Strategy</label>
                    <select
                      value={salesLifecycleStrategy}
                      onChange={(e) => setSalesLifecycleStrategy(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="ALL_CUSTOMERS">All Customers (Acquisition &amp; Retention)</option>
                      <option value="NEW_CUSTOMERS">New Customers Only</option>
                      <option value="RETURNING_CUSTOMERS">Returning Customers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Conversion Location</label>
                    <select
                      value={conversionLocation}
                      onChange={(e: any) => setConversionLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="WEBSITE">Website</option>
                      <option value="APP">App</option>
                      <option value="WEBSITE_AND_APP">Website &amp; App</option>
                      <option value="MESSAGING_APPS">Messaging apps (WhatsApp)</option>
                      <option value="CALLS">Calls</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Meta Pixel & Conversion Event */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Meta Pixel &amp; Conversion Event</h4>
                    <p className="text-[11px] text-slate-400">Pixel ID: <span className="font-mono text-purple-400 font-bold">{pixelId}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(true)}
                    className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold"
                  >
                    Setup Conversion Event
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Performance Goal</label>
                    <select
                      value={salesPerformanceGoal}
                      onChange={(e) => setSalesPerformanceGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="MAXIMIZE_CONVERSIONS">Maximise number of conversions</option>
                      <option value="MAXIMIZE_VALUE">Maximise value of conversions (ROAS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Conversion Event</label>
                    <select
                      value={conversionEvent}
                      onChange={(e) => setConversionEvent(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-purple-400"
                    >
                      <option value="PURCHASE">Purchase</option>
                      <option value="INITIATE_CHECKOUT">Initiate Checkout</option>
                      <option value="ADD_TO_CART">Add to Cart</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Show More Settings */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Delivery &amp; Securities Settings</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Delivery Type</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="STANDARD">Standard Delivery</option>
                      <option value="ACCELERATED">Accelerated Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Attribution Model</label>
                    <select
                      value={attributionModel}
                      onChange={(e) => setAttributionModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100"
                    >
                      <option value="7_DAY_CLICK_1_DAY_VIEW">7-day click or 1-day view</option>
                      <option value="1_DAY_CLICK">1-day click</option>
                      <option value="7_DAY_CLICK">7-day click</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={securitiesDeclared}
                    onChange={(e) => setSecuritiesDeclared(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-500 shrink-0"
                  />
                  <span>Securities declaration: E-Commerce payment gateway data processing compliance confirmed.</span>
                </label>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 text-xs">Advantage+ placements</h4>
                  <input
                    type="checkbox"
                    checked={advantagePlacements}
                    onChange={(e) => setAdvantagePlacements(e.target.checked)}
                    className="accent-purple-500 h-4 w-4"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <h4 className="font-bold text-slate-200 text-xs">Show estimated audience size</h4>
                  <input
                    type="checkbox"
                    checked={showAudienceSize}
                    onChange={(e) => setShowAudienceSize(e.target.checked)}
                    className="accent-purple-500 h-4 w-4"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button onClick={() => setActiveStep(4)} className="px-6 py-2.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold shadow-lg">
                  Continue to Step 4: Ad Creative & Preview →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NEW SALES AD */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold uppercase">
                    Step 4 of 4
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">New Sales ad</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPromoModal(true)}
                    className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold"
                  >
                    🏷️ Promo Codes ({promoMode})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUtmModal(true)}
                    className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold"
                  >
                    🔗 URL Parameters
                  </button>
                </div>
              </div>

              {/* 1. Ad Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Ad Name *</label>
                <input
                  type="text"
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="New Sales ad"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* 2. Partnership Ad Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Partnership ad</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Run sales ads with creators or partner brands.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnershipAd}
                    onChange={(e) => setPartnershipAd(e.target.checked)}
                    className="accent-purple-500 h-4 w-4"
                  />
                </div>

                {partnershipAd && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowPartnershipModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold"
                    >
                      Enter ad code or post info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPartnershipModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Select partnership
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Identity */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Identity</h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook Page *</label>
                    <select
                      value={facebookPageId}
                      onChange={(e) => setFacebookPageId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                    >
                      {fetchedPages.map((p) => (
                        <option key={p.id} value={p.id}>📄 {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instagram Profile</label>
                    <input
                      type="text"
                      value={instagramAccount}
                      onChange={(e) => setInstagramAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Ad Setup */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Ad setup</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("CREATE")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${adSetupMode === "CREATE" ? "bg-purple-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    Create ad
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdSetupMode("EXISTING")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${adSetupMode === "EXISTING" ? "bg-purple-500 text-slate-950" : "bg-slate-900 text-slate-400 border border-slate-800"}`}
                  >
                    Use existing post
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setAdFormat("SINGLE")}
                      className={`p-3 rounded-xl border cursor-pointer ${adFormat === "SINGLE" ? "bg-purple-500/10 border-purple-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      <p className="text-xs font-bold">Single image or video</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">One image or video product banner.</p>
                    </div>

                    <div
                      onClick={() => setAdFormat("CAROUSEL")}
                      className={`p-3 rounded-xl border cursor-pointer ${adFormat === "CAROUSEL" ? "bg-purple-500/10 border-purple-500/50 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      <p className="text-xs font-bold">Carousel</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Multiple product cards with individual links.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">Multi-advertiser ads</h4>
                  <input
                    type="checkbox"
                    checked={multiAdvertiser}
                    onChange={(e) => setMultiAdvertiser(e.target.checked)}
                    className="accent-purple-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* 5. Ad Creative */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Ad creative &amp; Product Copy</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Product Media URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("Fetched media from Meta Library!")}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold shrink-0"
                    >
                      Fetch Meta Library
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiMedia}
                    onChange={(e) => setAiMedia(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-500"
                  />
                  Ad includes media created or edited with AI
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Text</label>
                  <textarea
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Call to Action</label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold"
                    >
                      <option value="SHOP_NOW">Shop Now</option>
                      <option value="BUY_NOW">Buy Now</option>
                      <option value="GET_OFFER">Get Offer</option>
                      <option value="ORDER_NOW">Order Now</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="SEND_WHATSAPP_MESSAGE">Send WhatsApp message</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Testimonial Text (Customer Social Proof)</label>
                  <textarea
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* 6. Destination Radios */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Destination</h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: "INSTANT", label: "Instant Experience" },
                    { id: "WEBSITE", label: "Website" },
                    { id: "CALL", label: "Call" },
                    { id: "MESSAGING", label: "Messaging apps" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setAdDestinationRadio(d.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-center ${adDestinationRadio === d.id ? "bg-purple-500/10 border-purple-500/60 text-purple-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {adDestinationRadio === "WEBSITE" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Website Checkout URL</label>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    />
                    <p className="text-[10px] text-purple-400 mt-1">Target URL with UTM: {websiteUrl}?utm_source={utmSource}&amp;utm_medium={utmMedium}&amp;utm_campaign={utmCampaign}</p>
                  </div>
                )}
              </div>

              {/* 7. Conversations Chat Template */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    Conversations Template <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">AI Template</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="text-xs font-bold text-purple-400 hover:underline"
                  >
                    Edit template
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <p className="font-semibold text-slate-200">Greeting: {chatGreeting}</p>
                  <p className="text-[11px] text-slate-400">Q1: {q1}</p>
                  <p className="text-[11px] text-slate-400">Q2: {q2}</p>
                  <p className="text-[11px] text-slate-400">Q3: {q3}</p>
                </div>
              </div>

              {/* 8. Tracking */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Tracking</h4>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300">Website Pixel ID: <span className="font-mono text-purple-400 font-bold">{pixelId}</span></p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">URL Parameters: utm_source={utmSource}&amp;utm_medium={utmMedium}&amp;utm_campaign={utmCampaign}</span>
                    <button
                      type="button"
                      onClick={() => setShowUtmModal(true)}
                      className="text-xs font-bold text-purple-400 hover:underline"
                    >
                      Build a URL parameter
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep(3)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 3
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-xl flex items-center gap-2"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Campaign Live 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Live Ad Preview Panel */}
        <div className="w-80 bg-slate-950 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-purple-400" /> Sales Live Preview
              </h4>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Event: {conversionEvent}</span>
            </div>

            {/* Mobile Product Card Mockup */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden space-y-2 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  🛍️
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">JISNU Official Store</p>
                  <p className="text-[10px] text-slate-400">Sponsored • Code: {promoMode === "MANUAL" ? manualPromoCode : "AUTO"}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-tight">{primaryText}</p>

              {mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 h-36">
                  <img src={mediaUrl} alt="Sales Banner" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-100 truncate max-w-[150px]">{headline}</p>
                  <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{description}</p>
                </div>
                <button className="px-2.5 py-1 rounded-md bg-purple-500 text-slate-950 text-[10px] font-bold">
                  {callToAction.replace(/_/g, " ")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Modals */}
      {showEventModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Setup Conversion Event</h3>
            <p className="text-xs text-slate-400">Choose the primary conversion event tracked by Meta Pixel.</p>
            <select
              value={conversionEvent}
              onChange={(e) => setConversionEvent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-purple-400"
            >
              <option value="PURCHASE">Purchase</option>
              <option value="INITIATE_CHECKOUT">Initiate Checkout</option>
              <option value="ADD_TO_CART">Add to Cart</option>
              <option value="LEAD">Lead</option>
            </select>
            <div className="flex justify-end">
              <button onClick={() => setShowEventModal(false)} className="px-4 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
                Save Event Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Manage Sales Promo Codes</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="radio" name="promo" checked={promoMode === "AUTO"} onChange={() => setPromoMode("AUTO")} className="accent-purple-500" /> Automatically source from catalogue
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="radio" name="promo" checked={promoMode === "MANUAL"} onChange={() => setPromoMode("MANUAL")} className="accent-purple-500" /> Manually add single promo code
              </label>
            </div>
            {promoMode === "MANUAL" && (
              <input
                type="text"
                value={manualPromoCode}
                onChange={(e) => setManualPromoCode(e.target.value)}
                placeholder="e.g. SAVE30"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-purple-400 font-bold"
              />
            )}
            <div className="flex justify-end">
              <button onClick={() => setShowPromoModal(false)} className="px-4 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
                Save Promo Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showUtmModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Build URL Parameters (UTM Tracking)</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Campaign Source (utm_source)</label>
                <input type="text" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Campaign Medium (utm_medium)</label>
                <input type="text" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Campaign Name (utm_campaign)</label>
                <input type="text" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowUtmModal(false)} className="px-4 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
                Apply URL Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {showPartnershipModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Partnership Ad Setup</h3>
            <p className="text-xs text-slate-400">Enter creator ad code or select brand partnership credentials.</p>
            <input type="text" placeholder="Ad code e.g. SALES-PARTNER-123" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100" />
            <div className="flex justify-end">
              <button onClick={() => setShowPartnershipModal(false)} className="px-4 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
                Save Partnership Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
