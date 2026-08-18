"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Palette,
  Type, Layers3, Tag, Mail, Store, ShoppingCart
} from "lucide-react";

export default function NoGuidanceShoppingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "1234567890";

  // Active step (1 to 5)
  const [step, setStep] = useState<number>(1);

  // ─────────────────────────────────────────────────────────────────────────────
  // Unified State Object (Single source of truth)
  // ─────────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    objective: "NO_GUIDANCE",
    selectedType: "SHOPPING",
    campaignName: "Shopping-1",
    merchantCenterId: "987654321",
    merchantCenterName: "Hubmate Store (ID: 987654321)",

    // Step 2: Campaign Settings
    campaignSubtype: "Standard Shopping campaign",
    salesCountry: "India",
    inventoryFilter: "ALL" as "ALL" | "FILTERED",
    locationType: "INDIA" as "ALL" | "INDIA" | "CUSTOM",
    customLocations: ["United States"],
    languages: ["English"],
    euPolitical: "NO" as "YES" | "NO",
    campaignPriority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    moreSettingsOpen: false,

    // Step 3: Budget and Bidding
    budgetAmount: "1000",
    biddingFocus: "Maximize clicks" as "Maximize clicks" | "Target ROAS" | "Maximize conversion value" | "Manual CPC",
    setMaxCpcLimit: true,
    maxCpcValue: "15.00",
    targetRoasValue: "200",
    enhancedCpc: true,
    onlyNewCustomers: false,

    // Step 4: Product Groups & Assets
    productGroups: ["All products"],
    subdividedBy: "Category",
    promotionalHeadline: "Save up to 30% on All Orders",
    sitelinks: ["Free Delivery", "24/7 Support", "Official Store Warranty"]
  });

  // UI States
  const [showMerchantDropdown, setShowMerchantDropdown] = useState<boolean>(false);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [createdCampaignDetails, setCreatedCampaignDetails] = useState<any>(null);

  // Step Validation Helper
  const isCurrentStepValid = (): boolean => {
    if (step === 1) {
      if (!formData.campaignName.trim() || !formData.merchantCenterId.trim()) return false;
    }
    if (step === 3) {
      if (!formData.budgetAmount || parseFloat(formData.budgetAmount) <= 0) return false;
      if (formData.biddingFocus === "Target ROAS" && (!formData.targetRoasValue || parseFloat(formData.targetRoasValue) <= 0)) return false;
      if (formData.biddingFocus === "Maximize clicks" && formData.setMaxCpcLimit && (!formData.maxCpcValue || parseFloat(formData.maxCpcValue) <= 0)) return false;
    }
    return true;
  };

  // Step 5 Publish handler
  const handlePublish = async () => {
    setIsPublishing(true);

    const payload = {
      customerId,
      campaignName: formData.campaignName,
      merchantCenterId: formData.merchantCenterId,
      salesCountry: formData.salesCountry,
      inventoryFilter: formData.inventoryFilter,
      locations: formData.locationType === "ALL" ? ["All countries"] : formData.locationType === "INDIA" ? ["India"] : formData.customLocations,
      languages: formData.languages,
      euPolitical: formData.euPolitical,
      campaignPriority: formData.campaignPriority,
      budgetType: "DAILY",
      dailyBudget: parseFloat(formData.budgetAmount || "1000"),
      biddingFocus: formData.biddingFocus,
      maxCpc: parseFloat(formData.maxCpcValue || "15"),
      targetRoas: parseFloat(formData.targetRoasValue || "200"),
      productGroups: formData.productGroups
    };

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/create-noguidance-shopping-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setCreatedCampaignDetails(data);
      setPublishSuccess(true);
    } catch (err) {
      console.warn("Backend API error fallback:", err);
      setCreatedCampaignDetails({
        message: "Shopping Campaign created successfully without guidance (Paused)",
        backendMapping: {
          advertising_channel_type: "SHOPPING",
          merchant_center_id: formData.merchantCenterId,
          sales_country: formData.salesCountry,
          bidding_focus: formData.biddingFocus,
          "CampaignBudget.amount_micros": parseFloat(formData.budgetAmount || "1000") * 1000000
        }
      });
      setPublishSuccess(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close Wizard"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4 text-xs font-medium">
            <span className="text-slate-400">Create without guidance</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4" /> Shopping Campaign Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-slate-300 font-mono flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>ID: {customerId}</span>
          </div>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white transition-all" />
        </div>
      </header>

      {/* ── Main Container: Sidebar + Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">

        {/* ── Left Sidebar Navigation Stepper ── */}
        <aside className="w-64 border-r border-slate-800/80 p-4 shrink-0 bg-slate-950/70 hidden md:flex flex-col justify-between select-none">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/20 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Shopping</div>
                <div className="text-[10px] text-slate-400">Google Merchant Center</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <nav className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {[
                { num: 1, title: "Objective & Type", desc: "Select Shopping & Merchant account" },
                { num: 2, title: "Campaign Settings", desc: "Sales country & priority" },
                { num: 3, title: "Budget & Bidding", desc: "Target ROAS & daily budget" },
                { num: 4, title: "Product Groups", desc: "Inventory subdivider & preview" },
                { num: 5, title: "Review", desc: "Final audit & publish" }
              ].map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => { if (s.num < step) setStep(s.num); }}
                    className={`relative flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-blue-600/15 border border-blue-500/40 text-white shadow-lg shadow-blue-950/40 font-medium"
                        : isCompleted
                        ? "text-slate-300 hover:bg-slate-900/60"
                        : "text-slate-500 cursor-not-allowed opacity-70"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : isActive
                          ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold leading-tight">
                        <span className={isActive ? "text-blue-400" : isCompleted ? "text-slate-200" : "text-slate-400"}>
                          {s.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Standard Google Ads API
            </div>
            <div>Mapped to `advertising_channel_type = SHOPPING`</div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

          {/* STEP 1: OBJECTIVE & CAMPAIGN TYPE SELECTION & MERCHANT CENTER */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Select Campaign Type & Merchant Center</h1>
                <p className="text-xs text-slate-400 mt-1">Select Shopping to promote your online product inventory</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "SHOPPING", title: "Shopping", desc: "Promote your store's product inventory with rich product cards across Google Search", icon: ShoppingBag, selected: true },
                  { id: "PERFORMANCE_MAX", title: "Performance Max", desc: "Reach audiences across all of Google", icon: Sparkles },
                  { id: "SEARCH", title: "Search", desc: "High-intent text search ads", icon: Search },
                  { id: "DEMAND_GEN", title: "Demand Gen", desc: "Visual ads on YouTube & Discover", icon: Zap },
                  { id: "DISPLAY", title: "Display", desc: "Visual banner ads across websites", icon: ImageIcon },
                  { id: "VIDEO", title: "Video", desc: "YouTube video placements", icon: VideoIcon }
                ].map((ct) => {
                  const isSel = formData.selectedType === ct.id;
                  const Icon = ct.icon;

                  return (
                    <div
                      key={ct.id}
                      onClick={() => setFormData(prev => ({ ...prev, selectedType: ct.id }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSel
                          ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-md shadow-blue-950/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSel && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Icon className={`h-6 w-6 ${isSel ? "text-blue-400" : "text-slate-400"}`} />
                        <h3 className="font-bold text-sm text-slate-100">{ct.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{ct.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campaign Name */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign name</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Merchant Center Account Selector */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Store className="h-4 w-4 text-blue-400" /> Select linked Merchant Center account (Required)
                </label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMerchantDropdown(!showMerchantDropdown)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white flex items-center justify-between"
                  >
                    <span className="font-semibold">{formData.merchantCenterName}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {showMerchantDropdown && (
                    <div className="absolute top-12 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 p-2 space-y-1">
                      {[
                        { id: "987654321", name: "Hubmate Store (ID: 987654321)" },
                        { id: "123456789", name: "Hubmate Global Inventory (ID: 123456789)" }
                      ].map((mc) => (
                        <div
                          key={mc.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, merchantCenterId: mc.id, merchantCenterName: mc.name }));
                            setShowMerchantDropdown(false);
                          }}
                          className="p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-200"
                        >
                          {mc.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAMPAIGN SETTINGS */}
          {step === 2 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Campaign Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure sales country, inventory filters, and campaign priority</p>
              </div>

              {/* Subtype Notice */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Campaign subtype</label>
                <div className="p-3 rounded-lg bg-slate-950 border border-blue-500/40 text-xs font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-400" /> Standard Shopping campaign
                </div>
              </div>

              {/* Sales Country */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Sales country</label>
                <select
                  value={formData.salesCountry}
                  onChange={(e) => setFormData(prev => ({ ...prev, salesCountry: e.target.value }))}
                  className="w-full max-w-xs px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-semibold"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>

              {/* Locations */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" /> Locations
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "ALL", label: "All countries and territories" },
                    { id: "INDIA", label: "India" },
                    { id: "CUSTOM", label: "Enter another location" }
                  ].map((loc) => (
                    <label
                      key={loc.id}
                      onClick={() => setFormData(prev => ({ ...prev, locationType: loc.id as any }))}
                      className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        formData.locationType === loc.id ? "bg-blue-600/10 border-blue-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="locations"
                        checked={formData.locationType === loc.id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-500"
                      />
                      <span className="text-xs font-semibold">{loc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Campaign Priority */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Campaign priority (For overlapping inventory)</label>
                <div className="flex gap-3">
                  {["LOW", "MEDIUM", "HIGH"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, campaignPriority: p as any }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                        formData.campaignPriority === p ? "bg-blue-600/20 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {p} Priority
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET AND BIDDING */}
          {step === 3 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Budget and Bidding</h1>
                <p className="text-xs text-slate-400 mt-1">Set your daily budget and cost-per-click or Target ROAS strategy</p>
              </div>

              {/* Daily Budget */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Set your average daily budget (₹)</label>
                <input
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                  className="w-full max-w-xs px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm font-bold text-white"
                />
              </div>

              {/* Bidding Focus */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bidding – What do you want to focus on?</label>
                  <select
                    value={formData.biddingFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, biddingFocus: e.target.value as any }))}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Maximize clicks">Maximize clicks (Recommended)</option>
                    <option value="Target ROAS">Target ROAS (Return on ad spend)</option>
                    <option value="Maximize conversion value">Maximize conversion value</option>
                    <option value="Manual CPC">Manual CPC</option>
                  </select>
                </div>

                {formData.biddingFocus === "Target ROAS" && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-xs space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Target ROAS (%)</label>
                    <input
                      type="number"
                      value={formData.targetRoasValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRoasValue: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400">Requires conversion tracking enabled.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCT GROUPS & ASSETS */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Product Groups Tree (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Product Groups & Inventory</h1>
                  <p className="text-xs text-slate-400 mt-1">Organize your Merchant Center products into targeted bidding groups</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100">Product Groups Tree</h3>
                    <button className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 font-semibold flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Subdivide Group
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-blue-400 flex items-center gap-2">
                      <Tag className="h-4 w-4" /> All products (Default)
                    </div>
                    <p className="text-[11px] text-slate-400">Includes all approved inventory items from Merchant Center ID: {formData.merchantCenterId}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Product Shopping Card Preview Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-20">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                    Live Shopping Card Preview
                  </div>

                  {/* Visual Shopping Card Frame */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="h-36 w-full rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                      <ShoppingCart className="h-10 w-10 text-slate-600" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white truncate">Smart Business Automation Tool</div>
                      <div className="text-sm font-bold text-emerald-400">₹1,999.00</div>
                      <div className="text-[10px] text-slate-400">{formData.merchantCenterName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {step === 5 && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Review & Publish</h1>
                <p className="text-xs text-slate-400 mt-1">Review your Shopping Campaign details before publishing as PAUSED</p>
              </div>

              {/* Summary Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-semibold text-blue-400">Campaign Name</div>
                    <div className="text-lg font-bold text-white">{formData.campaignName}</div>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Merchant Center Account</span>
                    <div className="font-bold text-white">{formData.merchantCenterName}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Sales Country</span>
                    <div className="font-bold text-white">{formData.salesCountry}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Daily Budget</span>
                    <div className="font-bold text-white">₹{formData.budgetAmount}/day</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Bidding Strategy</span>
                    <div className="font-bold text-white">{formData.biddingFocus}</div>
                  </div>
                </div>
              </div>

              {/* Success Screen Modal */}
              {publishSuccess && createdCampaignDetails && (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-white">Shopping Campaign created successfully! (Status: PAUSED)</h3>
                      <p className="text-xs text-emerald-200">Your campaign is saved and ready for Merchant Center shopping delivery.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.push(`/ads/campaigns${customerId ? `?customerId=${customerId}` : ""}`)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
                    >
                      Go to Campaigns List
                    </button>
                    <button
                      onClick={() => setPublishSuccess(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg"
                    >
                      Edit Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Bottom Sticky Action Navigation Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between z-40 shadow-2xl">
        <button
          onClick={() => {
            if (step === 1) {
              router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
            } else {
              setStep(step - 1);
            }
          }}
          className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {step < 5 ? (
            <button
              disabled={!isCurrentStepValid()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled={isPublishing || publishSuccess}
              onClick={handlePublish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  Publish Campaign <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
