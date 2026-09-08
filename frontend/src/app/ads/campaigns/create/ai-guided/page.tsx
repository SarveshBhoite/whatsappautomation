"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Globe,
  Tag,
  DollarSign,
  MapPin,
  FileText,
  Smartphone,
  Video,
  LayoutGrid,
  Zap,
  ShoppingBag,
  Search,
  Edit3,
  RefreshCw,
  Target,
  CheckSquare,
  ArrowLeft,
  Upload,
  Calendar,
  Layers,
  Image as ImageIcon,
  Check,
  MessageSquare,
  SlidersHorizontal,
  Plus,
  Key
} from "lucide-react";

export interface BusinessContext {
  name?: string;
  type?: string;
  description?: string;
  website?: string;
  hasApp?: boolean;
  physicalLocation?: boolean;
  ecommerceFeed?: boolean;
}

export interface CampaignState {
  business?: BusinessContext;
  desiredOutcome?: string;
  objective?: string;
  conversionGoals?: string[];
  campaignType?: "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "VIDEO" | "DEMAND_GEN" | "SHOPPING" | "APP" | "";
  recommendationReason?: string;
  campaignName?: string;
  businessName?: string;
  website?: string;
  dailyBudget?: number | null;
  locations?: string[];
  language?: string;
  startDate?: string;
  endDate?: string;
  biddingStrategy?: string;
  targetCpa?: number | null;
  targetRoas?: number | null;
  maxCpcLimit?: number | string | null;
  targetImpressionSharePercent?: number | string | null;
  impressionShareLocation?: string;
  keywords?: string[];
  headlines?: string[];
  descriptions?: string[];
  longHeadlines?: string[];
  // Search-specific AI Max Settings
  aiMax?: boolean;
  enableAiMax?: boolean;
  textCustomization?: boolean;
  enableTextCustomization?: boolean;
  finalUrlExpansion?: boolean;
  enableFinalUrlExpansion?: boolean;
  brandInclusions?: string[];
  brandExclusions?: string[];
  // Demand Gen specific settings
  adFormat?: "SINGLE_IMAGE" | "VIDEO" | "CAROUSEL";
  channelTargeting?: "ALL" | "CHOOSE";
  channels?: string[];
  carouselCards?: Array<{ id: string; image: string; headline: string; finalUrl: string }>;
  callToAction?: string;
  images?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  logos?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string }>;
  videos?: Array<string | { url?: string; data?: string; name?: string }>;
  appId?: string;
  appName?: string;
  platform?: "ANDROID" | "IOS";
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  // Shopping specific settings
  merchantCenterId?: string;
  merchantId?: string;
  salesCountry?: string;
  feedLabel?: string;
  budgetType?: string;
  adGroupName?: string;
  adGroupBid?: number | string | null;
  customerAcquisitionMode?: string;
  campaignPriority?: string;
  localProducts?: boolean;
  enableLocalProducts?: boolean;
  productGroupFilter?: string;
  productGroupSelectBy?: string;
  productGroupCustomLabel?: string;
  trackingTemplate?: string;
  euPolitical?: "YES" | "NO";
  // Extension Assets
  promotions?: Array<{
    promotionTarget: string;
    finalUrl: string;
    occasion?: string;
    percentOff?: number;
    moneyAmountOff?: number;
    currencyCode?: string;
    languageCode?: string;
    promotionCode?: string;
  }>;
  prices?: Array<{
    header: string;
    description?: string;
    amount?: number;
    amountMicros?: string;
    currencyCode?: string;
    unit?: string;
    finalUrl?: string;
  }>;
  leadForms?: Array<{
    businessName: string;
    headline: string;
    description: string;
    privacyPolicyUrl: string;
    callToActionType?: string;
    callToActionDescription?: string;
    postSubmitHeadline?: string;
    postSubmitDescription?: string;
  }>;
  readyForReview?: boolean;
  readyForPublish?: boolean;
  stage?: string;
}

// ── MANUAL CREATION SOURCE OF TRUTH DATA & COMPATIBILITY HELPERS ──
export interface ObjectiveDefinition {
  id: string;
  title: string;
  desc: string;
  badge?: string;
}

export const MANUAL_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: "SALES",
    title: "Sales",
    desc: "Drive sales online, in app, by phone, or in store",
  },
  {
    id: "LEADS",
    title: "Leads",
    desc: "Get leads and other conversions by encouraging customers to take action",
  },
  {
    id: "WEBSITE_TRAFFIC",
    title: "Website traffic",
    desc: "Get the right people to visit your website",
  },
  {
    id: "APP_PROMOTION",
    title: "App promotion",
    desc: "Get more installs, engagement and pre-registration for your app",
  },
  {
    id: "AWARENESS",
    title: "YouTube reach, views, and engagements",
    desc: "Drive awareness and consideration of your product or brand",
    badge: 'Previously known as "Awareness and consideration"',
  },
  {
    id: "LOCAL",
    title: "Local store visits and promotions",
    desc: "Drive visits to local stores, including restaurants and dealerships.",
  },
  {
    id: "NO_GUIDANCE",
    title: "Create a campaign without guidance",
    desc: "You'll choose a campaign next",
  },
];

export interface GoalDefinition {
  id: string;
  name: string;
  source?: string;
}

// Exactly the 7 allowed conversion goal combinations for Sales, Leads, and Website Traffic
export const SALES_LEADS_TRAFFIC_GOALS: GoalDefinition[] = [
  { id: "phone_leads", name: "Phone call leads" },
  { id: "contacts", name: "Contacts" },
  { id: "get_directions", name: "Get directions" },
  { id: "phone_leads,contacts", name: "Phone call leads + Contacts" },
  { id: "contacts,get_directions", name: "Contacts + Get directions" },
  { id: "phone_leads,get_directions", name: "Phone call leads + Get directions" },
  { id: "phone_leads,contacts,get_directions", name: "Phone call leads + Contacts + Get directions" }
];

export const APP_PROMOTION_SUBTYPES: GoalDefinition[] = [
  { id: "installs", name: "App installs", source: "Get new people to install your app" },
  { id: "engagement", name: "App engagement", source: "Get existing users to take actions in your app" },
  { id: "preregistration", name: "App pre-registration (Android only)", source: "Get new users to pre-register before launch" }
];

export const AWARENESS_SUBTYPES: GoalDefinition[] = [
  { id: "views", name: "Video views", source: "Get people to watch your video ads" },
  { id: "reach", name: "Reach", source: "Reach the maximum number of people" },
  { id: "subscriptions", name: "YouTube subscriptions & engagements", source: "Get people to subscribe and engage" }
];

export const NO_GUIDANCE_DEMAND_GEN_GOALS: GoalDefinition[] = [
  { id: "phone_leads", name: "Phone call leads" }
];

export const NO_GUIDANCE_SHOPPING_GOALS: GoalDefinition[] = [
  { id: "phone_leads", name: "Phone call leads" },
  { id: "get_directions", name: "Get directions" },
  { id: "phone_leads,get_directions", name: "Phone call leads + Get directions" }
];

// Standard Google Ads Languages Constants
export const GOOGLE_ADS_LANGUAGES: Array<{ id: string; name: string; code: string }> = [
  { id: "1000", name: "English", code: "en" },
  { id: "1023", name: "Hindi", code: "hi" },
  { id: "1056", name: "Bengali", code: "bn" },
  { id: "1101", name: "Marathi", code: "mr" },
  { id: "1131", name: "Telugu", code: "te" },
  { id: "1130", name: "Tamil", code: "ta" },
  { id: "1072", name: "Gujarati", code: "gu" },
  { id: "1041", name: "Urdu", code: "ur" },
  { id: "1086", name: "Kannada", code: "kn" },
  { id: "1098", name: "Malayalam", code: "ml" },
  { id: "1110", name: "Punjabi", code: "pa" },
  { id: "1003", name: "Spanish", code: "es" },
  { id: "1002", name: "French", code: "fr" },
  { id: "1001", name: "German", code: "de" },
  { id: "1004", name: "Italian", code: "it" },
  { id: "1014", name: "Portuguese", code: "pt" },
  { id: "1010", name: "Dutch", code: "nl" },
  { id: "1031", name: "Russian", code: "ru" },
  { id: "1005", name: "Japanese", code: "ja" },
  { id: "1017", name: "Chinese (simplified)", code: "zh_CN" },
  { id: "1018", name: "Chinese (traditional)", code: "zh_TW" },
  { id: "1012", name: "Korean", code: "ko" },
  { id: "1019", name: "Arabic", code: "ar" }
];

// Default suggestions for location search fallback matching Google Ads standard targets
export const GOOGLE_ADS_LOCATION_PRESETS = [
  { id: "1007788", name: "Mumbai, Maharashtra, India", canonicalName: "Mumbai, Maharashtra, India", targetType: "City" },
  { id: "9061643", name: "Delhi, India", canonicalName: "Delhi, India", targetType: "Union territory" },
  { id: "1007768", name: "Bengaluru, Karnataka, India", canonicalName: "Bengaluru, Karnataka, India", targetType: "City" },
  { id: "1007775", name: "Hyderabad, Telangana, India", canonicalName: "Hyderabad, Telangana, India", targetType: "City" },
  { id: "1007801", name: "Pune, Maharashtra, India", canonicalName: "Pune, Maharashtra, India", targetType: "City" },
  { id: "1007743", name: "Ahmedabad, Gujarat, India", canonicalName: "Ahmedabad, Gujarat, India", targetType: "City" },
  { id: "1007753", name: "Chennai, Tamil Nadu, India", canonicalName: "Chennai, Tamil Nadu, India", targetType: "City" },
  { id: "1007776", name: "Kolkata, West Bengal, India", canonicalName: "Kolkata, West Bengal, India", targetType: "City" },
  { id: "2840", name: "United States", canonicalName: "United States", targetType: "Country" },
  { id: "2826", name: "United Kingdom", canonicalName: "United Kingdom", targetType: "Country" },
  { id: "2036", name: "Australia", canonicalName: "Australia", targetType: "Country" },
  { id: "2124", name: "Canada", canonicalName: "Canada", targetType: "Country" },
  { id: "2784", name: "United Arab Emirates", canonicalName: "United Arab Emirates", targetType: "Country" },
  { id: "2702", name: "Singapore", canonicalName: "Singapore", targetType: "Country" }
];

export interface CampaignTypeDefinition {
  id: string;
  title: string;
  desc: string;
}

/**
 * Authoritative Campaign Type Resolver matching exact CRM flow rules
 */
export const getAvailableCampaignTypes = (
  objective?: string,
  conversionGoals?: string[]
): CampaignTypeDefinition[] => {
  const obj = objective || "";
  const rawGoal = (conversionGoals && conversionGoals.length > 0) ? conversionGoals.join(",") : "";
  const hasContacts = rawGoal.includes("contacts");
  const hasDirections = rawGoal.includes("get_directions");

  if (obj === "APP_PROMOTION") {
    return [
      {
        id: "APP",
        title: "App",
        desc: "Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads"
      }
    ];
  }

  if (obj === "LOCAL") {
    return [
      {
        id: "PERFORMANCE_MAX",
        title: "Performance Max",
        desc: "Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more"
      }
    ];
  }

  if (obj === "AWARENESS") {
    const videoGoal = conversionGoals?.[0] || "views";
    if (videoGoal === "views") {
      return [
        {
          id: "VIDEO",
          title: "Video",
          desc: "Reach viewers on YouTube and get conversions"
        }
      ];
    }
    if (videoGoal === "reach") {
      return [
        {
          id: "VIDEO",
          title: "Video",
          desc: "Reach viewers on YouTube and get conversions"
        },
        {
          id: "DISPLAY",
          title: "Display",
          desc: "Reach potential customers across 3 million sites and apps with your creative"
        }
      ];
    }
    if (videoGoal === "subscriptions") {
      return [
        {
          id: "DEMAND_GEN",
          title: "Demand Gen",
          desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads"
        }
      ];
    }
    return [
      {
        id: "VIDEO",
        title: "Video",
        desc: "Reach viewers on YouTube and get conversions"
      }
    ];
  }

  if (obj === "NO_GUIDANCE") {
    return [
      {
        id: "PERFORMANCE_MAX",
        title: "Performance Max",
        desc: "Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more"
      },
      {
        id: "SEARCH",
        title: "Search",
        desc: "Drive action on Google Search with text ads"
      },
      {
        id: "DISPLAY",
        title: "Display",
        desc: "Reach potential customers across 3 million sites and apps with your creative"
      },
      {
        id: "DEMAND_GEN",
        title: "Demand Gen",
        desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads"
      },
      {
        id: "SHOPPING",
        title: "Shopping",
        desc: "Promote your products from Merchant Center on Google Search with Shopping ads"
      }
    ];
  }

  if (obj === "WEBSITE_TRAFFIC") {
    return [
      {
        id: "SEARCH",
        title: "Search",
        desc: "Get website traffic with text ads"
      },
      {
        id: "PERFORMANCE_MAX",
        title: "Performance Max",
        desc: "Get website traffic by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more"
      },
      {
        id: "DEMAND_GEN",
        title: "Demand Gen",
        desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads"
      },
      {
        id: "DISPLAY",
        title: "Display",
        desc: "Reach potential customers across 3 million sites and apps with your creative"
      },
      {
        id: "SHOPPING",
        title: "Shopping",
        desc: "Promote your products from Merchant Center on Google Search with Shopping ads"
      },
      {
        id: "VIDEO",
        title: "Video",
        desc: "Reach and engage viewers on YouTube and across the web"
      }
    ];
  }

  // SALES or LEADS (Default base list)
  const isLeads = obj === "LEADS";
  const verb = isLeads ? "Generate leads" : "Drive sales";

  const allSalesOrLeadsTypes: CampaignTypeDefinition[] = [
    {
      id: "PERFORMANCE_MAX",
      title: "Performance Max",
      desc: `${verb} by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more`
    },
    {
      id: "SEARCH",
      title: "Search",
      desc: `${verb} on Google Search with text ads`
    },
    {
      id: "DEMAND_GEN",
      title: "Demand Gen",
      desc: `Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads`
    },
    {
      id: "VIDEO",
      title: "Video",
      desc: `${verb} on YouTube with your video ads`
    },
    {
      id: "DISPLAY",
      title: "Display",
      desc: `Reach potential customers across 3 million sites and apps with your creative`
    },
    {
      id: "SHOPPING",
      title: "Shopping",
      desc: `Promote your products from Merchant Center on Google Search with Shopping ads`
    }
  ];

  // Manual Flow Goal Dependencies for SALES / LEADS:
  if (hasContacts) {
    // If Contacts goal is present: ONLY Performance Max
    return allSalesOrLeadsTypes.filter(ct => ct.id === "PERFORMANCE_MAX");
  } else if (hasDirections && !hasContacts) {
    // If Get directions is present (without Contacts): Performance Max, Search, Shopping
    return allSalesOrLeadsTypes.filter(ct => ["PERFORMANCE_MAX", "SEARCH", "SHOPPING"].includes(ct.id));
  } else {
    // Default / Phone call leads: All 6 campaign types available
    return allSalesOrLeadsTypes;
  }
};

/**
 * Validates and reconciles CampaignState to enforce 100% parity with CRM flow
 */
