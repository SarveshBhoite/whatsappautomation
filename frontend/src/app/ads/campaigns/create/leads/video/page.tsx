"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Sparkles, Layers, Target, Search, Video, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3, Bell, ArrowLeft, Copy, Eye, MoreVertical
} from "lucide-react";

export default function LeadsVideoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "CAMPAIGN_SETTINGS" | "AD_GROUP" | "AD" | "REVIEW"
  const [videoStep, setVideoStep] = useState<"CAMPAIGN_SETTINGS" | "AD_GROUP" | "AD" | "REVIEW">("CAMPAIGN_SETTINGS");

  // Get formatted today's date YYYY-MM-DD
  const getTodayFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Video Campaign States for Leads
  const [videoCampaignName, setVideoCampaignName] = useState<string>(`Leads - Video - ${getTodayFormattedDate()}`);
  const [selectedSourceCampaign, setSelectedSourceCampaign] = useState<string | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState<string>("");

  // Sample old campaign list
  const existingCampaigns = [
    { id: "c-101", name: "Leads Video - 2026-07-15", type: "Video", status: "Active", budget: "₹1,500/day" },
    { id: "c-102", name: "Leads Promo - Video", type: "Video", status: "Ended", budget: "₹2,000/day" },
    { id: "c-103", name: "Leads Video - High Intent Audiences", type: "Video", status: "Active", budget: "₹3,500/day" },
    { id: "c-104", name: "Website Traffic - Video 2026", type: "Video", status: "Paused", budget: "₹1,000/day" },
    { id: "c-105", name: "Leads Video - Product Launch", type: "Video", status: "Active", budget: "₹5,000/day" },
  ];
  const [videoGoal, setVideoGoal] = useState<"Conversions" | "Clicks" | "Conversion value" | "YouTube engagements">("Conversions");
  const [includeViewThrough, setIncludeViewThrough] = useState<boolean>(false);
  const [targetCpaVideo, setTargetCpaVideo] = useState<boolean>(false);
  const [videoBudgetType, setVideoBudgetType] = useState<string>("Daily");
  const [videoBudgetAmount, setVideoBudgetAmount] = useState<string>("");
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
    setVideoStep("AD_GROUP");
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
  const [customParametersVideo, setCustomParametersVideo] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);
  const [ipExclusionsInput, setIpExclusionsInput] = useState<string>("");

  // Location & Language Level States
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("INDIA");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Header ────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all flex items-center gap-1 text-xs cursor-pointer"
            title="Back to campaign objectives"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-slate-800">Google Ads • Leads Video Setup</span>
          </div>
        </div>

        {/* Global Search pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-xs max-w-md w-full text-slate-500 shadow-inner">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>"What are my top performing video campaigns?"</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono hidden sm:inline">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900" />
          <button
            onClick={() => router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sub-Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-200 p-4 space-y-4 shrink-0 bg-slate-50/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            {/* Campaign Name Header */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="truncate">{videoCampaignName}</span>
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            </div>

            {/* Navigation Tree */}
            <nav className="space-y-1 text-xs font-sans">
              <div
                onClick={() => setVideoStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                  videoStep === "CAMPAIGN_SETTINGS"
                    ? "bg-blue-600/20 text-blue-400 font-bold"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <LayoutGrid className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="truncate">{videoCampaignName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>

              <div className="border-t border-slate-200 my-2" />

              {/* Dynamic List of Ad Groups with Nested Ads */}
              <div className="space-y-1">
                {adGroups.map((ag) => {
                  const isAgActive = videoStep === "AD_GROUP" && activeAdGroupId === ag.id;
                  const isMenuOpen = openMenuAgId === ag.id;

                  return (
                    <div key={ag.id} className="space-y-0.5">
                      <div className="relative">
                        <div
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setVideoStep("AD_GROUP");
                          }}
                          className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                            isAgActive
                              ? "bg-blue-600/20 text-blue-400 font-bold"
                              : "text-slate-700 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <LayoutGrid className={`h-4 w-4 shrink-0 ${isAgActive ? "text-blue-400" : "text-slate-500"}`} />
                            <span className="truncate">{ag.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuAgId(isMenuOpen ? null : ag.id);
                            }}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Context Menu Popup */}
                        {isMenuOpen && (
                          <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-slate-200 rounded-xl shadow-md z-50 py-1 text-xs animate-in fade-in duration-150">
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                handleDuplicateAdGroup(ag.id);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                alert(`${ag.name} status updated`);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                            >
                              Enable
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                handleDeleteAdGroup(ag.id);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-rose-400 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                            <div className="border-t border-slate-200 my-1" />
                            <button
                              onClick={() => {
                                setOpenMenuAgId(null);
                                handleCreateNewAdGroup();
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-primary font-semibold transition-colors cursor-pointer"
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
                          setVideoStep("AD");
                        }}
                        className={`ml-6 p-2 rounded-r-full flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                          videoStep === "AD" && activeAdGroupId === ag.id
                            ? "bg-blue-600/20 text-blue-400 font-bold"
                            : "text-slate-500 hover:bg-white hover:text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Plus className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">Ad 1</span>
                        </div>
                        <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                      </div>

                      <div className="border-t border-slate-200 my-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Review campaign */}
              <div
                onClick={() => setVideoStep("REVIEW")}
                className={`p-2.5 rounded-r-full flex items-center gap-2.5 font-semibold cursor-pointer transition-all ${
                  videoStep === "REVIEW"
                    ? "bg-blue-600/20 text-blue-400 font-bold"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                <Info className="h-4 w-4 text-slate-500" />
                <span>Review campaign</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-5xl mx-auto">
          
          {videoStep === "AD_GROUP" ? (
            /* ── AD GROUP SETUP PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{activeAdGroup.name}</h1>

              {/* 1. Ad group name Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Ad group name</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                  />
                  <div className="flex justify-end text-[10px] text-slate-500 font-mono">
                    <span>{activeAdGroup.name.length} / 256</span>
                  </div>
                </div>
              </div>

              {/* 2. Locations Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <p className="text-xs text-slate-500">Select locations for this campaign</p>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="locationSelection"
                      checked={selectedLocation === "ALL"}
                      onChange={() => setSelectedLocation("ALL")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-800">All countries and territories</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="locationSelection"
                      checked={selectedLocation === "INDIA"}
                      onChange={() => setSelectedLocation("INDIA")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-800">India</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="locationSelection"
                      checked={selectedLocation === "CUSTOM"}
                      onChange={() => setSelectedLocation("CUSTOM")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-slate-800">Enter another location</span>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Languages Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <p className="text-xs text-slate-500">Select the languages your target leads speak.</p>

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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-slate-700 font-medium">
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

            </div>
          ) : videoStep === "CAMPAIGN_SETTINGS" ? (
            /* ── CAMPAIGN SETTINGS PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
              
              {/* 1. Prefill campaign Beta */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800">Prefill campaign</h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Save time by using Google AI to draft a Leads Video campaign with settings & assets from an existing campaign. You can modify any setting before publishing. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Source campaign:</span>
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
                <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Select an existing campaign</h3>
                        <p className="text-xs text-slate-500">Choose a campaign to prefill settings and assets</p>
                      </div>
                      <button 
                        onClick={() => setIsCampaignModalOpen(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-4 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search existing campaigns..."
                          value={campaignSearchTerm}
                          onChange={(e) => setCampaignSearchTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary"
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
                                : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold">{camp.name}</p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                <span>Type: {camp.type}</span>
                                <span>•</span>
                                <span>Budget: {camp.budget}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              camp.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-100 text-slate-500"
                            }`}>
                              {camp.status}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setIsCampaignModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-700 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Campaign Name Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">Campaign name</label>
                  <span className="text-[11px] text-slate-500 font-mono">{videoCampaignName.length} / 256</span>
                </div>
                <input
                  type="text"
                  value={videoCampaignName}
                  onChange={(e) => setVideoCampaignName(e.target.value)}
                  maxLength={256}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                />
                <p className="text-[11px] text-slate-500">Text is {videoCampaignName.length} characters out of 256</p>
              </div>

              {/* 3. Campaign Goal Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Campaign goal</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select the goal for your Leads Video campaign</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { id: "Conversions", title: "Conversions", desc: "Get more lead form submissions or action conversions with video ads" },
                    { id: "Clicks", title: "Clicks", desc: "Get more traffic to your landing page using a cost-per-click bid strategy" },
                    { id: "Conversion value", title: "Conversion value", desc: "Get more lead conversions at higher overall target values" },
                    { id: "YouTube engagements", title: "YouTube engagements", desc: "Get more video views and channel engagements" }
                  ].map((goalItem) => {
                    const isSelected = videoGoal === goalItem.id;
                    return (
                      <div
                        key={goalItem.id}
                        onClick={() => setVideoGoal(goalItem.id as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "bg-primary/10 border-primary" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <h4 className={`font-bold mb-1 ${isSelected ? "text-primary" : "text-slate-900"}`}>{goalItem.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{goalItem.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Budget and dates */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">Budget and dates</h3>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <div className="space-y-3 text-xs">
                  <p className="font-semibold text-slate-700">Enter budget type and amount</p>

                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      value={videoBudgetType}
                      onChange={(e) => setVideoBudgetType(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Campaign Total">Campaign Total</option>
                    </select>

                    <div className="relative w-48">
                      <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-500">₹</span>
                      <input
                        type="text"
                        value={videoBudgetAmount}
                        onChange={(e) => setVideoBudgetAmount(e.target.value)}
                        placeholder="Required"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 placeholder-amber-400/70 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-medium">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-medium">End date (optional)</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Select end date"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* All Ad Groups List Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Ad groups ({adGroups.length})</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage all current and newly created ad groups for this campaign</p>
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
                    <div key={ag.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold">
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
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setVideoStep("AD_GROUP");
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-primary hover:bg-slate-200 font-semibold cursor-pointer"
                        >
                          Edit Settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : videoStep === "AD" ? (
            /* ── AD CREATION PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{adName}</h1>

              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
                <label className="block text-xs font-semibold text-slate-700">Ad name</label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
                />

                <label className="block text-xs font-semibold text-slate-700 pt-2">Final URL</label>
                <input
                  type="text"
                  value={adFinalUrl}
                  onChange={(e) => setAdFinalUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          ) : (
            /* ── REVIEW CAMPAIGN PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Review campaign</h1>
              <div className="p-6 rounded-2xl border border-slate-200 bg-white text-xs text-slate-700 space-y-2">
                <p>Objective: <strong className="text-primary">Leads</strong></p>
                <p>Campaign: <strong>{videoCampaignName}</strong></p>
                <p>Ad Group: <strong>{activeAdGroup.name}</strong></p>
                <p>Location: <strong>{selectedLocation}</strong></p>
                <p>Status: <span className="text-emerald-400 font-bold">Ready to publish</span></p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {videoStep === "AD_GROUP" && (
            <button
              onClick={() => setVideoStep("AD")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue to Ad
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {videoStep === "AD" && (
            <button
              onClick={() => setVideoStep("REVIEW")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Review Campaign
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {videoStep === "REVIEW" && (
            <button
              onClick={() => {
                alert(`Leads Video campaign "${videoCampaignName}" published successfully!`);
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
