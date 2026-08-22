"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Sparkles, Layers, Target, Search, Video, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3, Bell, ArrowLeft, Copy, Eye, MoreVertical, Upload
} from "lucide-react";

export default function SalesVideoPage() {
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

  // Video Campaign States
  const [videoCampaignName, setVideoCampaignName] = useState<string>(`Video - ${getTodayFormattedDate()}`);
  const [selectedSourceCampaign, setSelectedSourceCampaign] = useState<string | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);
  const [campaignSearchTerm, setCampaignSearchTerm] = useState<string>("");

  // Sample old campaign list
  const existingCampaigns = [
    { id: "c-101", name: "Video - 2026-07-15", type: "Video", status: "Active", budget: "₹1,500/day" },
    { id: "c-102", name: "Sales Summer Promo - Video", type: "Video", status: "Ended", budget: "₹2,000/day" },
    { id: "c-103", name: "Video - High Intent Audiences", type: "Video", status: "Active", budget: "₹3,500/day" },
    { id: "c-104", name: "Website Traffic - Discovery 2026", type: "Display", status: "Paused", budget: "₹1,000/day" },
    { id: "c-105", name: "Video - Product Launch", type: "Video", status: "Active", budget: "₹5,000/day" },
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
  const [openCampaignSetting, setOpenCampaignSetting] = useState<string | null>(null);
  const [openAdGroupSetting, setOpenAdGroupSetting] = useState<string | null>(null);
  const [openAdSetting, setOpenAdSetting] = useState<string | null>(null);

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

  // Ad Group Channels State
  const [channelTargeting, setChannelTargeting] = useState<"ALL" | "CHOOSE">("ALL");
  const [includeDisplayNetwork, setIncludeDisplayNetwork] = useState<boolean>(true);
  const [selectedAdGroupChannels, setSelectedAdGroupChannels] = useState<string[]>([
    "YouTube", "YouTube in-stream", "YouTube in-feed", "YouTube Shorts", "Discover", "Gmail", "Google Display Network", "Maps New"
  ]);

  // Audience State & Modal
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState<boolean>(false);
  const [audienceName, setAudienceName] = useState<string>("");
  const [activeAudienceSubTab, setActiveAudienceSubTab] = useState<"NONE" | "NEW_CUSTOM_SEGMENT" | "YOUR_DATA_BROWSE" | "NEW_YOUR_DATA" | "NEW_LOOKALIKE" | "INTERESTS_BROWSE" | "EXCLUSIONS_BROWSE">("NONE");

  // Sub-modal creation form values
  const [newCustomSegName, setNewCustomSegName] = useState<string>("");
  const [newCustomSegType, setNewCustomSegType] = useState<"INTERESTS" | "SEARCH_TERMS">("INTERESTS");
  const [newCustomSegKeywords, setNewCustomSegKeywords] = useState<string>("");
  const [newCustomSegUrls, setNewCustomSegUrls] = useState<string>("");
  const [newCustomSegApps, setNewCustomSegApps] = useState<string>("");

  const [newLookalikeName, setNewLookalikeName] = useState<string>("");
  const [newLookalikeSeedList, setNewLookalikeSeedList] = useState<string>("");
  const [newLookalikeCountry, setNewLookalikeCountry] = useState<string>("");
  const [newLookalikeReach, setNewLookalikeReach] = useState<string>("1%");
  const [customSegmentsList, setCustomSegmentsList] = useState<string[]>([]);
  const [yourDataList, setYourDataList] = useState<string[]>([]);
  const [lookalikeSegmentsList, setLookalikeSegmentsList] = useState<string[]>([]);
  const [interestsList, setInterestsList] = useState<string[]>([]);
  const [exclusionsList, setExclusionsList] = useState<string[]>([]);
  const [genderTargeting, setGenderTargeting] = useState<{ [key: string]: boolean }>({ Female: true, Male: true, Unknown: true });
  const [ageRangeStart, setAgeRangeStart] = useState<string>("18");
  const [ageRangeEnd, setAgeRangeEnd] = useState<string>("65+");
  const [ageUnknown, setAgeUnknown] = useState<boolean>(true);
  const [parentalStatus, setParentalStatus] = useState<{ [key: string]: boolean }>({ Parent: true, "Not a parent": true, Unknown: true });
  const [incomeTargeting, setIncomeTargeting] = useState<{ [key: string]: boolean }>({ "Top 10%": true, "11-20%": true, "21-30%": true, "31-40%": true, "41-50%": true, "Lower 50%": true, Unknown: true });

  // Optimized Targeting
  const [useOptimizedTargeting, setUseOptimizedTargeting] = useState<boolean>(true);
  const [limitOptimizedToAgeGender, setLimitOptimizedToAgeGender] = useState<boolean>(false);

  // Ad Group URL options
  const [agTrackingTemplate, setAgTrackingTemplate] = useState<string>("");
  const [agFinalUrlSuffix, setAgFinalUrlSuffix] = useState<string>("");
  const [agCustomParams, setAgCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "agcp-1", name: "", value: "" }
  ]);
  const [showAgUrlOptions, setShowAgUrlOptions] = useState<boolean>(false);

  // Location & Language Level States
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("INDIA");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");

  // Channels Selection State
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"]);

  // Ad Level States
  const [adName, setAdName] = useState<string>("Ad 1");
  const [videoAdType, setVideoAdType] = useState<"SINGLE_IMAGE" | "VIDEO" | "CAROUSEL">("SINGLE_IMAGE");
  const [adFinalUrl, setAdFinalUrl] = useState<string>("https://");
  
  // Media asset lists
  const [adImages, setAdImages] = useState<string[]>([]);
  const [adLogos, setAdLogos] = useState<string[]>([]);
  const [adVideos, setAdVideos] = useState<string[]>([]);
  const [carouselCards, setCarouselCards] = useState<Array<{ id: string; image: string; headline: string; finalUrl: string }>>([
    { id: "card-1", image: "", headline: "", finalUrl: "https://" }
  ]);

  // Text assets
  const [adHeadlines, setAdHeadlines] = useState<string[]>([""]);
  const [adLongHeadlines, setAdLongHeadlines] = useState<string[]>([""]);
  const [adDescriptions, setAdDescriptions] = useState<string[]>([""]);
  const [adCallToAction, setAdCallToAction] = useState<string>("Automated");
  const [businessName, setBusinessName] = useState<string>("");
  const [adSitelinks, setAdSitelinks] = useState<string[]>([]);

  // Optimizations
  const [optAdaptiveLayouts, setOptAdaptiveLayouts] = useState<boolean>(true);
  const [optAnimatedImages, setOptAnimatedImages] = useState<boolean>(true);
  const [optGeneratedVideos, setOptGeneratedVideos] = useState<boolean>(true);
  const [optShorterVideos, setOptShorterVideos] = useState<boolean>(true);
  const [optResizedVideos, setOptResizedVideos] = useState<boolean>(true);
  const [optLandingPagePreviews, setOptLandingPagePreviews] = useState<boolean>(true);

  // URL options
  const [useDiffMobileUrl, setUseDiffMobileUrl] = useState<boolean>(false);
  const [mobileFinalUrl, setMobileFinalUrl] = useState<string>("https://");
  const [adTrackingTemplate, setAdTrackingTemplate] = useState<string>("");
  const [adFinalUrlSuffix, setAdFinalUrlSuffix] = useState<string>("");
  const [adCustomParams, setAdCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "adcp-1", name: "", value: "" }
  ]);
  const [showAdUrlOptions, setShowAdUrlOptions] = useState<boolean>(false);

  const [showReviewCampaignDetails, setShowReviewCampaignDetails] = useState<boolean>(false);
  const [showReviewAdGroupDetails, setShowReviewAdGroupDetails] = useState<boolean>(false);
  const [showReviewAdDetails, setShowReviewAdDetails] = useState<boolean>(false);

  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  const handleImageKitUpload = async (file: File, type: "image" | "logo" | "carousel", cardIdx?: number) => {
    if (type === "logo") {
      setIsUploadingLogo(true);
    } else {
      setIsUploadingImage(true);
    }
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${BACKEND}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `gads_dg_${type}_${Date.now()}_${file.name}`,
            fileBase64: base64Data
          })
        });

        const data = await res.json();
        if (data.url) {
          if (type === "image") {
            setAdImages(prev => [...prev, data.url]);
          } else if (type === "logo") {
            setAdLogos(prev => [...prev, data.url]);
          } else if (type === "carousel" && cardIdx !== undefined) {
            const u = [...carouselCards];
            u[cardIdx].image = data.url;
            setCarouselCards(u);
          }
        } else {
          alert("ImageKit upload failed: " + (data.message || data.error));
        }
        setIsUploadingImage(false);
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Error uploading media to ImageKit");
      setIsUploadingImage(false);
      setIsUploadingLogo(false);
    }
  };

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
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col font-sans">
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
            <span className="text-sm font-semibold text-slate-200">Google Ads • Video</span>
          </div>
        </div>

        {/* Global Search pill matching Google Ads header in screenshot */}
        <div className="hidden md:flex items-center gap-2 bg-slate-955 border border-slate-800 rounded-xl px-4 py-1.5 text-xs max-w-md w-full text-slate-400 shadow-inner">
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
        <aside className="w-64 border-r border-slate-800 p-4 space-y-4 shrink-0 bg-slate-955/60 hidden md:flex flex-col justify-between">
          <div className="space-y-4">
            {/* Campaign Name Header */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="truncate">{videoCampaignName}</span>
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            </div>

            {/* Navigation Tree Matching Google Ads Hierarchy */}
            <nav className="space-y-1 text-xs font-sans">
              {/* Campaign Header */}
              <div
                onClick={() => setVideoStep("CAMPAIGN_SETTINGS")}
                className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                  videoStep === "CAMPAIGN_SETTINGS"
                    ? "bg-blue-600/20 text-blue-400 font-bold"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <LayoutGrid className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{videoCampaignName}</span>
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
                  const isAgActive = videoStep === "AD_GROUP" && activeAdGroupId === ag.id;
                  const isMenuOpen = openMenuAgId === ag.id;

                  return (
                    <div key={ag.id} className="space-y-0.5">
                      {/* Ad Group Row */}
                      <div className="relative">
                        <div
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setVideoStep("AD_GROUP");
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
                          setVideoStep("AD");
                        }}
                        className={`ml-6 p-2 rounded-r-full flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                          videoStep === "AD" && activeAdGroupId === ag.id
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
                onClick={() => setVideoStep("REVIEW")}
                className={`p-2.5 rounded-r-full flex items-center gap-2.5 font-semibold cursor-pointer transition-all ${
                  videoStep === "REVIEW"
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
          
          {videoStep === "AD_GROUP" ? (
            /* ── AD GROUP SETUP PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">{activeAdGroup.name}</h1>

              {/* 1. Ad group name Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 shadow-lg">
                {openAdGroupSetting === "adGroupName" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-100">Ad group name</h2>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
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
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                      />
                      <div className="flex justify-end text-[10px] text-slate-500 font-mono">
                        <span>{activeAdGroup.name.length} / 256</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("adGroupName")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Ad group name</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {activeAdGroup.name}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 2. Locations Card (Matching Screenshot Radio Options) */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                {openAdGroupSetting === "locations" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-100">Locations</h2>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
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
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("locations")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Locations</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : customLocationInput || "Custom location"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 3. Languages Card (With Dropdown Option List) */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                {openAdGroupSetting === "languages" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-100">Languages</h2>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-xs text-slate-400">Select the languages your customers speak.</p>

                    <div className="space-y-3">
                      <div className="relative max-w-md">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !selectedLanguages.includes(e.target.value)) {
                              setSelectedLanguages(prev => [...prev, e.target.value]);
                            }
                            e.target.value = "";
                          }}
                          className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                        >
                          <option value="">-- Add language --</option>
                          {[
                            "All languages", "Arabic", "Bengali", "Bulgarian", "Catalan", "Chinese (simplified)", "Chinese (traditional)",
                            "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", "Filipino", "Finnish", "French",
                            "German", "Greek", "Gujarati", "Hebrew", "Hindi", "Hungarian", "Icelandic", "Indonesian", "Italian",
                            "Japanese", "Kannada", "Korean", "Latvian", "Lithuanian", "Malay", "Malayalam", "Marathi", "Norwegian",
                            "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian", "Slovak", "Slovenian",
                            "Spanish", "Swedish", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Vietnamese"
                          ].map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                          All languages
                        </span>
                        {selectedLanguages.map((lang, idx) => (
                          <span key={idx} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/30 transition-all cursor-pointer">
                            <button 
                              onClick={() => setSelectedLanguages(prev => prev.filter((_, i) => i !== idx))}
                              title={`Remove ${lang}`}
                              type="button"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("languages")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Languages</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedLanguages.length === 0 ? "All languages" : selectedLanguages.join(", ")}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 4. Channels Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "channels" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-100">Channels</h2>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-slate-400">Choose which ad channels your ad group is eligible to serve on</p>

                    <div className="space-y-4">
                      {/* Option 1: All Google channels */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="channelTargetType"
                          checked={channelTargeting === "ALL"}
                          onChange={() => setChannelTargeting("ALL")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">All Google channels</span>
                          <span className="text-slate-400 text-[11px] block">Your ad will show across all eligible Google channels, driving campaign performance</span>
                        </div>
                      </label>

                      {channelTargeting === "ALL" && (
                        <label className="flex items-center gap-2 pl-7 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={includeDisplayNetwork}
                            onChange={(e) => setIncludeDisplayNetwork(e.target.checked)}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span>Include Google Display Network</span>
                        </label>
                      )}

                      {/* Option 2: Let me choose */}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="channelTargetType"
                          checked={channelTargeting === "CHOOSE"}
                          onChange={() => setChannelTargeting("CHOOSE")}
                          className="mt-0.5 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Let me choose</span>
                          <span className="text-slate-400 text-[11px] block">Your ad will be limited to show only on the eligible channels of your choice</span>
                        </div>
                      </label>

                      {channelTargeting === "CHOOSE" && (
                        <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {[
                            { name: "YouTube", desc: "Ads shown on YouTube surfaces" },
                            { name: "YouTube in-stream", desc: "Ads shown before, during, or after YouTube videos" },
                            { name: "YouTube in-feed", desc: "Ads displayed within YouTube's watch next, home, and search feeds" },
                            { name: "YouTube Shorts", desc: "Ads on YouTube's short-form video platform" },
                            { name: "Discover", desc: "Ads shown on personalized content feeds on Google mobile experiences" },
                            { name: "Gmail", desc: "Ads shown within users' Gmail inboxes" },
                            { name: "Google Display Network", desc: "Ads run across third-party sites and apps. Some ads may be modified to fit publisher formats" },
                            { name: "Maps New", desc: "Ads shown on Google Maps" }
                          ].map((ch) => {
                            const isChecked = selectedAdGroupChannels.includes(ch.name);
                            return (
                              <label key={ch.name} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-955 hover:bg-slate-900/60 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                      if (e.target.checked) {
                                      setSelectedAdGroupChannels(prev => [...prev, ch.name]);
                                    } else {
                                      setSelectedAdGroupChannels(prev => prev.filter(item => item !== ch.name));
                                    }
                                  }}
                                  className="mt-0.5 rounded text-primary h-3.5 w-3.5"
                                />
                                <div>
                                  <span className="font-bold text-slate-200 block">{ch.name}</span>
                                  <span className="text-[10px] text-slate-400">{ch.desc}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("channels")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Channels</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {channelTargeting === "ALL" ? "All Google channels" : selectedAdGroupChannels.join(", ")}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 5. Audience Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "audience" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-100">Audience</h2>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    
                    <p className="text-slate-400">Target specific groups of people based on segments, remarketing lists, demographics, or custom interests.</p>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAudienceModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-slate-955 font-bold text-xs hover:bg-secondary cursor-pointer shadow-md shadow-primary/10 transition-all"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Create an audience
                      </button>
                    </div>

                    {audienceName && (
                      <div className="p-3 bg-slate-955 border border-slate-800 rounded-xl max-w-sm flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-200">{audienceName}</span>
                          <span className="text-[10px] text-slate-500 block">Configured custom audience</span>
                        </div>
                        <button type="button" onClick={() => setAudienceName("")} className="text-slate-500 hover:text-rose-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("audience")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Audience</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {audienceName || "No audience created"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 6. Optimized Targeting Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "optimizedTargeting" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-100">Optimized targeting</h2>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-slate-400 leading-relaxed">
                      Optimized targeting helps you get more conversions within your budget. Google may find people beyond your selected audience.
                    </p>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useOptimizedTargeting}
                          onChange={(e) => setUseOptimizedTargeting(e.target.checked)}
                          className="mt-0.5 rounded text-primary h-3.5 w-3.5"
                        />
                        <div>
                          <span className="font-bold text-slate-200 block">Use optimized targeting</span>
                        </div>
                      </label>

                      {useOptimizedTargeting && (
                        <div className="pl-6 space-y-2 border-l border-slate-800 animate-in fade-in duration-100">
                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={limitOptimizedToAgeGender}
                              onChange={(e) => setLimitOptimizedToAgeGender(e.target.checked)}
                              className="mt-0.5 rounded text-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="font-semibold text-slate-300 block">Only show ads to people within my age and gender specifications</span>
                              <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                                By only optimizing your targeting to people within your selected age and gender specifications, you may be limiting your campaign performance.
                              </span>
                            </div>
                          </label>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 leading-normal pt-2 border-t border-slate-800/40">
                        Information such as your selected audience, landing page, and assets are used to find people likely to convert. Your targeting signals may see reduced traffic if better performance is found elsewhere. <a href="https://support.google.com/google-ads/answer/10538014?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Learn more</a>
                      </p>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("optimizedTargeting")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Optimized targeting</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {useOptimizedTargeting ? (limitOptimizedToAgeGender ? "Optimized targeting (limited to specifications)" : "Optimized targeting active") : "Turned off"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 7. Ad Group URL Options Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "urlOptions" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-100">Ad group URL options</h2>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-4 pt-3 animate-in slide-in-from-top-1 duration-150">
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-300">Tracking Template</label>
                        <input
                          type="url"
                          value={agTrackingTemplate}
                          onChange={(e) => setAgTrackingTemplate(e.target.value)}
                          placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                          className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-300">Final URL suffix</label>
                        <input
                          type="text"
                          value={agFinalUrlSuffix}
                          onChange={(e) => setAgFinalUrlSuffix(e.target.value)}
                          placeholder="Example: param1=value1&param2=value2"
                          className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-slate-300">Custom Parameters</label>
                          <button
                            type="button"
                            onClick={() => setAgCustomParams(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                            className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add custom parameters
                          </button>
                        </div>
                        {agCustomParams.map((p, idx) => (
                          <div key={p.id || idx} className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">{`{_`}</span>
                            <input type="text" value={p.name} onChange={(e) => { const u = [...agCustomParams]; u[idx].name = e.target.value; setAgCustomParams(u); }} placeholder="Name" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none" />
                            <span className="font-mono text-slate-400">{`}`}</span>
                            <span className="font-mono text-slate-400">=</span>
                            <input type="text" value={p.value} onChange={(e) => { const u = [...agCustomParams]; u[idx].value = e.target.value; setAgCustomParams(u); }} placeholder="Value" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none" />
                            <button type="button" onClick={() => setAgCustomParams(prev => prev.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("urlOptions")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Ad group URL options</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {agTrackingTemplate || agFinalUrlSuffix || agCustomParams.some(p => p.name || p.value) ? "Custom URL options set" : "No options set"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

            </div>
          ) : videoStep === "CAMPAIGN_SETTINGS" ? (
            /* ── CAMPAIGN SETTINGS PAGE (Matching User Specs) ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign settings</h1>
              
              {/* 1. Prefill campaign Beta */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                {openCampaignSetting === "prefill" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-200">Prefill campaign</h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Save time by using Google AI to draft a Video campaign with settings & assets from an existing campaign. You can modify any setting before publishing. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("prefill")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56 flex items-center gap-2">
                        <span className="font-bold text-slate-200">Prefill campaign</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                        {selectedSourceCampaign ? `Source: ${selectedSourceCampaign}` : ""}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Old Campaign List Modal */}
              {isCampaignModalOpen && (
                <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-955">
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
                          className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary"
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
                                : "bg-slate-955 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200"
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

                    <div className="p-4 border-t border-slate-800 bg-slate-955 flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setIsCampaignModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Campaign Name Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                {openCampaignSetting === "name" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-pointer select-none"
                    >
                      <label className="block text-xs font-bold text-slate-200">Campaign name</label>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={videoCampaignName}
                      onChange={(e) => setVideoCampaignName(e.target.value)}
                      maxLength={256}
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <p>Text is {videoCampaignName.length} characters out of 256</p>
                      <span className="font-mono">{videoCampaignName.length} / 256</span>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("name")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Campaign name</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {videoCampaignName}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 3. Campaign Goal Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg">
                {openCampaignSetting === "goal" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-pointer select-none"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-slate-200">Campaign goal</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Select the goal for your Video campaign</p>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        { id: "Conversions", title: "Conversions", desc: "Get more sales or other conversion actions with your audiences by using a conversion based bid strategy" },
                        { id: "Clicks", title: "Clicks", desc: "Get more traffic or engagement with your ads using a cost-per-click based bid strategy" },
                        { id: "Conversion value", title: "Conversion value", desc: "Get more sales or other conversion actions to get the most value or at a value you set" },
                        { id: "YouTube engagements", title: "YouTube engagements", desc: "Get more YouTube subscriptions and engagements" }
                      ].map((goalItem) => {
                        const isSelected = videoGoal === goalItem.id;
                        return (
                          <div
                            key={goalItem.id}
                            onClick={() => setVideoGoal(goalItem.id as any)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? "bg-primary/10 border-primary" : "bg-slate-955 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <h4 className={`font-bold mb-1 ${isSelected ? "text-primary" : "text-slate-100"}`}>{goalItem.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{goalItem.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("goal")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Campaign goal</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {videoGoal}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 4. Conversion Goals Card (Hidden for Clicks and YouTube engagements) */}
              {videoGoal !== "Clicks" && videoGoal !== "YouTube engagements" && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg">
                  {openCampaignSetting === "conversions" ? (
                    <>
                      <div 
                        onClick={() => setOpenCampaignSetting(null)}
                        className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-pointer select-none"
                      >
                        <h3 className="text-xs font-bold text-slate-200">Conversion goals</h3>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-955 text-xs">
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
                    </>
                  ) : (
                    <div 
                      onClick={() => setOpenCampaignSetting("conversions")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-200">Conversion goals</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Use campaign specific goal: Phone call leads
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>
              )}

              {/* 5. View-through conversion optimization Beta (Hidden only for Clicks) */}
              {videoGoal !== "Clicks" && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                  {openCampaignSetting === "viewThrough" ? (
                    <>
                      <div 
                        onClick={() => setOpenCampaignSetting(null)}
                        className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-200">View-through conversion optimization</h3>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Google Ads can include view-through conversions, in addition to click-through and engaged-view conversions, when bidding and reporting. While in beta, not all channels are supported. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer pt-1 text-xs">
                        <input
                          type="checkbox"
                          checked={includeViewThrough}
                          onChange={(e) => setIncludeViewThrough(e.target.checked)}
                          className="mt-0.5 rounded bg-slate-955 border-slate-700 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-200 block">Include view-through conversions</span>
                          <span className="text-[11px] text-slate-400 block">Recorded when users view (but don't interact with) an ad and then later convert</span>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div 
                      onClick={() => setOpenCampaignSetting("viewThrough")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56 flex items-center gap-2">
                          <span className="font-bold text-slate-200">View-through conversion optimization</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {includeViewThrough ? "Turned on" : "Turned off"}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>
              )}

              {/* 6. Target cost per action */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg">
                {openCampaignSetting === "targetCpa" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Target cost per action</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      By default, your campaign will aim to maximize your conversions. You can set an optional target cost per action (Target CPA) to optimize for getting conversions at a specific cost per conversion.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer pt-1 text-xs">
                      <input
                        type="checkbox"
                        checked={targetCpaVideo}
                        onChange={(e) => setTargetCpaVideo(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-955 border-slate-700 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Set a target cost per action (optional)</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Target CPA is the average amount you'd like to pay for a conversion. Google Ads will optimize bids to help get as many conversions as possible at the target cost-per-action (CPA). <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                        </p>
                      </div>
                    </label>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("targetCpa")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Target cost per action</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {targetCpaVideo ? "CPA target set" : "No bid set"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 7. Budget and dates */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg">
                {openCampaignSetting === "budget" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Budget and dates</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-3 text-xs">
                      <p className="font-semibold text-slate-300">Enter budget type and amount</p>

                      <div className="flex flex-wrap items-center gap-4">
                        <select
                          value={videoBudgetType}
                          onChange={(e) => setVideoBudgetType(e.target.value)}
                          className="bg-slate-955 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-medium"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Campaign Total">Campaign Total</option>
                        </select>

                        <div className="relative w-48">
                          <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-400">₹</span>
                          <input
                            type="text"
                            value={videoBudgetAmount}
                            onChange={(e) => setVideoBudgetAmount(e.target.value)}
                            placeholder="Required"
                            className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-100 placeholder-amber-400/70 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-955">
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("budget")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Budget and dates</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {videoBudgetAmount ? `₹${videoBudgetAmount} / day` : "Enter a budget"} • Start: {startDate} • End: {endDate || "None"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 8. Customer acquisition */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg text-xs">
                {openCampaignSetting === "customerAcquisition" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Customer acquisition</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    
                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={onlyNewCustomers}
                        onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-955 border-slate-700 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Only bid for new customers</span>
                        <span className="text-[11px] text-slate-400 block">Your campaign will be limited to only new customers, regardless of your bid strategy</span>
                      </div>
                    </label>

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                      By default, your campaign bids equally for new and existing customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about customer acquisition</a>
                    </p>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("customerAcquisition")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Customer acquisition</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {onlyNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 9. Brand guidelines */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "brandGuidelines" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Brand guidelines</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-slate-400">Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about brand guidelines</a></p>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-300">Custom colors</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Main Color Picker */}
                        <div className="space-y-1.5">
                          <label className="block text-slate-400 font-medium">Main color</label>
                          <div className="flex items-center gap-2.5 bg-slate-955 border border-slate-800 rounded-xl p-2">
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
                          <div className="flex items-center gap-2.5 bg-slate-955 border border-slate-800 rounded-xl p-2">
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
                          className="w-full max-w-sm bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("brandGuidelines")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Brand guidelines</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {mainBrandColor || accentBrandColor ? `Main: ${mainBrandColor}, Accent: ${accentBrandColor}` : "No guidelines set"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 10. EU political ads */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg text-xs">
                {openCampaignSetting === "euPoliticalAds" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">EU political ads</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("euPoliticalAds")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">EU political ads</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {euPoliticalAds === "YES" ? "Yes, EU political ads" : "Doesn't have EU political ads"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 11. Location and language */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "locationLang" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Location and language</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-slate-400 leading-relaxed">
                      You can set campaign location and language settings to overwrite ad group settings. The level can't be changed once the campaign is published.
                    </p>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCampaignLocationLang}
                        onChange={(e) => setUseCampaignLocationLang(e.target.checked)}
                        className="rounded bg-slate-955 border-slate-700 text-primary h-4 w-4"
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("locationLang")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Location and language</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {useCampaignLocationLang ? "Set at campaign level" : "Set at ad group, include people with presence in locations"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 12. Devices */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "devices" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Devices</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("devices")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Devices</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {deviceTargetingType === "ALL" ? "All eligible devices (computers, mobile, tablet, and TV screens)" : "Set specific targeting for devices"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 13. Ad schedule */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "adSchedule" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Ad schedule</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select value={adScheduleDays} onChange={(e) => setAdScheduleDays(e.target.value)} className="bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary">
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

                      <select value={adScheduleStartTime} onChange={(e) => setAdScheduleStartTime(e.target.value)} className="bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary">
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

                      <select value={adScheduleEndTime} onChange={(e) => setAdScheduleEndTime(e.target.value)} className="bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-semibold focus:outline-none focus:border-primary">
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("adSchedule")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Ad schedule</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {adScheduleDays === "All days" && adScheduleStartTime === "00:00" && adScheduleEndTime === "23:45" ? "All day" : `${adScheduleDays} - ${adScheduleStartTime} to ${adScheduleEndTime}`}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 14. Third-party measurement */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-3 shadow-lg text-xs">
                {openCampaignSetting === "thirdParty" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Third-party measurement</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-slate-400 leading-relaxed">
                      Add vendors to let them see measurement data for this campaign. Only vendors that have already been added to your account can be used for new campaigns.
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Third-party measurement coverage is limited for Video campaigns. Contact your vendor for more info.
                    </p>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 font-medium">
                      There are no available vendors for this campaign. You can add new vendors in your account settings
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("thirdParty")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Third-party measurement</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        None
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 15. Campaign URL options */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "urlOptions" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">Campaign URL options</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Tracking Template</label>
                      <input type="text" value={trackingTemplate} onChange={(e) => setTrackingTemplate(e.target.value)} placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono" />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-300">Final URL suffix</label>
                      <input type="text" value={finalUrlSuffix} onChange={(e) => setFinalUrlSuffix(e.target.value)} placeholder="Example: param1=value1&param2=value2" className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-slate-300">Custom Parameters</label>
                        <button
                          type="button"
                          onClick={() => setCustomParametersVideo(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                          className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add custom parameters
                        </button>
                      </div>
                      {customParametersVideo.map((p, idx) => (
                        <div key={p.id || idx} className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">{`{_`}</span>
                          <input type="text" value={p.name} onChange={(e) => { const u = [...customParametersVideo]; u[idx].name = e.target.value; setCustomParametersVideo(u); }} placeholder="Name" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100" />
                          <span className="font-mono text-slate-400">{`}`}</span>
                          <span className="font-mono text-slate-400">=</span>
                          <input type="text" value={p.value} onChange={(e) => { const u = [...customParametersVideo]; u[idx].value = e.target.value; setCustomParametersVideo(u); }} placeholder="Value" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("urlOptions")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Campaign URL options</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {trackingTemplate || finalUrlSuffix || customParametersVideo.some(p => p.name || p.value) ? "Custom URL options set" : "No options set"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 16. IP exclusions */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "ipExclusions" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-800 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-200">IP exclusions</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-300">Enter the Internet Protocol (IP) addresses to exclude from seeing your ads</label>
                      <textarea
                        rows={4}
                        value={ipExclusionsInput}
                        onChange={(e) => setIpExclusionsInput(e.target.value)}
                        placeholder="123.4.5.67&#10;123.4.5.*&#10;123.4.0.0/16"
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono"
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("ipExclusions")}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">IP exclusions</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ipExclusionsInput ? "Exclusions set" : "No exclusions set"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
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
                    <div key={ag.id} className="p-4 rounded-xl border border-slate-800 bg-slate-955 flex flex-wrap items-center justify-between gap-4 text-xs">
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
                            setVideoStep("AD_GROUP");
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
          ) : videoStep === "AD" ? (
            /* ── AD CREATION PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-white tracking-tight">{adName || "New Ad"}</h1>

              {/* 1. Ad Type Selector Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                {openAdSetting === "adType" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <h3 className="text-sm font-bold text-slate-100">Choose which type of ad to create</h3>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: "SINGLE_IMAGE", title: "Single image ad", desc: "Show ads with a single image" },
                        { key: "VIDEO", title: "Video ad", desc: "Show ads with a single video" },
                        { key: "CAROUSEL", title: "Carousel image ad", desc: "Show ads with multiple images in a carousel" }
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={() => setVideoAdType(item.key as any)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            videoAdType === item.key
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-slate-955 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span className="font-bold block mb-1 text-slate-200">{item.title}</span>
                          <span className="text-[10px] text-slate-400 leading-normal">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdSetting("adType")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Choose which type of ad to create</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {videoAdType === "SINGLE_IMAGE" ? "Single image ad" : videoAdType === "VIDEO" ? "Video ad" : "Carousel image ad"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 2. Ad Name Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 shadow-lg">
                {openAdSetting === "adName" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <label className="block text-slate-300 font-semibold">Ad name</label>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      maxLength={255}
                      value={adName}
                      onChange={(e) => setAdName(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-medium"
                    />
                    <p className="text-[10px] text-slate-500">Text is {adName.length} characters out of 255</p>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdSetting("adName")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Ad name</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                        {adName}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* 3. Final URL Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 shadow-lg">
                {openAdSetting === "finalUrl" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdSetting(null)}
                      className="flex items-center justify-between border-b border-slate-800 pb-3 cursor-pointer select-none"
                    >
                      <label className="block text-slate-300 font-semibold">Final URL</label>
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={adFinalUrl}
                      onChange={(e) => setAdFinalUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                    />
                    {!adFinalUrl || adFinalUrl === "https://" ? (
                      <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 block">Enter a final URL</span>
                    )}
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdSetting("finalUrl")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-200">Final URL</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                        {adFinalUrl || "https://"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Conditional Form Render based on Ad Type */}

              {/* ───────────────── SINGLE IMAGE AD ───────────────── */}
              {videoAdType === "SINGLE_IMAGE" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Media */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1">Media</h4>
                    
                    {/* Images Section */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-300 font-semibold">Images</label>
                          <span className="text-[10px] text-slate-500">Add up to 20 images</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Add at least 1 marketing image in landscape or square format</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {/* URL input option */}
                        <div className="flex gap-2 flex-1 w-full max-w-md">
                          <input
                            type="url"
                            id="adImageInput"
                            placeholder="Paste image URL..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                if (val) {
                                  setAdImages(prev => [...prev, val]);
                                  (e.currentTarget as HTMLInputElement).value = "";
                                }
                              }
                            }}
                            className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById("adImageInput") as HTMLInputElement;
                              if (el && el.value.trim()) {
                                setAdImages(p => [...p, el.value.trim()]);
                                el.value = "";
                              }
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                          >
                            Add URL
                          </button>
                        </div>

                        {/* File explorer upload button */}
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-650/20 border border-blue-500/20 text-blue-400 font-bold cursor-pointer transition-all self-stretch sm:self-auto text-center justify-center">
                          <Upload className="h-3.5 w-3.5" />
                          {isUploadingImage ? "Uploading to ImageKit..." : "Upload Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageKitUpload(file, "image");
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {adImages.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">At least 1 image is required</span>
                      )}
                      
                      {/* Image Preview Grid */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {adImages.map((img, i) => (
                          <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-955 flex items-center justify-center">
                            <img src={img} alt={`Ad Image ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdImages(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[8px] text-center py-0.5 truncate text-slate-300 font-mono">
                              Image {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logos Section */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-300 font-semibold">Logos</label>
                          <span className="text-[10px] text-slate-500">Add up to 5 logos</span>
                        </div>
                        <p className="text-[10px] text-slate-400">At least 1 logo is required</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {/* URL input option */}
                        <div className="flex gap-2 flex-1 w-full max-w-md">
                          <input
                            type="url"
                            id="adLogoInput"
                            placeholder="Paste logo URL..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                if (val) {
                                  setAdLogos(prev => [...prev, val]);
                                  (e.currentTarget as HTMLInputElement).value = "";
                                }
                              }
                            }}
                            className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById("adLogoInput") as HTMLInputElement;
                              if (el && el.value.trim()) {
                                setAdLogos(p => [...p, el.value.trim()]);
                                el.value = "";
                              }
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                          >
                            Add URL
                          </button>
                        </div>

                        {/* File explorer upload button */}
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-650/20 border border-blue-500/20 text-blue-400 font-bold cursor-pointer transition-all self-stretch sm:self-auto text-center justify-center">
                          <Upload className="h-3.5 w-3.5" />
                          {isUploadingLogo ? "Uploading to ImageKit..." : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageKitUpload(file, "logo");
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {adLogos.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">At least 1 logo is required</span>
                      )}

                      {/* Logo Preview Grid */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {adLogos.map((lg, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-955 flex items-center justify-center">
                            <img src={lg} alt={`Ad Logo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdLogos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[8px] text-center py-0.5 truncate text-slate-300 font-mono">
                              Logo {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1">Text</h4>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Headline</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 headlines</span>
                      </div>
                      
                      {adHeadlines.map((hl, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={40}
                              value={hl}
                              onChange={(e) => {
                                const u = [...adHeadlines];
                                u[idx] = e.target.value;
                                setAdHeadlines(u);
                              }}
                              placeholder="Headline"
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                            />
                            {adHeadlines.length > 1 && (
                              <button type="button" onClick={() => setAdHeadlines(p => p.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block font-mono">{hl.length} / 40 (Text is {hl.length} characters out of 40)</span>
                        </div>
                      ))}

                      {adHeadlines.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setAdHeadlines(prev => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add headline
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Description</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 descriptions</span>
                      </div>

                      {adDescriptions.map((desc, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              maxLength={90}
                              value={desc}
                              onChange={(e) => {
                                const u = [...adDescriptions];
                                u[idx] = e.target.value;
                                setAdDescriptions(u);
                              }}
                              placeholder="Description"
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                            />
                            {adDescriptions.length > 1 && (
                              <button type="button" onClick={() => setAdDescriptions(p => p.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block text-right font-mono">{desc.length} / 90 (Text is {desc.length} characters out of 90)</span>
                        </div>
                      ))}

                      {adDescriptions.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setAdDescriptions(prev => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add description
                        </button>
                      )}
                    </div>

                    {/* Call to action text */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <label className="block text-slate-300 font-semibold">Call to action text</label>
                      <div className="flex gap-3">
                        <select
                          value={adCallToAction}
                          onChange={(e) => setAdCallToAction(e.target.value)}
                          className="bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                        >
                          <option value="Automated">Automated</option>
                          <option value="Apply now">Apply now</option>
                          <option value="Book now">Book now</option>
                          <option value="Contact us">Contact us</option>
                          <option value="Download">Download</option>
                          <option value="Get quote">Get quote</option>
                          <option value="Learn more">Learn more</option>
                          <option value="Shop now">Shop now</option>
                          <option value="Sign up">Sign up</option>
                        </select>
                        <span className="text-slate-400 self-center">English (United States)</span>
                      </div>
                    </div>

                    {/* Business name */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <label className="block text-slate-300 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                      {!businessName && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Value is required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{businessName.length} / 25 (Text is {businessName.length} characters out of 25)</span>
                    </div>
                  </div>

                  {/* Asset Optimization */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <div>
                      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">Asset optimization</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Let Google AI use your existing ad content to create optimized assets. This helps improve ad coverage and drive conversions. <a href="#" className="text-blue-400 hover:underline">How it works</a>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="font-bold text-slate-300 block text-[11px]">Image</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optAdaptiveLayouts}
                          onChange={(e) => setOptAdaptiveLayouts(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-200">Adaptive layouts (On)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optAnimatedImages}
                          onChange={(e) => setOptAnimatedImages(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-200">Animated images Beta (On)</span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <span className="font-bold text-slate-300 block text-[11px]">Video</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optGeneratedVideos}
                          onChange={(e) => setOptGeneratedVideos(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <div>
                          <span className="text-slate-200 block">Generated videos (On)</span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            Turning on this enhancement will create a new auto-generated video ad. Video assets will update to include the latest assets from this ad.
                          </p>
                        </div>
                      </label>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal pt-2 border-t border-slate-800/40">
                      Ads using image or video assets optimized by these features will be labeled as created or edited with AI when shown in the European Union (EU), India, and New York state, in the US. Text assets on matters of public interest will also be labeled when shown in the EU. <a href="https://support.google.com/google-ads/answer/17140115?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Learn more about AI labeling requirements</a>
                    </p>
                  </div>

                  {/* URL and other options */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <div 
                      onClick={() => setShowAdUrlOptions(!showAdUrlOptions)}
                      className="flex items-center justify-between cursor-pointer pb-1 select-none font-bold text-slate-200"
                    >
                      <span>URL and other options</span>
                      <span>{showAdUrlOptions ? "▲" : "▼"}</span>
                    </div>

                    {showAdUrlOptions && (
                      <div className="space-y-4 pt-3 border-t border-slate-850 animate-in slide-in-from-top-1 duration-150">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={useDiffMobileUrl}
                            onChange={(e) => setUseDiffMobileUrl(e.target.checked)}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span>Use a different final URL for mobile</span>
                        </label>

                        {useDiffMobileUrl && (
                          <div className="space-y-1.5 animate-in fade-in duration-100">
                            <label className="block text-slate-400 font-semibold">Mobile final URL</label>
                            <input
                              type="text"
                              value={mobileFinalUrl}
                              onChange={(e) => setMobileFinalUrl(e.target.value)}
                              placeholder="https://"
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-300">Tracking template</label>
                          <input type="text" value={adTrackingTemplate} onChange={(e) => setAdTrackingTemplate(e.target.value)} placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none" />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-300">Final URL suffix</label>
                          <input type="text" value={adFinalUrlSuffix} onChange={(e) => setAdFinalUrlSuffix(e.target.value)} placeholder="Example: param1=value1&param2=value2" className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none" />
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block font-semibold text-slate-300">Custom Parameters</label>
                            <button
                              type="button"
                              onClick={() => setAdCustomParams(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                              className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add custom parameters
                            </button>
                          </div>
                          {adCustomParams.map((p, idx) => (
                            <div key={p.id || idx} className="flex items-center gap-2">
                              <span className="font-mono text-slate-400">{`{_`}</span>
                              <input type="text" value={p.name} onChange={(e) => { const u = [...adCustomParams]; u[idx].name = e.target.value; setAdCustomParams(u); }} placeholder="Name" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none" />
                              <span className="font-mono text-slate-400">{`}`}</span>
                              <span className="font-mono text-slate-400">=</span>
                              <input type="text" value={p.value} onChange={(e) => { const u = [...adCustomParams]; u[idx].value = e.target.value; setAdCustomParams(u); }} placeholder="Value" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none" />
                              <button type="button" onClick={() => setAdCustomParams(prev => prev.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ───────────────── VIDEO AD ───────────────── */}
              {videoAdType === "VIDEO" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Media */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1">Media</h4>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Videos</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 videos</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Search for a video or paste the URL from YouTube</p>

                      <div className="flex gap-2 max-w-xl">
                        <input
                          type="url"
                          id="adVideoInput"
                          placeholder="https://youtube.com/watch?v=..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = (e.currentTarget as HTMLInputElement).value.trim();
                              if (val) {
                                setAdVideos(prev => [...prev, val]);
                                (e.currentTarget as HTMLInputElement).value = "";
                              }
                            }
                          }}
                          className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("adVideoInput") as HTMLInputElement;
                            if (el && el.value.trim()) {
                              setAdVideos(p => [...p, el.value.trim()]);
                              el.value = "";
                            }
                          }}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                        >
                          Add
                        </button>
                      </div>

                      {adVideos.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {adVideos.map((vd, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-955 border border-slate-800 text-[10px] font-mono text-slate-300">
                            Video {i + 1}
                            <button onClick={() => setAdVideos(p => p.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Logos */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-300 font-semibold">Logos</label>
                          <span className="text-[10px] text-slate-500">Add up to 5 logos</span>
                        </div>
                        <p className="text-[10px] text-slate-400">At least 1 logo is required</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {/* URL input option */}
                        <div className="flex gap-2 flex-1 w-full max-w-md">
                          <input
                            type="url"
                            id="adLogoInputV"
                            placeholder="Paste logo URL..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                if (val) {
                                  setAdLogos(prev => [...prev, val]);
                                  (e.currentTarget as HTMLInputElement).value = "";
                                }
                              }
                            }}
                            className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById("adLogoInputV") as HTMLInputElement;
                              if (el && el.value.trim()) {
                                setAdLogos(p => [...p, el.value.trim()]);
                                el.value = "";
                              }
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                          >
                            Add URL
                          </button>
                        </div>

                        {/* File explorer upload button */}
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-650/20 border border-blue-500/20 text-blue-400 font-bold cursor-pointer transition-all self-stretch sm:self-auto text-center justify-center">
                          <Upload className="h-3.5 w-3.5" />
                          {isUploadingLogo ? "Uploading to ImageKit..." : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageKitUpload(file, "logo");
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {adLogos.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">At least 1 logo is required</span>
                      )}

                      {/* Logo Preview Grid */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {adLogos.map((lg, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-955 flex items-center justify-center">
                            <img src={lg} alt={`Ad Logo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdLogos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[8px] text-center py-0.5 truncate text-slate-300 font-mono">
                              Logo {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1">Text</h4>

                    {/* Headline */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Headline</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 headlines</span>
                      </div>

                      {adHeadlines.map((hl, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={40}
                              value={hl}
                              onChange={(e) => {
                                const u = [...adHeadlines];
                                u[idx] = e.target.value;
                                setAdHeadlines(u);
                              }}
                              placeholder="Headline"
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                            />
                            {adHeadlines.length > 1 && (
                              <button type="button" onClick={() => setAdHeadlines(p => p.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {!hl && <span className="text-[10px] text-rose-400 block font-semibold">Required</span>}
                          <span className="text-[10px] text-slate-500 block font-mono">{hl.length} / 40 (Text is {hl.length} characters out of 40)</span>
                        </div>
                      ))}

                      {adHeadlines.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setAdHeadlines(prev => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add headline
                        </button>
                      )}
                    </div>

                    {/* Long Headline */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Long headline</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 long headlines</span>
                      </div>

                      {adLongHeadlines.map((lh, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={90}
                              value={lh}
                              onChange={(e) => {
                                const u = [...adLongHeadlines];
                                u[idx] = e.target.value;
                                setAdLongHeadlines(u);
                              }}
                              placeholder="Long headline"
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100"
                            />
                            {adLongHeadlines.length > 1 && (
                              <button type="button" onClick={() => setAdLongHeadlines(p => p.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {!lh && <span className="text-[10px] text-rose-400 block font-semibold">Required</span>}
                          <span className="text-[10px] text-slate-500 block font-mono">{lh.length} / 90 (Text is {lh.length} characters out of 90)</span>
                        </div>
                      ))}

                      {adLongHeadlines.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setAdLongHeadlines(prev => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add long headline
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Description</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 descriptions</span>
                      </div>

                      {adDescriptions.map((desc, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              maxLength={90}
                              value={desc}
                              onChange={(e) => {
                                const u = [...adDescriptions];
                                u[idx] = e.target.value;
                                setAdDescriptions(u);
                              }}
                              placeholder="Description"
                              className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-xs text-slate-100"
                            />
                            {adDescriptions.length > 1 && (
                              <button type="button" onClick={() => setAdDescriptions(p => p.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {!desc && <span className="text-[10px] text-rose-400 block font-semibold">Required</span>}
                          <span className="text-[10px] text-slate-500 block text-right font-mono">{desc.length} / 90 (Text is {desc.length} characters out of 90)</span>
                        </div>
                      ))}

                      {adDescriptions.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setAdDescriptions(prev => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add description
                        </button>
                      )}
                    </div>

                    {/* Call to action */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <label className="block text-slate-300 font-semibold">Call to action text</label>
                      <select
                        value={adCallToAction}
                        onChange={(e) => setAdCallToAction(e.target.value)}
                        className="bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="Automated">(Automated)</option>
                        <option value="Apply now">Apply now</option>
                        <option value="Book now">Book now</option>
                        <option value="Contact us">Contact us</option>
                        <option value="Download">Download</option>
                        <option value="Learn more">Learn more</option>
                        <option value="Sign up">Sign up</option>
                      </select>
                    </div>

                    {/* Business Name */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <label className="block text-slate-300 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                      {!businessName && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{businessName.length} / 25 (Text is {businessName.length} characters out of 25)</span>
                    </div>
                  </div>

                  {/* Sitelinks */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">Sitelinks</h4>
                    <p className="text-[11px] text-slate-400">Add 4 or more to maximize performance</p>

                    <div className="flex gap-2 max-w-xl">
                      <input
                        type="text"
                        id="sitelinkInput"
                        placeholder="Add sitelink name"
                        className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("sitelinkInput") as HTMLInputElement;
                          if (el && el.value.trim()) {
                            setAdSitelinks(p => [...p, el.value.trim()]);
                            el.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                      >
                        Add Sitelink
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {adSitelinks.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-955 border border-slate-850 text-slate-300">
                          {s}
                          <button onClick={() => setAdSitelinks(p => p.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Asset Optimization */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <div>
                      <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">Asset optimization</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Let Google AI use your existing ad content to create optimized assets. This helps improve ad coverage and drive conversions. <a href="#" className="text-blue-400 hover:underline">How it works</a>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="font-bold text-slate-300 block text-[11px]">Video</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optShorterVideos}
                          onChange={(e) => setOptShorterVideos(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-200">Shorter videos (On)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optResizedVideos}
                          onChange={(e) => setOptResizedVideos(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-200">Resized videos (On)</span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <span className="font-bold text-slate-300 block text-[11px]">Image</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optLandingPagePreviews}
                          onChange={(e) => setOptLandingPagePreviews(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-200">Landing page previews (On)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── CAROUSEL IMAGE AD ───────────────── */}
              {videoAdType === "CAROUSEL" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Media */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1">Media</h4>

                    {/* Cards */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Cards</label>
                        <span className="text-[10px] text-slate-500">Add up to 10 cards</span>
                      </div>
                      
                      {carouselCards.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}

                      {carouselCards.map((card, idx) => (
                        <div key={card.id} className="p-4 bg-slate-955 border border-slate-800 rounded-xl space-y-3 relative flex gap-4">
                          {/* Thumbnail preview if exists */}
                          {card.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 shrink-0 self-center bg-slate-900">
                              <img src={card.image} alt={`Card ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300 text-[11px]">Card {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setCarouselCards(p => p.filter(item => item.id !== card.id))}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-400 font-medium">Image URL</label>
                                <div className="flex gap-2">
                                  <input
                                    type="url"
                                    value={card.image}
                                    onChange={(e) => {
                                      const u = [...carouselCards];
                                      u[idx].image = e.target.value;
                                      setCarouselCards(u);
                                    }}
                                    placeholder="https://example.com/slide.jpg"
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                                  />
                                  <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-650/20 text-blue-400 border border-blue-500/20 font-bold cursor-pointer text-[10px] transition-all">
                                    Upload
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageKitUpload(file, "carousel", idx);
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] text-slate-400 font-medium">Card Headline</label>
                                <input
                                  type="text"
                                  value={card.headline}
                                  onChange={(e) => {
                                    const u = [...carouselCards];
                                    u[idx].headline = e.target.value;
                                    setCarouselCards(u);
                                  }}
                                  placeholder="Card Headline"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {carouselCards.length < 10 && (
                        <button
                          type="button"
                          onClick={() => setCarouselCards(prev => [...prev, { id: `card-${Date.now()}`, image: "", headline: "", finalUrl: "https://" }])}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add card
                        </button>
                      )}
                    </div>

                    {/* Logos Section */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-300 font-semibold">Logos</label>
                          <span className="text-[10px] text-slate-500">Add up to 5 logos</span>
                        </div>
                        <p className="text-[10px] text-slate-400">At least 1 logo is required</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        {/* URL input option */}
                        <div className="flex gap-2 flex-1 w-full max-w-md">
                          <input
                            type="url"
                            id="adLogoInputC"
                            placeholder="Paste logo URL..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                if (val) {
                                  setAdLogos(prev => [...prev, val]);
                                  (e.currentTarget as HTMLInputElement).value = "";
                                }
                              }
                            }}
                            className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById("adLogoInputC") as HTMLInputElement;
                              if (el && el.value.trim()) {
                                  setAdLogos(p => [...p, el.value.trim()]);
                                el.value = "";
                              }
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                          >
                            Add URL
                          </button>
                        </div>

                        {/* File explorer upload button */}
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-650/20 border border-blue-500/20 text-blue-400 font-bold cursor-pointer transition-all self-stretch sm:self-auto text-center justify-center">
                          <Upload className="h-3.5 w-3.5" />
                          {isUploadingLogo ? "Uploading to ImageKit..." : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageKitUpload(file, "logo");
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {adLogos.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">At least 1 logo is required</span>
                      )}

                      {/* Logo Preview Grid */}
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {adLogos.map((lg, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-955 flex items-center justify-center">
                            <img src={lg} alt={`Ad Logo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdLogos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-[8px] text-center py-0.5 truncate text-slate-300 font-mono">
                              Logo {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-1">Text</h4>

                    {/* Headline */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Headline</label>
                        <span className="text-[10px] text-slate-500">Headline</span>
                      </div>
                      <input
                        type="text"
                        maxLength={40}
                        value={adHeadlines[0] || ""}
                        onChange={(e) => setAdHeadlines([e.target.value])}
                        placeholder="Headline"
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                      {!(adHeadlines[0]) && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{(adHeadlines[0] || "").length} / 40 (Text is {(adHeadlines[0] || "").length} characters out of 40)</span>
                    </div>

                    {/* Description */}
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      <div className="flex justify-between">
                        <label className="block text-slate-300 font-semibold">Description</label>
                        <span className="text-[10px] text-slate-500">Description</span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={90}
                        value={adDescriptions[0] || ""}
                        onChange={(e) => setAdDescriptions([e.target.value])}
                        placeholder="Description"
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                      />
                      {!(adDescriptions[0]) && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block text-right font-mono">{(adDescriptions[0] || "").length} / 90 (Text is {(adDescriptions[0] || "").length} characters out of 90)</span>
                    </div>

                    {/* Business Name */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <label className="block text-slate-300 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                      {!businessName && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{businessName.length} / 25 (Text is {businessName.length} characters out of 25)</span>
                    </div>
                  </div>

                  {/* URL and other options */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-lg">
                    <div 
                      onClick={() => setShowAdUrlOptions(!showAdUrlOptions)}
                      className="flex items-center justify-between cursor-pointer pb-1 select-none font-bold text-slate-200"
                    >
                      <span>URL and other options</span>
                      <span>{showAdUrlOptions ? "▲" : "▼"}</span>
                    </div>

                    {showAdUrlOptions && (
                      <div className="space-y-4 pt-3 border-t border-slate-850 animate-in slide-in-from-top-1 duration-150">
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-300">Tracking Template</label>
                          <input
                            type="url"
                            value={adTrackingTemplate}
                            onChange={(e) => setAdTrackingTemplate(e.target.value)}
                            placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-300">Final URL suffix</label>
                          <input
                            type="text"
                            value={adFinalUrlSuffix}
                            onChange={(e) => setAdFinalUrlSuffix(e.target.value)}
                            placeholder="Example: param1=value1&param2=value2"
                            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block font-semibold text-slate-300">Custom Parameters</label>
                            <button
                              type="button"
                              onClick={() => setAdCustomParams(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                              className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add custom parameters
                            </button>
                          </div>
                          {adCustomParams.map((p, idx) => (
                            <div key={p.id || idx} className="flex items-center gap-2">
                              <span className="font-mono text-slate-400">{`{_`}</span>
                              <input type="text" value={p.name} onChange={(e) => { const u = [...adCustomParams]; u[idx].name = e.target.value; setAdCustomParams(u); }} placeholder="Name" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none" />
                              <span className="font-mono text-slate-400">{`}`}</span>
                              <span className="font-mono text-slate-400">=</span>
                              <input type="text" value={p.value} onChange={(e) => { const u = [...adCustomParams]; u[idx].value = e.target.value; setAdCustomParams(u); }} placeholder="Value" className="w-1/2 bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none" />
                              <button type="button" onClick={() => setAdCustomParams(prev => prev.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── REVIEW CAMPAIGN PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="flex flex-col gap-1.5 pb-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Review your campaign</h1>
                <p className="text-slate-400 font-semibold text-xs">{videoCampaignName}</p>
              </div>

              {/* Campaign Level Details */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-100">{videoCampaignName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-rose-400 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>"{videoCampaignName}" has errors which will prevent this campaign from being published</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewCampaignDetails(!showReviewCampaignDetails)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-primary font-bold hover:bg-slate-750 transition-all cursor-pointer"
                  >
                    <span>More details</span>
                    {showReviewCampaignDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Daily budget</span>
                    <p className="text-slate-200 font-bold">{videoBudgetAmount ? `₹${videoBudgetAmount}` : "Not set"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Start date</span>
                    <p className="text-slate-200 font-bold">{startDate ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }) : "Not set"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">End date</span>
                    <p className="text-slate-200 font-bold">{endDate ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }) : "Not set"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Bidding strategy</span>
                    <p className="text-slate-200 font-bold">Maximize clicks</p>
                  </div>
                </div>

                {showReviewCampaignDetails && (
                  <div className="pt-4 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-slate-300 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Customer acquisition</span>
                      <span className="font-semibold text-slate-200 text-right">{onlyNewCustomers ? "Optimize for new customers" : "Bid equally for new and existing customers"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Brand guidelines</span>
                      <span className="font-semibold text-slate-200 text-right">No guidelines set</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">EU political ads</span>
                      <span className="font-semibold text-slate-200 text-right">{euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Location and language</span>
                      <span className="font-semibold text-slate-200 text-right">Set at ad group, include people with presence in locations</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Devices</span>
                      <span className="font-semibold text-slate-200 text-right">{deviceTargetingType === "ALL" ? "All eligible devices (computers, mobile, tablet, and TV screens)" : "Specific device targeting"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Ad schedule</span>
                      <span className="font-semibold text-slate-200 text-right">{adScheduleDays === "All days" && adScheduleStartTime === "00:00" && adScheduleEndTime === "23:45" ? "All day" : `${adScheduleDays} (${adScheduleStartTime} - ${adScheduleEndTime})`}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Campaign URL options</span>
                      <span className="font-semibold text-slate-200 text-right font-mono truncate max-w-[200px]" title={trackingTemplate || "No options set"}>{trackingTemplate ? "Template set" : "No options set"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">IP exclusions</span>
                      <span className="font-semibold text-slate-200 text-right truncate max-w-[200px]" title={ipExclusionsInput || "No exclusions set"}>{ipExclusionsInput ? "IP exclusions active" : "No exclusions set"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ad Group Level Details */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-100">{activeAdGroup.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-rose-400 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>"{activeAdGroup.name}" has errors which will prevent this campaign from being published</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewAdGroupDetails(!showReviewAdGroupDetails)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-primary font-bold hover:bg-slate-750 transition-all cursor-pointer"
                  >
                    <span>More details</span>
                    {showReviewAdGroupDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Ads</span>
                    <p className="text-slate-200 font-bold">1</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Available impressions</span>
                    <p className="text-slate-200 font-bold">10B+</p>
                  </div>
                </div>

                {showReviewAdGroupDetails && (
                  <div className="pt-4 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-slate-300 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Languages</span>
                      <span className="font-semibold text-slate-200 text-right">{selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "All languages"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Locations</span>
                      <span className="font-semibold text-slate-200 text-right">{selectedLocation === "ALL" ? "All locations" : selectedLocation === "INDIA" ? "India (country)" : customLocationInput || "Custom location"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Channels</span>
                      <span className="font-semibold text-slate-200 text-right">{selectedAdGroupChannels.length === 8 ? "All Google channels" : selectedAdGroupChannels.join(", ")}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Optimized targeting</span>
                      <span className="font-semibold text-slate-200 text-right">{useOptimizedTargeting ? "On" : "Off"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Ad group URL options</span>
                      <span className="font-semibold text-slate-200 text-right font-mono truncate max-w-[200px]" title={agTrackingTemplate || "No options set"}>{agTrackingTemplate ? "Template set" : "No options set"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ad Level Details */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-100">{adName || "Ad 1"}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-rose-400 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>"{adName || "Ad 1"}" has errors which will prevent this campaign from being published</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewAdDetails(!showReviewAdDetails)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-primary font-bold hover:bg-slate-750 transition-all cursor-pointer"
                  >
                    <span>More details</span>
                    {showReviewAdDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {showReviewAdDetails && (
                  <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-slate-300 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Active enhancements</span>
                      <span className="font-semibold text-slate-200 text-right">3 active enhancements</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Ad Type</span>
                      <span className="font-semibold text-slate-200 text-right">{videoAdType === "SINGLE_IMAGE" ? "Single image ad" : videoAdType === "VIDEO" ? "Video ad" : "Carousel image ad"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Assets</span>
                      <span className="font-semibold text-slate-200 text-right">{adImages.length === 0 && adLogos.length === 0 && adVideos.length === 0 ? "No assets" : `${adImages.length} images, ${adLogos.length} logos`}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                      <span className="text-slate-400 font-medium">Final URL</span>
                      <span className="font-semibold text-slate-200 text-right">{!adFinalUrl || adFinalUrl === "https://" ? "Final URL not set" : adFinalUrl}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Audience Creation Modal Overlay ── */}
      {isAudienceModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-955/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Header */}
          <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsAudienceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-base font-semibold text-white">New audience</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!audienceName.trim()) {
                  alert("Audience name is required.");
                  return;
                }
                setIsAudienceModalOpen(false);
              }}
              className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              Save Audience
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            
            {/* Audience Name */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-2.5 shadow-xl">
              <label className="block text-slate-300 font-bold text-xs">Audience name</label>
              <input
                type="text"
                required
                value={audienceName}
                onChange={(e) => setAudienceName(e.target.value)}
                placeholder="Enter audience name"
                className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary font-medium"
              />
              <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
            </div>

            {/* Include Group */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
              <span className="font-bold text-slate-200 text-xs block border-b border-slate-800 pb-1.5">Include people who match any of the following</span>
              
              {/* Custom Segments */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-300 block">Custom segments</span>
                    <span className="text-[10px] text-slate-400 block leading-normal mt-0.5 font-medium">People based on their search activity, downloaded apps, or visited sites</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NEW_CUSTOM_SEGMENT")}
                    className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 font-bold rounded-xl text-[11px]"
                  >
                    + New custom segment
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customSegmentsList.map((seg, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] text-blue-400 font-semibold">
                      {seg}
                      <button onClick={() => setCustomSegmentsList(p => p.filter((_, idx) => idx !== i))} className="hover:text-rose-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Your data */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-300 block">Your data</span>
                    <span className="text-[10px] text-slate-400 block leading-normal mt-0.5 font-medium">People who have previously interacted with your business</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("YOUR_DATA_BROWSE")}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl text-[11px]"
                    >
                      Browse data
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("NEW_YOUR_DATA")}
                      className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 font-bold rounded-xl text-[11px]"
                    >
                      + New segment
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {yourDataList.map((dataItem, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] text-blue-400 font-semibold">
                      {dataItem}
                      <button onClick={() => setYourDataList(p => p.filter((_, idx) => idx !== i))} className="hover:text-rose-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Lookalike segment */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-300 block">Lookalike segment</span>
                    <span className="text-[10px] text-slate-400 block leading-normal mt-0.5 font-medium">Reach people who are similar to your seed list</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NEW_LOOKALIKE")}
                    className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 font-bold rounded-xl text-[11px]"
                  >
                    + New lookalike segment
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lookalikeSegmentsList.map((seg, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] text-blue-400 font-semibold">
                      {seg}
                      <button onClick={() => setLookalikeSegmentsList(p => p.filter((_, idx) => idx !== i))} className="hover:text-rose-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests & detailed demographics */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-300 block">Interests & detailed demographics</span>
                    <span className="text-[10px] text-slate-400 block leading-normal mt-0.5 font-medium font-medium">People based on their interests, life events, or detailed demographics</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("INTERESTS_BROWSE")}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl text-[11px]"
                  >
                    Browse categories
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interestsList.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] text-blue-400 font-semibold">
                      {tag}
                      <button onClick={() => setInterestsList(p => p.filter((_, idx) => idx !== i))} className="hover:text-rose-400"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Exclude Group */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
              <span className="font-bold text-slate-200 text-xs block border-b border-slate-800 pb-1.5">Exclude people who match any of the following</span>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-300 block">Exclusions</span>
                    <span className="text-[10px] text-slate-400 block leading-normal mt-0.5 font-medium">Exclude remarketing lists or lookalike segments from this audience</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("EXCLUSIONS_BROWSE")}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl text-[11px]"
                    >
                      Browse exclusions
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("NEW_YOUR_DATA")}
                      className="px-3 py-1 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/20 text-rose-400 font-bold rounded-xl text-[11px]"
                    >
                      + New segment
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exclusionsList.map((seg, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/10 border border-rose-500/20 text-[10px] text-rose-400 font-semibold font-mono">
                      EXCLUDED: {seg}
                      <button onClick={() => setExclusionsList(p => p.filter((_, idx) => idx !== i))} className="hover:text-white"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Narrow Demographics Group */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4 shadow-xl">
              <span className="font-bold text-slate-200 text-xs block border-b border-slate-800 pb-1.5">Narrow audience to people who match the following</span>
              
              <div className="space-y-4 text-xs">
                <span className="font-bold text-slate-300 block">Demographics</span>
                
                {/* Gender */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Gender</span>
                  <div className="flex gap-4">
                    {["Female", "Male", "Unknown"].map(gen => (
                      <label key={gen} className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={genderTargeting[gen]}
                          onChange={(e) => setGenderTargeting({ ...genderTargeting, [gen]: e.target.checked })}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span>{gen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                  <span className="text-[11px] text-slate-400 block font-semibold">Age</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={ageRangeStart}
                      onChange={(e) => setAgeRangeStart(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-100"
                    >
                      {["18", "25", "35", "45", "55", "65"].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <span className="text-slate-500">to</span>
                    <select
                      value={ageRangeEnd}
                      onChange={(e) => setAgeRangeEnd(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-100"
                    >
                      {["24", "34", "44", "54", "64", "65+"].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <label className="flex items-center gap-2 ml-4 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={ageUnknown}
                        onChange={(e) => setAgeUnknown(e.target.checked)}
                        className="rounded text-primary h-3.5 w-3.5"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                </div>

                {/* Additional Demographics */}
                <div className="space-y-4 pt-3 border-t border-slate-800/40">
                  <span className="font-bold text-slate-300 block">Additional demographics</span>
                  
                  {/* Parental Status */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 block font-semibold">Parental status</span>
                    <div className="flex gap-4">
                      {["Parent", "Not a parent", "Unknown"].map(stat => (
                        <label key={stat} className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={parentalStatus[stat]}
                            onChange={(e) => setParentalStatus({ ...parentalStatus, [stat]: e.target.checked })}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span>{stat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Household Income */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-850">
                    <span className="text-[11px] text-slate-400 block font-semibold">Household income</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                      {["Top 10%", "11-20%", "21-30%", "31-40%", "41-50%", "Lower 50%", "Unknown"].map(inc => (
                        <label key={inc} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={incomeTargeting[inc]}
                            onChange={(e) => setIncomeTargeting({ ...incomeTargeting, [inc]: e.target.checked })}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span>{inc}</span>
                        </label>
                      ))}
                    </div>
                    
                    <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5">
                      Note: Household income targeting is only available in select countries. <a href="https://support.google.com/google-ads/answer/2580383?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Learn more</a>
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* ───────────────── NESTED SUB-MODALS ───────────────── */}

          {/* 1. NEW CUSTOM SEGMENT SUB-MODAL */}
          {activeAudienceSubTab === "NEW_CUSTOM_SEGMENT" && (
            <div className="fixed inset-0 z-[130] bg-slate-955/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">New custom segment</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-300 leading-relaxed">
                  Ads using audience targeting must comply with the <a href="https://support.google.com/adspolicy/answer/143465?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Personalized advertising policy</a>. Sensitive keywords will serve contextually only, or may not serve at all. All campaigns are subject to the Google Ads advertising policies and may not contain any inappropriate content. <a href="https://support.google.com/adspolicy/answer/6015406?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Learn more</a>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-semibold">Segment name</label>
                  <input
                    type="text"
                    value={newCustomSegName}
                    onChange={(e) => setNewCustomSegName(e.target.value)}
                    placeholder="Enter segment name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-800/60">
                  <span className="font-bold text-slate-300 block">Include people with following interests or behaviors</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 font-semibold">
                      <input
                        type="radio"
                        name="customSegType"
                        checked={newCustomSegType === "INTERESTS"}
                        onChange={() => setNewCustomSegType("INTERESTS")}
                        className="mt-0.5 text-primary h-3.5 w-3.5"
                      />
                      <div>
                        <span>People with any of these interests or purchase intentions</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 font-semibold">
                      <input
                        type="radio"
                        name="customSegType"
                        checked={newCustomSegType === "SEARCH_TERMS"}
                        onChange={() => setNewCustomSegType("SEARCH_TERMS")}
                        className="mt-0.5 text-primary h-3.5 w-3.5"
                      />
                      <div>
                        <span>People who searched for any of these terms on Google</span>
                        <span className="text-[10px] text-slate-500 font-medium block leading-normal mt-0.5">
                          Only on campaigns running on Google properties. On other campaigns, terms will be used as interests or purchase intentions.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-400 font-semibold">Add Google search terms</label>
                    <input
                      type="text"
                      value={newCustomSegKeywords}
                      onChange={(e) => setNewCustomSegKeywords(e.target.value)}
                      placeholder="Enter terms or keywords"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-400 font-semibold">or people who browse websites similar to</label>
                    <input
                      type="text"
                      value={newCustomSegUrls}
                      onChange={(e) => setNewCustomSegUrls(e.target.value)}
                      placeholder="Add URLs (e.g. example.com)"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-400 font-semibold">or people who use apps similar to</label>
                    <input
                      type="text"
                      value={newCustomSegApps}
                      onChange={(e) => setNewCustomSegApps(e.target.value)}
                      placeholder="Add apps (e.g. Google Chrome)"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCustomSegName.trim()) {
                        alert("Segment name is required.");
                        return;
                      }
                      setCustomSegmentsList(prev => [...prev, newCustomSegName.trim()]);
                      setNewCustomSegName("");
                      setNewCustomSegKeywords("");
                      setNewCustomSegUrls("");
                      setNewCustomSegApps("");
                      setActiveAudienceSubTab("NONE");
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500"
                  >
                    Save Segment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. YOUR DATA BROWSE SUB-MODAL */}
          {activeAudienceSubTab === "YOUR_DATA_BROWSE" && (
            <div className="fixed inset-0 z-[130] bg-slate-955/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">Select Your Data</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[
                    "Custom combination",
                    "AdWords optimized list (0)",
                    "Website visitors",
                    "All converters (0)",
                    "Google-engaged audiences - for Account 6587355041"
                  ].map((dataOpt) => (
                    <label key={dataOpt} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-950 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={yourDataList.includes(dataOpt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setYourDataList(p => [...p, dataOpt]);
                          } else {
                            setYourDataList(p => p.filter(x => x !== dataOpt));
                          }
                        }}
                        className="rounded text-primary h-3.5 w-3.5"
                      />
                      <span>{dataOpt}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="w-full py-2 rounded-xl bg-blue-650 text-white font-bold hover:bg-blue-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. NEW YOUR DATA CREATOR MENU */}
          {activeAudienceSubTab === "NEW_YOUR_DATA" && (
            <div className="fixed inset-0 z-[130] bg-slate-955/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">Available segment types</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: "Website visitors", desc: "People who visited your website or landing pages" },
                    { title: "YouTube users", desc: "People who interacted with your YouTube channel or videos" },
                    { title: "Google Analytics 4 segment", desc: "Create Web/App segment using Google Analytics audience builder" },
                    { title: "Customer list", desc: "List of customer data that you've collected" },
                    { title: "Lead form segment", desc: "People who have submitted your lead form" },
                    { title: "App users", desc: "People who've downloaded your mobile app" }
                  ].map((type) => (
                    <div
                      key={type.title}
                      onClick={() => {
                        const name = prompt(`Enter ${type.title} segment name:`, `Demo ${type.title}`);
                        if (name) {
                          setYourDataList(prev => [...prev, name]);
                        }
                        setActiveAudienceSubTab("NONE");
                      }}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 cursor-pointer space-y-0.5 text-left"
                    >
                      <span className="font-bold text-slate-200 block">{type.title}</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">{type.desc}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 pt-1">
                    Create other segment types in <a href="https://ads.google.com/aw/audiences/management?ocid=7791004787&authuser=1&__u=5934081039&__c=8317099163" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Audience manager</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. NEW LOOKALIKE SUB-MODAL */}
          {activeAudienceSubTab === "NEW_LOOKALIKE" && (
            <div className="fixed inset-0 z-[130] bg-slate-955/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">New lookalike segment</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 leading-normal">
                  Newly created lookalike segments typically take 48 hours to generate and show ads.
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-semibold">Segment name</label>
                  <input
                    type="text"
                    value={newLookalikeName}
                    onChange={(e) => setNewLookalikeName(e.target.value)}
                    placeholder="Enter a lookalike segment name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="font-semibold text-slate-300 block">Seed list</span>
                  <p className="text-[10px] text-slate-500">Include users who are similar to a list of customers. Up to 10 seed lists can be selected.</p>
                  
                  <div className="flex gap-2">
                    <select
                      value={newLookalikeSeedList}
                      onChange={(e) => setNewLookalikeSeedList(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200"
                    >
                      <option value="">-- Select seed list --</option>
                      {yourDataList.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="All website visitors">All website visitors</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("NEW_YOUR_DATA")}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                    >
                      Add your data segments
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    The performance of your lookalike segment depends on the quality of your seed list. The more people you include, and the more those people have in common, the better your campaign will perform.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <label className="block font-semibold text-slate-300">Locations</label>
                  <p className="text-[10px] text-slate-500">Choose which countries you want your lookalike segment to include</p>
                  <input
                    type="text"
                    value={newLookalikeCountry}
                    onChange={(e) => setNewLookalikeCountry(e.target.value)}
                    placeholder="Select a location to include"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                  />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <label className="block font-semibold text-slate-300">Segment reach</label>
                  <p className="text-[10px] text-slate-500">Reach people similar to those on your seed list(s)</p>
                  <select
                    value={newLookalikeReach}
                    onChange={(e) => setNewLookalikeReach(e.target.value)}
                    className="bg-slate-955 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200"
                  >
                    <option value="1%">Narrow (1%) - Most similar</option>
                    <option value="5%">Balanced (5%)</option>
                    <option value="10%">Broad (10%) - Greatest reach</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newLookalikeName.trim()) {
                        alert("Lookalike name is required.");
                        return;
                      }
                      setLookalikeSegmentsList(prev => [...prev, newLookalikeName.trim()]);
                      setNewLookalikeName("");
                      setActiveAudienceSubTab("NONE");
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500"
                  >
                    Save Lookalike
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. INTERESTS BROWSE SUB-MODAL */}
          {activeAudienceSubTab === "INTERESTS_BROWSE" && (
            <div className="fixed inset-0 z-[130] bg-slate-955/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">Browse Interests & Demographics</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  
                  {/* Affinity Categories */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1 text-[11px]">Affinity (Long-term interests)</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      {[
                        { name: "Banking & Finance", reach: "8B" },
                        { name: "Beauty & Wellness", reach: "8.1B" },
                        { name: "Fashion", reach: "6.1B" },
                        { name: "Food & Dining", reach: "> 10B" },
                        { name: "Home & Garden", reach: "9.3B" },
                        { name: "Lifestyles & Hobbies", reach: "> 10B" },
                        { name: "Media & Entertainment", reach: "> 10B" },
                        { name: "News & Politics", reach: "> 10B" },
                        { name: "Shoppers", reach: "9.4B" },
                        { name: "Sports & Fitness", reach: "9.8B" },
                        { name: "Technology", reach: "> 10B" },
                        { name: "Travel", reach: "9.3B" },
                        { name: "Vehicles & Transportation", reach: "9.8B" }
                      ].map((item) => (
                        <label key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-950 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={interestsList.includes(item.name)}
                              onChange={(e) => {
                                        if (e.target.checked) setInterestsList(p => [...p, item.name]);
                                        else setInterestsList(p => p.filter(x => x !== item.name));
                              }}
                              className="rounded text-primary h-3.5 w-3.5"
                            />
                            <span>{item.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.reach}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* In-Market Categories */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/40">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1 text-[11px]">In-Market (Recent search and purchase intent)</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      {[
                        { name: "Apparel & Accessories", reach: "8.3B" },
                        { name: "Activewear", reach: "3.5B" },
                        { name: "Backpacks", reach: "5.9B" },
                        { name: "Costumes", reach: "2.6B" },
                        { name: "Eyewear", reach: "5.7B" },
                        { name: "Formal Wear", reach: "3.6B" },
                        { name: "Handbags", reach: "2.3B" },
                        { name: "Hats", reach: "3.2B" },
                        { name: "Jewelry & Watches", reach: "6.7B" },
                        { name: "Lingerie", reach: "3B" },
                        { name: "Luggage", reach: "3.2B" },
                        { name: "Men's Apparel", reach: "4.6B" },
                        { name: "Outerwear", reach: "2.2B" },
                        { name: "Pants", reach: "3.7B" },
                        { name: "Shirts & Tops", reach: "3.4B" },
                        { name: "Shoes", reach: "5.7B" },
                        { name: "Socks", reach: "1.4B" },
                        { name: "Swimwear", reach: "1.5B" },
                        { name: "Underwear", reach: "3.2B" },
                        { name: "Wallets, Briefcases & Leather Goods", reach: "2B" },
                        { name: "Women's Apparel", reach: "5B" },
                        { name: "Arts & Crafts Supplies", reach: "3.1B" },
                        { name: "Autos & Vehicles", reach: "8.3B" },
                        { name: "Auto Repair & Maintenance", reach: "4.6B" },
                        { name: "Baby & Children's Products", reach: "7B" },
                        { name: "Beauty & Personal Care", reach: "7.8B" },
                        { name: "Business & Industrial Products", reach: "3.4B" },
                        { name: "Computers & Peripherals", reach: "4.3B" },
                        { name: "Consumer Electronics", reach: "8.1B" },
                        { name: "Dating Services", reach: "2B" },
                        { name: "Education", reach: "7.8B" },
                        { name: "Employment", reach: "7B" },
                        { name: "Event Tickets", reach: "6.4B" },
                        { name: "Financial Services", reach: "7.6B" },
                        { name: "Food & Drink", reach: "7.3B" },
                        { name: "Gifts & Occasions", reach: "8.4B" },
                        { name: "Home & Garden", reach: "8.8B" },
                        { name: "Real Estate", reach: "5B" },
                        { name: "Software", reach: "6.6B" },
                        { name: "Sports & Fitness", reach: "7.7B" },
                        { name: "Telecom", reach: "6.3B" },
                        { name: "Travel", reach: "7.5B" }
                      ].map((item) => (
                        <label key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-950 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={interestsList.includes(item.name)}
                              onChange={(e) => {
                                if (e.target.checked) setInterestsList(p => [...p, item.name]);
                                else setInterestsList(p => p.filter(x => x !== item.name));
                              }}
                              className="rounded text-primary h-3.5 w-3.5"
                            />
                            <span>{item.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.reach}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Life Events */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/40">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1 text-[11px]">Life events</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      {[
                        { name: "Business Creation", reach: "2.7B" },
                        { name: "College Graduation", reach: "2.9B" },
                        { name: "Home Renovation", reach: "2.8B" },
                        { name: "Job Change", reach: "3.8B" },
                        { name: "Marriage", reach: "3.2B" },
                        { name: "Moving", reach: "1.7B" },
                        { name: "New Pet", reach: "980M" },
                        { name: "Purchasing a Home", reach: "2.1B" },
                        { name: "Retirement", reach: "970M" }
                      ].map((item) => (
                        <label key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-955 cursor-pointer">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={interestsList.includes(item.name)}
                              onChange={(e) => {
                                if (e.target.checked) setInterestsList(p => [...p, item.name]);
                                else setInterestsList(p => p.filter(x => x !== item.name));
                              }}
                              className="rounded text-primary h-3.5 w-3.5"
                            />
                            <span>{item.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.reach}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Demographics */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/40">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1 text-[11px]">Detailed demographics</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      {["Parental Status", "Marital Status", "Education", "Homeownership Status", "Employment"].map((item) => (
                        <label key={item} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-950 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={interestsList.includes(item)}
                            onChange={(e) => {
                              if (e.target.checked) setInterestsList(p => [...p, item]);
                              else setInterestsList(p => p.filter(x => x !== item));
                            }}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. EXCLUSIONS BROWSE SUB-MODAL */}
          {activeAudienceSubTab === "EXCLUSIONS_BROWSE" && (
            <div className="fixed inset-0 z-[130] bg-slate-955/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">Select Exclusions</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {yourDataList.concat(lookalikeSegmentsList).concat(["Website visitors", "All website converters"]).map((exOpt) => (
                    <label key={exOpt} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-955 cursor-pointer text-rose-400 font-mono">
                      <input
                        type="checkbox"
                        checked={exclusionsList.includes(exOpt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExclusionsList(p => [...p, exOpt]);
                          } else {
                            setExclusionsList(p => p.filter(x => x !== exOpt));
                          }
                        }}
                        className="rounded text-rose-500 h-3.5 w-3.5"
                      />
                      <span>EXCLUDE: {exOpt}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="w-full py-2 rounded-xl bg-rose-650 text-white font-bold hover:bg-rose-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
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
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-955 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Review Campaign
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {videoStep === "REVIEW" && (
            <button
              onClick={() => {
                alert(`Video campaign "${videoCampaignName}" published successfully!`);
                router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-955 hover:bg-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
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