export const reconcileCampaignStateWithManualFlow = (
  state: CampaignState,
  changedField?: "objective" | "conversionGoal" | "campaignType"
): CampaignState => {
  const updated = { ...state };
  const obj = updated.objective || "";

  if (obj === "SALES" || obj === "LEADS" || obj === "WEBSITE_TRAFFIC") {
    const rawGoal = (updated.conversionGoals && updated.conversionGoals.length > 0)
      ? updated.conversionGoals.join(",")
      : "phone_leads";
    const isValid = SALES_LEADS_TRAFFIC_GOALS.some(g => g.id === rawGoal);
    const resolvedGoal = isValid ? rawGoal : "phone_leads";
    updated.conversionGoals = resolvedGoal.split(",");

    const availableTypes = getAvailableCampaignTypes(obj, updated.conversionGoals);
    const isTypeValid = availableTypes.some(t => t.id === updated.campaignType);
    if (!isTypeValid) {
      updated.campaignType = (availableTypes[0]?.id || "PERFORMANCE_MAX") as any;
    }
  } else if (obj === "APP_PROMOTION") {
    const rawSubtype = updated.conversionGoals?.[0] || "installs";
    const isValid = APP_PROMOTION_SUBTYPES.some(s => s.id === rawSubtype);
    updated.conversionGoals = [isValid ? rawSubtype : "installs"];
    updated.campaignType = "APP";
  } else if (obj === "AWARENESS") {
    const rawSubtype = updated.conversionGoals?.[0] || "views";
    const isValid = AWARENESS_SUBTYPES.some(s => s.id === rawSubtype);
    const resolvedSubtype = isValid ? rawSubtype : "views";
    updated.conversionGoals = [resolvedSubtype];
    const availableTypes = getAvailableCampaignTypes(obj, updated.conversionGoals);
    const isTypeValid = availableTypes.some(t => t.id === updated.campaignType);
    if (!isTypeValid) {
      updated.campaignType = (availableTypes[0]?.id || "VIDEO") as any;
    }
  } else if (obj === "LOCAL") {
    updated.conversionGoals = [];
    updated.campaignType = "PERFORMANCE_MAX";
  } else if (obj === "NO_GUIDANCE") {
    const availableTypes = ["PERFORMANCE_MAX", "SEARCH", "DISPLAY", "DEMAND_GEN", "SHOPPING"];
    if (!updated.campaignType || !availableTypes.includes(updated.campaignType)) {
      updated.campaignType = "PERFORMANCE_MAX";
    }
    if (updated.campaignType === "DEMAND_GEN") {
      updated.conversionGoals = ["phone_leads"];
    } else if (updated.campaignType === "SHOPPING") {
      const rawGoal = (updated.conversionGoals && updated.conversionGoals.length > 0)
        ? updated.conversionGoals.join(",")
        : "phone_leads";
      const isValid = NO_GUIDANCE_SHOPPING_GOALS.some(g => g.id === rawGoal);
      updated.conversionGoals = (isValid ? rawGoal : "phone_leads").split(",");
    } else {
      updated.conversionGoals = [];
    }
  }

  return updated;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  campaignState?: CampaignState;
  readyForReview?: boolean;
  readyForPublish?: boolean;
  timestamp: string;
}

