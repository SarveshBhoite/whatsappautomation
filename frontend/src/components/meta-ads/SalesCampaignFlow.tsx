"use client";
import { useState } from "react";
import {
  X, Loader2, DollarSign, Settings, Check, Globe, Phone, Zap, Tag, Sparkles, Plus, Code
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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [salesSubStep, setSalesSubStep] = useState<"CHOICE" | "CONFIG">("CHOICE");
  const [salesPresetMode, setSalesPresetMode] = useState<"tailored" | "manual">("tailored");

  // Modals state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showUtmModal, setShowUtmModal] = useState(false);
  const [utmSource, setUtmSource] = useState("facebook");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("sales_promo");

  // Step 1: Campaign Level
  const [campName, setCampName] = useState("New Sales campaign");
  const [dailyBudget, setDailyBudget] = useState("1500");
  const [bidStrategy, setBidStrategy] = useState("HIGHEST_VOLUME");
  const [specialAdCategory, setSpecialAdCategory] = useState("NONE");

  // Step 2: Ad Set Level
  const [adSetName, setAdSetName] = useState("New Sales ad set");
  const [salesLifecycleStrategy, setSalesLifecycleStrategy] = useState("ALL_CUSTOMERS");
  const [conversionLocation, setConversionLocation] = useState<"WEBSITE" | "APP" | "WEBSITE_AND_APP" | "MESSAGING_APPS" | "CALLS">("WEBSITE");
  const [pixelId, setPixelId] = useState(fetchedPixels[0]?.id || "");
  const [conversionEvent, setConversionEvent] = useState("PURCHASE");
  const [salesPerformanceGoal, setSalesPerformanceGoal] = useState("MAXIMIZE_CONVERSIONS");
  const [promoMode, setPromoMode] = useState<"AUTO" | "MANUAL">("AUTO");

  // Step 3: Ad Level
  const [adName, setAdName] = useState("New Sales ad");
  const [facebookPageId, setFacebookPageId] = useState(fetchedPages[0]?.id || "");
  const [instagramAccountId, setInstagramAccountId] = useState(fetchedIgAccounts[0]?.id || "");
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [adSetupMode, setAdSetupMode] = useState<"CREATE" | "EXISTING">("CREATE");
  const [adFormat, setAdFormat] = useState<"SINGLE" | "CAROUSEL">("SINGLE");
  const [multiAdvertiser, setMultiAdvertiser] = useState(true);
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com/checkout");
  const [callToAction, setCallToAction] = useState("SHOP_NOW");

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
          specialAdCategory,
          salesPresetMode,
          adSetName,
          conversionLocation,
          pixelId,
          conversionEvent,
          performanceGoal: salesPerformanceGoal,
          adName,
          facebookPageId,
          instagramAccountId,
          creativeHeadline: headline || "Shop Best Deals Now",
          creativeBody: primaryText || "Exclusive offers available today on our online store.",
          creativeDescription: description,
          creativeMediaUrl: mediaUrl || "https://example.com/product.jpg",
          callToAction,
          websiteUrl: `${websiteUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sales Campaign publish failed.");

      showToast("Sales Campaign created & published live! 🛍️");
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

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-purple-400 font-mono uppercase tracking-wider">Meta Ads Manager • Sales Campaign Workspace</span>
            <h1 className="font-bold text-slate-100 text-sm">{campName}</h1>
          </div>
        </div>

        {salesSubStep === "CONFIG" && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button onClick={() => setActiveStep(1)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 1 ? "bg-purple-500 text-slate-950" : "text-slate-400"}`}>
              1. Campaign Level
            </button>
            <button onClick={() => setActiveStep(2)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 2 ? "bg-purple-500 text-slate-950" : "text-slate-400"}`}>
              2. Ad Set Level
            </button>
            <button onClick={() => setActiveStep(3)} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 3 ? "bg-purple-500 text-slate-950" : "text-slate-400"}`}>
              3. Ad Level
            </button>
          </div>
        )}
      </header>

      {/* Body Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto border-r border-slate-800">

          {/* CHOICE SCREEN */}
          {salesSubStep === "CHOICE" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-100 text-sm">Choose a Sales Campaign Setup</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailor your sales campaign using Advantage+ shopping setup, or manually configure your bid strategies, Pixel conversion events, and ad formats.
                </p>
              </div>

              <div
                onClick={() => {
                  setSalesPresetMode("tailored");
                  setSalesSubStep("CONFIG");
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  salesPresetMode === "tailored" ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-bold text-slate-100 text-sm">Advantage+ shopping campaign</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Maximize conversions and ROAS with automated targeting and dynamic product placements.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setSalesPresetMode("manual");
                  setSalesSubStep("CONFIG");
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  salesPresetMode === "manual" ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">Manual sales campaign</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Create a sales campaign manually for granular control.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                    Configure →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: CAMPAIGN LEVEL */}
          {salesSubStep === "CONFIG" && activeStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-200">Campaign name</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Sales Campaign Budget</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Budget (₹)</label>
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
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveStep(2)} className="px-6 py-2.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 2: Ad Set →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AD SET LEVEL */}
          {salesSubStep === "CONFIG" && activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">Ad set name</label>
                <input
                  type="text"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Conversion Location & Meta Pixel</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Conversion Location</label>
                    <select
                      value={conversionLocation}
                      onChange={(e: any) => setConversionLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="WEBSITE">Website</option>
                      <option value="APP">App</option>
                      <option value="WEBSITE_AND_APP">Website & App</option>
                      <option value="MESSAGING_APPS">Messaging apps (WhatsApp)</option>
                      <option value="CALLS">Calls</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Meta Pixel Event</label>
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

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPromoModal(true)}
                    className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/30"
                  >
                    🏷️ Manage Promo Codes ({promoMode})
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUtmModal(true)}
                    className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/30"
                  >
                    🔗 Build URL Parameters
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveStep(1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 1
                </button>
                <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold shadow-lg">
                  Proceed to Step 3: Ad →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AD LEVEL */}
          {salesSubStep === "CONFIG" && activeStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-200 mb-1">Ad name</label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* Partnership Ad Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Partnership ad</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Run ads with creators, brands and other businesses.</p>
                </div>
                <input
                  type="checkbox"
                  checked={partnershipAd}
                  onChange={(e) => setPartnershipAd(e.target.checked)}
                  className="accent-purple-500 h-4 w-4"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs">Product Destination & Creative</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Website Checkout URL</label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                  <p className="text-[10px] text-purple-400 mt-1">Final URL with UTM parameters: {websiteUrl}?utm_source={utmSource}&utm_medium={utmMedium}&utm_campaign={utmCampaign}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Get 30% Off Your Purchase Today"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveStep(2)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                  ← Back to Step 2
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-xl flex items-center gap-2"
                >
                  {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Live Sales Campaign 🚀"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Panel Preview */}
        <div className="w-80 bg-slate-950 p-5 space-y-4 shrink-0 hidden lg:block border-l border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-purple-400" /> Sales Goal Preview
            </h4>
            <p className="text-xs text-slate-400">Event: {conversionEvent}</p>
          </div>
        </div>
      </div>

      {/* Sales Modals */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Manage Sales Promo Codes</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="radio" checked={promoMode === "AUTO"} onChange={() => setPromoMode("AUTO")} className="text-purple-500" /> Automatic promo codes from catalogue
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="radio" checked={promoMode === "MANUAL"} onChange={() => setPromoMode("MANUAL")} className="text-purple-500" /> Manual single promo code entry
              </label>
            </div>
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
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
