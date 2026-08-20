"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Sparkles, Layers, Target, Search, Video, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3, Bell, ArrowLeft, Copy, Eye, MoreVertical
} from "lucide-react";

export default function SalesDemandGenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "CAMPAIGN_SETTINGS" | "AD_GROUP" | "AD" | "REVIEW"
  const [demandGenStep, setDemandGenStep] = useState<"CAMPAIGN_SETTINGS" | "AD_GROUP" | "AD" | "REVIEW">("CAMPAIGN_SETTINGS");

  // Get formatted today's date YYYY-MM-DD
  const getTodayFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Demand Gen Campaign States
  const [demandGenCampaignName, setDemandGenCampaignName] = useState<string>(`Demand Gen - ${getTodayFormattedDate()}`);
  const [selectedSourceCampaign, setSelectedSourceCampaign] = useState<string | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState<string>("");

  // Sample old campaign list
  const existingCampaigns = [
    { id: "c-101", name: "Demand Gen - 2026-07-15", type: "Demand Gen", status: "Active", budget: "₹1,500/day" },
    { id: "c-102", name: "Sales Summer Promo - Video", type: "Video", status: "Ended", budget: "₹2,000/day" },
    { id: "c-103", name: "Demand Gen - High Intent Audiences", type: "Demand Gen", status: "Active", budget: "₹3,500/day" },
    { id: "c-104", name: "Website Traffic - Discovery 2026", type: "Display", status: "Paused", budget: "₹1,000/day" },
    { id: "c-105", name: "Demand Gen - Product Launch", type: "Demand Gen", status: "Active", budget: "₹5,000/day" },
  ];
  const [demandGenGoal, setDemandGenGoal] = useState<"Conversions" | "Clicks" | "Conversion value" | "YouTube engagements">("Conversions");
  const [includeViewThrough, setIncludeViewThrough] = useState<boolean>(false);
  const [targetCpaDemandGen, setTargetCpaDemandGen] = useState<boolean>(false);
  const [demandGenBudgetType, setDemandGenBudgetType] = useState<string>("Daily");
  const [demandGenBudgetAmount, setDemandGenBudgetAmount] = useState<string>("");
  const [onlyNewCustomers, setOnlyNewCustomers] = useState<boolean>(false);
  const [mainBrandColor, setMainBrandColor] = useState<string>("#3b82f6");
  const [accentBrandColor, setAccentBrandColor] = useState<string>("#10b981");
  const [brandFont, setBrandFont] = useState<string>("Any font");
  const [startDate, setStartDate] = useState<string>(getTodayFormattedDate());
  const [endDate, setEndDate] = useState<string>("");
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");

  // Ad Group List State (Supporting Multiple Ad Groups)
  const [adGroups, setAdGroups] = useState<Array<{ id: string; name: string; status: "ENABLED" | "PAUSED" }>>([
    { id: "ag-1", name: "Ad group 1", status: "ENABLED" }
  ]);
  const [activeAdGroupId, setActiveAdGroupId] = useState<string>("ag-1");
  const [openMenuAgId, setOpenMenuAgId] = useState<string | null>(null);

  const activeAdGroup = adGroups.find(ag => ag.id === activeAdGroupId) || adGroups[0];

  const handleCreateNewAdGroup = () => {
    const nextNum = adGroups.length + 1;
    const newAg = { id: `ag-${Date.now()}`, name: `Ad group ${nextNum}`, status: "ENABLED" as const };
    setAdGroups(prev => [...prev, newAg]);
    setActiveAdGroupId(newAg.id);
    setDemandGenStep("AD_GROUP");
  };

  const handleDuplicateAdGroup = (agId: string) => {
    const target = adGroups.find(ag => ag.id === agId);
    if (!target) return;
    const duplicated = { id: `ag-${Date.now()}`, name: `${target.name} (Copy)`, status: "ENABLED" as const };
    setAdGroups(prev => [...prev, duplicated]);
    setActiveAdGroupId(duplicated.id);
  };

  const handleDeleteAdGroup = (agId: string) => {
    if (adGroups.length <= 1) {
      alert("Campaign must contain at least one ad group.");
      return;
    }
    const filtered = adGroups.filter(ag => ag.id !== agId);
    setAdGroups(filtered);
    if (activeAdGroupId === agId) {
      setActiveAdGroupId(filtered[0].id);
    }
  };
  
  // Advanced Section States
  const [useCampaignLocationLang, setUseCampaignLocationLang] = useState<boolean>(true);
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_OR_INTEREST" | "PRESENCE">("PRESENCE_OR_INTEREST");
  const [deviceTargetingType, setDeviceTargetingType] = useState<"ALL" | "SPECIFIC">("ALL");
  const [adScheduleDays, setAdScheduleDays] = useState<string>("All days");
  const [adScheduleStartTime, setAdScheduleStartTime] = useState<string>("00:00");
  const [adScheduleEndTime, setAdScheduleEndTime] = useState<string>("23:45");
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");
  const [customParametersDemandGen, setCustomParametersDemandGen] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);
  const [ipExclusionsInput, setIpExclusionsInput] = useState<string>("");

  // Location & Language Level States
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("INDIA");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");

  // Channels Selection State
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"]);

  // Ad Level States
  const [adName, setAdName] = useState<string>("Ad 1");
  const [adFinalUrl, setAdFinalUrl] = useState<string>("");
  const [adHeadlines, setAdHeadlines] = useState<string[]>(["", "", ""]);
  const [adDescriptions, setAdDescriptions] = useState<string[]>(["", ""]);
  const [businessName, setBusinessName] = useState<string>("");

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Top Navigation Header ────────────────── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all flex items-center gap-1 text-xs cursor-pointer"
            title="Back to campaign objectives"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-slate-200">Google Ads • Demand Gen</span>
          </div>
        </div>

        {/* Global Search pill matching Google Ads header in screenshot */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-xs max-w-md w-full text-slate-400 shadow-inner">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>"What are my top performing campaigns?"</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono hidden sm:inline">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white" />
          <button
            onClick={() => router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sub-Navigation Sidebar matching screenshot */}
        <aside className="w-64 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-950/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            {/* Campaign Name Header */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="truncate">{demandGenCampaignName}</span>
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            </div>

            {/* Navigation Tree Matching Google Ads Hierarchy */}
            <nav className="space-y-1 text-xs font-sans">
              {/* Campaign Header */}
              <div
                onClick={() => setDemandGenStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                  demandGenStep === "CAMPAIGN_SETTINGS"
                    ? "bg-blue-600/20 text-blue-400 font-bold"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <LayoutGrid className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{demandGenCampaignName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="border-t border-slate-800 my-2" />

              {/* Dynamic List of Ad Groups with Nested Ads */}
              <div className="space-y-1">
                {adGroups.map((ag) => {
                  const isAgActive = demandGenStep === "AD_GROUP" && activeAdGroupId === ag.id;
                  const isMenuOpen = openMenuAgId === ag.id;

                  return (
                    <div key={ag.id} className="space-y-0.5">
                      {/* Ad Group Row */}
                      <div className="relative">
                        <div
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setDemandGenStep("AD_GROUP");
                          }}
                          className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                            isAgActive
                              ? "bg-blue-600/20 text-blue-400 font-bold"
                              : "text-slate-300 hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <LayoutGrid className={`h-4 w-4 shrink-0 ${isAgActive ? "text-blue-400" : "text-slate-400"}`} />
                            <span className="truncate">{ag.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuAgId(isMenuOpen ? null : ag.id);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Context Menu Popup */}
                        {isMenuOpen && (
                          <div className="absolute left-full top-0 ml-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 text-xs animate-in fade-in duration-150">
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                handleDuplicateAdGroup(ag.id);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                alert(`${ag.name} status updated`);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                            >
                              Enable
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                handleDeleteAdGroup(ag.id);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-800 text-rose-400 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                            <div className="border-t border-slate-800 my-1" />
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                handleCreateNewAdGroup();
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-800 text-primary font-semibold transition-colors cursor-pointer"
                            >
                              Create new ad group
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Nested Child Ad 1 */}
                      <div
                        onClick={() => {
                          setActiveAdGroupId(ag.id);
                          setDemandGenStep("AD");
                        }}
                        className={`ml-6 p-2 rounded-r-full flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                          demandGenStep === "AD" && activeAdGroupId === ag.id
                            ? "bg-blue-600/20 text-blue-400 font-bold"
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Plus className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">Ad 1</span>
                        </div>
                        <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                      </div>

                      <div className="border-t border-slate-800/60 my-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Review campaign */}
              <div
                onClick={() => setDemandGenStep("REVIEW")}
                className={`p-2.5 rounded-r-full flex items-center gap-2.5 font-semibold cursor-pointer transition-all ${
                  demandGenStep === "REVIEW"
                    ? "bg-blue-600/20 text-blue-400 font-bold"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Info className="h-4 w-4 text-slate-400" />
                <span>Review campaign</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-5xl mx-auto">
          
          {demandGenStep === "AD_GROUP" ? (
            /* ── AD GROUP SETUP PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">{activeAdGroup.name}</h1>

              {/* 1. Ad group name Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Ad group name</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={activeAdGroup.name}
                    onChange={(e) => {
                      const updatedName = e.target.value;
                      setAdGroups(prev => prev.map(ag => ag.id === activeAdGroup.id ? { ...ag, name: updatedName } : ag));
                    }}
                    maxLength={256}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                  />
                  <div className="flex justify-end text-[10px] text-slate-500 font-mono">
                    <span>{activeAdGroup.name.length} / 256</span>
                  </div>
                </div>
              </div>

              {/* 2. Locations Card (Matching Screenshot Radio Options) */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-xs text-slate-400">Select locations for this campaign</p>

                <div className="space-y-3 text-xs">
                  {/* Option 1: All countries and territories */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="locationSelection"
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">All countries and territories</span>
                  </label>

                  {/* Option 2: India */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="locationSelection"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-200">India</span>
                  </label>

                  {/* Option 3: Enter another location */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="locationSelection"
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
                </div>
              </div>

              {/* 3. Languages Card (Matching Screenshot Search Field & All Languages Pill) */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-xs text-slate-400">Select the languages your customers speak.</p>

                <div className="space-y-3">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearchInput}
                      onChange={(e) => setLanguageSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && languageSearchInput.trim()) {
                          setSelectedLanguages(prev => [...prev, languageSearchInput.trim()]);
                          setLanguageSearchInput("");
                        }
                      }}
                      placeholder="Start typing or select a language"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                      All languages
                    </span>
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

              {/* 4. Channels Card (Matching Screenshot Channels Option) */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">Channels</h2>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-xs text-slate-400">Choose which ad channels your ad group is eligible to serve on</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {["YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"].map((channel) => {
                    const isChecked = selectedChannels.includes(channel);
                    return (
                      <div
                        key={channel}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedChannels(prev => prev.filter(c => c !== channel));
                          } else {
                            setSelectedChannels(prev => [...prev, channel]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded bg-slate-900 border-slate-700 text-primary h-4 w-4"
                        />
                        <span>{channel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : demandGenStep === "CAMPAIGN_SETTINGS" ? (
            /* ── CAMPAIGN SETTINGS PAGE (Matching User Specs) ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
              
              {/* 1. Prefill campaign Beta */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-200">Prefill campaign</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Save time by using Google AI to draft a Demand Gen campaign with settings & assets from an existing campaign. You can modify any setting before publishing. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Source campaign:</span>
                    <button 
                      type="button"
                      onClick={() => setIsCampaignModalOpen(true)}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 hover:bg-primary/20 transition-all"
                    >
                      {selectedSourceCampaign ? selectedSourceCampaign : "Choose a campaign"} <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                  {selectedSourceCampaign && (
                    <button 
                      onClick={() => setSelectedSourceCampaign(null)}
                      className="text-[11px] text-slate-500 hover:text-rose-400 underline cursor-pointer"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>

              {/* Old Campaign List Modal */}
              {isCampaignModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">Select an existing campaign</h3>
                        <p className="text-xs text-slate-400">Choose a campaign to prefill settings and assets</p>
                      </div>
                      <button 
                        onClick={() => setIsCampaignModalOpen(false)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-4 border-b border-slate-800">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search existing campaigns..."
                          value={campaignSearchTerm}
                          onChange={(e) => setCampaignSearchTerm(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="p-4 overflow-y-auto space-y-2 flex-1">
                      {existingCampaigns
                        .filter(c => c.name.toLowerCase().includes(campaignSearchTerm.toLowerCase()))
                        .map((camp) => (
                          <div
                            key={camp.id}
                            onClick={() => {
                              setSelectedSourceCampaign(camp.name);
                              setIsCampaignModalOpen(false);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              selectedSourceCampaign === camp.name
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">{camp.name}</p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                <span>Type: {camp.type}</span>
                                <span>•</span>
                                <span>Budget: {camp.budget}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              camp.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                            }`}>
                              {camp.status}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setIsCampaignModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Campaign Name Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">Campaign name</label>
                  <span className="text-[11px] text-slate-500 font-mono">{demandGenCampaignName.length} / 256</span>
                </div>
                <input
                  type="text"
                  value={demandGenCampaignName}
                  onChange={(e) => setDemandGenCampaignName(e.target.value)}
                  maxLength={256}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                />
                <p className="text-[11px] text-slate-500">Text is {demandGenCampaignName.length} characters out of 256</p>
              </div>

              {/* 3. Campaign Goal Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Campaign goal</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select the goal for your Demand Gen campaign</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { id: "Conversions", title: "Conversions", desc: "Get more sales or other conversion actions with your audiences by using a conversion based bid strategy" },
                    { id: "Clicks", title: "Clicks", desc: "Get more traffic or engagement with your ads using a cost-per-click based bid strategy" },
                    { id: "Conversion value", title: "Conversion value", desc: "Get more sales or other conversion actions to get the most value or at a value you set" },
                    { id: "YouTube engagements", title: "YouTube engagements", desc: "Get more YouTube subscriptions and engagements" }
                  ].map((goalItem) => {
                    const isSelected = demandGenGoal === goalItem.id;
                    return (
                      <div
                        key={goalItem.id}
                        onClick={() => setDemandGenGoal(goalItem.id as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "bg-primary/10 border-primary" : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <h4 className={`font-bold mb-1 ${isSelected ? "text-primary" : "text-slate-100"}`}>{goalItem.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{goalItem.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Conversion Goals Card (Hidden for Clicks and YouTube engagements) */}
              {demandGenGoal !== "Clicks" && demandGenGoal !== "YouTube engagements" && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg">
                  <h3 className="text-xs font-bold text-slate-200">Conversion goals</h3>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-xs">
                    <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-900/80 font-semibold text-slate-400 border-b border-slate-800">
                      <div className="col-span-4">Conversion Goals</div>
                      <div className="col-span-3">Conversion Source</div>
                      <div className="col-span-3 text-right">Conversion Actions</div>
                      <div className="col-span-2 text-right">More actions</div>
                    </div>
                    <div className="grid grid-cols-12 px-4 py-3 text-slate-200 items-center">
                      <div className="col-span-4 font-medium flex items-center gap-2">
                        <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0" />
                        Phone call leads (account default)
                      </div>
                      <div className="col-span-3 text-slate-400">Call from Ads</div>
                      <div className="col-span-3 text-right text-amber-400 font-medium">1 action</div>
                      <div className="col-span-2 text-right text-slate-400 hover:text-white cursor-pointer">More actions ▾</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    <p className="leading-relaxed">All of the actions in your selected conversion goals are unverified. Select a goal with verified actions or add a verified action to this goal.</p>
                  </div>
                </div>
              )}

              {/* 5. View-through conversion optimization Beta (Hidden only for Clicks) */}
              {demandGenGoal !== "Clicks" && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-200">View-through conversion optimization</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Google Ads can include view-through conversions, in addition to click-through and engaged-view conversions, when bidding and reporting. While in beta, not all channels are supported. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer pt-1 text-xs">
                    <input
                      type="checkbox"
                      checked={includeViewThrough}
                      onChange={(e) => setIncludeViewThrough(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">Include view-through conversions</span>
                      <span className="text-[11px] text-slate-400 block">Recorded when users view (but don't interact with) an ad and then later convert</span>
                    </div>
                  </label>
                </div>
              )}

              {/* 6. Target cost per action */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-200">Target cost per action</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  By default, your campaign will aim to maximize your conversions. You can set an optional target cost per action (Target CPA) to optimize for getting conversions at a specific cost per conversion.
                </p>
                <label className="flex items-start gap-3 cursor-pointer pt-1 text-xs">
                  <input
                    type="checkbox"
                    checked={targetCpaDemandGen}
                    onChange={(e) => setTargetCpaDemandGen(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-200 block">Set a target cost per action (optional)</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Target CPA is the average amount you'd like to pay for a conversion. Google Ads will optimize bids to help get as many conversions as possible at the target cost-per-action (CPA). <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                    </p>
                  </div>
                </label>
              </div>

              {/* 7. Budget and dates */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Budget and dates</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-slate-300">Enter budget type and amount</p>

                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      value={demandGenBudgetType}
                      onChange={(e) => setDemandGenBudgetType(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Campaign Total">Campaign Total</option>
                    </select>

                    <div className="relative w-48">
                      <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-400">₹</span>
                      <input
                        type="text"
                        value={demandGenBudgetAmount}
                        onChange={(e) => setDemandGenBudgetAmount(e.target.value)}
                        placeholder="Required"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-100 placeholder-amber-400/70 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950">
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 font-medium">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-300 font-medium">End date (optional)</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Select end date"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                      />
                      {!endDate && <p className="text-[10px] text-slate-500">None (Run continuously)</p>}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    For the month, you won't pay more than your daily budget times the average number of days in a month. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                  </p>
                </div>
              </div>

              {/* 8. Customer acquisition */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Customer acquisition</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyNewCustomers}
                    onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-200 block">Only bid for new customers</span>
                    <span className="text-[11px] text-slate-400 block">Your campaign will be limited to only new customers, regardless of your bid strategy</span>
                  </div>
                </label>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                  By default, your campaign bids equally for new and existing customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about customer acquisition</a>
                </p>
              </div>

              {/* 9. Brand guidelines */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Brand guidelines</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400">Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about brand guidelines</a></p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-300">Custom colors</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Main Color Picker */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-400 font-medium">Main color</label>
                      <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl p-2">
                        <input
                          type="color"
                          value={mainBrandColor}
                          onChange={(e) => setMainBrandColor(e.target.value)}
                          className="h-8 w-10 bg-transparent cursor-pointer border-0 rounded"
                        />
                        <input
                          type="text"
                          value={mainBrandColor}
                          onChange={(e) => setMainBrandColor(e.target.value)}
                          placeholder="#3b82f6"
                          className="w-full bg-transparent text-slate-100 font-mono text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Accent Color Picker */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-400 font-medium">Accent color</label>
                      <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl p-2">
                        <input
                          type="color"
                          value={accentBrandColor}
                          onChange={(e) => setAccentBrandColor(e.target.value)}
                          className="h-8 w-10 bg-transparent cursor-pointer border-0 rounded"
                        />
                        <input
                          type="text"
                          value={accentBrandColor}
                          onChange={(e) => setAccentBrandColor(e.target.value)}
                          placeholder="#10b981"
                          className="w-full bg-transparent text-slate-100 font-mono text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="block text-slate-400 font-medium">Font</label>
                    <select
                      value={brandFont}
                      onChange={(e) => setBrandFont(e.target.value)}
                      className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                    >
                      <option value="Any font">Any font</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Roboto Slab">Roboto Slab</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Lato">Lato</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Playfair Display">Playfair Display</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 10. EU political ads */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">EU political ads</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>
                <p className="font-semibold text-slate-300">Does your campaign have European Union political ads?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="euPol" checked={euPoliticalAds === "YES"} onChange={() => setEuPoliticalAds("YES")} className="text-primary h-4 w-4" />
                    <span>Yes, this campaign has EU political ads</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="euPol" checked={euPoliticalAds === "NO"} onChange={() => setEuPoliticalAds("NO")} className="text-primary h-4 w-4" />
                    <span>No, this campaign doesn't have EU political ads</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">EU regulation requires Google to ask this question. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn how an EU political ad is defined</a></p>
              </div>

              {/* 11. Location and language */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Location and language</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400 leading-relaxed">
                  You can set campaign location and language settings to overwrite ad group settings. The level can't be changed once the campaign is published.
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCampaignLocationLang}
                    onChange={(e) => setUseCampaignLocationLang(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-primary h-4 w-4"
                  />
                  <span className="font-semibold text-slate-200">Use campaign location and language settings</span>
                </label>

                {useCampaignLocationLang && (
                  <div className="space-y-3 pt-2 pl-7 border-l-2 border-slate-800">
                    <p className="font-semibold text-slate-300">For any selected locations, use</p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="locTargetType"
                          checked={locationTargetingType === "PRESENCE_OR_INTEREST"}
                          onChange={() => setLocationTargetingType("PRESENCE_OR_INTEREST")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="locTargetType"
                          checked={locationTargetingType === "PRESENCE"}
                          onChange={() => setLocationTargetingType("PRESENCE")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Presence: People in or regularly in your included location</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 12. Devices */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Devices</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deviceTarget"
                      checked={deviceTargetingType === "ALL"}
                      onChange={() => setDeviceTargetingType("ALL")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-semibold">Show on all eligible devices (computers, mobile, tablet, and TV screens)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deviceTarget"
                      checked={deviceTargetingType === "SPECIFIC"}
                      onChange={() => setDeviceTargetingType("SPECIFIC")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-200 font-semibold">Set specific targeting for devices</span>
                  </label>
                </div>

                <p className="text-slate-400 leading-relaxed">
                  Showing ads on all devices helps expand your reach. To focus your reach on specific devices, set device targeting. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>
              </div>

              {/* 13. Ad schedule */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Ad schedule</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select value={adScheduleDays} onChange={(e) => setAdScheduleDays(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary">
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

                  <select value={adScheduleStartTime} onChange={(e) => setAdScheduleStartTime(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary">
                    {Array.from({ length: 96 }).map((_, i) => {
                      const hours = String(Math.floor(i / 4)).padStart(2, "0");
                      const mins = String((i % 4) * 15).padStart(2, "0");
                      const timeStr = `${hours}:${mins}`;
                      return (
                        <option key={`start-${timeStr}`} value={timeStr}>
                          {timeStr}
                        </option>
                      );
                    })}
                  </select>

                  <span className="text-slate-400 font-medium">to</span>

                  <select value={adScheduleEndTime} onChange={(e) => setAdScheduleEndTime(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary">
                    {Array.from({ length: 96 }).map((_, i) => {
                      const hours = String(Math.floor(i / 4)).padStart(2, "0");
                      const mins = String((i % 4) * 15).padStart(2, "0");
                      const timeStr = `${hours}:${mins}`;
                      return (
                        <option key={`end-${timeStr}`} value={timeStr}>
                          {timeStr}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a></p>
                  <p>Based on account time zone: <strong>(GMT+05:30) India Standard Time</strong></p>
                  <p>To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                </div>
              </div>

              {/* 14. Third-party measurement */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Third-party measurement</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <p className="text-slate-400 leading-relaxed">
                  Add vendors to let them see measurement data for this campaign. Only vendors that have already been added to your account can be used for new campaigns.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Third-party measurement coverage is limited for Demand Gen campaigns. Contact your vendor for more info.
                </p>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-medium">
                  There are no available vendors for this campaign. You can add new vendors in your account settings
                </div>
              </div>

              {/* 15. Campaign URL options */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">Campaign URL options</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Tracking Template</label>
                  <input type="text" value={trackingTemplate} onChange={(e) => setTrackingTemplate(e.target.value)} placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Final URL suffix</label>
                  <input type="text" value={finalUrlSuffix} onChange={(e) => setFinalUrlSuffix(e.target.value)} placeholder="Example: param1=value1&param2=value2" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-300">Custom Parameters</label>
                    <button
                      type="button"
                      onClick={() => setCustomParametersDemandGen(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add custom parameters
                    </button>
                  </div>
                  {customParametersDemandGen.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{`{_`}</span>
                      <input type="text" value={p.name} onChange={(e) => { const u = [...customParametersDemandGen]; u[idx].name = e.target.value; setCustomParametersDemandGen(u); }} placeholder="Name" className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100" />
                      <span className="font-mono text-slate-400">{`}`}</span>
                      <span className="font-mono text-slate-400">=</span>
                      <input type="text" value={p.value} onChange={(e) => { const u = [...customParametersDemandGen]; u[idx].value = e.target.value; setCustomParametersDemandGen(u); }} placeholder="Value" className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 16. IP exclusions */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200">IP exclusions</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Enter the Internet Protocol (IP) addresses to exclude from seeing your ads</label>
                  <textarea
                    rows={4}
                    value={ipExclusionsInput}
                    onChange={(e) => setIpExclusionsInput(e.target.value)}
                    placeholder="123.4.5.67&#10;123.4.5.*&#10;123.4.0.0/16"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 leading-relaxed font-mono">
                  <p>To indicate a set of addresses, replace the last 3 digits with an asterisk (*)</p>
                  <p>Examples:</p>
                  <p className="text-slate-300">123.4.5.67</p>
                  <p className="text-slate-300">123.4.5.*</p>
                  <p className="text-slate-300">123.4.0.0/16</p>
                  <p className="text-slate-300">2620:0:1003:1011:fa1e:dfff:fee6:2711</p>
                  <p className="text-slate-300">2620:0:1003:1011:fa1e:dfff:0:0/96</p>
                </div>
              </div>

              {/* All Ad Groups List Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">Ad groups ({adGroups.length})</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Manage all current and newly created ad groups for this campaign</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNewAdGroup}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create new ad group
                  </button>
                </div>

                <div className="space-y-3">
                  {adGroups.map((ag, idx) => (
                    <div key={ag.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <input
                            type="text"
                            value={ag.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setAdGroups(prev => prev.map(item => item.id === ag.id ? { ...item, name: newName } : item));
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-primary"
                          />
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">ID: {ag.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          ● {ag.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setDemandGenStep("AD_GROUP");
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 text-primary hover:bg-slate-750 font-semibold cursor-pointer"
                        >
                          Edit Settings
                        </button>
                        {adGroups.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAdGroup(ag.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 cursor-pointer"
                            title="Delete ad group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : demandGenStep === "AD" ? (
            /* ── AD CREATION PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">{adName}</h1>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
                <label className="block text-xs font-semibold text-slate-300">Ad name</label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
                />

                <label className="block text-xs font-semibold text-slate-300 pt-2">Final URL</label>
                <input
                  type="text"
                  value={adFinalUrl}
                  onChange={(e) => setAdFinalUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
                />
              </div>
            </div>
          ) : (
            /* ── REVIEW CAMPAIGN PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Review campaign</h1>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 space-y-2">
                <p>Campaign: <strong>{demandGenCampaignName}</strong></p>
                <p>Ad Group: <strong>{activeAdGroup.name}</strong></p>
                <p>Location: <strong>{selectedLocation}</strong></p>
                <p>Status: <span className="text-emerald-400 font-bold">Ready to publish</span></p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {demandGenStep === "AD_GROUP" && (
            <button
              onClick={() => setDemandGenStep("AD")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue to Ad
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {demandGenStep === "AD" && (
            <button
              onClick={() => setDemandGenStep("REVIEW")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Review Campaign
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {demandGenStep === "REVIEW" && (
            <button
              onClick={() => {
                alert(`Demand Gen campaign "${demandGenCampaignName}" published successfully!`);
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