export default function AiGuidedCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";

  const todayIso = new Date().toISOString().split("T")[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Mobile View Tab Selection ('chat' | 'cockpit')
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "cockpit">("chat");

  const [campaignState, setCampaignState] = useState<CampaignState>({
    business: {},
    desiredOutcome: "",
    campaignType: "",
    objective: "",
    conversionGoals: [],
    campaignName: "",
    businessName: "",
    website: "",
    dailyBudget: null,
    locations: ["India"],
    language: "English",
    startDate: todayIso,
    endDate: undefined,
    keywords: [],
    headlines: [],
    descriptions: [],
    images: [],
    logos: [],
    videos: [],
    readyForReview: false,
    readyForPublish: false,
    stage: "collecting_business"
  });

  // Cockpit Inline Edit State & Live Validation
  const [isEditingCockpit, setIsEditingCockpit] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isCustomCampaignName, setIsCustomCampaignName] = useState<boolean>(false);
  
  // Location selection mode and search in Cockpit ("ALL" | "INDIA" | "CUSTOM")
  const [locationMode, setLocationMode] = useState<"ALL" | "INDIA" | "CUSTOM">("INDIA");
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>("");
  const [locationSearchResults, setLocationSearchResults] = useState<Array<{ id?: string; name: string; canonicalName: string; targetType?: string }>>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [selectedLocationsList, setSelectedLocationsList] = useState<string[]>(["India"]);

  // Language multi-selection in Cockpit
  const [selectedLanguagesList, setSelectedLanguagesList] = useState<string[]>(["English"]);
  const [languageSearchQuery, setLanguageSearchQuery] = useState<string>("");

  // Search Keywords input state in Cockpit
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");

  const [tempEditValues, setTempEditValues] = useState<{
    businessName?: string;
    campaignName?: string;
    objective?: string;
    conversionGoal?: string;
    campaignType?: string;
    website?: string;
    dailyBudget?: string | number;
    biddingStrategy?: string;
    targetCpa?: string | number;
    targetRoas?: string | number;
    maxCpcLimit?: string | number;
    targetImpressionSharePercent?: string | number;
    impressionShareLocation?: string;
    locations?: string;
    language?: string;
    startDate?: string;
    endDate?: string;
    aiMax?: boolean;
    textCustomization?: boolean;
    finalUrlExpansion?: boolean;
    merchantCenterId?: string;
    salesCountry?: string;
    feedLabel?: string;
    adGroupName?: string;
    adGroupBid?: string | number;
    campaignPriority?: string;
    localProducts?: boolean;
    appId?: string;
    appName?: string;
    platform?: string;
  }>({});

  // Live Location Search Effect for Cockpit
  useEffect(() => {
    if (editingField === "locations" && locationMode === "CUSTOM" && locationSearchQuery.trim().length >= 2) {
      setIsSearchingLocation(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${BACKEND}/api/ads/geo-targets/search?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}&q=${encodeURIComponent(locationSearchQuery.trim())}`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.results || data.data || []);
            const formatted = list.map((item: any) => ({
              id: item.id || item.geoTargetConstant?.id || item.resourceName?.split("/").pop(),
              name: item.name || item.geoTargetConstant?.name || item.canonicalName || item.geoTargetConstant?.canonicalName,
              canonicalName: item.canonicalName || item.geoTargetConstant?.canonicalName || item.name,
              targetType: item.targetType || item.geoTargetConstant?.targetType || "Location"
            }));
            if (formatted.length > 0) {
              setLocationSearchResults(formatted);
            } else {
              const localFallback = GOOGLE_ADS_LOCATION_PRESETS
                .filter(loc => loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) || loc.canonicalName.toLowerCase().includes(locationSearchQuery.toLowerCase()));
              setLocationSearchResults(localFallback);
            }
          } else {
            const localFallback = GOOGLE_ADS_LOCATION_PRESETS
              .filter(loc => loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) || loc.canonicalName.toLowerCase().includes(locationSearchQuery.toLowerCase()));
            setLocationSearchResults(localFallback);
          }
        } catch (err) {
          console.error("Cockpit location search error:", err);
          const localFallback = GOOGLE_ADS_LOCATION_PRESETS
            .filter(loc => loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) || loc.canonicalName.toLowerCase().includes(locationSearchQuery.toLowerCase()));
          setLocationSearchResults(localFallback);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else if (editingField === "locations" && locationMode === "CUSTOM" && locationSearchQuery.trim().length === 0) {
      setLocationSearchResults(GOOGLE_ADS_LOCATION_PRESETS.slice(0, 6));
    }
  }, [editingField, locationMode, locationSearchQuery, customerId]);

  // Real-time URL Validator
  const validateWebsiteUrl = (val?: string): string | null => {
    if (!val || !val.trim()) {
      return "Website URL is required.";
    }
    const trimmed = val.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "Invalid website URL. Please enter a valid URL starting with http:// or https://.";
    }
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || !parsed.hostname.includes(".")) {
        return "Invalid website URL. Please enter a valid URL starting with http:// or https://.";
      }
    } catch {
      return "Invalid website URL. Please enter a valid URL starting with http:// or https://.";
    }
    return null;
  };

  // Real-time Budget Validator
  const validateDailyBudget = (val?: string | number, targetCampaignType?: string): string | null => {
    if (val === undefined || val === null || String(val).trim() === "") {
      return "Daily budget is required.";
    }
    const str = String(val).trim();
    const num = Number(str);
    if (isNaN(num)) {
      return "Please enter a valid numeric budget.";
    }
    if (num < 0) {
      return "Daily budget cannot be negative.";
    }
    if (num === 0) {
      return "Daily budget must be greater than 0.";
    }
    const effectiveType = targetCampaignType || campaignState.campaignType;
    if (effectiveType === "DEMAND_GEN" && num < 416) {
      return "Demand Gen daily budget must be at least ₹416/day.";
    }
    return null;
  };

  // Real-time Start Date Validator
  const validateStartDate = (startVal?: string): string | null => {
    if (!startVal) {
      return "Start date is required.";
    }
    if (startVal < todayIso) {
      return "Start date cannot be in the past.";
    }
    return null;
  };

  // Real-time End Date Validator
  const validateEndDate = (endVal?: string, startVal?: string): string | null => {
    if (!endVal) return null; // End date is optional
    const effectiveStart = startVal || todayIso;
    if (endVal < effectiveStart) {
      return "End date must be on or after start date.";
    }
    return null;
  };

  // Helper to format campaign type human-friendly name (e.g. PERFORMANCE_MAX -> Performance Max, SEARCH -> Search)
  const formatCampaignTypeDisplay = (type?: string) => {
    if (!type) return "";
    const map: Record<string, string> = {
      PERFORMANCE_MAX: "Performance Max",
      SEARCH: "Search",
      DISPLAY: "Display",
      VIDEO: "Video",
      DEMAND_GEN: "Demand Gen",
      SHOPPING: "Shopping",
      APP: "App"
    };
    return map[type] || type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  };

  // Helper to format conversion goal display matching the 7 exact composite goals
  const formatGoalName = (conversionGoals?: string[]) => {
    if (!conversionGoals || conversionGoals.length === 0) return "Not set";
    const key = conversionGoals.join(",");
    const match = SALES_LEADS_TRAFFIC_GOALS.find(g => g.id === key) 
      || NO_GUIDANCE_SHOPPING_GOALS.find(g => g.id === key)
      || NO_GUIDANCE_DEMAND_GEN_GOALS.find(g => g.id === key);
    if (match) return match.name;
    // Fallback display
    return conversionGoals.map(g => {
      if (g === "phone_leads") return "Phone call leads";
      if (g === "contacts") return "Contacts";
      if (g === "get_directions") return "Get directions";
      return g;
    }).join(" + ");
  };

  // Helper to format subtype display for App Promotion and Awareness
  const formatSubtypeName = (objective?: string, conversionGoals?: string[]) => {
    const raw = conversionGoals?.[0] || "";
    if (!raw) return "Not set";
    if (objective === "APP_PROMOTION") {
      const match = APP_PROMOTION_SUBTYPES.find(s => s.id === raw);
      return match ? match.name : raw;
    }
    if (objective === "AWARENESS") {
      const match = AWARENESS_SUBTYPES.find(s => s.id === raw);
      return match ? match.name : raw;
    }
    return raw;
  };

  // Helper to generate canonical campaign name based on business name and optional confirmed campaign type
  const generateCampaignName = (businessName?: string, campaignType?: string) => {
    if (!businessName || !businessName.trim()) return "";
    const cleanBiz = businessName.trim().replace(/\s+/g, "_");
    if (campaignType) {
      const typeDisplay = formatCampaignTypeDisplay(campaignType);
      return `${cleanBiz} - ${typeDisplay}`;
    }
    return cleanBiz;
  };

  const startFieldEdit = (field: string) => {
    setIsEditingCockpit(true);
    setEditingField(field);
    setFieldError(null);

    const activeObj = campaignState.objective || "";
    const rawGoal = (campaignState.conversionGoals && campaignState.conversionGoals.length > 0)
      ? campaignState.conversionGoals.join(",")
      : (activeObj === "APP_PROMOTION" ? "installs" : activeObj === "AWARENESS" ? "views" : "phone_leads");
    const availableTypes = getAvailableCampaignTypes(activeObj, campaignState.conversionGoals);

    // Initialize locations mode and custom locations list
    const currentLocs = campaignState.locations && campaignState.locations.length > 0 ? campaignState.locations : ["India"];
    if (currentLocs.length === 1 && currentLocs[0] === "All countries and territories") {
      setLocationMode("ALL");
      setSelectedLocationsList(["All countries and territories"]);
    } else if (currentLocs.length === 1 && currentLocs[0] === "India") {
      setLocationMode("INDIA");
      setSelectedLocationsList(["India"]);
    } else {
      setLocationMode("CUSTOM");
      setSelectedLocationsList(currentLocs);
    }
    setLocationSearchQuery("");
    setLocationSearchResults(GOOGLE_ADS_LOCATION_PRESETS.slice(0, 6));

    // Initialize languages list
    let currentLangs: string[] = ["English"];
    if (campaignState.language) {
      currentLangs = campaignState.language
        .split(",")
        .map(l => l.trim())
        .filter(Boolean);
      if (currentLangs.length === 0) currentLangs = ["English"];
    }
    setSelectedLanguagesList(currentLangs);
    setLanguageSearchQuery("");

    setTempEditValues({
      businessName: campaignState.businessName || campaignState.business?.name || "",
      campaignName: campaignState.campaignName || "",
      objective: activeObj,
      conversionGoal: rawGoal,
      campaignType: campaignState.campaignType || availableTypes[0]?.id || "",
      website: campaignState.website || "",
      dailyBudget: campaignState.dailyBudget !== null && campaignState.dailyBudget !== undefined ? campaignState.dailyBudget : "",
      biddingStrategy: campaignState.biddingStrategy || "Maximize conversions",
      targetCpa: campaignState.targetCpa !== null && campaignState.targetCpa !== undefined ? campaignState.targetCpa : "",
      targetRoas: campaignState.targetRoas !== null && campaignState.targetRoas !== undefined ? campaignState.targetRoas : "",
      maxCpcLimit: campaignState.maxCpcLimit !== null && campaignState.maxCpcLimit !== undefined ? campaignState.maxCpcLimit : "",
      targetImpressionSharePercent: campaignState.targetImpressionSharePercent !== null && campaignState.targetImpressionSharePercent !== undefined ? campaignState.targetImpressionSharePercent : "50",
      impressionShareLocation: campaignState.impressionShareLocation || "Anywhere on results page",
      locations: currentLocs.join(", "),
      language: campaignState.language || "English",
      startDate: campaignState.startDate || todayIso,
      endDate: campaignState.endDate || "",
      merchantCenterId: campaignState.merchantCenterId || "",
      salesCountry: campaignState.salesCountry || "IN",
      feedLabel: campaignState.feedLabel || "IN",
      adGroupName: campaignState.adGroupName || "Ad group 1",
      campaignPriority: campaignState.campaignPriority || "LOW",
      localProducts: Boolean(campaignState.localProducts),
      appId: campaignState.appId || "",
      appName: campaignState.appName || "",
      platform: campaignState.platform || (campaignState.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID")
    });
  };

  const saveFieldEdit = () => {
    // 1. Strict Validation per active field before touching campaignState
    if (editingField === "website") {
      const err = validateWebsiteUrl(tempEditValues.website);
      if (err) {
        setFieldError(err);
        return;
      }
    } else if (editingField === "dailyBudget") {
      const err = validateDailyBudget(tempEditValues.dailyBudget, tempEditValues.campaignType || campaignState.campaignType);
      if (err) {
        setFieldError(err);
        return;
      }
    } else if (editingField === "biddingStrategy") {
      if (tempEditValues.biddingStrategy === "Target CPA") {
        const cpaNum = Number(tempEditValues.targetCpa);
        if (!tempEditValues.targetCpa || isNaN(cpaNum) || cpaNum <= 0) {
          setFieldError("Please enter a valid Target CPA greater than ₹0.");
          return;
        }
      } else if (tempEditValues.biddingStrategy === "Target ROAS") {
        const roasNum = Number(tempEditValues.targetRoas);
        if (!tempEditValues.targetRoas || isNaN(roasNum) || roasNum <= 0) {
          setFieldError("Please enter a valid Target ROAS % greater than 0.");
          return;
        }
      } else if (tempEditValues.biddingStrategy === "Clicks" || tempEditValues.biddingStrategy === "Maximize Clicks") {
        if (tempEditValues.maxCpcLimit) {
          const cpcNum = Number(tempEditValues.maxCpcLimit);
          if (isNaN(cpcNum) || cpcNum <= 0) {
            setFieldError("Maximum CPC bid limit must be greater than ₹0.");
            return;
          }
        }
      } else if (tempEditValues.biddingStrategy === "Target Impression Share" || tempEditValues.biddingStrategy === "Impression share") {
        const impShareNum = Number(tempEditValues.targetImpressionSharePercent);
        if (isNaN(impShareNum) || impShareNum < 1 || impShareNum > 100) {
          setFieldError("Target impression share % must be between 1% and 100%.");
          return;
        }
      }
    } else if (editingField === "startDate") {
      const err = validateStartDate(tempEditValues.startDate);
      if (err) {
        setFieldError(err);
        return;
      }
      if (tempEditValues.endDate) {
        const endErr = validateEndDate(tempEditValues.endDate, tempEditValues.startDate);
        if (endErr) {
          setFieldError(endErr);
          return;
        }
      }
    } else if (editingField === "endDate") {
      const effectiveStart = tempEditValues.startDate || campaignState.startDate || todayIso;
      const err = validateEndDate(tempEditValues.endDate, effectiveStart);
      if (err) {
        setFieldError(err);
        return;
      }
    } else if (editingField === "locations") {
      if (locationMode === "CUSTOM" && selectedLocationsList.length === 0) {
        setFieldError("Please select at least one valid location target.");
        return;
      }
    } else if (editingField === "merchantCenterId") {
      const val = (tempEditValues.merchantCenterId || "").trim();
      if (!val) {
        setFieldError("Merchant Center ID is required before this Shopping campaign can be published.");
        return;
      }
      if (!/^\d+$/.test(val)) {
        setFieldError("Merchant Center ID must be numeric (e.g. 5840531233).");
        return;
      }
    } else if (editingField === "adGroupBid") {
      const val = Number(tempEditValues.adGroupBid);
      if (isNaN(val) || val <= 0) {
        setFieldError("Ad group bid must be a positive number greater than ₹0.");
        return;
      }
    }

    setFieldError(null);

    setCampaignState((prev) => {
      let updated: CampaignState = { ...prev };
      let newBizName = prev.businessName || prev.business?.name || "";
      let newCampaignType = prev.campaignType;

      if (editingField === "businessName" && tempEditValues.businessName !== undefined) {
        newBizName = tempEditValues.businessName.trim();
        updated.businessName = newBizName;
        updated.business = { ...(updated.business || {}), name: newBizName };
      }

      if (editingField === "objective" && tempEditValues.objective !== undefined) {
        updated.objective = tempEditValues.objective as any;
      }

      if (editingField === "conversionGoal" && tempEditValues.conversionGoal !== undefined) {
        updated.conversionGoals = tempEditValues.conversionGoal.split(",").map(s => s.trim()).filter(Boolean);
      }

      if (editingField === "campaignType" && tempEditValues.campaignType !== undefined) {
        newCampaignType = tempEditValues.campaignType as any;
        updated.campaignType = newCampaignType;
      }

      // Reconcile state against manual flow compatibility rules
      if (editingField === "objective") {
        updated = reconcileCampaignStateWithManualFlow(updated, "objective");
        newCampaignType = updated.campaignType;
      } else if (editingField === "conversionGoal") {
        updated = reconcileCampaignStateWithManualFlow(updated, "conversionGoal");
        newCampaignType = updated.campaignType;
      } else if (editingField === "campaignType") {
        updated = reconcileCampaignStateWithManualFlow(updated, "campaignType");
        newCampaignType = updated.campaignType;
      }

      // Check if user explicitly edited campaignName field directly
      if (editingField === "campaignName" && tempEditValues.campaignName !== undefined) {
        updated.campaignName = tempEditValues.campaignName.trim();
        setIsCustomCampaignName(true);
      } else if (editingField === "businessName") {
        if (!isCustomCampaignName && newBizName) {
          updated.campaignName = newBizName.replace(/\s+/g, "_");
        }
      } else if (editingField === "campaignType" || editingField === "objective" || editingField === "conversionGoal") {
        if (!isCustomCampaignName && newBizName && newCampaignType) {
          updated.campaignName = generateCampaignName(newBizName, newCampaignType);
        }
      }

      if (editingField === "website" && tempEditValues.website !== undefined) {
        const cleanUrl = tempEditValues.website.trim();
        updated.website = cleanUrl;
        if (updated.business) updated.business.website = cleanUrl;
      }

      if (editingField === "dailyBudget" && tempEditValues.dailyBudget !== undefined) {
        const parsed = parseFloat(String(tempEditValues.dailyBudget));
        if (!isNaN(parsed) && parsed > 0) {
          updated.dailyBudget = parsed;
        }
      }

      if (editingField === "biddingStrategy" && tempEditValues.biddingStrategy !== undefined) {
        updated.biddingStrategy = tempEditValues.biddingStrategy;
        if (tempEditValues.biddingStrategy === "Target CPA") {
          const parsedCpa = parseFloat(String(tempEditValues.targetCpa));
          updated.targetCpa = isNaN(parsedCpa) ? null : parsedCpa;
          updated.targetRoas = null;
        } else if (tempEditValues.biddingStrategy === "Target ROAS") {
          const parsedRoas = parseFloat(String(tempEditValues.targetRoas));
          updated.targetRoas = isNaN(parsedRoas) ? null : parsedRoas;
          updated.targetCpa = null;
        } else if (tempEditValues.biddingStrategy === "Clicks" || tempEditValues.biddingStrategy === "Maximize Clicks") {
          updated.maxCpcLimit = tempEditValues.maxCpcLimit || null;
          updated.targetCpa = null;
          updated.targetRoas = null;
        } else if (tempEditValues.biddingStrategy === "Target Impression Share" || tempEditValues.biddingStrategy === "Impression share") {
          updated.targetImpressionSharePercent = tempEditValues.targetImpressionSharePercent || "50";
          updated.impressionShareLocation = tempEditValues.impressionShareLocation || "Anywhere on results page";
          updated.targetCpa = null;
          updated.targetRoas = null;
        } else {
          updated.targetCpa = null;
          updated.targetRoas = null;
        }
      }

      if (editingField === "locations") {
        if (locationMode === "ALL") {
          updated.locations = ["All countries and territories"];
        } else if (locationMode === "INDIA") {
          updated.locations = ["India"];
        } else {
          updated.locations = [...selectedLocationsList];
        }
      }

      if (editingField === "language") {
        updated.language = selectedLanguagesList.join(", ");
      }

      if (editingField === "startDate" && tempEditValues.startDate !== undefined) {
        updated.startDate = tempEditValues.startDate;
      }

      if (editingField === "endDate" && tempEditValues.endDate !== undefined) {
        updated.endDate = tempEditValues.endDate ? tempEditValues.endDate : undefined;
      }

      if (editingField === "merchantCenterId" && tempEditValues.merchantCenterId !== undefined) {
        updated.merchantCenterId = tempEditValues.merchantCenterId.trim();
      }
      if (editingField === "salesCountry" && tempEditValues.salesCountry !== undefined) {
        updated.salesCountry = tempEditValues.salesCountry.trim();
        if (!updated.feedLabel) updated.feedLabel = tempEditValues.salesCountry.trim();
      }
      if (editingField === "feedLabel" && tempEditValues.feedLabel !== undefined) {
        updated.feedLabel = tempEditValues.feedLabel.trim();
      }
      if (editingField === "adGroupName" && tempEditValues.adGroupName !== undefined) {
        updated.adGroupName = tempEditValues.adGroupName.trim();
      }
      if (editingField === "adGroupBid" && tempEditValues.adGroupBid !== undefined) {
        const pBid = parseFloat(String(tempEditValues.adGroupBid));
        updated.adGroupBid = isNaN(pBid) ? null : pBid;
      }
      if (editingField === "campaignPriority" && tempEditValues.campaignPriority !== undefined) {
        updated.campaignPriority = tempEditValues.campaignPriority;
      }
      if (editingField === "localProducts" && tempEditValues.localProducts !== undefined) {
        updated.localProducts = Boolean(tempEditValues.localProducts);
        updated.enableLocalProducts = Boolean(tempEditValues.localProducts);
      }
      if (editingField === "appId" && tempEditValues.appId !== undefined) {
        updated.appId = tempEditValues.appId.trim();
      }
      if (editingField === "appName" && tempEditValues.appName !== undefined) {
        updated.appName = tempEditValues.appName.trim();
      }
      if (editingField === "platform" && tempEditValues.platform !== undefined) {
        const p = tempEditValues.platform.toUpperCase() === "IOS" ? "IOS" : "ANDROID";
        updated.platform = p;
        updated.appStore = p === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE";
      }

      // Check if minimum readyForPublish requirements are satisfied across all campaign types
      const cType = updated.campaignType;
      const isBudgetValid = cType === "DEMAND_GEN"
        ? (updated.dailyBudget && updated.dailyBudget >= 416)
        : (updated.dailyBudget && updated.dailyBudget > 0);
      const hasBudget = Boolean(isBudgetValid);
      const hasName = !!updated.campaignName;
      const hasType = !!updated.campaignType;

      const validHeadlines = (updated.headlines || []).filter(h => h && h.trim().length > 0);
      const validDescriptions = (updated.descriptions || []).filter(d => d && d.trim().length > 0);
      const validLongHeadlines = (updated.longHeadlines || []).filter(lh => lh && lh.trim().length > 0);
      const validKeywords = (updated.keywords || []).filter(k => k && k.trim().length > 0);
      const hasImages = (updated.images?.length || 0) > 0;
      const hasLogos = (updated.logos?.length || 0) > 0;
      const hasVideos = (updated.videos?.length || 0) > 0;
      const dgFormat = updated.adFormat || "SINGLE_IMAGE";

      let isReady = false;
      if (hasBudget && hasName && hasType) {
        if (cType === "SEARCH") {
          isReady = validKeywords.length >= 1 && validHeadlines.length >= 3 && validDescriptions.length >= 2;
        } else if (cType === "PERFORMANCE_MAX") {
          const allImgs = updated.images || [];
          const allLgs = updated.logos || [];
          let hasLand = false;
          let hasSq = false;
          let hasLg = allLgs.length > 0;

          for (const im of allImgs) {
            const raw = typeof im === "string" ? im : im?.url || im?.data || "";
            const fType = typeof im === "object" ? im?.fieldType : null;
            if (fType === "MARKETING_IMAGE") hasLand = true;
            else if (fType === "SQUARE_MARKETING_IMAGE") hasSq = true;
            else if (fType === "LOGO") hasLg = true;
            else if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
              hasLand = true;
              hasSq = true;
            } else if (raw) {
              hasLand = true;
            }
          }
          const hasBiz = !!(updated.businessName?.trim() && updated.businessName.trim().length <= 25);
          const hasUrl = !!(updated.website && (updated.website.startsWith("http://") || updated.website.startsWith("https://")));
          const bStrat = (updated.biddingStrategy || "").toLowerCase();
          let isBiddingValid = true;
          if (bStrat === "target cpa" || bStrat === "target_cpa") {
            const cpa = Number(updated.targetCpa);
            isBiddingValid = !isNaN(cpa) && cpa > 0;
          } else if (bStrat === "target roas" || bStrat === "target_roas") {
            const roas = Number(updated.targetRoas);
            isBiddingValid = !isNaN(roas) && roas > 0;
          }

          isReady = hasLand && hasSq && hasLg && validHeadlines.length >= 3 && validLongHeadlines.length >= 1 && validDescriptions.length >= 2 && hasBiz && hasUrl && isBiddingValid;
        } else if (cType === "DISPLAY") {
          const hasLongHl = validLongHeadlines.length >= 1 || validHeadlines.length >= 1;
          isReady = hasImages && hasLogos && validHeadlines.length >= 1 && hasLongHl && validDescriptions.length >= 1;
        } else if (cType === "DEMAND_GEN") {
          if (dgFormat === "VIDEO") {
            isReady = hasVideos && hasLogos && validHeadlines.length >= 1 && validLongHeadlines.length >= 1 && validDescriptions.length >= 1;
          } else if (dgFormat === "CAROUSEL") {
            const cards = updated.carouselCards || [];
            const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());
            isReady = validCards.length >= 2 && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
          } else {
            // SINGLE_IMAGE
            isReady = hasImages && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
          }
        } else if (cType === "VIDEO") {
          const vFormat = updated.adFormat || "SINGLE_IMAGE";
          if (vFormat === "VIDEO") {
            isReady = hasVideos && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
          } else if (vFormat === "CAROUSEL") {
            const cards = updated.carouselCards || [];
            const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());
            isReady = validCards.length >= 2 && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
          } else {
            // SINGLE_IMAGE
            isReady = hasImages && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
          }
        } else if (cType === "APP") {
          const hasAppId = !!(updated.appId && updated.appId.trim());
          const hasBizName = !!(updated.businessName?.trim() || updated.business?.name?.trim());
          const targetCpaNum = Number(updated.targetCpa);
          const hasTargetCpa = updated.targetCpa !== undefined && updated.targetCpa !== null && !isNaN(targetCpaNum) && targetCpaNum > 0;
          const hasHl = validHeadlines.length >= 1;
          const hasDesc = validDescriptions.length >= 1;
          isReady = Boolean(hasAppId && hasBizName && hasTargetCpa && hasHl && hasDesc && hasBudget);
        } else if (cType === "SHOPPING") {
          const mId = (updated.merchantCenterId || updated.merchantId || "").trim();
          const isMidValid = /^\d+$/.test(mId);
          const hasCountry = !!(updated.salesCountry || updated.feedLabel);
          const shoppingUrl = (updated.website || "").trim();
          const isUrlValid = shoppingUrl.startsWith("http://") || shoppingUrl.startsWith("https://");
          const hasHl = validHeadlines.length >= 1;
          const hasDesc = validDescriptions.length >= 1;
          const hasAdGroup = !!(updated.adGroupName || "Ad group 1").trim();

          const bStrategy = updated.biddingStrategy || "Maximize conversion value";
          let isBiddingValid = true;
          if (bStrategy === "Target ROAS" || bStrategy === "TARGET_ROAS") {
            const roas = Number(updated.targetRoas);
            isBiddingValid = !isNaN(roas) && roas > 0;
          } else if (bStrategy === "Manual CPC" || bStrategy === "MANUAL_CPC") {
            const bid = Number(updated.adGroupBid);
            isBiddingValid = !isNaN(bid) && bid > 0;
          } else if ((bStrategy === "Maximize clicks" || bStrategy === "MAXIMIZE_CLICKS" || bStrategy === "Clicks") && updated.maxCpcLimit) {
            const maxCpc = Number(updated.maxCpcLimit);
            isBiddingValid = !isNaN(maxCpc) && maxCpc > 0;
          }

          let isEndDateValid = true;
          if (updated.endDate && updated.startDate && updated.endDate < updated.startDate) {
            isEndDateValid = false;
          }

          let isLocationValid = true;
          if (Array.isArray(updated.locations) && updated.locations.length > 0) {
            isLocationValid = !updated.locations.some(l => !l || !l.trim());
          }

          isReady = Boolean(
            isMidValid &&
            hasCountry &&
            isUrlValid &&
            hasHl &&
            hasDesc &&
            hasAdGroup &&
            isBiddingValid &&
            isEndDateValid &&
            isLocationValid
          );
        } else {
          isReady = true;
        }
      }

      updated.readyForPublish = isReady;

      return updated;
    });

    setEditingField(null);
  };

  const cancelFieldEdit = () => {
    setEditingField(null);
    setFieldError(null);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Markdown parser helper for chat text
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      const parseInline = (str: string) => {
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(str)) !== null) {
          if (match.index > lastIndex) {
            parts.push(str.substring(lastIndex, match.index));
          }

          const matchedText = match[0];
          if (matchedText.startsWith("**") && matchedText.endsWith("**")) {
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className="font-bold text-slate-900">
                {matchedText.slice(2, -2)}
              </strong>
            );
          } else if (matchedText.startsWith("*") && matchedText.endsWith("*")) {
            parts.push(
              <em key={`${lineIdx}-${match.index}`} className="italic text-slate-700">
                {matchedText.slice(1, -1)}
              </em>
            );
          } else if (matchedText.startsWith("`") && matchedText.endsWith("`")) {
            parts.push(
              <code key={`${lineIdx}-${match.index}`} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-blue-700 font-semibold border border-slate-200">
                {matchedText.slice(1, -1)}
              </code>
            );
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < str.length) {
          parts.push(str.substring(lastIndex));
        }

        return parts.length > 0 ? parts : str;
      };

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("• ")) {
        const bulletText = line.trim().replace(/^[-*•]\s+/, "");
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-blue-600 font-bold shrink-0">•</span>
            <span>{parseInline(bulletText)}</span>
          </div>
        );
      }

      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-blue-600 font-bold text-[11px] shrink-0">{numMatch[1]}.</span>
            <span>{parseInline(numMatch[2])}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <div key={lineIdx} className="my-0.5">
          {parseInline(line)}
        </div>
      );
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: "msg-initial",
        role: "assistant",
        content: `Hi! I'm your Google Ads AI Copilot. I'll help you create and configure the optimal campaign for your business.\n\nTell me about what your business offers and what outcome you want to achieve (e.g. *getting leads & phone calls*, *selling products online*, *bringing people to your store*, or *promoting your app*). You can also share your website URL.`,
        suggestions: [
          "I want more leads & phone calls",
          "I want to sell products online",
          "I have a website URL to analyze",
          "What campaign type do you recommend?"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([initialMessage]);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [messages, isLoading]);

  // Analyze URL helper
  const handleAnalyzeUrl = async (urlStr: string) => {
    setIsAnalyzingUrl(true);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/ai-guided/analyze-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlStr })
      });
      const data = await res.json();
      if (data.success) {
        const derivedBiz = data.derivedBusinessName || data.title?.split(/[-|]/)[0]?.trim() || "";
        setCampaignState(prev => {
          const resolvedBiz = prev.businessName || derivedBiz || prev.business?.name || "";
          let resolvedCampName = prev.campaignName;
          if (!isCustomCampaignName && resolvedBiz) {
            resolvedCampName = generateCampaignName(resolvedBiz, prev.campaignType);
          }

          return {
            ...prev,
            website: urlStr,
            businessName: resolvedBiz,
            campaignName: resolvedCampName,
            business: {
              ...(prev.business || {}),
              name: resolvedBiz,
              website: urlStr,
              description: prev.business?.description || data.description || ""
            },
            headlines: (data.headlines && data.headlines.length > 0) ? data.headlines : prev.headlines,
            longHeadlines: (data.longHeadlines && data.longHeadlines.length > 0) ? data.longHeadlines : prev.longHeadlines,
            descriptions: (data.descriptions && data.descriptions.length > 0) ? data.descriptions : prev.descriptions,
            keywords: (data.keywords && data.keywords.length > 0) ? data.keywords : prev.keywords
          };
        });
      }
    } catch (e) {
      console.warn("Website analysis background notice:", e);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };

  // Direct Media File Upload Handler (triggers file selector, uploads to ImageKit, updates Cockpit)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${BACKEND}/api/ads/ai-guided/upload-media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64Data,
            fileName: `gads_${Date.now()}_${file.name}`,
            fieldType: file.name.toLowerCase().includes("logo") ? "LOGO" : "MARKETING_IMAGE"
          })
        });

        const data = await res.json();
        if (data.success && data.url) {
          const isLogo = data.fieldType === "LOGO" || file.name.toLowerCase().includes("logo");
          const isVideo = file.type.startsWith("video/");

          if (isVideo) {
            setCampaignState(prev => ({
              ...prev,
              videos: [...(prev.videos || []), { url: data.url, name: file.name }]
            }));
          } else if (isLogo) {
            setCampaignState(prev => ({
              ...prev,
              logos: [...(prev.logos || []), { url: data.url, name: file.name, fieldType: "LOGO" }]
            }));
          } else {
            setCampaignState(prev => ({
              ...prev,
              images: [
                ...(prev.images || []),
                { url: data.url, name: `${file.name} (Landscape & Square)`, fieldType: "MARKETING_IMAGE" }
              ]
            }));
          }
        }
        setIsUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("[Upload Error]:", err);
      setIsUploadingMedia(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading || isPublishing) return;

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

    // Step 1: Detect URL and execute analyze-url FIRST
    let activeState = { ...campaignState };
    const urlMatch = text.match(/https?:\/\/[^\s]+/i) || text.match(/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
    
    if (urlMatch && urlMatch[0]) {
      let detectedUrl = urlMatch[0];
      if (!detectedUrl.startsWith("http")) {
        detectedUrl = "https://" + detectedUrl;
      }

      setIsAnalyzingUrl(true);
      try {
        console.log("[AI-GUIDED] URL detected in message, analyzing website:", detectedUrl);
        const res = await fetch(`${BACKEND}/api/ads/ai-guided/analyze-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: detectedUrl })
        });
        const analysisData = await res.json();
        
        // Immediate state update with website data
        const extractedBizName = analysisData.derivedBusinessName || analysisData.title?.split(/[-|:]/)[0]?.trim() || activeState.businessName || "";
        activeState = {
          ...activeState,
          website: detectedUrl,
          businessName: activeState.businessName || extractedBizName,
          business: {
            ...(activeState.business || {}),
            name: activeState.business?.name || extractedBizName,
            website: detectedUrl,
            description: activeState.business?.description || analysisData.description || ""
          },
          headlines: (analysisData.headlines && analysisData.headlines.length > 0) ? analysisData.headlines : activeState.headlines,
          longHeadlines: (analysisData.longHeadlines && analysisData.longHeadlines.length > 0) ? analysisData.longHeadlines : activeState.longHeadlines,
          descriptions: (analysisData.descriptions && analysisData.descriptions.length > 0) ? analysisData.descriptions : activeState.descriptions,
          keywords: (analysisData.keywords && analysisData.keywords.length > 0) ? analysisData.keywords : activeState.keywords
        };
        // Update Live Campaign Cockpit right away
        setCampaignState(activeState);
        console.log("[AI-GUIDED] Updated campaignState with website analysis:", {
          website: activeState.website,
          businessName: activeState.businessName,
          headlinesCount: activeState.headlines?.length || 0
        });
      } catch (err: any) {
        console.warn("[AI-GUIDED] analyze-url error (continuing with URL set):", err.message);
        activeState = {
          ...activeState,
          website: detectedUrl,
          business: {
            ...(activeState.business || {}),
            website: detectedUrl
          }
        };
        setCampaignState(activeState);
      } finally {
        setIsAnalyzingUrl(false);
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputVal("");
    setIsLoading(true);
    setPublishError(null);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          messages: historyPayload,
          campaignState: activeState
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.campaignState) {
        // Deep preserve existing website & business data
        setCampaignState(prev => {
          const resolvedBizName = data.campaignState.businessName || activeState.businessName || prev.businessName || prev.business?.name || "";
          const resolvedCampaignType = data.campaignState.campaignType || activeState.campaignType || prev.campaignType || "";
          
          let resolvedCampaignName = prev.campaignName;
          if (isCustomCampaignName) {
            resolvedCampaignName = prev.campaignName;
          } else if (resolvedBizName && resolvedCampaignType) {
            resolvedCampaignName = generateCampaignName(resolvedBizName, resolvedCampaignType);
          } else if (resolvedBizName) {
            resolvedCampaignName = generateCampaignName(resolvedBizName);
          } else if (data.campaignState.campaignName) {
            resolvedCampaignName = data.campaignState.campaignName;
          }

          const resolvedObjective = data.campaignState.objective || activeState.objective || prev.objective || "";
          
          const rawMerged = {
            ...prev,
            ...data.campaignState,
            businessName: resolvedBizName,
            campaignName: resolvedCampaignName,
            objective: resolvedObjective,
            campaignType: (resolvedCampaignType as any) || data.campaignState.campaignType,
            website: data.campaignState.website || activeState.website || prev.website,
            business: {
              ...(prev.business || {}),
              ...(activeState.business || {}),
              ...(data.campaignState.business || {}),
              name: resolvedBizName,
              website: data.campaignState.website || activeState.website || prev.website
            },
            startDate: data.campaignState.startDate || prev.startDate || todayIso,
            endDate: data.campaignState.endDate || prev.endDate,
            images: (data.campaignState.images && data.campaignState.images.length > 0) ? data.campaignState.images : prev.images,
            logos: (data.campaignState.logos && data.campaignState.logos.length > 0) ? data.campaignState.logos : prev.logos,
            videos: (data.campaignState.videos && data.campaignState.videos.length > 0) ? data.campaignState.videos : prev.videos
          };

          const reconciled = reconcileCampaignStateWithManualFlow(rawMerged);
          if (!isCustomCampaignName && reconciled.businessName && reconciled.campaignType) {
            reconciled.campaignName = generateCampaignName(reconciled.businessName, reconciled.campaignType);
          }
          return reconciled;
        });
      }

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.message || "I've updated the campaign setup based on your input.",
        suggestions: data.suggestions || [],
        campaignState: data.campaignState,
        readyForReview: data.readyForReview,
        readyForPublish: data.readyForPublish,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("[AI Chat Error]:", err);
      const errorMessage: Message = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Connection Notice:** I could not reach the AI reasoning engine right now (${err.message}). Your business & website have been saved in the cockpit! You can continue providing instructions.`,
        suggestions: ["Use Recommended Settings", "I want more leads", "I want more sales", "Set Daily Budget to ₹1,000"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/create-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignState
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create campaign. Validation requirements may be missing.");
      }

      setPublishSuccess(`🎉 Success! Campaign "${campaignState.campaignName || "AI Campaign"}" has been created in Google Ads.`);

      setTimeout(() => {
        router.push(`/ads/campaigns?customerId=${customerId}`);
      }, 2500);
    } catch (err: any) {
      console.error("[Publish Error]:", err);
      setPublishError(err.message || "Failed to publish campaign to Google Ads.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Navigates to the specialized campaign creation form prefilling current AI campaign state
  const handleEditDetailsInForm = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("googleAds_prefill_campaign", JSON.stringify(campaignState));
      }
    } catch (e) {
      console.warn("Could not write prefill draft to localStorage", e);
    }
    
    // Route to the dedicated form for the selected objective and campaignType
    const obj = (campaignState.objective || "SALES").toLowerCase().replace(/_/g, "-");
    const cType = campaignState.campaignType;
    const cidQuery = customerId ? `?customerId=${customerId}` : "";

    if (cType === "SEARCH") {
      if (obj === "no-guidance" || obj === "no_guidance") {
        router.push(`/ads/campaigns/create/no-guidance/search${cidQuery}`);
      } else if (obj === "leads") {
        router.push(`/ads/campaigns/create/leads/search${cidQuery}`);
      } else if (obj === "website-traffic") {
        router.push(`/ads/campaigns/create/website-traffic/search${cidQuery}`);
      } else {
        router.push(`/ads/campaigns/create/sales/search${cidQuery}`);
      }
    } else if (cType === "PERFORMANCE_MAX") {
      if (obj === "leads") {
        router.push(`/ads/campaigns/create/leads/performance-max${cidQuery}`);
      } else if (obj === "website-traffic") {
        router.push(`/ads/campaigns/create/website-traffic/performance-max${cidQuery}`);
      } else if (obj === "local" || obj === "store-visits") {
        router.push(`/ads/campaigns/create/local/performance-max${cidQuery}`);
      } else if (obj === "no-guidance" || obj === "no_guidance") {
        router.push(`/ads/campaigns/create/no-guidance/performance-max${cidQuery}`);
      } else {
        router.push(`/ads/campaigns/create/sales/performance-max${cidQuery}`);
      }
    } else if (cType === "DISPLAY") {
      if (obj === "leads") {
        router.push(`/ads/campaigns/create/leads/display${cidQuery}`);
      } else if (obj === "website-traffic") {
        router.push(`/ads/campaigns/create/website-traffic/display${cidQuery}`);
      } else if (obj === "awareness") {
        router.push(`/ads/campaigns/create/awareness/display${cidQuery}`);
      } else {
        router.push(`/ads/campaigns/create/sales/display${cidQuery}`);
      }
    } else if (cType === "DEMAND_GEN") {
      if (obj === "leads") {
        router.push(`/ads/campaigns/create/leads/demand-gen${cidQuery}`);
      } else if (obj === "website-traffic") {
        router.push(`/ads/campaigns/create/website-traffic/demand-gen${cidQuery}`);
      } else if (obj === "awareness") {
        router.push(`/ads/campaigns/create/awareness/demand-gen${cidQuery}`);
      } else {
        router.push(`/ads/campaigns/create/sales/demand-gen${cidQuery}`);
      }
    } else if (cType === "VIDEO") {
      if (obj === "leads") {
        router.push(`/ads/campaigns/create/leads/video${cidQuery}`);
      } else if (obj === "website-traffic") {
        router.push(`/ads/campaigns/create/website-traffic/video${cidQuery}`);
      } else if (obj === "awareness") {
        router.push(`/ads/campaigns/create/awareness/video${cidQuery}`);
      } else {
        router.push(`/ads/campaigns/create/sales/video${cidQuery}`);
      }
    } else if (cType === "SHOPPING") {
      if (obj === "leads") {
        router.push(`/ads/campaigns/create/leads/shopping${cidQuery}`);
      } else if (obj === "website-traffic" || obj === "traffic") {
        router.push(`/ads/campaigns/create/website-traffic/shopping${cidQuery}`);
      } else if (obj === "no-guidance" || obj === "without_guidance" || obj === "no_guidance") {
        router.push(`/ads/campaigns/create/no-guidance/shopping${cidQuery}`);
      } else {
        router.push(`/ads/campaigns/create/sales/shopping${cidQuery}`);
      }
    } else if (cType === "APP") {
      router.push(`/ads/campaigns/create/app-promotion/app${cidQuery}`);
    } else {
      router.push(`/ads/campaigns/create${cidQuery}`);
    }
  };

  const getCampaignIcon = (type?: string) => {
    switch (type) {
      case "SEARCH":
        return <Search className="h-4 w-4 text-blue-600" />;
      case "PERFORMANCE_MAX":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "DISPLAY":
        return <LayoutGrid className="h-4 w-4 text-amber-600" />;
      case "VIDEO":
        return <Video className="h-4 w-4 text-red-600" />;
      case "DEMAND_GEN":
        return <Zap className="h-4 w-4 text-orange-600" />;
      case "SHOPPING":
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case "APP":
        return <Smartphone className="h-4 w-4 text-indigo-600" />;
      default:
        return <Globe className="h-4 w-4 text-slate-600" />;
    }
  };



  const allAssetsCount = (campaignState.images?.length || 0) + (campaignState.logos?.length || 0) + (campaignState.videos?.length || 0);

  return (
    <div className="h-screen max-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* Hidden File Input for Native Media Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ── Top Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Back to Manual Creation"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-none">
              AI Campaign Studio
            </span>
            <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Copilot
            </span>
          </div>
        </div>

        {/* Creation Mode Toggle (Switch between Manual and AI Guided) */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="px-3 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          >
            Manual Creation
          </button>
          <button
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm flex items-center gap-1 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Guided
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setMessages([]);
              setIsCustomCampaignName(false);
              setIsEditingCockpit(false);
              setEditingField(null);
              setCampaignState({
                business: {},
                desiredOutcome: "",
                campaignType: "",
                objective: "",
                conversionGoals: [],
                campaignName: "",
                businessName: "",
                website: "",
                dailyBudget: null,
                locations: ["India"],
                language: "English",
                startDate: todayIso,
                endDate: undefined,
                keywords: [],
                headlines: [],
                descriptions: [],
                images: [],
                logos: [],
                videos: [],
                readyForReview: false,
                readyForPublish: false,
                stage: "collecting_business"
              });
            }}
            title="Reset conversation"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <span className="hidden xs:inline text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            {customerId ? `ID: ${customerId}` : "Google Ads"}
          </span>
        </div>
      </header>

      {/* ── Mobile Tab Navigation Bar (Visible only on mobile screens < lg) ── */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-40">
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileActiveTab("chat")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActiveTab === "chat"
                ? "bg-white text-blue-600 shadow-xs font-bold border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AI Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveTab("cockpit")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActiveTab === "cockpit"
                ? "bg-white text-blue-600 shadow-xs font-bold border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Campaign Cockpit</span>
            {campaignState.readyForPublish && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ── Main Content Split View (Light Theme) ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-slate-100">
        
        {/* LEFT: AI Interactive Chat Column */}
        <div className={`flex-1 flex-col min-w-0 min-h-0 bg-white border-r border-slate-200 shadow-xs ${
          mobileActiveTab === "chat" ? "flex" : "hidden lg:flex"
        }`}>
          
          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                      msg.role === "user"
                        ? "bg-slate-800 text-white"
                        : "bg-blue-600 text-white shadow-blue-500/20 shadow-md"
                    }`}
                  >
                    {msg.role === "user" ? "You" : <Sparkles className="h-4 w-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-xs font-medium"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-2.5">
                        {renderFormattedMarkdown(msg.content)}
                      </div>
                    )}

                    {/* Dynamic In-Chat Review Card */}
                    {msg.role === "assistant" && (msg.readyForReview || msg.campaignState?.readyForReview || campaignState.readyForReview) && (() => {
                      const isReadyToPublish = !!campaignState.readyForPublish;
                      const isPmax = campaignState.campaignType === "PERFORMANCE_MAX";

                      const allImages = [
                        ...(Array.isArray(campaignState.images) ? campaignState.images : [])
                      ];
                      const allLogos = [
                        ...(Array.isArray(campaignState.logos) ? campaignState.logos : [])
                      ];

                      let hasLandscape = false;
                      let hasSquare = false;
                      let hasLogo = allLogos.length > 0;

                      for (const img of allImages) {
                        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
                        const fType = typeof img === "object" ? img?.fieldType : null;
                        if (fType === "MARKETING_IMAGE") hasLandscape = true;
                        else if (fType === "SQUARE_MARKETING_IMAGE") hasSquare = true;
                        else if (fType === "LOGO") hasLogo = true;
                        else if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
                          hasLandscape = true;
                          hasSquare = true;
                        } else if (raw) {
                          hasLandscape = true;
                        }
                      }

                      return (
                        <div className="mt-3.5 p-4 rounded-2xl bg-white border border-blue-200 text-slate-800 space-y-3 shadow-md">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
                                {getCampaignIcon(campaignState.campaignType)}
                              </div>
                              <div>
                                <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block">
                                  {campaignState.campaignType || "Campaign"} Configuration
                                </span>
                                <span className="text-[10px] text-slate-500">Review & Launch Readiness</span>
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                                isReadyToPublish
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {isReadyToPublish ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Ready
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 text-amber-600" /> Action Required
                                </>
                              )}
                            </span>
                          </div>

                          {/* Key Parameters */}
                          <div className="grid grid-cols-2 gap-2.5 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Objective</span>
                              <span className="font-bold text-blue-700">{campaignState.objective || "Not set"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Daily Budget</span>
                              <span className="font-mono font-bold text-emerald-600">
                                {campaignState.dailyBudget ? `₹${campaignState.dailyBudget}/day` : "Not set"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Business</span>
                              <span className="font-semibold text-slate-800 truncate block">
                                {campaignState.businessName || campaignState.business?.name || "Pending discovery"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Campaign Name</span>
                              <span className="font-semibold text-slate-800 truncate block">
                                {campaignState.campaignName || "Auto-generated"}
                              </span>
                            </div>
                            {campaignState.website && (
                              <div className="col-span-2 pt-1 border-t border-slate-200">
                                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Target URL</span>
                                <span className="font-mono text-blue-600 truncate block text-[11px]">
                                  {campaignState.website}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Assets Checklist for PMax vs Search */}
                          {isPmax && (
                            <div className="pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-wider">Required Assets:</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className={`p-2 rounded-lg border text-center ${hasLandscape ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="text-[10px] font-bold">Landscape (1.91:1)</div>
                                  <div className="text-[9px] mt-0.5">{hasLandscape ? "✓ Attached" : "Missing"}</div>
                                </div>
                                <div className={`p-2 rounded-lg border text-center ${hasSquare ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="text-[10px] font-bold">Square (1:1)</div>
                                  <div className="text-[9px] mt-0.5">{hasSquare ? "✓ Attached" : "Missing"}</div>
                                </div>
                                <div className={`p-2 rounded-lg border text-center ${hasLogo ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="text-[10px] font-bold">Logo</div>
                                  <div className="text-[9px] mt-0.5">{hasLogo ? "✓ Attached" : "Missing"}</div>
                                </div>
                              </div>

                              {(!hasLandscape || !hasSquare || !hasLogo) && (
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="w-full mt-2.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <Upload className="h-3.5 w-3.5 text-blue-600" />
                                  Upload Creative Assets & Logo
                                </button>
                              )}
                            </div>
                          )}

                          {/* Search Checklist */}
                          {campaignState.campaignType === "SEARCH" && (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-600 font-bold uppercase tracking-wider">Search Ad Readiness:</span>
                                <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                                  {campaignState.readyForPublish ? "Publish Ready ✓" : "Review Missing"}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                <div className={`p-1.5 rounded-lg border ${(campaignState.keywords?.length || 0) >= 1 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="font-bold">Keywords</div>
                                  <div className="text-[9px]">{(campaignState.keywords?.length || 0) >= 1 ? `✓ ${campaignState.keywords?.length}` : "Missing"}</div>
                                </div>
                                <div className={`p-1.5 rounded-lg border ${(campaignState.headlines?.length || 0) >= 3 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="font-bold">Headlines</div>
                                  <div className="text-[9px]">{campaignState.headlines?.length || 0}/15 (min 3)</div>
                                </div>
                                <div className={`p-1.5 rounded-lg border ${(campaignState.descriptions?.length || 0) >= 2 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="font-bold">Descriptions</div>
                                  <div className="text-[9px]">{campaignState.descriptions?.length || 0}/4 (min 2)</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Demand Gen Checklist */}
                          {campaignState.campaignType === "DEMAND_GEN" && (() => {
                            const dgFormat = campaignState.adFormat || "SINGLE_IMAGE";
                            const hasValidBudget = campaignState.dailyBudget && campaignState.dailyBudget >= 416;
                            const hasLogo = (campaignState.logos?.length || 0) >= 1;
                            const hasImages = (campaignState.images?.length || 0) >= 1;
                            const hasVideos = (campaignState.videos?.length || 0) >= 1;
                            const cards = campaignState.carouselCards || [];
                            const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());
                            const hasHeadlines = (campaignState.headlines?.length || 0) >= 1;
                            const hasLongHeadlines = (campaignState.longHeadlines?.length || 0) >= 1;
                            const hasDescriptions = (campaignState.descriptions?.length || 0) >= 1;

                            return (
                              <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-600 font-bold uppercase tracking-wider">Demand Gen ({dgFormat.replace("_", " ")}) Readiness:</span>
                                  <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                                    {campaignState.readyForPublish ? "Publish Ready ✓" : "Review Missing"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                  <div className={`p-1.5 rounded-lg border ${hasValidBudget ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Budget (≥₹416)</div>
                                    <div className="text-[9px]">{hasValidBudget ? `₹${campaignState.dailyBudget}/day` : "Min ₹416 needed"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasLogo ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Logo</div>
                                    <div className="text-[9px]">{hasLogo ? "✓ Uploaded" : "Missing"}</div>
                                  </div>
                                  {dgFormat === "SINGLE_IMAGE" && (
                                    <div className={`p-1.5 rounded-lg border ${hasImages ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">Marketing Image</div>
                                      <div className="text-[9px]">{hasImages ? "✓ Attached" : "Missing"}</div>
                                    </div>
                                  )}
                                  {dgFormat === "VIDEO" && (
                                    <div className={`p-1.5 rounded-lg border ${hasVideos ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">YouTube Video</div>
                                      <div className="text-[9px]">{hasVideos ? "✓ Attached" : "Missing"}</div>
                                    </div>
                                  )}
                                  {dgFormat === "CAROUSEL" && (
                                    <div className={`p-1.5 rounded-lg border ${validCards.length >= 2 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">Carousel Cards</div>
                                      <div className="text-[9px]">{validCards.length >= 2 ? `✓ ${validCards.length} Cards` : `${validCards.length}/2 (min 2)`}</div>
                                    </div>
                                  )}
                                  <div className={`p-1.5 rounded-lg border ${hasHeadlines ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Headlines</div>
                                    <div className="text-[9px]">{hasHeadlines ? `✓ ${campaignState.headlines?.length}` : "Missing"}</div>
                                  </div>
                                  {dgFormat === "VIDEO" && (
                                    <div className={`p-1.5 rounded-lg border ${hasLongHeadlines ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">Long Headline</div>
                                      <div className="text-[9px]">{hasLongHeadlines ? `✓ ${campaignState.longHeadlines?.length}` : "Missing"}</div>
                                    </div>
                                  )}
                                  <div className={`p-1.5 rounded-lg border ${hasDescriptions ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Descriptions</div>
                                    <div className="text-[9px]">{hasDescriptions ? `✓ ${campaignState.descriptions?.length}` : "Missing"}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Display Checklist */}
                          {campaignState.campaignType === "DISPLAY" && (() => {
                            const hasValidBudget = campaignState.dailyBudget && campaignState.dailyBudget > 0;
                            const hasLogo = (campaignState.logos?.length || 0) >= 1;
                            const hasImages = (campaignState.images?.length || 0) >= 1;
                            const hasHeadlines = (campaignState.headlines?.length || 0) >= 1;
                            const hasLongHeadlines = (campaignState.longHeadlines?.length || 0) >= 1 || hasHeadlines;
                            const hasDescriptions = (campaignState.descriptions?.length || 0) >= 1;

                            return (
                              <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-600 font-bold uppercase tracking-wider">Display Responsive Ad Readiness:</span>
                                  <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                                    {campaignState.readyForPublish ? "Publish Ready ✓" : "Review Missing"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                  <div className={`p-1.5 rounded-lg border ${hasValidBudget ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Budget</div>
                                    <div className="text-[9px]">{hasValidBudget ? `₹${campaignState.dailyBudget}/day` : "Missing"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasImages ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Marketing Images</div>
                                    <div className="text-[9px]">{hasImages ? "✓ Attached" : "Missing"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasLogo ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Logo (1:1)</div>
                                    <div className="text-[9px]">{hasLogo ? "✓ Uploaded" : "Missing"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasHeadlines ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Headlines</div>
                                    <div className="text-[9px]">{hasHeadlines ? `✓ ${campaignState.headlines?.length}` : "Missing"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasLongHeadlines ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Long Headline</div>
                                    <div className="text-[9px]">{hasLongHeadlines ? `✓ ${campaignState.longHeadlines?.length || 1}` : "Missing"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasDescriptions ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Descriptions</div>
                                    <div className="text-[9px]">{hasDescriptions ? `✓ ${campaignState.descriptions?.length}` : "Missing"}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Video Checklist */}
                          {campaignState.campaignType === "VIDEO" && (() => {
                            const vFormat = campaignState.adFormat || "SINGLE_IMAGE";
                            const hasValidBudget = campaignState.dailyBudget && campaignState.dailyBudget > 0;
                            const hasLogo = (campaignState.logos?.length || 0) >= 1;
                            const hasImages = (campaignState.images?.length || 0) >= 1;
                            const hasVideos = (campaignState.videos?.length || 0) >= 1;
                            const cards = campaignState.carouselCards || [];
                            const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());
                            const hasHeadlines = (campaignState.headlines?.length || 0) >= 1;
                            const hasLongHeadlines = (campaignState.longHeadlines?.length || 0) >= 1;
                            const hasDescriptions = (campaignState.descriptions?.length || 0) >= 1;

                            return (
                              <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-600 font-bold uppercase tracking-wider">Video ({vFormat.replace("_", " ")}) Readiness:</span>
                                  <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                                    {campaignState.readyForPublish ? "Publish Ready ✓" : "Review Missing"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                  <div className={`p-1.5 rounded-lg border ${hasValidBudget ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Budget</div>
                                    <div className="text-[9px]">{hasValidBudget ? `₹${campaignState.dailyBudget}/day` : "Missing"}</div>
                                  </div>
                                  <div className={`p-1.5 rounded-lg border ${hasLogo ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Logo (1:1)</div>
                                    <div className="text-[9px]">{hasLogo ? "✓ Uploaded" : "Missing"}</div>
                                  </div>
                                  {vFormat === "SINGLE_IMAGE" && (
                                    <div className={`p-1.5 rounded-lg border ${hasImages ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">Marketing Image</div>
                                      <div className="text-[9px]">{hasImages ? "✓ Attached" : "Missing"}</div>
                                    </div>
                                  )}
                                  {vFormat === "VIDEO" && (
                                    <div className={`p-1.5 rounded-lg border ${hasVideos ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">YouTube Video</div>
                                      <div className="text-[9px]">{hasVideos ? "✓ Attached" : "Missing"}</div>
                                    </div>
                                  )}
                                  {vFormat === "CAROUSEL" && (
                                    <div className={`p-1.5 rounded-lg border ${validCards.length >= 2 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">Carousel Cards</div>
                                      <div className="text-[9px]">{validCards.length >= 2 ? `✓ ${validCards.length} Cards` : `${validCards.length}/2 (min 2)`}</div>
                                    </div>
                                  )}
                                  <div className={`p-1.5 rounded-lg border ${hasHeadlines ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Headlines</div>
                                    <div className="text-[9px]">{hasHeadlines ? `✓ ${campaignState.headlines?.length}` : "Missing"}</div>
                                  </div>
                                  {vFormat === "VIDEO" && (
                                    <div className={`p-1.5 rounded-lg border ${hasLongHeadlines ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                      <div className="font-bold">Long Headline</div>
                                      <div className="text-[9px]">{hasLongHeadlines ? `✓ ${campaignState.longHeadlines?.length}` : "Missing"}</div>
                                    </div>
                                  )}
                                  <div className={`p-1.5 rounded-lg border ${hasDescriptions ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                    <div className="font-bold">Descriptions</div>
                                    <div className="text-[9px]">{hasDescriptions ? `✓ ${campaignState.descriptions?.length}` : "Missing"}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* App / Shopping Checklist */}
                          {["APP", "SHOPPING"].includes(campaignState.campaignType || "") && (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-600 font-bold uppercase tracking-wider">{campaignState.campaignType} Readiness:</span>
                                <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                                  {campaignState.readyForPublish ? "Publish Ready ✓" : "Review Missing"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 text-center text-[10px]">
                                <div className={`p-1.5 rounded-lg border ${(campaignState.headlines?.length || 0) >= 1 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="font-bold">Ad Headlines</div>
                                  <div className="text-[9px]">{(campaignState.headlines?.length || 0) >= 1 ? `✓ ${campaignState.headlines?.length} Headlines` : "Missing"}</div>
                                </div>
                                <div className={`p-1.5 rounded-lg border ${(campaignState.descriptions?.length || 0) >= 1 ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                  <div className="font-bold">Descriptions</div>
                                  <div className="text-[9px]">{(campaignState.descriptions?.length || 0) >= 1 ? `✓ ${campaignState.descriptions?.length} Descriptions` : "Missing"}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setMobileActiveTab("cockpit");
                                setIsEditingCockpit(true);
                                startFieldEdit("businessName");
                              }}
                              className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit in Cockpit
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateCampaign}
                              disabled={!isReadyToPublish || isPublishing}
                              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isReadyToPublish
                                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                              }`}
                            >
                              {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Target className="h-3.5 w-3.5"/>}
                              {isPublishing ? "Publishing to Google Ads..." : "Launch Campaign"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Interactive Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const sLower = s.toLowerCase();
                              if (sLower.includes("upload")) {
                                fileInputRef.current?.click();
                              } else if (sLower === "set daily budget" || sLower === "change budget" || sLower === "set budget") {
                                setMobileActiveTab("cockpit");
                                startFieldEdit("dailyBudget");
                              } else if (sLower === "provide website url" || sLower === "change website" || sLower === "set website url") {
                                setMobileActiveTab("cockpit");
                                startFieldEdit("website");
                              } else if (sLower === "edit details in form" || sLower === "edit campaign" || sLower === "edit in form") {
                                handleEditDetailsInForm();
                              } else if (sLower === "add keywords" || sLower === "edit keywords") {
                                setMobileActiveTab("cockpit");
                                setIsEditingCockpit(true);
                              } else {
                                handleSendMessage(s);
                              }
                            }}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-slate-700 shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>{s}</span>
                            <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 px-12">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing / Analysis Indicator */}
            {(isLoading || isAnalyzingUrl || isUploadingMedia) && (
              <div className="flex items-center gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <Sparkles className="h-4 w-4 animate-spin"/>
                </div>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-600 flex items-center gap-2.5">
                  <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                  <span>
                    {isUploadingMedia
                      ? "Uploading asset to ImageKit CDN..."
                      : isAnalyzingUrl
                      ? "Analyzing website structure & content..."
                      : "AI Copilot is analyzing and formulating strategy..."}
                  </span>
                </div>
              </div>
            )}

            {publishSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-3 shadow-md">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-900">{publishSuccess}</p>
                  <p className="text-[11px] text-emerald-700">Redirecting to your campaign dashboard...</p>
                </div>
              </div>
            )}

            {publishError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-3 shadow-md">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-rose-900">Launch Issue</p>
                  <p className="text-[11px] text-rose-700">{publishError}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pills & Input Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2.5">
            
            {/* Quick Pills Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 shrink-0 mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => handleSendMessage("I want more leads & phone calls")}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-xs"
              >
                I want more leads & phone calls
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("I want to sell products online")}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-xs"
              >
                I want to sell products online
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("What campaign type do you recommend for my business?")}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-xs"
              >
                Recommend Campaign Type
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                Upload Media
              </button>
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    isLoading
                      ? "AI Copilot is formulating recommendations..."
                      : "Describe your goal, business, paste website URL, or set daily budget..."
                  }
                  disabled={isLoading || isPublishing}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all disabled:opacity-60 shadow-xs"
                />
                {inputVal.includes("http") && (
                  <span className="absolute right-3 top-3 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-mono">
                    URL Detected
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image or logo"
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer shrink-0"
              >
                <Upload className="h-4 w-4" />
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading || isPublishing}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Live Campaign Cockpit Panel (Light Theme) */}
        <div className={`w-full lg:w-[420px] h-full min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex-col shrink-0 shadow-xs ${
          mobileActiveTab === "cockpit" ? "flex flex-1 lg:flex-none" : "hidden lg:flex"
        }`}>
          
          {/* Cockpit Header (Sticky top inside right panel) */}
          <div className="p-5 pb-3 border-b border-slate-200 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Campaign Cockpit
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {campaignState.campaignType ? "Configured" : "Setting up"}
            </span>
          </div>

          {/* Cockpit Scrollable Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
            {/* 1. CAMPAIGN STRATEGY CARD (All 11 Exact Fields with Inline Edit Support) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCampaignIcon(campaignState.campaignType)}
                  <span className="font-bold text-xs text-slate-900">Campaign Strategy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    campaignState.objective
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {campaignState.objective || "NOT SET"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                
                {/* Field 1: Business */}
                <div className="flex justify-between items-center py-1 border-b border-slate-200 group">
                  <div className="flex items-center gap-1 text-slate-500">
                    <span>Business:</span>
                    <button
                      type="button"
                      onClick={() => (editingField === "businessName" ? cancelFieldEdit() : startFieldEdit("businessName"))}
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      title="Edit Business Name"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                  {editingField === "businessName" ? (
                    <div className="flex items-center gap-1 max-w-[220px]">
                      <input
                        type="text"
                        value={tempEditValues.businessName || ""}
                        onChange={(e) => setTempEditValues({ ...tempEditValues, businessName: e.target.value })}
                        placeholder="Business name"
                        className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveFieldEdit}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                        title="Save"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelFieldEdit}
                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-800 truncate max-w-[200px] flex items-center gap-1">
                      {campaignState.businessName || campaignState.business?.name ? (
                        <>
                          <span className="text-emerald-600 font-bold">✓</span>
                          {campaignState.businessName || campaignState.business?.name}
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Not set</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Field 2: Campaign Name */}
                <div className="flex justify-between items-center py-1 border-b border-slate-200 group">
                  <div className="flex items-center gap-1 text-slate-500">
                    <span>Campaign Name:</span>
                    <button
                      type="button"
                      onClick={() => (editingField === "campaignName" ? cancelFieldEdit() : startFieldEdit("campaignName"))}
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      title="Edit Campaign Name"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                  {editingField === "campaignName" ? (
                    <div className="flex items-center gap-1 max-w-[220px]">
                      <input
                        type="text"
                        value={tempEditValues.campaignName || ""}
                        onChange={(e) => setTempEditValues({ ...tempEditValues, campaignName: e.target.value })}
                        placeholder="Campaign name"
                        className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveFieldEdit}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                        title="Save"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelFieldEdit}
                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-800 truncate max-w-[200px] text-right">
                      {campaignState.campaignName || "Auto-generated after business info"}
                    </span>
                  )}
                </div>

                {/* Field 3: Objective */}
                <div className="flex justify-between items-center py-1 border-b border-slate-200 group">
                  <div className="flex items-center gap-1 text-slate-500">
                    <span>Objective:</span>
                    <button
                      type="button"
                      onClick={() => (editingField === "objective" ? cancelFieldEdit() : startFieldEdit("objective"))}
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      title="Edit Objective"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                  {editingField === "objective" ? (
                    <div className="flex items-center gap-1 max-w-[220px]">
                      <select
                        value={tempEditValues.objective || ""}
                        onChange={(e) => {
                          const newObj = e.target.value;
                          let defaultGoal = "phone_leads";
                          if (newObj === "APP_PROMOTION") defaultGoal = "installs";
                          else if (newObj === "AWARENESS") defaultGoal = "views";
                          else if (newObj === "LOCAL" || newObj === "NO_GUIDANCE") defaultGoal = "";

                          const newAvailableTypes = getAvailableCampaignTypes(newObj, defaultGoal ? [defaultGoal] : []);
                          setTempEditValues({
                            ...tempEditValues,
                            objective: newObj,
                            conversionGoal: defaultGoal,
                            campaignType: newAvailableTypes[0]?.id || "PERFORMANCE_MAX"
                          });
                        }}
                        className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                      >
                        <option value="">-- Select Objective --</option>
                        {MANUAL_OBJECTIVES.map((obj) => (
                          <option key={obj.id} value={obj.id}>
                            {obj.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={saveFieldEdit}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                        title="Save"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelFieldEdit}
                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-blue-700">
                      {campaignState.objective ? `${MANUAL_OBJECTIVES.find(o => o.id === campaignState.objective)?.title || campaignState.objective} ✓` : "Not set"}
                    </span>
                  )}
                </div>

                {/* Field 4: Conversion Goal / Campaign Subtype (Conditional based on Objective) */}
                {(() => {
                  const activeObj = campaignState.objective || "";
                  const isSalesLeadsTraffic = activeObj === "SALES" || activeObj === "LEADS" || activeObj === "WEBSITE_TRAFFIC";
                  const isAppPromotion = activeObj === "APP_PROMOTION";
                  const isAwareness = activeObj === "AWARENESS";
                  const isNoGuidance = activeObj === "NO_GUIDANCE";
                  const showNoGuidanceGoal = isNoGuidance && (campaignState.campaignType === "DEMAND_GEN" || campaignState.campaignType === "SHOPPING");

                  if (!isSalesLeadsTraffic && !isAppPromotion && !isAwareness && !showNoGuidanceGoal) {
                    // Hide Conversion Goal / Subtype row completely (e.g. for LOCAL or NO_GUIDANCE without Demand Gen/Shopping)
                    return null;
                  }

                  const fieldLabel = (isAppPromotion || isAwareness) ? "Campaign Subtype:" : "Conversion Goal:";
                  const editTitle = (isAppPromotion || isAwareness) ? "Edit Campaign Subtype" : "Edit Conversion Goal";

                  return (
                    <div className="flex justify-between items-center py-1 border-b border-slate-200 group">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>{fieldLabel}</span>
                        <button
                          type="button"
                          onClick={() => (editingField === "conversionGoal" ? cancelFieldEdit() : startFieldEdit("conversionGoal"))}
                          className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                          title={editTitle}
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </div>
                      {editingField === "conversionGoal" ? (
                        <div className="flex items-center gap-1 max-w-[220px]">
                          {(() => {
                            const curObj = tempEditValues.objective || campaignState.objective || "SALES";
                            let goalOptions: GoalDefinition[] = SALES_LEADS_TRAFFIC_GOALS;
                            let defaultVal = "phone_leads";

                            if (curObj === "APP_PROMOTION") {
                              goalOptions = APP_PROMOTION_SUBTYPES;
                              defaultVal = "installs";
                            } else if (curObj === "AWARENESS") {
                              goalOptions = AWARENESS_SUBTYPES;
                              defaultVal = "views";
                            } else if (curObj === "NO_GUIDANCE") {
                              if (tempEditValues.campaignType === "DEMAND_GEN") {
                                goalOptions = NO_GUIDANCE_DEMAND_GEN_GOALS;
                                defaultVal = "phone_leads";
                              } else if (tempEditValues.campaignType === "SHOPPING") {
                                goalOptions = NO_GUIDANCE_SHOPPING_GOALS;
                                defaultVal = "phone_leads";
                              }
                            }

                            const currentGoalVal = tempEditValues.conversionGoal || defaultVal;

                            return (
                              <select
                                value={currentGoalVal}
                                onChange={(e) => {
                                  const selectedGoal = e.target.value;
                                  const availableTypes = getAvailableCampaignTypes(curObj, [selectedGoal]);
                                  const isCurrentTypeStillValid = availableTypes.some(t => t.id === tempEditValues.campaignType);
                                  setTempEditValues({
                                    ...tempEditValues,
                                    conversionGoal: selectedGoal,
                                    campaignType: isCurrentTypeStillValid ? tempEditValues.campaignType : (availableTypes[0]?.id || "")
                                  });
                                }}
                                className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                              >
                                {goalOptions.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.name}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                          <button
                            type="button"
                            onClick={saveFieldEdit}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                            title="Save"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelFieldEdit}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-800 truncate max-w-[200px] text-right">
                          {(isAppPromotion || isAwareness)
                            ? formatSubtypeName(campaignState.objective, campaignState.conversionGoals)
                            : formatGoalName(campaignState.conversionGoals)}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Field 5: Campaign Type */}
                <div className="flex justify-between items-center py-1 border-b border-slate-200 group">
                  <div className="flex items-center gap-1 text-slate-500">
                    <span>Campaign Type:</span>
                    <button
                      type="button"
                      onClick={() => (editingField === "campaignType" ? cancelFieldEdit() : startFieldEdit("campaignType"))}
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      title="Edit Campaign Type"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  </div>
                  {editingField === "campaignType" ? (
                    <div className="flex items-center gap-1 max-w-[220px]">
                      {(() => {
                        const activeObj = tempEditValues.objective || campaignState.objective || "";
                        const activeGoals = tempEditValues.conversionGoal ? [tempEditValues.conversionGoal] : campaignState.conversionGoals;
                        const availableTypes = getAvailableCampaignTypes(activeObj, activeGoals);
                        const currentTypeVal = tempEditValues.campaignType && availableTypes.some(t => t.id === tempEditValues.campaignType)
                          ? tempEditValues.campaignType
                          : (availableTypes[0]?.id || "PERFORMANCE_MAX");

                        return (
                          <select
                            value={currentTypeVal}
                            onChange={(e) => setTempEditValues({ ...tempEditValues, campaignType: e.target.value })}
                            className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                          >
                            {availableTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.title}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={saveFieldEdit}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                        title="Save"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelFieldEdit}
                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-purple-700 flex items-center gap-1">
                      {campaignState.campaignType ? (
                        <>
                          {getCampaignIcon(campaignState.campaignType)}
                          {formatCampaignTypeDisplay(campaignState.campaignType)}
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Not set</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Field 5b: Bidding Strategy (PMax / Smart Bidding) */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Bidding:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "biddingStrategy" ? cancelFieldEdit() : startFieldEdit("biddingStrategy"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Bidding Strategy"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "biddingStrategy" ? (
                      <div className="flex flex-col gap-1.5 flex-1 max-w-[240px] items-end">
                        <select
                          value={tempEditValues.biddingStrategy || (campaignState.campaignType === "SHOPPING" ? "Maximize conversion value" : "Maximize conversions")}
                          onChange={(e) => {
                            setTempEditValues({ ...tempEditValues, biddingStrategy: e.target.value });
                            setFieldError(null);
                          }}
                          className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                        >
                          {campaignState.campaignType === "SHOPPING" ? (
                            <>
                              <option value="Maximize conversion value">Maximize conversion value</option>
                              <option value="Target ROAS">Target ROAS</option>
                              <option value="Maximize clicks">Maximize clicks</option>
                              <option value="Manual CPC">Manual CPC</option>
                            </>
                          ) : campaignState.campaignType === "APP" ? (
                            <>
                              <option value="Target CPA">Target CPA (Cost per install)</option>
                            </>
                          ) : (
                            <>
                              {/* Search / Multi-channel Bidding options */}
                              <option value="Maximize conversions">Maximize conversions</option>
                              <option value="Target CPA">Target CPA</option>
                              <option value="Maximize conversion value">Maximize conversion value</option>
                              <option value="Target ROAS">Target ROAS</option>
                              {campaignState.campaignType === "SEARCH" && (
                                <>
                                  <option value="Maximize Clicks">Maximize Clicks</option>
                                  <option value="Target Impression Share">Target Impression Share</option>
                                </>
                              )}
                            </>
                          )}
                        </select>
                        
                        {tempEditValues.biddingStrategy === "Target CPA" && (
                          <div className="relative w-full">
                            <span className="absolute left-1.5 top-0.5 text-slate-400 text-[10px]">₹</span>
                            <input
                              type="number"
                              value={tempEditValues.targetCpa ?? ""}
                              onChange={(e) => setTempEditValues({ ...tempEditValues, targetCpa: e.target.value })}
                              placeholder="Target CPA (₹)"
                              className="w-full bg-white border border-blue-500 rounded pl-4 pr-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                            />
                          </div>
                        )}

                        {tempEditValues.biddingStrategy === "Target ROAS" && (
                          <div className="relative w-full">
                            <span className="absolute right-2 top-0.5 text-slate-400 text-[10px]">%</span>
                            <input
                              type="number"
                              value={tempEditValues.targetRoas ?? ""}
                              onChange={(e) => setTempEditValues({ ...tempEditValues, targetRoas: e.target.value })}
                              placeholder="Target ROAS (%)"
                              className="w-full bg-white border border-blue-500 rounded pl-1.5 pr-5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                            />
                          </div>
                        )}

                        {(tempEditValues.biddingStrategy === "Maximize clicks" || tempEditValues.biddingStrategy === "Maximize Clicks" || tempEditValues.biddingStrategy === "Clicks") && (
                          <div className="relative w-full">
                            <span className="absolute left-1.5 top-0.5 text-slate-400 text-[10px]">₹</span>
                            <input
                              type="number"
                              value={tempEditValues.maxCpcLimit ?? ""}
                              onChange={(e) => setTempEditValues({ ...tempEditValues, maxCpcLimit: e.target.value })}
                              placeholder="Max CPC limit (₹, optional)"
                              className="w-full bg-white border border-blue-500 rounded pl-4 pr-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                            />
                          </div>
                        )}

                        {tempEditValues.biddingStrategy === "Manual CPC" && (
                          <div className="relative w-full">
                            <span className="absolute left-1.5 top-0.5 text-slate-400 text-[10px]">₹</span>
                            <input
                              type="number"
                              value={tempEditValues.adGroupBid ?? ""}
                              onChange={(e) => setTempEditValues({ ...tempEditValues, adGroupBid: e.target.value })}
                              placeholder="Ad group bid (₹, required)"
                              className="w-full bg-white border border-blue-500 rounded pl-4 pr-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                            />
                          </div>
                        )}

                        {(tempEditValues.biddingStrategy === "Target Impression Share" || tempEditValues.biddingStrategy === "Impression share") && (
                          <div className="space-y-1 w-full">
                            <select
                              value={tempEditValues.impressionShareLocation || "Anywhere on results page"}
                              onChange={(e) => setTempEditValues({ ...tempEditValues, impressionShareLocation: e.target.value })}
                              className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[10px] text-slate-900 focus:outline-none"
                            >
                              <option value="Anywhere on results page">Anywhere on results page</option>
                              <option value="Top of results page">Top of results page</option>
                              <option value="Absolute top of results page">Absolute top of results page</option>
                            </select>
                            <div className="relative w-full">
                              <span className="absolute right-2 top-0.5 text-slate-400 text-[10px]">%</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={tempEditValues.targetImpressionSharePercent ?? "50"}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, targetImpressionSharePercent: e.target.value })}
                                placeholder="Target Share % (1-100)"
                                className="w-full bg-white border border-blue-500 rounded pl-1.5 pr-5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={saveFieldEdit}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                            title="Save"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelFieldEdit}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors shrink-0"
                            title="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                        {campaignState.biddingStrategy || (campaignState.campaignType === "SHOPPING" ? "Maximize conversion value" : "Maximize conversions")}
                        {campaignState.biddingStrategy === "Target CPA" && campaignState.targetCpa ? ` (₹${campaignState.targetCpa})` : ""}
                        {campaignState.biddingStrategy === "Target ROAS" && campaignState.targetRoas ? ` (${campaignState.targetRoas}%)` : ""}
                        {(campaignState.biddingStrategy === "Maximize clicks" || campaignState.biddingStrategy === "Maximize Clicks" || campaignState.biddingStrategy === "Clicks") && campaignState.maxCpcLimit ? ` (Max ₹${campaignState.maxCpcLimit})` : ""}
                        {campaignState.biddingStrategy === "Manual CPC" && campaignState.adGroupBid ? ` (Bid ₹${campaignState.adGroupBid})` : ""}
                        {(campaignState.biddingStrategy === "Target Impression Share" || campaignState.biddingStrategy === "Impression share") && campaignState.targetImpressionSharePercent ? ` (${campaignState.targetImpressionSharePercent}%)` : ""}
                      </span>
                    )}
                  </div>
                  {editingField === "biddingStrategy" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

                {/* Field 6: Website */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Website:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "website" ? cancelFieldEdit() : startFieldEdit("website"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Website"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "website" ? (
                      <div className="flex items-center gap-1 flex-1 max-w-[240px] justify-end">
                        <input
                          type="url"
                          value={tempEditValues.website || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempEditValues({ ...tempEditValues, website: val });
                            if (val.trim()) {
                              setFieldError(validateWebsiteUrl(val));
                            } else {
                              setFieldError(null);
                            }
                          }}
                          placeholder="https://example.com"
                          className={`w-full bg-white border ${fieldError ? "border-rose-500 focus:ring-rose-500" : "border-blue-500"} rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none`}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                          title="Save"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelFieldEdit}
                          className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-blue-600 truncate max-w-[200px] text-right">
                        {campaignState.website || "Not set"}
                      </span>
                    )}
                  </div>
                  {editingField === "website" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

                {/* Field 7: Daily Budget */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Daily Budget:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "dailyBudget" ? cancelFieldEdit() : startFieldEdit("dailyBudget"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Daily Budget"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "dailyBudget" ? (
                      <div className="flex items-center gap-1 flex-1 max-w-[240px] justify-end">
                        <div className="relative flex-1">
                          <span className="absolute left-1.5 top-0.5 text-slate-400 text-[10px]">₹</span>
                          <input
                            type="number"
                            value={tempEditValues.dailyBudget ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempEditValues({ ...tempEditValues, dailyBudget: val });
                              if (val !== "") {
                                setFieldError(validateDailyBudget(val));
                              } else {
                                setFieldError(null);
                              }
                            }}
                            placeholder="1000"
                            className={`w-full bg-white border ${fieldError ? "border-rose-500 focus:ring-rose-500" : "border-blue-500"} rounded pl-4 pr-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none`}
                            autoFocus
                          />
                        </div>
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                          title="Save"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelFieldEdit}
                          className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-emerald-600">
                        {campaignState.dailyBudget && campaignState.dailyBudget > 0 ? (
                          `₹${campaignState.dailyBudget.toLocaleString()}/day ✓`
                        ) : (
                          <span className="text-slate-400 font-normal italic">Not set</span>
                        )}
                      </span>
                    )}
                  </div>
                  {editingField === "dailyBudget" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

                {/* Field 8: Location (Interactive 3 Options + Google Ads API Autocomplete) */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Location:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "locations" ? cancelFieldEdit() : startFieldEdit("locations"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Locations"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField !== "locations" && (
                      <span className="text-slate-800 font-medium truncate max-w-[200px] text-right">
                        {campaignState.locations && campaignState.locations.length > 0 ? campaignState.locations.join(", ") : "India"}
                      </span>
                    )}
                  </div>

                  {editingField === "locations" && (
                    <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                      <div className="space-y-1 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                          <input
                            type="radio"
                            name="cockpitLocationMode"
                            checked={locationMode === "ALL"}
                            onChange={() => {
                              setLocationMode("ALL");
                              setSelectedLocationsList(["All countries and territories"]);
                              setFieldError(null);
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>All countries and territories</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                          <input
                            type="radio"
                            name="cockpitLocationMode"
                            checked={locationMode === "INDIA"}
                            onChange={() => {
                              setLocationMode("INDIA");
                              setSelectedLocationsList(["India"]);
                              setFieldError(null);
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>India</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                          <input
                            type="radio"
                            name="cockpitLocationMode"
                            checked={locationMode === "CUSTOM"}
                            onChange={() => {
                              setLocationMode("CUSTOM");
                              if (selectedLocationsList.includes("India") || selectedLocationsList.includes("All countries and territories")) {
                                setSelectedLocationsList([]);
                              }
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>Enter another location</span>
                        </label>
                      </div>

                      {locationMode === "CUSTOM" && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                          {/* Selected Location Badges */}
                          {selectedLocationsList.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedLocationsList.map((loc) => (
                                <span
                                  key={loc}
                                  className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] flex items-center gap-1 font-medium"
                                >
                                  <span>{loc}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLocationsList(selectedLocationsList.filter(l => l !== loc))}
                                    className="hover:text-blue-900"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Location Search Input */}
                          <div className="relative">
                            <input
                              type="text"
                              value={locationSearchQuery}
                              onChange={(e) => {
                                setLocationSearchQuery(e.target.value);
                                setFieldError(null);
                              }}
                              placeholder="Search country, state, city..."
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                              autoFocus
                            />
                            {isSearchingLocation && (
                              <Loader2 className="h-3 w-3 text-blue-600 animate-spin absolute right-2 top-1.5" />
                            )}
                          </div>

                          {/* Suggestions / Results Dropdown */}
                          <div className="max-h-28 overflow-y-auto border border-slate-200 rounded bg-white divide-y divide-slate-100 text-[10px]">
                            {locationSearchResults.length > 0 ? (
                              locationSearchResults.map((item, idx) => {
                                const isSelected = selectedLocationsList.includes(item.canonicalName || item.name);
                                return (
                                  <button
                                    key={`${item.id || item.name}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      const locName = item.canonicalName || item.name;
                                      if (!isSelected) {
                                        setSelectedLocationsList([...selectedLocationsList, locName]);
                                      } else {
                                        setSelectedLocationsList(selectedLocationsList.filter(l => l !== locName));
                                      }
                                      setFieldError(null);
                                    }}
                                    className={`w-full text-left px-2 py-1 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                      isSelected ? "bg-blue-50/60 font-semibold text-blue-800" : "text-slate-700"
                                    }`}
                                  >
                                    <div className="truncate pr-2">
                                      <span>{item.canonicalName || item.name}</span>
                                      {item.targetType && (
                                        <span className="text-[9px] text-slate-400 ml-1">({item.targetType})</span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-blue-600 shrink-0">
                                      {isSelected ? "✓ Added" : "+ Target"}
                                    </span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-2 text-center text-slate-400">
                                No matching Google Ads locations found
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {fieldError && (
                        <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                          <span>{fieldError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={cancelFieldEdit}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="h-2.5 w-2.5" />
                          Save Location
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 9: Language (Multi-Select with Valid Google Ads Languages) */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Language:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "language" ? cancelFieldEdit() : startFieldEdit("language"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Language"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField !== "language" && (
                      <span className="text-slate-800 font-medium truncate max-w-[200px] text-right">
                        {campaignState.language || "English"}
                      </span>
                    )}
                  </div>

                  {editingField === "language" && (
                    <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                      {/* Selected Language Badges */}
                      <div className="flex flex-wrap gap-1">
                        {selectedLanguagesList.map((lang) => (
                          <span
                            key={lang}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] flex items-center gap-1 font-medium"
                          >
                            <span>{lang}</span>
                            {selectedLanguagesList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setSelectedLanguagesList(selectedLanguagesList.filter(l => l !== lang))}
                                className="hover:text-blue-900"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Language Filter Input */}
                      <input
                        type="text"
                        value={languageSearchQuery}
                        onChange={(e) => setLanguageSearchQuery(e.target.value)}
                        placeholder="Search Google Ads languages..."
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                        autoFocus
                      />

                      {/* Available Google Ads Languages List */}
                      <div className="max-h-28 overflow-y-auto border border-slate-200 rounded bg-white divide-y divide-slate-100 text-[10px]">
                        {GOOGLE_ADS_LANGUAGES
                          .filter(l => l.name.toLowerCase().includes(languageSearchQuery.toLowerCase()))
                          .map((lang) => {
                            const isSelected = selectedLanguagesList.includes(lang.name);
                            return (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    if (selectedLanguagesList.length > 1) {
                                      setSelectedLanguagesList(selectedLanguagesList.filter(l => l !== lang.name));
                                    }
                                  } else {
                                    setSelectedLanguagesList([...selectedLanguagesList, lang.name]);
                                  }
                                  setFieldError(null);
                                }}
                                className={`w-full text-left px-2 py-1 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                  isSelected ? "bg-blue-50/60 font-semibold text-blue-800" : "text-slate-700"
                                }`}
                              >
                                <span>{lang.name}</span>
                                <span className="text-[10px] text-blue-600 shrink-0">
                                  {isSelected ? "✓ Selected" : "+ Add"}
                                </span>
                              </button>
                            );
                          })}
                      </div>

                      {fieldError && (
                        <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                          <span>{fieldError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={cancelFieldEdit}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="h-2.5 w-2.5" />
                          Save Languages
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 10: Start Date */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Start Date:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "startDate" ? cancelFieldEdit() : startFieldEdit("startDate"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Start Date"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "startDate" ? (
                      <div className="flex items-center gap-1 flex-1 max-w-[240px] justify-end">
                        <input
                          type="date"
                          min={todayIso}
                          value={tempEditValues.startDate || todayIso}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempEditValues({ ...tempEditValues, startDate: val });
                            setFieldError(validateStartDate(val));
                          }}
                          className={`w-full bg-white border ${fieldError ? "border-rose-500" : "border-blue-500"} rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none`}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                          title="Save"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelFieldEdit}
                          className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-800 font-medium font-mono">{campaignState.startDate || todayIso}</span>
                    )}
                  </div>
                  {editingField === "startDate" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

                {/* Field 11: End Date */}
                <div className="py-1 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>End Date:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "endDate" ? cancelFieldEdit() : startFieldEdit("endDate"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit End Date"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "endDate" ? (
                      <div className="flex items-center gap-1 flex-1 max-w-[240px] justify-end">
                        <input
                          type="date"
                          min={tempEditValues.startDate || campaignState.startDate || todayIso}
                          value={tempEditValues.endDate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempEditValues({ ...tempEditValues, endDate: val });
                            const effectiveStart = tempEditValues.startDate || campaignState.startDate || todayIso;
                            setFieldError(validateEndDate(val, effectiveStart));
                          }}
                          className={`w-full bg-white border ${fieldError ? "border-rose-500" : "border-blue-500"} rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none`}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                          title="Save"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelFieldEdit}
                          className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-800 font-medium font-mono">{campaignState.endDate || "Not set"}</span>
                    )}
                  </div>
                  {editingField === "endDate" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 2. SEARCH ONLY: AI MAX SETTINGS CARD */}
            {campaignState.campaignType === "SEARCH" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">AI Max Controls (Search Only)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Search Optimization
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* AI Max Toggle */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800 block">AI Max</span>
                      <span className="text-[10px] text-slate-400">Enable Google AI Max smart asset assembly</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCampaignState(prev => ({ ...prev, aiMax: prev.aiMax !== undefined ? !prev.aiMax : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        campaignState.aiMax !== false ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>

                  {/* Text Customization Toggle */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800 block">Text Customization</span>
                      <span className="text-[10px] text-slate-400">Automatically customize ad copy from landing page</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCampaignState(prev => ({ ...prev, textCustomization: prev.textCustomization !== undefined ? !prev.textCustomization : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        campaignState.textCustomization !== false ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>

                  {/* Final URL Expansion Toggle */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800 block">Final URL Expansion</span>
                      <span className="text-[10px] text-slate-400">Allow Google to direct clicks to the most relevant landing page</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCampaignState(prev => ({ ...prev, finalUrlExpansion: prev.finalUrlExpansion !== undefined ? !prev.finalUrlExpansion : false }))}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        campaignState.finalUrlExpansion !== false ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2b. DEMAND GEN CONTROLS: AD FORMAT & CHANNEL TARGETING CARD */}
            {campaignState.campaignType === "DEMAND_GEN" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-xs text-slate-900">Demand Gen Controls</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Demand Gen Config
                  </span>
                </div>

                <div className="space-y-3 text-[11px]">
                  {/* Ad Format Selector */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Ad Format:</span>
                      <span className="text-[10px] text-purple-700 font-bold uppercase">
                        {(campaignState.adFormat || "SINGLE_IMAGE").replace("_", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["SINGLE_IMAGE", "VIDEO", "CAROUSEL"] as const).map((fmt) => {
                        const isSelected = (campaignState.adFormat || "SINGLE_IMAGE") === fmt;
                        const label = fmt === "SINGLE_IMAGE" ? "Single Image" : fmt === "VIDEO" ? "Video" : "Carousel";
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => {
                                const nextState = { ...prev, adFormat: fmt };
                                const dgFormat = fmt;
                                const isBudgetValid = nextState.dailyBudget && nextState.dailyBudget >= 416;
                                const hasLogo = (nextState.logos?.length || 0) >= 1;
                                const hasImages = (nextState.images?.length || 0) >= 1;
                                const hasVideos = (nextState.videos?.length || 0) >= 1;
                                const cards = nextState.carouselCards || [];
                                const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());
                                const hasHeadlines = (nextState.headlines?.length || 0) >= 1;
                                const hasLongHeadlines = (nextState.longHeadlines?.length || 0) >= 1;
                                const hasDescriptions = (nextState.descriptions?.length || 0) >= 1;
                                let isReady = false;
                                if (isBudgetValid && nextState.campaignName) {
                                  if (dgFormat === "VIDEO") {
                                    isReady = Boolean(hasVideos && hasLogo && hasHeadlines && hasLongHeadlines && hasDescriptions);
                                  } else if (dgFormat === "CAROUSEL") {
                                    isReady = Boolean(validCards.length >= 2 && hasLogo && hasHeadlines && hasDescriptions);
                                  } else {
                                    isReady = Boolean(hasImages && hasLogo && hasHeadlines && hasDescriptions);
                                  }
                                }
                                nextState.readyForPublish = isReady;
                                return nextState;
                              });
                            }}
                            className={`py-1 px-1.5 rounded-lg border text-center font-semibold text-[10px] transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Channel Targeting: ALL vs CHOOSE */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Channel Targeting:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCampaignState(prev => ({ ...prev, channelTargeting: "ALL" }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            (campaignState.channelTargeting || "ALL") === "ALL"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          ALL
                        </button>
                        <button
                          type="button"
                          onClick={() => setCampaignState(prev => ({
                            ...prev,
                            channelTargeting: "CHOOSE",
                            channels: prev.channels && prev.channels.length > 0 ? prev.channels : [
                              "YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"
                            ]
                          }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            campaignState.channelTargeting === "CHOOSE"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          CHOOSE
                        </button>
                      </div>
                    </div>

                    {campaignState.channelTargeting === "CHOOSE" && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Selected Ad Group Channels:</span>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          {[
                            "YouTube",
                            "YouTube in-stream",
                            "YouTube in-feed",
                            "YouTube Shorts",
                            "Discover",
                            "Gmail",
                            "Google Display Network",
                            "Maps New"
                          ].map((ch) => {
                            const curChannels = campaignState.channels || ["YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"];
                            const isChSelected = curChannels.includes(ch);
                            return (
                              <label key={ch} className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={isChSelected}
                                  onChange={(e) => {
                                    const nextCh = e.target.checked
                                      ? [...curChannels, ch]
                                      : curChannels.filter(c => c !== ch);
                                    setCampaignState(prev => ({ ...prev, channels: nextCh }));
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                                />
                                <span className="truncate">{ch}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2c. DEDICATED SHOPPING SETTINGS & READINESS CARD (When CampaignType = SHOPPING) */}
            {campaignState.campaignType === "SHOPPING" && (
              <div className="bg-slate-50 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs text-slate-900">Google Shopping Settings</span>
                  </div>
                  <span className={campaignState.readyForPublish ? "text-[10px] text-emerald-600 font-bold" : "text-[10px] text-amber-600 font-semibold"}>
                    {campaignState.readyForPublish ? "Publish Ready ✓" : "Required items missing"}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* Merchant Center ID */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Merchant Center ID:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "merchantCenterId" ? cancelFieldEdit() : startFieldEdit("merchantCenterId"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Merchant Center ID"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "merchantCenterId" ? (
                      <div className="flex items-center gap-1 max-w-[200px]">
                        <input
                          type="text"
                          value={tempEditValues.merchantCenterId || ""}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, merchantCenterId: e.target.value })}
                          placeholder="e.g. 5840531233"
                          className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={saveFieldEdit} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                          <Check className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={cancelFieldEdit} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-semibold text-slate-800">
                        {campaignState.merchantCenterId ? (
                          <span className="text-emerald-700 font-bold">✓ {campaignState.merchantCenterId}</span>
                        ) : (
                          <span className="text-rose-500 font-semibold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Required
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {editingField === "merchantCenterId" && fieldError && (
                    <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}

                  {/* Feed / Sales Country */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Sales Country:</span>
                    <span className="font-semibold text-slate-800">
                      {campaignState.salesCountry || "IN"} ({campaignState.feedLabel || campaignState.salesCountry || "IN"})
                    </span>
                  </div>

                  {/* Ad Group Name */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Ad Group Name:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "adGroupName" ? cancelFieldEdit() : startFieldEdit("adGroupName"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Ad Group Name"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "adGroupName" ? (
                      <div className="flex items-center gap-1 max-w-[200px]">
                        <input
                          type="text"
                          value={tempEditValues.adGroupName || ""}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, adGroupName: e.target.value })}
                          placeholder="Ad group 1"
                          className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={saveFieldEdit} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                          <Check className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={cancelFieldEdit} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {campaignState.adGroupName || "Ad group 1"}
                      </span>
                    )}
                  </div>

                  {/* Product Groups Targeting */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Product Groups:</span>
                    <span className="font-semibold text-slate-800">
                      {campaignState.productGroupFilter || "All products"}
                    </span>
                  </div>

                  {/* Local Products Inventory */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Local Products:</span>
                    <span className="text-[10px] font-semibold text-slate-700">
                      {campaignState.localProducts ? "Enabled" : "Disabled (Online only)"}
                    </span>
                  </div>
                </div>

                {/* Missing Merchant ID alert */}
                {!campaignState.merchantCenterId && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Merchant Center ID is required before this Shopping campaign can be published.</span>
                  </div>
                )}
              </div>
            )}

            {/* 2d. DEDICATED APP PROMOTION SETTINGS & READINESS CARD (When CampaignType = APP) */}
            {campaignState.campaignType === "APP" && (
              <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">App Promotion Settings</span>
                  </div>
                  <span className={campaignState.readyForPublish ? "text-[10px] text-emerald-600 font-bold" : "text-[10px] text-amber-600 font-semibold"}>
                    {campaignState.readyForPublish ? "Publish Ready ✓" : "Required items missing"}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* Platform Selection */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Platform:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCampaignState(prev => ({ ...prev, platform: "ANDROID", appStore: "GOOGLE_APP_STORE" }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                          campaignState.platform !== "IOS" ? "bg-indigo-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Android
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampaignState(prev => ({ ...prev, platform: "IOS", appStore: "APPLE_APP_STORE" }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                          campaignState.platform === "IOS" ? "bg-indigo-600 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        iOS
                      </button>
                    </div>
                  </div>

                  {/* App ID / Package Name */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>App ID / Package:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "appId" ? cancelFieldEdit() : startFieldEdit("appId"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit App Package Name / Bundle ID"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "appId" ? (
                      <div className="flex items-center gap-1 max-w-[200px]">
                        <input
                          type="text"
                          value={tempEditValues.appId || ""}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, appId: e.target.value })}
                          placeholder={campaignState.platform === "IOS" ? "e.g. 123456789 or bundle" : "e.g. com.example.app"}
                          className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={saveFieldEdit} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                          <Check className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={cancelFieldEdit} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono font-semibold text-slate-800 truncate max-w-[180px]">
                        {campaignState.appId ? (
                          <span className="text-emerald-700 font-bold">✓ {campaignState.appId}</span>
                        ) : (
                          <span className="text-rose-500 font-semibold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Required
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {editingField === "appId" && fieldError && (
                    <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}

                  {/* App Name if available */}
                  {campaignState.appName && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">App Name:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{campaignState.appName}</span>
                    </div>
                  )}

                  {/* Campaign Goal */}
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bidding Goal:</span>
                    <span className="font-semibold text-slate-800">
                      {campaignState.conversionGoals?.[0] === "engagement"
                        ? "In-app actions"
                        : campaignState.conversionGoals?.[0] === "preregistration"
                        ? "Pre-registration"
                        : "App installs"}
                    </span>
                  </div>

                  {/* Target CPA */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Target CPA:</span>
                    <span className="font-semibold text-slate-800">
                      {campaignState.targetCpa ? `₹${campaignState.targetCpa}` : (
                        <span className="text-rose-500 font-semibold">Required</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Missing App ID alert */}
                {!campaignState.appId && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Mobile App package name (Android) or bundle ID (iOS) is required before this campaign can be published.</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. DYNAMIC CAMPAIGN ASSETS & THUMBNAILS CARD (PMax & Optional Media) */}
            {campaignState.campaignType !== "SEARCH" && campaignState.campaignType !== "SHOPPING" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Campaign Creatives & Assets</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                </div>

                {/* Live Performance Max Asset Requirements Checklist when type is PERFORMANCE_MAX */}
                {campaignState.campaignType === "PERFORMANCE_MAX" && (() => {
                  const allImgs = campaignState.images || [];
                  const allLgs = campaignState.logos || [];
                  let hasLand = false;
                  let hasSq = false;
                  let hasLg = allLgs.length > 0;

                  for (const im of allImgs) {
                    const raw = typeof im === "string" ? im : im?.url || im?.data || "";
                    const fType = typeof im === "object" ? im?.fieldType : null;
                    if (fType === "MARKETING_IMAGE") hasLand = true;
                    else if (fType === "SQUARE_MARKETING_IMAGE") hasSq = true;
                    else if (fType === "LOGO") hasLg = true;
                    else if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
                      hasLand = true;
                      hasSq = true;
                    } else if (raw) {
                      hasLand = true;
                    }
                  }

                  return (
                    <div className="p-2.5 rounded-xl bg-white border border-purple-200/80 shadow-2xs space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1 text-purple-700">
                          <Sparkles className="h-3 w-3" />
                          Performance Max Asset Readiness
                        </span>
                        <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                          {campaignState.readyForPublish ? "Ready to Publish ✓" : "Required items missing"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-600">
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Landscape (1.91:1):</span>
                          <span className={hasLand ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {hasLand ? "✓ Uploaded" : "Missing"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Square (1:1):</span>
                          <span className={hasSq ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {hasSq ? "✓ Uploaded" : "Missing"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Logo (1:1):</span>
                          <span className={hasLg ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {hasLg ? "✓ Uploaded" : "Missing"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Headlines:</span>
                          <span className={(campaignState.headlines?.length || 0) >= 3 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.headlines?.length || 0}/5 (min 3)
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Long Headlines:</span>
                          <span className={(campaignState.longHeadlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.longHeadlines?.length || 0}/5 (min 1)
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Descriptions:</span>
                          <span className={(campaignState.descriptions?.length || 0) >= 2 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.descriptions?.length || 0}/5 (min 2)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Display Asset Requirements Checklist when type is DISPLAY */}
                {campaignState.campaignType === "DISPLAY" && (
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-blue-700">
                        <ImageIcon className="h-3 w-3" />
                        Display Responsive Ad Readiness
                      </span>
                      <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                        {campaignState.readyForPublish ? "Complete ✓" : "Required items missing"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Marketing Images (1.91:1):</span>
                        <span className={(campaignState.images?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.images?.length || 0) > 0 ? "✓ Uploaded" : "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Logo (1:1):</span>
                        <span className={(campaignState.logos?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.logos?.length || 0) > 0 ? "✓ Uploaded" : "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Headlines:</span>
                        <span className={(campaignState.headlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.headlines?.length || 0}/5 (min 1)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Long Headline:</span>
                        <span className={((campaignState.longHeadlines?.length || 0) >= 1 || (campaignState.headlines?.length || 0) >= 1) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.longHeadlines?.length || 0) >= 1 ? `✓ ${campaignState.longHeadlines?.length}` : "Auto/1"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Descriptions:</span>
                        <span className={(campaignState.descriptions?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.descriptions?.length || 0}/5 (min 1)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Video Asset Requirements Checklist when type is VIDEO */}
                {campaignState.campaignType === "VIDEO" && (
                  <div className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-blue-700">
                        <Video className="h-3 w-3 text-red-500" />
                        Video Ad Readiness ({(campaignState.adFormat || "SINGLE_IMAGE").replace("_", " ")})
                      </span>
                      <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                        {campaignState.readyForPublish ? "Complete ✓" : "Required items missing"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      {(campaignState.adFormat || "SINGLE_IMAGE") === "SINGLE_IMAGE" && (
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Marketing Images:</span>
                          <span className={(campaignState.images?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {(campaignState.images?.length || 0) > 0 ? "✓ Attached" : "Missing"}
                          </span>
                        </div>
                      )}
                      {(campaignState.adFormat || "SINGLE_IMAGE") === "VIDEO" && (
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>YouTube Video:</span>
                          <span className={(campaignState.videos?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {(campaignState.videos?.length || 0) > 0 ? "✓ Attached" : "Missing"}
                          </span>
                        </div>
                      )}
                      {(campaignState.adFormat || "SINGLE_IMAGE") === "CAROUSEL" && (
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Carousel Cards:</span>
                          <span className={(campaignState.carouselCards?.filter(c => c && c.image?.trim() && c.headline?.trim()).length || 0) >= 2 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.carouselCards?.filter(c => c && c.image?.trim() && c.headline?.trim()).length || 0}/2 (min 2)
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Logo (1:1):</span>
                        <span className={(campaignState.logos?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.logos?.length || 0) > 0 ? "✓ Uploaded" : "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Headlines:</span>
                        <span className={(campaignState.headlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.headlines?.length || 0}/5 (min 1)
                        </span>
                      </div>
                      {(campaignState.adFormat || "SINGLE_IMAGE") === "VIDEO" ? (
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Long Headline:</span>
                          <span className={(campaignState.longHeadlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {(campaignState.longHeadlines?.length || 0) >= 1 ? `✓ ${campaignState.longHeadlines?.length}` : "Missing"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Descriptions:</span>
                          <span className={(campaignState.descriptions?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.descriptions?.length || 0}/5 (min 1)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {allAssetsCount === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-3 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-[11px] font-semibold text-slate-700">No media attached yet</p>
                    <p className="text-[10px] text-slate-400">Click to upload landscape (1.91:1), square (1:1), or logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Images Preview Grid */}
                    {campaignState.images && campaignState.images.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Marketing Images:</span>
                        <div className="grid grid-cols-2 gap-2">
                          {campaignState.images.map((img, idx) => {
                            const url = typeof img === "string" ? img : img?.url || "";
                            const name = typeof img === "object" ? img?.name : `Image ${idx + 1}`;
                            return (
                              <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                                {url ? (
                                  <img src={url} alt={name || "Creative"} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-slate-400" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                                  <span className="text-[9px] text-white truncate font-medium">{name}</span>
                                </div>
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-mono">
                                  1.91:1 / 1:1
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Logos Preview */}
                    {campaignState.logos && campaignState.logos.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Logos:</span>
                        <div className="flex flex-wrap gap-2">
                          {campaignState.logos.map((logo, idx) => {
                            const url = typeof logo === "string" ? logo : logo?.url || "";
                            return (
                              <div key={idx} className="relative w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden">
                                {url ? <img src={url} alt="Logo" className="max-w-full max-h-full object-contain" /> : <ImageIcon className="h-3 w-3 text-slate-400" />}
                                <span className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white text-[7px] font-bold px-1 rounded">1:1</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Videos Preview */}
                    {campaignState.videos && campaignState.videos.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-200">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Videos:</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                          <Video className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="truncate">
                            {typeof campaignState.videos[0] === "string" 
                              ? campaignState.videos[0] 
                              : campaignState.videos[0]?.name || "Attached video asset"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. SEARCH KEYWORDS MANAGER (Dedicated Card for Search Campaigns) */}
            {campaignState.campaignType === "SEARCH" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Search Keywords</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    (campaignState.keywords?.length || 0) >= 1
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {campaignState.keywords?.length || 0} Keywords (Min 1)
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Keyword Input with Match Type Hints */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const kw = newKeywordInput.trim();
                      if (!kw) return;
                      if (!(campaignState.keywords || []).includes(kw)) {
                        setCampaignState(prev => {
                          const updatedKw = [...(prev.keywords || []), kw];
                          const validHeadlines = (prev.headlines || []).filter(h => h && h.trim().length > 0);
                          const validDescriptions = (prev.descriptions || []).filter(d => d && d.trim().length > 0);
                          const hasBudget = prev.dailyBudget && prev.dailyBudget > 0;
                          return {
                            ...prev,
                            keywords: updatedKw,
                            readyForPublish: !!(hasBudget && prev.campaignName && updatedKw.length >= 1 && validHeadlines.length >= 3 && validDescriptions.length >= 2)
                          };
                        });
                      }
                      setNewKeywordInput("");
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      placeholder='Add keyword, e.g. "crm software" or [lead tracking]'
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={!newKeywordInput.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Keywords Badges List */}
                  {campaignState.keywords && campaignState.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl">
                      {campaignState.keywords.map((kw, idx) => {
                        const isExact = kw.startsWith("[") && kw.endsWith("]");
                        const isPhrase = kw.startsWith('"') && kw.endsWith('"');
                        const matchTypeLabel = isExact ? "EXACT" : isPhrase ? "PHRASE" : "BROAD";
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium flex items-center gap-1 shadow-2xs ${
                              isExact
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : isPhrase
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <span className="font-semibold text-[8px] opacity-75">{matchTypeLabel}:</span>
                            <span>{kw}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCampaignState(prev => {
                                  const updatedKw = (prev.keywords || []).filter((_, i) => i !== idx);
                                  const validHeadlines = (prev.headlines || []).filter(h => h && h.trim().length > 0);
                                  const validDescriptions = (prev.descriptions || []).filter(d => d && d.trim().length > 0);
                                  const hasBudget = prev.dailyBudget && prev.dailyBudget > 0;
                                  return {
                                    ...prev,
                                    keywords: updatedKw,
                                    readyForPublish: !!(hasBudget && prev.campaignName && updatedKw.length >= 1 && validHeadlines.length >= 3 && validDescriptions.length >= 2)
                                  };
                                });
                              }}
                              className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                              title="Remove Keyword"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-[11px]">
                      No keywords configured yet. Enter a keyword above or provide a website URL for AI extraction.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. GENERATED AD COPY CARD */}
            {(campaignState.headlines && campaignState.headlines.length > 0) || (campaignState.descriptions && campaignState.descriptions.length > 0) ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Generated Ad Copy</span>
                  <span className="text-[10px] text-slate-500">
                    {campaignState.headlines?.length || 0} Headlines • {campaignState.descriptions?.length || 0} Descriptions
                  </span>
                </div>

                {campaignState.headlines && campaignState.headlines.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Headlines (Max 30 chars):</span>
                      <span className={`text-[10px] font-bold ${
                        (campaignState.headlines?.length || 0) >= 3 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {campaignState.headlines?.length || 0} (min 3)
                      </span>
                    </div>
                    <div className="space-y-1">
                      {campaignState.headlines.slice(0, 5).map((hl, idx) => (
                        <div key={idx} className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 truncate shadow-2xs flex justify-between items-center">
                          <span className="truncate">{hl}</span>
                          <span className={`text-[9px] font-mono shrink-0 ml-1 ${hl.length > 30 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                            {hl.length}/30
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {campaignState.descriptions && campaignState.descriptions.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Descriptions (Max 90 chars):</span>
                      <span className={`text-[10px] font-bold ${
                        (campaignState.descriptions?.length || 0) >= 2 ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {campaignState.descriptions?.length || 0} (min 2)
                      </span>
                    </div>
                    <div className="space-y-1">
                      {campaignState.descriptions.slice(0, 3).map((desc, idx) => (
                        <div key={idx} className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 shadow-2xs">
                          <p className="line-clamp-2">{desc}</p>
                          <span className={`text-[9px] font-mono block text-right mt-0.5 ${desc.length > 90 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                            {desc.length}/90
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Launch Action Footer inside Cockpit (Fixed / Sticky at bottom) */}
          <div className="p-5 pt-3 border-t border-slate-200 bg-white shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Direct Action:</span>
              <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-medium"}>
                {campaignState.readyForPublish ? "Ready to deploy" : "Gathering required info"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (editingField) {
                    saveFieldEdit();
                  } else {
                    startFieldEdit("businessName");
                  }
                }}
                className={`px-2.5 py-2 text-[11px] font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  editingField
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
                    : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                }`}
                title={editingField ? "Save current inline edit" : "Edit fields inline"}
              >
                {editingField ? <Check className="h-3 w-3 text-emerald-600" /> : <Edit3 className="h-3 w-3" />}
                <span className="truncate">{editingField ? "Done" : "Inline Edit"}</span>
              </button>

              <button
                type="button"
                onClick={handleEditDetailsInForm}
                className="px-2.5 py-2 text-[11px] font-semibold rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                title="Open comprehensive Performance Max edit form"
              >
                <SlidersHorizontal className="h-3 w-3 text-purple-600" />
                <span className="truncate">Edit Form</span>
              </button>

              <button
                type="button"
                onClick={handleCreateCampaign}
                disabled={!campaignState.readyForPublish || isPublishing}
                className={`px-2.5 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  campaignState.readyForPublish
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                }`}
                title={campaignState.readyForPublish ? "Launch campaign to Google Ads" : "Complete required fields & assets to launch"}
              >
                {isPublishing ? <Loader2 className="h-3 w-3 animate-spin"/> : <Target className="h-3 w-3"/>}
                <span className="truncate">Launch</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
