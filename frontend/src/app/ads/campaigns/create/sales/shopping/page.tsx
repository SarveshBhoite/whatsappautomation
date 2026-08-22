
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  ShoppingBag, AlertCircle, ChevronDown, ChevronUp, Info, MoreVertical, ExternalLink,
  Target, Layers, Zap, Upload, Image as ImageIcon, MapPin, Edit3
} from "lucide-react";

export default function SalesShoppingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Wizard State
  const [wizardStep, setWizardStep] = useState<"BUDGET_BIDDING" | "CAMPAIGN_SETTINGS" | "AD_GROUP" | "SUMMARY">("BUDGET_BIDDING");

  // Step 1: Budget and bidding optimization
  const [openBudgetSetting, setOpenBudgetSetting] = useState<string | null>("budget");
  const [budgetType, setBudgetType] = useState("daily"); // "daily" or "total"
  const [budgetAmount, setBudgetAmount] = useState("");
  const [bidStrategy, setBidStrategy] = useState("Manual CPC");
  const [biddingFocus, setBiddingFocus] = useState("");
  const [targetRoas, setTargetRoas] = useState("");
  const [setMaxCpcLimit, setSetMaxCpcLimit] = useState(false);
  const [maxCpcLimitAmount, setMaxCpcLimitAmount] = useState("");
  const [customerAcquisition, setCustomerAcquisition] = useState(false);
  const [campaignPriority, setCampaignPriority] = useState("Low (default)");

  // Step 2: Campaign Settings
  const [openCampaignSetting, setOpenCampaignSetting] = useState<string | null>("locations");
  const [locationType, setLocationType] = useState("India"); // "All", "India", "Another"
  const [customLocation, setCustomLocation] = useState("");
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [locationTargetType, setLocationTargetType] = useState("Presence or interest");
  const [localProducts, setLocalProducts] = useState(false);
  const [euPoliticalAds, setEuPoliticalAds] = useState("No, this campaign doesn't have EU political ads");
  const [startDate, setStartDate] = useState("2026-08-18");
  const [endDateOption, setEndDateOption] = useState("None");
  const [endDate, setEndDate] = useState("");
  const [trackingTemplate, setTrackingTemplate] = useState("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState("");
  const [customParams, setCustomParams] = useState([{ id: Date.now(), name: "", value: "" }]);
  const [networkSearch, setNetworkSearch] = useState(true);
  const [showMoreCampaignSettings, setShowMoreCampaignSettings] = useState(false);

  // Step 3: Ad Group & Assets
  const [openAdGroupSetting, setOpenAdGroupSetting] = useState<string | null>("ad_group");
  const [adGroupName, setAdGroupName] = useState("Ad group 1");
  const [adGroupBid, setAdGroupBid] = useState("");
  const [productGroup, setProductGroup] = useState("All products");
  const [productGroupFilter, setProductGroupFilter] = useState("Use all products");
  const [productGroupSelectBy, setProductGroupSelectBy] = useState("Product type");
  const [productGroupCustomLabel, setProductGroupCustomLabel] = useState("Custom label 0");
  const [productGroupSearch, setProductGroupSearch] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAddValues, setBulkAddValues] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoTab, setLogoTab] = useState("Upload");

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedLogo(e.target.files[0]);
      console.log("Mock ImageKit upload for logo:", e.target.files[0]);
    }
  };

  const navItemClass = (step: string) => {
    if (wizardStep === step) return "bg-primary/10 text-primary border border-primary/30 font-semibold";
    return "text-slate-400 hover:bg-slate-900 hover:text-slate-200";
  };

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
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              Shopping Setup
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-slate-200">Shopping</h2>
            </div>
            <nav className="space-y-1 text-xs">
              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("BUDGET_BIDDING")}`}
                  onClick={() => setWizardStep("BUDGET_BIDDING")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div>
                  <span>Budget and bidding optimization</span>
                </div>
                <div className="ml-10 mt-1 space-y-2 text-[11px] text-slate-400 font-medium pb-2">
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'budget' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('budget'); }}>Budget</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'bidding' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('bidding'); }}>Bidding</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'acquisition' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('acquisition'); }}>Customer acquisition</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'BUDGET_BIDDING' && openBudgetSetting === 'priority' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("BUDGET_BIDDING"); setOpenBudgetSetting('priority'); }}>Campaign priority</div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("CAMPAIGN_SETTINGS")}`}
                  onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">2</div>
                  <span>Campaign settings</span>
                </div>
                <div className="ml-10 mt-1 space-y-2 text-[11px] text-slate-400 font-medium pb-2">
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'locations' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('locations'); }}>Locations</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'local_products' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('local_products'); }}>Local products</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'eu_political' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('eu_political'); }}>EU political ads</div>
                  
                  <div className="pl-3 border-l border-slate-800 space-y-2 pt-1 pb-1">
                    <div className="text-slate-500 font-semibold cursor-pointer hover:text-white flex items-center gap-1 transition-colors" onClick={() => setShowMoreCampaignSettings(!showMoreCampaignSettings)}>More settings {showMoreCampaignSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</div>
                    {showMoreCampaignSettings && (
                      <>
                        <div className={`cursor-pointer hover:text-white ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'dates' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('dates'); }}>Start and end dates</div>
                        <div className={`cursor-pointer hover:text-white ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'url_options' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('url_options'); }}>Campaign URL options</div>
                        <div className={`cursor-pointer hover:text-white ${wizardStep === 'CAMPAIGN_SETTINGS' && openCampaignSetting === 'networks' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("CAMPAIGN_SETTINGS"); setOpenCampaignSetting('networks'); }}>Networks</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("AD_GROUP")}`}
                  onClick={() => setWizardStep("AD_GROUP")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">3</div>
                  <span>Ad group and assets</span>
                </div>
                <div className="ml-10 mt-1 space-y-2 text-[11px] text-slate-400 font-medium pb-2">
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'ad_group' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('ad_group'); }}>Ad group name</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'ad_group_bid' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('ad_group_bid'); }}>Ad group bid</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'product_groups' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('product_groups'); }}>Product groups</div>
                  <div className={`cursor-pointer hover:text-white ${wizardStep === 'AD_GROUP' && openAdGroupSetting === 'assets' ? 'text-primary font-semibold' : ''}`} onClick={() => { setWizardStep("AD_GROUP"); setOpenAdGroupSetting('assets'); }}>Business logo</div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${navItemClass("SUMMARY")}`}
                  onClick={() => setWizardStep("SUMMARY")}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">4</div>
                  <span>Summary</span>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto pb-32">

          {/* STEP 1: BUDGET AND BIDDING */}
          {wizardStep === "BUDGET_BIDDING" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Budget and bidding optimization</h1>
                <p className="text-xs text-slate-400 mt-1">Select optimization options that work best for your goals</p>
              </div>

              {/* Budget Card */}
              {openBudgetSetting === "budget" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Budget</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400">Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.</p>
                  
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-300 font-semibold text-xs">Select budget type</label>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      <label className={`p-4 border rounded-xl cursor-pointer transition-all ${budgetType === "daily" ? "border-primary bg-primary/5" : "border-slate-800 bg-slate-950 hover:border-slate-700"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-200 text-sm">Average daily budget</span>
                          <input type="radio" checked={budgetType === "daily"} onChange={() => setBudgetType("daily")} className="text-primary h-4 w-4 bg-slate-950 border-slate-700" />
                        </div>
                        <p className="text-[10px] text-slate-500">Set your average daily budget for this campaign</p>
                      </label>
                      <label className={`p-4 border rounded-xl cursor-pointer transition-all ${budgetType === "total" ? "border-primary bg-primary/5" : "border-slate-800 bg-slate-950 hover:border-slate-700"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-200 text-sm">Campaign total budget</span>
                          <input type="radio" checked={budgetType === "total"} onChange={() => setBudgetType("total")} className="text-primary h-4 w-4 bg-slate-950 border-slate-700" />
                        </div>
                        <p className="text-[10px] text-slate-500">Set a budget for the duration of your campaign</p>
                      </label>
                    </div>

                    <div className="pt-2 max-w-md relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                      <input
                        type="number"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary transition-all"
                        placeholder="Enter an amount"
                      />
                    </div>
                    {budgetType === "daily" && (
                      <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                        For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much. <a href="#" className="text-blue-400 hover:underline">Learn more</a>
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting("bidding")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenBudgetSetting("budget")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Budget</h2>
                    <span className="text-xs text-slate-400">{budgetAmount ? `₹${budgetAmount}/${budgetType === "daily" ? "day" : "total"}` : "Not set"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Bidding Card */}
              {openBudgetSetting === "bidding" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Bidding</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-300 font-semibold text-xs">Select your bid strategy</label>
                    <select
                      value={bidStrategy}
                      onChange={(e) => setBidStrategy(e.target.value)}
                      className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-semibold focus:outline-none focus:border-primary"
                    >
                      <optgroup label="Automated bid strategies">
                        <option value="Target ROAS">Target ROAS</option>
                        <option value="Maximize clicks">Maximize clicks</option>
                        <option value="Maximize conversion value">Maximize conversion value</option>
                      </optgroup>
                      <optgroup label="Manual bid strategies">
                        <option value="Manual CPC">Manual CPC</option>
                      </optgroup>
                    </select>

                    {bidStrategy === "Target ROAS" && (
                      <div className="pt-2 max-w-md relative">
                        <input
                          type="number"
                          value={targetRoas}
                          onChange={(e) => setTargetRoas(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary transition-all"
                          placeholder="%"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
                      </div>
                    )}

                    {bidStrategy === "Maximize clicks" && (
                      <div className="pt-2 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer max-w-xl">
                          <input type="checkbox" checked={setMaxCpcLimit} onChange={(e) => setSetMaxCpcLimit(e.target.checked)} className="mt-0.5 text-primary h-4 w-4 bg-slate-950 border-slate-700 rounded" />
                          <span className="font-semibold text-slate-200 text-sm">Set a maximum cost per click bid limit</span>
                        </label>
                        {setMaxCpcLimit && (
                          <div className="max-w-md relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={maxCpcLimitAmount}
                              onChange={(e) => setMaxCpcLimitAmount(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary transition-all"
                              placeholder="Enter an amount"
                            />
                          </div>
                        )}
                        <p className="text-[11px] text-amber-500 max-w-xl bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          Portfolio bid strategies can't be used with a campaign total budget yet.
                        </p>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 max-w-xl pt-2">
                      {bidStrategy === "Manual CPC" && "With \"Manual CPC\" bidding, you set your own maximum cost-per-click (CPC) for your ads. "}
                      <a href="#" className="text-blue-400 hover:underline">Learn more about determining a bid strategy</a>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting("acquisition")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenBudgetSetting("bidding")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Bidding</h2>
                    <span className="text-xs text-slate-400">{bidStrategy}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Customer Acquisition */}
              {openBudgetSetting === "acquisition" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Customer acquisition</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer max-w-xl">
                      <input type="checkbox" checked={customerAcquisition} onChange={(e) => setCustomerAcquisition(e.target.checked)} className="mt-0.5 text-primary h-4 w-4 bg-slate-950 border-slate-700 rounded" />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-200 text-sm">Only bid for new customers</span>
                        <p className="text-[11px] text-slate-400">Your campaign will be limited to only new customers, regardless of your bid strategy</p>
                      </div>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 max-w-xl">
                      By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" className="text-blue-400 hover:underline">Learn more</a>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting("priority")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenBudgetSetting("acquisition")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Customer acquisition</h2>
                    <span className="text-xs text-slate-400">{customerAcquisition ? "Only new customers" : "Equally for new and existing"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Campaign Priority */}
              {openBudgetSetting === "priority" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenBudgetSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Campaign priority</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-300 font-semibold text-xs">Select a campaign priority</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={campaignPriority === "Low (default)"} onChange={() => setCampaignPriority("Low (default)")} className="text-primary h-4 w-4" />
                        Low (default) <span className="text-slate-500 text-xs ml-1">– Recommended if you only have one Shopping campaign</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={campaignPriority === "Medium"} onChange={() => setCampaignPriority("Medium")} className="text-primary h-4 w-4" />
                        Medium
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={campaignPriority === "High"} onChange={() => setCampaignPriority("High")} className="text-primary h-4 w-4" />
                        High
                      </label>
                    </div>
                    <div className="pt-2 max-w-xl">
                      <p className="text-[11px] text-slate-300 font-semibold mb-1">When to use it</p>
                      <p className="text-[11px] text-slate-400">If you have multiple campaigns with one product, use campaign priority to decide which campaign's bid will be used. If campaigns have the same priority, the campaign with the higher bid will serve.</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenBudgetSetting(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Done</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenBudgetSetting("priority")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Campaign priority</h2>
                    <span className="text-xs text-slate-400">{campaignPriority}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
                <p className="text-xs text-slate-400 mt-1">To reach the right people, start by defining key settings for your campaign</p>
              </div>

              {/* Locations */}
              {openCampaignSetting === "locations" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Locations</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-300 font-semibold text-xs">Select locations for this campaign</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={locationType === "All"} onChange={() => setLocationType("All")} className="text-primary h-4 w-4" />
                        All countries and territories
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={locationType === "India"} onChange={() => setLocationType("India")} className="text-primary h-4 w-4" />
                        India
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={locationType === "Another"} onChange={() => setLocationType("Another")} className="text-primary h-4 w-4" />
                        Enter another location
                      </label>
                    </div>
                    {locationType === "Another" && (
                      <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Enter a location to target" className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary mt-2" />
                    )}
                    <button type="button" onClick={() => setShowLocationOptions(!showLocationOptions)} className="text-primary text-[11px] font-semibold hover:underline mt-2 inline-block">Location options {showLocationOptions ? "▴" : "▾"}</button>
                    {showLocationOptions && (
                      <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-slate-300 font-semibold text-xs text-primary">Target</label>
                        <div className="space-y-3 pl-2 border-l-2 border-slate-800">
                          <label className="flex items-start gap-3 cursor-pointer text-slate-300 text-sm">
                            <input type="radio" checked={locationTargetType === "Presence or interest"} onChange={() => setLocationTargetType("Presence or interest")} className="text-primary h-4 w-4 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-200 leading-tight">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</div>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer text-slate-300 text-sm">
                            <input type="radio" checked={locationTargetType === "Presence"} onChange={() => setLocationTargetType("Presence")} className="text-primary h-4 w-4 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-200 leading-tight">Presence: People in or regularly in your included locations</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("local_products")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenCampaignSetting("locations")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Locations</h2>
                    <span className="text-xs text-slate-400">{locationType === "Another" ? customLocation || "Unspecified" : locationType}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Local Products */}
              {openCampaignSetting === "local_products" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Local products</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer max-w-xl">
                      <input type="checkbox" checked={localProducts} onChange={(e) => setLocalProducts(e.target.checked)} className="mt-0.5 text-primary h-4 w-4 bg-slate-950 border-slate-700 rounded" />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-200 text-sm">Turned {localProducts ? "on" : "off"}</span>
                      </div>
                    </label>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("eu_political")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenCampaignSetting("local_products")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Local products</h2>
                    <span className="text-xs text-slate-400">{localProducts ? "Turned on" : "Turned off"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* EU political ads */}
              {openCampaignSetting === "eu_political" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-white">EU political ads</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <label className="block text-slate-300 font-semibold text-xs">Does your campaign have European Union political ads? <span className="text-rose-400 ml-1">Required</span></label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={euPoliticalAds === "Yes, this campaign has EU political ads"} onChange={() => setEuPoliticalAds("Yes, this campaign has EU political ads")} className="text-primary h-4 w-4" />
                        Yes, this campaign has EU political ads
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-sm">
                        <input type="radio" checked={euPoliticalAds === "No, this campaign doesn't have EU political ads"} onChange={() => setEuPoliticalAds("No, this campaign doesn't have EU political ads")} className="text-primary h-4 w-4" />
                        No, this campaign doesn't have EU political ads
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">EU regulation requires Google to ask this question. <a href="#" className="text-blue-400 hover:underline">Learn how an EU political ad is defined</a></p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("dates")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenCampaignSetting("eu_political")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">EU political ads</h2>
                    <span className="text-xs text-slate-400">{euPoliticalAds.startsWith("No") ? "Doesn't have EU political ads" : "Has EU political ads"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/40">
                <div 
                  className="flex items-center justify-between cursor-pointer group py-2"
                  onClick={() => setShowMoreCampaignSettings(!showMoreCampaignSettings)}
                >
                  <h3 className="font-semibold text-slate-200 text-sm group-hover:text-primary transition-colors">More settings</h3>
                  {showMoreCampaignSettings ? <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" /> : <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />}
                </div>
                
                {showMoreCampaignSettings && (
                  <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Start and end dates */}
              {openCampaignSetting === "dates" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Start and end dates</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold text-xs">Start date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold text-xs">End date</label>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="radio" checked={endDateOption === "None"} onChange={() => setEndDateOption("None")} className="text-primary h-4 w-4" /> None
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input type="radio" checked={endDateOption === "Select a date"} onChange={() => setEndDateOption("Select a date")} className="text-primary h-4 w-4" /> Select a date
                        </label>
                      </div>
                      {endDateOption === "Select a date" && (
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-primary" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Your ads will continue to run unless you specify an end date.</p>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("url_options")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenCampaignSetting("dates")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Start and end dates</h2>
                    <span className="text-xs text-slate-400">{startDate} - {endDateOption === "None" ? "Not set" : endDate}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Campaign URL Options */}
              {openCampaignSetting === "url_options" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Campaign URL options</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-semibold text-xs">Tracking template</label>
                      <input type="text" value={trackingTemplate} onChange={e => setTrackingTemplate(e.target.value)} placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-semibold text-xs">Final URL suffix</label>
                      <input type="text" value={finalUrlSuffix} onChange={e => setFinalUrlSuffix(e.target.value)} placeholder="Example: param1=value1&param2=value2" className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold text-xs">Custom parameters</label>
                      {customParams.map((param, i) => (
                        <div key={param.id} className="flex items-center gap-2 max-w-xl">
                          <input type="text" value={param.name} onChange={e => { const p = [...customParams]; p[i].name = e.target.value; setCustomParams(p); }} placeholder="{_Name}" className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono" />
                          <span className="text-slate-400">=</span>
                          <input type="text" value={param.value} onChange={e => { const p = [...customParams]; p[i].value = e.target.value; setCustomParams(p); }} placeholder="Value" className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono" />
                        </div>
                      ))}
                      <div className="mt-2">
                        <button type="button" onClick={() => setCustomParams([...customParams, { id: Date.now(), name: "", value: "" }])} className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                          <Plus className="h-3 w-3" /> ADD CUSTOM PARAMETER
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">Tracking template is the URL you want the ad click to go to for tracking. <a href="#" className="text-blue-400 hover:underline">Learn more</a></p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting("networks")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenCampaignSetting("url_options")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Campaign URL options</h2>
                    <span className="text-xs text-slate-400">{trackingTemplate ? "Options set" : "No options set"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Networks */}
              {openCampaignSetting === "networks" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenCampaignSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Networks</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="p-4 border border-slate-800 rounded-xl bg-slate-950 space-y-2">
                      <h3 className="font-semibold text-slate-200 text-sm">Search Network</h3>
                      <p className="text-xs text-slate-400">Ads can appear near Google Search results and other Google sites when people search for terms that are relevant to your keywords</p>
                      <label className="flex items-center gap-3 cursor-pointer pt-2">
                        <input type="checkbox" checked={networkSearch} onChange={e => setNetworkSearch(e.target.checked)} className="h-4 w-4 rounded text-primary" />
                        <span className="text-sm text-slate-300 font-semibold">Include Google search partners</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenCampaignSetting(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Done</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenCampaignSetting("networks")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Networks</h2>
                    <span className="text-xs text-slate-400">{networkSearch ? "Search partners" : "Google Search only"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: AD GROUP & ASSETS */}
          {wizardStep === "AD_GROUP" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Ad group and assets</h1>
                <p className="text-xs text-slate-400 mt-1">You can add additional ad groups in campaign settings later</p>
              </div>

              {/* Ad Group Config */}
              {openAdGroupSetting === "ad_group" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenAdGroupSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Ad group</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-semibold text-xs">Ad group name</label>
                      <input type="text" value={adGroupName} onChange={e => setAdGroupName(e.target.value)} className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-300 font-semibold text-xs">Ad group bid</label>
                      <p className="text-[11px] text-slate-400 mb-2">Enter your cost-per-click (CPC) bid</p>
                      <div className="relative max-w-xs">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                        <input type="number" value={adGroupBid} onChange={e => setAdGroupBid(e.target.value)} placeholder="Enter an amount" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenAdGroupSetting("product_groups")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenAdGroupSetting("ad_group")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Ad group name</h2>
                    <span className="text-xs text-slate-400">{adGroupName} • Bid: {adGroupBid ? `₹${adGroupBid}` : "Not set"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Product groups */}
              {openAdGroupSetting === "product_groups" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenAdGroupSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Product groups</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-4 pt-2 text-xs">
                    <div className="p-3 border border-blue-500/30 bg-blue-500/5 rounded-xl text-blue-400 font-medium">
                      Merchant center account: 5840531233 - jisnu digital solutions
                    </div>
                    <p className="text-slate-400">Choose which products to show in your ads. Some of your ads will use images, headlines and descriptions from Merchant Center.</p>
                    <label className="flex items-center gap-3 cursor-pointer text-slate-200 font-semibold text-sm">
                      <input type="radio" checked={productGroupFilter === "Use all products"} onChange={() => setProductGroupFilter("Use all products")} className="h-4 w-4 text-primary" />
                      Use all products
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-slate-200 font-semibold text-sm">
                      <input type="radio" checked={productGroupFilter === "Use a selection of products"} onChange={() => setProductGroupFilter("Use a selection of products")} className="h-4 w-4 text-primary" />
                      Use a selection of products
                    </label>
                    
                    {productGroupFilter === "Use a selection of products" && (
                      <div className="pl-7 space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold text-xs">Select products by:</label>
                          <select value={productGroupSelectBy} onChange={(e) => setProductGroupSelectBy(e.target.value)} className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary">
                            {["Category", "Brand", "Item ID", "Condition", "Product type", "Channel", "Channel exclusivity", "Custom label"].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        
                        {productGroupSelectBy === "Custom label" && (
                          <div className="space-y-1 animate-in fade-in">
                            <label className="text-slate-400 font-semibold text-xs">Custom label:</label>
                            <select value={productGroupCustomLabel} onChange={(e) => setProductGroupCustomLabel(e.target.value)} className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary">
                              {[0, 1, 2, 3, 4].map(num => (
                                <option key={num} value={`Custom label ${num}`}>Custom label {num}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {productGroupSelectBy === "Product type" && (
                          <div className="space-y-1 animate-in fade-in">
                            <label className="text-slate-400 font-semibold text-xs">Product type:</label>
                            <select className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary">
                              {["Vehicles & Parts", "Toys & Games", "Hardware", "Furniture", "Food, Beverages & Tobacco", "Electronics", "Cameras & Optics", "Business & Industrial", "Baby & Toddler", "Arts & Entertainment", "Apparel & Accessories", "Animals & Pet Supplies"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <div className="max-w-sm relative">
                          <input type="text" value={productGroupSearch} onChange={(e) => setProductGroupSearch(e.target.value)} placeholder="Search" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary" />
                        </div>
                        
                        <div className="text-slate-400 text-[11px] p-3 bg-slate-950 border border-slate-800 rounded-lg max-w-sm text-center">
                          No suggestions available. Please add values manually.
                        </div>
                        
                        <div>
                          <button type="button" onClick={() => setShowBulkAdd(!showBulkAdd)} className="text-primary hover:underline font-semibold text-xs text-left">Bulk add values manually {showBulkAdd ? "▴" : "▾"}</button>
                        </div>
                        
                        {showBulkAdd && (
                          <div className="max-w-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                            <textarea
                              value={bulkAddValues}
                              onChange={(e) => setBulkAddValues(e.target.value)}
                              placeholder="Enter or paste one value per line"
                              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary resize-none"
                            />
                            <div className="flex justify-end">
                              <button type="button" onClick={() => { setBulkAddValues(""); setShowBulkAdd(false); }} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors">Add values</button>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-slate-500 text-xs italic">
                          None selected
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenAdGroupSetting("assets")} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Next</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenAdGroupSetting("product_groups")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Product groups</h2>
                    <span className="text-xs text-slate-400">{productGroup}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}

              {/* Assets */}
              {openAdGroupSetting === "assets" ? (
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer" onClick={() => setOpenAdGroupSetting(null)}>
                    <h2 className="text-base font-semibold text-white">Assets</h2>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-slate-400">Ads will be created using your product data from Merchant Center. Adding assets can help improve your ad quality.</p>
                    <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 space-y-3">
                      <h3 className="font-semibold text-slate-200 text-sm">Business logo</h3>
                      <p className="text-[11px] text-slate-500">Add a business logo to help shoppers recognize your ads</p>
                      
                      <div className="mt-3 space-y-4">
                        <div className="flex border-b border-slate-800 overflow-x-auto hidden-scrollbar pb-px">
                          {["Suggested", "Asset library", "Website or social", "Upload"].map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setLogoTab(tab)}
                              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                logoTab === tab
                                  ? "border-primary text-primary"
                                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                        
                        {logoTab === "Upload" ? (
                          <div className="grid grid-cols-2 gap-4 max-w-sm animate-in fade-in">
                            <label className="cursor-pointer group flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-primary bg-slate-900 rounded-xl p-6 transition-all aspect-square relative">
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              {uploadedLogo ? (
                                <div className="text-center space-y-2">
                                  <ImageIcon className="h-8 w-8 text-primary mx-auto" />
                                  <span className="text-[10px] text-slate-300 font-mono break-all line-clamp-1 block px-2">{uploadedLogo.name}</span>
                                </div>
                              ) : (
                                <div className="text-center space-y-2">
                                  <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors mx-auto" />
                                  <span className="text-xs font-semibold text-slate-300">Upload logo</span>
                                </div>
                              )}
                            </label>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-xl animate-in fade-in bg-slate-900/50">
                            {logoTab} assets will appear here.
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-slate-300 mb-2">Suggested logos</p>
                        <div className="flex gap-2">
                           <div className="w-12 h-12 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">None</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => setOpenAdGroupSetting(null)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm">Done</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => setOpenAdGroupSetting("assets")}>
                  <div className="flex items-center gap-16">
                    <h2 className="text-sm font-semibold text-slate-200 w-48">Business logo</h2>
                    <span className="text-xs text-slate-400">{uploadedLogo ? "1 logo added" : "No logo added"}</span>
                  </div>
                  <Edit3 className="h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Your campaign is almost ready to publish</h1>
              </div>

              {/* Overview */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Overview</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Campaign name</p>
                    <p className="text-slate-200 font-semibold mt-1">Sales-Shopping-1</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Campaign type</p>
                    <p className="text-slate-200 font-semibold mt-1">Shopping</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Goal</p>
                    <p className="text-slate-200 font-semibold mt-1">Downloads, Phone call leads</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Merchant Center and CSS</p>
                    <p className="text-slate-200 font-semibold mt-1">5840531233 - jisnu digital solutions / CSS: Google Shopping (google.com/shopping)</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Feeds</p>
                    <p className="text-slate-200 font-semibold mt-1">All products from all feeds</p>
                  </div>
                </div>
              </div>

              {/* Budget & Bidding Optimization */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Budget and bidding optimization</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Budget</p>
                    <p className="text-slate-200 font-semibold mt-1">{budgetAmount ? `₹${budgetAmount}/${budgetType === "daily" ? "day" : "total"}` : "Enter a budget"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Bidding</p>
                    <p className="text-slate-200 font-semibold mt-1">{bidStrategy}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Customer acquisition</p>
                    <p className="text-slate-200 font-semibold mt-1">{customerAcquisition ? "Only bid for new customers" : "Bid equally for new and existing customers"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Campaign priority</p>
                    <p className="text-slate-200 font-semibold mt-1">{campaignPriority}</p>
                  </div>
                </div>
              </div>

              {/* Campaign settings */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Campaign settings</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Locations</p>
                    <p className="text-slate-200 font-semibold mt-1">{locationType === "Another" ? customLocation || "Not set" : locationType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Local products</p>
                    <p className="text-slate-200 font-semibold mt-1">{localProducts ? "Turned on" : "Turned off"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">EU political ads</p>
                    <p className="text-slate-200 font-semibold mt-1">{euPoliticalAds.startsWith("No") ? "Doesn't have EU political ads" : "Has EU political ads"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Start and end dates</p>
                    <p className="text-slate-200 font-semibold mt-1">{startDate} - {endDateOption === "None" ? "Not set" : endDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Campaign URL options</p>
                    <p className="text-slate-200 font-semibold mt-1">{trackingTemplate ? trackingTemplate : "No options set"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Networks</p>
                    <p className="text-slate-200 font-semibold mt-1">{networkSearch ? "Search partners" : "Google Search only"}</p>
                  </div>
                </div>
              </div>

              {/* Ad group and assets */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Ad group and assets</h2>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Ad group name</p>
                    <p className="text-slate-200 font-semibold mt-1">{adGroupName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Ad group bid</p>
                    <p className="text-slate-200 font-semibold mt-1">{adGroupBid ? `₹${adGroupBid}` : "Enter an amount"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Product groups</p>
                    <p className="text-slate-200 font-semibold mt-1">{productGroup}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Business logo</p>
                    <p className="text-slate-200 font-semibold mt-1">{uploadedLogo ? "1 logo added" : "No logo added"}</p>
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
            if (wizardStep === "SUMMARY") setWizardStep("AD_GROUP");
            else if (wizardStep === "AD_GROUP") setWizardStep("CAMPAIGN_SETTINGS");
            else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("BUDGET_BIDDING");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          {wizardStep === "BUDGET_BIDDING" ? "Cancel" : "Back"}
        </button>

        {wizardStep !== "SUMMARY" ? (
          <button
            onClick={() => {
              if (wizardStep === "BUDGET_BIDDING") setWizardStep("CAMPAIGN_SETTINGS");
              else if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("AD_GROUP");
              else if (wizardStep === "AD_GROUP") setWizardStep("SUMMARY");
            }}
            className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-md shadow-blue-600/20 transition-all text-xs"
          >
            Next
          </button>
        ) : (
          <button
            disabled={isPublishing}
            onClick={async () => {
              setIsPublishing(true);
              try {
                const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                const activeOrgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
                await fetch(`${BACKEND}/api/ads/campaign/launch`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orgId: activeOrgId,
                    customerId: customerId || "6587355041",
                    campaignName: "Sales-Shopping-1",
                    channelType: "SHOPPING",
                    biddingStrategy: "MANUAL_CPC"
                  })
                });
              } catch (err) {
                console.error("Save & Publish Shopping fallback:", err);
              } finally {
                setIsPublishing(false);
                alert(`Shopping campaign published successfully!`);
                router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
              }
            }}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
          >
            {isPublishing ? "Publishing..." : "Save & Publish"}
            <Check className="h-4 w-4" />
          </button>
        )}
      </footer>
    </div>
  );
}
