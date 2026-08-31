"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, Plus, Trash2, PhoneCall,
  Sparkles, Layers, Target, Search, Video, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3, Bell, ArrowLeft, Copy, Eye, MoreVertical, Upload, Menu
} from "lucide-react";

export default function LeadsDemandGenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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

  // Validation States & Google Ads Accounts Integration
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [existingCampaignsList, setExistingCampaignsList] = useState<Array<{ name?: string }>>([]);
  const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);

  // Load existing campaigns from Google Ads API / DB once on component mount
  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
    const targetCid = customerId || "6587355041";

    fetch(`${BACKEND}/api/ads/campaigns?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(targetCid)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setExistingCampaignsList(data);
          const normalized = demandGenCampaignName.trim().toLowerCase();
          const isDup = data.some((c: any) => c.name && c.name.trim().toLowerCase() === normalized);
          if (isDup) {
            setDuplicateNameError("Campaign name already exists. Please choose a unique campaign name.");
            setFieldErrors(prev => ({ ...prev, demandGenCampaignName: "Campaign name already exists. Please choose a unique campaign name." }));
          }
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });
  }, [customerId]);

  // Real-time check whenever demandGenCampaignName changes
  const checkDuplicateCampaignName = (nameToTest: string): boolean => {
    const trimmed = nameToTest.trim();
    if (!trimmed) {
      setDuplicateNameError(null);
      return false;
    }
    const normalized = trimmed.toLowerCase();
    const isDup = existingCampaignsList.some(c => c.name && c.name.trim().toLowerCase() === normalized);
    if (isDup) {
      const msg = "Campaign name already exists. Please choose a unique campaign name.";
      setDuplicateNameError(msg);
      setFieldErrors(prev => ({ ...prev, demandGenCampaignName: msg }));
      return true;
    } else {
      setDuplicateNameError(null);
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.demandGenCampaignName;
        return updated;
      });
      return false;
    }
  };

  const [demandGenGoal, setDemandGenGoal] = useState<"Conversions" | "Clicks" | "Conversion value" | "YouTube engagements">("Conversions");
  const [includeViewThrough, setIncludeViewThrough] = useState<boolean>(false);
  const [targetCpaDemandGen, setTargetCpaDemandGen] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("");
  const [demandGenBudgetType, setDemandGenBudgetType] = useState<string>("Daily");
  const [demandGenBudgetAmount, setDemandGenBudgetAmount] = useState<string>("");
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
  const [demandGenAdType, setDemandGenAdType] = useState<"SINGLE_IMAGE" | "VIDEO" | "CAROUSEL">("SINGLE_IMAGE");
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

  // Structured Validation Issues Definition for Review & Preflight
  interface ValidationIssue {
    id: string;
    level: "Campaign" | "Ad group" | "Ad";
    parameter: string;
    message: string;
    step: "CAMPAIGN_SETTINGS" | "AD_GROUP" | "AD";
    settingKey?: string;
    adGroupId?: string;
  }

  const getReviewValidationErrors = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // 1. Campaign Name
    const trimmedName = (demandGenCampaignName || "").trim();
    if (!trimmedName) {
      issues.push({
        id: "camp-name-req",
        level: "Campaign",
        parameter: "Campaign name",
        message: "Campaign name is required.",
        step: "CAMPAIGN_SETTINGS",
        settingKey: "name"
      });
    } else {
      const isDup = existingCampaignsList.some(
        c => c.name && c.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDup || duplicateNameError) {
        issues.push({
          id: "camp-name-dup",
          level: "Campaign",
          parameter: "Campaign name",
          message: "Campaign name already exists. Please choose a unique name.",
          step: "CAMPAIGN_SETTINGS",
          settingKey: "name"
        });
      }
    }

    // 2. Daily Budget
    const numBudget = Number(demandGenBudgetAmount);
    if (!demandGenBudgetAmount.trim() || isNaN(numBudget) || numBudget <= 0) {
      issues.push({
        id: "camp-budget",
        level: "Campaign",
        parameter: "Budget amount",
        message: "Daily Budget must be a positive number greater than 0.",
        step: "CAMPAIGN_SETTINGS",
        settingKey: "budget"
      });
    }

    // 3. Target CPA (if enabled)
    if (targetCpaDemandGen) {
      const numCpa = Number(targetCpaValue);
      if (!targetCpaValue.trim() || isNaN(numCpa) || numCpa <= 0) {
        issues.push({
          id: "camp-target-cpa",
          level: "Campaign",
          parameter: "Target CPA",
          message: "Target CPA is enabled and must be a positive number greater than 0.",
          step: "CAMPAIGN_SETTINGS",
          settingKey: "targetCpa"
        });
      }
    }

    // 4. Start & End Dates
    const todayFormatted = getTodayFormattedDate();
    if (startDate && startDate < todayFormatted) {
      issues.push({
        id: "camp-start-date",
        level: "Campaign",
        parameter: "Start date",
        message: `Start date (${startDate}) cannot be in the past.`,
        step: "CAMPAIGN_SETTINGS",
        settingKey: "budget"
      });
    }
    if (startDate && endDate && endDate < startDate) {
      issues.push({
        id: "camp-end-date",
        level: "Campaign",
        parameter: "End date",
        message: `End date (${endDate}) cannot be earlier than start date (${startDate}).`,
        step: "CAMPAIGN_SETTINGS",
        settingKey: "budget"
      });
    }

    // 5. Ad Schedule
    if (
      adScheduleStartTime &&
      adScheduleEndTime &&
      !(adScheduleStartTime === "00:00" && adScheduleEndTime === "00:00") &&
      adScheduleEndTime <= adScheduleStartTime
    ) {
      issues.push({
        id: "camp-ad-schedule",
        level: "Campaign",
        parameter: "Ad schedule",
        message: `Schedule end time (${adScheduleEndTime}) must be strictly after start time (${adScheduleStartTime}).`,
        step: "CAMPAIGN_SETTINGS",
        settingKey: "adSchedule"
      });
    }

    // 6. Custom Location
    if (selectedLocation === "CUSTOM" && !customLocationInput.trim()) {
      issues.push({
        id: "ag-custom-loc",
        level: "Ad group",
        parameter: "Locations",
        message: "A location name or territory is required when 'Enter another location' is selected.",
        step: "AD_GROUP",
        settingKey: "locations"
      });
    }

    // 7. Ad Group Names
    adGroups.forEach((ag, idx) => {
      if (!ag.name.trim()) {
        issues.push({
          id: `ag-name-${ag.id || idx}`,
          level: "Ad group",
          parameter: `Ad group ${idx + 1} name`,
          message: "Ad group name is required.",
          step: "AD_GROUP",
          settingKey: "name",
          adGroupId: ag.id
        });
      }
    });

    // 8. Ad Name
    if (!adName.trim()) {
      issues.push({
        id: "ad-name",
        level: "Ad",
        parameter: "Ad name",
        message: "Ad name is required.",
        step: "AD",
        settingKey: "adName"
      });
    }

    // 9. Ad Final URL
    const trimmedAdUrl = (adFinalUrl || "").trim();
    if (!trimmedAdUrl || (!trimmedAdUrl.startsWith("http://") && !trimmedAdUrl.startsWith("https://")) || trimmedAdUrl === "https://" || trimmedAdUrl === "http://") {
      issues.push({
        id: "ad-final-url",
        level: "Ad",
        parameter: "Final URL",
        message: "Final URL is required and must begin with http:// or https://",
        step: "AD",
        settingKey: "finalUrl"
      });
    }

    // 10. Mobile Final URL (if enabled)
    if (useDiffMobileUrl) {
      const trimmedMobUrl = (mobileFinalUrl || "").trim();
      if (!trimmedMobUrl || (!trimmedMobUrl.startsWith("http://") && !trimmedMobUrl.startsWith("https://")) || trimmedMobUrl === "https://" || trimmedMobUrl === "http://") {
        issues.push({
          id: "ad-mob-url",
          level: "Ad",
          parameter: "Mobile final URL",
          message: "Mobile final URL is enabled and must begin with http:// or https://",
          step: "AD"
        });
      }
    }

    // 11. Format-specific Assets Validation
    if (demandGenAdType === "SINGLE_IMAGE") {
      if (adImages.length === 0) {
        issues.push({
          id: "ad-images",
          level: "Ad",
          parameter: "Marketing images",
          message: "At least 1 marketing image is required.",
          step: "AD"
        });
      }
      if (adLogos.length === 0) {
        issues.push({
          id: "ad-logos",
          level: "Ad",
          parameter: "Business logo",
          message: "At least 1 logo is required.",
          step: "AD"
        });
      }
      const validHl = adHeadlines.filter(h => h && h.trim().length > 0);
      if (validHl.length === 0) {
        issues.push({
          id: "ad-headlines",
          level: "Ad",
          parameter: "Headlines",
          message: "At least 1 headline is required.",
          step: "AD"
        });
      }
      const validDesc = adDescriptions.filter(d => d && d.trim().length > 0);
      if (validDesc.length === 0) {
        issues.push({
          id: "ad-descriptions",
          level: "Ad",
          parameter: "Descriptions",
          message: "At least 1 description is required.",
          step: "AD"
        });
      }
      if (!businessName.trim()) {
        issues.push({
          id: "ad-biz-name",
          level: "Ad",
          parameter: "Business name",
          message: "Business name is required.",
          step: "AD"
        });
      }
    } else if (demandGenAdType === "VIDEO") {
      if (adVideos.length === 0) {
        issues.push({
          id: "ad-videos",
          level: "Ad",
          parameter: "Videos",
          message: "At least 1 YouTube video URL is required.",
          step: "AD"
        });
      }
      if (adLogos.length === 0) {
        issues.push({
          id: "ad-logos-video",
          level: "Ad",
          parameter: "Business logo",
          message: "At least 1 logo is required.",
          step: "AD"
        });
      }
      const validHl = adHeadlines.filter(h => h && h.trim().length > 0);
      if (validHl.length === 0) {
        issues.push({
          id: "ad-headlines-video",
          level: "Ad",
          parameter: "Headlines",
          message: "At least 1 headline is required.",
          step: "AD"
        });
      }
      const validLongHl = adLongHeadlines.filter(lh => lh && lh.trim().length > 0);
      if (validLongHl.length === 0) {
        issues.push({
          id: "ad-long-headlines-video",
          level: "Ad",
          parameter: "Long headline",
          message: "At least 1 long headline is required for video ads.",
          step: "AD"
        });
      }
      const validDesc = adDescriptions.filter(d => d && d.trim().length > 0);
      if (validDesc.length === 0) {
        issues.push({
          id: "ad-descriptions-video",
          level: "Ad",
          parameter: "Descriptions",
          message: "At least 1 description is required.",
          step: "AD"
        });
      }
      if (!businessName.trim()) {
        issues.push({
          id: "ad-biz-name-video",
          level: "Ad",
          parameter: "Business name",
          message: "Business name is required.",
          step: "AD"
        });
      }
    } else if (demandGenAdType === "CAROUSEL") {
      if (carouselCards.length < 2) {
        issues.push({
          id: "ad-carousel-cards",
          level: "Ad",
          parameter: "Carousel cards",
          message: "At least 2 carousel cards are required for carousel image ads.",
          step: "AD"
        });
      } else {
        const hasEmptyCard = carouselCards.some(c => !c.image.trim() || !c.headline.trim());
        if (hasEmptyCard) {
          issues.push({
            id: "ad-carousel-incomplete",
            level: "Ad",
            parameter: "Carousel card content",
            message: "All carousel cards must contain both an image URL and a headline.",
            step: "AD"
          });
        }
      }
      if (adLogos.length === 0) {
        issues.push({
          id: "ad-logos-carousel",
          level: "Ad",
          parameter: "Business logo",
          message: "At least 1 logo is required.",
          step: "AD"
        });
      }
      if (!adHeadlines[0] || !adHeadlines[0].trim()) {
        issues.push({
          id: "ad-headlines-carousel",
          level: "Ad",
          parameter: "Headline",
          message: "Headline is required.",
          step: "AD"
        });
      }
      if (!adDescriptions[0] || !adDescriptions[0].trim()) {
        issues.push({
          id: "ad-descriptions-carousel",
          level: "Ad",
          parameter: "Description",
          message: "Description is required.",
          step: "AD"
        });
      }
      if (!businessName.trim()) {
        issues.push({
          id: "ad-biz-name-carousel",
          level: "Ad",
          parameter: "Business name",
          message: "Business name is required.",
          step: "AD"
        });
      }
    }

    return issues;
  };

  const handleFixIssue = (issue: ValidationIssue) => {
    if (issue.adGroupId) {
      setActiveAdGroupId(issue.adGroupId);
    }
    setDemandGenStep(issue.step);
    if (issue.step === "CAMPAIGN_SETTINGS" && issue.settingKey) {
      setOpenCampaignSetting(issue.settingKey);
    } else if (issue.step === "AD_GROUP" && issue.settingKey) {
      setOpenAdGroupSetting(issue.settingKey);
    } else if (issue.step === "AD" && issue.settingKey) {
      setOpenAdSetting(issue.settingKey);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Header ────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 md:hidden cursor-pointer"
            title="Open steps menu"
            aria-label="Open steps menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all flex items-center gap-1 text-xs cursor-pointer"
            title="Back to campaign objectives"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-none">Demand Gen</span>
          </div>
        </div>

        {/* Global Search pill matching Google Ads header in screenshot */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-xs max-w-md w-full text-slate-500 shadow-inner">
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>"What are my top performing campaigns?"</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-none">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900 shrink-0" />
          <button
            onClick={() => router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer (Slide-over overlay) ── */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-slate-900 text-sm">Demand Gen</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Dynamic Status in Campaign Header */}
              {(() => {
                const allIssues = getReviewValidationErrors();
                const hasErrors = allIssues.length > 0;
                return (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="truncate">{demandGenCampaignName}</span>
                    {hasErrors ? (
                      <span title={`${allIssues.length} issue(s) detected`}>
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      </span>
                    ) : (
                      <span title="All parameters valid">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Navigation Tree Matching Google Ads Hierarchy */}
              <nav className="space-y-1 text-xs font-sans">
                {/* Campaign Header */}
                {(() => {
                  const campIssues = getReviewValidationErrors().filter(e => e.level === "Campaign");
                  const hasCampIssues = campIssues.length > 0;
                  return (
                    <div
                      onClick={() => {
                        setDemandGenStep("CAMPAIGN_SETTINGS");
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                        demandGenStep === "CAMPAIGN_SETTINGS"
                          ? "bg-blue-600/20 text-blue-400 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <LayoutGrid className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className="truncate">{demandGenCampaignName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasCampIssues ? (
                          <span title={`${campIssues.length} error(s)`}>
                            <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          </span>
                        ) : (
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="border-t border-slate-200 my-2" />

                {/* Dynamic List of Ad Groups with Nested Ads */}
                <div className="space-y-1">
                  {adGroups.map((ag) => {
                    const isAgActive = demandGenStep === "AD_GROUP" && activeAdGroupId === ag.id;

                    return (
                      <div key={ag.id} className="space-y-0.5">
                        {/* Ad Group Row */}
                        <div
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setDemandGenStep("AD_GROUP");
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                            isAgActive
                              ? "bg-blue-600/20 text-blue-400 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <LayoutGrid className={`h-4 w-4 shrink-0 ${isAgActive ? "text-blue-400" : "text-slate-500"}`} />
                            <span className="truncate">{ag.name}</span>
                          </div>
                        </div>

                        {/* Nested Child Ad 1 */}
                        <div
                          onClick={() => {
                            setActiveAdGroupId(ag.id);
                            setDemandGenStep("AD");
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`ml-6 p-2 rounded-r-full flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                            demandGenStep === "AD" && activeAdGroupId === ag.id
                              ? "bg-blue-600/20 text-blue-400 font-bold"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Plus className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">Ad 1</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 my-1.5" />
                      </div>
                    );
                  })}
                </div>

                {/* Review campaign */}
                <div
                  onClick={() => {
                    setDemandGenStep("REVIEW");
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`p-2.5 rounded-r-full flex items-center gap-2.5 font-semibold cursor-pointer transition-all ${
                    demandGenStep === "REVIEW"
                      ? "bg-blue-600/20 text-blue-400 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Info className="h-4 w-4 text-slate-500" />
                  <span>Review campaign</span>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sub-Navigation Sidebar matching screenshot */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar">
          <div className="space-y-4">
            {/* Dynamic Status in Campaign Header */}
            {(() => {
              const allIssues = getReviewValidationErrors();
              const hasErrors = allIssues.length > 0;
              return (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="truncate">{demandGenCampaignName}</span>
                  {hasErrors ? (
                    <span title={`${allIssues.length} issue(s) detected`}>
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    </span>
                  ) : (
                    <span title="All parameters valid">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Navigation Tree Matching Google Ads Hierarchy */}
            <nav className="space-y-1 text-xs font-sans">
              {/* Campaign Header */}
              {(() => {
                const campIssues = getReviewValidationErrors().filter(e => e.level === "Campaign");
                const hasCampIssues = campIssues.length > 0;
                return (
                  <div
                    onClick={() => setDemandGenStep("CAMPAIGN_SETTINGS")}
                    className={`p-2.5 rounded-r-full flex items-center justify-between font-semibold cursor-pointer transition-all ${
                      demandGenStep === "CAMPAIGN_SETTINGS"
                        ? "bg-blue-600/20 text-blue-400 font-bold"
                        : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <LayoutGrid className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="truncate">{demandGenCampaignName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasCampIssues ? (
                        <span title={`${campIssues.length} error(s)`}>
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        </span>
                      ) : (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                      <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-slate-200 my-2" />

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
                          setDemandGenStep("AD");
                        }}
                        className={`ml-6 p-2 rounded-r-full flex items-center justify-between text-xs font-medium cursor-pointer transition-all ${
                          demandGenStep === "AD" && activeAdGroupId === ag.id
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
                onClick={() => setDemandGenStep("REVIEW")}
                className={`p-2.5 rounded-r-full flex items-center gap-2.5 font-semibold cursor-pointer transition-all ${
                  demandGenStep === "REVIEW"
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
          
          {demandGenStep === "AD_GROUP" ? (
            /* ── AD GROUP SETUP PAGE ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{activeAdGroup.name}</h1>

              {/* 1. Ad group name Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                {openAdGroupSetting === "name" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Ad group name</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("name")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Ad group name</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeAdGroup.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("name");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Locations Card (Matching Screenshot Radio Options) */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                {openAdGroupSetting === "locations" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-xs text-slate-500">Select locations for this campaign</p>

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
                        <span className="text-slate-800">All countries and territories</span>
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
                        <span className="text-slate-800">India</span>
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("locations")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Locations</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : `Custom: ${customLocationInput || "None"}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("locations");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Languages Card (With Dropdown Option List) */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                {openAdGroupSetting === "languages" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-xs text-slate-500">Select the languages your customers speak.</p>

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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
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
                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-slate-700 font-medium">
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
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Languages</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "All languages"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("languages");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Channels Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "channels" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Channels</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-slate-500">Choose which ad channels your ad group is eligible to serve on</p>

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
                          <span className="font-semibold text-slate-800 block">All Google channels</span>
                          <span className="text-slate-500 text-[11px] block">Your ad will show across all eligible Google channels, driving campaign performance</span>
                        </div>
                      </label>

                      {channelTargeting === "ALL" && (
                        <label className="flex items-center gap-2 pl-7 cursor-pointer text-slate-700">
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
                          <span className="font-semibold text-slate-800 block">Let me choose</span>
                          <span className="text-slate-500 text-[11px] block">Your ad will be limited to show only on the eligible channels of your choice</span>
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
                              <label key={ch.name} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-50 cursor-pointer">
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
                                  <span className="font-bold text-slate-800 block">{ch.name}</span>
                                  <span className="text-[10px] text-slate-500">{ch.desc}</span>
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
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Channels</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {channelTargeting === "ALL" ? "All Google channels" : selectedAdGroupChannels.join(", ")}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("channels");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Audience Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "audience" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Audience</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    
                    <p className="text-slate-500">Target specific groups of people based on segments, remarketing lists, demographics, or custom interests.</p>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAudienceModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-slate-950 font-bold text-xs hover:bg-secondary cursor-pointer shadow-md shadow-primary/10 transition-all"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Create an audience
                      </button>
                    </div>

                    {audienceName && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-sm flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{audienceName}</span>
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
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Audience</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {audienceName || "No audience selected"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("audience");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Optimized Targeting Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "optimizedTargeting" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Optimized targeting</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-slate-500 leading-relaxed">
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
                          <span className="font-bold text-slate-800 block">Use optimized targeting</span>
                        </div>
                      </label>

                      {useOptimizedTargeting && (
                        <div className="pl-6 space-y-2 border-l border-slate-200 animate-in fade-in duration-100">
                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={limitOptimizedToAgeGender}
                              onChange={(e) => setLimitOptimizedToAgeGender(e.target.checked)}
                              className="mt-0.5 rounded text-primary h-3.5 w-3.5"
                            />
                            <div>
                              <span className="font-semibold text-slate-700 block">Only show ads to people within my age and gender specifications</span>
                              <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                                By only optimizing your targeting to people within your selected age and gender specifications, you may be limiting your campaign performance.
                              </span>
                            </div>
                          </label>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 leading-normal pt-2 border-t border-slate-200/40">
                        Information such as your selected audience, landing page, and assets are used to find people likely to convert. Your targeting signals may see reduced traffic if better performance is found elsewhere. <a href="https://support.google.com/google-ads/answer/10538014?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Learn more</a>
                      </p>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdGroupSetting("optimizedTargeting")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Optimized targeting</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {useOptimizedTargeting ? "Use optimized targeting" : "Off"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("optimizedTargeting");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Ad Group URL Options Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openAdGroupSetting === "urlOptions" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdGroupSetting(null)}
                      className="flex items-center justify-between cursor-pointer pb-1 select-none font-bold border-b border-slate-200 pb-3"
                    >
                      <h2 className="text-sm font-semibold text-slate-900">Ad group URL options</h2>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="space-y-4 pt-3 animate-in slide-in-from-top-1 duration-150">
                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700">Tracking Template</label>
                        <input
                          type="url"
                          value={agTrackingTemplate}
                          onChange={(e) => setAgTrackingTemplate(e.target.value)}
                          placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-semibold text-slate-700">Final URL suffix</label>
                        <input
                          type="text"
                          value={agFinalUrlSuffix}
                          onChange={(e) => setAgFinalUrlSuffix(e.target.value)}
                          placeholder="Example: param1=value1&param2=value2"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="block font-semibold text-slate-700">Custom Parameters</label>
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
                            <span className="font-mono text-slate-500">{`{_`}</span>
                            <input type="text" value={p.name} onChange={(e) => { const u = [...agCustomParams]; u[idx].name = e.target.value; setAgCustomParams(u); }} placeholder="Name" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none" />
                            <span className="font-mono text-slate-500">{`}`}</span>
                            <span className="font-mono text-slate-500">=</span>
                            <input type="text" value={p.value} onChange={(e) => { const u = [...agCustomParams]; u[idx].value = e.target.value; setAgCustomParams(u); }} placeholder="Value" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none" />
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
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Ad group URL options</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {agTrackingTemplate || agFinalUrlSuffix || agCustomParams.some(p => p.name || p.value) ? "Custom URL options set" : "No options set"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdGroupSetting("urlOptions");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : demandGenStep === "CAMPAIGN_SETTINGS" ? (
            /* ── CAMPAIGN SETTINGS PAGE (Matching User Specs) ── */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
              
              {/* 1. Prefill campaign Beta */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                {openCampaignSetting === "prefill" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-2.5 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-800">Prefill campaign</h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Save time by using Google AI to draft a Demand Gen campaign with settings & assets from an existing campaign. You can modify any setting before publishing. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("prefill")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56 flex items-center gap-2">
                        <span className="font-bold text-slate-800">Prefill campaign</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                        {selectedSourceCampaign ? `Source: ${selectedSourceCampaign}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("prefill");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
                      {existingCampaignsList.length === 0 ? (
                        <p className="text-center py-6 text-slate-500 text-xs">No existing campaigns found.</p>
                      ) : (
                        existingCampaignsList
                          .filter((c: any) => (c.name || "").toLowerCase().includes(campaignSearchTerm.toLowerCase()))
                          .map((camp: any, idx: number) => {
                            const campName = camp.name || `Campaign ${idx + 1}`;
                            return (
                              <div
                                key={camp.id || camp.resourceName || idx}
                                onClick={() => {
                                  setSelectedSourceCampaign(campName);
                                  setIsCampaignModalOpen(false);
                                }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                  selectedSourceCampaign === campName
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800"
                                }`}
                              >
                                <div>
                                  <p className="text-xs font-bold">{campName}</p>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                    <span>Type: {camp.advertisingChannelType || camp.type || "Demand Gen"}</span>
                                    <span>•</span>
                                    <span>Status: {camp.status || "Active"}</span>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  camp.status === "ENABLED" || camp.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {camp.status || "Active"}
                                </span>
                              </div>
                            );
                          })
                      )}
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
              <div className={`p-5 rounded-2xl border bg-white space-y-3 shadow-lg ${
                !demandGenCampaignName.trim() || duplicateNameError || fieldErrors.demandGenCampaignName
                  ? "border-rose-400 bg-rose-50/10"
                  : "border-slate-200"
              }`}>
                {openCampaignSetting === "name" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        <label className="block text-xs font-bold text-slate-800 cursor-pointer">Campaign name</label>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={demandGenCampaignName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDemandGenCampaignName(val);
                        checkDuplicateCampaignName(val);
                      }}
                      maxLength={256}
                      className={`w-full border rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none font-medium ${
                        !demandGenCampaignName.trim() || duplicateNameError || fieldErrors.demandGenCampaignName
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                          : "bg-slate-50 border-slate-200 focus:border-primary"
                      }`}
                    />
                    {!demandGenCampaignName.trim() && (
                      <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Campaign name is required
                      </span>
                    )}
                    {demandGenCampaignName.trim() && (duplicateNameError || fieldErrors.demandGenCampaignName) && (
                      <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {duplicateNameError || fieldErrors.demandGenCampaignName}
                      </span>
                    )}
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Text is {demandGenCampaignName.length} characters out of 256</span>
                      <span>{demandGenCampaignName.length} / 256</span>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("name")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56 flex items-center gap-1">
                        <span className="font-bold text-slate-800">Campaign name</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <div className="text-[11px] font-medium">
                        {demandGenCampaignName.trim() ? (
                          duplicateNameError || fieldErrors.demandGenCampaignName ? (
                            <span className="text-rose-500 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {duplicateNameError || fieldErrors.demandGenCampaignName}
                            </span>
                          ) : (
                            <span className="text-slate-500">{demandGenCampaignName}</span>
                          )
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Campaign name is required
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("name");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Campaign Goal Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                {openCampaignSetting === "goal" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-2.5 cursor-pointer select-none"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Campaign goal</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Select the goal for your Demand Gen campaign</p>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        { id: "Conversions", title: "Conversions", desc: "Get more Leads or other conversion actions with your audiences by using a conversion based bid strategy" },
                        { id: "Clicks", title: "Clicks", desc: "Get more traffic or engagement with your ads using a cost-per-click based bid strategy" },
                        { id: "Conversion value", title: "Conversion value", desc: "Get more Leads or other conversion actions to get the most value or at a value you set" },
                        { id: "YouTube engagements", title: "YouTube engagements", desc: "Get more YouTube subscriptions and engagements" }
                      ].map((goalItem) => {
                        const isSelected = demandGenGoal === goalItem.id;
                        return (
                          <div
                            key={goalItem.id}
                            onClick={() => setDemandGenGoal(goalItem.id as any)}
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
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("goal")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Campaign goal</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {demandGenGoal}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("goal");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Conversion Goals Card (Hidden for Clicks and YouTube engagements) */}
              {demandGenGoal !== "Clicks" && demandGenGoal !== "YouTube engagements" && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                  {openCampaignSetting === "conversions" ? (
                    <>
                      <div 
                        onClick={() => setOpenCampaignSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2.5 cursor-pointer select-none"
                      >
                        <h3 className="text-xs font-bold text-slate-800">Conversion goals</h3>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
                        <div className="grid grid-cols-12 px-4 py-2.5 bg-white font-semibold text-slate-500 border-b border-slate-200">
                          <div className="col-span-4">Conversion Goals</div>
                          <div className="col-span-3">Conversion Source</div>
                          <div className="col-span-3 text-right">Conversion Actions</div>
                          <div className="col-span-2 text-right">More actions</div>
                        </div>
                        <div className="grid grid-cols-12 px-4 py-3 text-slate-800 items-center">
                          <div className="col-span-4 font-medium flex items-center gap-2">
                            <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0" />
                            Phone call leads (account default)
                          </div>
                          <div className="col-span-3 text-slate-500">Call from Ads</div>
                          <div className="col-span-3 text-right text-amber-400 font-medium">1 action</div>
                          <div className="col-span-2 text-right text-slate-500 hover:text-slate-900 cursor-pointer">More actions ▾</div>
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
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56">
                          <span className="font-bold text-slate-800">Conversion goals</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Use campaign specific goal: Phone call leads
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCampaignSetting("conversions");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 5. View-through conversion optimization Beta (Hidden only for Clicks) */}
              {demandGenGoal !== "Clicks" && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                  {openCampaignSetting === "viewThrough" ? (
                    <>
                      <div 
                        onClick={() => setOpenCampaignSetting(null)}
                        className="flex items-center justify-between border-b border-slate-200 pb-2.5 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-800">View-through conversion optimization</h3>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Google Ads can include view-through conversions, in addition to click-through and engaged-view conversions, when bidding and reporting. While in beta, not all channels are supported. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer pt-1 text-xs">
                        <input
                          type="checkbox"
                          checked={includeViewThrough}
                          onChange={(e) => setIncludeViewThrough(e.target.checked)}
                          className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">Include view-through conversions</span>
                          <span className="text-[11px] text-slate-500 block">Recorded when users view (but don't interact with) an ad and then later convert</span>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div 
                      onClick={() => setOpenCampaignSetting("viewThrough")}
                      className="flex items-center justify-between cursor-pointer select-none text-xs group"
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-56 flex items-center gap-2">
                          <span className="font-bold text-slate-800">View-through conversion optimization</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {includeViewThrough ? "Turned on" : "Turned off"}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCampaignSetting("viewThrough");
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Target cost per action */}
              <div className={`p-5 rounded-2xl border bg-white space-y-3 shadow-lg ${
                targetCpaDemandGen && (!targetCpaValue.trim() || isNaN(Number(targetCpaValue)) || Number(targetCpaValue) <= 0 || fieldErrors.targetCpaValue)
                  ? "border-rose-400 bg-rose-50/10"
                  : "border-slate-200"
              }`}>
                {openCampaignSetting === "targetCpa" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-2.5 cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Target cost per action</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      By default, your campaign will aim to maximize your conversions. You can set an optional target cost per action (Target CPA) to optimize for getting conversions at a specific cost per conversion.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer pt-1 text-xs">
                      <input
                        type="checkbox"
                        checked={targetCpaDemandGen}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setTargetCpaDemandGen(checked);
                          if (!checked) {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.targetCpaValue;
                              return updated;
                            });
                          } else if (!targetCpaValue.trim() || isNaN(Number(targetCpaValue)) || Number(targetCpaValue) <= 0) {
                            setFieldErrors(prev => ({ ...prev, targetCpaValue: "Target CPA must be a positive number greater than 0." }));
                          }
                        }}
                        className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">Set a target cost per action (optional)</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Target CPA is the average amount you'd like to pay for a conversion. Google Ads will optimize bids to help get as many conversions as possible at the target cost-per-action (CPA). <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                        </p>
                      </div>
                    </label>

                    {targetCpaDemandGen && (
                      <div className="pt-2 pl-7 space-y-1">
                        <label className="block text-slate-700 font-semibold text-xs">Target CPA amount (₹)</label>
                        <div className="relative w-48">
                          <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-500">₹</span>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={targetCpaValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTargetCpaValue(val);
                              if (!val.trim() || isNaN(Number(val)) || Number(val) <= 0) {
                                setFieldErrors(prev => ({ ...prev, targetCpaValue: "Target CPA must be a positive number greater than 0." }));
                              } else {
                                setFieldErrors(prev => {
                                  const updated = { ...prev };
                                  delete updated.targetCpaValue;
                                  return updated;
                                });
                              }
                            }}
                            placeholder="e.g. 50"
                            className={`w-full border rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-medium focus:outline-none ${
                              !targetCpaValue.trim() || isNaN(Number(targetCpaValue)) || Number(targetCpaValue) <= 0 || fieldErrors.targetCpaValue
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "bg-slate-50 border-slate-200 focus:border-primary"
                            }`}
                          />
                        </div>
                        {(!targetCpaValue.trim() || isNaN(Number(targetCpaValue)) || Number(targetCpaValue) <= 0 || fieldErrors.targetCpaValue) && (
                          <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.targetCpaValue || "Target CPA must be a positive number greater than 0."}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("targetCpa")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Target cost per action</span>
                      </div>
                      <div className="text-[11px] font-medium">
                        {targetCpaDemandGen ? (
                          !targetCpaValue.trim() || isNaN(Number(targetCpaValue)) || Number(targetCpaValue) <= 0 || fieldErrors.targetCpaValue ? (
                            <span className="text-rose-500 flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Target CPA must be greater than 0
                            </span>
                          ) : (
                            <span className="text-slate-700">₹{targetCpaValue}</span>
                          )
                        ) : (
                          <span className="text-slate-500">No bid set</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("targetCpa");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Budget and dates */}
              <div className={`p-5 rounded-2xl border bg-white space-y-4 shadow-lg ${
                !demandGenBudgetAmount.trim() || isNaN(Number(demandGenBudgetAmount)) || Number(demandGenBudgetAmount) <= 0 || fieldErrors.demandGenBudgetAmount || (startDate && startDate < getTodayFormattedDate()) || (startDate && endDate && endDate < startDate)
                  ? "border-rose-400 bg-rose-50/10"
                  : "border-slate-200"
              }`}>
                {openCampaignSetting === "budget" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        <h3 className="text-xs font-bold text-slate-800">Budget and dates</h3>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="space-y-3 text-xs">
                      <p className="font-semibold text-slate-700">Enter budget type and amount</p>

                      <div className="flex flex-wrap items-center gap-4">
                        <select
                          value={demandGenBudgetType}
                          onChange={(e) => setDemandGenBudgetType(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 font-medium"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Campaign Total">Campaign Total</option>
                        </select>

                        <div className="relative w-48">
                          <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-500">₹</span>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={demandGenBudgetAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDemandGenBudgetAmount(val);
                              if (!val.trim() || isNaN(Number(val)) || Number(val) <= 0) {
                                setFieldErrors(prev => ({ ...prev, demandGenBudgetAmount: "Daily Budget must be a positive number greater than 0." }));
                              } else {
                                setFieldErrors(prev => {
                                  const updated = { ...prev };
                                  delete updated.demandGenBudgetAmount;
                                  return updated;
                                });
                              }
                            }}
                            placeholder="Required"
                            className={`w-full border rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-medium focus:outline-none ${
                              !demandGenBudgetAmount.trim() || isNaN(Number(demandGenBudgetAmount)) || Number(demandGenBudgetAmount) <= 0 || fieldErrors.demandGenBudgetAmount
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "bg-slate-50 border-slate-200 focus:border-primary"
                            }`}
                          />
                        </div>
                      </div>

                      {(!demandGenBudgetAmount.trim() || isNaN(Number(demandGenBudgetAmount)) || Number(demandGenBudgetAmount) <= 0 || fieldErrors.demandGenBudgetAmount) && (
                        <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.demandGenBudgetAmount || "Daily Budget is required and must be greater than 0."}
                        </span>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="space-y-1.5">
                          <label className="block text-slate-700 font-medium">Start date</label>
                          <input
                            type="date"
                            min={getTodayFormattedDate()}
                            value={startDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStartDate(val);
                              if (val && val < getTodayFormattedDate()) {
                                setFieldErrors(prev => ({ ...prev, startDate: "Start date cannot be in the past." }));
                              } else {
                                setFieldErrors(prev => {
                                  const updated = { ...prev };
                                  delete updated.startDate;
                                  return updated;
                                });
                              }
                            }}
                            className={`w-full border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none font-medium ${
                              startDate && startDate < getTodayFormattedDate() || fieldErrors.startDate
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "bg-white border-slate-200 focus:border-primary"
                            }`}
                          />
                          {startDate && startDate < getTodayFormattedDate() && (
                            <span className="text-[10px] text-rose-500 font-medium block">
                              Start date cannot be in the past (minimum: {getTodayFormattedDate()})
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-slate-700 font-medium">End date (optional)</label>
                          <input
                            type="date"
                            min={startDate || getTodayFormattedDate()}
                            value={endDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEndDate(val);
                              if (val && startDate && val < startDate) {
                                setFieldErrors(prev => ({ ...prev, endDate: "End date cannot be earlier than start date." }));
                              } else {
                                setFieldErrors(prev => {
                                  const updated = { ...prev };
                                  delete updated.endDate;
                                  return updated;
                                });
                              }
                            }}
                            placeholder="Select end date"
                            className={`w-full border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none font-medium ${
                              endDate && startDate && endDate < startDate || fieldErrors.endDate
                                ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                                : "bg-white border-slate-200 focus:border-primary"
                            }`}
                          />
                          {endDate && startDate && endDate < startDate && (
                            <span className="text-[10px] text-rose-500 font-medium block">
                              End date cannot be earlier than start date ({startDate})
                            </span>
                          )}
                          {!endDate && <p className="text-[10px] text-slate-500">None (Run continuously)</p>}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        For the month, you won't pay more than your daily budget times the average number of days in a month. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                      </p>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("budget")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56 flex items-center gap-1">
                        <span className="font-bold text-slate-800">Budget and dates</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <div className="text-[11px] font-medium">
                        {!demandGenBudgetAmount.trim() || isNaN(Number(demandGenBudgetAmount)) || Number(demandGenBudgetAmount) <= 0 ? (
                          <span className="text-rose-500 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Budget is required (must be &gt; 0)
                          </span>
                        ) : (
                          <span className="text-slate-700">₹{demandGenBudgetAmount} / day • Start: {startDate} • End: {endDate || "None"}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("budget");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 8. Customer acquisition */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg text-xs">
                {openCampaignSetting === "customerAcquisition" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Customer acquisition</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    
                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={onlyNewCustomers}
                        onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">Only bid for new customers</span>
                        <span className="text-[11px] text-slate-500 block">Your campaign will be limited to only new customers, regardless of your bid strategy</span>
                      </div>
                    </label>

                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-200">
                      By default, your campaign bids equally for new and existing customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about customer acquisition</a>
                    </p>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("customerAcquisition")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Customer acquisition</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {onlyNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("customerAcquisition");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 9. Brand guidelines */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "brandGuidelines" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Brand guidelines</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-slate-500">Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more about brand guidelines</a></p>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-700">Custom colors</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Main Color Picker */}
                        <div className="space-y-1.5">
                          <label className="block text-slate-500 font-medium">Main color</label>
                          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2">
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
                              className="w-full bg-transparent text-slate-900 font-mono text-xs focus:outline-none uppercase"
                            />
                          </div>
                        </div>

                        {/* Accent Color Picker */}
                        <div className="space-y-1.5">
                          <label className="block text-slate-500 font-medium">Accent color</label>
                          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-2">
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
                              className="w-full bg-transparent text-slate-900 font-mono text-xs focus:outline-none uppercase"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="block text-slate-500 font-medium">Font</label>
                        <select
                          value={brandFont}
                          onChange={(e) => setBrandFont(e.target.value)}
                          className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
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
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Brand guidelines</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {mainBrandColor || accentBrandColor ? `Main: ${mainBrandColor}, Accent: ${accentBrandColor}` : "No guidelines set"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("brandGuidelines");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 10. EU political ads */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg text-xs">
                {openCampaignSetting === "euPoliticalAds" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">EU political ads</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-700">Does your campaign have European Union political ads?</p>
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
                    <p className="text-[11px] text-slate-500">EU regulation requires Google to ask this question. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn how an EU political ad is defined</a></p>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("euPoliticalAds")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">EU political ads</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {euPoliticalAds === "YES" ? "Yes, EU political ads" : "Doesn't have EU political ads"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("euPoliticalAds");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 11. Location and language */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "locationLang" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Location and language</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-slate-500 leading-relaxed">
                      You can set campaign location and language settings to overwrite ad group settings. The level can't be changed once the campaign is published.
                    </p>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCampaignLocationLang}
                        onChange={(e) => setUseCampaignLocationLang(e.target.checked)}
                        className="rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                      />
                      <span className="font-semibold text-slate-800">Use campaign location and language settings</span>
                    </label>

                    {useCampaignLocationLang && (
                      <div className="space-y-3 pt-2 pl-7 border-l-2 border-slate-200">
                        <p className="font-semibold text-slate-700">For any selected locations, use</p>
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
                              <span className="font-semibold text-slate-800 block">Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)</span>
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
                              <span className="font-semibold text-slate-800 block">Presence: People in or regularly in your included location</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("locationLang")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Location and language</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {useCampaignLocationLang ? "Set at campaign level" : "Set at ad group, include people with presence in locations"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("locationLang");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 12. Devices */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "devices" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Devices</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
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
                        <span className="text-slate-800 font-semibold">Show on all eligible devices (computers, mobile, tablet, and TV screens)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="deviceTarget"
                          checked={deviceTargetingType === "SPECIFIC"}
                          onChange={() => setDeviceTargetingType("SPECIFIC")}
                          className="text-primary h-4 w-4"
                        />
                        <span className="text-slate-800 font-semibold">Set specific targeting for devices</span>
                      </label>
                    </div>

                    <p className="text-slate-500 leading-relaxed">
                      Showing ads on all devices helps expand your reach. To focus your reach on specific devices, set device targeting. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a>
                    </p>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("devices")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Devices</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {deviceTargetingType === "ALL" ? "All eligible devices (computers, mobile, tablet, and TV screens)" : "Set specific targeting for devices"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("devices");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 13. Ad schedule */}
              <div className={`p-5 rounded-2xl border bg-white space-y-4 shadow-lg text-xs ${
                adScheduleStartTime && adScheduleEndTime && !(adScheduleStartTime === "00:00" && adScheduleEndTime === "00:00") && adScheduleEndTime <= adScheduleStartTime || fieldErrors.adSchedule
                  ? "border-rose-400 bg-rose-50/10"
                  : "border-slate-200"
              }`}>
                {openCampaignSetting === "adSchedule" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Ad schedule</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select value={adScheduleDays} onChange={(e) => setAdScheduleDays(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:border-primary">
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

                      <select
                        value={adScheduleStartTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdScheduleStartTime(val);
                          if (val && adScheduleEndTime && !(val === "00:00" && adScheduleEndTime === "00:00") && adScheduleEndTime <= val) {
                            setFieldErrors(prev => ({ ...prev, adSchedule: `End time (${adScheduleEndTime}) must be strictly after start time (${val}).` }));
                          } else {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.adSchedule;
                              return updated;
                            });
                          }
                        }}
                        className={`border rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none ${
                          adScheduleEndTime <= adScheduleStartTime && !(adScheduleStartTime === "00:00" && adScheduleEndTime === "00:00")
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                            : "bg-slate-50 border-slate-200 focus:border-primary"
                        }`}
                      >
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

                      <span className="text-slate-500 font-medium">to</span>

                      <select
                        value={adScheduleEndTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdScheduleEndTime(val);
                          if (adScheduleStartTime && val && !(adScheduleStartTime === "00:00" && val === "00:00") && val <= adScheduleStartTime) {
                            setFieldErrors(prev => ({ ...prev, adSchedule: `End time (${val}) must be strictly after start time (${adScheduleStartTime}).` }));
                          } else {
                            setFieldErrors(prev => {
                              const updated = { ...prev };
                              delete updated.adSchedule;
                              return updated;
                            });
                          }
                        }}
                        className={`border rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none ${
                          adScheduleEndTime <= adScheduleStartTime && !(adScheduleStartTime === "00:00" && adScheduleEndTime === "00:00")
                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                            : "bg-slate-50 border-slate-200 focus:border-primary"
                        }`}
                      >
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

                    {adScheduleEndTime <= adScheduleStartTime && !(adScheduleStartTime === "00:00" && adScheduleEndTime === "00:00") && (
                      <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> End time ({adScheduleEndTime}) must be strictly after start time ({adScheduleStartTime})
                      </span>
                    )}

                    <div className="space-y-1 text-slate-500 text-[11px] leading-relaxed">
                      <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-primary font-semibold hover:underline">Learn more</a></p>
                      <p>Based on account time zone: <strong>(GMT+05:30) India Standard Time</strong></p>
                      <p>To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("adSchedule")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Ad schedule</span>
                      </div>
                      <div className="text-[11px] font-medium">
                        {adScheduleEndTime <= adScheduleStartTime && !(adScheduleStartTime === "00:00" && adScheduleEndTime === "00:00") ? (
                          <span className="text-rose-500 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> End time must be after start time
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {adScheduleDays === "All days" && adScheduleStartTime === "00:00" && adScheduleEndTime === "23:45" ? "All day" : `${adScheduleDays} - ${adScheduleStartTime} to ${adScheduleEndTime}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("adSchedule");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 14. Third-party measurement */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg text-xs">
                {openCampaignSetting === "thirdParty" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Third-party measurement</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <p className="text-slate-500 leading-relaxed">
                      Add vendors to let them see measurement data for this campaign. Only vendors that have already been added to your account can be used for new campaigns.
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      Third-party measurement coverage is limited for Demand Gen campaigns. Contact your vendor for more info.
                    </p>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium">
                      There are no available vendors for this campaign. You can add new vendors in your account settings
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("thirdParty")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Third-party measurement</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        None
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("thirdParty");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 15. Campaign URL options */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "urlOptions" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">Campaign URL options</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Tracking Template</label>
                      <input type="text" value={trackingTemplate} onChange={(e) => setTrackingTemplate(e.target.value)} placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono" />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Final URL suffix</label>
                      <input type="text" value={finalUrlSuffix} onChange={(e) => setFinalUrlSuffix(e.target.value)} placeholder="Example: param1=value1&param2=value2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-slate-700">Custom Parameters</label>
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
                          <span className="font-mono text-slate-500">{`{_`}</span>
                          <input type="text" value={p.name} onChange={(e) => { const u = [...customParametersDemandGen]; u[idx].name = e.target.value; setCustomParametersDemandGen(u); }} placeholder="Name" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900" />
                          <span className="font-mono text-slate-500">{`}`}</span>
                          <span className="font-mono text-slate-500">=</span>
                          <input type="text" value={p.value} onChange={(e) => { const u = [...customParametersDemandGen]; u[idx].value = e.target.value; setCustomParametersDemandGen(u); }} placeholder="Value" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("urlOptions")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Campaign URL options</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {trackingTemplate || finalUrlSuffix || customParametersDemandGen.some(p => p.name || p.value) ? "Custom URL options set" : "No options set"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("urlOptions");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 16. IP exclusions */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg text-xs">
                {openCampaignSetting === "ipExclusions" ? (
                  <>
                    <div 
                      onClick={() => setOpenCampaignSetting(null)}
                      className="border-b border-slate-200 pb-2.5 flex items-center justify-between cursor-pointer select-none"
                    >
                      <h3 className="text-xs font-bold text-slate-800">IP exclusions</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-700">Enter the Internet Protocol (IP) addresses to exclude from seeing your ads</label>
                      <textarea
                        rows={4}
                        value={ipExclusionsInput}
                        onChange={(e) => setIpExclusionsInput(e.target.value)}
                        placeholder="123.4.5.67&#10;123.4.5.*&#10;123.4.0.0/16"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono"
                      />
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500 leading-relaxed font-mono">
                      <p>To indicate a set of addresses, replace the last 3 digits with an asterisk (*)</p>
                      <p>Examples:</p>
                      <p className="text-slate-700">123.4.5.67</p>
                      <p className="text-slate-700">123.4.5.*</p>
                      <p className="text-slate-700">123.4.0.0/16</p>
                      <p className="text-slate-700">2620:0:1003:1011:fa1e:dfff:fee6:2711</p>
                      <p className="text-slate-700">2620:0:1003:1011:fa1e:dfff:0:0/96</p>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenCampaignSetting("ipExclusions")}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">IP exclusions</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ipExclusionsInput ? "Exclusions set" : "No exclusions set"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenCampaignSetting("ipExclusions");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
                          className="px-3 py-1 rounded-lg bg-slate-100 text-primary hover:bg-slate-200 font-semibold cursor-pointer"
                        >
                          Edit Settings
                        </button>
                        {adGroups.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAdGroup(ag.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white cursor-pointer"
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
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{adName || "New Ad"}</h1>

              {/* 1. Ad Type Selector Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg">
                {openAdSetting === "adType" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <h3 className="text-sm font-bold text-slate-900">Choose which type of ad to create</h3>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: "SINGLE_IMAGE", title: "Single image ad", desc: "Show ads with a single image" },
                        { key: "VIDEO", title: "Video ad", desc: "Show ads with a single video" },
                        { key: "CAROUSEL", title: "Carousel image ad", desc: "Show ads with multiple images in a carousel" }
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={() => setDemandGenAdType(item.key as any)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            demandGenAdType === item.key
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-bold block mb-1 text-slate-800">{item.title}</span>
                          <span className="text-[10px] text-slate-500 leading-normal">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdSetting("adType")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Choose which type of ad to create</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {demandGenAdType === "SINGLE_IMAGE" ? "Single image ad" : demandGenAdType === "VIDEO" ? "Video ad" : "Carousel image ad"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdSetting("adType");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Ad Name Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg">
                {openAdSetting === "adName" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <label className="block text-slate-700 font-semibold">Ad name</label>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      maxLength={255}
                      value={adName}
                      onChange={(e) => setAdName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                    />
                    <p className="text-[10px] text-slate-500">Text is {adName.length} characters out of 255</p>
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdSetting("adName")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56">
                        <span className="font-bold text-slate-800">Ad name</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                        {adName}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdSetting("adName");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Final URL Card */}
              <div className={`p-6 rounded-2xl border bg-white space-y-3 shadow-lg ${
                !adFinalUrl || (!adFinalUrl.startsWith("http://") && !adFinalUrl.startsWith("https://")) || fieldErrors.adFinalUrl
                  ? "border-rose-400 bg-rose-50/10"
                  : "border-slate-200"
              }`}>
                {openAdSetting === "finalUrl" ? (
                  <>
                    <div 
                      onClick={() => setOpenAdSetting(null)}
                      className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        <label className="block text-slate-700 font-semibold">Final URL</label>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={adFinalUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdFinalUrl(val);
                        if (!val || (!val.startsWith("http://") && !val.startsWith("https://"))) {
                          setFieldErrors(prev => ({ ...prev, adFinalUrl: "Final URL is required and must begin with http:// or https://" }));
                        } else {
                          setFieldErrors(prev => {
                            const updated = { ...prev };
                            delete updated.adFinalUrl;
                            return updated;
                          });
                        }
                      }}
                      placeholder="https://"
                      className={`w-full border rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none font-mono ${
                        !adFinalUrl || (!adFinalUrl.startsWith("http://") && !adFinalUrl.startsWith("https://")) || fieldErrors.adFinalUrl
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/30 text-rose-900"
                          : "bg-slate-50 border-slate-200 focus:border-primary"
                      }`}
                    />
                    {(!adFinalUrl || (!adFinalUrl.startsWith("http://") && !adFinalUrl.startsWith("https://")) || fieldErrors.adFinalUrl) ? (
                      <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldErrors.adFinalUrl || "Final URL must begin with http:// or https:// (e.g. https://www.example.com)"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 block">Enter a valid final landing page URL</span>
                    )}
                  </>
                ) : (
                  <div 
                    onClick={() => setOpenAdSetting("finalUrl")}
                    className="flex items-center justify-between cursor-pointer select-none text-xs group"
                  >
                    <div className="flex items-center gap-16">
                      <div className="w-56 flex items-center gap-1">
                        <span className="font-bold text-slate-800">Final URL</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <div className="text-[11px] font-mono truncate max-w-[200px]">
                        {!adFinalUrl || (!adFinalUrl.startsWith("http://") && !adFinalUrl.startsWith("https://")) ? (
                          <span className="text-rose-500 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Final URL required
                          </span>
                        ) : (
                          <span className="text-slate-500">{adFinalUrl}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenAdSetting("finalUrl");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Conditional Form Render based on Ad Type */}

              {/* ───────────────── SINGLE IMAGE AD ───────────────── */}
              {demandGenAdType === "SINGLE_IMAGE" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Media */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Media</h4>
                      <button
                        type="button"
                        aria-label="Edit Media"
                        title="Edit Media"
                        onClick={() => document.getElementById("adImageInput")?.focus()}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Images Section */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-700 font-semibold">Images</label>
                          <span className="text-[10px] text-slate-500">Add up to 20 images</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Add at least 1 marketing image in landscape or square format</p>
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
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900 placeholder-slate-400"
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
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 font-bold rounded-xl"
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
                          <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                            <img src={img} alt={`Ad Image ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdImages(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-white hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-white text-[8px] text-center py-0.5 truncate text-slate-700 font-mono">
                              Image {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logos Section */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-700 font-semibold">Logos</label>
                          <span className="text-[10px] text-slate-500">Add up to 5 logos</span>
                        </div>
                        <p className="text-[10px] text-slate-500">At least 1 logo is required</p>
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
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900 placeholder-slate-400"
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
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 font-bold rounded-xl"
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
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                            <img src={lg} alt={`Ad Logo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdLogos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-white hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-white text-[8px] text-center py-0.5 truncate text-slate-700 font-mono">
                              Logo {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Text</h4>
                      <button
                        type="button"
                        aria-label="Edit Text"
                        title="Edit Text"
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Headline</label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
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

                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Description</label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
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
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="block text-slate-700 font-semibold">Call to action text</label>
                      <div className="flex gap-3">
                        <select
                          value={adCallToAction}
                          onChange={(e) => setAdCallToAction(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
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
                        <span className="text-slate-500 self-center">English (United States)</span>
                      </div>
                    </div>

                    {/* Business name */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="block text-slate-700 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                      {!businessName && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Value is required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{businessName.length} / 25 (Text is {businessName.length} characters out of 25)</span>
                    </div>
                  </div>

                  {/* Asset Optimization */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Asset optimization</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Let Google AI use your existing ad content to create optimized assets. This helps improve ad coverage and drive conversions. <a href="#" className="text-blue-400 hover:underline">How it works</a>
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit Asset Optimization"
                        title="Edit Asset Optimization"
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-4"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <span className="font-bold text-slate-700 block text-[11px]">Image</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optAdaptiveLayouts}
                          onChange={(e) => setOptAdaptiveLayouts(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-800">Adaptive layouts (On)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optAnimatedImages}
                          onChange={(e) => setOptAnimatedImages(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-800">Animated images Beta (On)</span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block text-[11px]">Video</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optGeneratedVideos}
                          onChange={(e) => setOptGeneratedVideos(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <div>
                          <span className="text-slate-800 block">Generated videos (On)</span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            Turning on this enhancement will create a new auto-generated video ad. Video assets will update to include the latest assets from this ad.
                          </p>
                        </div>
                      </label>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal pt-2 border-t border-slate-200/40">
                      Ads using image or video assets optimized by these features will be labeled as created or edited with AI when shown in the European Union (EU), India, and New York state, in the US. Text assets on matters of public interest will also be labeled when shown in the EU. <a href="https://support.google.com/google-ads/answer/17140115?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Learn more about AI labeling requirements</a>
                    </p>
                  </div>

                  {/* URL and other options */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div 
                      onClick={() => setShowAdUrlOptions(!showAdUrlOptions)}
                      className="flex items-center justify-between cursor-pointer pb-1 select-none font-bold text-slate-800"
                    >
                      <span className="text-sm">URL and other options</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Edit URL Options"
                          title="Edit URL Options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAdUrlOptions(!showAdUrlOptions);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {showAdUrlOptions ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </div>
                    </div>

                    {showAdUrlOptions && (
                      <div className="space-y-4 pt-3 border-t border-slate-850 animate-in slide-in-from-top-1 duration-150">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                            <label className="block text-slate-500 font-semibold">Mobile final URL</label>
                            <input
                              type="text"
                              value={mobileFinalUrl}
                              onChange={(e) => setMobileFinalUrl(e.target.value)}
                              placeholder="https://"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Tracking Template</label>
                          <input
                            type="url"
                            value={adTrackingTemplate}
                            onChange={(e) => setAdTrackingTemplate(e.target.value)}
                            placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Final URL suffix</label>
                          <input
                            type="text"
                            value={adFinalUrlSuffix}
                            onChange={(e) => setAdFinalUrlSuffix(e.target.value)}
                            placeholder="Example: param1=value1&param2=value2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block font-semibold text-slate-700">Custom Parameters</label>
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
                              <span className="font-mono text-slate-500">{`{_`}</span>
                              <input type="text" value={p.name} onChange={(e) => { const u = [...adCustomParams]; u[idx].name = e.target.value; setAdCustomParams(u); }} placeholder="Name" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none" />
                              <span className="font-mono text-slate-500">{`}`}</span>
                              <span className="font-mono text-slate-500">=</span>
                              <input type="text" value={p.value} onChange={(e) => { const u = [...adCustomParams]; u[idx].value = e.target.value; setAdCustomParams(u); }} placeholder="Value" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none" />
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
              {demandGenAdType === "VIDEO" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Media */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Media</h4>
                      <button
                        type="button"
                        aria-label="Edit Media"
                        title="Edit Media"
                        onClick={() => document.getElementById("adVideoInput")?.focus()}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Videos</label>
                        <span className="text-[10px] text-slate-500">Add up to 5 videos</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Search for a video or paste the URL from YouTube</p>

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
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900 placeholder-slate-400"
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
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 font-bold rounded-xl"
                        >
                          Add
                        </button>
                      </div>

                      {adVideos.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {adVideos.map((vd, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-700">
                            Video {i + 1}
                            <button onClick={() => setAdVideos(p => p.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Logos */}
                    <div className="space-y-2.5 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-700 font-semibold">Logos</label>
                          <span className="text-[10px] text-slate-500">Add up to 5 logos</span>
                        </div>
                        <p className="text-[10px] text-slate-500">At least 1 logo is required</p>
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
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900 placeholder-slate-400"
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
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 font-bold rounded-xl"
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
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                            <img src={lg} alt={`Ad Logo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdLogos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-white hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-white text-[8px] text-center py-0.5 truncate text-slate-700 font-mono">
                              Logo {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Text</h4>
                      <button
                        type="button"
                        aria-label="Edit Text"
                        title="Edit Text"
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Headline */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Headline</label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
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
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Long headline</label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
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
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Description</label>
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
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
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="block text-slate-700 font-semibold">Call to action text</label>
                      <select
                        value={adCallToAction}
                        onChange={(e) => setAdCallToAction(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
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
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="block text-slate-700 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                      {!businessName && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{businessName.length} / 25 (Text is {businessName.length} characters out of 25)</span>
                    </div>
                  </div>

                  {/* Sitelinks */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Sitelinks</h4>
                        <p className="text-[11px] text-slate-500">Add 4 or more to maximize performance</p>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit Sitelinks"
                        title="Edit Sitelinks"
                        onClick={() => document.getElementById("sitelinkInput")?.focus()}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex gap-2 max-w-xl">
                      <input
                        type="text"
                        id="sitelinkInput"
                        placeholder="Add sitelink name"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
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
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-700 text-slate-900 font-bold rounded-xl"
                      >
                        Add Sitelink
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {adSitelinks.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-850 text-slate-700">
                          {s}
                          <button onClick={() => setAdSitelinks(p => p.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Asset Optimization */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Asset optimization</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Let Google AI use your existing ad content to create optimized assets. This helps improve ad coverage and drive conversions. <a href="#" className="text-blue-400 hover:underline">How it works</a>
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit Asset Optimization"
                        title="Edit Asset Optimization"
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-4"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <span className="font-bold text-slate-700 block text-[11px]">Video</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optShorterVideos}
                          onChange={(e) => setOptShorterVideos(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-800">Shorter videos (On)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optResizedVideos}
                          onChange={(e) => setOptResizedVideos(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-800">Resized videos (On)</span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block text-[11px]">Image</span>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={optLandingPagePreviews}
                          onChange={(e) => setOptLandingPagePreviews(e.target.checked)}
                          className="rounded text-primary h-3.5 w-3.5"
                        />
                        <span className="text-slate-800">Landing page previews (On)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── CAROUSEL IMAGE AD ───────────────── */}
              {demandGenAdType === "CAROUSEL" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Media */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Media</h4>
                      <button
                        type="button"
                        aria-label="Edit Media"
                        title="Edit Media"
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Cards</label>
                        <span className="text-[10px] text-slate-500">Add up to 10 cards</span>
                      </div>
                      
                      {carouselCards.length === 0 && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}

                      {carouselCards.map((card, idx) => (
                        <div key={card.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative flex gap-4">
                          {/* Thumbnail preview if exists */}
                          {card.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 self-center bg-white">
                              <img src={card.image} alt={`Card ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700 text-[11px]">Card {idx + 1}</span>
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
                                <label className="block text-[10px] text-slate-500 font-medium">Image URL</label>
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
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
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
                                <label className="block text-[10px] text-slate-500 font-medium">Card Headline</label>
                                <input
                                  type="text"
                                  value={card.headline}
                                  onChange={(e) => {
                                    const u = [...carouselCards];
                                    u[idx].headline = e.target.value;
                                    setCarouselCards(u);
                                  }}
                                  placeholder="Card Headline"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
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
                    <div className="space-y-2.5 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <label className="block text-slate-700 font-semibold">Logos</label>
                          <span className="text-[10px] text-slate-500">Add up to 5 logos</span>
                        </div>
                        <p className="text-[10px] text-slate-500">At least 1 logo is required</p>
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
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900 placeholder-slate-400"
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
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 font-bold rounded-xl"
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
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                            <img src={lg} alt={`Ad Logo ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdLogos(p => p.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-white hover:bg-rose-600 text-white rounded-full p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-0 inset-x-0 bg-white text-[8px] text-center py-0.5 truncate text-slate-700 font-mono">
                              Logo {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Text</h4>
                      <button
                        type="button"
                        aria-label="Edit Text"
                        title="Edit Text"
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Headline */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Headline</label>
                        <span className="text-[10px] text-slate-500">Headline</span>
                      </div>
                      <input
                        type="text"
                        maxLength={40}
                        value={adHeadlines[0] || ""}
                        onChange={(e) => setAdHeadlines([e.target.value])}
                        placeholder="Headline"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                      {!(adHeadlines[0]) && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{(adHeadlines[0] || "").length} / 40 (Text is {(adHeadlines[0] || "").length} characters out of 40)</span>
                    </div>

                    {/* Description */}
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <label className="block text-slate-700 font-semibold">Description</label>
                        <span className="text-[10px] text-slate-500">Description</span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={90}
                        value={adDescriptions[0] || ""}
                        onChange={(e) => setAdDescriptions([e.target.value])}
                        placeholder="Description"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
                      />
                      {!(adDescriptions[0]) && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block text-right font-mono">{(adDescriptions[0] || "").length} / 90 (Text is {(adDescriptions[0] || "").length} characters out of 90)</span>
                    </div>

                    {/* Business Name */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="block text-slate-700 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                      {!businessName && (
                        <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
                      )}
                      <span className="text-[10px] text-slate-500 block font-mono">{businessName.length} / 25 (Text is {businessName.length} characters out of 25)</span>
                    </div>
                  </div>

                  {/* URL and other options */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-lg group">
                    <div 
                      onClick={() => setShowAdUrlOptions(!showAdUrlOptions)}
                      className="flex items-center justify-between cursor-pointer pb-1 select-none font-bold text-slate-800"
                    >
                      <span className="text-sm">URL and other options</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Edit URL Options"
                          title="Edit URL Options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAdUrlOptions(!showAdUrlOptions);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 group-hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {showAdUrlOptions ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </div>
                    </div>

                    {showAdUrlOptions && (
                      <div className="space-y-4 pt-3 border-t border-slate-850 animate-in slide-in-from-top-1 duration-150">
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Tracking Template</label>
                          <input
                            type="url"
                            value={adTrackingTemplate}
                            onChange={(e) => setAdTrackingTemplate(e.target.value)}
                            placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Final URL suffix</label>
                          <input
                            type="text"
                            value={adFinalUrlSuffix}
                            onChange={(e) => setAdFinalUrlSuffix(e.target.value)}
                            placeholder="Example: param1=value1&param2=value2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="block font-semibold text-slate-700">Custom Parameters</label>
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
                              <span className="font-mono text-slate-500">{`{_`}</span>
                              <input type="text" value={p.name} onChange={(e) => { const u = [...adCustomParams]; u[idx].name = e.target.value; setAdCustomParams(u); }} placeholder="Name" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none" />
                              <span className="font-mono text-slate-500">{`}`}</span>
                              <span className="font-mono text-slate-500">=</span>
                              <input type="text" value={p.value} onChange={(e) => { const u = [...adCustomParams]; u[idx].value = e.target.value; setAdCustomParams(u); }} placeholder="Value" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none" />
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review your campaign</h1>
                <p className="text-slate-500 font-semibold text-xs">{demandGenCampaignName}</p>
              </div>

              {/* Dynamic Overall Validation Status Banner */}
              {(() => {
                const validationErrors = getReviewValidationErrors();
                const hasErrors = validationErrors.length > 0;

                if (hasErrors) {
                  return (
                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>Campaign has {validationErrors.length} {validationErrors.length === 1 ? "issue" : "issues"} that must be fixed before publishing</span>
                      </div>
                      <p className="text-slate-600 text-xs">
                        Review the required parameters below and click <strong className="text-rose-500">Fix</strong> to jump directly to the field.
                      </p>
                      <div className="divide-y divide-rose-500/15 pt-1">
                        {validationErrors.map((err) => (
                          <div key={err.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-600">
                                  {err.level}
                                </span>
                                <span className="font-bold text-slate-900 text-xs">{err.parameter}</span>
                              </div>
                              <p className="text-rose-600 text-xs font-medium">{err.message}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFixIssue(err)}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-center transition-all cursor-pointer shadow-sm"
                            >
                              <span>Fix</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-700">Ready to publish</h4>
                        <p className="text-xs text-slate-600">All required campaign settings, ad group parameters, and ad assets are valid.</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Submit Error Banner (Backend Google Ads launch errors) */}
              {submitError && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 flex items-start gap-3 text-xs font-semibold animate-in shake duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <span className="font-bold block">Failed to publish campaign</span>
                    <span className="font-normal block leading-relaxed">{submitError}</span>
                  </div>
                  <button type="button" onClick={() => setSubmitError(null)} className="text-rose-500 hover:text-rose-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Campaign Level Details */}
              {(() => {
                const campErrors = getReviewValidationErrors().filter(e => e.level === "Campaign");
                const hasCampErrors = campErrors.length > 0;

                return (
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{demandGenCampaignName}</h3>
                        {hasCampErrors ? (
                          <div className="flex items-center gap-2 text-[11px] text-rose-500 font-semibold">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>"{demandGenCampaignName}" has errors which will prevent this campaign from being published</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>Campaign settings are valid</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasCampErrors && (
                          <button
                            type="button"
                            onClick={() => handleFixIssue(campErrors[0])}
                            className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all text-xs cursor-pointer"
                          >
                            Fix ({campErrors.length})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowReviewCampaignDetails(!showReviewCampaignDetails)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-primary font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <span>More details</span>
                          {showReviewCampaignDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Daily budget</span>
                        <p className={`font-bold ${!demandGenBudgetAmount || Number(demandGenBudgetAmount) <= 0 ? "text-rose-500" : "text-slate-800"}`}>
                          {demandGenBudgetAmount ? `₹${demandGenBudgetAmount}` : "Not set (Required)"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Start date</span>
                        <p className="text-slate-800 font-bold">{startDate ? new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }) : "Not set"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">End date</span>
                        <p className="text-slate-800 font-bold">{endDate ? new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }) : "No end date"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Bidding strategy</span>
                        <p className="text-slate-800 font-bold">{targetCpaDemandGen ? `Target CPA (₹${targetCpaValue || "0"})` : demandGenGoal === "Clicks" ? "Maximize clicks" : "Maximize conversions"}</p>
                      </div>
                    </div>

                    {showReviewCampaignDetails && (
                      <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-slate-700 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Customer acquisition</span>
                          <span className="font-semibold text-slate-800 text-right">{onlyNewCustomers ? "Optimize for new customers" : "Bid equally for new and existing customers"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Brand guidelines</span>
                          <span className="font-semibold text-slate-800 text-right">No guidelines set</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">EU political ads</span>
                          <span className="font-semibold text-slate-800 text-right">{euPoliticalAds === "YES" ? "Has EU political ads" : "Doesn't have EU political ads"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Location and language</span>
                          <span className="font-semibold text-slate-800 text-right">Set at ad group, include people with presence in locations</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Devices</span>
                          <span className="font-semibold text-slate-800 text-right">{deviceTargetingType === "ALL" ? "All eligible devices (computers, mobile, tablet, and TV screens)" : "Specific device targeting"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Ad schedule</span>
                          <span className="font-semibold text-slate-800 text-right">{adScheduleDays === "All days" && adScheduleStartTime === "00:00" && adScheduleEndTime === "23:45" ? "All day" : `${adScheduleDays} (${adScheduleStartTime} - ${adScheduleEndTime})`}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Campaign URL options</span>
                          <span className="font-semibold text-slate-800 text-right font-mono truncate max-w-[200px]" title={trackingTemplate || "No options set"}>{trackingTemplate ? "Template set" : "No options set"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">IP exclusions</span>
                          <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]" title={ipExclusionsInput || "No exclusions set"}>{ipExclusionsInput ? "IP exclusions active" : "No exclusions set"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Ad Group Level Details */}
              {(() => {
                const agErrors = getReviewValidationErrors().filter(e => e.level === "Ad group");
                const hasAgErrors = agErrors.length > 0;

                return (
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{activeAdGroup.name}</h3>
                        {hasAgErrors ? (
                          <div className="flex items-center gap-2 text-[11px] text-rose-500 font-semibold">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>"{activeAdGroup.name}" has errors which will prevent this campaign from being published</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>Ad group settings are valid</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasAgErrors && (
                          <button
                            type="button"
                            onClick={() => handleFixIssue(agErrors[0])}
                            className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all text-xs cursor-pointer"
                          >
                            Fix ({agErrors.length})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowReviewAdGroupDetails(!showReviewAdGroupDetails)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-primary font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <span>More details</span>
                          {showReviewAdGroupDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Ads</span>
                        <p className="text-slate-800 font-bold">1</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Available impressions</span>
                        <p className="text-slate-800 font-bold">10B+</p>
                      </div>
                    </div>

                    {showReviewAdGroupDetails && (
                      <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-slate-700 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Languages</span>
                          <span className="font-semibold text-slate-800 text-right">{selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "All languages"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Locations</span>
                          <span className="font-semibold text-slate-800 text-right">{selectedLocation === "ALL" ? "All locations" : selectedLocation === "INDIA" ? "India (country)" : customLocationInput || "Custom location"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Channels</span>
                          <span className="font-semibold text-slate-800 text-right">{selectedAdGroupChannels.length === 8 ? "All Google channels" : selectedAdGroupChannels.join(", ")}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Optimized targeting</span>
                          <span className="font-semibold text-slate-800 text-right">{useOptimizedTargeting ? "On" : "Off"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Ad group URL options</span>
                          <span className="font-semibold text-slate-800 text-right font-mono truncate max-w-[200px]" title={agTrackingTemplate || "No options set"}>{agTrackingTemplate ? "Template set" : "No options set"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Ad Level Details */}
              {(() => {
                const adErrors = getReviewValidationErrors().filter(e => e.level === "Ad");
                const hasAdErrors = adErrors.length > 0;

                return (
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{adName || "Ad 1"}</h3>
                        {hasAdErrors ? (
                          <div className="flex items-center gap-2 text-[11px] text-rose-500 font-semibold">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>"{adName || "Ad 1"}" has errors which will prevent this campaign from being published</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>Ad assets and details are valid</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasAdErrors && (
                          <button
                            type="button"
                            onClick={() => handleFixIssue(adErrors[0])}
                            className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all text-xs cursor-pointer"
                          >
                            Fix ({adErrors.length})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowReviewAdDetails(!showReviewAdDetails)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-primary font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <span>More details</span>
                          {showReviewAdDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Ad format</span>
                        <p className="text-slate-800 font-bold">{demandGenAdType === "SINGLE_IMAGE" ? "Single image" : demandGenAdType === "VIDEO" ? "Video" : "Carousel image"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Assets count</span>
                        <p className="text-slate-800 font-bold">{demandGenAdType === "SINGLE_IMAGE" ? `${adImages.length} images, ${adLogos.length} logos` : demandGenAdType === "VIDEO" ? `${adVideos.length} videos, ${adLogos.length} logos` : `${carouselCards.length} cards, ${adLogos.length} logos`}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Business Name</span>
                        <p className={`font-bold ${!businessName.trim() ? "text-rose-500" : "text-slate-800"}`}>{businessName.trim() || "Not set (Required)"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Final URL</span>
                        <p className={`font-bold truncate max-w-[150px] ${!adFinalUrl || adFinalUrl === "https://" ? "text-rose-500" : "text-slate-800"}`} title={adFinalUrl}>{adFinalUrl && adFinalUrl !== "https://" ? adFinalUrl : "Not set (Required)"}</p>
                      </div>
                    </div>

                    {showReviewAdDetails && (
                      <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-slate-700 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Active enhancements</span>
                          <span className="font-semibold text-slate-800 text-right">3 active enhancements</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Call to action</span>
                          <span className="font-semibold text-slate-800 text-right">{adCallToAction}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Headlines</span>
                          <span className="font-semibold text-slate-800 text-right">{adHeadlines.filter(Boolean).join(", ") || "None"}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                          <span className="text-slate-500 font-medium">Descriptions</span>
                          <span className="font-semibold text-slate-800 text-right">{adDescriptions.filter(Boolean).join(", ") || "None"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

        </main>
      </div>

      {/* ── Audience Creation Modal Overlay ── */}
      {isAudienceModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-50/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Header */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsAudienceModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-base font-semibold text-slate-900">New audience</h2>
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
              className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold cursor-pointer"
            >
              Save Audience
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            
            {/* Audience Name */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-sm">
              <label className="block text-slate-700 font-bold text-xs">Audience name</label>
              <input
                type="text"
                required
                value={audienceName}
                onChange={(e) => setAudienceName(e.target.value)}
                placeholder="Enter audience name"
                className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
              />
              <span className="text-[10px] text-rose-400 block font-semibold">Required</span>
            </div>

            {/* Include Group */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
              <span className="font-bold text-slate-800 text-xs block border-b border-slate-200 pb-1.5">Include people who match any of the following</span>
              
              {/* Custom Segments */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">Custom segments</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">People based on their search activity, downloaded apps, or visited sites</span>
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
              <div className="space-y-2.5 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">Your data</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5 font-medium">People who have previously interacted with your business</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("YOUR_DATA_BROWSE")}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-700 border border-slate-300 text-slate-700 font-semibold rounded-xl text-[11px]"
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
              <div className="space-y-2.5 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">Lookalike segment</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5 font-medium">Reach people who are similar to your seed list</span>
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
              <div className="space-y-2.5 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">Interests & detailed demographics</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">People based on their interests, life events, or detailed demographics</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("INTERESTS_BROWSE")}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-700 border border-slate-300 text-slate-700 font-semibold rounded-xl text-[11px]"
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
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
              <span className="font-bold text-slate-800 text-xs block border-b border-slate-200 pb-1.5">Exclude people who match any of the following</span>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-700 block">Exclusions</span>
                    <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">Exclude remarketing lists or lookalike segments from this audience</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("EXCLUSIONS_BROWSE")}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-700 border border-slate-300 text-slate-700 font-semibold rounded-xl text-[11px]"
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
                      <button onClick={() => setExclusionsList(p => p.filter((_, idx) => idx !== i))} className="hover:text-slate-900"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Narrow Demographics Group */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
              <span className="font-bold text-slate-800 text-xs block border-b border-slate-200 pb-1.5">Narrow audience to people who match the following</span>
              
              <div className="space-y-4 text-xs">
                <span className="font-bold text-slate-700 block">Demographics</span>
                
                {/* Gender */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 block font-semibold">Gender</span>
                  <div className="flex gap-4">
                    {["Female", "Male", "Unknown"].map(gen => (
                      <label key={gen} className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                <div className="space-y-1.5 pt-2 border-t border-slate-200/40">
                  <span className="text-[11px] text-slate-500 block font-semibold">Age</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={ageRangeStart}
                      onChange={(e) => setAgeRangeStart(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900"
                    >
                      {["18", "25", "35", "45", "55", "65"].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <span className="text-slate-500">to</span>
                    <select
                      value={ageRangeEnd}
                      onChange={(e) => setAgeRangeEnd(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900"
                    >
                      {["24", "34", "44", "54", "64", "65+"].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <label className="flex items-center gap-2 ml-4 cursor-pointer text-slate-700">
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
                <div className="space-y-4 pt-3 border-t border-slate-200/40">
                  <span className="font-bold text-slate-700 block">Additional demographics</span>
                  
                  {/* Parental Status */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 block font-semibold">Parental status</span>
                    <div className="flex gap-4">
                      {["Parent", "Not a parent", "Unknown"].map(stat => (
                        <label key={stat} className="flex items-center gap-2 cursor-pointer text-slate-700">
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
                    <span className="text-[11px] text-slate-500 block font-semibold">Household income</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
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
            <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">New custom segment</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-700 leading-relaxed">
                  Ads using audience targeting must comply with the <a href="https://support.google.com/adspolicy/answer/143465?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Personalized advertising policy</a>. Sensitive keywords will serve contextually only, or may not serve at all. All campaigns are subject to the Google Ads advertising policies and may not contain any inappropriate content. <a href="https://support.google.com/adspolicy/answer/6015406?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Learn more</a>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-semibold">Segment name</label>
                  <input
                    type="text"
                    value={newCustomSegName}
                    onChange={(e) => setNewCustomSegName(e.target.value)}
                    placeholder="Enter segment name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/40">
                  <span className="font-semibold text-slate-700 block">Include people with following interests or behaviors</span>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="customSegOption"
                        checked={newCustomSegType === "INTERESTS"}
                        onChange={() => setNewCustomSegType("INTERESTS")}
                        className="mt-0.5"
                      />
                      <div>
                        <span>People with any of these interests or purchase intentions</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="customSegOption"
                        checked={newCustomSegType === "SEARCH_TERMS"}
                        onChange={() => setNewCustomSegType("SEARCH_TERMS")}
                        className="mt-0.5"
                      />
                      <div>
                        <span>People who searched for any of these terms on Google</span>
                        <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                          Only on campaigns running on Google properties. On other campaigns, terms will be used as interests or purchase intentions.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-semibold">Add Google search terms</label>
                    <input
                      type="text"
                      value={newCustomSegKeywords}
                      onChange={(e) => setNewCustomSegKeywords(e.target.value)}
                      placeholder="Enter terms or keywords"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-semibold">or people who browse websites similar to</label>
                    <input
                      type="text"
                      value={newCustomSegUrls}
                      onChange={(e) => setNewCustomSegUrls(e.target.value)}
                      placeholder="Add URLs (e.g. example.com)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-semibold">or people who use apps similar to</label>
                    <input
                      type="text"
                      value={newCustomSegApps}
                      onChange={(e) => setNewCustomSegApps(e.target.value)}
                      placeholder="Add apps (e.g. Google Chrome)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-700"
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
            <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Select Your Data</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[
                    "Custom combination",
                    "AdWords optimized list (0)",
                    "Website visitors",
                    "All converters (0)",
                    "Google-engaged audiences - for Account 6587355041"
                  ].map((dataOpt) => (
                    <label key={dataOpt} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700">
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

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="w-full py-2 rounded-xl bg-blue-650 text-slate-900 font-bold hover:bg-blue-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. NEW YOUR DATA CREATOR MENU */}
          {activeAudienceSubTab === "NEW_YOUR_DATA" && (
            <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Available segment types</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
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
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer space-y-0.5 text-left"
                    >
                      <span className="font-bold text-slate-800 block">{type.title}</span>
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
            <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">New lookalike segment</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 leading-normal">
                  Newly created lookalike segments typically take 48 hours to generate and show ads.
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-semibold">Segment name</label>
                  <input
                    type="text"
                    value={newLookalikeName}
                    onChange={(e) => setNewLookalikeName(e.target.value)}
                    placeholder="Enter a lookalike segment name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700 block">Seed list</span>
                  <p className="text-[10px] text-slate-500">Include users who are similar to a list of customers. Up to 10 seed lists can be selected.</p>
                  
                  <div className="flex gap-2">
                    <select
                      value={newLookalikeSeedList}
                      onChange={(e) => setNewLookalikeSeedList(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
                    >
                      <option value="">-- Select seed list --</option>
                      {yourDataList.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="All website visitors">All website visitors</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setActiveAudienceSubTab("NEW_YOUR_DATA")}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 font-bold rounded-xl"
                    >
                      Add your data segments
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    The performance of your lookalike segment depends on the quality of your seed list. The more people you include, and the more those people have in common, the better your campaign will perform.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="block font-semibold text-slate-700">Locations</label>
                  <p className="text-[10px] text-slate-500">Choose which countries you want your lookalike segment to include</p>
                  <input
                    type="text"
                    value={newLookalikeCountry}
                    onChange={(e) => setNewLookalikeCountry(e.target.value)}
                    placeholder="Select a location to include"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="block font-semibold text-slate-700">Segment reach</label>
                  <p className="text-[10px] text-slate-500">Reach people similar to those on your seed list(s)</p>
                  <select
                    value={newLookalikeReach}
                    onChange={(e) => setNewLookalikeReach(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800"
                  >
                    <option value="1%">Narrow (1%) - Most similar</option>
                    <option value="5%">Balanced (5%)</option>
                    <option value="10%">Broad (10%) - Greatest reach</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-700">Cancel</button>
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
            <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Browse Interests & Demographics</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  
                  {/* Affinity Categories */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1 text-[11px]">Affinity (Long-term interests)</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
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
                        <label key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
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
                  <div className="space-y-2 pt-2 border-t border-slate-200/40">
                    <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1 text-[11px]">In-Market (Recent search and purchase intent)</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
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
                        <label key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
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
                  <div className="space-y-2 pt-2 border-t border-slate-200/40">
                    <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1 text-[11px]">Life events</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
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
                        <label key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
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
                  <div className="space-y-2 pt-2 border-t border-slate-200/40">
                    <span className="font-bold text-slate-800 block border-b border-slate-200 pb-1 text-[11px]">Detailed demographics</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      {["Parental Status", "Marital Status", "Education", "Homeownership Status", "Employment"].map((item) => (
                        <label key={item} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
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

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
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
            <div className="fixed inset-0 z-[130] bg-slate-50/95 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Select Exclusions</h3>
                  <button type="button" onClick={() => setActiveAudienceSubTab("NONE")} className="text-slate-500 hover:text-slate-900"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {yourDataList.concat(lookalikeSegmentsList).concat(["Website visitors", "All website converters"]).map((exOpt) => (
                    <label key={exOpt} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-rose-400 font-mono">
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

                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveAudienceSubTab("NONE")}
                    className="w-full py-2 rounded-xl bg-rose-650 text-slate-900 font-bold hover:bg-rose-500"
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
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (demandGenStep === "REVIEW") setDemandGenStep("AD");
            else if (demandGenStep === "AD") setDemandGenStep("AD_GROUP");
            else if (demandGenStep === "AD_GROUP") setDemandGenStep("CAMPAIGN_SETTINGS");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          {demandGenStep === "CAMPAIGN_SETTINGS" ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {demandGenStep === "CAMPAIGN_SETTINGS" && (
            <button
              onClick={() => setDemandGenStep("AD_GROUP")}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Continue to Ad Group
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
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
              disabled={isPublishing}
              onClick={async () => {
                setSubmitError(null);

                // Run complete frontend validation check
                const validationErrors = getReviewValidationErrors();
                if (validationErrors.length > 0) {
                  const firstErr = validationErrors[0];
                  setSubmitError(`${firstErr.parameter}: ${firstErr.message}`);
                  handleFixIssue(firstErr);
                  return;
                }

                // All parameters are valid! Proceed to launch
                setIsPublishing(true);
                try {
                  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                  const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
                  const targetCid = customerId || "6587355041";

                  const validHeadlines = adHeadlines.filter(h => h && h.trim().length > 0);
                  const validDescriptions = adDescriptions.filter(d => d && d.trim().length > 0);

                  const res = await fetch(`${BACKEND}/api/ads/campaign/launch`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orgId,
                      customerId: targetCid,
                      campaignName: demandGenCampaignName.trim(),
                      channelType: "DEMAND_GEN",
                      biddingStrategy: targetCpaDemandGen ? "TARGET_CPA" : demandGenGoal === "Clicks" ? "MAXIMIZE_CLICKS" : "MAXIMIZE_CONVERSIONS",
                      budget: Number(demandGenBudgetAmount),
                      targetCpa: targetCpaDemandGen && targetCpaValue ? Number(targetCpaValue) : undefined,
                      startDate: startDate || getTodayFormattedDate(),
                      endDate: endDate || undefined,
                      finalUrl: adFinalUrl.trim(),
                      businessName: businessName.trim(),
                      headlines: validHeadlines.length > 0 ? validHeadlines : ["Explore Demand Gen"],
                      descriptions: validDescriptions.length > 0 ? validDescriptions : ["Discover great offers today with Demand Gen"],
                      images: demandGenAdType === "SINGLE_IMAGE" ? adImages : demandGenAdType === "VIDEO" ? adVideos : carouselCards.map(c => c.image),
                      logos: adLogos,
                      adFormat: demandGenAdType,
                      adName: adName.trim(),
                      adSchedule: adScheduleStartTime && adScheduleEndTime && !(adScheduleStartTime === "00:00" && adScheduleEndTime === "23:45") ? [{ day: adScheduleDays, start: adScheduleStartTime, end: adScheduleEndTime }] : [],
                      locations: selectedLocation === "ALL" ? ["ALL"] : selectedLocation === "INDIA" ? ["INDIA"] : [customLocationInput],
                      languages: selectedLanguages,
                      channels: selectedAdGroupChannels,
                      optimizedTargeting: useOptimizedTargeting,
                      customerAcquisitionMode: onlyNewCustomers ? "NEW_CUSTOMERS_ONLY" : "ALL_CUSTOMERS",
                      trackingTemplate: trackingTemplate || agTrackingTemplate || adTrackingTemplate || undefined,
                      finalUrlSuffix: finalUrlSuffix || agFinalUrlSuffix || adFinalUrlSuffix || undefined,
                      euPolitical: euPoliticalAds,
                      conversionGoals: []
                    })
                  });

                  if (res.ok) {
                    alert(`Demand Gen campaign "${demandGenCampaignName.trim()}" published successfully!`);
                    router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
                  } else {
                    const errData = await res.json().catch(() => ({}));
                    setSubmitError(errData.message || errData.error || "Failed to publish Demand Gen campaign.");
                  }
                } catch (err: any) {
                  setSubmitError(err?.message || "Backend server unavailable.");
                } finally {
                  setIsPublishing(false);
                }
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md shadow-emerald-400/20 cursor-pointer"
            >
              {isPublishing ? "Publishing..." : "Save & Publish"}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
