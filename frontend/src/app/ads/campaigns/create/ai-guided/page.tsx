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
  AlertTriangle,
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
  UploadCloud,
  Calendar,
  Layers,
  Image as ImageIcon,
  Check,
  MessageSquare,
  SlidersHorizontal,
  Plus,
  Key,
  Star,
  ExternalLink,
  Play,
  Mail,
  Navigation,
  Compass,
  Eye,
  Info,
  Trash2,
  Monitor,
  AtSign,
  Bookmark,
  History,
  Clock,
  ChevronRight,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Scissors,
  Move,
  Wand2,
  ChevronDown,
  Settings2,
  Paperclip,
  FolderArchive,
  FolderOpen,
  Save,
  Bot,
  Cpu,
  BrainCircuit,
  Sparkle,
  ChevronUp,
  Link2,
  Link
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
  [x: string]: any;
  business?: BusinessContext;
  desiredOutcome?: string;
  objective?: string;
  conversionGoals?: string[];
  campaignType?: "SEARCH" | "PERFORMANCE_MAX" | "DISPLAY" | "VIDEO" | "DEMAND_GEN" | "SHOPPING" | "APP" | "";
  recommendationReason?: string;
  campaignName?: string;
  businessName?: string;
  website?: string;
  budgetType?: "DAILY" | "TOTAL" | string;
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
  images?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string; aspectRatio?: string; dimensions?: { width: number; height: number } }>;
  logos?: Array<string | { url?: string; data?: string; fieldType?: string; name?: string; aspectRatio?: string; dimensions?: { width: number; height: number } }>;
  videos?: Array<string | { url?: string; data?: string; name?: string; aspectRatio?: string; dimensions?: { width: number; height: number } }>;
  appId?: string;
  appName?: string;
  platform?: "ANDROID" | "IOS";
  appStore?: "GOOGLE_APP_STORE" | "APPLE_APP_STORE";
  // Shopping specific settings
  merchantCenterId?: string;
  merchantId?: string;
  salesCountry?: string;
  feedLabel?: string;
  adGroupName?: string;
  adGroupBid?: number | string | null;
  assetGroupName?: string;
  brandGuidelinesEnabled?: boolean;
  customerAcquisitionMode?: string;
  campaignPriority?: string;
  localProducts?: boolean;
  enableLocalProducts?: boolean;
  productGroupFilter?: string;
  productGroupSelectBy?: string;
  trackingTemplate?: string;
  finalUrlSuffix?: string;
  customParameters?: Array<{ id?: string; name: string; value: string }>;
  displayPath1?: string;
  displayPath2?: string;
  mobileFinalUrl?: string;
  searchThemes?: string[];
  audienceSignals?: any[];
  adSchedule?: Array<{ day: string; start: string; end: string }>;
  devices?: { computers: boolean; mobile: boolean; tablets: boolean; tv: boolean };
  demographicExclusions?: { ages?: string[]; genders?: string[] };
  dataExclusions?: string[];
  callPhoneNumber?: string;
  euPolitical?: "YES" | "NO";
  networkSearch?: boolean;
  networkDisplay?: boolean;
  locationOptionsPresence?: string;
  locationOptionsExclude?: string;
  adRotationMode?: string;
  onlyBidNewCustomers?: boolean;
  adjustLapsedCustomers?: boolean;
  useSearchTermMatchingAdGroup?: boolean;
  includeViewThrough?: boolean;
  mainBrandColor?: string;
  accentBrandColor?: string;
  brandFont?: string;
  optAdaptiveLayouts?: boolean;
  optAnimatedImages?: boolean;
  optGeneratedVideos?: boolean;
  optShorterVideos?: boolean;
  optResizedVideos?: boolean;
  optLandingPagePreviews?: boolean;
  adName?: string;
  sitelinks?: Array<{
    text: string;
    desc1?: string;
    desc2?: string;
    finalUrl?: string;
    url?: string;
    mobileFinalUrl?: string;
    trackingTemplate?: string;
    finalUrlSuffix?: string;
    customParameters?: Array<{ name: string; value: string }>;
    schedules?: Array<{ day: string; startHour: number; startMin: number; endHour: number; endMin: number }>;
    startDate?: string;
    endDate?: string;
  }>;
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
  callouts?: string[];
  structuredSnippets?: Array<{
    header: string;
    values: string[];
  }>;
  messages?: Array<{
    platform: "WhatsApp" | "Messenger" | "Zalo" | string;
    customUrlName?: string;
    starterMessage?: string;
    callToAction?: string;
    ctaDescription?: string;
  }>;
  valueRules?: {
    type?: string;
    conditionValue?: string;
    operation?: "MULTIPLY" | "ADD";
    value?: number;
  };
  thirdPartyMeasurement?: {
    vendor?: string;
    accountId?: string;
  };
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
  { id: "ALL", name: "All languages", code: "all" },
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
    if (!updated.locations || updated.locations.length === 0) {
      updated.locations = ["India"];
    }
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

  if (!updated.locations || !Array.isArray(updated.locations) || updated.locations.filter(Boolean).length === 0) {
    updated.locations = ["India"];
  }
  if (!updated.language || !updated.language.trim()) {
    updated.language = "All languages";
  }

  return updated;
};

interface GeneratedCreativeItem {
  url: string;
  name: string;
  fieldType?: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "LOGO" | "VIDEO";
  aspectRatio?: string;
  dimensions?: { width: number; height: number };
  prompt?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  campaignState?: CampaignState;
  proposedCampaignState?: CampaignState;
  isApplied?: boolean;
  isDismissed?: boolean;
  generatedImages?: GeneratedCreativeItem[];
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
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);
  const [showMissingParamsModal, setShowMissingParamsModal] = useState<boolean>(false);

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
    language: "All languages",
    startDate: undefined,
    endDate: undefined,
    demographicExclusions: {
      ages: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
      genders: ["Female", "Male"]
    },
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
  const [locationMode, setLocationMode] = useState<"ALL" | "INDIA" | "CUSTOM">("CUSTOM");
  const [locationTab, setLocationTab] = useState<"LOCATION" | "RADIUS">("LOCATION");
  const [radiusValue, setRadiusValue] = useState<number>(20);
  const [radiusUnit, setRadiusUnit] = useState<"km" | "mi">("km");
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>("");
  const [locationSearchResults, setLocationSearchResults] = useState<Array<{ id?: string; name: string; canonicalName: string; targetType?: string; placeId?: string; lat?: number; lng?: number }>>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [selectedLocationsList, setSelectedLocationsList] = useState<string[]>(["India"]);

  // Language multi-selection in Cockpit
  const [selectedLanguagesList, setSelectedLanguagesList] = useState<string[]>(["All languages"]);
  const [languageSearchQuery, setLanguageSearchQuery] = useState<string>("");

  // Existing Campaigns for @ Mention / Reference Context & History / Draft Picker Modal
  const [existingCampaignsList, setExistingCampaignsList] = useState<Array<any>>([]);
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState<boolean>(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isDraftPickerModalOpen, setIsDraftPickerModalOpen] = useState<boolean>(false);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState<string>("");
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState<boolean>(false);
  const [referencedCampaign, setReferencedCampaign] = useState<any | null>(null);

  // AI Suggestions Review Modal Popup State (For Grok AI recommendations)
  const [isAiSuggestionsModalOpen, setIsAiSuggestionsModalOpen] = useState<boolean>(false);
  const [pendingAiSuggestions, setPendingAiSuggestions] = useState<{
    proposedState: CampaignState;
    messageId?: string;
    aiExplanation?: string;
    suggestedHeadlines?: string[];
    suggestedDescriptions?: string[];
    suggestedLongHeadlines?: string[];
    suggestedKeywords?: string[];
    suggestedBudget?: number | null;
    suggestedLocations?: string[];
    suggestedType?: string;
    suggestedObjective?: string;
    suggestedBidding?: string;
  } | null>(null);

  // Antigravity-style Floating Notification Message Banner for AI Suggestions
  const [aiNotificationBanner, setAiNotificationBanner] = useState<{
    title: string;
    summary: string;
    suggestionsData: {
      proposedState: CampaignState;
      messageId?: string;
      aiExplanation?: string;
      suggestedHeadlines?: string[];
      suggestedDescriptions?: string[];
      suggestedLongHeadlines?: string[];
      suggestedKeywords?: string[];
      suggestedBudget?: number | null;
      suggestedLocations?: string[];
      suggestedType?: string;
      suggestedObjective?: string;
      suggestedBidding?: string;
    };
  } | null>(null);

  // New Ad Copy Add Inputs in Cockpit
  const [newHeadlineInput, setNewHeadlineInput] = useState<string>("");
  const [isAddingHeadline, setIsAddingHeadline] = useState<boolean>(false);
  const [newLongHeadlineInput, setNewLongHeadlineInput] = useState<string>("");
  const [isAddingLongHeadline, setIsAddingLongHeadline] = useState<boolean>(false);
  const [newDescriptionInput, setNewDescriptionInput] = useState<string>("");
  const [isAddingDescription, setIsAddingDescription] = useState<boolean>(false);
  const [newSearchThemeInput, setNewSearchThemeInput] = useState<string>("");
  const [isAddingSearchTheme, setIsAddingSearchTheme] = useState<boolean>(false);

  // Sitelink Modal & Form States (100% Parity with Manual Flow)
  const [isSitelinkModalOpen, setIsSitelinkModalOpen] = useState<boolean>(false);
  const [editingSitelinkIndex, setEditingSitelinkIndex] = useState<number | null>(null);
  const [sitelinkText, setSitelinkText] = useState<string>("");
  const [sitelinkDesc1, setSitelinkDesc1] = useState<string>("");
  const [sitelinkDesc2, setSitelinkDesc2] = useState<string>("");
  const [sitelinkUrl, setSitelinkUrl] = useState<string>("");
  const [showSitelinkUrlOptions, setShowSitelinkUrlOptions] = useState<boolean>(false);
  const [showSitelinkAdvancedOptions, setShowSitelinkAdvancedOptions] = useState<boolean>(false);
  const [sitelinkMobileUrl, setSitelinkMobileUrl] = useState<string>("");
  const [useSitelinkMobileUrl, setUseSitelinkMobileUrl] = useState<boolean>(false);
  const [sitelinkTracking, setSitelinkTracking] = useState<string>("");
  const [sitelinkSuffix, setSitelinkSuffix] = useState<string>("");
  const [sitelinkCustomParams, setSitelinkCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([]);
  const [sitelinkSchedules, setSitelinkSchedules] = useState<Array<{ id: string; day: string; start: string; end: string; startDate: string; endDate: string }>>([]);

  // Merchant Center Conditional Flow State
  const [hasMerchantCenterAccount, setHasMerchantCenterAccount] = useState<boolean | null>(null);

  // More Asset Types Modals & Forms State (100% Parity with Manual Sales Performance Max)
  const [activeAssetModal, setActiveAssetModal] = useState<"PROMOTIONS" | "PRICES" | "APPS" | "SNIPPETS" | "LEAD_FORMS" | "BRAND_GUIDELINES" | null>(null);

  // Promotions State
  const [promoOccasion, setPromoOccasion] = useState<string>("None");
  const [promoLanguage, setPromoLanguage] = useState<string>("English");
  const [promoCurrency, setPromoCurrency] = useState<string>("INR");
  const [promoType, setPromoType] = useState<string>("Monetary discount");
  const [promoAmountValue, setPromoAmountValue] = useState<string>("");
  const [promoDetailsType, setPromoDetailsType] = useState<string>("None");
  const [promoDetailsValue, setPromoDetailsValue] = useState<string>("");
  const [promoItem, setPromoItem] = useState<string>("");
  const [promoFinalUrl, setPromoFinalUrl] = useState<string>("");
  const [promoStartDate, setPromoStartDate] = useState<string>("");
  const [promoEndDate, setPromoEndDate] = useState<string>("");
  const [promoTrackingTemplate, setPromoTrackingTemplate] = useState<string>("");
  const [promoFinalUrlSuffix, setPromoFinalUrlSuffix] = useState<string>("");
  const [promoCustomParams, setPromoCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([{ id: "pcp-1", name: "", value: "" }]);

  // Prices State
  const [priceLanguage, setPriceLanguage] = useState<string>("English");
  const [priceType, setPriceType] = useState<string>("Brands");
  const [priceCurrency, setPriceCurrency] = useState<string>("INR");
  const [priceQualifier, setPriceQualifier] = useState<string>("No qualifier");
  const [priceItems, setPriceItems] = useState<Array<{ id: string; header: string; amount: string; unit: string; description: string; finalUrl: string; mobileFinalUrl: string }>>([
    { id: "pi-1", header: "", amount: "", unit: "No units", description: "", finalUrl: "", mobileFinalUrl: "" },
    { id: "pi-2", header: "", amount: "", unit: "No units", description: "", finalUrl: "", mobileFinalUrl: "" },
    { id: "pi-3", header: "", amount: "", unit: "No units", description: "", finalUrl: "", mobileFinalUrl: "" }
  ]);
  const [priceTrackingTemplate, setPriceTrackingTemplate] = useState<string>("");
  const [priceFinalUrlSuffix, setPriceFinalUrlSuffix] = useState<string>("");
  const [priceCustomParams, setPriceCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([{ id: "pcp-1", name: "", value: "" }]);

  // Messages State
  const [msgPlatform, setMsgPlatform] = useState<"WhatsApp" | "Messenger" | "Zalo">("WhatsApp");
  const [msgCustomUrlName, setMsgCustomUrlName] = useState<string>("");
  const [msgStarterMessage, setMsgStarterMessage] = useState<string>("Can I get started with a delivery?");
  const [msgCallToAction, setMsgCallToAction] = useState<string>("Get started");
  const [msgCtaDescription, setMsgCtaDescription] = useState<string>("");

  // Structured Snippets State
  const [snippetLanguage, setSnippetLanguage] = useState<string>("English");
  const [snippetHeaderType, setSnippetHeaderType] = useState<string>("Amenities");
  const [snippetValues, setSnippetValues] = useState<string[]>(["", "", ""]);

  // Lead Forms State
  const [lfHeadline, setLfHeadline] = useState<string>("");
  const [lfBusinessName, setLfBusinessName] = useState<string>("");
  const [lfDescription, setLfDescription] = useState<string>("");
  const [lfNameFormat, setLfNameFormat] = useState<"FULL_NAME" | "FIRST_LAST_NAME">("FULL_NAME");
  const [lfContactFields, setLfContactFields] = useState<{ [key: string]: boolean }>({
    Name: true,
    Email: true,
    "Phone number": true,
    Country: true,
    City: true,
    "Zip/Postal code": true,
    "State/Province": true,
    "Street address": true
  });
  const [lfWorkFields, setLfWorkFields] = useState<{ [key: string]: boolean }>({
    "Company name": true,
    "Work email": true,
    "Work phone number": true,
    "Job title": true
  });
  const [lfAgeQuestion, setLfAgeQuestion] = useState<boolean>(false);
  const [lfAgeYears, setLfAgeYears] = useState<string>("18");
  const [lfPrivacyPolicyUrl, setLfPrivacyPolicyUrl] = useState<string>("");
  const [lfSubHeadline, setLfSubHeadline] = useState<string>("Thank you.");
  const [lfSubDescription, setLfSubDescription] = useState<string>("We'll contact you soon.");
  const [lfSubCta, setLfSubCta] = useState<string>("Visit site");
  const [lfSubCtaUrl, setLfSubCtaUrl] = useState<string>("");
  const [lfAdCta, setLfAdCta] = useState<string>("Learn more");
  const [lfAdCtaDescription, setLfAdCtaDescription] = useState<string>("");
  const [lfWebhookUrl, setLfWebhookUrl] = useState<string>("");
  const [lfWebhookKey, setLfWebhookKey] = useState<string>("");
  const [lfNotificationEmails, setLfNotificationEmails] = useState<string>("");
  const [lfFormType, setLfFormType] = useState<"MORE_VOLUME" | "MORE_QUALIFIED">("MORE_VOLUME");

  // Callouts State
  const [modalCalloutTexts, setModalCalloutTexts] = useState<string[]>([]);
  const [newCalloutInput, setNewCalloutInput] = useState<string>("");
  const [calloutStartDateType, setCalloutStartDateType] = useState<"none" | "date">("none");
  const [calloutStartDateValue, setCalloutStartDateValue] = useState<string>("");
  const [calloutEndDateType, setCalloutEndDateType] = useState<"none" | "date">("none");
  const [calloutEndDateValue, setCalloutEndDateValue] = useState<string>("");
  const [calloutSchedules, setCalloutSchedules] = useState<Array<{ id: string; day: string; start: string; end: string }>>([
    { id: "cos-1", day: "All days", start: "00:00", end: "23:45" }
  ]);

  // Optional Parameters Accordion Toggle in Cockpit
  const [showOptionalParams, setShowOptionalParams] = useState<boolean>(false);

  // Performance Max More Campaign Settings State
  const [showPMaxMoreSettings, setShowPMaxMoreSettings] = useState<boolean>(false);

  // Desktop Split Panel Resize State
  const [cockpitWidth, setCockpitWidth] = useState<number>(440);
  const [isResizingCockpit, setIsResizingCockpit] = useState<boolean>(false);

  useEffect(() => {
    if (!isResizingCockpit) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Cockpit is anchored to the right side: width = total window width - mouse X position
      const minW = 320;
      const maxW = Math.max(minW, Math.min(850, window.innerWidth - 360));
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, minW), maxW);
      setCockpitWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingCockpit(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingCockpit]);
  const [activePMaxMoreSetting, setActivePMaxMoreSetting] = useState<string | null>(null);
  const [pmaxBrandInput, setPmaxBrandInput] = useState<string>("");
  const [pmaxDataExclusionInput, setPmaxDataExclusionInput] = useState<string>("");
  const [pmaxAgeExclusionsEnabled, setPmaxAgeExclusionsEnabled] = useState<boolean>(false);
  const [pmaxGenderExclusionsEnabled, setPmaxGenderExclusionsEnabled] = useState<boolean>(false);

  const pmaxTimeOptions = [
    "00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45",
    "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45",
    "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45",
    "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45",
    "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45",
    "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45",
    "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45",
    "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45",
    "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45", "24:00"
  ];

  const pmaxDayOptions = [
    "All days", "Mondays - Fridays", "Saturdays - Sundays",
    "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"
  ];

  // Cockpit Direct AI Generation Animation State
  const [cockpitGeneratingTarget, setCockpitGeneratingTarget] = useState<string | null>(null);

  // User Profile & CRM Login Context
  const [userProfile, setUserProfile] = useState<{
    userName?: string;
    businessName?: string;
    organizationName?: string;
    locationName?: string;
    accountName?: string;
    customerId?: string;
    currencyCode?: string;
  } | null>(null);

  // Fetch Logged-in User Profile & Auto-fill Campaign Cockpit + Chat Welcome Message
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
        const cid = customerId || "6587355041";
        const storedUserName = typeof window !== "undefined" ? (localStorage.getItem("user_name") || localStorage.getItem("userName") || "") : "";
        const storedOrgName = typeof window !== "undefined" ? (localStorage.getItem("org_name") || localStorage.getItem("organizationName") || "") : "";

        const res = await fetch(`${BACKEND}/api/ads/ai-guided/user-profile?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}`, {
          headers: {
            "x-organization-id": orgId
          }
        });

        let profileData: any = {};
        if (res.ok) {
          profileData = await res.json();
        }

        const resolvedUserName = profileData.userName || storedUserName || "Marketer";
        const resolvedBizName = profileData.businessName || profileData.accountName || storedOrgName || profileData.organizationName || "";
        const resolvedOrgName = profileData.organizationName || storedOrgName || "";
        const resolvedLocation = profileData.locationName || "India";

        setUserProfile({
          userName: resolvedUserName,
          businessName: resolvedBizName,
          organizationName: resolvedOrgName,
          locationName: resolvedLocation,
          accountName: profileData.accountName || "",
          customerId: profileData.customerId || cid,
          currencyCode: profileData.currencyCode || "INR"
        });

        // Pre-fill Right Side Campaign Cockpit with login details if fields are empty
        setCampaignState(prev => {
          const finalBiz = prev.businessName || resolvedBizName || "";
          const defaultCampaignName = prev.campaignName
            ? prev.campaignName
            : (finalBiz ? generateCampaignName(finalBiz, prev.campaignType) : "");

          return {
            ...prev,
            businessName: finalBiz,
            campaignName: defaultCampaignName,
            business: {
              ...(prev.business || {}),
              name: prev.business?.name || finalBiz,
              description: prev.business?.description || ""
            },
            locations: (prev.locations && prev.locations.length > 0 && prev.locations[0] !== "") 
              ? prev.locations 
              : (resolvedLocation ? [resolvedLocation] : ["India"])
          };
        });

        // Update Initial AI Welcome Message with personalized user & company greeting
        const welcomeBizText = resolvedBizName || resolvedOrgName;
        const greetingContent = `Hi ${resolvedUserName}! 👋 Welcome to your Google Ads AI Copilot${welcomeBizText ? ` for **${welcomeBizText}**` : ""}.\n\n` +
          `I've loaded your connected Google Ads account (${cid ? `ID: \`${cid}\`` : "Active Account"}) and business details.\n\n` +
          `Tell me about what you'd like to promote today, or choose a starting point below:`;

        const welcomeMessage: Message = {
          id: "msg-initial",
          role: "assistant",
          content: greetingContent,
          suggestions: [
            resolvedBizName ? `Generate complete campaign for ${resolvedBizName}` : "I want more leads & phone calls",
            "I want to sell products online",
            "I have a website URL to analyze",
            "What campaign type do you recommend?"
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessages(prev => {
          if (prev.length === 0 || (prev.length === 1 && prev[0].id === "msg-initial")) {
            return [welcomeMessage];
          }
          return prev;
        });
        // Also load Google Places/Maps API key config for Map render
        try {
          const cfgRes = await fetch(`${BACKEND}/api/ads/places/config`);
          if (cfgRes.ok) {
            const cfgData = await cfgRes.json();
            if (cfgData.apiKey) {
              setGoogleMapsApiKey(cfgData.apiKey);
            }
          }
        } catch (mErr) {
          console.warn("[AI-GUIDED] Failed to load places config:", mErr);
        }
      } catch (e) {
        console.warn("[AI-GUIDED] Error loading user profile:", e);
      }
    };

    fetchUserProfile();
  }, [customerId]);

  // Saved Drafts List specifically for "Edit from Old Draft" (Strictly status === "DRAFT")
  const [draftsList, setDraftsList] = useState<Array<any>>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [draftSaveSuccess, setDraftSaveSuccess] = useState<string | null>(null);

  // Unsaved Changes & Exit Dialog State
  const [isExitPromptOpen, setIsExitPromptOpen] = useState<boolean>(false);
  const [pendingExitAction, setPendingExitAction] = useState<"back" | "new_session" | null>(null);
  const [isSaveDraftConfirmOpen, setIsSaveDraftConfirmOpen] = useState<boolean>(false);
  const [saveDraftMode, setSaveDraftMode] = useState<"create" | "update_existing" | "save_as_new">("create");
  // Loaded Draft Context (when user opens a draft from "Edit from Old Draft")
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  const [loadedDraftName, setLoadedDraftName] = useState<string | null>(null);
  const [loadedDraftSnapshot, setLoadedDraftSnapshot] = useState<string | null>(null);

  // Helper to serialize campaign state for comparison
  const getDraftComparableString = (state: CampaignState): string => {
    return JSON.stringify({
      biz: state.businessName || state.business?.name || "",
      obj: state.objective || "",
      type: state.campaignType || "",
      budget: state.dailyBudget || null,
      locs: state.locations || [],
      lang: state.language || "",
      website: state.website || "",
      headlines: state.headlines || [],
      longHeadlines: state.longHeadlines || [],
      descriptions: state.descriptions || [],
      keywords: state.keywords || [],
      images: (state.images || []).map((img: any) => (typeof img === "string" ? img : img.url)),
      logos: (state.logos || []).map((img: any) => (typeof img === "string" ? img : img.url)),
      videos: (state.videos || []).map((v: any) => (typeof v === "string" ? v : v.url)),
      biddingStrategy: state.biddingStrategy || ""
    });
  };

  // Check if active session is editing an old draft and whether modifications occurred
  const hasLoadedDraftChanges = (): boolean => {
    if (!loadedDraftSnapshot) return true;
    return getDraftComparableString(campaignState) !== loadedDraftSnapshot;
  };

  // Helper to determine if the user has meaningful unsaved campaign data
  const hasUnsavedProgress = (): boolean => {
    const hasBiz = !!(campaignState.businessName?.trim() || campaignState.website?.trim());
    const hasBudget = !!(campaignState.dailyBudget && campaignState.dailyBudget > 0);
    const hasCopy = (campaignState.headlines?.length || 0) > 0 || (campaignState.descriptions?.length || 0) > 0 || (campaignState.keywords?.length || 0) > 0;
    const hasAssets = (campaignState.images?.length || 0) > 0 || (campaignState.logos?.length || 0) > 0;
    const hasChatMessages = messages.length > 1; // More than just initial greeting
    return hasBiz || hasBudget || hasCopy || hasAssets || hasChatMessages;
  };

  // Helper to execute fresh session reset
  const executeResetSession = () => {
    setMessages([]);
    setIsCustomCampaignName(false);
    setLoadedDraftId(null);
    setLoadedDraftName(null);
    setLoadedDraftSnapshot(null);
    setIsEditingCockpit(false);
    setEditingField(null);
    setReferencedCampaign(null);
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
      language: "All languages",
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
  };

  // Helper to execute Save Draft to database (updates existing draft or saves as new)
  const handleSaveCampaignDraft = async (options?: { asNewDraft?: boolean; onSuccess?: () => void }) => {
    setIsSavingDraft(true);
    setDraftSaveSuccess(null);
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";

      const cleanBiz = campaignState.businessName || campaignState.business?.name || "Draft Business";
      const cType = campaignState.campaignType || "";
      const isSavingExisting = !options?.asNewDraft && Boolean(loadedDraftId);
      const cName = campaignState.campaignName || (cType ? generateCampaignName(cleanBiz, cType) : cleanBiz);

      const payload = {
        draftId: isSavingExisting ? loadedDraftId : undefined,
        customerId: cid,
        campaignName: cName,
        campaignType: cType,
        biddingStrategy: campaignState.biddingStrategy || "Maximize conversions",
        budget: campaignState.dailyBudget || null,
        startDate: campaignState.startDate || todayIso,
        endDate: campaignState.endDate || null,
        finalUrl: campaignState.website || "",
        headlines: campaignState.headlines || [],
        descriptions: campaignState.descriptions || [],
        keywords: campaignState.keywords || [],
        geoTargets: campaignState.locations || ["India"],
        languages: campaignState.language ? [campaignState.language] : ["All languages"],
        searchThemes: campaignState.searchThemes || [],
        draftData: {
          objective: campaignState.objective,
          conversionGoals: campaignState.conversionGoals,
          businessName: cleanBiz,
          website: campaignState.website,
          images: campaignState.images || [],
          logos: campaignState.logos || [],
          videos: campaignState.videos || [],
          targetCpa: campaignState.targetCpa,
          targetRoas: campaignState.targetRoas,
          longHeadlines: campaignState.longHeadlines || []
        }
      };

      const res = await fetch(`${BACKEND}/api/ads/campaign/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resJson = await res.json();
        const savedDraft = resJson.draft;
        if (savedDraft?.id) {
          setLoadedDraftId(savedDraft.id);
          setLoadedDraftName(savedDraft.name || cName);
          setLoadedDraftSnapshot(getDraftComparableString(campaignState));
        }

        const successText = isSavingExisting
          ? `💾 **Changes Saved:** Updated draft for **${cName}** has been saved to your drafts database.`
          : `💾 **Draft Saved:** Campaign configuration for **${cName}** has been securely saved as a new draft in your drafts database.`;

        setDraftSaveSuccess(`Draft "${cName}" saved to database.`);
        fetchDraftCampaigns();
        fetchExistingCampaigns();

        setMessages(prev => [
          ...prev,
          {
            id: `msg-draft-saved-${Date.now()}`,
            role: "assistant",
            content: successText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);

        if (options?.onSuccess) {
          options.onSuccess();
        }
      } else {
        const errData = await res.json();
        console.warn("Save draft response warning:", errData);
      }
    } catch (e: any) {
      console.error("[AI-GUIDED] Error saving campaign draft:", e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Fetch only unpublished saved drafts (status === "DRAFT")
  const fetchDraftCampaigns = async () => {
    try {
      setIsLoadingDrafts(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";
      const res = await fetch(`${BACKEND}/api/ads/campaigns/drafts?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}`, {
        headers: { "x-organization-id": orgId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDraftsList(data);
        }
      }
    } catch (err) {
      console.warn("[AI-GUIDED] Failed to load drafts:", err);
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  // Fetch user's existing campaigns from database for Draft Picker and @ Reference
  const fetchExistingCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";
      const res = await fetch(`${BACKEND}/api/ads/campaigns?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setExistingCampaignsList(data);
        }
      }
    } catch (err) {
      console.warn("[AI-GUIDED] Failed to load existing campaigns for @ mention / draft picker:", err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchExistingCampaigns();
    fetchDraftCampaigns();
  }, [customerId]);

  // Handle Loading an Old Draft or Previous Campaign directly into Right-side Cockpit
  const handleLoadDraftCampaign = (camp: any) => {
    if (!camp) return;

    // Extract all parameters safely
    const rawBudget = camp.budget ? Number(camp.budget) : (camp.amountMicros ? Number(camp.amountMicros) / 1_000_000 : null);
    const parsedBudget = rawBudget && rawBudget > 0 ? rawBudget : null;
    const extractedBiz = camp.businessName || camp.name?.split(/[-–|]/)[0]?.trim() || "";
    const extractedWebsite = camp.website || camp.finalUrl || "";
    const extractedLocs = Array.isArray(camp.locations) && camp.locations.length > 0
      ? camp.locations
      : (Array.isArray(camp.geoTargets) && camp.geoTargets.length > 0 ? camp.geoTargets : (camp.location ? [camp.location] : ["India"]));
    
    let extractedLang = "All languages";
    if (camp.language) {
      extractedLang = camp.language;
    } else if (Array.isArray(camp.languages) && camp.languages.length > 0) {
      extractedLang = camp.languages.join(", ");
    }

    // Parse draft extra metadata if stored in audienceSignal / draftData
    const extraDraft = (camp.audienceSignal && typeof camp.audienceSignal === "object")
      ? camp.audienceSignal
      : (camp.draftData && typeof camp.draftData === "object" ? camp.draftData : {});

    const extractedHeadlines = Array.isArray(camp.headlines) && camp.headlines.length > 0 ? camp.headlines : (Array.isArray(extraDraft.headlines) ? extraDraft.headlines : []);
    const extractedLongHeadlines = Array.isArray(camp.longHeadlines) && camp.longHeadlines.length > 0 ? camp.longHeadlines : (Array.isArray(extraDraft.longHeadlines) ? extraDraft.longHeadlines : []);
    const extractedDescriptions = Array.isArray(camp.descriptions) && camp.descriptions.length > 0 ? camp.descriptions : (Array.isArray(extraDraft.descriptions) ? extraDraft.descriptions : []);
    const extractedKeywords = Array.isArray(camp.keywords) && camp.keywords.length > 0 ? camp.keywords : (Array.isArray(extraDraft.keywords) ? extraDraft.keywords : []);
    const extractedImages = Array.isArray(camp.images) && camp.images.length > 0 ? camp.images : (Array.isArray(extraDraft.images) && extraDraft.images.length > 0 ? extraDraft.images : (Array.isArray(camp.marketingImages) ? camp.marketingImages : []));
    const extractedLogos = Array.isArray(camp.logos) && camp.logos.length > 0 ? camp.logos : (Array.isArray(extraDraft.logos) && extraDraft.logos.length > 0 ? extraDraft.logos : (Array.isArray(camp.logoImages) ? camp.logoImages : []));
    const extractedVideos = Array.isArray(camp.videos) && camp.videos.length > 0 ? camp.videos : (Array.isArray(extraDraft.videos) && extraDraft.videos.length > 0 ? extraDraft.videos : (Array.isArray(camp.youtubeVideos) ? camp.youtubeVideos : []));

    // Resolve Objective reliably (from camp.objective, extraDraft.objective, or infer from campaignType/goal)
    let extractedObjective = camp.objective || extraDraft.objective || "";
    if (!extractedObjective) {
      if (camp.campaignType === "APP") {
        extractedObjective = "APP_PROMOTION";
      } else if (camp.campaignType === "VIDEO") {
        extractedObjective = "AWARENESS";
      } else if (camp.campaignType === "DEMAND_GEN" || camp.campaignType === "SHOPPING" || camp.campaignType === "PERFORMANCE_MAX" || camp.campaignType === "SEARCH" || camp.campaignType === "DISPLAY") {
        extractedObjective = "SALES";
      }
    }

    // Generate new campaign name format: ABC_DEF-{campaignType}-{random number}
    const resolvedType = camp.campaignType || campaignState.campaignType || "";
    const newFormattedCampaignName = generateCampaignName(extractedBiz || camp.name, resolvedType);

    // Auto-fill all old draft data directly into the Live Campaign Cockpit
    setCampaignState(prev => {
      const merged: CampaignState = {
        ...prev,
        businessName: extractedBiz || prev.businessName,
        campaignName: newFormattedCampaignName || camp.name || prev.campaignName,
        campaignType: camp.campaignType || prev.campaignType || "",
        objective: extractedObjective,
        conversionGoals: Array.isArray(camp.conversionGoals) && camp.conversionGoals.length > 0
          ? camp.conversionGoals 
          : (Array.isArray(extraDraft.conversionGoals) && extraDraft.conversionGoals.length > 0 ? extraDraft.conversionGoals : (extractedObjective === "APP_PROMOTION" ? ["installs"] : (extractedObjective === "AWARENESS" ? ["views"] : ["phone_leads"]))),
        website: extractedWebsite || prev.website,
        business: {
          ...(prev.business || {}),
          name: extractedBiz || prev.business?.name,
          website: extractedWebsite || prev.business?.website,
          description: camp.description || extraDraft.description || prev.business?.description || ""
        },
        dailyBudget: parsedBudget || prev.dailyBudget,
        locations: extractedLocs && extractedLocs.length > 0 ? extractedLocs : prev.locations,
        language: extractedLang || prev.language,
        startDate: (() => {
          if (!camp.startDate) return prev.startDate || todayIso;
          const parsedStart = new Date(camp.startDate).toISOString().split("T")[0];
          return parsedStart < todayIso ? todayIso : parsedStart;
        })(),
        endDate: (() => {
          if (!camp.endDate) return prev.endDate;
          const parsedEnd = new Date(camp.endDate).toISOString().split("T")[0];
          const effectiveStart = camp.startDate ? (new Date(camp.startDate).toISOString().split("T")[0] < todayIso ? todayIso : new Date(camp.startDate).toISOString().split("T")[0]) : todayIso;
          return parsedEnd <= effectiveStart ? undefined : parsedEnd;
        })(),
        biddingStrategy: camp.biddingStrategy || extraDraft.biddingStrategy || prev.biddingStrategy || "Maximize conversions",
        targetCpa: camp.targetCpa !== undefined && camp.targetCpa !== null ? Number(camp.targetCpa) : (extraDraft.targetCpa !== undefined ? Number(extraDraft.targetCpa) : prev.targetCpa),
        targetRoas: camp.targetRoas !== undefined && camp.targetRoas !== null ? Number(camp.targetRoas) : (extraDraft.targetRoas !== undefined ? Number(extraDraft.targetRoas) : prev.targetRoas),
        maxCpcLimit: camp.maxCpcLimit || extraDraft.maxCpcLimit || prev.maxCpcLimit,
        targetImpressionSharePercent: camp.targetImpressionSharePercent || extraDraft.targetImpressionSharePercent || prev.targetImpressionSharePercent,
        impressionShareLocation: camp.impressionShareLocation || extraDraft.impressionShareLocation || prev.impressionShareLocation,
        headlines: extractedHeadlines.length > 0 ? extractedHeadlines : prev.headlines,
        longHeadlines: extractedLongHeadlines.length > 0 ? extractedLongHeadlines : prev.longHeadlines,
        descriptions: extractedDescriptions.length > 0 ? extractedDescriptions : prev.descriptions,
        keywords: extractedKeywords.length > 0 ? extractedKeywords : prev.keywords,
        images: extractedImages.length > 0 ? extractedImages : prev.images,
        logos: extractedLogos.length > 0 ? extractedLogos : prev.logos,
        videos: extractedVideos.length > 0 ? extractedVideos : prev.videos,
        merchantCenterId: camp.merchantCenterId || extraDraft.merchantCenterId || prev.merchantCenterId,
        salesCountry: camp.salesCountry || extraDraft.salesCountry || prev.salesCountry,
        feedLabel: camp.feedLabel || extraDraft.feedLabel || prev.feedLabel,
        appId: camp.appId || extraDraft.appId || prev.appId,
        appName: camp.appName || extraDraft.appName || prev.appName,
        platform: camp.platform || extraDraft.platform || prev.platform,
        appStore: camp.appStore || extraDraft.appStore || prev.appStore,
        adGroupName: camp.adGroupName || extraDraft.adGroupName || prev.adGroupName,
        brandGuidelinesEnabled: camp.brandGuidelinesEnabled !== undefined ? Boolean(camp.brandGuidelinesEnabled) : prev.brandGuidelinesEnabled,
        customerAcquisitionMode: camp.customerAcquisitionMode || extraDraft.customerAcquisitionMode || prev.customerAcquisitionMode,
        trackingTemplate: camp.trackingTemplate || extraDraft.trackingTemplate || prev.trackingTemplate,
        finalUrlSuffix: camp.finalUrlSuffix || extraDraft.finalUrlSuffix || prev.finalUrlSuffix,
        displayPath1: camp.displayPath1 || extraDraft.displayPath1 || prev.displayPath1,
        displayPath2: camp.displayPath2 || extraDraft.displayPath2 || prev.displayPath2,
        mobileFinalUrl: camp.mobileFinalUrl || extraDraft.mobileFinalUrl || prev.mobileFinalUrl,
        callPhoneNumber: camp.callPhoneNumber || extraDraft.callPhoneNumber || prev.callPhoneNumber,
        euPolitical: camp.euPolitical || extraDraft.euPolitical || prev.euPolitical
      };

      const reconciled = reconcileCampaignStateWithManualFlow(merged);
      reconciled.readyForPublish = checkIsCampaignReady(reconciled);
      return reconciled;
    });

    if (extractedLocs && extractedLocs.length > 0) {
      setSelectedLocationsList(extractedLocs);
    }
    if (extractedLang) {
      setSelectedLanguagesList(extractedLang.split(",").map(l => l.trim()).filter(Boolean));
    }

    // Track active draft info and capture initial snapshot for modification checks
    const targetDraftId = camp.id || camp.campaignId || null;
    const targetDraftName = camp.name || "";
    setLoadedDraftId(targetDraftId);
    setLoadedDraftName(targetDraftName);
    setLoadedDraftSnapshot(getDraftComparableString({
      businessName: extractedBiz,
      campaignName: newFormattedCampaignName || camp.name,
      campaignType: camp.campaignType || "",
      objective: extractedObjective,
      dailyBudget: parsedBudget,
      locations: extractedLocs,
      language: extractedLang,
      website: extractedWebsite,
      headlines: extractedHeadlines,
      longHeadlines: extractedLongHeadlines,
      descriptions: extractedDescriptions,
      keywords: extractedKeywords,
      images: extractedImages,
      logos: extractedLogos,
      videos: extractedVideos,
      biddingStrategy: camp.biddingStrategy || ""
    } as any));

    // Add confirmation assistant message in chat
    setMessages(prev => [
      ...prev,
      {
        id: `msg-load-draft-${Date.now()}`,
        role: "assistant",
        content: `📂 **Loaded Draft Campaign:** "${camp.name}".\n\nAll parameters, Objective (${extractedObjective}), Campaign Type (${resolvedType || 'Auto'}), Campaign Name (\`${newFormattedCampaignName}\`), budget (₹${parsedBudget || 'same'}), target locations (${extractedLocs.join(", ")}), headlines, descriptions, keywords, and creative assets have been populated into the **Campaign Cockpit** on the right.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    setIsDraftPickerModalOpen(false);
  };

  // Handle selecting an existing campaign or draft to reuse context and auto-fill all parameters
  const handleSelectReferenceCampaign = (camp: any) => {
    setReferencedCampaign(camp);
    setIsCampaignDropdownOpen(false);

    // 1. Extract and normalize all fields from referenced campaign/draft
    const rawBudget = camp.budget ? Number(camp.budget) : (camp.amountMicros ? Number(camp.amountMicros) / 1_000_000 : (camp.dailyBudget ? Number(camp.dailyBudget) : null));
    const parsedBudget = rawBudget && rawBudget > 0 ? rawBudget : null;
    const extractedBiz = camp.businessName || camp.business?.name || camp.name?.split(/[-–|]/)[0]?.trim() || "";
    const extractedWebsite = camp.finalUrl || camp.website || camp.business?.website || camp.targetUrl || "";
    const extractedObjective = (camp.objective || "WEBSITE_TRAFFIC").toUpperCase();
    const resolvedType = camp.campaignType || (extractedObjective === "SALES" ? "SEARCH" : "DEMAND_GEN");
    
    let extractedLocs: string[] = [];
    if (Array.isArray(camp.locations)) extractedLocs = camp.locations;
    else if (Array.isArray(camp.geoTargets)) extractedLocs = camp.geoTargets.map((g: any) => typeof g === "string" ? g : (g.name || g.locationName || String(g)));
    else if (camp.location) extractedLocs = [String(camp.location)];

    const extraDraft = (camp.audienceSignal && typeof camp.audienceSignal === "object")
      ? camp.audienceSignal
      : (camp.draftData && typeof camp.draftData === "object" ? camp.draftData : {});

    let extractedHeadlines: string[] = Array.isArray(camp.headlines) && camp.headlines.length > 0 ? camp.headlines : (Array.isArray(extraDraft.headlines) ? extraDraft.headlines : []);
    let extractedDescriptions: string[] = Array.isArray(camp.descriptions) && camp.descriptions.length > 0 ? camp.descriptions : (Array.isArray(extraDraft.descriptions) ? extraDraft.descriptions : []);
    let extractedLongHeadlines: string[] = Array.isArray(camp.longHeadlines) && camp.longHeadlines.length > 0 ? camp.longHeadlines : (Array.isArray(extraDraft.longHeadlines) ? extraDraft.longHeadlines : []);
    let extractedKeywords: string[] = Array.isArray(camp.keywords) && camp.keywords.length > 0 ? camp.keywords : (Array.isArray(extraDraft.keywords) ? extraDraft.keywords : []);
    let extractedImages: any[] = Array.isArray(camp.images) && camp.images.length > 0 ? camp.images : (Array.isArray(extraDraft.images) && extraDraft.images.length > 0 ? extraDraft.images : (Array.isArray(camp.marketingImages) ? camp.marketingImages : []));
    let extractedLogos: any[] = Array.isArray(camp.logos) && camp.logos.length > 0 ? camp.logos : (Array.isArray(extraDraft.logos) && extraDraft.logos.length > 0 ? extraDraft.logos : (Array.isArray(camp.logoImages) ? camp.logoImages : []));
    let extractedVideos: any[] = Array.isArray(camp.videos) && camp.videos.length > 0 ? camp.videos : (Array.isArray(extraDraft.videos) && extraDraft.videos.length > 0 ? extraDraft.videos : (Array.isArray(camp.youtubeVideos) ? camp.youtubeVideos : []));

    // 2. Prepare proposed settings for user confirmation (Do NOT overwrite Cockpit until user clicks Apply)
    const proposedMergedState: CampaignState = {
      ...campaignState,
      businessName: extractedBiz || campaignState.businessName,
      campaignName: camp.name || campaignState.campaignName,
      campaignType: resolvedType,
      objective: extractedObjective as any,
      budgetType: camp.budgetType || campaignState.budgetType || "DAILY",
      dailyBudget: parsedBudget || campaignState.dailyBudget,
      website: extractedWebsite || campaignState.website,
      business: {
        ...(campaignState.business || {}),
        name: extractedBiz || campaignState.business?.name,
        website: extractedWebsite || campaignState.business?.website,
        description: camp.description || campaignState.business?.description || ""
      },
      locations: extractedLocs.length > 0 ? extractedLocs : campaignState.locations,
      language: camp.language || campaignState.language,
      biddingStrategy: camp.biddingStrategy || campaignState.biddingStrategy || "Maximize conversions",
      targetCpa: camp.targetCpa ? Number(camp.targetCpa) : campaignState.targetCpa,
      targetRoas: camp.targetRoas ? Number(camp.targetRoas) : campaignState.targetRoas,
      headlines: extractedHeadlines.length > 0 ? extractedHeadlines : campaignState.headlines,
      longHeadlines: extractedLongHeadlines.length > 0 ? extractedLongHeadlines : campaignState.longHeadlines,
      descriptions: extractedDescriptions.length > 0 ? extractedDescriptions : campaignState.descriptions,
      keywords: extractedKeywords.length > 0 ? extractedKeywords : campaignState.keywords,
      images: extractedImages.length > 0 ? extractedImages : campaignState.images,
      logos: extractedLogos.length > 0 ? extractedLogos : campaignState.logos,
      videos: extractedVideos.length > 0 ? extractedVideos : campaignState.videos
    };

    const reconciled = reconcileCampaignStateWithManualFlow(proposedMergedState);
    reconciled.readyForPublish = checkIsCampaignReady(reconciled);

    const suggestionsPayload = {
      proposedState: reconciled,
      messageId: `ref-${Date.now()}`,
      aiExplanation: `Loaded reference settings from @[${camp.name}]. Click "Apply to Cockpit" to update your right-side campaign settings.`,
      suggestedHeadlines: extractedHeadlines,
      suggestedDescriptions: extractedDescriptions,
      suggestedLongHeadlines: extractedLongHeadlines,
      suggestedKeywords: extractedKeywords,
      suggestedBudget: parsedBudget,
      suggestedLocations: extractedLocs,
      suggestedType: resolvedType,
      suggestedObjective: extractedObjective,
      suggestedBidding: camp.biddingStrategy || ""
    };

    setPendingAiSuggestions(suggestionsPayload);
    setAiNotificationBanner({
      title: `Apply Settings from @[${camp.name}]?`,
      summary: `Business: ${extractedBiz || camp.name} • Objective: ${extractedObjective} • Budget: ₹${parsedBudget || 'Current'}`,
      suggestionsData: suggestionsPayload
    });

    const promptMessage = `Use settings and context from @[${camp.name}] (Business: ${extractedBiz || camp.name}, Budget: ₹${parsedBudget || 'same'}, Type: ${camp.campaignType || 'Existing'}).`;
    
    setInputVal(promptMessage);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Multi-Channel Preview Tab & Device State on Left Side
  const [pmaxPreviewChannel, setPmaxPreviewChannel] = useState<"all" | "youtube" | "display" | "search" | "discover" | "gmail" | "maps">("all");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [isReloadingPreview, setIsReloadingPreview] = useState<boolean>(false);
  const [previewHeadlineIdx, setPreviewHeadlineIdx] = useState<number>(0);
  const [previewDescIdx, setPreviewDescIdx] = useState<number>(0);

  // Tracks whether copy was filled by AI/Grok vs manually entered by user
  const [isHeadlinesAiSourced, setIsHeadlinesAiSourced] = useState<boolean>(false);
  const [isLongHeadlinesAiSourced, setIsLongHeadlinesAiSourced] = useState<boolean>(false);
  const [isDescriptionsAiSourced, setIsDescriptionsAiSourced] = useState<boolean>(false);

  const handleReloadPreview = () => {
    setIsReloadingPreview(true);
    setPreviewHeadlineIdx(prev => prev + 1);
    setPreviewDescIdx(prev => prev + 1);
    setTimeout(() => {
      setIsReloadingPreview(false);
    }, 450);
  };

  const getPreviewChannelsConfig = () => {
    const cType = campaignState.campaignType || "PERFORMANCE_MAX";
    let allowedChannels: Array<{ id: "youtube" | "display" | "search" | "discover" | "gmail" | "maps"; label: string }> = [];
    let previewTitle = "Ad Preview";
    let previewBadge = "Channels Across Google";

    if (cType === "SEARCH" || cType === "SHOPPING") {
      allowedChannels = [{ id: "search", label: "Search" }];
      previewTitle = cType === "SHOPPING" ? "Shopping Search Preview" : "Google Search Preview";
      previewBadge = "Search Network";
    } else if (cType === "DEMAND_GEN") {
      allowedChannels = [
        { id: "youtube", label: "YouTube" },
        { id: "gmail", label: "Gmail" },
        { id: "maps", label: "Maps" },
        { id: "discover", label: "Discover" },
        { id: "display", label: "Display" }
      ];
      previewTitle = "Demand Gen Multi-Channel Preview";
      previewBadge = "5 Channels Across Google";
    } else if (cType === "VIDEO") {
      allowedChannels = [
        { id: "youtube", label: "YouTube" },
        { id: "display", label: "Display" }
      ];
      previewTitle = "Video Campaign Preview";
      previewBadge = "YouTube & Display";
    } else if (cType === "DISPLAY") {
      allowedChannels = [
        { id: "youtube", label: "YouTube" },
        { id: "gmail", label: "Gmail" },
        { id: "display", label: "Display" }
      ];
      previewTitle = "Display Network Preview";
      previewBadge = "YouTube, Gmail & Display";
    } else {
      allowedChannels = [
        { id: "youtube", label: "YouTube" },
        { id: "display", label: "Display" },
        { id: "search", label: "Search" },
        { id: "discover", label: "Discover" },
        { id: "gmail", label: "Gmail" },
        { id: "maps", label: "Maps" }
      ];
      previewTitle = "Performance Max Multi-Channel Preview";
      previewBadge = "6 Channels Across Google";
    }

    return { allowedChannels, previewTitle, previewBadge };
  };

  // Media Upload Guidelines Modal & Mode ("IMAGE" | "LOGO" | "VIDEO" | null)
  const [uploadGuidelineModal, setUploadGuidelineModal] = useState<"IMAGE" | "LOGO" | "VIDEO" | null>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<"IMAGE" | "LOGO" | "VIDEO">("IMAGE");
  const [uploadValidationError, setUploadValidationError] = useState<string | null>(null);

  // ── Media Source Choice Modal & Past Media Library State ──
  const [isMediaSourceModalOpen, setIsMediaSourceModalOpen] = useState<boolean>(false);
  const [isPastMediaModalOpen, setIsPastMediaModalOpen] = useState<boolean>(false);
  const [pastMediaList, setPastMediaList] = useState<Array<any>>([]);
  const [isLoadingPastMedia, setIsLoadingPastMedia] = useState<boolean>(false);
  const [pastMediaSearchQuery, setPastMediaSearchQuery] = useState<string>("");
  const [pastMediaFilter, setPastMediaFilter] = useState<"ALL" | "IMAGE" | "LOGO" | "VIDEO">("ALL");

  // ── Image Editor & Cropper Modal State ──
  const [isImageEditorOpen, setIsImageEditorOpen] = useState<boolean>(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [editorImageSrc, setEditorImageSrc] = useState<string>("");
  const [editorFileName, setEditorFileName] = useState<string>("");
  const [editorTargetType, setEditorTargetType] = useState<"IMAGE" | "LOGO">("IMAGE");
  const [editorCropRatio, setEditorCropRatio] = useState<"1.91:1" | "1:1" | "4:5" | "9:16" | "4:1">("1.91:1");
  const [editorZoom, setEditorZoom] = useState<number>(1);
  const [editorPanX, setEditorPanX] = useState<number>(0);
  const [editorPanY, setEditorPanY] = useState<number>(0);
  const [editorImageDimensions, setEditorImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [editorRuleViolationReason, setEditorRuleViolationReason] = useState<string | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState<boolean>(false);
  const [editingExistingAssetIndex, setEditingExistingAssetIndex] = useState<number | null>(null);

  // Dedicated file input refs for distinct media types
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Search Keywords input state in Cockpit
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");

  // Google Maps & Places API Key state for interactive maps
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [showLocationMapPreview, setShowLocationMapPreview] = useState<boolean>(true);

  const [tempEditValues, setTempEditValues] = useState<{
    businessName?: string;
    campaignName?: string;
    objective?: string;
    conversionGoal?: string;
    campaignType?: string;
    website?: string;
    budgetType?: "TOTAL" | "DAILY";
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
    assetGroupName?: string;
    brandGuidelinesEnabled?: boolean;
    customerAcquisitionMode?: string;
    trackingTemplate?: string;
    finalUrlSuffix?: string;
    displayPath1?: string;
    displayPath2?: string;
    mobileFinalUrl?: string;
    callPhoneNumber?: string;
    euPolitical?: "YES" | "NO";
    campaignPriority?: string;
    localProducts?: boolean;
    appId?: string;
    appName?: string;
    platform?: string;
    headlines?: string[];
    descriptions?: string[];
    longHeadlines?: string[];
    callToAction?: string;
    images?: Array<any>;
    logos?: Array<any>;
    videos?: Array<any>;
    [key: string]: any;
  }>({});

  // Live Location Search Effect for Cockpit (Supports both standard Location and Radius mode)
  useEffect(() => {
    if (editingField === "locations" && locationMode === "CUSTOM" && locationSearchQuery.trim().length >= 2) {
      setIsSearchingLocation(true);
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";
      const cid = customerId || "6587355041";

      const timer = setTimeout(async () => {
        try {
          const queryTrimmed = locationSearchQuery.trim();
          const isPin = /^\d{3,10}$/.test(queryTrimmed.replace(/\s+/g, ""));

          if (locationTab === "RADIUS") {
            // Radius mode: search places autocomplete to obtain point of interest / city / coordinates
            try {
              const res = await fetch(`${BACKEND}/api/ads/places/autocomplete?input=${encodeURIComponent(queryTrimmed)}&mode=radius`);
              if (res.ok) {
                const data = await res.json();
                const predictions = (data.predictions || []).map((p: any) => ({
                  id: p.placeId || `rad_${Math.random().toString(36).slice(2, 8)}`,
                  placeId: p.placeId,
                  name: p.mainText || p.name || p.description?.split(",")[0],
                  canonicalName: p.description || p.canonicalName || p.mainText,
                  targetType: `Radius (${radiusValue} ${radiusUnit})`,
                  lat: p.lat,
                  lng: p.lng
                }));
                setLocationSearchResults(predictions);
              } else {
                setLocationSearchResults([]);
              }
            } catch (rErr) {
              console.warn("Radius autocomplete fetch warning:", rErr);
              setLocationSearchResults([]);
            }
          } else {
            // Location mode: query Places Autocomplete and Geo-Targets search safely
            const safePlacesPromise = fetch(`${BACKEND}/api/ads/places/autocomplete?input=${encodeURIComponent(queryTrimmed)}&mode=location`).catch(err => {
              console.warn("Places autocomplete error:", err);
              return null;
            });
            const safeGeoPromise = isPin ? Promise.resolve(null) : fetch(`${BACKEND}/api/ads/geo-targets/search?orgId=${encodeURIComponent(orgId)}&customerId=${encodeURIComponent(cid)}&q=${encodeURIComponent(queryTrimmed)}`).catch(err => {
              console.warn("Geo targets search error:", err);
              return null;
            });

            const [placesRes, geoRes] = await Promise.all([safePlacesPromise, safeGeoPromise]);

            const merged: Array<{ id?: string; name: string; canonicalName: string; targetType?: string; placeId?: string; lat?: number; lng?: number }> = [];
            const seenIds = new Set<string>();

            if (placesRes && placesRes.ok) {
              try {
                const pData = await placesRes.json();
                const pList = pData.predictions || [];
                for (const p of pList) {
                  const id = p.placeId || p.id;
                  if (!seenIds.has(id)) {
                    seenIds.add(id);
                    merged.push({
                      id,
                      placeId: p.placeId,
                      name: p.mainText || p.name || p.description?.split(",")[0],
                      canonicalName: p.description || p.canonicalName || p.mainText,
                      targetType: p.types?.includes("postal_code")
                        ? "Postal Code"
                        : p.types?.includes("country")
                          ? "Country"
                          : p.types?.includes("administrative_area_level_1")
                            ? "State / Region"
                            : p.types?.includes("locality")
                              ? "City"
                              : "Location",
                      lat: p.lat,
                      lng: p.lng
                    });
                  }
                }
              } catch (e) {
                console.warn("Places json parsing error:", e);
              }
            }

            if (geoRes && geoRes.ok) {
              try {
                const gData = await geoRes.json();
                const gList = Array.isArray(gData) ? gData : (gData.results || gData.data || []);
                for (const item of gList) {
                  const id = item.id || item.geoTargetConstant?.id || item.resourceName?.split("/").pop();
                  const name = item.name || item.geoTargetConstant?.name || item.canonicalName;
                  const canonicalName = item.canonicalName || item.geoTargetConstant?.canonicalName || name;
                  if (!seenIds.has(id)) {
                    seenIds.add(id);
                    merged.push({
                      id,
                      name,
                      canonicalName,
                      targetType: item.targetType || item.geoTargetConstant?.targetType || "Location"
                    });
                  }
                }
              } catch (e) {
                console.warn("Geo targets json parsing error:", e);
              }
            }

            if (merged.length > 0) {
              setLocationSearchResults(merged);
            } else {
              const localFallback = GOOGLE_ADS_LOCATION_PRESETS
                .filter(loc => loc.name.toLowerCase().includes(queryTrimmed.toLowerCase()) || loc.canonicalName.toLowerCase().includes(queryTrimmed.toLowerCase()))
                .map(loc => ({ ...loc, targetType: "Location" }));
              setLocationSearchResults(localFallback);
            }
          }
        } catch (err) {
          console.error("Cockpit location search error:", err);
          const localFallback = GOOGLE_ADS_LOCATION_PRESETS
            .filter(loc => loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) || loc.canonicalName.toLowerCase().includes(locationSearchQuery.toLowerCase()))
            .map(loc => ({ ...loc, targetType: "Location" }));
          setLocationSearchResults(localFallback);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else if (editingField === "locations" && locationMode === "CUSTOM" && locationSearchQuery.trim().length === 0) {
      setLocationSearchResults(GOOGLE_ADS_LOCATION_PRESETS.slice(0, 6).map(loc => ({ ...loc, targetType: "Location" })));
    }
  }, [editingField, locationMode, locationTab, radiusValue, radiusUnit, locationSearchQuery, customerId]);

  // Real-time URL Validator
  const validateWebsiteUrl = (val?: string): string | null => {
    if (!val || !val.trim()) {
      return "Website URL is required.";
    }
    let trimmed = val.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      trimmed = `https://${trimmed}`;
    }
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || !parsed.hostname.includes(".")) {
        return "Invalid website URL. Please enter a valid domain (e.g. yourbusiness.com).";
      }
    } catch {
      return "Invalid website URL. Please enter a valid domain (e.g. yourbusiness.com).";
    }
    return null;
  };

  // Real-time Budget Validator (Daily Budget vs Campaign Total Budget)
  const validateDailyBudget = (val?: string | number, targetCampaignType?: string, currentBudgetType?: string): string | null => {
    const isTotal = (currentBudgetType || tempEditValues.budgetType || campaignState.budgetType) === "TOTAL";
    const label = isTotal ? "Campaign total budget" : "Daily budget";
    if (val === undefined || val === null || String(val).trim() === "") {
      return `${label} is required.`;
    }
    const str = String(val).trim();
    const num = Number(str);
    if (isNaN(num)) {
      return "Please enter a valid numeric budget.";
    }
    if (num < 0) {
      return `${label} cannot be negative.`;
    }
    if (num === 0) {
      return `${label} must be greater than 0.`;
    }
    const effectiveType = targetCampaignType || campaignState.campaignType;
    if (effectiveType === "DEMAND_GEN" && !isTotal && num < 416) {
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

  // Real-time End Date Validator (Google Ads requires End Date to be strictly after Start Date; mandatory for Total Budget, optional for Daily Budget)
  const validateEndDate = (endVal?: string, startVal?: string, currentBudgetType?: string): string | null => {
    const isTotal = (currentBudgetType || tempEditValues.budgetType || campaignState.budgetType) === "TOTAL";
    if (!endVal || !endVal.trim()) {
      if (isTotal) {
        return "End date is required when using Campaign Total Budget.";
      }
      return null; // End date is optional for Daily Budget
    }
    const effectiveStart = startVal || todayIso;
    if (endVal <= effectiveStart) {
      return `End date (${endVal}) must be after start date (${effectiveStart}).`;
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

  // Helper to generate canonical campaign name based on business name, optional campaign type, and random number check against existing campaigns in database
  const generateCampaignName = (businessName?: string, campaignType?: string) => {
    if (!businessName || !businessName.trim()) return "";
    
    // Replace whitespace and special separator characters with underscore
    const cleanBiz = businessName
      .trim()
      .replace(/[|│┃/\\•●▪◆★►▶✔✓~^_*<>{}[\]#@+=,.:;!?'"`-]+/g, " ")
      .trim()
      .replace(/\s+/g, "_");

    // Format campaign type for slug if available (e.g. PERFORMANCE_MAX -> PerformanceMax, SEARCH -> Search)
    const typeLabel = campaignType ? campaignType.replace(/_/g, "") : "";
    
    // Extract existing campaign names from database to guarantee no duplicates
    const existingNames = new Set(
      (existingCampaignsList || []).map((c: any) => (c.name || c.campaignName || "").trim().toLowerCase())
    );

    let candidateName = "";
    let attempts = 0;
    
    do {
      const randNum = Math.floor(1000 + Math.random() * 9000); // 4-digit unique random number
      if (typeLabel) {
        candidateName = `${cleanBiz}-${typeLabel}-${randNum}`;
      } else {
        candidateName = `${cleanBiz}-${randNum}`;
      }
      attempts++;
    } while (existingNames.has(candidateName.toLowerCase()) && attempts < 20);

    return candidateName;
  };

  // Helper to check if campaign state satisfies all Google Ads publishing requirements
  const checkIsCampaignReady = (state: CampaignState): boolean => {
    const cType = state.campaignType;
    const isBudgetValid = cType === "DEMAND_GEN"
      ? (state.dailyBudget && state.dailyBudget >= 416)
      : (state.dailyBudget && state.dailyBudget > 0);
    const hasBudget = Boolean(isBudgetValid);
    const hasBizName = !!(state.businessName?.trim() || state.business?.name?.trim());
    const hasName = !!(state.campaignName?.trim() || hasBizName);
    const hasType = !!state.campaignType;

    if (!hasBudget || !hasName || !hasType) return false;

    const validHeadlines = (state.headlines || []).filter(h => h && h.trim().length > 0);
    const validDescriptions = (state.descriptions || []).filter(d => d && d.trim().length > 0);
    const validLongHeadlines = (state.longHeadlines || []).filter(lh => lh && lh.trim().length > 0);
    const validKeywords = (state.keywords || []).filter(k => k && k.trim().length > 0);
    const hasImages = (state.images?.length || 0) > 0;
    const hasLogos = (state.logos?.length || 0) > 0;
    const hasVideos = (state.videos?.length || 0) > 0;
    const dgFormat = state.adFormat || "SINGLE_IMAGE";

    if (cType === "SEARCH") {
      return validKeywords.length >= 1 && validHeadlines.length >= 3 && validDescriptions.length >= 2;
    }

    if (cType === "PERFORMANCE_MAX") {
      const allImgs = state.images || [];
      const allLgs = state.logos || [];
      let hasLand = false;
      let hasSq = false;
      let hasLg = allLgs.length > 0;

      for (const im of allImgs) {
        const raw = typeof im === "string" ? im : (im as any)?.url || (im as any)?.data || "";
        const fType = typeof im === "object" ? (im as any)?.fieldType : null;
        const ratio = typeof im === "object" ? (im as any)?.aspectRatio : null;
        const name = (typeof im === "object" && (im as any)?.name) ? (im as any).name.toLowerCase() : "";
        const dims = typeof im === "object" ? (im as any)?.dimensions : null;

        const isSquareDetected = fType === "SQUARE_MARKETING_IMAGE" ||
          ratio === "1:1" ||
          name.includes("1x1") ||
          name.includes("1:1") ||
          name.includes("square") ||
          (dims && Math.abs(dims.width - dims.height) <= 20);

        const isLandscapeDetected = fType === "MARKETING_IMAGE" ||
          ratio === "1.91:1" ||
          name.includes("1.91x1") ||
          name.includes("1.91:1") ||
          name.includes("landscape") ||
          (dims && dims.width >= dims.height * 1.3);

        if (isSquareDetected) hasSq = true;
        if (isLandscapeDetected) hasLand = true;
        if (fType === "LOGO") hasLg = true;
        else if (typeof raw === "string" && (raw.includes("ik.imagekit.io") || raw.startsWith("data:image/") || raw.startsWith("http"))) {
          if (!hasLand && !hasSq) {
            hasLand = true;
            hasSq = true;
          } else if (!hasLand) {
            hasLand = true;
          } else if (!hasSq) {
            hasSq = true;
          }
        }
      }

      if (allImgs.length >= 2 && (!hasLand || !hasSq)) {
        hasLand = true;
        hasSq = true;
      } else if (allImgs.length === 1 && !hasLand && !hasSq) {
        hasLand = true;
        hasSq = true;
      }

      const hasBiz = !!(state.businessName?.trim() || state.business?.name?.trim());
      const hasUrl = !!(state.website && (state.website.startsWith("http://") || state.website.startsWith("https://")));
      const bStrat = (state.biddingStrategy || "").toLowerCase();
      let isBiddingValid = true;
      if (bStrat === "target cpa" || bStrat === "target_cpa") {
        const cpa = Number(state.targetCpa);
        isBiddingValid = !isNaN(cpa) && cpa > 0;
      } else if (bStrat === "target roas" || bStrat === "target_roas") {
        const roas = Number(state.targetRoas);
        isBiddingValid = !isNaN(roas) && roas > 0;
      }

      return hasLand && hasSq && hasLg && validHeadlines.length >= 3 && validLongHeadlines.length >= 1 && validDescriptions.length >= 2 && hasBiz && hasUrl && isBiddingValid;
    }

    if (cType === "DISPLAY") {
      const hasBiz = !!(state.businessName?.trim() || state.business?.name?.trim());
      const hasUrl = !!(state.website && (state.website.startsWith("http://") || state.website.startsWith("https://")));
      const hasLongHl = validLongHeadlines.length >= 1 || validHeadlines.length >= 1;
      return hasBiz && hasUrl && hasImages && hasLogos && validHeadlines.length >= 1 && hasLongHl && validDescriptions.length >= 1;
    }

    if (cType === "DEMAND_GEN" || cType === "VIDEO") {
      if (dgFormat === "VIDEO") {
        return hasVideos && hasLogos && validHeadlines.length >= 1 && validLongHeadlines.length >= 1 && validDescriptions.length >= 1;
      } else if (dgFormat === "CAROUSEL") {
        const cards = state.carouselCards || [];
        const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());
        return validCards.length >= 2 && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
      } else {
        return hasImages && hasLogos && validHeadlines.length >= 1 && validDescriptions.length >= 1;
      }
    }

    if (cType === "APP") {
      const hasAppId = !!(state.appId && state.appId.trim());
      const hasTargetCpa = state.targetCpa !== undefined && state.targetCpa !== null && !isNaN(Number(state.targetCpa)) && Number(state.targetCpa) > 0;
      return Boolean(hasAppId && hasBizName && hasTargetCpa && validHeadlines.length >= 1 && validDescriptions.length >= 1 && hasBudget);
    }

    if (cType === "SHOPPING") {
      const mId = (state.merchantCenterId || (state as any).merchantId || "").trim();
      const isMidValid = /^\d+$/.test(mId);
      const hasCountry = !!(state.salesCountry || (state as any).feedLabel);
      const shoppingUrl = (state.website || "").trim();
      const isUrlValid = shoppingUrl.startsWith("http://") || shoppingUrl.startsWith("https://");
      return Boolean(isMidValid && hasCountry && isUrlValid && validHeadlines.length >= 1 && validDescriptions.length >= 1 && hasBudget);
    }

    const hasLocations = Array.isArray(state.locations) && state.locations.filter(Boolean).length > 0;
    if (!hasLocations) return false;

    return true;
  };

  // Helper to compute specific missing requirements and action buttons for Cockpit display
  const computeMissingRequirementsCockpit = (state: CampaignState): Array<{ label: string; field: string; fixAction: () => void }> => {
    const missing: Array<{ label: string; field: string; fixAction: () => void }> = [];
    const cType = state.campaignType;

    if (!state.businessName && !state.business?.name) {
      missing.push({
        label: "Business / Shop Name is required",
        field: "businessName",
        fixAction: () => startFieldEdit("businessName")
      });
    }

    if (cType !== "APP" && (!state.website || (!state.website.startsWith("http://") && !state.website.startsWith("https://")))) {
      missing.push({
        label: "Valid Website Landing Page URL (http:// or https://) is required",
        field: "website",
        fixAction: () => startFieldEdit("website")
      });
    }

    const isBudgetValid = cType === "DEMAND_GEN"
      ? (state.dailyBudget && state.dailyBudget >= 416)
      : (state.dailyBudget && state.dailyBudget > 0);
    if (!isBudgetValid) {
      missing.push({
        label: cType === "DEMAND_GEN" ? "Daily Budget must be at least ₹416/day" : "Daily Budget is required (min ₹100/day)",
        field: "dailyBudget",
        fixAction: () => startFieldEdit("dailyBudget")
      });
    }

    const hasLocs = Array.isArray(state.locations) && state.locations.filter(Boolean).length > 0;
    if (!hasLocs) {
      missing.push({
        label: "Target Location is required (e.g. 'India' or your city)",
        field: "locations",
        fixAction: () => startFieldEdit("locations")
      });
    }

    if (!cType) {
      missing.push({
        label: "Campaign Type selection is required",
        field: "campaignType",
        fixAction: () => startFieldEdit("campaignType")
      });
    }

    const validHeadlines = (state.headlines || []).filter(h => h && h.trim().length > 0);
    const validDescriptions = (state.descriptions || []).filter(d => d && d.trim().length > 0);
    const validLongHeadlines = (state.longHeadlines || []).filter(lh => lh && lh.trim().length > 0);
    const validKeywords = (state.keywords || []).filter(k => k && k.trim().length > 0);

    if (cType === "SEARCH") {
      if (validHeadlines.length < 3) {
        missing.push({
          label: `At least 3 Headlines required (${validHeadlines.length}/3 added)`,
          field: "headlines",
          fixAction: () => handleTriggerAiAssetGeneration("HEADLINES")
        });
      }
      if (validDescriptions.length < 2) {
        missing.push({
          label: `At least 2 Descriptions required (${validDescriptions.length}/2 added)`,
          field: "descriptions",
          fixAction: () => handleTriggerAiAssetGeneration("DESCRIPTIONS")
        });
      }
      if (validKeywords.length < 1) {
        missing.push({
          label: "At least 1 Keyword is required for Search campaigns",
          field: "keywords",
          fixAction: () => handleSendMessage("generate 10 high intent search keywords for my business")
        });
      }
    } else if (cType === "PERFORMANCE_MAX") {
      const allImgs = state.images || [];
      const allLgs = state.logos || [];
      let hasLand = false;
      let hasSq = false;
      let hasLg = allLgs.length > 0;

      for (const im of allImgs) {
        const raw = typeof im === "string" ? im : (im as any)?.url || (im as any)?.data || "";
        const fType = typeof im === "object" ? (im as any)?.fieldType : null;
        const ratio = typeof im === "object" ? (im as any)?.aspectRatio : null;
        const name = (typeof im === "object" && (im as any)?.name) ? (im as any).name.toLowerCase() : "";
        const dims = typeof im === "object" ? (im as any)?.dimensions : null;

        const isSquareDetected = fType === "SQUARE_MARKETING_IMAGE" ||
          ratio === "1:1" ||
          name.includes("1x1") ||
          name.includes("1:1") ||
          name.includes("square") ||
          (dims && Math.abs(dims.width - dims.height) <= 20);

        const isLandscapeDetected = fType === "MARKETING_IMAGE" ||
          ratio === "1.91:1" ||
          name.includes("1.91x1") ||
          name.includes("1.91:1") ||
          name.includes("landscape") ||
          (dims && dims.width >= dims.height * 1.3);

        if (isSquareDetected) hasSq = true;
        if (isLandscapeDetected) hasLand = true;
        if (fType === "LOGO") hasLg = true;
        else if (typeof raw === "string" && (raw.includes("ik.imagekit.io") || raw.startsWith("data:image/") || raw.startsWith("http"))) {
          if (!hasLand && !hasSq) {
            hasLand = true;
            hasSq = true;
          } else if (!hasLand) {
            hasLand = true;
          } else if (!hasSq) {
            hasSq = true;
          }
        }
      }

      if (allImgs.length >= 2 && (!hasLand || !hasSq)) {
        hasLand = true;
        hasSq = true;
      } else if (allImgs.length === 1 && !hasLand && !hasSq) {
        hasLand = true;
        hasSq = true;
      }

      if (validHeadlines.length < 3) {
        missing.push({
          label: `At least 3 Headlines required (${validHeadlines.length}/3 added)`,
          field: "headlines",
          fixAction: () => handleTriggerAiAssetGeneration("HEADLINES")
        });
      }
      if (validLongHeadlines.length < 1) {
        missing.push({
          label: "At least 1 Long Headline is required for Performance Max",
          field: "longHeadlines",
          fixAction: () => handleTriggerAiAssetGeneration("LONG_HEADLINES")
        });
      }
      if (validDescriptions.length < 2) {
        missing.push({
          label: `At least 2 Descriptions required (${validDescriptions.length}/2 added)`,
          field: "descriptions",
          fixAction: () => handleTriggerAiAssetGeneration("DESCRIPTIONS")
        });
      }
      if (!hasLand || !hasSq) {
        missing.push({
          label: "At least 1 Landscape (1.91:1) and 1 Square (1:1) image required",
          field: "images",
          fixAction: () => handleTriggerAiAssetGeneration("IMAGE")
        });
      }
      if (!hasLg) {
        missing.push({
          label: "At least 1 Brand Logo (1:1) is required for Performance Max",
          field: "logos",
          fixAction: () => handleTriggerAiAssetGeneration("LOGO")
        });
      }
    } else if (cType === "DEMAND_GEN") {
      const dgFormat = (state.adFormat || "SINGLE_IMAGE").toUpperCase();
      const allLogos = (state.logos || []).filter(l => l && (typeof l === "string" ? l.trim() : (l as any).url || (l as any).data || (l as any).asset));
      const allImages = (state.images || []).filter(img => img && (typeof img === "string" ? img.trim() : (img as any).url || (img as any).data || (img as any).asset));
      const allVideos = (state.videos || []).filter(v => v && (typeof v === "string" ? v.trim() : (v as any).asset || (v as any).videoId || (v as any).url));
      const cards = Array.isArray(state.carouselCards) ? state.carouselCards : [];
      const validCards = cards.filter(c => c && c.image?.trim() && c.headline?.trim());

      if (validHeadlines.length < 1) {
        missing.push({
          label: "At least 1 Headline is required for Demand Gen (max 40 characters)",
          field: "headlines",
          fixAction: () => handleTriggerAiAssetGeneration("HEADLINES")
        });
      }
      if (validDescriptions.length < 1) {
        missing.push({
          label: "At least 1 Description is required for Demand Gen (max 90 characters)",
          field: "descriptions",
          fixAction: () => handleTriggerAiAssetGeneration("DESCRIPTIONS")
        });
      }
      if (allLogos.length < 1) {
        missing.push({
          label: "At least 1 Brand Logo (1:1) is required for Demand Gen",
          field: "logos",
          fixAction: () => handleTriggerAiAssetGeneration("LOGO")
        });
      }

      if (dgFormat === "SINGLE_IMAGE") {
        if (allImages.length < 1) {
          missing.push({
            label: "At least 1 Marketing Image (1.91:1 landscape or 1:1 square) is required for Single Image Demand Gen ads",
            field: "images",
            fixAction: () => handleTriggerAiAssetGeneration("IMAGE")
          });
        }
      } else if (dgFormat === "VIDEO") {
        if (allVideos.length < 1) {
          missing.push({
            label: "At least 1 YouTube Video is required for Video Demand Gen ads",
            field: "videos",
            fixAction: () => startFieldEdit("videos")
          });
        }
        if (validLongHeadlines.length < 1) {
          missing.push({
            label: "At least 1 Long Headline is required for Video Demand Gen ads",
            field: "longHeadlines",
            fixAction: () => handleTriggerAiAssetGeneration("LONG_HEADLINES")
          });
        }
      } else if (dgFormat === "CAROUSEL") {
        if (validCards.length < 2) {
          missing.push({
            label: `At least 2 Carousel Cards with an image and headline are required (${validCards.length}/2 added)`,
            field: "carouselCards",
            fixAction: () => startFieldEdit("carouselCards")
          });
        }
      }
    } else if (cType === "DISPLAY") {
      const allLogos = (state.logos || []).filter(l => l && (typeof l === "string" ? l.trim() : (l as any).url || (l as any).data || (l as any).asset));
      const allImages = (state.images || []).filter(img => img && (typeof img === "string" ? img.trim() : (img as any).url || (img as any).data || (img as any).asset));

      if (validHeadlines.length < 1) {
        missing.push({
          label: "At least 1 Headline is required for Display (up to 30 characters)",
          field: "headlines",
          fixAction: () => handleTriggerAiAssetGeneration("HEADLINES")
        });
      }
      if (validDescriptions.length < 1) {
        missing.push({
          label: "At least 1 Description is required for Display (up to 90 characters)",
          field: "descriptions",
          fixAction: () => handleTriggerAiAssetGeneration("DESCRIPTIONS")
        });
      }
      if (allImages.length < 1) {
        missing.push({
          label: "At least 1 Landscape (1.91:1) and 1 Square (1:1) Marketing Image required for Display",
          field: "images",
          fixAction: () => handleTriggerAiAssetGeneration("IMAGE")
        });
      }
      if (allLogos.length < 1) {
        missing.push({
          label: "At least 1 Brand Logo (1:1) is required for Display",
          field: "logos",
          fixAction: () => handleTriggerAiAssetGeneration("LOGO")
        });
      }
    } else if (cType === "SHOPPING") {
      const mId = (state.merchantCenterId || (state as any).merchantId || "").trim();
      if (!/^\d+$/.test(mId)) {
        missing.push({
          label: "Valid Google Merchant Center Account ID is required",
          field: "merchantCenterId",
          fixAction: () => startFieldEdit("merchantCenterId")
        });
      }
      if (!state.salesCountry && !(state as any).feedLabel) {
        missing.push({
          label: "Sales Target Country / Feed Label is required",
          field: "salesCountry",
          fixAction: () => startFieldEdit("salesCountry")
        });
      }
    } else if (cType === "APP") {
      if (!state.appId || !state.appId.trim()) {
        missing.push({
          label: "App ID / Package Name is required",
          field: "appId",
          fixAction: () => startFieldEdit("appId")
        });
      }
    }

    return missing;
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
    let currentLangs: string[] = ["All languages"];
    if (campaignState.language) {
      currentLangs = campaignState.language
        .split(",")
        .map(l => l.trim())
        .filter(Boolean);
      if (currentLangs.length === 0) currentLangs = ["All languages"];
    }
    setSelectedLanguagesList(currentLangs);
    setLanguageSearchQuery("");

    setTempEditValues({
      businessName: campaignState.businessName || campaignState.business?.name || "",
      campaignName: campaignState.campaignName || "",
      objective: activeObj,
      conversionGoal: rawGoal,
      campaignType: campaignState.campaignType || "",
      website: campaignState.website || "",
      budgetType: (campaignState.budgetType as "TOTAL" | "DAILY") || "DAILY",
      dailyBudget: campaignState.dailyBudget !== null && campaignState.dailyBudget !== undefined ? campaignState.dailyBudget : "",
      biddingStrategy: campaignState.biddingStrategy || "",
      targetCpa: campaignState.targetCpa !== null && campaignState.targetCpa !== undefined ? campaignState.targetCpa : "",
      targetRoas: campaignState.targetRoas !== null && campaignState.targetRoas !== undefined ? campaignState.targetRoas : "",
      maxCpcLimit: campaignState.maxCpcLimit !== null && campaignState.maxCpcLimit !== undefined ? campaignState.maxCpcLimit : "",
      targetImpressionSharePercent: campaignState.targetImpressionSharePercent !== null && campaignState.targetImpressionSharePercent !== undefined ? campaignState.targetImpressionSharePercent : "",
      impressionShareLocation: campaignState.impressionShareLocation || "",
      locations: currentLocs.join(", "),
      language: campaignState.language || "",
      startDate: campaignState.startDate || "",
      endDate: campaignState.endDate || "",
      merchantCenterId: campaignState.merchantCenterId || "",
      salesCountry: campaignState.salesCountry || "",
      adGroupName: campaignState.adGroupName || "",
      brandGuidelinesEnabled: Boolean(campaignState.brandGuidelinesEnabled),
      customerAcquisitionMode: campaignState.customerAcquisitionMode || "",
      trackingTemplate: campaignState.trackingTemplate || "",
      finalUrlSuffix: campaignState.finalUrlSuffix || "",
      displayPath1: campaignState.displayPath1 || "",
      displayPath2: campaignState.displayPath2 || "",
      mobileFinalUrl: campaignState.mobileFinalUrl || "",
      callPhoneNumber: campaignState.callPhoneNumber || "",
      euPolitical: campaignState.euPolitical || "NO",
      campaignPriority: campaignState.campaignPriority || "",
      localProducts: Boolean(campaignState.localProducts),
      appId: campaignState.appId || "",
      appName: campaignState.appName || "",
      platform: campaignState.platform || ""
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

    if (editingField === "website" && tempEditValues.website !== undefined) {
      let cleanUrl = tempEditValues.website.trim().replace(/^["'(\[<\s]+/, "").replace(/[\s"'\(\)\[\]<>\.,;:?]+$/, "").trim();
      if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`;
      }

      if (cleanUrl && cleanUrl !== campaignState.website) {
        if (cleanUrl.includes(".")) {
          const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          setIsAnalyzingUrl(true);

          // 1. Immediately inform user in chat about website URL update
          const startMsgId = `msg-url-updated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          setMessages(prev => [
            ...prev,
            {
              id: startMsgId,
              role: "assistant",
              content: `🌐 **Website Updated:** I noticed you configured **${cleanUrl}** in the Campaign Cockpit.\n\nAnalyzing your website content to extract business highlights, keywords, and high-converting ad copy...`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);

          fetch(`${BACKEND}/api/ads/ai-guided/analyze-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: cleanUrl })
          })
            .then(r => r.json())
            .then(data => {
              if (data && data.success) {
                setCampaignState(prevState => {
                  const extractedBizName = data.derivedBusinessName || data.title?.split(/[-|:]/)[0]?.trim() || prevState.businessName || "";
                  return {
                    ...prevState,
                    website: cleanUrl,
                    businessName: prevState.businessName || extractedBizName,
                    business: {
                      ...(prevState.business || {}),
                      name: prevState.business?.name || extractedBizName,
                      website: cleanUrl,
                      description: prevState.business?.description || data.description || ""
                    },
                    locations: (data.locations && data.locations.length > 0 && (!prevState.locations || prevState.locations.length === 0 || prevState.locations[0] === "India"))
                      ? data.locations
                      : prevState.locations,
                    language: (data.language && (!prevState.language || prevState.language === "All languages"))
                      ? (data.language === "en" ? "English" : data.language)
                      : prevState.language,
                    headlines: (data.headlines && data.headlines.length > 0)
                      ? Array.from(new Set([...(prevState.headlines || []), ...data.headlines]))
                      : prevState.headlines,
                    longHeadlines: (data.longHeadlines && data.longHeadlines.length > 0)
                      ? Array.from(new Set([...(prevState.longHeadlines || []), ...data.longHeadlines]))
                      : prevState.longHeadlines,
                    descriptions: (data.descriptions && data.descriptions.length > 0)
                      ? Array.from(new Set([...(prevState.descriptions || []), ...data.descriptions]))
                      : prevState.descriptions,
                    keywords: (data.keywords && data.keywords.length > 0)
                      ? Array.from(new Set([...(prevState.keywords || []), ...data.keywords]))
                      : prevState.keywords,
                    searchThemes: (data.searchThemes && data.searchThemes.length > 0)
                      ? Array.from(new Set([...(prevState.searchThemes || []), ...data.searchThemes]))
                      : prevState.searchThemes,
                    sitelinks: (data.sitelinks && data.sitelinks.length > 0)
                      ? Array.from(new Map([...(prevState.sitelinks || []), ...data.sitelinks].map(s => [s.text.toLowerCase(), s])).values())
                      : prevState.sitelinks
                  };
                });

                // 2. Post detailed analysis summary to left chat
                const headlinesCount = (data.headlines || []).length;
                const keywordsCount = (data.keywords || []).length;
                const descriptionsCount = (data.descriptions || []).length;
                const searchThemesCount = (data.searchThemes || []).length;
                const sitelinksCount = (data.sitelinks || []).length;
                const doneMsgId = `msg-url-analyzed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                
                setMessages(prev => [
                  ...prev,
                  {
                    id: doneMsgId,
                    role: "assistant",
                    content: `✨ **Website Analysis Complete for ${cleanUrl}**:\n\n` +
                      (data.description ? `📝 **Summary:** ${data.description.slice(0, 160)}...\n\n` : "") +
                      `🎯 **Extracted Assets:**\n` +
                      `• **${headlinesCount} Headlines** generated\n` +
                      `• **${descriptionsCount} Descriptions** crafted\n` +
                      `• **${keywordsCount} Target Keywords** extracted\n` +
                      (searchThemesCount > 0 ? `• **${searchThemesCount} Search Themes** (PMax signals) identified\n` : "") +
                      (sitelinksCount > 0 ? `• **${sitelinksCount} Sitelinks** (Ad extensions) created\n\n` : "\n") +
                      `All assets have been auto-synced into your **Campaign Cockpit** on the right.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  }
                ]);
              } else {
                const setMsgId = `msg-url-set-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                setMessages(prev => [
                  ...prev,
                  {
                    id: setMsgId,
                    role: "assistant",
                    content: `🌐 **Website Configured:** Target URL has been set to **${cleanUrl}** in your Campaign Cockpit.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  }
                ]);
              }
            })
            .catch(err => {
              console.warn("[AI-GUIDED] Cockpit website analysis fetch error:", err.message);
              const errMsgId = `msg-url-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
              setMessages(prev => [
                ...prev,
                {
                  id: errMsgId,
                  role: "assistant",
                  content: `🌐 **Website Configured:** Target URL set to **${cleanUrl}**.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                }
              ]);
            })
            .finally(() => {
              setIsAnalyzingUrl(false);
            });
        } else {
          const simpleMsgId = `msg-url-simple-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          setMessages(prev => [
            ...prev,
            {
              id: simpleMsgId,
              role: "assistant",
              content: `🌐 **Website Updated:** Set target URL to **${cleanUrl}**.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        }
      }
    }

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
        updated.conversionGoals = tempEditValues.conversionGoal.split(",").map((s: string) => s.trim()).filter(Boolean);
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
        let cleanUrl = tempEditValues.website.trim().replace(/^["'(\[<\s]+/, "").replace(/[\s"'\(\)\[\]<>\.,;:?]+$/, "").trim();
        if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
          cleanUrl = `https://${cleanUrl}`;
        }
        updated.website = cleanUrl;
        if (updated.business) updated.business.website = cleanUrl;
      }

      if (editingField === "budgetType" && tempEditValues.budgetType !== undefined) {
        updated.budgetType = tempEditValues.budgetType;
        if (tempEditValues.budgetType === "TOTAL" && (!updated.endDate || !String(updated.endDate).trim())) {
          const baseStart = updated.startDate || todayIso;
          const d = new Date(baseStart);
          d.setDate(d.getDate() + 30);
          updated.endDate = d.toISOString().split("T")[0];
        }
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
      if (editingField === "assetGroupName" && tempEditValues.assetGroupName !== undefined) {
        updated.assetGroupName = tempEditValues.assetGroupName.trim();
      }
      if (editingField === "brandGuidelinesEnabled" && tempEditValues.brandGuidelinesEnabled !== undefined) {
        updated.brandGuidelinesEnabled = Boolean(tempEditValues.brandGuidelinesEnabled);
      }
      if (editingField === "customerAcquisitionMode" && tempEditValues.customerAcquisitionMode !== undefined) {
        updated.customerAcquisitionMode = tempEditValues.customerAcquisitionMode;
      }
      if (editingField === "trackingTemplate" && tempEditValues.trackingTemplate !== undefined) {
        updated.trackingTemplate = tempEditValues.trackingTemplate.trim();
      }
      if (editingField === "finalUrlSuffix" && tempEditValues.finalUrlSuffix !== undefined) {
        updated.finalUrlSuffix = tempEditValues.finalUrlSuffix.trim();
      }
      if (editingField === "displayPath1" && tempEditValues.displayPath1 !== undefined) {
        updated.displayPath1 = tempEditValues.displayPath1.trim();
      }
      if (editingField === "displayPath2" && tempEditValues.displayPath2 !== undefined) {
        updated.displayPath2 = tempEditValues.displayPath2.trim();
      }
      if (editingField === "mobileFinalUrl" && tempEditValues.mobileFinalUrl !== undefined) {
        updated.mobileFinalUrl = tempEditValues.mobileFinalUrl.trim();
      }
      if (editingField === "callPhoneNumber" && tempEditValues.callPhoneNumber !== undefined) {
        updated.callPhoneNumber = tempEditValues.callPhoneNumber.trim();
      }
      if (editingField === "euPolitical" && tempEditValues.euPolitical !== undefined) {
        updated.euPolitical = tempEditValues.euPolitical === "YES" ? "YES" : "NO";
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

      updated.readyForPublish = checkIsCampaignReady(updated);

      return updated;
    });

    setEditingField(null);
  };

  const handleKeyDownSave = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveFieldEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelFieldEdit();
    }
  };

  const cancelFieldEdit = () => {
    setEditingField(null);
    setFieldError(null);
  };

  // Keep readyForPublish continuously and reactively synchronized with all campaignState changes
  useEffect(() => {
    const isReady = checkIsCampaignReady(campaignState);
    if (campaignState.readyForPublish !== isReady) {
      setCampaignState(prev => ({
        ...prev,
        readyForPublish: isReady
      }));
    }
  }, [
    campaignState.businessName,
    campaignState.campaignName,
    campaignState.campaignType,
    campaignState.objective,
    campaignState.conversionGoals,
    campaignState.website,
    campaignState.dailyBudget,
    campaignState.biddingStrategy,
    campaignState.targetCpa,
    campaignState.targetRoas,
    campaignState.headlines,
    campaignState.longHeadlines,
    campaignState.descriptions,
    campaignState.keywords,
    campaignState.images,
    campaignState.logos,
    campaignState.brandLogos,
    campaignState.videos,
    campaignState.carouselCards,
    campaignState.locations,
    campaignState.adFormat,
    campaignState.appId,
    campaignState.merchantCenterId,
    campaignState.salesCountry,
    campaignState.feedLabel,
    campaignState.readyForPublish
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Markdown parser helper for chat text
  const renderFormattedMarkdown = (text?: string | null): React.ReactNode => {
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
      const userName = userProfile?.userName || (typeof window !== "undefined" ? localStorage.getItem("user_name") : "") || "Marketer";
      const bizName = userProfile?.businessName || userProfile?.organizationName || "";
      const cid = customerId || userProfile?.customerId || "";

      const welcomeBizText = bizName ? ` for **${bizName}**` : "";
      const initialMessage: Message = {
        id: "msg-initial",
        role: "assistant",
        content: `Hi ${userName}! 👋 Welcome to your Google Ads AI Copilot${welcomeBizText}.\n\n` +
          `I've loaded your connected Google Ads account (${cid ? `ID: \`${cid}\`` : "Active Account"}) and business details.\n\n` +
          `Tell me about what you'd like to promote today, or choose a starting point below:`,
        suggestions: [
          bizName ? `Generate complete campaign for ${bizName}` : "I want more leads & phone calls",
          "I want to sell products online",
          "I have a website URL to analyze",
          "What campaign type do you recommend?"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([initialMessage]);
    }
  }, [messages.length, userProfile, customerId]);

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

  // Explicit user confirmation to apply AI generated campaign state
  const applyProposedCampaignState = (proposed: CampaignState, messageId?: string) => {
    if (!proposed) return;
    setCampaignState(prev => {
      const resolvedBizName = proposed.businessName || prev.businessName || prev.business?.name || "";
      const resolvedCampaignType = proposed.campaignType || prev.campaignType || "";
      
      let resolvedCampaignName = prev.campaignName;
      if (isCustomCampaignName) {
        resolvedCampaignName = prev.campaignName;
      } else if (resolvedBizName && resolvedCampaignType) {
        resolvedCampaignName = generateCampaignName(resolvedBizName, resolvedCampaignType);
      } else if (resolvedBizName) {
        resolvedCampaignName = generateCampaignName(resolvedBizName);
      } else if (proposed.campaignName) {
        resolvedCampaignName = proposed.campaignName;
      }

      const resolvedObjective = proposed.objective || prev.objective || "";
      
      const rawMerged = {
        ...prev,
        ...proposed,
        businessName: resolvedBizName,
        campaignName: resolvedCampaignName,
        objective: resolvedObjective,
        campaignType: (resolvedCampaignType as any) || proposed.campaignType,
        website: proposed.website || prev.website,
        business: {
          ...(prev.business || {}),
          ...(proposed.business || {}),
          name: resolvedBizName,
          website: proposed.website || prev.website
        },
        budgetType: proposed.budgetType || prev.budgetType || "DAILY",
        startDate: proposed.startDate || prev.startDate || todayIso,
        endDate: proposed.endDate || prev.endDate,
        images: (proposed.images && proposed.images.length > 0) ? proposed.images : prev.images,
        logos: (proposed.logos && proposed.logos.length > 0) ? proposed.logos : prev.logos,
        videos: (proposed.videos && proposed.videos.length > 0) ? proposed.videos : prev.videos
      };

      const reconciled = reconcileCampaignStateWithManualFlow(rawMerged);
      if (!isCustomCampaignName && reconciled.businessName && reconciled.campaignType) {
        if (!prev.campaignName || !prev.campaignType || prev.campaignType !== reconciled.campaignType) {
          reconciled.campaignName = generateCampaignName(reconciled.businessName, reconciled.campaignType);
        }
      }
      return reconciled;
    });

    if (proposed.headlines && proposed.headlines.length > 0) setIsHeadlinesAiSourced(true);
    if (proposed.longHeadlines && proposed.longHeadlines.length > 0) setIsLongHeadlinesAiSourced(true);
    if (proposed.descriptions && proposed.descriptions.length > 0) setIsDescriptionsAiSourced(true);

    if (messageId) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isApplied: true, isDismissed: false } : m));
    }
  };

  const dismissProposedCampaignState = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDismissed: true } : m));
  };

  // Helper to open the Image Editor Cropper Modal
  const triggerImageEditor = (
    imageSrc: string,
    targetType: "IMAGE" | "LOGO",
    fileName: string,
    fileObj: File | null,
    dimensions: { width: number; height: number },
    violationReason: string | null,
    existingIndex: number | null = null
  ) => {
    setEditorImageSrc(imageSrc);
    setEditorTargetType(targetType);
    setEditorFileName(fileName);
    setEditorFile(fileObj);
    setEditorImageDimensions(dimensions);
    setEditorRuleViolationReason(violationReason);
    setEditingExistingAssetIndex(existingIndex);
    setEditorZoom(1);
    setEditorPanX(0);
    setEditorPanY(0);

    // Pick best default crop ratio
    if (targetType === "LOGO") {
      const isWide = dimensions.width / (dimensions.height || 1) >= 2.5;
      setEditorCropRatio(isWide ? "4:1" : "1:1");
    } else {
      const ratio = dimensions.width / (dimensions.height || 1);
      if (ratio >= 1.4) {
        setEditorCropRatio("1.91:1");
      } else if (ratio <= 0.65) {
        setEditorCropRatio("9:16");
      } else if (ratio <= 0.85) {
        setEditorCropRatio("4:5");
      } else {
        setEditorCropRatio("1:1");
      }
    }

    setIsImageEditorOpen(true);
  };

  // Direct Cockpit AI Auto-Generator (Checks website/business data, preserves existing filled info, & directly generates assets without creating chat prompts)
  const handleCockpitDirectAiGeneration = async (
    targetType: "IMAGE" | "LOGO" | "HEADLINES" | "LONG_HEADLINES" | "DESCRIPTIONS" | "KEYWORDS" | "HEADLINE_SINGLE" | "LONG_HEADLINE_SINGLE" | "DESCRIPTION_SINGLE" | "KEYWORD_SINGLE" | "ALL",
    isRegenerate: boolean = false,
    customHint?: string
  ) => {
    let activeBizName = (
      campaignState.businessName ||
      campaignState.business?.name ||
      userProfile?.businessName ||
      userProfile?.organizationName ||
      (campaignState.campaignName ? campaignState.campaignName.split(/[-–|_]/)[0] : "") ||
      ""
    ).trim();
    let activeWebsite = (campaignState.website || "").trim();
    let activeBizDesc = (campaignState.business?.description || (campaignState as any).productOverview || "").trim();
    const effectiveCampType = campaignState.campaignType ? formatCampaignTypeDisplay(campaignState.campaignType) : "";

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    // 1. If website is given but hasn't been scraped yet, scrape website first!
    if (activeWebsite && (!activeBizName || !activeBizDesc)) {
      setIsAnalyzingUrl(true);
      try {
        const res = await fetch(`${BACKEND}/api/ads/ai-guided/analyze-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: activeWebsite })
        });
        const data = await res.json();
        if (data.success) {
          const derivedBiz = data.derivedBusinessName || data.title?.split(/[-|]/)[0]?.trim() || "";
          if (!activeBizName && derivedBiz) activeBizName = derivedBiz;
          if (!activeBizDesc && data.description) activeBizDesc = data.description;

          setCampaignState(prev => ({
            ...prev,
            businessName: prev.businessName || derivedBiz,
            business: {
              ...(prev.business || {}),
              name: prev.business?.name || derivedBiz,
              description: prev.business?.description || data.description || ""
            },
            headlines: (data.headlines && data.headlines.length > 0 && !isRegenerate) ? Array.from(new Set([...(prev.headlines || []), ...data.headlines])) : (data.headlines || prev.headlines),
            longHeadlines: (data.longHeadlines && data.longHeadlines.length > 0 && !isRegenerate) ? Array.from(new Set([...(prev.longHeadlines || []), ...data.longHeadlines])) : (data.longHeadlines || prev.longHeadlines),
            descriptions: (data.descriptions && data.descriptions.length > 0 && !isRegenerate) ? Array.from(new Set([...(prev.descriptions || []), ...data.descriptions])) : (data.descriptions || prev.descriptions),
            keywords: (data.keywords && data.keywords.length > 0 && !isRegenerate) ? Array.from(new Set([...(prev.keywords || []), ...data.keywords])) : (data.keywords || prev.keywords)
          }));
        }
      } catch (err) {
        console.warn("Auto website analysis error:", err);
      } finally {
        setIsAnalyzingUrl(false);
      }
    }

    // 2. Safe Fallback: Default to "Our Business" if no name provided so AI generation never blocks
    if (!activeBizName && !activeWebsite) {
      activeBizName = "Our Business";
    }

    // 3. Directly trigger generation via Grok/Groq AI pipeline
    setIsLoading(true);
    setCockpitGeneratingTarget(targetType);
    try {
      const bizContext = activeBizName || "our brand";
      const descContext = activeBizDesc ? ` specializing in ${activeBizDesc}` : "";
      const siteContext = activeWebsite ? ` (Website: ${activeWebsite})` : "";
      const typeContext = effectiveCampType ? ` for our ${effectiveCampType} campaign` : "";

      let intentMessage = "";
      if (targetType === "ALL") {
        intentMessage = isRegenerate
          ? `Re-generate a fresh set of Google Ads campaign assets for "${bizContext}"${typeContext}${descContext}${siteContext}. Please provide new: 1) 5 Headlines (≤ 30 chars), 2) 3 Long Headlines (≤ 90 chars), 3) 4 Descriptions (≤ 90 chars) with strong CTAs, 4) Top 15 high-intent Keywords, and 5) Visual creatives concepts.`
          : `Generate a complete end-to-end Google Ads campaign package for "${bizContext}"${typeContext}${descContext}${siteContext}. Please provide: 1) 5 high-CTR Headlines (≤ 30 chars), 2) 3 Long Headlines (≤ 90 chars), 3) 4 Descriptions (≤ 90 chars) with strong CTAs, 4) Top 15 high-intent Keywords, and 5) Creative visual direction for Landscape (1.91:1), Square (1:1) marketing images and Brand Logo.`;
      } else if (targetType === "HEADLINE_SINGLE") {
        intentMessage = customHint
          ? `Generate 1 unique, high-converting Google Ads headline (strictly ≤ 30 characters) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 1 unique, high-converting Google Ads headline (strictly ≤ 30 characters) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "LONG_HEADLINE_SINGLE") {
        intentMessage = customHint
          ? `Generate 1 unique, compelling Google Ads long headline (strictly ≤ 90 characters) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 1 unique, compelling Google Ads long headline (strictly ≤ 90 characters) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "DESCRIPTION_SINGLE") {
        intentMessage = customHint
          ? `Generate 1 unique, engaging Google Ads description (strictly ≤ 90 characters with a strong CTA) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 1 unique, engaging Google Ads description (strictly ≤ 90 characters with a strong CTA) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "HEADLINES") {
        intentMessage = customHint
          ? `Generate 5 high-converting Google Ads compliant headlines (strictly ≤ 30 characters each) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 5 high-converting Google Ads compliant headlines (strictly ≤ 30 characters each) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "LONG_HEADLINES") {
        intentMessage = customHint
          ? `Generate 3 compelling Google Ads long headlines (strictly ≤ 90 characters each) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 3 compelling Google Ads long headlines (strictly ≤ 90 characters each) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "DESCRIPTIONS") {
        intentMessage = customHint
          ? `Generate 4 engaging Google Ads descriptions (strictly ≤ 90 characters each with strong CTAs) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 4 engaging Google Ads descriptions (strictly ≤ 90 characters each with strong CTAs) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "KEYWORDS") {
        intentMessage = customHint
          ? `Generate 15 high-converting Google Ads search keywords (mix of exact [keyword], phrase "keyword", and broad keyword) related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 15 high-converting Google Ads search keywords (mix of exact [keyword], phrase "keyword", and broad keyword) for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "KEYWORD_SINGLE") {
        intentMessage = customHint
          ? `Generate 1 high-intent Google Ads search keyword related to "${customHint}" for "${bizContext}"${typeContext}${descContext}${siteContext}.`
          : `Generate 1 high-intent Google Ads search keyword for "${bizContext}"${typeContext}${descContext}${siteContext}.`;
      } else if (targetType === "IMAGE") {
        intentMessage = `Generate high-converting marketing creative images for "${bizContext}"${typeContext}${descContext}${siteContext}. Requirements: Landscape (1.91:1) and Square (1:1) ad creative concepts.`;
      } else if (targetType === "LOGO") {
        intentMessage = `Generate a modern, high-resolution Google Ads business logo for "${bizContext}"${descContext}${siteContext}. Requirements: Clean vector style, square (1:1) aspect ratio on a solid background.`;
      }

      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: intentMessage }
          ],
          campaignState: {
            ...campaignState,
            businessName: activeBizName,
            website: activeWebsite,
            business: {
              ...(campaignState.business || {}),
              name: activeBizName,
              description: activeBizDesc,
              website: activeWebsite
            }
          }
        })
      });

      if (!res.ok) {
        throw new Error(`AI generation failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.campaignState || (data as any).headlines || (data as any).descriptions || (data as any).keywords || data.message) {
        let cs = data.campaignState || data;

        // If backend returned keywords in text message or top-level array, extract them
        if ((!cs.keywords || cs.keywords.length === 0) && data.message && typeof data.message === "string") {
          const kwMatches: string[] = [];
          const lines = data.message.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            const bulletMatch = trimmed.match(/^[-*•\d\.]+\s*([\["']?[a-zA-Z0-9\s\-_+&]+[\]"']?)$/);
            if (bulletMatch && bulletMatch[1]) {
              const cleaned = bulletMatch[1].trim();
              if (cleaned.length >= 2 && cleaned.length <= 80 && !cleaned.toLowerCase().includes("keyword")) {
                kwMatches.push(cleaned);
              }
            }
          }
          if (kwMatches.length > 0) {
            cs = { ...cs, keywords: kwMatches };
          }
        }

        setCampaignState(prev => {
          // Handle Single-Row Target Types: append ONLY 1 single new item and leave other fields completely untouched
          if (targetType === "HEADLINE_SINGLE") {
            const returnedHls = cs.headlines && cs.headlines.length > 0 ? cs.headlines : [];
            // Find first generated headline that isn't already in the list
            let newHl = returnedHls.find((h: string) => h && !(prev.headlines || []).some(existing => existing.trim().toLowerCase() === h.trim().toLowerCase()));
            if (!newHl && returnedHls.length > 0) {
              newHl = returnedHls[0];
            }
            if (!newHl && activeBizName) {
              newHl = `${activeBizName} - Official`;
            }
            if (newHl) {
              const cleanedHl = newHl.trim().slice(0, 30);
              const exists = (prev.headlines || []).some(existing => existing.trim().toLowerCase() === cleanedHl.toLowerCase());
              const finalHl = exists ? `${cleanedHl.slice(0, 26)} Deals`.slice(0, 30) : cleanedHl;
              return {
                ...prev,
                headlines: [...(prev.headlines || []), finalHl]
              };
            }
            return prev;
          }

          if (targetType === "LONG_HEADLINE_SINGLE") {
            const returnedLhls = cs.longHeadlines && cs.longHeadlines.length > 0 ? cs.longHeadlines : [];
            let newLhl = returnedLhls.find((lh: string) => lh && !(prev.longHeadlines || []).some(existing => existing.trim().toLowerCase() === lh.trim().toLowerCase()));
            if (!newLhl && returnedLhls.length > 0) {
              newLhl = returnedLhls[0];
            }
            if (!newLhl && activeBizName) {
              newLhl = `Discover Premium Solutions and Unmatched Quality with ${activeBizName}`;
            }
            if (newLhl) {
              const cleanedLhl = newLhl.trim().slice(0, 90);
              const exists = (prev.longHeadlines || []).some(existing => existing.trim().toLowerCase() === cleanedLhl.toLowerCase());
              const finalLhl = exists ? `${cleanedLhl.slice(0, 75)} - Explore Today`.slice(0, 90) : cleanedLhl;
              return {
                ...prev,
                longHeadlines: [...(prev.longHeadlines || []), finalLhl]
              };
            }
            return prev;
          }

          if (targetType === "DESCRIPTION_SINGLE") {
            const returnedDescs = cs.descriptions && cs.descriptions.length > 0 ? cs.descriptions : [];
            let newDesc = returnedDescs.find((d: string) => d && !(prev.descriptions || []).some(existing => existing.trim().toLowerCase() === d.trim().toLowerCase()));
            if (!newDesc && returnedDescs.length > 0) {
              newDesc = returnedDescs[0];
            }
            if (!newDesc && activeBizName) {
              newDesc = `Get exclusive offers and top-tier services at ${activeBizName}. Connect with us today!`;
            }
            if (newDesc) {
              const cleanedDesc = newDesc.trim().slice(0, 90);
              const exists = (prev.descriptions || []).some(existing => existing.trim().toLowerCase() === cleanedDesc.toLowerCase());
              const finalDesc = exists ? `${cleanedDesc.slice(0, 75)} - Order Now`.slice(0, 90) : cleanedDesc;
              return {
                ...prev,
                descriptions: [...(prev.descriptions || []), finalDesc]
              };
            }
            return prev;
          }

          if (targetType === "KEYWORD_SINGLE") {
            const returnedKws = cs.keywords && cs.keywords.length > 0 ? cs.keywords : [];
            let newKw = returnedKws.find((k: string) => k && !(prev.keywords || []).some(existing => existing.trim().toLowerCase() === k.trim().toLowerCase()));
            if (!newKw && returnedKws.length > 0) {
              newKw = returnedKws[0];
            }
            if (!newKw && activeBizName) {
              newKw = `"${activeBizName.toLowerCase()} services"`;
            }
            if (newKw) {
              const cleanedKw = newKw.trim();
              return {
                ...prev,
                keywords: [...(prev.keywords || []), cleanedKw]
              };
            }
            return prev;
          }

          const merged: CampaignState = {
            ...prev,
            // Preserve existing core settings & parameters if already set by user
            dailyBudget: prev.dailyBudget !== null && prev.dailyBudget !== undefined ? prev.dailyBudget : (cs.dailyBudget || null),
            campaignName: prev.campaignName || cs.campaignName,
            businessName: prev.businessName || cs.businessName || activeBizName,
            website: prev.website || cs.website,
            locations: (prev.locations && prev.locations.length > 0) ? prev.locations : (cs.locations || ["India"]),
            language: prev.language || cs.language || "All languages",
            startDate: prev.startDate || cs.startDate,
            endDate: prev.endDate || cs.endDate,
            biddingStrategy: prev.biddingStrategy || cs.biddingStrategy,
            merchantCenterId: prev.merchantCenterId || cs.merchantCenterId,
            salesCountry: prev.salesCountry || cs.salesCountry,
            feedLabel: prev.feedLabel || cs.feedLabel,
            appId: prev.appId || cs.appId,
            appName: prev.appName || cs.appName,
            business: {
              ...(prev.business || {}),
              ...(cs.business || {}),
              name: prev.businessName || prev.business?.name || cs.businessName || activeBizName,
              website: prev.website || prev.business?.website || cs.website
            },
            // If isRegenerate is true, replace; otherwise safely append new items while preserving existing old data
            headlines: isRegenerate && cs.headlines && cs.headlines.length > 0
              ? cs.headlines
              : (cs.headlines && cs.headlines.length > 0)
              ? Array.from(new Set([...(prev.headlines || []), ...cs.headlines]))
              : prev.headlines,
            longHeadlines: isRegenerate && cs.longHeadlines && cs.longHeadlines.length > 0
              ? cs.longHeadlines
              : (cs.longHeadlines && cs.longHeadlines.length > 0)
              ? Array.from(new Set([...(prev.longHeadlines || []), ...cs.longHeadlines]))
              : prev.longHeadlines,
            descriptions: isRegenerate && cs.descriptions && cs.descriptions.length > 0
              ? cs.descriptions
              : (cs.descriptions && cs.descriptions.length > 0)
              ? Array.from(new Set([...(prev.descriptions || []), ...cs.descriptions]))
              : prev.descriptions,
            keywords: isRegenerate && cs.keywords && cs.keywords.length > 0
              ? cs.keywords
              : (cs.keywords && cs.keywords.length > 0)
              ? Array.from(new Set([...(prev.keywords || []), ...cs.keywords]))
              : prev.keywords,
            images: isRegenerate && cs.images && cs.images.length > 0
              ? cs.images
              : (cs.images && cs.images.length > 0)
              ? Array.from(new Set([...(prev.images || []), ...cs.images]))
              : prev.images,
            logos: isRegenerate && cs.logos && cs.logos.length > 0
              ? cs.logos
              : (cs.logos && cs.logos.length > 0)
              ? Array.from(new Set([...(prev.logos || []), ...cs.logos]))
              : prev.logos
          };

          const validH = (merged.headlines || []).filter(h => h && h.trim().length > 0);
          const validD = (merged.descriptions || []).filter(d => d && d.trim().length > 0);
          const hasBud = merged.dailyBudget && merged.dailyBudget > 0;
          merged.readyForPublish = !!(hasBud && merged.campaignName && validH.length >= 3 && validD.length >= 2);
          return merged;
        });

        if (targetType === "HEADLINES" || targetType === "ALL") setIsHeadlinesAiSourced(true);
        if (targetType === "LONG_HEADLINES" || targetType === "ALL") setIsLongHeadlinesAiSourced(true);
        if (targetType === "DESCRIPTIONS" || targetType === "ALL") setIsDescriptionsAiSourced(true);
      }

      if (data.message) {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-direct-${Date.now()}`,
            role: "assistant",
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err: any) {
      console.error("[Direct Cockpit AI Generation Error]:", err);
      alert(`AI generation error: ${err.message || "Failed to generate assets"}`);
    } finally {
      setIsLoading(false);
      setCockpitGeneratingTarget(null);
    }
  };

  // Helper to trigger AI Image, Logo, Headlines, Long Headlines, Descriptions, All-in-One, or Text-Assets Generation (from Left Chat input)
  const handleTriggerAiAssetGeneration = async (targetType: "IMAGE" | "LOGO" | "HEADLINES" | "LONG_HEADLINES" | "DESCRIPTIONS" | "ALL_IN_ONE" | "TEXT_ASSETS") => {
    let activeBizName = (campaignState.businessName || campaignState.business?.name || "").trim();
    let activeWebsite = (campaignState.website || "").trim();
    let activeBizDesc = (campaignState.business?.description || (campaignState as any).productOverview || "").trim();
    const effectiveCampType = campaignState.campaignType ? formatCampaignTypeDisplay(campaignState.campaignType) : "";

    // 1. If website is present but details (business name/description) haven't been analyzed yet, analyze first!
    if (activeWebsite && (!activeBizName || !activeBizDesc)) {
      setIsAnalyzingUrl(true);
      try {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const res = await fetch(`${BACKEND}/api/ads/ai-guided/analyze-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: activeWebsite })
        });
        const data = await res.json();
        if (data.success) {
          const derivedBiz = data.derivedBusinessName || data.title?.split(/[-|]/)[0]?.trim() || "";
          if (!activeBizName && derivedBiz) activeBizName = derivedBiz;
          if (!activeBizDesc && data.description) activeBizDesc = data.description;

          setCampaignState(prev => ({
            ...prev,
            businessName: prev.businessName || derivedBiz,
            business: {
              ...(prev.business || {}),
              name: prev.business?.name || derivedBiz,
              description: prev.business?.description || data.description || ""
            },
            headlines: (data.headlines && data.headlines.length > 0) ? data.headlines : prev.headlines,
            longHeadlines: (data.longHeadlines && data.longHeadlines.length > 0) ? data.longHeadlines : prev.longHeadlines,
            descriptions: (data.descriptions && data.descriptions.length > 0) ? data.descriptions : prev.descriptions,
            keywords: (data.keywords && data.keywords.length > 0) ? data.keywords : prev.keywords
          }));
        }
      } catch (err) {
        console.warn("Auto website analysis error:", err);
      } finally {
        setIsAnalyzingUrl(false);
      }
    }

    // 2. Check if essential inputs are missing. If so, request missing information in chat!
    let promptText = "";
    if (!activeBizName && !activeWebsite) {
      if (targetType === "ALL_IN_ONE") {
        promptText = `Generate a complete Google Ads campaign creative package (Headlines, Long Headlines, Descriptions, Keywords, Marketing Images & Logo concepts) for my business. Business Name: [Enter Name], Website: [Enter URL], Main Offerings: [Enter Details].`;
      } else if (targetType === "TEXT_ASSETS") {
        promptText = `Generate all ad copy texts (5 Headlines ≤ 30 chars, 3 Long Headlines ≤ 90 chars, 4 Descriptions ≤ 90 chars) for my business. Business Name: [Enter Name], Website: [Enter URL].`;
      } else if (targetType === "LOGO") {
        promptText = `I want to generate a professional Google Ads logo. My business name is [Enter Business Name] and our website is [Enter Website URL or describe what we sell]. Please design a 1:1 square vector logo.`;
      } else if (targetType === "IMAGE") {
        promptText = `I want to generate Google Ads marketing images. My business name is [Enter Business Name] and our website is [Enter Website URL or describe services]. Please create landscape (1.91:1) and square (1:1) ad creative concepts.`;
      } else if (targetType === "HEADLINES") {
        promptText = `Generate high-converting Google Ads headlines (max 30 characters each). My business name is [Enter Business Name] and our website is [Enter Website URL or describe product/service].`;
      } else if (targetType === "LONG_HEADLINES") {
        promptText = `Generate compelling Google Ads long headlines (max 90 characters each). My business name is [Enter Business Name] and our website is [Enter Website URL or describe offerings].`;
      } else if (targetType === "DESCRIPTIONS") {
        promptText = `Generate engaging Google Ads descriptions (max 90 characters each) with clear calls-to-action. My business name is [Enter Business Name] and our website is [Enter Website URL].`;
      }
    } else {
      // 3. Construct prompt purely from available real user inputs
      const bizContext = activeBizName || "our brand";
      const descContext = activeBizDesc ? ` specializing in ${activeBizDesc}` : "";
      const siteContext = activeWebsite ? ` (Website: ${activeWebsite})` : "";
      const typeContext = effectiveCampType ? ` for our ${effectiveCampType} campaign` : "";

      if (targetType === "ALL_IN_ONE") {
        promptText = `Generate a complete end-to-end Google Ads campaign package for "${bizContext}"${typeContext}${descContext}${siteContext}. Please provide: 1) 5 high-CTR Headlines (≤ 30 chars), 2) 3 Long Headlines (≤ 90 chars), 3) 4 Descriptions (≤ 90 chars) with strong CTAs, 4) Top 15 high-intent Keywords, and 5) Creative visual direction for Landscape (1.91:1), Square (1:1) marketing images and Brand Logo.`;
      } else if (targetType === "TEXT_ASSETS") {
        promptText = `Generate complete high-converting Google Ads copy for "${bizContext}"${typeContext}${descContext}${siteContext}. Requirements: 1) 5 Punchy Headlines (strictly ≤ 30 characters each), 2) 3 Compelling Long Headlines (strictly ≤ 90 characters each), and 3) 4 Engaging Descriptions (strictly ≤ 90 characters each with strong calls-to-action).`;
      } else if (targetType === "LOGO") {
        promptText = `Generate a modern, high-resolution Google Ads business logo for "${bizContext}"${descContext}${siteContext}. Requirements: Clean vector style, square (1:1) aspect ratio on a solid/white background, optimized for mobile screens and Google Ads display.`;
      } else if (targetType === "IMAGE") {
        promptText = `Generate high-converting marketing creative images for "${bizContext}"${typeContext}${descContext}${siteContext}. Requirements: Professional high quality, Landscape (1.91:1 - 1200x628) and Square (1:1 - 1200x1200) Google Ads compliant creative compositions showcasing our key offerings with strong visual engagement.`;
      } else if (targetType === "HEADLINES") {
        promptText = `Generate 5 high-converting, Google Ads compliant headlines for "${bizContext}"${typeContext}${descContext}${siteContext}. Requirements: Each headline must be strictly under 30 characters, unique, action-oriented, and highlight our core value proposition.`;
      } else if (targetType === "LONG_HEADLINES") {
        promptText = `Generate 3 compelling, high-converting Google Ads long headlines for "${bizContext}"${typeContext}${descContext}${siteContext}. Requirements: Each long headline must be up to 90 characters, highlighting unique benefits, features, and key differentiators.`;
      } else if (targetType === "DESCRIPTIONS") {
        promptText = `Generate 4 persuasive Google Ads descriptions for "${bizContext}"${typeContext}${descContext}${siteContext}. Requirements: Each description must be up to 90 characters, include strong calls-to-action (CTA), and highlight our customer benefits.`;
      }
    }

    // If on mobile, switch to chat tab
    setMobileActiveTab("chat");
    setInputVal(promptText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
      }
    }, 120);
  };

  // Helper to open editor for an existing uploaded image or logo in Cockpit
  const handleEditExistingAsset = async (type: "IMAGE" | "LOGO", index: number) => {
    try {
      const assetList = type === "LOGO" ? campaignState.logos : campaignState.images;
      const asset = assetList?.[index];
      if (!asset) return;

      const url = typeof asset === "string" ? asset : asset?.url || "";
      const name = (typeof asset === "object" && asset?.name) ? asset.name : `${type.toLowerCase()}_${index + 1}.png`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        triggerImageEditor(
          url,
          type,
          name,
          null,
          { width: img.width, height: img.height },
          null,
          index
        );
      };
      img.onerror = () => {
        alert("Unable to load asset for editing. Please try re-uploading.");
      };
      img.src = url;
    } catch (err) {
      console.error("Error opening asset in editor:", err);
    }
  };

  // Upload raw or cropped image directly to backend API
  const uploadImagePayload = async (
    base64Data: string,
    fileName: string,
    targetType: "IMAGE" | "LOGO" | "VIDEO",
    existingIndex: number | null = null,
    extraMeta?: { fieldType?: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "LOGO" | "VIDEO"; aspectRatio?: string; dimensions?: { width: number; height: number } }
  ) => {
    setIsUploadingMedia(true);
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const resolvedFieldType = extraMeta?.fieldType || (targetType === "LOGO" ? "LOGO" : targetType === "VIDEO" ? "VIDEO" : "MARKETING_IMAGE");

    try {
      const res = await fetch(`${BACKEND}/api/ads/ai-guided/upload-media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64Data,
          fileName: fileName.startsWith("gads_") ? fileName : `gads_${Date.now()}_${fileName}`,
          fieldType: resolvedFieldType === "SQUARE_MARKETING_IMAGE" ? "MARKETING_IMAGE" : resolvedFieldType
        })
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (targetType === "VIDEO") {
          setCampaignState(prev => ({
            ...prev,
            videos: [...(prev.videos || []), { url: data.url, name: fileName }]
          }));
        } else if (targetType === "LOGO") {
          setCampaignState(prev => {
            const logos = [...(prev.logos || [])];
            const itemObj = {
              url: data.url,
              name: fileName,
              fieldType: "LOGO" as const,
              aspectRatio: extraMeta?.aspectRatio || "1:1",
              dimensions: extraMeta?.dimensions
            };
            if (existingIndex !== null && existingIndex >= 0 && existingIndex < logos.length) {
              logos[existingIndex] = itemObj;
            } else {
              logos.push(itemObj);
            }
            const updated = { ...prev, logos };
            if (typeof window !== "undefined") {
              try { localStorage.setItem("gads_ai_campaign_draft", JSON.stringify(updated)); } catch (e) {}
            }
            return updated;
          });
        } else {
          setCampaignState(prev => {
            const images = [...(prev.images || [])];
            const itemObj = {
              url: data.url,
              name: fileName,
              fieldType: resolvedFieldType,
              aspectRatio: extraMeta?.aspectRatio || (resolvedFieldType === "SQUARE_MARKETING_IMAGE" ? "1:1" : "1.91:1"),
              dimensions: extraMeta?.dimensions
            };
            if (existingIndex !== null && existingIndex >= 0 && existingIndex < images.length) {
              images[existingIndex] = itemObj;
            } else {
              images.push(itemObj);
            }
            const updated = { ...prev, images };
            if (typeof window !== "undefined") {
              try { localStorage.setItem("gads_ai_campaign_draft", JSON.stringify(updated)); } catch (e) {}
            }
            return updated;
          });
        }
        return true;
      } else {
        throw new Error(data.error || "Upload response unsuccessful");
      }
    } catch (err: any) {
      console.error("[Upload Error]:", err);
      setUploadValidationError("Upload failed. Please check file format and try again.");
      alert("Upload failed. Please try again.");
      return false;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Crop & Apply current image from canvas in Image Editor Modal
  const handleApplyCropAndSave = async () => {
    if (!editorImageSrc) return;
    setIsApplyingCrop(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for cropping"));
        img.src = editorImageSrc;
      });

      // Target aspect ratio mapping
      let targetRatio = 1.91;
      let targetW = 1200;
      let targetH = 628;

      if (editorCropRatio === "1.91:1") {
        targetRatio = 1200 / 628;
        targetW = 1200;
        targetH = 628;
      } else if (editorCropRatio === "1:1") {
        targetRatio = 1;
        targetW = 1200;
        targetH = 1200;
      } else if (editorCropRatio === "4:5") {
        targetRatio = 4 / 5;
        targetW = 960;
        targetH = 1200;
      } else if (editorCropRatio === "9:16") {
        targetRatio = 9 / 16;
        targetW = 1080;
        targetH = 1920;
      } else if (editorCropRatio === "4:1") {
        targetRatio = 4 / 1;
        targetW = 1200;
        targetH = 300;
      }

      // Compute source crop box centering with zoom and pan
      const srcW = img.width;
      const srcH = img.height;
      const srcRatio = srcW / srcH;

      let cropW = srcW;
      let cropH = srcH;

      if (srcRatio > targetRatio) {
        // Image is wider than target ratio -> crop width
        cropW = srcH * targetRatio;
        cropH = srcH;
      } else {
        // Image is taller than target ratio -> crop height
        cropW = srcW;
        cropH = srcW / targetRatio;
      }

      // Apply zoom factor (zoom > 1 shrinks crop box window inside image)
      const effectiveZoom = Math.max(1, Math.min(3, editorZoom));
      cropW = cropW / effectiveZoom;
      cropH = cropH / effectiveZoom;

      // Centered crop coordinates with pan offset
      let cropX = (srcW - cropW) / 2 + (editorPanX * (srcW - cropW) * 0.5);
      let cropY = (srcH - cropH) / 2 + (editorPanY * (srcH - cropH) * 0.5);

      // Boundary clamp
      cropX = Math.max(0, Math.min(srcW - cropW, cropX));
      cropY = Math.max(0, Math.min(srcH - cropH, cropY));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize 2D canvas context");

      // Draw background white for transparent PNG logos
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw cropped and scaled image onto canvas
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

      const base64Data = canvas.toDataURL("image/jpeg", 0.92);
      const cleanName = (editorFileName || "cropped_asset.jpg").replace(/\.[^/.]+$/, "") + `_${editorCropRatio.replace(":", "x")}.jpg`;

      const success = await uploadImagePayload(
        base64Data,
        cleanName,
        editorTargetType,
        editingExistingAssetIndex,
        {
          fieldType: editorTargetType === "LOGO" ? "LOGO" : editorCropRatio === "1:1" ? "SQUARE_MARKETING_IMAGE" : "MARKETING_IMAGE",
          aspectRatio: editorCropRatio,
          dimensions: { width: targetW, height: targetH }
        }
      );

      if (success) {
        setIsImageEditorOpen(false);
        setEditorRuleViolationReason(null);
      }
    } catch (err: any) {
      console.error("Error cropping image:", err);
      alert("Failed to crop image. Please adjust and try again.");
    } finally {
      setIsApplyingCrop(false);
    }
  };

  // Direct Media File Upload Handler with Google Ads Rule Verification & Smart Editor Opener
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetType: "IMAGE" | "LOGO" | "VIDEO") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset validation error
    setUploadValidationError(null);

    // Duplicate File Name Check in existing campaign assets
    const cleanFileName = file.name.trim().toLowerCase();
    const baseRawName = cleanFileName.replace(/\.[^/.]+$/, "");

    const matchesName = (candidateName?: string) => {
      if (!candidateName) return false;
      const cand = candidateName.toLowerCase().trim();
      const candBase = cand.replace(/\.[^/.]+$/, "").replace(/_\d+x\d+$/, "").replace(/_gads.*$/, "");
      return cand === cleanFileName || cand.includes(cleanFileName) || candBase === baseRawName;
    };

    const isDuplicateImage = (campaignState.images || []).some(img => {
      const name = typeof img === "object" ? (img?.name || "") : (typeof img === "string" ? img : "");
      return matchesName(name);
    });
    const isDuplicateLogo = (campaignState.logos || []).some(lg => {
      const name = typeof lg === "object" ? (lg?.name || "") : (typeof lg === "string" ? lg : "");
      return matchesName(name);
    });
    const isDuplicateVideo = (campaignState.videos || []).some(v => {
      const name = typeof v === "object" ? (v?.name || "") : (typeof v === "string" ? v : "");
      return matchesName(name);
    });

    if (isDuplicateImage || isDuplicateLogo || isDuplicateVideo) {
      const duplicateMsg = `This file "${file.name}" is already uploaded to this campaign. Please choose a different file or edit the existing one.`;
      setUploadValidationError(duplicateMsg);
      alert(duplicateMsg);
      if (e.target) e.target.value = "";
      return;
    }

    // Rule 1: The maximum file size for any image/logo is 5120 KB (5 MB)
    const maxSizeBytes = 5120 * 1024;
    if (file.size > maxSizeBytes && targetType !== "VIDEO") {
      const errMsg = `File is too large (${(file.size / 1024).toFixed(0)} KB). Maximum allowed file size is 5120 KB (5 MB).`;
      setUploadValidationError(errMsg);
      alert(errMsg);
      if (e.target) e.target.value = "";
      return;
    }

    // Direct Video Upload
    if (targetType === "VIDEO" || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await uploadImagePayload(reader.result as string, file.name, "VIDEO");
      };
      reader.readAsDataURL(file);
      if (e.target) e.target.value = "";
      return;
    }

    // Validate image/logo aspect ratio and minimum dimensions
    try {
      const fileUrl = URL.createObjectURL(file);
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error("Unable to read image dimensions"));
        img.src = fileUrl;
      });

      const { width, height } = dimensions;
      const ratio = width / (height || 1);

      let ruleViolationReason: string | null = null;
      let detectedAspect = "1.91:1";
      let detectedFieldType: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "LOGO" = "MARKETING_IMAGE";

      if (targetType === "LOGO") {
        detectedFieldType = "LOGO";
        // Logo Guidelines:
        // Square (1:1): Min 128x128, Rec 1200x1200 (aspect ratio 0.95 - 1.05)
        // Landscape (4:1): Min 512x128, Rec 1200x300 (aspect ratio 3.5 - 4.5)
        const isSquare = ratio >= 0.9 && ratio <= 1.1;
        const isLandscapeLogo = ratio >= 3.5 && ratio <= 4.5;
        detectedAspect = isLandscapeLogo ? "4:1" : "1:1";

        if (!isSquare && !isLandscapeLogo) {
          ruleViolationReason = `Logo aspect ratio (${ratio.toFixed(2)}:1, ${width}x${height}px) does not match Google Ads logo specifications. Required: Square (1:1) or Landscape (4:1).`;
        } else if (isSquare && (width < 128 || height < 128)) {
          ruleViolationReason = `Square logo must be at least 128x128 pixels (uploaded: ${width}x${height}px).`;
        } else if (isLandscapeLogo && (width < 512 || height < 128)) {
          ruleViolationReason = `Landscape logo (4:1) must be at least 512x128 pixels (uploaded: ${width}x${height}px).`;
        }
      } else if (targetType === "IMAGE") {
        // Marketing Image Guidelines:
        // Landscape (1.91:1): Min 600x314, Rec 1200x628 (ratio ~1.85 - 2.05)
        // Square (1:1): Min 300x300, Rec 1200x1200 (ratio ~0.95 - 1.05)
        // Portrait (4:5): Min 480x600, Rec 960x1200 (ratio ~0.75 - 0.85)
        // Tall Portrait (9:16): Min 600x1067, Rec 1080x1920 (ratio ~0.50 - 0.62)
        const isLandscape = ratio >= 1.8 && ratio <= 2.05;
        const isSquare = ratio >= 0.95 && ratio <= 1.05;
        const isPortrait45 = ratio >= 0.75 && ratio <= 0.85;
        const isTall916 = ratio >= 0.50 && ratio <= 0.62;

        if (isSquare) {
          detectedFieldType = "SQUARE_MARKETING_IMAGE";
          detectedAspect = "1:1";
        } else if (isLandscape) {
          detectedFieldType = "MARKETING_IMAGE";
          detectedAspect = "1.91:1";
        } else if (isPortrait45) {
          detectedFieldType = "MARKETING_IMAGE";
          detectedAspect = "4:5";
        } else if (isTall916) {
          detectedFieldType = "MARKETING_IMAGE";
          detectedAspect = "9:16";
        }

        const matchesStandardRatio = isLandscape || isSquare || isPortrait45 || isTall916;

        if (!matchesStandardRatio) {
          ruleViolationReason = `Image aspect ratio (${ratio.toFixed(2)}:1, ${width}x${height}px) does not match Google Ads standard creative ratios (Landscape 1.91:1, Square 1:1, Portrait 4:5, or Story 9:16).`;
        } else if (width < 300 || height < 300) {
          ruleViolationReason = `Marketing image must have at least 300x300px minimum dimension (uploaded: ${width}x${height}px).`;
        }
      }

      // If rules are violated -> Open Image Editor & Cropper Modal automatically!
      if (ruleViolationReason) {
        setUploadValidationError(ruleViolationReason);
        triggerImageEditor(fileUrl, targetType, file.name, file, dimensions, ruleViolationReason, null);
        if (e.target) e.target.value = "";
        return;
      }

      // If strictly compliant, proceed with direct upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        await uploadImagePayload(reader.result as string, file.name, targetType, null, {
          fieldType: detectedFieldType,
          aspectRatio: detectedAspect,
          dimensions
        });
      };
      reader.readAsDataURL(file);
    } catch (dimErr) {
      console.warn("Could not verify dimensions directly, proceeding with direct upload:", dimErr);
      const reader = new FileReader();
      reader.onloadend = async () => {
        await uploadImagePayload(reader.result as string, file.name, targetType, null);
      };
      reader.readAsDataURL(file);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // ── Past Media Library Fetch & Attach Handlers ──
  const fetchPastMediaLibrary = async () => {
    setIsLoadingPastMedia(true);
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    try {
      const res = await fetch(`${BACKEND}/api/ads/ai-guided/media-library`);
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setPastMediaList(data.files);
      }
    } catch (err) {
      console.warn("[AI-GUIDED] Failed to load media library from ImageKit:", err);
    } finally {
      setIsLoadingPastMedia(false);
    }
  };

  const openMediaSourcePicker = (target: "IMAGE" | "LOGO" | "VIDEO") => {
    setActiveUploadTarget(target);
    setIsMediaSourceModalOpen(true);
  };

  const handleSelectPastMediaItem = (item: any) => {
    if (!item || !item.url) return;
    const targetType = activeUploadTarget;

    // Check for duplicate in campaignState (by URL or file name)
    const isAlreadyAttached = [
      ...(campaignState.images || []),
      ...(campaignState.logos || []),
      ...(campaignState.videos || [])
    ].some(media => {
      const mediaUrl = typeof media === "string" ? media : (media as any)?.url || "";
      const mediaName = typeof media === "object" ? (media as any)?.name || "" : "";
      return (mediaUrl && mediaUrl === item.url) || (mediaName && item.name && mediaName.toLowerCase() === item.name.toLowerCase());
    });

    if (isAlreadyAttached) {
      const duplicateMsg = `This file "${item.name || 'item'}" is already attached to this campaign.`;
      setUploadValidationError(duplicateMsg);
      alert(duplicateMsg);
      return;
    }

    if (targetType === "VIDEO" || item.fileType === "video" || item.fieldType === "VIDEO") {
      setCampaignState(prev => ({
        ...prev,
        videos: [...(prev.videos || []), { url: item.url, name: item.name }]
      }));
    } else if (targetType === "LOGO" || item.fieldType === "LOGO") {
      setCampaignState(prev => {
        const logos = [...(prev.logos || [])];
        logos.push({
          url: item.url,
          name: item.name,
          fieldType: "LOGO" as const,
          aspectRatio: item.aspectRatio || "1:1",
          dimensions: item.dimensions
        });
        return { ...prev, logos };
      });
    } else {
      setCampaignState(prev => {
        const images = [...(prev.images || [])];
        const isSq = item.aspectRatio === "1:1" || item.fieldType === "SQUARE_MARKETING_IMAGE";
        images.push({
          url: item.url,
          name: item.name,
          fieldType: isSq ? ("SQUARE_MARKETING_IMAGE" as const) : ("MARKETING_IMAGE" as const),
          aspectRatio: item.aspectRatio || (isSq ? "1:1" : "1.91:1"),
          dimensions: item.dimensions
        });
        return { ...prev, images };
      });
    }

    setIsPastMediaModalOpen(false);
    setIsMediaSourceModalOpen(false);
  };

  const handleDeletePastMediaItem = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (!item || !item.id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name}" from your ImageKit library? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/api/ads/ai-guided/media-library/${encodeURIComponent(item.id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        // Remove item from state
        setPastMediaList(prev => prev.filter(f => f.id !== item.id));
      } else {
        alert(data.error || "Failed to delete file from ImageKit");
      }
    } catch (err: any) {
      console.error("[Delete Media Error]:", err);
      alert("Failed to delete file from library. Please try again.");
    }
  };

  // Backwards compatible trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMediaUpload(e, activeUploadTarget);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading || isPublishing) return;

    // Immediately guard against double-clicks, rapid Enter keys, or button spamming
    setIsLoading(true);
    setPublishError(null);
    setInputVal("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

    // Step 1: Extract User Manual Inputs from prompt & Auto-Apply directly to Cockpit
    let activeState = { ...campaignState };
    let didUserProvideManualValues = false;

    // A. Manual URL Detection
    const urlMatch = text.match(/https?:\/\/[^\s]+/i) || text.match(/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
    if (urlMatch && urlMatch[0]) {
      let detectedUrl = urlMatch[0].replace(/[.,;:!?)]+$/, "");
      if (!detectedUrl.startsWith("http")) {
        detectedUrl = "https://" + detectedUrl;
      }
      activeState.website = detectedUrl;
      if (activeState.business) activeState.business.website = detectedUrl;
      didUserProvideManualValues = true;

      setIsAnalyzingUrl(true);
      try {
        console.log("[AI-GUIDED] URL detected in message, analyzing website:", detectedUrl);
        const res = await fetch(`${BACKEND}/api/ads/ai-guided/analyze-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: detectedUrl })
        });
        const analysisData = await res.json();
        
        const cleanCopyFrontend = (str: any, maxLen: number) => {
          if (!str || typeof str !== "string") return "";
          let c = str
            .replace(/[|│┃]/g, " - ")
            .replace(/[•●▪◆★►▶✔✓]/g, " ")
            .replace(/[\/~^_*<>{}[\]\\#@+=]/g, " ")
            .replace(/\s*[-–—]+\s*/g, " - ")
            .replace(/^[\s,.\-!?;:_~@#$%^&*+=<>]+/, "")
            .replace(/[\s,:\-;_~@#$%^&*+=<>]+$/, "")
            .replace(/([,.!?;:])\1+/g, "$1")
            .replace(/([,.!?;:])([a-zA-Z0-9])/g, "$1 $2")
            .replace(/\s+/g, " ")
            .trim();
          if (c.length > maxLen) {
            c = c.slice(0, maxLen).replace(/[\s,:\-;_~@#$%^&*+=<>]+$/, "").trim();
          }
          return c;
        };

        const rawBizName = analysisData.derivedBusinessName || analysisData.title?.split(/[-|:]/)[0]?.trim() || activeState.businessName || "";
        const extractedBizName = cleanCopyFrontend(rawBizName, 25);

        const newHeadlines = (analysisData.headlines && analysisData.headlines.length > 0)
          ? analysisData.headlines.map((h: string) => cleanCopyFrontend(h, 30)).filter((h: string) => h.length > 0)
          : [];
        const newLongHeadlines = (analysisData.longHeadlines && analysisData.longHeadlines.length > 0)
          ? analysisData.longHeadlines.map((lh: string) => cleanCopyFrontend(lh, 90)).filter((lh: string) => lh.length > 0)
          : [];
        const newDescriptions = (analysisData.descriptions && analysisData.descriptions.length > 0)
          ? analysisData.descriptions.map((d: string) => cleanCopyFrontend(d, 90)).filter((d: string) => d.length > 0)
          : [];

        activeState = {
          ...activeState,
          website: detectedUrl,
          businessName: activeState.businessName ? cleanCopyFrontend(activeState.businessName, 25) : extractedBizName,
          business: {
            ...(activeState.business || {}),
            name: activeState.business?.name ? cleanCopyFrontend(activeState.business.name, 25) : extractedBizName,
            website: detectedUrl,
            description: activeState.business?.description || cleanCopyFrontend(analysisData.description, 150) || ""
          },
          locations: (analysisData.locations && analysisData.locations.length > 0 && (!activeState.locations || activeState.locations.length === 0 || activeState.locations[0] === "India"))
            ? analysisData.locations
            : activeState.locations,
          language: (analysisData.language && (!activeState.language || activeState.language === "All languages"))
            ? (analysisData.language === "en" ? "English" : analysisData.language)
            : activeState.language,
          headlines: (newHeadlines.length > 0)
            ? Array.from(new Set([...(activeState.headlines || []).map(h => cleanCopyFrontend(h, 30)).filter(Boolean), ...newHeadlines]))
            : (activeState.headlines || []).map(h => cleanCopyFrontend(h, 30)).filter(Boolean),
          longHeadlines: (newLongHeadlines.length > 0)
            ? Array.from(new Set([...(activeState.longHeadlines || []).map(lh => cleanCopyFrontend(lh, 90)).filter(Boolean), ...newLongHeadlines]))
            : (activeState.longHeadlines || []).map(lh => cleanCopyFrontend(lh, 90)).filter(Boolean),
          descriptions: (newDescriptions.length > 0)
            ? Array.from(new Set([...(activeState.descriptions || []).map(d => cleanCopyFrontend(d, 90)).filter(Boolean), ...newDescriptions]))
            : (activeState.descriptions || []).map(d => cleanCopyFrontend(d, 90)).filter(Boolean),
          keywords: (analysisData.keywords && analysisData.keywords.length > 0)
            ? Array.from(new Set([...(activeState.keywords || []), ...analysisData.keywords]))
            : activeState.keywords,
          searchThemes: (analysisData.searchThemes && analysisData.searchThemes.length > 0)
            ? Array.from(new Set([...(activeState.searchThemes || []), ...analysisData.searchThemes]))
            : activeState.searchThemes,
          sitelinks: (analysisData.sitelinks && analysisData.sitelinks.length > 0)
            ? Array.from(new Map([...(activeState.sitelinks || []), ...analysisData.sitelinks].map((s: any) => [s.text.toLowerCase(), s])).values())
            : activeState.sitelinks,
          callouts: (analysisData.callouts && analysisData.callouts.length > 0)
            ? Array.from(new Set([...(activeState.callouts || []), ...analysisData.callouts]))
            : activeState.callouts,
          structuredSnippets: (analysisData.structuredSnippets && analysisData.structuredSnippets.length > 0)
            ? [...(activeState.structuredSnippets || []), ...analysisData.structuredSnippets]
            : activeState.structuredSnippets
        };
      } catch (err: any) {
        console.warn("[AI-GUIDED] analyze-url error (continuing with URL set):", err.message);
      } finally {
        setIsAnalyzingUrl(false);
      }
    }

    // B. Manual Budget Detection (e.g., "budget 1000", "₹500 / day", "daily budget 2000", "5000 budget")
    const budgetMatch = text.match(/(?:budget|spend|cost)?\s*(?:of|is|to|=|:)?\s*(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:₹|rs\.?|inr|\$|\/day|per day|daily)?/i);
    const explicitBudgetMatch = text.match(/(?:budget|spend|cost|रोज)\s*(?:is|of|to|=|:)?\s*(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:,[0-9]+)*)/i) ||
                                text.match(/(?:₹|rs\.?|inr|\$)\s*([0-9]+(?:,[0-9]+)*)/i) ||
                                text.match(/([0-9]+(?:,[0-9]+)*)\s*(?:₹|rs\.?|inr|\$|\/day|per day|daily budget|budget|aahe|आहे)/i);
    if (explicitBudgetMatch && explicitBudgetMatch[1]) {
      const parsedBudget = parseFloat(explicitBudgetMatch[1].replace(/,/g, ""));
      if (!isNaN(parsedBudget) && parsedBudget > 0) {
        activeState.dailyBudget = parsedBudget;
        didUserProvideManualValues = true;
      }
    }

    // C. Manual Business Name (e.g. "business name is X", "company name is X", "business: X", "I run X, an online...")
    const bizMatch = text.match(/(?:business(?:\s+name)?|company(?:\s+name)?|brand(?:\s+name)?|shop(?:\s+name)?)\s*(?:is|=|:)\s*([a-zA-Z0-9\s&'-]{2,30})/i) ||
                     text.match(/(?:I\s+run|I\s+own|we\s+run|for\s+my\s+shop|for\s+my\s+business)\s+([a-zA-Z0-9\s&'-]{2,30}?)(?:\s*,|\s+(?:an|a|which|selling|website|and)|\s*$)/i);
    if (bizMatch && bizMatch[1]) {
      const explicitBiz = bizMatch[1].trim();
      if (explicitBiz && !explicitBiz.toLowerCase().includes("budget") && !explicitBiz.toLowerCase().includes("website")) {
        activeState.businessName = explicitBiz;
        activeState.business = { ...(activeState.business || {}), name: explicitBiz };
        didUserProvideManualValues = true;
      }
    }

    // D. Manual Locations (e.g. "location is Mumbai", "target India", "locations: Delhi, Mumbai", "in Mumbai", "Mumbai target kara", "मुंबई target करा")
    const locMatch = text.match(/(?:location|locations|target location|city|country)\s*(?:is|are|=|:)\s*([a-zA-Z0-9\s,.-]+)/i) ||
                     text.match(/(?:^|[.!?\n]\s*|,\s*)([a-zA-Z\u0900-\u097F\s,.-]+?)\s+target\s*(?:kara|करा|karo|करो)?(?:\.|\s|$)/i) ||
                     text.match(/target\s+([a-zA-Z0-9\u0900-\u097F\s,.-]+?)(?:\s+(?:with|language|daily budget|budget|inr|rs|₹|is|aahe|आहे)|\.|\s*,|\s*$)/i) ||
                     text.match(/\bin\s+([a-zA-Z\u0900-\u097F\s,.-]+?)(?:\s*,|\s+(?:and|with|language|budget)|\.|\s*$)/i);
    if (locMatch && locMatch[1]) {
      const rawLocs = locMatch[1]
        .split(/,|and|\s+आणि\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && !s.toLowerCase().includes("budget") && !s.toLowerCase().includes("website") && !s.toLowerCase().includes("language"));
      if (rawLocs.length > 0) {
        activeState.locations = rawLocs;
        setSelectedLocationsList(rawLocs);
        didUserProvideManualValues = true;
      }
    }

    // E. Manual Language Detection (e.g. "English", "Hindi", "Marathi", "English language theva", "English language ठेवा")
    const langMatch = text.match(/([a-zA-Z\u0900-\u097F]+)\s+language\s+(?:theva|ठेवा|rakho|रखो)/i) ||
                      text.match(/\b(English|Hindi|Marathi|Gujarati|Tamil|Telugu|Bengali|Kannada|Malayalam|Punjabi)\b/i) ||
                      text.match(/(?:language|boli|bhasha|भाषा)\s*(?:is|=|:)?\s*([a-zA-Z\u0900-\u097F]+)/i);
    if (langMatch && langMatch[1]) {
      const detectedLang = langMatch[1].trim();
      const capitalized = detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1).toLowerCase();
      activeState.language = capitalized;
      didUserProvideManualValues = true;
    }

    // Immediately update Live Campaign Cockpit with user manual inputs
    setCampaignState(activeState);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputVal("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
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
      const aiMsgId = `ai-${Date.now()}`;

      // Check if AI suggested new campaign data
      const returnedCs = data.campaignState;
      const hasAiSuggestions = returnedCs && (
        (returnedCs.headlines && returnedCs.headlines.length > 0) ||
        (returnedCs.descriptions && returnedCs.descriptions.length > 0) ||
        (returnedCs.keywords && returnedCs.keywords.length > 0) ||
        (returnedCs.campaignType && returnedCs.campaignType !== activeState.campaignType) ||
        (returnedCs.dailyBudget && returnedCs.dailyBudget !== activeState.dailyBudget && !didUserProvideManualValues)
      );

      // Immediately update Live Cockpit with full, accurate campaign data
      if (returnedCs) {
        setCampaignState((prev) => {
          const mergedImages = (returnedCs.images && returnedCs.images.length > 0) ? returnedCs.images : prev.images;
          const mergedLogos = (returnedCs.logos && returnedCs.logos.length > 0) ? returnedCs.logos : prev.logos;
          const nextState: CampaignState = {
            ...prev,
            ...returnedCs,
            business: {
              ...(prev.business || {}),
              ...(returnedCs.business || {})
            },
            businessName: returnedCs.businessName || returnedCs.business?.name || prev.businessName,
            website: returnedCs.website || returnedCs.business?.website || prev.website,
            objective: returnedCs.objective || prev.objective,
            campaignType: returnedCs.campaignType || prev.campaignType,
            budgetType: returnedCs.budgetType || prev.budgetType,
            dailyBudget: returnedCs.dailyBudget !== undefined ? returnedCs.dailyBudget : prev.dailyBudget,
            biddingStrategy: returnedCs.biddingStrategy || prev.biddingStrategy,
            locations: (returnedCs.locations && returnedCs.locations.length > 0) ? returnedCs.locations : prev.locations,
            headlines: (returnedCs.headlines && returnedCs.headlines.length > 0) ? returnedCs.headlines : prev.headlines,
            descriptions: (returnedCs.descriptions && returnedCs.descriptions.length > 0) ? returnedCs.descriptions : prev.descriptions,
            longHeadlines: (returnedCs.longHeadlines && returnedCs.longHeadlines.length > 0) ? returnedCs.longHeadlines : prev.longHeadlines,
            keywords: (returnedCs.keywords && returnedCs.keywords.length > 0) ? returnedCs.keywords : prev.keywords,
            searchThemes: (returnedCs.searchThemes && returnedCs.searchThemes.length > 0) ? returnedCs.searchThemes : prev.searchThemes,
            sitelinks: (returnedCs.sitelinks && returnedCs.sitelinks.length > 0) ? returnedCs.sitelinks : prev.sitelinks,
            callouts: (returnedCs.callouts && returnedCs.callouts.length > 0) ? returnedCs.callouts : prev.callouts,
            structuredSnippets: (returnedCs.structuredSnippets && returnedCs.structuredSnippets.length > 0) ? returnedCs.structuredSnippets : prev.structuredSnippets,
            promotions: (returnedCs.promotions && returnedCs.promotions.length > 0) ? returnedCs.promotions : prev.promotions,
            prices: (returnedCs.prices && returnedCs.prices.length > 0) ? returnedCs.prices : prev.prices,
            messages: (returnedCs.messages && returnedCs.messages.length > 0) ? returnedCs.messages : prev.messages,
            leadForms: (returnedCs.leadForms && returnedCs.leadForms.length > 0) ? returnedCs.leadForms : prev.leadForms,
            merchantCenterId: returnedCs.merchantCenterId !== undefined ? returnedCs.merchantCenterId : prev.merchantCenterId,
            merchantId: returnedCs.merchantCenterId !== undefined ? returnedCs.merchantCenterId : prev.merchantId,
            images: mergedImages,
            logos: mergedLogos
          };
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("gads_ai_campaign_draft", JSON.stringify(nextState));
            } catch (e) {}
          }
          return nextState;
        });

        if (returnedCs.locations && Array.isArray(returnedCs.locations) && returnedCs.locations.length > 0) {
          setSelectedLocationsList(returnedCs.locations);
        }
      }

      const assistantMessage: Message = {
        id: aiMsgId,
        role: "assistant",
        content: data.message || "I've analyzed your instructions and formulated recommendations.",
        suggestions: data.suggestions || [],
        campaignState: data.campaignState,
        proposedCampaignState: undefined,
        isApplied: true,
        isDismissed: false,
        generatedImages: data.generatedImages || [],
        readyForReview: data.readyForReview,
        readyForPublish: data.readyForPublish,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If Grok AI generated suggestions or copy, trigger Antigravity-style notification banner with 3 options
      if (hasAiSuggestions && returnedCs) {
        const isGenerationRequest = /generate|create headlines|create descriptions|write copy|suggest|recommend|ideas|keywords|all required/i.test(text);
        
        const suggestionsPayload = {
          proposedState: returnedCs,
          messageId: aiMsgId,
          aiExplanation: data.message,
          suggestedHeadlines: returnedCs.headlines || [],
          suggestedDescriptions: returnedCs.descriptions || [],
          suggestedLongHeadlines: returnedCs.longHeadlines || [],
          suggestedKeywords: returnedCs.keywords || [],
          suggestedBudget: returnedCs.dailyBudget || null,
          suggestedLocations: returnedCs.locations || [],
          suggestedType: returnedCs.campaignType || "",
          suggestedObjective: returnedCs.objective || "",
          suggestedBidding: returnedCs.biddingStrategy || ""
        };

        setPendingAiSuggestions(suggestionsPayload);

        // Display floating notification banner in Antigravity style
        const numHeadlines = (returnedCs.headlines || []).length;
        const numDescs = (returnedCs.descriptions || []).length;
        const numKeywords = (returnedCs.keywords || []).length;
        
        let summaryText = "";
        if (numHeadlines > 0 || numDescs > 0) {
          summaryText = `${numHeadlines} Headlines, ${numDescs} Descriptions${numKeywords > 0 ? `, ${numKeywords} Keywords` : ""} ready for review`;
        } else if (returnedCs.campaignType) {
          summaryText = `Recommended ${formatCampaignTypeDisplay(returnedCs.campaignType)} strategy`;
        } else {
          summaryText = "AI generated campaign recommendations ready";
        }

        setAiNotificationBanner({
          title: isGenerationRequest ? "Grok AI Generated Ad Creatives" : "Grok AI Strategy Recommendations",
          summary: summaryText,
          suggestionsData: suggestionsPayload
        });
      }
    } catch (err: any) {
      console.error("[AI Chat Error]:", err);
      const errorMessage: Message = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Notice:** Could not reach the AI reasoning engine right now (${err.message}). Your inputs were saved in the cockpit.`,
        suggestions: ["Use Recommended Settings", "I want more leads", "I want more sales", "Set Daily Budget to ₹1,000"],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);

    // Generate a unique idempotency key for this creation action attempt
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "demo-org-123";

      const effectiveState = { ...campaignState };
      
      // 1. Business Name Validation & Sanitization
      const rawBizName = effectiveState.businessName || effectiveState.business?.name;
      if (!rawBizName || !String(rawBizName).trim()) {
        startFieldEdit("businessName");
        throw new Error("Business Name is required. Please specify your business or shop name in chat or the Live Cockpit.");
      }
      const cleanBizName = String(rawBizName).replace(/[|│┃]/g, " - ").replace(/[•●▪◆★►▶✔✓\/~^_*<>{}[\]\\#@+=]/g, " ").replace(/\s*[-–—]+\s*/g, " - ").replace(/^[\s,.\-!?;:_~@#$%^&*+=<>]+/, "").replace(/[\s,:\-;_~@#$%^&*+=<>]+$/, "").replace(/\s+/g, " ").trim().slice(0, 25);
      effectiveState.businessName = cleanBizName;

      // 2. Budget Validation (Daily Budget vs Campaign Total Budget)
      const budgetNum = Number(effectiveState.dailyBudget);
      const isTotalBudget = effectiveState.budgetType === "TOTAL";
      if (!effectiveState.dailyBudget || isNaN(budgetNum) || budgetNum <= 0) {
        startFieldEdit("dailyBudget");
        throw new Error(`${isTotalBudget ? "Campaign Total Budget" : "Daily Budget"} is required and must be greater than ₹0. Please set a budget in chat or the Live Cockpit.`);
      }

      // 3. Campaign Name Validation (Must not be empty)
      if (!effectiveState.campaignName || !effectiveState.campaignName.trim()) {
        effectiveState.campaignName = generateCampaignName(cleanBizName, effectiveState.campaignType);
      }

      // 4. Final URL Validation
      const rawUrl = effectiveState.website || (effectiveState as any).finalUrl || (effectiveState as any).targetUrl || (effectiveState as any).landingPage || (effectiveState as any).url || effectiveState.business?.website;
      if (rawUrl && String(rawUrl).trim()) {
        let cleanUrl = String(rawUrl).trim().replace(/^["'(\[<\s]+/, "").replace(/[\s"'\(\)\[\]<>\.,;:?]+$/, "").trim();
        if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
          cleanUrl = `https://${cleanUrl}`;
        }
        effectiveState.website = cleanUrl;
      } else if (effectiveState.campaignType !== "APP") {
        startFieldEdit("website");
        throw new Error("Final URL (website) is missing. Please enter your website or landing page URL in the Live Cockpit or tell AI in the chat.");
      }

      // Helper for clean copy text
      const sanitizeCopy = (t: any, maxLen: number) => {
        if (!t || typeof t !== "string") return "";
        let c = t
          .replace(/[\u{1F000}-\u{1FFFF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{200D}\u{FE0F}]/gu, " ")
          .replace(/[→←↑↓↔↕↖↗↘↙⇒⇐⇑⇓⇔➜➔➤►▶◀◄▲▼●•▪◆★☆✓✔✕✖✗]/g, " - ")
          .replace(/[“”„‟«»]/g, '"')
          .replace(/[‘’‚‛`]/g, "'")
          .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ")
          .replace(/[|│┃]/g, " - ")
          .replace(/[\/~^_*<>{}[\]\\#@+=]/g, " ")
          .replace(/\s*[-–—―]+\s*/g, " - ")
          .replace(/^[\s,.\-!?;:_~@#$%^&*+=<>'"\/]+/, "")
          .replace(/[\s,:\-;_~@#$%^&*+=<>'"\/]+$/, "")
          .replace(/([,.!?;:])\1+/g, "$1")
          .replace(/([,.!?;:])([a-zA-Z0-9])/g, "$1 $2")
          .replace(/\s+/g, " ")
          .trim();
        if (c.length > maxLen) {
          c = c.slice(0, maxLen).replace(/[\s,:\-;_~@#$%^&*+=<>'"\/]+$/, "").trim();
        }
        return c;
      };

      // 5. Locations Validation & Auto-Resolution (Frontend Level)
      const validLocs = (effectiveState.locations || []).filter((l: any) => l && String(l).trim());
      if (validLocs.length === 0) {
        if (selectedLocationsList && selectedLocationsList.length > 0 && selectedLocationsList[0]) {
          effectiveState.locations = selectedLocationsList;
        } else {
          // Safe smart default to India if not specified
          effectiveState.locations = ["India"];
          setCampaignState(p => ({ ...p, locations: ["India"] }));
        }
      }

      // 6. Language Auto-Resolution
      if (!effectiveState.language || !effectiveState.language.trim()) {
        effectiveState.language = "All languages";
        setCampaignState(p => ({ ...p, language: "All languages" }));
      }

      // 6b. Start Date and End Date Sanitization (Google Ads requires End Date > Start Date >= Today)
      const todayStr = new Date().toISOString().split("T")[0];
      if (!effectiveState.startDate || !String(effectiveState.startDate).trim() || String(effectiveState.startDate).trim() < todayStr) {
        effectiveState.startDate = todayStr;
        setCampaignState(p => ({ ...p, startDate: todayStr }));
      }
      // Helper to calculate default end date (+30 days from start date)
      const computeDefaultEndDate = (start: string) => {
        const d = new Date(start || todayStr);
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0];
      };

      // Check End Date requirement based on Budget Type
      if (effectiveState.budgetType === "TOTAL") {
        if (!effectiveState.endDate || !String(effectiveState.endDate).trim()) {
          const autoEnd = computeDefaultEndDate(effectiveState.startDate);
          effectiveState.endDate = autoEnd;
          setCampaignState(p => ({ ...p, endDate: autoEnd }));
          console.info(`[AI-GUIDED] Auto-assigned 30-day End Date (${autoEnd}) for Campaign Total Budget.`);
        }
      }

      if (effectiveState.endDate) {
        const rawEndDate = String(effectiveState.endDate).trim();
        if (!rawEndDate) {
          if (effectiveState.budgetType === "TOTAL") {
            const autoEnd = computeDefaultEndDate(effectiveState.startDate);
            effectiveState.endDate = autoEnd;
            setCampaignState(p => ({ ...p, endDate: autoEnd }));
          } else {
            delete effectiveState.endDate;
          }
        } else {
          const startMs = new Date(effectiveState.startDate).getTime();
          const endMs = new Date(rawEndDate).getTime();
          if (isNaN(endMs) || endMs <= startMs) {
            if (effectiveState.budgetType === "TOTAL") {
              // Auto-correct invalid end date to 30 days ahead of start date
              const autoEnd = computeDefaultEndDate(effectiveState.startDate);
              effectiveState.endDate = autoEnd;
              setCampaignState(p => ({ ...p, endDate: autoEnd }));
              console.warn(`[AI-GUIDED] Auto-corrected invalid End Date (${rawEndDate}) to (${autoEnd}) for Total Budget.`);
            } else {
              // End date must strictly be after start date; for optional daily budget, remove invalid same-day or past end date so campaign runs continuously
              console.warn(`[AI-GUIDED] Removing invalid same-day/past end date (${rawEndDate}) <= start date (${effectiveState.startDate}) to prevent Google Ads validation error.`);
              delete effectiveState.endDate;
              setCampaignState(p => ({ ...p, endDate: undefined }));
            }
          } else {
            effectiveState.endDate = rawEndDate;
          }
        }
      }

      // 6c. Tracking Template and Custom Parameters Sanitization
      if (effectiveState.trackingTemplate) {
        let tt = String(effectiveState.trackingTemplate).trim();
        if (tt && !tt.startsWith("http://") && !tt.startsWith("https://") && !tt.startsWith("{lpurl}") && !tt.startsWith("{unescapedlpurl}")) {
          if (tt.includes(".") || tt.includes("/") || tt.includes("{")) {
            tt = `https://${tt}`;
            effectiveState.trackingTemplate = tt;
          } else {
            delete effectiveState.trackingTemplate;
            setCampaignState(p => ({ ...p, trackingTemplate: undefined }));
          }
        }
      }
      if (Array.isArray((effectiveState as any).customParameters)) {
        (effectiveState as any).customParameters = (effectiveState as any).customParameters
          .map((cp: any) => {
            const rawKey = cp && (cp.key || cp.name);
            const rawVal = cp && (cp.value !== undefined ? cp.value : "");
            if (!rawKey || typeof rawKey !== "string") return null;
            const cleanKey = rawKey.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 16);
            if (!cleanKey) return null;
            return { key: cleanKey, value: String(rawVal).trim().slice(0, 250) };
          })
          .filter((p: any) => p !== null && p.key.length > 0);
      }

      // 7. Campaign Type Specific Client-Side Pre-Flight Checks & Sanitization
      const cType = effectiveState.campaignType || "PERFORMANCE_MAX";
      const validH = (effectiveState.headlines || []).map((h: any) => sanitizeCopy(String(h), 30)).filter((h: string) => h.length > 0);
      const validLH = (effectiveState.longHeadlines || []).map((lh: any) => sanitizeCopy(String(lh), 90)).filter((lh: string) => lh.length > 0);
      const validD = (effectiveState.descriptions || []).map((d: any) => sanitizeCopy(String(d), 90)).filter((d: string) => d.length > 0);
      const validK = (effectiveState.keywords || []).map((k: any) => sanitizeCopy(String(k), 80)).filter((k: string) => k.length > 0);

      effectiveState.headlines = validH;
      effectiveState.longHeadlines = validLH;
      effectiveState.descriptions = validD;
      effectiveState.keywords = validK;
      if (effectiveState.businessName) {
        effectiveState.businessName = sanitizeCopy(String(effectiveState.businessName), 25);
      }
      if (effectiveState.campaignName) {
        effectiveState.campaignName = sanitizeCopy(String(effectiveState.campaignName), 100);
      }

      if (effectiveState.adSchedule && Array.isArray(effectiveState.adSchedule)) {
        const seen = new Set<string>();
        effectiveState.adSchedule = effectiveState.adSchedule.filter((s: any) => {
          if (!s || !s.day || !s.start || !s.end) return false;
          const key = `${s.day}_${s.start}_${s.end}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      if (cType === "PERFORMANCE_MAX") {
        if (validH.length < 3) {
          throw new Error(`Performance Max requires at least 3 Headlines (${validH.length}/3 added). Please add headlines in the Live Cockpit or ask AI to generate them.`);
        }
        if (validLH.length < 1) {
          throw new Error("Performance Max requires at least 1 Long Headline (up to 90 chars). Please add one in the Live Cockpit or ask AI to generate it.");
        }
        if (validD.length < 2) {
          throw new Error(`Performance Max requires at least 2 Descriptions (${validD.length}/2 added). Please add descriptions in the Live Cockpit or ask AI to generate them.`);
        }
        const DEFAULT_PMAX_IMAGE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
        const DEFAULT_PMAX_LOGO = "https://ik.imagekit.io/automationjds/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";
        if (!effectiveState.images || !Array.isArray(effectiveState.images) || effectiveState.images.length === 0) {
          const autoImages = [
            { url: DEFAULT_PMAX_IMAGE, fieldType: "MARKETING_IMAGE", name: "Default_Landscape_Marketing_Image", aspectRatio: "1.91:1" },
            { url: DEFAULT_PMAX_IMAGE, fieldType: "SQUARE_MARKETING_IMAGE", name: "Default_Square_Marketing_Image", aspectRatio: "1:1" }
          ];
          effectiveState.images = autoImages;
          setCampaignState(p => ({ ...p, images: autoImages }));
        }
        if (!effectiveState.logos || !Array.isArray(effectiveState.logos) || effectiveState.logos.length === 0) {
          const autoLogos = [
            { url: DEFAULT_PMAX_LOGO, fieldType: "LOGO", name: "Default_Brand_Logo", aspectRatio: "1:1" }
          ];
          effectiveState.logos = autoLogos;
          setCampaignState(p => ({ ...p, logos: autoLogos }));
        }
      } else if (cType === "DISPLAY") {
        if (validH.length < 1) {
          throw new Error("Display campaigns require at least 1 Headline (up to 30 chars). Please add a headline in the Live Cockpit or ask AI to generate it.");
        }
        if (validLH.length < 1 && validH.length > 0) {
          effectiveState.longHeadlines = [validH[0]];
        }
        if (validD.length < 1) {
          throw new Error("Display campaigns require at least 1 Description (up to 90 chars). Please add a description in the Live Cockpit or ask AI to generate it.");
        }
        const DEFAULT_DISP_IMAGE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
        const DEFAULT_DISP_LOGO = "https://ik.imagekit.io/automationjds/tr:w-500,h-500,fo-auto/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";
        
        let currentImages: any[] = Array.isArray(effectiveState.images) ? [...effectiveState.images] : [];
        if (currentImages.length === 0) {
          currentImages = [
            { url: DEFAULT_DISP_IMAGE, fieldType: "MARKETING_IMAGE", name: "Default_Landscape_Marketing_Image", aspectRatio: "1.91:1" },
            { url: DEFAULT_DISP_IMAGE, fieldType: "SQUARE_MARKETING_IMAGE", name: "Default_Square_Marketing_Image", aspectRatio: "1:1" }
          ];
        } else {
          // Verify both landscape and square exist, or add appropriate transforms
          const hasLandscape = currentImages.some((img: any) => (img?.fieldType === "MARKETING_IMAGE" || img?.aspectRatio === "1.91:1"));
          const hasSquare = currentImages.some((img: any) => (img?.fieldType === "SQUARE_MARKETING_IMAGE" || img?.aspectRatio === "1:1"));
          
          if (!hasLandscape && currentImages.length > 0) {
            const firstImg = currentImages[0];
            const raw = typeof firstImg === "string" ? firstImg : firstImg?.url || firstImg?.data || DEFAULT_DISP_IMAGE;
            currentImages.push({ url: raw, fieldType: "MARKETING_IMAGE", name: "Landscape_Marketing_Image", aspectRatio: "1.91:1" });
          }
          if (!hasSquare && currentImages.length > 0) {
            const firstImg = currentImages[0];
            const raw = typeof firstImg === "string" ? firstImg : firstImg?.url || firstImg?.data || DEFAULT_DISP_IMAGE;
            currentImages.push({ url: raw, fieldType: "SQUARE_MARKETING_IMAGE", name: "Square_Marketing_Image", aspectRatio: "1:1" });
          }
        }
        effectiveState.images = currentImages;
        setCampaignState(p => ({ ...p, images: currentImages }));

        let currentLogos: any[] = Array.isArray(effectiveState.logos) ? [...effectiveState.logos] : [];
        // Filter out existing customer asset strings (e.g., customers/.../assets/...) that might have non-1:1 aspect ratios from other campaign types
        currentLogos = currentLogos.filter((l: any) => {
          const raw = typeof l === "string" ? l : l?.url || l?.data || "";
          return raw && !raw.startsWith("customers/");
        });

        if (currentLogos.length === 0) {
          currentLogos = [
            { url: DEFAULT_DISP_LOGO, fieldType: "LOGO", name: "Default_Brand_Logo", aspectRatio: "1:1" }
          ];
        }
        effectiveState.logos = currentLogos;
        setCampaignState(p => ({ ...p, logos: currentLogos }));
      } else if (cType === "SEARCH") {
        if (validH.length < 3) {
          throw new Error(`Search campaigns require at least 3 Headlines (${validH.length}/3 added).`);
        }
        if (validD.length < 2) {
          throw new Error(`Search campaigns require at least 2 Descriptions (${validD.length}/2 added).`);
        }
        if (validK.length < 1) {
          throw new Error("Search campaigns require at least 1 keyword.");
        }
        effectiveState.headlines = validH.slice(0, 15);
        effectiveState.descriptions = validD.slice(0, 4);
      } else if (cType === "DEMAND_GEN") {
        const dgFormat = (effectiveState.adFormat || "SINGLE_IMAGE").toUpperCase();
        if (validH.length < 1) {
          startFieldEdit("headlines");
          throw new Error("Demand Gen requires at least 1 Headline (up to 40 chars). Please add a headline in the Live Cockpit or ask AI to generate it.");
        }
        if (validD.length < 1) {
          startFieldEdit("descriptions");
          throw new Error("Demand Gen requires at least 1 Description (up to 90 chars). Please add a description in the Live Cockpit or ask AI to generate it.");
        }
        if (budgetNum < 416) {
          startFieldEdit("dailyBudget");
          throw new Error(`Demand Gen campaigns require a minimum Daily Budget of ₹416/day (currently ₹${budgetNum}/day).`);
        }
        const DEFAULT_DG_IMAGE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
        const DEFAULT_DG_LOGO = "https://ik.imagekit.io/automationjds/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";

        const dgLogos = (effectiveState.logos || []).filter((l: any) => l && (typeof l === "string" ? l.trim() : l.url || l.data || l.asset));
        if (dgLogos.length < 1) {
          const autoLogos = [
            { url: DEFAULT_DG_LOGO, fieldType: "LOGO", name: "Default_Brand_Logo", aspectRatio: "1:1" }
          ];
          effectiveState.logos = autoLogos;
          setCampaignState(p => ({ ...p, logos: autoLogos }));
        }
        if (dgFormat === "SINGLE_IMAGE") {
          const dgImages = (effectiveState.images || []).filter((im: any) => im && (typeof im === "string" ? im.trim() : im.url || im.data || im.asset));
          if (dgImages.length < 1) {
            const autoImages = [
              { url: DEFAULT_DG_IMAGE, fieldType: "MARKETING_IMAGE", name: "Default_Landscape_Marketing_Image", aspectRatio: "1.91:1" },
              { url: DEFAULT_DG_IMAGE, fieldType: "SQUARE_MARKETING_IMAGE", name: "Default_Square_Marketing_Image", aspectRatio: "1:1" }
            ];
            effectiveState.images = autoImages;
            setCampaignState(p => ({ ...p, images: autoImages }));
          }
        } else if (dgFormat === "VIDEO") {
          const dgVideos = (effectiveState.videos || []).filter((v: any) => v && (typeof v === "string" ? v.trim() : v.asset || v.videoId || v.url));
          if (dgVideos.length < 1) {
            throw new Error("Demand Gen Video format requires at least 1 YouTube video URL or asset.");
          }
          if (validLH.length < 1) {
            effectiveState.longHeadlines = [validH[0]];
          }
        } else if (dgFormat === "CAROUSEL") {
          const cards = Array.isArray(effectiveState.carouselCards) ? effectiveState.carouselCards : [];
          const validCards = cards.filter((c: any) => c && c.image?.trim() && c.headline?.trim());
          if (validCards.length < 2) {
            throw new Error(`Demand Gen Carousel format requires at least 2 cards with image and headline (${validCards.length}/2 added).`);
          }
        }
      } else if (cType === "APP") {
        if (!effectiveState.appId || !effectiveState.appId.trim()) {
          startFieldEdit("appId");
          throw new Error("App ID / Package Name is required for App campaigns.");
        }
      } else if (cType === "SHOPPING") {
        if (!effectiveState.merchantCenterId || !/^\d+$/.test(effectiveState.merchantCenterId)) {
          startFieldEdit("merchantCenterId");
          throw new Error("Valid Google Merchant Center Account ID is required for Shopping campaigns.");
        }
      }

      const res = await fetch(`${BACKEND}/api/ads/ai-guided/create-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId
        },
        body: JSON.stringify({
          customerId,
          campaignState: effectiveState,
          idempotencyKey
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.missingFields && Array.isArray(data.missingFields) && data.missingFields.length > 0) {
          throw new Error(`Campaign validation failed:\n• ${data.missingFields.join("\n• ")}`);
        }
        if (data.validationErrors && Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
          throw new Error(`Campaign validation failed:\n• ${data.validationErrors.map((e: any) => e.message || e).join("\n• ")}`);
        }
        const errMsg = data.error || data.message || (typeof data.details === "string" ? data.details : data.details?.error?.message) || "Failed to create campaign. Validation requirements may be missing.";
        throw new Error(errMsg);
      }

      setPublishSuccess(`🎉 Success! Campaign "${campaignState.campaignName || "AI Campaign"}" has been created in Google Ads.`);

      setTimeout(() => {
        router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
      }, 2500);
    } catch (err: any) {
      console.error("[Publish Error]:", err);
      const rawMsg = err.message || "Failed to publish campaign to Google Ads.";
      
      if (rawMsg.includes("operations.create.ad.responsive_display_ad.logo_images") || rawMsg.includes("logo_images") || (rawMsg.includes("dimensions of the image are not allowed") && rawMsg.includes("logo"))) {
        const friendlyMsg = `Google Ads Image Specification Notice: The attached business logo does not match the required 1:1 square aspect ratio or minimum 128x128 pixel dimensions for Responsive Display Ads. Please click the crop icon on your logo in the Cockpit to crop it to a 1:1 square (minimum 128x128px), or click below to adjust it.`;
        setPublishError(friendlyMsg);
        
        // Automatically open the Image Editor / Cropper for the offending logo if available
        if (campaignState.logos && campaignState.logos.length > 0) {
          handleEditExistingAsset("LOGO", 0);
        }
      } else if (rawMsg.includes("operations.create.ad.responsive_display_ad.marketing_images") || rawMsg.includes("square_marketing_images") || (rawMsg.includes("dimensions of the image are not allowed") && rawMsg.includes("marketing_images"))) {
        const friendlyMsg = `Google Ads Image Specification Notice: One of your marketing images does not meet Google Ads aspect ratio standards (Landscape 1.91:1 or Square 1:1). Please crop or replace the image in the Cockpit before launching.`;
        setPublishError(friendlyMsg);

        if (campaignState.images && campaignState.images.length > 0) {
          handleEditExistingAsset("IMAGE", 0);
        }
      } else if (rawMsg.includes("DESTINATION_NOT_WORKING") || rawMsg.includes("Landing page URL is unreachable")) {
        setPublishError(`Landing page URL (${campaignState.website}) is unreachable or returning an error (DESTINATION_NOT_WORKING). Please update to a live, working URL before launching.`);
      } else {
        setPublishError(rawMsg);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Clears all input information and navigates directly to campaign creation page
  const handleEditDetailsInForm = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("googleAds_prefill_campaign");
        localStorage.removeItem("googleAds_pending_campaign");
        localStorage.removeItem("googleAds_pmax_draft");
      }
    } catch (e) {
      console.warn("Could not clear localStorage drafts", e);
    }
    
    const cid = customerId || "6587355041";
    router.push(`/ads/campaigns/create?customerId=${cid}`);
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
      
      {/* Hidden File Inputs for Native Media Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => handleMediaUpload(e, "IMAGE")}
        className="hidden"
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => handleMediaUpload(e, "LOGO")}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={(e) => handleMediaUpload(e, "VIDEO")}
        className="hidden"
      />

      {/* ── Missing Parameters / Pending Requirements Interactive Dialog Modal ── */}
      {showMissingParamsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Required Campaign Parameters Missing
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    The following requirements must be completed before launching to Google Ads:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMissingParamsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Checklist of Missing Parameters */}
            <div className="space-y-2">
              {computeMissingRequirementsCockpit(campaignState).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {item.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMissingParamsModal(false);
                      item.fixAction();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>+ Complete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowMissingParamsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Google Ads Asset Upload Guidelines Modal ── */}
      {uploadGuidelineModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  uploadGuidelineModal === "LOGO" ? "bg-purple-50 text-purple-700" : uploadGuidelineModal === "VIDEO" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
                }`}>
                  {uploadGuidelineModal === "LOGO" ? <ImageIcon className="h-4 w-4" /> : uploadGuidelineModal === "VIDEO" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {uploadGuidelineModal === "LOGO" ? "Business Logo Guidelines" : uploadGuidelineModal === "VIDEO" ? "Video Creative Guidelines" : "Marketing Image Guidelines"}
                  </h3>
                  <p className="text-[11px] text-slate-500">Google Ads Performance Max & Multi-Channel Standards</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadGuidelineModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {uploadValidationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Validation Alert</p>
                  <p className="text-[11px] mt-0.5">{uploadValidationError}</p>
                </div>
              </div>
            )}

            {/* Modal Body with Specifications */}
            {uploadGuidelineModal === "IMAGE" && (
              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Add images that meet or can be cropped to these recommended sizes.
                </p>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-amber-700" />
                    Important Size Limit:
                  </span>
                  <p>The maximum file size for any image is <strong>5120 KB (5 MB)</strong>. Selected images may be auto-cropped. You can always edit afterwards.</p>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <span className="font-bold text-[11px] text-slate-900 block uppercase tracking-wider">Image Guidelines:</span>
                  
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">Landscape image (1.91:1) <span className="text-purple-600 font-semibold">(Required for PMax)</span></p>
                      <p className="text-slate-600 text-[10px]">Recommended size: <strong className="text-slate-800">1200 x 628</strong></p>
                      <p className="text-slate-500 text-[10px]">Min. size: 600 x 314</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">Square image (1:1) <span className="text-purple-600 font-semibold">(Required for PMax)</span></p>
                      <p className="text-slate-600 text-[10px]">Recommended size: <strong className="text-slate-800">1200 x 1200</strong></p>
                      <p className="text-slate-500 text-[10px]">Min. size: 300 x 300</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">(Optional) Portrait image (4:5)</p>
                      <p className="text-slate-600 text-[10px]">Recommended size: <strong className="text-slate-800">960 x 1200</strong></p>
                      <p className="text-slate-500 text-[10px]">Min. size: 480 x 600</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">(Optional) Tall Portrait image (9:16)</p>
                      <p className="text-slate-600 text-[10px]">Recommended: <strong className="text-slate-800">1080 x 1920</strong></p>
                      <p className="text-slate-500 text-[10px]">Min. required: 600 x 1067</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploadGuidelineModal === "LOGO" && (
              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Business logos should be clear and recognizable even when very small. Only approved logos will appear in your ads.
                </p>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <span className="font-bold text-[11px] text-slate-900 block uppercase tracking-wider">Logo Guidelines:</span>
                  
                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-purple-200 bg-purple-50/20">
                      <p className="font-bold text-slate-900">Square logo (1:1) <span className="text-purple-700 font-semibold">(Recommended)</span></p>
                      <p className="text-slate-600 text-[10px]">Recommended size: <strong className="text-slate-800">1200 x 1200 pixels</strong></p>
                      <p className="text-slate-500 text-[10px]">Minimum size: 128 x 128 pixels</p>
                      <p className="text-slate-500 text-[10px]">Maximum file size: 5120 KB (5 MB)</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-900">Landscape logo (4:1) <span className="text-slate-500 font-normal">(Optional)</span></p>
                      <p className="text-slate-600 text-[10px]">Recommended size: <strong className="text-slate-800">1200 x 300 pixels</strong></p>
                      <p className="text-slate-500 text-[10px]">Minimum size: 512 x 128 pixels</p>
                      <p className="text-slate-500 text-[10px]">Maximum file size: 5120 KB (5 MB)</p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-900 flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span>Selected images may be auto-cropped, but you can edit them afterwards. Only approved logos will appear in your ads. </span>
                    <a
                      href="https://support.google.com/google-ads/answer/15996355?hl=en&sjid=10284739279272388071-EU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline font-semibold hover:text-blue-900 inline-flex items-center gap-0.5"
                    >
                      Learn more about logo assets in Performance Max
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {uploadGuidelineModal === "VIDEO" && (
              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Performance Max and Video campaigns can utilize YouTube video assets (Horizontal 16:9, Vertical 9:16 Shorts, or Square 1:1) to drive conversions on YouTube and partner sites.
                </p>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50 text-[11px]">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">Video Formats:</span>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900">Landscape (16:9) & Vertical Shorts (9:16)</p>
                    <p className="text-slate-500 text-[10px]">Recommended: High-definition 1080p, duration 15-60 seconds.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUploadGuidelineModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = uploadGuidelineModal;
                  setUploadGuidelineModal(null);
                  if (target === "IMAGE") {
                    imageInputRef.current?.click();
                  } else if (target === "LOGO") {
                    logoInputRef.current?.click();
                  } else if (target === "VIDEO") {
                    videoInputRef.current?.click();
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Select & Upload {uploadGuidelineModal === "LOGO" ? "Logo" : uploadGuidelineModal === "VIDEO" ? "Video" : "Image"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              if (hasUnsavedProgress()) {
                setPendingExitAction("back");
                setIsExitPromptOpen(true);
              } else {
                router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
              }
            }}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Back to Manual Creation"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center p-0.5 shrink-0">
              <img src="/icon.jpeg" alt="JDS" className="w-full h-full object-contain rounded-md" />
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
            onClick={() => {
              if (hasUnsavedProgress()) {
                setPendingExitAction("back");
                setIsExitPromptOpen(true);
              } else {
                router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
              }
            }}
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
            onClick={() => setIsHistoryModalOpen(true)}
            title="View AI Generated & Published Campaigns History"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <History className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden sm:inline">Campaign History</span>
            {existingCampaignsList.length > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-200/80 text-purple-800 text-[10px] rounded-full font-mono">
                {existingCampaignsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (hasUnsavedProgress()) {
                setPendingExitAction("new_session");
                setIsExitPromptOpen(true);
              } else {
                executeResetSession();
              }
            }}
            title="Reset conversation and start fresh"
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
        
        {/* LEFT: AI Interactive Chat Column with Live Preview */}
        <div className={`flex-1 flex-col min-w-0 min-h-0 bg-white border-r border-slate-200 shadow-xs ${
          mobileActiveTab === "chat" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Top Live Preview Sync Header */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
                AI Campaign Chat & Live Previews
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 hidden sm:inline-block shrink-0">
                Live Auto-Sync
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReloadPreview}
                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Reload & sync previews with right-side cockpit changes"
              >
                <RefreshCw className={`h-2.5 w-2.5 text-blue-600 ${isReloadingPreview ? "animate-spin" : ""}`} />
                <span>Reload Previews</span>
              </button>
              <div className="text-[11px] text-slate-500 hidden md:flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden lg:inline">Previews update live with cockpit</span>
              </div>
            </div>
          </div>
          
          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`flex gap-3 ${
                    msg.role === "user"
                      ? "flex-row-reverse max-w-[92%] sm:max-w-[85%]"
                      : (Boolean(campaignState.objective && campaignState.campaignType) && (msg.readyForReview || msg.campaignState?.readyForReview || campaignState.readyForReview || (index === messages.length - 1 && (campaignState.headlines?.some(h => h && h.trim()) || campaignState.businessName || (campaignState.images && campaignState.images.length > 0)))))
                        ? "flex-row w-full max-w-full"
                        : "flex-row max-w-[92%] sm:max-w-[85%]"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden shadow-xs ${
                      msg.role === "user"
                        ? "bg-slate-800 text-white"
                        : "bg-white border border-slate-200 shadow-md p-0.5 ring-1 ring-blue-500/20"
                    }`}
                  >
                    {msg.role === "user" ? (
                      "You"
                    ) : (
                      <img
                        src="/icon.jpeg"
                        alt="JDS AI Assistant"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-xs font-medium"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs flex-1 min-w-0"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-2.5">
                        {renderFormattedMarkdown(msg.content)}
                      </div>
                    )}

                    {/* Notification message & single Apply button in chat bubble when preview is NOT open */}
                    {msg.role === "assistant" && !Boolean(campaignState.objective && campaignState.campaignType) && pendingAiSuggestions && pendingAiSuggestions.messageId === msg.id && (
                      <div className="mt-3 pt-3 border-t border-blue-100 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 p-3 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-white border border-blue-200 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
                            <img src="/icon.jpeg" alt="AI Suggestion" className="w-full h-full object-contain rounded-md" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 truncate">
                              AI Suggestion Ready
                            </p>
                            <p className="text-[10px] text-slate-600 truncate">
                              {pendingAiSuggestions.suggestedType ? `Recommended ${formatCampaignTypeDisplay(pendingAiSuggestions.suggestedType)} strategy` : "Click apply to update your cockpit"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (pendingAiSuggestions.proposedState) {
                              applyProposedCampaignState(pendingAiSuggestions.proposedState, pendingAiSuggestions.messageId);
                            }
                            setPendingAiSuggestions(null);
                            setAiNotificationBanner(null);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Apply</span>
                        </button>
                      </div>
                    )}

                    {/* AI Proposed Campaign Changes Confirmation Box */}
                    {msg.role === "assistant" && msg.proposedCampaignState && (
                      <div className={`mt-3.5 pt-3 border-t rounded-xl p-3.5 transition-all ${
                        msg.isApplied
                          ? "bg-emerald-50/80 border border-emerald-200 shadow-2xs"
                          : msg.isDismissed
                          ? "bg-slate-100/80 border border-slate-200"
                          : "bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200 shadow-xs"
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-xs ${
                              msg.isApplied
                                ? "bg-emerald-600 text-white"
                                : msg.isDismissed
                                ? "bg-slate-500 text-white"
                                : "bg-blue-600 text-white"
                            }`}>
                              {msg.isApplied ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">
                                {msg.isApplied 
                                  ? "Campaign Setup Applied"
                                  : msg.isDismissed
                                  ? "Suggested Updates Skipped"
                                  : "Review AI Generated Campaign Data"}
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                {msg.isApplied
                                  ? "These settings have been loaded into your Campaign Cockpit."
                                  : msg.isDismissed
                                  ? "Existing campaign configuration remains unchanged."
                                  : "Please confirm before updating your active campaign form."}
                              </p>
                            </div>
                          </div>

                          {msg.isApplied ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="h-3 w-3" /> Confirmed & Applied
                            </span>
                          ) : msg.isDismissed ? (
                            <button
                              type="button"
                              onClick={() => applyProposedCampaignState(msg.proposedCampaignState!, msg.id)}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                            >
                              Apply anyway
                            </button>
                          ) : null}
                        </div>

                        {/* Summary Grid of Generated Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-3">
                          {/* Dates */}
                          {(msg.proposedCampaignState.startDate || msg.proposedCampaignState.endDate) && (
                            <div className="flex items-start gap-2 bg-white/95 p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                              <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Dates</span>
                                <span className="font-semibold text-slate-800 truncate block">
                                  {msg.proposedCampaignState.startDate || "Immediate"} → {msg.proposedCampaignState.endDate || "Ongoing"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Campaign Type & Objective */}
                          {(msg.proposedCampaignState.campaignType || msg.proposedCampaignState.objective) && (
                            <div className="flex items-start gap-2 bg-white/95 p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                              <Target className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Objective & Type</span>
                                <span className="font-semibold text-slate-800 truncate block">
                                  {[msg.proposedCampaignState.objective, msg.proposedCampaignState.campaignType].filter(Boolean).join(" • ")}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Budget & Bidding */}
                          {(msg.proposedCampaignState.dailyBudget || msg.proposedCampaignState.biddingStrategy) && (
                            <div className="flex items-start gap-2 bg-white/95 p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                  {msg.proposedCampaignState.budgetType === "TOTAL" ? "Campaign Total Budget" : "Average Daily Budget"}
                                </span>
                                <span className="font-semibold text-slate-800 truncate block">
                                  {msg.proposedCampaignState.dailyBudget ? `₹${msg.proposedCampaignState.dailyBudget.toLocaleString("en-IN")}` : ""} 
                                  {msg.proposedCampaignState.budgetType === "TOTAL" ? " (Total Lifetime)" : " / day"}
                                  {msg.proposedCampaignState.biddingStrategy ? ` • ${msg.proposedCampaignState.biddingStrategy}` : ""}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Locations */}
                          {msg.proposedCampaignState.locations && msg.proposedCampaignState.locations.length > 0 && (
                            <div className="flex items-start gap-2 bg-white/95 p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                              <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Locations</span>
                                <span className="font-semibold text-slate-800 truncate block">
                                  {msg.proposedCampaignState.locations.join(", ")}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Ad Copy (Headlines & Descriptions) */}
                          {((msg.proposedCampaignState.headlines && msg.proposedCampaignState.headlines.length > 0) || 
                            (msg.proposedCampaignState.descriptions && msg.proposedCampaignState.descriptions.length > 0)) && (
                            <div className="flex items-start gap-2 bg-white/95 p-2 rounded-lg border border-slate-200/80 shadow-2xs sm:col-span-2">
                              <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Ad Copy</span>
                                <span className="font-semibold text-slate-800 block">
                                  {msg.proposedCampaignState.headlines?.length || 0} Headlines, {msg.proposedCampaignState.descriptions?.length || 0} Descriptions
                                </span>
                                {msg.proposedCampaignState.headlines && msg.proposedCampaignState.headlines[0] && (
                                  <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                                    &ldquo;{msg.proposedCampaignState.headlines[0]}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Keywords */}
                          {msg.proposedCampaignState.keywords && msg.proposedCampaignState.keywords.length > 0 && (
                            <div className="flex items-start gap-2 bg-white/95 p-2 rounded-lg border border-slate-200/80 shadow-2xs sm:col-span-2">
                              <Tag className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Keywords ({msg.proposedCampaignState.keywords.length})</span>
                                <span className="text-[10px] text-slate-700 block truncate">
                                  {msg.proposedCampaignState.keywords.slice(0, 5).join(", ")}
                                  {msg.proposedCampaignState.keywords.length > 5 ? ` +${msg.proposedCampaignState.keywords.length - 5} more` : ""}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirmation Action Buttons */}
                        {!msg.isApplied && !msg.isDismissed && (
                          <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
                            <button
                              type="button"
                              onClick={() => applyProposedCampaignState(msg.proposedCampaignState!, msg.id)}
                              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Confirm & Update Campaign</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => dismissProposedCampaignState(msg.id)}
                              className="py-2 px-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Dismiss</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI-Generated Creative Images Gallery in Chat */}
                    {msg.role === "assistant" && msg.generatedImages && msg.generatedImages.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Wand2 className="h-4 w-4 text-purple-600 shrink-0" />
                            <span className="font-bold text-xs text-slate-900 tracking-tight">
                              AI-Generated Google Ads Creatives
                            </span>
                            <span className="text-[9px] px-2 py-0.5 font-bold bg-purple-100 text-purple-800 rounded-full">
                              {msg.generatedImages.length} Ready
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {msg.generatedImages.map((imgItem, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="group relative bg-white border border-slate-200 hover:border-purple-300 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                            >
                              {/* Aspect ratio preview container */}
                              <div className="relative bg-slate-900 overflow-hidden flex items-center justify-center min-h-[140px] max-h-[170px]">
                                <img
                                  src={imgItem.url}
                                  alt={imgItem.name || "Generated creative"}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 left-2 flex items-center gap-1">
                                  <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    {imgItem.aspectRatio || (imgItem.fieldType === "LOGO" ? "1:1" : "1.91:1")}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs text-white ${
                                    imgItem.fieldType === "LOGO" ? "bg-amber-600" : "bg-blue-600"
                                  }`}>
                                    {imgItem.fieldType === "LOGO" ? "Logo" : "Marketing Image"}
                                  </span>
                                </div>
                                <a
                                  href={imgItem.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Open full size"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>

                              {/* Card Meta & Quick Actions */}
                              <div className="p-2.5 space-y-2 bg-white flex-1 flex flex-col justify-between">
                                <div>
                                  <p className="text-[11px] font-bold text-slate-900 truncate">
                                    {imgItem.name}
                                  </p>
                                  {imgItem.dimensions && (
                                    <p className="text-[9px] text-slate-500">
                                      {imgItem.dimensions.width} × {imgItem.dimensions.height}px
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const img = new Image();
                                      img.crossOrigin = "anonymous";
                                      img.onload = () => {
                                        triggerImageEditor(
                                          imgItem.url,
                                          imgItem.fieldType === "LOGO" ? "LOGO" : "IMAGE",
                                          imgItem.name,
                                          null,
                                          { width: img.width, height: img.height },
                                          null,
                                          null
                                        );
                                      };
                                      img.src = imgItem.url;
                                    }}
                                    className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Crop className="h-3 w-3 text-slate-600" />
                                    <span>Crop / Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (imgItem.fieldType === "LOGO") {
                                        setCampaignState(prev => ({
                                          ...prev,
                                          logos: [...(prev.logos || []), { url: imgItem.url, name: imgItem.name, fieldType: "LOGO" }]
                                        }));
                                      } else {
                                        setCampaignState(prev => ({
                                          ...prev,
                                          images: [...(prev.images || []), { url: imgItem.url, name: imgItem.name, fieldType: "MARKETING_IMAGE" }]
                                        }));
                                      }
                                      alert(`"${imgItem.name}" added to Live Cockpit!`);
                                    }}
                                    className="py-1 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Add duplicate/additional asset"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Multi-Channel Campaign Preview in Chat */}
                    {msg.role === "assistant" && Boolean(campaignState.objective && campaignState.campaignType) && (msg.readyForReview || msg.campaignState?.readyForReview || campaignState.readyForReview || (index === messages.length - 1 && (campaignState.headlines?.some(h => h && h.trim()) || campaignState.businessName || (campaignState.images && campaignState.images.length > 0) || tempEditValues.businessName || tempEditValues.website))) && (() => {
                      const allImages = [
                        ...(Array.isArray(campaignState.images) && campaignState.images.length > 0 ? campaignState.images : []),
                        ...(Array.isArray(tempEditValues.images) ? tempEditValues.images : [])
                      ];
                      const allLogos = [
                        ...(Array.isArray(campaignState.logos) && campaignState.logos.length > 0 ? campaignState.logos : []),
                        ...(Array.isArray(tempEditValues.logos) ? tempEditValues.logos : [])
                      ];

                      const { allowedChannels, previewTitle, previewBadge } = getPreviewChannelsConfig();
                      const showAllTab = allowedChannels.length > 1;
                      const isChannelActive = (chId: string) => {
                        if (pmaxPreviewChannel === "all") return true;
                        const isAllowed = allowedChannels.some(c => c.id === pmaxPreviewChannel);
                        if (!isAllowed) return true;
                        return pmaxPreviewChannel === chId;
                      };

                      const activeHeadlines = (Array.isArray(campaignState.headlines) && campaignState.headlines.filter(h => h && h.trim()).length > 0)
                        ? campaignState.headlines.filter(h => h && h.trim())
                        : (Array.isArray(tempEditValues.headlines) && tempEditValues.headlines.filter(h => h && h.trim()).length > 0
                            ? tempEditValues.headlines.filter(h => h && h.trim())
                            : []);

                      const activeLongHeadlines = (Array.isArray(campaignState.longHeadlines) && campaignState.longHeadlines.filter(h => h && h.trim()).length > 0)
                        ? campaignState.longHeadlines.filter(h => h && h.trim())
                        : (Array.isArray(tempEditValues.longHeadlines) && tempEditValues.longHeadlines.filter(h => h && h.trim()).length > 0
                            ? tempEditValues.longHeadlines.filter(h => h && h.trim())
                            : []);

                      const activeDescriptions = (Array.isArray(campaignState.descriptions) && campaignState.descriptions.filter(d => d && d.trim()).length > 0)
                        ? campaignState.descriptions.filter(d => d && d.trim())
                        : (Array.isArray(tempEditValues.descriptions) && tempEditValues.descriptions.filter(d => d && d.trim()).length > 0
                            ? tempEditValues.descriptions.filter(d => d && d.trim())
                            : []);

                      const previewHeadline = (activeHeadlines.length > 0 ? activeHeadlines[previewHeadlineIdx % activeHeadlines.length] : null)
                        || (activeLongHeadlines.length > 0 ? activeLongHeadlines[0] : null)
                        || campaignState.businessName 
                        || tempEditValues.businessName 
                        || "Exclusive Deals & Premium Services";

                      const previewLongHeadline = (activeLongHeadlines.length > 0 ? activeLongHeadlines[previewHeadlineIdx % activeLongHeadlines.length] : null) || previewHeadline;

                      const previewDesc = (activeDescriptions.length > 0 ? activeDescriptions[previewDescIdx % activeDescriptions.length] : null)
                        || "Discover high-quality solutions tailored for your needs. Connect with us today and explore best offers!";

                      const previewBiz = campaignState.businessName || campaignState.business?.name || tempEditValues.businessName || "Your Business";
                      const previewUrl = campaignState.website || tempEditValues.website || "www.example.com";
                      const displayDomain = previewUrl.replace(/^https?:\/\//, '').split('/')[0] || "example.com";
                      const previewCta = campaignState.callToAction || tempEditValues.callToAction || "Learn More";

                      const imgObj = allImages[0];
                      const heroImg = typeof imgObj === "string" ? imgObj : imgObj?.url || imgObj?.data || "";
                      const logoObj = allLogos[0];
                      const heroLogo = typeof logoObj === "string" ? logoObj : logoObj?.url || logoObj?.data || "";

                      return (
                        <div className="mt-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 space-y-2.5 shadow-sm w-full">
                          {/* Top Controls Header - Sticky / Fully visible */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Eye className="h-4 w-4 text-blue-600 shrink-0" />
                              <span className="font-bold text-xs text-slate-900 tracking-tight">
                                {previewTitle}
                              </span>
                              <span className="text-[9px] px-2 py-0.5 font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full shrink-0">
                                {previewBadge}
                              </span>
                            </div>

                            {/* Reload Button & Mobile / Desktop Toggle */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                              <button
                                type="button"
                                onClick={handleReloadPreview}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs active:scale-95"
                                title="Reload & sync preview with right side changes (headlines, long headlines, descriptions, images)"
                              >
                                <RefreshCw className={`h-3 w-3 text-blue-600 ${isReloadingPreview ? "animate-spin" : ""}`} />
                                <span>Reload Preview</span>
                              </button>

                              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDevice("mobile")}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    previewDevice === "mobile"
                                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                  title="Mobile Preview"
                                >
                                  <Smartphone className="h-3 w-3 text-blue-600" />
                                  <span>Mobile</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDevice("desktop")}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                    previewDevice === "desktop"
                                      ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                  title="Desktop Preview"
                                >
                                  <Monitor className="h-3 w-3 text-indigo-600" />
                                  <span>Desktop</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Channel Filter Tabs */}
                          {allowedChannels.length > 1 && (
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-semibold scrollbar-none">
                              {showAllTab && (
                                <button
                                  type="button"
                                  onClick={() => setPmaxPreviewChannel("all")}
                                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                                    pmaxPreviewChannel === "all" || !allowedChannels.some(c => c.id === pmaxPreviewChannel)
                                      ? "bg-slate-900 text-white font-bold shadow-xs"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                  }`}
                                >
                                  All Channels
                                </button>
                              )}
                              {allowedChannels.map((tab) => {
                                const isActive = pmaxPreviewChannel === tab.id;
                                return (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setPmaxPreviewChannel(tab.id as any)}
                                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                                      isActive
                                        ? "bg-slate-900 text-white font-bold shadow-xs"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Multi-Device Mockup Container (Mobile Phone Frame vs Desktop Browser Window Frame) */}
                          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                            <div className="flex gap-4 min-w-max py-1 px-0.5">
                                  
                              {/* 1. YOUTUBE PREVIEW */}
                              {allowedChannels.some(c => c.id === "youtube") && isChannelActive("youtube") && (
                                <div className={`${previewDevice === "desktop" ? "w-[300px]" : "w-[210px]"} flex flex-col items-center shrink-0 transition-all`}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white shadow-xs">
                                      <Play className="h-2.5 w-2.5 fill-white" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">YouTube</span>
                                  </div>

                                  {previewDevice === "desktop" ? (
                                    /* Desktop Browser Window Frame */
                                    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
                                      {/* Mac / Browser Header Bar */}
                                      <div className="bg-slate-100 px-2.5 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-1 border border-slate-200/80 shadow-2xs">
                                          <Globe className="h-2 w-2 text-slate-400" />
                                          <span className="truncate">youtube.com/watch</span>
                                        </div>
                                      </div>

                                      {/* Desktop YouTube Web Interface */}
                                      <div className="bg-white flex flex-col">
                                        {/* YouTube Top Navbar */}
                                        <div className="px-2.5 py-1 bg-white border-b border-slate-100 flex items-center justify-between">
                                          <div className="flex items-center gap-1">
                                            <div className="w-3 h-2 bg-red-600 rounded-xs flex items-center justify-center">
                                              <Play className="h-1 w-1 fill-white text-white" />
                                            </div>
                                            <span className="text-[9px] font-black tracking-tighter text-slate-900">YouTube</span>
                                          </div>
                                          <div className="w-24 h-3 bg-slate-100 rounded-full border border-slate-200" />
                                          <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                                        </div>

                                        {/* Desktop Video Player Area with Side Video Suggestions Layout */}
                                        <div className="p-2 grid grid-cols-12 gap-2 bg-slate-50">
                                          {/* Main Video Screen with Overlay */}
                                          <div className="col-span-8 flex flex-col">
                                            <div className="relative aspect-video w-full bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                                              {heroImg ? (
                                                <img src={heroImg} alt="YouTube Desktop Ad" className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="text-center p-2 text-slate-400">
                                                  <Play className="h-5 w-5 mx-auto mb-1 opacity-60 text-white" />
                                                  <span className="text-[7px] text-slate-300 block">Video Ad (Desktop)</span>
                                                </div>
                                              )}
                                              {/* YouTube Skip Ad Overlay */}
                                              <div className="absolute bottom-1.5 left-1.5 px-1 py-0.5 bg-black/80 rounded text-[7px] font-bold text-amber-400">
                                                Ad · 0:15
                                              </div>
                                              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 hover:bg-black text-white rounded text-[7px] font-medium border border-white/20">
                                                Skip Ad &gt;|
                                              </div>
                                            </div>

                                            {/* Under Video Title & Actions */}
                                            <div className="mt-1.5 space-y-1 bg-white p-1.5 rounded border border-slate-200">
                                              <p className="text-[9px] font-bold text-slate-900 line-clamp-1 leading-tight">
                                                {previewHeadline}
                                              </p>
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                  {heroLogo ? (
                                                    <img src={heroLogo} alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover border border-slate-100" />
                                                  ) : (
                                                    <div className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[7px] flex items-center justify-center">
                                                      {previewBiz.charAt(0).toUpperCase()}
                                                    </div>
                                                  )}
                                                  <span className="text-[8px] font-bold text-slate-800 truncate max-w-[80px]">{previewBiz}</span>
                                                </div>
                                                <button
                                                  type="button"
                                                  className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8px] flex items-center gap-0.5 shadow-2xs"
                                                >
                                                  <span>{previewCta}</span>
                                                  <ExternalLink className="h-2 w-2" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Right Sidebar Suggested Videos Skeleton */}
                                          <div className="col-span-4 space-y-1.5">
                                            <div className="space-y-1">
                                              <div className="aspect-video w-full bg-slate-200 rounded" />
                                              <div className="w-full h-1 bg-slate-200 rounded" />
                                              <div className="w-2/3 h-1 bg-slate-200 rounded" />
                                            </div>
                                            <div className="space-y-1">
                                              <div className="aspect-video w-full bg-slate-200 rounded" />
                                              <div className="w-3/4 h-1 bg-slate-200 rounded" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Mobile Phone Shell */
                                    <div className="w-full bg-white rounded-3xl p-2 border-2 border-slate-300 shadow-sm flex flex-col">
                                      {/* Speaker notch */}
                                      <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-1.5" />

                                      {/* Screen Frame */}
                                      <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col">
                                        {/* YouTube Header */}
                                        <div className="bg-white px-2 py-1.5 flex items-center justify-between border-b border-slate-100">
                                          <div className="flex items-center gap-1">
                                            <div className="w-3.5 h-2.5 bg-red-600 rounded-xs flex items-center justify-center">
                                              <Play className="h-1.5 w-1.5 fill-white text-white" />
                                            </div>
                                            <span className="text-[9px] font-bold tracking-tighter text-slate-900">YouTube</span>
                                          </div>
                                          <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
                                        </div>

                                        {/* Video / Thumbnail Area */}
                                        <div className="relative aspect-video w-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                          {heroImg ? (
                                            <img src={heroImg} alt="YouTube Ad" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="text-center p-2 text-slate-400">
                                              <Play className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                              <span className="text-[8px] block">Video Creative</span>
                                            </div>
                                          )}
                                          <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white rounded text-[8px] font-mono">
                                            0:30
                                          </div>
                                        </div>

                                        {/* In-feed / In-stream Info */}
                                        <div className="p-2 bg-white flex flex-col gap-1.5">
                                          <div className="flex items-start gap-1.5">
                                            {heroLogo ? (
                                              <img src={heroLogo} alt="Logo" className="w-5 h-5 rounded-full object-cover border border-slate-100 shrink-0" />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center shrink-0">
                                                {previewBiz.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <p className="text-[9px] font-bold text-slate-900 line-clamp-2 leading-tight">
                                                {previewHeadline}
                                              </p>
                                              <div className="flex items-center gap-1 mt-0.5 text-[8px] text-slate-500">
                                                <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[7px]">Ad</span>
                                                <span className="truncate">{previewBiz}</span>
                                              </div>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            className="w-full py-1 rounded-md bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center gap-1 shadow-xs"
                                          >
                                            <span>{previewCta}</span>
                                            <ExternalLink className="h-2 w-2" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Home indicator */}
                                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 2. DISPLAY PREVIEW */}
                              {allowedChannels.some(c => c.id === "display") && isChannelActive("display") && (
                                <div className={`${previewDevice === "desktop" ? "w-[300px]" : "w-[210px]"} flex flex-col items-center shrink-0 transition-all`}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                                      <LayoutGrid className="h-2.5 w-2.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">Display</span>
                                  </div>

                                  {previewDevice === "desktop" ? (
                                    /* Desktop Browser Window Frame (Website Publisher with 300x250 / 336x280 Sidebar Display Ad) */
                                    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
                                      {/* Mac / Browser Header Bar */}
                                      <div className="bg-slate-100 px-2.5 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-1 border border-slate-200/80 shadow-2xs">
                                          <Globe className="h-2 w-2 text-slate-400" />
                                          <span className="truncate">thedailyjournal.com/news</span>
                                        </div>
                                      </div>

                                      {/* Desktop News Publisher Layout */}
                                      <div className="p-2 bg-white flex flex-col">
                                        {/* Publisher Header */}
                                        <div className="pb-1.5 border-b border-slate-200 flex items-center justify-between">
                                          <span className="font-serif font-black text-[10px] text-slate-900 tracking-tight">The Daily Journal</span>
                                          <div className="flex items-center gap-1 text-[7px] text-slate-400 font-medium">
                                            <span>Home</span>
                                            <span>•</span>
                                            <span>Business</span>
                                            <span>•</span>
                                            <span>Tech</span>
                                          </div>
                                        </div>

                                        {/* Article Content + Right Side Ad Unit */}
                                        <div className="pt-2 grid grid-cols-12 gap-2">
                                          {/* Article Skeleton */}
                                          <div className="col-span-6 space-y-1.5">
                                            <div className="w-full h-1.5 bg-slate-300 rounded" />
                                            <div className="w-4/5 h-1.5 bg-slate-300 rounded" />
                                            <div className="w-full h-8 bg-slate-100 rounded" />
                                            <div className="w-full h-1 bg-slate-200 rounded" />
                                            <div className="w-full h-1 bg-slate-200 rounded" />
                                            <div className="w-3/4 h-1 bg-slate-200 rounded" />
                                          </div>

                                          {/* Google Display Sidebar Banner (Responsive / Medium Rectangle) */}
                                          <div className="col-span-6 p-1.5 rounded-lg bg-sky-50/70 border border-sky-200 flex flex-col justify-between shadow-2xs">
                                            <div>
                                              <div className="flex items-center justify-between text-[6px] text-slate-400 mb-1">
                                                <span className="bg-sky-200 text-sky-800 px-1 rounded font-bold">Ad</span>
                                                <span className="truncate max-w-[60px]">{displayDomain}</span>
                                              </div>

                                              <div className={`${(imgObj?.aspectRatio === "1:1" || imgObj?.fieldType === "SQUARE_MARKETING_IMAGE") ? "aspect-square max-h-[140px]" : "aspect-[1.91/1]"} w-full rounded bg-slate-100 overflow-hidden relative mb-1`}>
                                                {heroImg ? (
                                                  <img src={heroImg} alt="Display Ad" className="w-full h-full object-cover" />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[6px]">
                                                    Display Banner
                                                  </div>
                                                )}
                                              </div>

                                              <p className="text-[8px] font-bold text-slate-900 leading-tight line-clamp-1">
                                                {previewHeadline}
                                              </p>
                                              <p className="text-[7px] text-slate-600 line-clamp-2 leading-tight mt-0.5">
                                                {previewDesc}
                                              </p>
                                            </div>

                                            <button
                                              type="button"
                                              className="mt-1.5 w-full py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8px] flex items-center justify-center gap-1 shadow-2xs"
                                            >
                                              <span>{previewCta}</span>
                                              <ExternalLink className="h-2 w-2" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Mobile Phone Shell */
                                    <div className="w-full bg-white rounded-3xl p-2 border-2 border-slate-300 shadow-sm flex flex-col">
                                      <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-1.5" />

                                      {/* Screen Frame */}
                                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                                        {/* Web Page Skeleton Header */}
                                        <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100 space-y-1">
                                          <div className="w-16 h-1 bg-slate-300 rounded" />
                                          <div className="w-24 h-1 bg-slate-200 rounded" />
                                        </div>

                                        {/* Native Responsive Display Banner Card */}
                                        <div className="m-1.5 p-2 rounded-xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100 shadow-xs flex flex-col gap-1.5">
                                          <div className="flex items-center justify-between text-[7px] text-slate-400">
                                            <span className="px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">Google Ad</span>
                                            <span className="truncate max-w-[90px]">{displayDomain}</span>
                                          </div>

                                          <div className={`${(imgObj?.aspectRatio === "1:1" || imgObj?.fieldType === "SQUARE_MARKETING_IMAGE") ? "aspect-square max-h-[180px]" : "aspect-[1.91/1]"} w-full rounded-lg bg-slate-100 overflow-hidden relative`}>
                                            {heroImg ? (
                                              <img src={heroImg} alt="Display" className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[8px]">
                                                1.91:1 Landscape
                                              </div>
                                            )}
                                          </div>

                                          <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold text-slate-900 leading-tight line-clamp-1">
                                              {previewHeadline}
                                            </p>
                                            <p className="text-[8px] text-slate-600 line-clamp-2 leading-tight">
                                              {previewDesc}
                                            </p>
                                          </div>

                                          <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1">
                                              {heroLogo && (
                                                <img src={heroLogo} alt="Logo" className="w-4 h-4 rounded-full object-cover border border-slate-100" />
                                              )}
                                              <span className="text-[8px] font-bold text-slate-800 truncate max-w-[70px]">{previewBiz}</span>
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                              <ChevronRight className="h-3 w-3" />
                                            </div>
                                          </div>
                                        </div>

                                        {/* Body skeleton lines */}
                                        <div className="p-2 space-y-1 bg-white">
                                          <div className="w-full h-1 bg-slate-100 rounded" />
                                          <div className="w-5/6 h-1 bg-slate-100 rounded" />
                                          <div className="w-4/6 h-1 bg-slate-100 rounded" />
                                        </div>
                                      </div>

                                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 3. GOOGLE SEARCH PREVIEW */}
                              {allowedChannels.some(c => c.id === "search") && isChannelActive("search") && (
                                <div className={`${previewDevice === "desktop" ? "w-[300px]" : "w-[210px]"} flex flex-col items-center shrink-0 transition-all`}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                                      <span className="text-[10px] font-black text-blue-600">G</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">Search</span>
                                  </div>

                                  {previewDevice === "desktop" ? (
                                    /* Desktop Google Search Results Page Window */
                                    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
                                      {/* Mac / Browser Header Bar */}
                                      <div className="bg-slate-100 px-2.5 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-1 border border-slate-200/80 shadow-2xs">
                                          <Globe className="h-2 w-2 text-slate-400" />
                                          <span className="truncate">google.com/search?q={encodeURIComponent(previewBiz)}</span>
                                        </div>
                                      </div>

                                      {/* Desktop Google Search Header & Filters */}
                                      <div className="p-2.5 bg-white border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold">
                                            <span className="text-blue-500">G</span>
                                            <span className="text-red-500">o</span>
                                            <span className="text-amber-500">o</span>
                                            <span className="text-blue-500">g</span>
                                            <span className="text-emerald-500">l</span>
                                            <span className="text-red-500">e</span>
                                          </span>
                                          <div className="flex-1 h-5 px-2 bg-white rounded-full border border-slate-300 flex items-center justify-between text-[8px] text-slate-700 shadow-2xs">
                                            <span className="truncate">{previewBiz.toLowerCase()} online services</span>
                                            <Search className="h-2.5 w-2.5 text-blue-500" />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-[7px] text-slate-500 pt-1.5 pl-8">
                                          <span className="text-blue-600 font-bold border-b border-blue-600 pb-0.5">All</span>
                                          <span>Images</span>
                                          <span>Shopping</span>
                                          <span>Videos</span>
                                          <span>News</span>
                                        </div>
                                      </div>

                                      {/* Desktop Search Sponsored Ad Card */}
                                      <div className="p-2.5 space-y-1 border-b border-slate-100 bg-white">
                                        {/* Favicon + Domain */}
                                        <div className="flex items-center gap-1.5 text-[8px]">
                                          {heroLogo ? (
                                            <img src={heroLogo} alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover border border-slate-100" />
                                          ) : (
                                            <div className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[7px] flex items-center justify-center">
                                              G
                                            </div>
                                          )}
                                          <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 leading-none">{previewBiz}</span>
                                            <span className="text-[7px] text-slate-500">{previewUrl}</span>
                                          </div>
                                        </div>

                                        {/* Sponsored Tag + Headline */}
                                        <div className="pt-0.5">
                                          <span className="font-bold text-[8px] text-slate-900 mr-1">Sponsored ·</span>
                                          <span className="text-[10px] font-bold text-blue-800 hover:underline cursor-pointer leading-tight">
                                            {previewHeadline}
                                          </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-[8px] text-slate-600 leading-relaxed">
                                          {previewDesc}
                                        </p>

                                        {/* Sitelinks Extensions (2-Column Grid on Desktop) */}
                                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                                          <div className="bg-slate-50 p-1 rounded border border-slate-100">
                                            <span className="text-[7px] font-bold text-blue-700 block hover:underline cursor-pointer">Official Website</span>
                                            <span className="text-[6px] text-slate-500 block">Explore verified products</span>
                                          </div>
                                          <div className="bg-slate-50 p-1 rounded border border-slate-100">
                                            <span className="text-[7px] font-bold text-blue-700 block hover:underline cursor-pointer">Special Deals</span>
                                            <span className="text-[6px] text-slate-500 block">Save on top packages</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Desktop Organic Results Skeleton */}
                                      <div className="p-2 space-y-1.5 bg-slate-50/50">
                                        <div className="w-24 h-1 bg-slate-200 rounded" />
                                        <div className="w-40 h-1.5 bg-blue-300 rounded" />
                                        <div className="w-full h-1 bg-slate-200 rounded" />
                                      </div>
                                    </div>
                                  ) : (
                                    /* Mobile Phone Shell */
                                    <div className="w-full bg-white rounded-3xl p-2 border-2 border-slate-300 shadow-sm flex flex-col">
                                      <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-1.5" />

                                      {/* Screen Frame */}
                                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                                        {/* Google Search Bar Header */}
                                        <div className="p-2 bg-slate-50 border-b border-slate-100">
                                          <div className="text-center font-bold text-[10px] mb-1">
                                            <span className="text-blue-500">G</span>
                                            <span className="text-red-500">o</span>
                                            <span className="text-amber-500">o</span>
                                            <span className="text-blue-500">g</span>
                                            <span className="text-emerald-500">l</span>
                                            <span className="text-red-500">e</span>
                                          </div>
                                          <div className="h-5 px-2 bg-white rounded-full border border-slate-200 flex items-center justify-between text-[8px] text-slate-500 shadow-xs">
                                            <span className="truncate">{previewBiz.toLowerCase()}</span>
                                            <Search className="h-2.5 w-2.5 text-blue-500" />
                                          </div>
                                        </div>

                                        {/* Search Ad Result Item */}
                                        <div className="p-2 space-y-1 border-b border-slate-100">
                                          {/* Breadcrumb + Favicon */}
                                          <div className="flex items-center gap-1 text-[8px]">
                                            {heroLogo ? (
                                              <img src={heroLogo} alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover border border-slate-100" />
                                            ) : (
                                              <div className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[7px] flex items-center justify-center">
                                                G
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1 truncate text-slate-700">
                                              <span className="font-semibold">{previewBiz}</span>
                                              <span className="text-slate-400">›</span>
                                              <span className="text-slate-500 truncate">{displayDomain}</span>
                                            </div>
                                          </div>

                                          {/* Sponsored Tag + Headline */}
                                          <div>
                                            <span className="font-bold text-[8px] text-slate-900 mr-1">Sponsored ·</span>
                                            <span className="text-[9px] font-bold text-blue-700 hover:underline cursor-pointer leading-tight">
                                              {previewHeadline}
                                            </span>
                                          </div>

                                          {/* Description */}
                                          <p className="text-[8px] text-slate-600 line-clamp-2 leading-relaxed">
                                            {previewDesc}
                                          </p>

                                          {/* Extension Callouts */}
                                          <div className="pt-1 flex flex-wrap gap-1">
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[7px] text-slate-700 font-medium">
                                              Official Site
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[7px] text-slate-700 font-medium">
                                              Top Rated
                                            </span>
                                          </div>
                                        </div>

                                        {/* Organic Search Skeleton */}
                                        <div className="p-2 space-y-1">
                                          <div className="w-20 h-1 bg-slate-200 rounded" />
                                          <div className="w-28 h-1.5 bg-blue-300 rounded" />
                                          <div className="w-full h-1 bg-slate-100 rounded" />
                                        </div>
                                      </div>

                                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 4. GOOGLE DISCOVER PREVIEW */}
                              {allowedChannels.some(c => c.id === "discover") && isChannelActive("discover") && (
                                <div className={`${previewDevice === "desktop" ? "w-[300px]" : "w-[210px]"} flex flex-col items-center shrink-0 transition-all`}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white shadow-xs">
                                      <Compass className="h-2.5 w-2.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">Discover</span>
                                  </div>

                                  {previewDevice === "desktop" ? (
                                    /* Desktop Google Homepage / Discover Feed Window */
                                    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
                                      {/* Mac / Browser Header Bar */}
                                      <div className="bg-slate-100 px-2.5 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-1 border border-slate-200/80 shadow-2xs">
                                          <Globe className="h-2 w-2 text-slate-400" />
                                          <span className="truncate">google.com/discover</span>
                                        </div>
                                      </div>

                                      {/* Google Central Search Bar */}
                                      <div className="pt-2 pb-1 text-center">
                                        <span className="text-[11px] font-bold">
                                          <span className="text-blue-500">G</span>
                                          <span className="text-red-500">o</span>
                                          <span className="text-amber-500">o</span>
                                          <span className="text-blue-500">g</span>
                                          <span className="text-emerald-500">l</span>
                                          <span className="text-red-500">e</span>
                                        </span>
                                        <div className="w-4/5 h-4 mx-auto mt-1 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-between px-2 text-[7px] text-slate-400">
                                          <span>Search or type URL</span>
                                          <Search className="h-2 w-2 text-slate-400" />
                                        </div>
                                      </div>

                                      {/* Discover 2-Column Feed Cards */}
                                      <div className="p-2 grid grid-cols-2 gap-2 bg-slate-50/60 border-t border-slate-100">
                                        {/* Discover Ad Sponsored Card */}
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                                          <div>
                                            <div className="aspect-[1.91/1] w-full bg-slate-100 overflow-hidden relative">
                                              {heroImg ? (
                                                <img src={heroImg} alt="Discover" className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-[6px]">
                                                  Hero Image
                                                </div>
                                              )}
                                            </div>
                                            <div className="p-1.5 space-y-0.5">
                                              <p className="text-[8px] font-bold text-slate-900 leading-tight line-clamp-2">
                                                {previewHeadline}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="p-1.5 pt-0 flex items-center justify-between text-[7px] text-slate-500">
                                            <div className="flex items-center gap-1">
                                              {heroLogo ? (
                                                <img src={heroLogo} alt="Logo" className="w-2.5 h-2.5 rounded-full object-cover" />
                                              ) : (
                                                <span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />
                                              )}
                                              <span className="truncate max-w-[50px] font-medium text-slate-700">{previewBiz}</span>
                                            </div>
                                            <span className="bg-slate-100 text-slate-700 px-1 rounded text-[6px] font-bold">Ad</span>
                                          </div>
                                        </div>

                                        {/* Organic Discover Article Card */}
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                                          <div>
                                            <div className="aspect-[1.91/1] w-full bg-amber-100/60 overflow-hidden flex items-center justify-center">
                                              <Compass className="h-4 w-4 text-amber-500 opacity-60" />
                                            </div>
                                            <div className="p-1.5 space-y-1">
                                              <div className="w-full h-1.5 bg-slate-300 rounded" />
                                              <div className="w-3/4 h-1 bg-slate-200 rounded" />
                                            </div>
                                          </div>
                                          <div className="p-1.5 pt-0 flex items-center justify-between text-[7px] text-slate-400">
                                            <span>Trending Story</span>
                                            <span>2h ago</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Mobile Phone Shell */
                                    <div className="w-full bg-white rounded-3xl p-2 border-2 border-slate-300 shadow-sm flex flex-col">
                                      <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-1.5" />

                                      {/* Screen Frame */}
                                      <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col">
                                        {/* Discover Header */}
                                        <div className="p-2 bg-white border-b border-slate-100 space-y-1">
                                          <div className="w-12 h-1 bg-slate-300 rounded" />
                                          <div className="w-full h-1 bg-slate-200 rounded" />
                                        </div>

                                        {/* Discover Large Feed Card */}
                                        <div className="m-1.5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                          <div className="aspect-[1.91/1] w-full bg-slate-100 overflow-hidden relative">
                                            {heroImg ? (
                                              <img src={heroImg} alt="Discover" className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[8px]">
                                                Discover Hero Image
                                              </div>
                                            )}
                                          </div>

                                          <div className="p-2 space-y-1.5">
                                            <p className="text-[9px] font-bold text-slate-900 leading-tight line-clamp-2">
                                              {previewHeadline}
                                            </p>

                                            <div className="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-100">
                                              <div className="flex items-center gap-1">
                                                {heroLogo ? (
                                                  <img src={heroLogo} alt="Logo" className="w-3 h-3 rounded-full object-cover" />
                                                ) : (
                                                  <span className="w-2.5 h-2.5 rounded-full bg-purple-200 inline-block" />
                                                )}
                                                <span className="truncate max-w-[80px] font-medium text-slate-700">{previewBiz}</span>
                                              </div>
                                              <span className="px-1 py-0.2 rounded bg-slate-100 text-[7px] font-bold">Ad</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Discover Tab Bar Skeleton */}
                                        <div className="mt-auto p-1.5 bg-white border-t border-slate-200 flex justify-around text-slate-400">
                                          <div className="w-4 h-1 bg-blue-500 rounded" />
                                          <div className="w-4 h-1 bg-slate-200 rounded" />
                                          <div className="w-4 h-1 bg-slate-200 rounded" />
                                        </div>
                                      </div>

                                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 5. GMAIL PREVIEW */}
                              {allowedChannels.some(c => c.id === "gmail") && isChannelActive("gmail") && (
                                <div className={`${previewDevice === "desktop" ? "w-[300px]" : "w-[210px]"} flex flex-col items-center shrink-0 transition-all`}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-rose-500 flex items-center justify-center text-white shadow-xs">
                                      <Mail className="h-2.5 w-2.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">Gmail</span>
                                  </div>

                                  {previewDevice === "desktop" ? (
                                    /* Desktop Gmail Web Client Window */
                                    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
                                      {/* Mac / Browser Header Bar */}
                                      <div className="bg-slate-100 px-2.5 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-1 border border-slate-200/80 shadow-2xs">
                                          <Globe className="h-2 w-2 text-slate-400" />
                                          <span className="truncate">mail.google.com/mail/u/0</span>
                                        </div>
                                      </div>

                                      {/* Desktop Gmail Search & Navigation Bar */}
                                      <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3 text-rose-500" />
                                          <span className="text-[9px] font-bold text-slate-700">Gmail</span>
                                        </div>
                                        <div className="w-36 h-4 bg-white rounded-full border border-slate-200 flex items-center px-2 text-[7px] text-slate-400">
                                          <Search className="h-2 w-2 text-slate-400 mr-1" />
                                          <span>Search mail</span>
                                        </div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-slate-300" />
                                      </div>

                                      {/* Desktop Gmail Two-Column Layout (Sidebar + Email Table) */}
                                      <div className="grid grid-cols-12 bg-white">
                                        {/* Gmail Sidebar */}
                                        <div className="col-span-3 border-r border-slate-100 p-1.5 space-y-1 bg-slate-50/50">
                                          <div className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[7px] font-bold text-center">
                                            + Compose
                                          </div>
                                          <div className="space-y-0.5 pt-1 text-[7px] text-slate-600">
                                            <div className="px-1 py-0.5 rounded font-bold text-slate-800">Inbox</div>
                                            <div className="px-1 py-0.5 text-slate-400">Starred</div>
                                            <div className="px-1 py-0.5 text-slate-400">Sent</div>
                                          </div>
                                        </div>

                                        {/* Gmail Email List with Promotions Tab */}
                                        <div className="col-span-9 p-1.5 space-y-1">
                                          {/* Promotions Header Tab */}
                                          <div className="flex items-center gap-2 border-b border-slate-100 pb-1 text-[7px]">
                                            <span className="text-slate-400">Primary</span>
                                            <span className="text-emerald-600 font-bold border-b border-emerald-600 pb-0.5">Promotions</span>
                                            <span className="text-slate-400">Social</span>
                                          </div>

                                          {/* Sponsored Top Ad Row */}
                                          <div className="p-1 rounded bg-emerald-50/60 border border-emerald-100 flex items-center gap-1.5">
                                            {heroLogo ? (
                                              <img src={heroLogo} alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover border border-slate-200 shrink-0" />
                                            ) : (
                                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white font-bold text-[7px] flex items-center justify-center shrink-0">
                                                {previewBiz.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-bold text-slate-900 truncate">{previewBiz}</span>
                                                <span className="bg-emerald-200 text-emerald-800 px-1 rounded text-[6px] font-bold">Ad</span>
                                              </div>
                                              <p className="text-[7px] text-slate-700 truncate leading-tight">
                                                {previewHeadline} - {previewDesc}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Regular Email Rows Skeleton */}
                                          <div className="space-y-1 opacity-40 pt-0.5">
                                            <div className="flex items-center gap-1 text-[7px]">
                                              <div className="w-2 h-2 rounded-xs border border-slate-300" />
                                              <div className="w-12 h-1 bg-slate-300 rounded" />
                                              <div className="w-24 h-1 bg-slate-200 rounded" />
                                            </div>
                                            <div className="flex items-center gap-1 text-[7px]">
                                              <div className="w-2 h-2 rounded-xs border border-slate-300" />
                                              <div className="w-14 h-1 bg-slate-300 rounded" />
                                              <div className="w-20 h-1 bg-slate-200 rounded" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Mobile Phone Shell */
                                    <div className="w-full bg-white rounded-3xl p-2 border-2 border-slate-300 shadow-sm flex flex-col">
                                      <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-1.5" />

                                      {/* Screen Frame */}
                                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                                        {/* Gmail Search / Top Bar */}
                                        <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                                          <div className="flex items-center gap-1">
                                            <Mail className="h-2.5 w-2.5 text-rose-500" />
                                            <span className="text-[8px] font-bold text-slate-700">Promotions</span>
                                          </div>
                                          <div className="w-3 h-3 rounded-full bg-slate-300" />
                                        </div>

                                        {/* Sponsored Gmail Promotion Row (Closed State) */}
                                        <div className="p-2 bg-emerald-50/40 border-b border-slate-100 flex items-start gap-1.5">
                                          {heroLogo ? (
                                            <img src={heroLogo} alt="Logo" className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0" />
                                          ) : (
                                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                                              {previewBiz.charAt(0).toUpperCase()}
                                            </div>
                                          )}

                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between text-[8px]">
                                              <span className="font-bold text-slate-900 truncate">{previewBiz}</span>
                                              <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[6px]">Ad</span>
                                            </div>
                                            <p className="text-[8px] font-semibold text-slate-800 truncate">
                                              {previewHeadline}
                                            </p>
                                            <p className="text-[7px] text-slate-500 truncate">
                                              {previewDesc}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Standard Email Rows Skeleton */}
                                        <div className="p-2 space-y-2">
                                          <div className="flex items-center gap-1.5 opacity-40">
                                            <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
                                            <div className="flex-1 space-y-0.5">
                                              <div className="w-16 h-1 bg-slate-300 rounded" />
                                              <div className="w-24 h-1 bg-slate-200 rounded" />
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 opacity-40">
                                            <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
                                            <div className="flex-1 space-y-0.5">
                                              <div className="w-20 h-1 bg-slate-300 rounded" />
                                              <div className="w-28 h-1 bg-slate-200 rounded" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 6. GOOGLE MAPS PREVIEW */}
                              {allowedChannels.some(c => c.id === "maps") && isChannelActive("maps") && (
                                <div className={`${previewDevice === "desktop" ? "w-[300px]" : "w-[210px]"} flex flex-col items-center shrink-0 transition-all`}>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                                      <MapPin className="h-2.5 w-2.5" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">Maps</span>
                                  </div>

                                  {previewDevice === "desktop" ? (
                                    /* Desktop Google Maps Web Browser Window */
                                    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-md flex flex-col overflow-hidden">
                                      {/* Mac / Browser Header Bar */}
                                      <div className="bg-slate-100 px-2.5 py-1.5 flex items-center gap-1.5 border-b border-slate-200">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="flex-1 bg-white rounded px-2 py-0.5 text-[8px] text-slate-500 font-mono flex items-center gap-1 border border-slate-200/80 shadow-2xs">
                                          <Globe className="h-2 w-2 text-slate-400" />
                                          <span className="truncate">maps.google.com/search</span>
                                        </div>
                                      </div>

                                      {/* Desktop Maps Layout: Search / Pin Sidebar + Large Interactive Map Canvas */}
                                      <div className="grid grid-cols-12 h-36 bg-slate-100">
                                        {/* Left Sidebar Info Card */}
                                        <div className="col-span-6 bg-white p-2 border-r border-slate-200 flex flex-col justify-between">
                                          <div>
                                            <div className="flex items-center gap-1 text-[8px] mb-1">
                                              <span className="font-bold text-slate-800">Google Maps</span>
                                            </div>
                                            <div className="p-1 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                                              <div className="flex items-center gap-1">
                                                <span className="bg-amber-100 text-amber-800 px-1 rounded text-[6px] font-bold">Sponsored</span>
                                                <span className="text-[8px] font-bold text-slate-900 truncate">{previewBiz}</span>
                                              </div>
                                              <div className="text-[7px] text-amber-500 font-medium">
                                                ★ 4.9 <span className="text-slate-400">(250+)</span>
                                              </div>
                                              <p className="text-[7px] text-slate-600 line-clamp-2 leading-tight">
                                                {previewHeadline}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-1 pt-1">
                                            <button
                                              type="button"
                                              className="py-0.5 rounded bg-blue-600 text-white font-bold text-[7px] flex items-center justify-center gap-0.5"
                                            >
                                              <Navigation className="h-2 w-2" />
                                              <span>Directions</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[7px] border border-slate-200 flex items-center justify-center gap-0.5"
                                            >
                                              <ExternalLink className="h-2 w-2" />
                                              <span>Website</span>
                                            </button>
                                          </div>
                                        </div>

                                        {/* Right Side Map Canvas with Pin */}
                                        <div className="col-span-6 relative bg-emerald-100/70 flex items-center justify-center overflow-hidden">
                                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:6px_6px]" />
                                          <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md animate-bounce">
                                              <MapPin className="h-3 w-3" />
                                            </div>
                                            <span className="text-[6px] font-bold text-slate-800 bg-white/95 px-1 py-0.2 rounded shadow-2xs mt-0.5">
                                              {previewBiz}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Mobile Phone Shell */
                                    <div className="w-full bg-white rounded-3xl p-2 border-2 border-slate-300 shadow-sm flex flex-col">
                                      <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-1.5" />

                                      {/* Screen Frame */}
                                      <div className="rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex flex-col">
                                        {/* Map Canvas Background with Pin */}
                                        <div className="relative h-20 bg-emerald-100/60 flex items-center justify-center overflow-hidden">
                                          {/* Stylized Map Grid Lines */}
                                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:8px_8px]" />
                                          <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md animate-bounce">
                                              <MapPin className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-[7px] font-bold text-slate-800 bg-white/90 px-1 rounded shadow-xs mt-0.5">
                                              {previewBiz}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Bottom Place Card Ad */}
                                        <div className="p-2 bg-white border-t border-slate-200 space-y-1">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <div className="flex items-center gap-1">
                                                <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[6px]">Ad</span>
                                                <span className="text-[9px] font-bold text-slate-900 truncate max-w-[90px]">{previewBiz}</span>
                                              </div>
                                              <div className="flex items-center gap-0.5 text-amber-500 text-[8px] mt-0.5">
                                                <span>★ 4.9</span>
                                                <span className="text-slate-400 text-[7px]">(120+)</span>
                                              </div>
                                            </div>

                                            {heroLogo ? (
                                              <img src={heroLogo} alt="Logo" className="w-5 h-5 rounded-md object-cover border border-slate-100 shrink-0" />
                                            ) : (
                                              <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center shrink-0">
                                                {previewBiz.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                          </div>

                                          <p className="text-[8px] text-slate-600 line-clamp-1">
                                            {previewHeadline}
                                          </p>

                                          <div className="grid grid-cols-2 gap-1 pt-1">
                                            <button
                                              type="button"
                                              className="py-1 rounded bg-blue-600 text-white font-bold text-[8px] flex items-center justify-center gap-0.5"
                                            >
                                              <Navigation className="h-2 w-2" />
                                              <span>Directions</span>
                                            </button>
                                            <button
                                              type="button"
                                              className="py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[8px] border border-slate-200 flex items-center justify-center gap-0.5"
                                            >
                                              <ExternalLink className="h-2 w-2" />
                                              <span>Website</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>
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
                              } else if (sLower === "set daily budget" || sLower === "daily budget") {
                                setMobileActiveTab("cockpit");
                                setTempEditValues(prev => ({ ...prev, budgetType: "DAILY" }));
                                startFieldEdit("dailyBudget");
                              } else if (sLower === "set campaign budget" || sLower === "campaign budget" || sLower === "total budget" || sLower === "set total budget") {
                                setMobileActiveTab("cockpit");
                                setTempEditValues(prev => ({ ...prev, budgetType: "TOTAL" }));
                                startFieldEdit("dailyBudget");
                              } else if (sLower === "change budget" || sLower === "set budget") {
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

            {/* Typing / Generation Animation Indicator */}
            {(isLoading || isAnalyzingUrl || isUploadingMedia) && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative w-9 h-9 rounded-xl bg-white border border-blue-200 shadow-md p-1 flex items-center justify-center shrink-0 ring-2 ring-blue-500/20">
                  <img
                    src="/icon.jpeg"
                    alt="JDS Copilot"
                    className="w-full h-full object-contain rounded-lg animate-pulse"
                  />
                  {/* Glowing radiating ripple ring */}
                  <span className="absolute -inset-1 rounded-2xl bg-blue-500/20 animate-ping pointer-events-none" />
                </div>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/60 border border-blue-200/80 rounded-2xl rounded-tl-xs shadow-sm text-xs text-slate-700 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                  </div>
                  <span className="font-medium text-slate-800">
                    {isUploadingMedia
                      ? "Uploading asset to ImageKit CDN..."
                      : isAnalyzingUrl
                      ? "Analyzing website structure & content..."
                      : "JDS AI Copilot is formulating campaign recommendations..."}
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
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-2 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-rose-900 text-sm">Campaign Launch Issue</p>
                    {publishError.includes("DESTINATION_NOT_WORKING") || publishError.includes("unreachable") ? (
                      <div className="space-y-1.5 text-[12px] text-rose-700">
                        <p>
                          Google Ads requires an active, live landing page. The website URL <strong>&quot;{campaignState.website || "provided"}&quot;</strong> is currently unreachable or does not resolve via DNS.
                        </p>
                        <p className="text-[11px] text-slate-600">
                          👉 <strong>Fix:</strong> Click <strong>Edit Website</strong> on the right Cockpit panel (or click below) and enter a valid live URL (for example: <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900 font-mono">https://google.com</code> or your actual live store URL), then click <strong>Launch Campaign</strong> again.
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-rose-700">{publishError}</p>
                    )}
                  </div>
                </div>
                {(publishError.includes("DESTINATION_NOT_WORKING") || publishError.includes("unreachable") || publishError.includes("URL")) && (
                  <div className="pt-2 border-t border-rose-200/70 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startFieldEdit("website")}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
                    >
                      ✏️ Edit Website URL in Cockpit
                    </button>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pills & Input Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2.5">
            {/* Active Reference Campaign Chip Banner */}
            {referencedCampaign && (
              <div className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 animate-in fade-in slide-in-from-bottom-1 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <AtSign className="h-3 w-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[11px] truncate text-purple-950">
                        Referenced: @{referencedCampaign.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-200/80 text-purple-900 font-semibold">
                        Read-Only Context
                      </span>
                    </div>
                    <span className="text-[9px] text-purple-600 block truncate">
                      AI is using this campaign for context & comparisons without modifying your cockpit.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Load "${referencedCampaign.name}" into your campaign cockpit? This will populate the form on the right with this campaign's settings.`)) {
                        handleLoadDraftCampaign(referencedCampaign);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-[10px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    title="Explicitly load this referenced campaign into the cockpit"
                  >
                    <Check className="h-3 w-3" />
                    <span>Apply / Load into Cockpit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReferencedCampaign(null)}
                    className="text-purple-400 hover:text-purple-700 p-1 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                    title="Remove reference"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Chat Input Form with ChatGPT-style Action Pin/Paperclip Menu */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 relative"
            >
              {/* ChatGPT-style Attachment/Actions Pin Button */}
              <div className="relative shrink-0 pb-0.5">
                <button
                  type="button"
                  onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                  title="Attach media or Generate AI Assets"
                  className={`w-10 h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isActionsMenuOpen
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                      : "bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 border-slate-300 shadow-2xs"
                  }`}
                >
                  <Paperclip className="h-4.5 w-4.5 shrink-0 stroke-[2.2]" />
                </button>

                {/* ChatGPT-style Popover Menu for AI Generation & Media Uploads */}
                {isActionsMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto scrollbar-thin">
                    <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        AI & Media Actions
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsActionsMenuOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Quick Bundle Prompts */}
                    <div className="space-y-1">
                      <p className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">All-in-One Prompts</p>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("ALL_IN_ONE");
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/60 text-blue-950 text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Zap className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="leading-tight font-bold text-blue-900">Generate All in One Prompt</p>
                          <p className="text-[10px] text-blue-600/90 font-normal truncate">Headlines, descriptions, keywords & creatives</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("TEXT_ASSETS");
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/60 text-purple-950 text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="leading-tight font-bold text-purple-900">Generate Headlines & Descriptions in One Prompt</p>
                          <p className="text-[10px] text-purple-600/90 font-normal truncate">Headlines, long headlines & descriptions bundle</p>
                        </div>
                      </button>
                    </div>

                    {/* AI Generation Tools */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <p className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">AI Generators</p>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("HEADLINES");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Generate Headlines prompt</p>
                          <p className="text-[10px] text-slate-400 font-normal">AI punchy titles (&le; 30 chars)</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("LONG_HEADLINES");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Generate Long Headlines prompt</p>
                          <p className="text-[10px] text-slate-400 font-normal">AI extended titles (&le; 90 chars)</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("DESCRIPTIONS");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Generate Descriptions prompt</p>
                          <p className="text-[10px] text-slate-400 font-normal">AI ad copy (&le; 90 chars)</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("IMAGE");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <Wand2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Generate Marketing Images</p>
                          <p className="text-[10px] text-slate-400 font-normal">Landscape & Square creatives</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleTriggerAiAssetGeneration("LOGO");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-purple-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Generate Brand Logo</p>
                          <p className="text-[10px] text-slate-400 font-normal">Square brand icon (1:1)</p>
                        </div>
                      </button>
                    </div>

                    {/* Media Uploads */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                      <p className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Media Uploads</p>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setActiveUploadTarget("IMAGE");
                          imageInputRef.current?.click();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <ImageIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Upload Marketing Image</p>
                          <p className="text-[10px] text-slate-400 font-normal">PNG, JPG, WebP</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setActiveUploadTarget("LOGO");
                          logoInputRef.current?.click();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <Upload className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Upload Brand Logo</p>
                          <p className="text-[10px] text-slate-400 font-normal">1:1 square icon</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setActiveUploadTarget("VIDEO");
                          videoInputRef.current?.click();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <Video className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="leading-tight">Upload Video Asset</p>
                          <p className="text-[10px] text-slate-400 font-normal">MP4 video file</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* @ Button on the LEFT side of the Chat Input Box */}
              <div className="relative shrink-0 pb-0.5">
                <button
                  type="button"
                  onClick={() => setIsCampaignDropdownOpen(!isCampaignDropdownOpen)}
                  title="Reference Existing Campaign (@) to reuse business, budget & assets"
                  className={`w-10 h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isCampaignDropdownOpen || referencedCampaign
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20"
                      : "bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-slate-300 shadow-2xs"
                  }`}
                >
                  <AtSign className="h-4.5 w-4.5 shrink-0 stroke-[2.2]" />
                </button>

                {/* Dropdown Menu for Selecting Existing Campaign */}
                {isCampaignDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <AtSign className="h-4 w-4 text-purple-600" />
                        <span className="font-bold text-xs text-slate-800">Reference Campaign</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCampaignDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight">
                      Pick an existing campaign to reuse its business name, locations, budget, headlines & creative assets without repeating information.
                    </p>

                    {/* Search Input for Campaigns */}
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={campaignSearchQuery}
                        onChange={(e) => setCampaignSearchQuery(e.target.value)}
                        placeholder="Search existing campaigns..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>

                    {/* Campaign List */}
                    <div className="max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin pr-0.5">
                      {isLoadingCampaigns ? (
                        <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                          <span>Loading campaigns...</span>
                        </div>
                      ) : existingCampaignsList.length === 0 ? (
                        <div className="py-5 text-center text-xs text-slate-400">
                          <Bookmark className="h-5 w-5 text-slate-300 mx-auto mb-1" />
                          <p className="font-medium text-slate-600">No campaigns found</p>
                          <p className="text-[10px] text-slate-400">Create your first AI campaign to build history!</p>
                        </div>
                      ) : (
                        existingCampaignsList
                          .filter((c) =>
                            !campaignSearchQuery ||
                            (c.name || "").toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
                            (c.campaignType || "").toLowerCase().includes(campaignSearchQuery.toLowerCase())
                          )
                          .map((camp) => {
                            const isSelected = referencedCampaign?.id === camp.id || referencedCampaign?.googleAdsCampaignId === camp.googleAdsCampaignId;
                            const budget = camp.budget ? Number(camp.budget) : (camp.amountMicros ? Number(camp.amountMicros) / 1_000_000 : null);
                            return (
                              <button
                                key={camp.id || camp.googleAdsCampaignId || Math.random()}
                                type="button"
                                onClick={() => handleSelectReferenceCampaign(camp)}
                                className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? "bg-purple-50 border-purple-300 text-purple-900"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-purple-200"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs truncate text-slate-900">
                                      {camp.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                    <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                                      {camp.campaignType || "SEARCH"}
                                    </span>
                                    {budget && budget > 0 && (
                                      <span className="font-mono text-emerald-600 font-semibold">
                                        ₹{budget.toLocaleString()}/day
                                      </span>
                                    )}
                                    {camp.status && (
                                      <span className="text-[9px] uppercase tracking-wider text-slate-400">
                                        {camp.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-purple-600 opacity-60 shrink-0" />
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Textarea */}
              <div className="relative flex-1">
                <textarea
                  ref={inputRef as any}
                  rows={1}
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    // If user manually types "@", open the dropdown
                    if (e.target.value.endsWith("@") && !isCampaignDropdownOpen) {
                      setIsCampaignDropdownOpen(true);
                    }
                    // Auto-adjust height dynamically
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (inputVal.trim() && !isLoading && !isPublishing) {
                        handleSendMessage();
                        // Reset textarea height after sending
                        if (inputRef.current) {
                          inputRef.current.style.height = "auto";
                        }
                      }
                    }
                  }}
                  placeholder={
                    aiNotificationBanner
                      ? "⚠️ Please apply, view, or cancel the pending AI suggestions above first..."
                      : isLoading
                      ? "AI Copilot is formulating recommendations..."
                      : "Describe your goal, business, paste URL, budget, or type @ to reference a campaign..."
                  }
                  disabled={Boolean(aiNotificationBanner) || isLoading || isPublishing}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all disabled:opacity-60 shadow-xs resize-none min-h-[42px] max-h-[140px] leading-relaxed scrollbar-thin overflow-y-auto block"
                />
                {isAnalyzingUrl ? (
                  <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-[9px] font-semibold flex items-center gap-1 animate-pulse pointer-events-none">
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-600" />
                    <span>Analyzing your website...</span>
                  </span>
                ) : (
                  inputVal.includes("http") && (
                    <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-mono pointer-events-none">
                      URL Detected
                    </span>
                  )
                )}
              </div>

              <button
                type="submit"
                disabled={Boolean(aiNotificationBanner) || !inputVal.trim() || isLoading || isPublishing}
                className="px-5 py-2.5 h-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* DRAGGABLE VERTICAL SPLIT DIVIDER (Desktop / Laptop View) */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingCockpit(true);
          }}
          className={`hidden lg:flex items-center justify-center w-1.5 hover:w-2 -mx-0.5 z-20 cursor-col-resize transition-all duration-150 select-none group shrink-0 ${
            isResizingCockpit
              ? "bg-blue-600 ring-2 ring-blue-400/50 w-2"
              : "bg-slate-200/80 hover:bg-blue-500"
          }`}
          title="Drag left or right to resize panels"
        >
          {/* Subtle center grip pill */}
          <div
            className={`w-1 h-8 rounded-full transition-colors flex flex-col items-center justify-center gap-0.5 ${
              isResizingCockpit ? "bg-white" : "bg-slate-400/70 group-hover:bg-white"
            }`}
          >
            <span className="w-0.5 h-0.5 rounded-full bg-slate-600 group-hover:bg-blue-600" />
            <span className="w-0.5 h-0.5 rounded-full bg-slate-600 group-hover:bg-blue-600" />
            <span className="w-0.5 h-0.5 rounded-full bg-slate-600 group-hover:bg-blue-600" />
          </div>
        </div>

        {/* RIGHT: Live Campaign Cockpit Panel (Light Theme) */}
        <div
          style={{ width: `${cockpitWidth}px` }}
          className={`relative w-full max-w-full lg:max-w-none h-full min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex-col shrink-0 shadow-xs transition-opacity duration-200 ${
            mobileActiveTab === "cockpit" ? "flex flex-1 lg:flex-none !w-full" : "hidden lg:flex"
          } ${aiNotificationBanner ? "pointer-events-none opacity-60 select-none" : ""}`}
        >
          {/* Backdrop lock when notification banner is active */}
          {aiNotificationBanner && (
            <div className="absolute inset-0 z-30 bg-slate-100/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 pointer-events-auto">
              <div className="p-4 rounded-2xl bg-white/95 border border-blue-200 shadow-xl max-w-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Sparkles className="h-4 w-4 animate-pulse text-blue-600" />
                </div>
                <h5 className="text-xs font-bold text-slate-900">Cockpit Paused</h5>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Please respond to the AI Notification (Apply, View, or Cancel) to unlock the Cockpit.
                </p>
                <button
                  type="button"
                  onClick={() => setAiNotificationBanner(null)}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Dismiss & Unlock
                </button>
              </div>
            </div>
          )}
          
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
            {/* Publish Error Notification Banner with Crop / Edit CTA */}
            {publishError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-xs text-rose-950">Campaign Launch Issue</h4>
                      <p className="text-[11px] text-rose-800 leading-relaxed break-words">{publishError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPublishError(null)}
                    className="text-rose-400 hover:text-rose-700 p-0.5 rounded transition-colors shrink-0"
                    title="Dismiss alert"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Quick Interactive Actions based on Error Type */}
                <div className="flex items-center gap-2 pt-1 border-t border-rose-200/70 flex-wrap">
                  {publishError.includes("logo") && (campaignState.logos?.length || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleEditExistingAsset("LOGO", 0)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Crop className="h-3 w-3" />
                      <span>Crop Logo to 1:1 Square</span>
                    </button>
                  )}
                  {publishError.includes("marketing image") && (campaignState.images?.length || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleEditExistingAsset("IMAGE", 0)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Crop className="h-3 w-3" />
                      <span>Crop Marketing Image</span>
                    </button>
                  )}
                  {publishError.includes("website") || publishError.includes("Landing page") ? (
                    <button
                      type="button"
                      onClick={() => startFieldEdit("website")}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit Website URL</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPublishError(null)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-700 font-semibold text-[10px] border border-rose-200 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Publish Success Banner */}
            {publishSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-emerald-950">Published Successfully</h4>
                  <p className="text-[11px] text-emerald-800">{publishSuccess}</p>
                </div>
              </div>
            )}

            {/* Live Website Fetching & Extraction Animation Banner */}
            {isAnalyzingUrl && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-300 animate-pulse text-xs text-blue-900 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="font-bold text-blue-950">Crawling Website & Extracting Assets...</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Fetching live meta tags, headings, product keywords, and brand identity from your website to auto-populate the Cockpit.
                </p>
                <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: "65%" }}></div>
                </div>
              </div>
            )}

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
                        onKeyDown={handleKeyDownSave}
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
                        onKeyDown={handleKeyDownSave}
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
                              onKeyDown={handleKeyDownSave}
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
                              onKeyDown={handleKeyDownSave}
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
                              onKeyDown={handleKeyDownSave}
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
                              onKeyDown={handleKeyDownSave}
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
                                onKeyDown={handleKeyDownSave}
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
                          onKeyDown={handleKeyDownSave}
                          placeholder="https://example.com"
                          className={`w-full bg-white border ${fieldError ? "border-rose-500 focus:ring-rose-500" : "border-blue-500"} rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none`}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={saveFieldEdit}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0"
                          title="Save & Analyze"
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
                      <div className="flex items-center gap-1.5 truncate max-w-[240px] justify-end">
                        {isAnalyzingUrl && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin text-blue-600 shrink-0" />
                            <span>Analyzing...</span>
                          </span>
                        )}
                        <span className="font-mono text-blue-600 truncate text-right">
                          {campaignState.website || "Not set"}
                        </span>
                      </div>
                    )}
                  </div>
                  {editingField === "website" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

                {/* Field 7a: Budget Type (Daily Budget vs Campaign Total Budget) */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>Budget Type:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "budgetType" ? cancelFieldEdit() : startFieldEdit("budgetType"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Budget Type"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "budgetType" ? (
                      <div className="flex items-center gap-1.5 flex-1 max-w-[240px] justify-end">
                        <select
                          value={tempEditValues.budgetType || "DAILY"}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, budgetType: e.target.value as "TOTAL" | "DAILY" })}
                          className="bg-white border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                          autoFocus
                        >
                          <option value="DAILY">Daily Budget (Per Day)</option>
                          <option value="TOTAL">Campaign Total Budget (Total Spend)</option>
                        </select>
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
                      <span className="font-medium text-slate-800">
                        {campaignState.budgetType === "TOTAL" ? "Campaign Total Budget" : "Daily Budget"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Field 7b: Budget Amount */}
                <div className="py-1 border-b border-slate-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>{campaignState.budgetType === "TOTAL" ? "Campaign Total Budget:" : "Daily Budget:"}</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "dailyBudget" ? cancelFieldEdit() : startFieldEdit("dailyBudget"))}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                        title="Edit Budget"
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
                            onKeyDown={handleKeyDownSave}
                            placeholder={tempEditValues.budgetType === "TOTAL" || campaignState.budgetType === "TOTAL" ? "50000" : "1000"}
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
                      <span className="font-mono font-bold text-emerald-600 text-right">
                        {campaignState.dailyBudget && campaignState.dailyBudget > 0 ? (
                          campaignState.budgetType === "TOTAL" ? (
                            <span>
                              ₹{campaignState.dailyBudget.toLocaleString("en-IN")} total ✓
                              {campaignState.startDate && campaignState.endDate && (() => {
                                const start = new Date(campaignState.startDate).getTime();
                                const end = new Date(campaignState.endDate).getTime();
                                const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                                const avgDaily = Math.round(Number(campaignState.dailyBudget) / days);
                                return (
                                  <span className="block text-[9px] font-normal text-slate-500">
                                    ≈ ₹{avgDaily.toLocaleString("en-IN")}/day ({days} days)
                                  </span>
                                );
                              })()}
                            </span>
                          ) : (
                            `₹${campaignState.dailyBudget.toLocaleString("en-IN")}/day ✓`
                          )
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
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          {/* Sub Tabs: Location vs Radius */}
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setLocationTab("LOCATION");
                                setLocationSearchResults(GOOGLE_ADS_LOCATION_PRESETS.slice(0, 6).map(loc => ({ ...loc, targetType: "Location" })));
                              }}
                              className={`flex-1 py-1 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1 ${
                                locationTab === "LOCATION" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <Globe className="h-3 w-3" />
                              <span>Location</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLocationTab("RADIUS");
                                setLocationSearchResults([]);
                              }}
                              className={`flex-1 py-1 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1 ${
                                locationTab === "RADIUS" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              <Navigation className="h-3 w-3" />
                              <span>Radius Targeting</span>
                            </button>
                          </div>

                          {/* Radius Controls (Only in Radius mode) */}
                          {locationTab === "RADIUS" && (
                            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-700 font-semibold shrink-0">Radius:</span>
                              <input
                                type="number"
                                min={1}
                                max={500}
                                value={radiusValue}
                                onChange={(e) => setRadiusValue(Math.max(1, Number(e.target.value) || 1))}
                                className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                              <div className="flex items-center rounded border border-slate-300 overflow-hidden bg-white shrink-0 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setRadiusUnit("km")}
                                  className={`px-2 py-0.5 font-bold transition-colors ${
                                    radiusUnit === "km" ? "bg-slate-900 text-white" : "bg-transparent text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  km
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRadiusUnit("mi")}
                                  className={`px-2 py-0.5 font-bold transition-colors ${
                                    radiusUnit === "mi" ? "bg-slate-900 text-white" : "bg-transparent text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  mi
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Selected Location Badges */}
                          {selectedLocationsList.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedLocationsList.map((loc) => (
                                <span
                                  key={loc}
                                  className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] flex items-center gap-1 font-medium max-w-full"
                                >
                                  <span className="truncate">{loc}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLocationsList(selectedLocationsList.filter(l => l !== loc))}
                                    className="hover:text-blue-900 shrink-0"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Location / Radius Search Input */}
                          <div className="relative">
                            <input
                              type="text"
                              value={locationSearchQuery}
                              onChange={(e) => {
                                setLocationSearchQuery(e.target.value);
                                setFieldError(null);
                              }}
                              placeholder={
                                locationTab === "RADIUS"
                                  ? `Search city, town, address, landmark...`
                                  : `Search country, state, city, PIN code...`
                              }
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
                                const targetLabel = locationTab === "RADIUS"
                                  ? `${radiusValue} ${radiusUnit} around ${item.name || item.canonicalName}`
                                  : (item.canonicalName || item.name);
                                const isSelected = selectedLocationsList.includes(targetLabel) || selectedLocationsList.includes(item.name) || selectedLocationsList.includes(item.canonicalName);
                                return (
                                  <button
                                    key={`${item.id || item.name}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      if (!isSelected) {
                                        setSelectedLocationsList([...selectedLocationsList, targetLabel]);
                                      } else {
                                        setSelectedLocationsList(selectedLocationsList.filter(l => l !== targetLabel && l !== item.name && l !== item.canonicalName));
                                      }
                                      setFieldError(null);
                                    }}
                                    className={`w-full text-left px-2 py-1 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                      isSelected ? "bg-blue-50/60 font-semibold text-blue-800" : "text-slate-700"
                                    }`}
                                  >
                                    <div className="truncate pr-2">
                                      <span>{locationTab === "RADIUS" ? `${radiusValue} ${radiusUnit} around ${item.name}` : (item.canonicalName || item.name)}</span>
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
                                {locationSearchQuery.trim().length >= 2 ? "No matching locations found" : "Type 2+ characters to search Google Places & Geo-Targets"}
                              </div>
                            )}
                          </div>

                          {/* ── Interactive Google Maps Visual Location Preview ── */}
                          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100">
                            <div className="p-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1 font-bold text-slate-800">
                                <MapPin className="h-3 w-3 text-red-500" />
                                <span>Google Maps Live Coverage Preview</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowLocationMapPreview(!showLocationMapPreview)}
                                className="text-[9px] text-blue-600 font-semibold hover:underline"
                              >
                                {showLocationMapPreview ? "Hide Map" : "Show Map"}
                              </button>
                            </div>

                            {showLocationMapPreview && (
                              <div className="relative w-full h-48 bg-slate-200">
                                {(() => {
                                  const primaryTarget = selectedLocationsList[0] || (locationSearchQuery.trim() || "India");
                                  const encodedLoc = encodeURIComponent(primaryTarget);
                                  // Universal Google Maps search embed URL - works 100% reliably without requiring separate "Maps Embed API" activation on Cloud Console
                                  const zoomLevel = locationTab === "RADIUS" ? 12 : 8;
                                  const mapUrl = `https://maps.google.com/maps?q=${encodedLoc}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
                                  return (
                                    <iframe
                                      title="Google Maps Location Target"
                                      src={mapUrl}
                                      className="w-full h-full border-0"
                                      loading="lazy"
                                      referrerPolicy="no-referrer-when-downgrade"
                                    />
                                  );
                                })()}
                                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono flex items-center gap-1 shadow-sm">
                                  <Globe className="h-2.5 w-2.5 text-cyan-400" />
                                  <span>{selectedLocationsList.length > 0 ? `${selectedLocationsList.length} Active Target(s)` : "Previewing: India"}</span>
                                </div>
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
                        {campaignState.language || "All languages"}
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
                                  if (lang.name === "All languages") {
                                    setSelectedLanguagesList(["All languages"]);
                                  } else {
                                    if (isSelected) {
                                      if (selectedLanguagesList.length > 1) {
                                        setSelectedLanguagesList(selectedLanguagesList.filter(l => l !== lang.name));
                                      } else {
                                        setSelectedLanguagesList(["All languages"]);
                                      }
                                    } else {
                                      // If user picks a specific language, replace "All languages" or append
                                      const withoutAll = selectedLanguagesList.filter(l => l !== "All languages");
                                      setSelectedLanguagesList([...withoutAll, lang.name]);
                                    }
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
                          onKeyDown={handleKeyDownSave}
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

                {/* Field 11: End Date (Optional for Daily Budget, Mandatory for Total Budget) */}
                <div className="py-1 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>End Date:</span>
                      {campaignState.budgetType === "TOTAL" ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          Required
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-medium">
                          Optional
                        </span>
                      )}
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
                            setFieldError(validateEndDate(val, effectiveStart, tempEditValues.budgetType || campaignState.budgetType));
                          }}
                          onKeyDown={handleKeyDownSave}
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
                      campaignState.endDate ? (
                        <span className="text-slate-800 font-medium font-mono">{campaignState.endDate}</span>
                      ) : campaignState.budgetType === "TOTAL" ? (
                        <span className="text-amber-600 font-medium text-[11px] italic">Required for Total Budget</span>
                      ) : (
                        <span className="text-slate-400 font-normal text-[11px]">No end date (Indefinite)</span>
                      )
                    )}
                  </div>
                  {editingField === "endDate" && fieldError && (
                    <div className="mt-1 text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                      <span>{fieldError}</span>
                    </div>
                  )}
                </div>

                {/* OPTIONAL PARAMETERS ACCORDION - Only displayed when both Objective and Campaign Type are selected */}
                {Boolean(campaignState.objective && campaignState.campaignType) && (
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowOptionalParams(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-purple-900 font-semibold text-[11px] transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="flex items-center gap-1.5">
                        <Settings2 className="h-3.5 w-3.5 text-purple-600 group-hover:rotate-45 transition-transform" />
                        <span>Optional Settings & Parameters ({campaignState.campaignType?.replace("_", " ")})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-purple-700 font-medium">
                        <span>{showOptionalParams ? "Hide" : "Show"}</span>
                        {showOptionalParams ? (
                          <ChevronDown className="h-3.5 w-3.5 text-purple-600 transition-transform" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-purple-600 transition-transform" />
                        )}
                      </div>
                    </button>

                    {/* Optional Parameters Expandable Body */}
                    {showOptionalParams && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50/90 border border-purple-100 space-y-2.5 text-[11px] animate-in fade-in duration-150">
                        <div className="text-[10px] font-semibold text-purple-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          <span>Optional Parameters for {campaignState.objective} • {campaignState.campaignType}</span>
                        </div>

                        {/* Optional Param 1: Asset Group / Ad Group Name */}
                        <div className="py-1 border-b border-slate-200/70 group">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-slate-500">
                              <span>{campaignState.campaignType === "PERFORMANCE_MAX" ? "Asset Group Name:" : "Ad Group Name:"}</span>
                              <button
                                type="button"
                                onClick={() => (editingField === "assetGroupName" ? cancelFieldEdit() : startFieldEdit("assetGroupName"))}
                                className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                                title="Edit Asset Group Name"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                            </div>
                            {editingField === "assetGroupName" ? (
                              <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                                <input
                                  type="text"
                                  value={tempEditValues.assetGroupName || ""}
                                  onChange={(e) => setTempEditValues({ ...tempEditValues, assetGroupName: e.target.value })}
                                  onKeyDown={handleKeyDownSave}
                                  placeholder="e.g. Sales Group 1"
                                  className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                              <span className="text-slate-800 font-medium truncate max-w-[180px]">
                                {campaignState.assetGroupName || `${campaignState.businessName || "Campaign"} ${campaignState.campaignType === "PERFORMANCE_MAX" ? "Asset Group" : "Ad Group"} 1`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Optional Param 2: EU Political Advertising */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                          <span className="text-slate-500">EU Political Ads:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setCampaignState(prev => ({ ...prev, euPolitical: "NO" }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                (campaignState.euPolitical || "NO") === "NO"
                                  ? "bg-purple-600 text-white shadow-2xs"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              NO
                            </button>
                            <button
                              type="button"
                              onClick={() => setCampaignState(prev => ({ ...prev, euPolitical: "YES" }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                campaignState.euPolitical === "YES"
                                  ? "bg-purple-600 text-white shadow-2xs"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              YES
                            </button>
                          </div>
                        </div>

                        {/* Optional Param 3: Brand Guidelines (PMax & Display & Demand Gen) */}
                        {(campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.campaignType === "DEMAND_GEN" || campaignState.campaignType === "DISPLAY") && (
                          <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                            <span className="text-slate-500">Brand Guidelines:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, brandGuidelinesEnabled: false }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  !campaignState.brandGuidelinesEnabled
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                Off
                              </button>
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, brandGuidelinesEnabled: true }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  campaignState.brandGuidelinesEnabled
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                On
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Optional Param 4: Customer Acquisition Mode (Sales / Leads PMax & Search) */}
                        {(campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.campaignType === "SEARCH") && (
                          <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                            <span className="text-slate-500">Customer Acquisition:</span>
                            <select
                              value={campaignState.customerAcquisitionMode || "EQUAL"}
                              onChange={(e) => setCampaignState(prev => ({
                                ...prev,
                                customerAcquisitionMode: e.target.value,
                                onlyBidNewCustomers: e.target.value === "ONLY_NEW"
                              }))}
                              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 max-w-[160px]"
                            >
                              <option value="EQUAL">Bid equally (New & Existing)</option>
                              <option value="BID_HIGHER">Bid higher for new customers</option>
                              <option value="ONLY_NEW">Only bid for new customers</option>
                            </select>
                          </div>
                        )}

                        {/* Search Campaign Specific Network & Rotation Controls */}
                        {campaignState.campaignType === "SEARCH" && (
                          <>
                            {/* Search Partners Network Toggle */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Google Search Partners:</span>
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, networkSearch: prev.networkSearch === false ? true : false }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  campaignState.networkSearch !== false
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {campaignState.networkSearch !== false ? "Included" : "Excluded"}
                              </button>
                            </div>

                            {/* Display Network Expansion Toggle */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Google Display Network:</span>
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, networkDisplay: prev.networkDisplay === false ? true : false }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  campaignState.networkDisplay !== false
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {campaignState.networkDisplay !== false ? "Included" : "Excluded"}
                              </button>
                            </div>

                            {/* Location Targeting Mode */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Location Targeting:</span>
                              <select
                                value={campaignState.locationOptionsPresence || "PRESENCE_INTEREST"}
                                onChange={(e) => setCampaignState(prev => ({ ...prev, locationOptionsPresence: e.target.value }))}
                                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 max-w-[170px]"
                              >
                                <option value="PRESENCE_INTEREST">Presence or Interest</option>
                                <option value="PRESENCE">Presence only (In location)</option>
                              </select>
                            </div>

                            {/* Ad Rotation Mode */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Ad Rotation:</span>
                              <select
                                value={campaignState.adRotationMode || "OPTIMIZE"}
                                onChange={(e) => setCampaignState(prev => ({ ...prev, adRotationMode: e.target.value }))}
                                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 max-w-[170px]"
                              >
                                <option value="OPTIMIZE">Optimize (Prefer best ads)</option>
                                <option value="DO_NOT_OPTIMIZE">Do not optimize (Rotate evenly)</option>
                              </select>
                            </div>

                            {/* Search Term Matching (Broad Match AI Expansion) */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Search Term Matching:</span>
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, useSearchTermMatchingAdGroup: prev.useSearchTermMatchingAdGroup === false ? true : false }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  campaignState.useSearchTermMatchingAdGroup !== false
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {campaignState.useSearchTermMatchingAdGroup !== false ? "Enabled (Broad Match)" : "Keywords Only"}
                              </button>
                            </div>

                            {/* AI Text Customization Toggle */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Text Customization:</span>
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, enableTextCustomization: prev.enableTextCustomization === false ? true : false }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  campaignState.enableTextCustomization !== false
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {campaignState.enableTextCustomization !== false ? "Auto-Customized" : "Static Ads"}
                              </button>
                            </div>
                          </>
                        )}

                        {/* Demand Gen Specific Settings */}
                        {campaignState.campaignType === "DEMAND_GEN" && (
                          <>
                            {/* Ad Format Selector */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Ad Format:</span>
                              <select
                                value={campaignState.adFormat || "SINGLE_IMAGE"}
                                onChange={(e) => setCampaignState(prev => ({ ...prev, adFormat: e.target.value as any }))}
                                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-bold focus:outline-none focus:border-blue-500 max-w-[150px]"
                              >
                                <option value="SINGLE_IMAGE">Single Image Ad</option>
                                <option value="VIDEO">Video Ad (YouTube)</option>
                                <option value="CAROUSEL">Multi-Card Carousel</option>
                              </select>
                            </div>

                            {/* Call to Action Button */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Call to Action:</span>
                              <select
                                value={campaignState.callToAction || "Automated"}
                                onChange={(e) => setCampaignState(prev => ({ ...prev, callToAction: e.target.value }))}
                                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 max-w-[150px]"
                              >
                                <option value="Automated">Automated</option>
                                <option value="Learn more">Learn more</option>
                                <option value="Shop now">Shop now</option>
                                <option value="Sign up">Sign up</option>
                                <option value="Contact us">Contact us</option>
                                <option value="Get quote">Get quote</option>
                                <option value="Download">Download</option>
                                <option value="Book now">Book now</option>
                                <option value="Apply now">Apply now</option>
                              </select>
                            </div>

                            {/* Channel Placements Targeting */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Channel Placements:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, channelTargeting: "ALL" }))}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    (campaignState.channelTargeting || "ALL") === "ALL"
                                      ? "bg-purple-600 text-white shadow-2xs"
                                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  All Channels
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, channelTargeting: "CHOOSE" }))}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    campaignState.channelTargeting === "CHOOSE"
                                      ? "bg-purple-600 text-white shadow-2xs"
                                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  Custom
                                </button>
                              </div>
                            </div>

                            {/* View-Through Conversions Toggle */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">View-Through Conversions:</span>
                              <button
                                type="button"
                                onClick={() => setCampaignState(prev => ({ ...prev, includeViewThrough: !prev.includeViewThrough }))}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  campaignState.includeViewThrough
                                    ? "bg-purple-600 text-white shadow-2xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {campaignState.includeViewThrough ? "Included" : "Excluded"}
                              </button>
                            </div>

                            {/* Brand Colors (Hex Code Inputs) */}
                            <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500">Brand Colors:</span>
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: campaignState.mainBrandColor || "#2563EB" }} />
                                  <input
                                    type="text"
                                    maxLength={7}
                                    value={campaignState.mainBrandColor || "#2563EB"}
                                    onChange={(e) => setCampaignState(prev => ({ ...prev, mainBrandColor: e.target.value }))}
                                    placeholder="#2563EB"
                                    className="w-16 bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] font-mono text-slate-800"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: campaignState.accentBrandColor || "#F59E0B" }} />
                                  <input
                                    type="text"
                                    maxLength={7}
                                    value={campaignState.accentBrandColor || "#F59E0B"}
                                    onChange={(e) => setCampaignState(prev => ({ ...prev, accentBrandColor: e.target.value }))}
                                    placeholder="#F59E0B"
                                    className="w-16 bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] font-mono text-slate-800"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 6 Google AI Creative Enhancements Switches */}
                            <div className="py-1 border-b border-slate-200/70 space-y-1">
                              <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-purple-600" />
                                <span>Google AI Creative Enhancements:</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, optAdaptiveLayouts: prev.optAdaptiveLayouts === false ? true : false }))}
                                  className={`px-2 py-1 rounded text-[9px] font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                                    campaignState.optAdaptiveLayouts !== false ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                                  }`}
                                >
                                  <span>Adaptive Layouts</span>
                                  <span>{campaignState.optAdaptiveLayouts !== false ? "✓" : "✕"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, optAnimatedImages: prev.optAnimatedImages === false ? true : false }))}
                                  className={`px-2 py-1 rounded text-[9px] font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                                    campaignState.optAnimatedImages !== false ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                                  }`}
                                >
                                  <span>Animated Images</span>
                                  <span>{campaignState.optAnimatedImages !== false ? "✓" : "✕"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, optGeneratedVideos: prev.optGeneratedVideos === false ? true : false }))}
                                  className={`px-2 py-1 rounded text-[9px] font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                                    campaignState.optGeneratedVideos !== false ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                                  }`}
                                >
                                  <span>Generated Videos</span>
                                  <span>{campaignState.optGeneratedVideos !== false ? "✓" : "✕"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, optShorterVideos: prev.optShorterVideos === false ? true : false }))}
                                  className={`px-2 py-1 rounded text-[9px] font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                                    campaignState.optShorterVideos !== false ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                                  }`}
                                >
                                  <span>Shorter 6s Videos</span>
                                  <span>{campaignState.optShorterVideos !== false ? "✓" : "✕"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, optResizedVideos: prev.optResizedVideos === false ? true : false }))}
                                  className={`px-2 py-1 rounded text-[9px] font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                                    campaignState.optResizedVideos !== false ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                                  }`}
                                >
                                  <span>Resized 9:16 Shorts</span>
                                  <span>{campaignState.optResizedVideos !== false ? "✓" : "✕"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCampaignState(prev => ({ ...prev, optLandingPagePreviews: prev.optLandingPagePreviews === false ? true : false }))}
                                  className={`px-2 py-1 rounded text-[9px] font-medium border text-left flex items-center justify-between cursor-pointer transition-colors ${
                                    campaignState.optLandingPagePreviews !== false ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-white border-slate-200 text-slate-500"
                                  }`}
                                >
                                  <span>Page Previews</span>
                                  <span>{campaignState.optLandingPagePreviews !== false ? "✓" : "✕"}</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Optional Param 5: Tracking Template */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between group">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Tracking Template:</span>
                            <button
                              type="button"
                              onClick={() => (editingField === "trackingTemplate" ? cancelFieldEdit() : startFieldEdit("trackingTemplate"))}
                              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                              title="Edit Tracking Template"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                          {editingField === "trackingTemplate" ? (
                            <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                              <input
                                type="text"
                                value={tempEditValues.trackingTemplate || ""}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, trackingTemplate: e.target.value })}
                                onKeyDown={handleKeyDownSave}
                                placeholder="{lpurl}?utm_source=google"
                                className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                            <span className="text-slate-800 font-medium font-mono text-[10px] truncate max-w-[160px]">
                              {campaignState.trackingTemplate || "None"}
                            </span>
                          )}
                        </div>

                        {/* Optional Param 6: Final URL Suffix */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between group">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Final URL Suffix:</span>
                            <button
                              type="button"
                              onClick={() => (editingField === "finalUrlSuffix" ? cancelFieldEdit() : startFieldEdit("finalUrlSuffix"))}
                              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                              title="Edit Final URL Suffix"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                          {editingField === "finalUrlSuffix" ? (
                            <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                              <input
                                type="text"
                                value={tempEditValues.finalUrlSuffix || ""}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, finalUrlSuffix: e.target.value })}
                                onKeyDown={handleKeyDownSave}
                                placeholder="utm_source=google&utm_medium=cpc"
                                className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                            <span className="text-slate-800 font-medium font-mono text-[10px] truncate max-w-[160px]">
                              {campaignState.finalUrlSuffix || "None"}
                            </span>
                          )}
                        </div>

                        {/* Optional Param 7: Display Path 1 & 2 */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between group">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Display Paths:</span>
                            <button
                              type="button"
                              onClick={() => (editingField === "displayPath1" ? cancelFieldEdit() : startFieldEdit("displayPath1"))}
                              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                              title="Edit Display Paths"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                          {editingField === "displayPath1" ? (
                            <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                              <input
                                type="text"
                                maxLength={15}
                                value={tempEditValues.displayPath1 || ""}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, displayPath1: e.target.value })}
                                placeholder="Path 1"
                                className="w-1/2 bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
                                autoFocus
                              />
                              <input
                                type="text"
                                maxLength={15}
                                value={tempEditValues.displayPath2 || ""}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, displayPath2: e.target.value })}
                                onKeyDown={handleKeyDownSave}
                                placeholder="Path 2"
                                className="w-1/2 bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                            <span className="text-slate-800 font-medium font-mono text-[10px] truncate max-w-[160px]">
                              {campaignState.displayPath1 || campaignState.displayPath2
                                ? `/${campaignState.displayPath1 || ""}${campaignState.displayPath2 ? `/${campaignState.displayPath2}` : ""}`
                                : "Standard URL"}
                            </span>
                          )}
                        </div>

                        {/* Optional Param 8: Mobile Final URL */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between group">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Mobile Final URL:</span>
                            <button
                              type="button"
                              onClick={() => (editingField === "mobileFinalUrl" ? cancelFieldEdit() : startFieldEdit("mobileFinalUrl"))}
                              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                              title="Edit Mobile URL"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                          {editingField === "mobileFinalUrl" ? (
                            <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                              <input
                                type="url"
                                value={tempEditValues.mobileFinalUrl || ""}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, mobileFinalUrl: e.target.value })}
                                onKeyDown={handleKeyDownSave}
                                placeholder="https://m.example.com"
                                className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                            <span className="text-slate-800 font-medium truncate max-w-[160px]">
                              {campaignState.mobileFinalUrl || "Same as Final URL"}
                            </span>
                          )}
                        </div>

                        {/* Optional Param 9: Call Extension Phone Number */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between group">
                          <div className="flex items-center gap-1 text-slate-500">
                            <span>Call Phone Number:</span>
                            <button
                              type="button"
                              onClick={() => (editingField === "callPhoneNumber" ? cancelFieldEdit() : startFieldEdit("callPhoneNumber"))}
                              className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                              title="Edit Phone Number"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                          {editingField === "callPhoneNumber" ? (
                            <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                              <input
                                type="tel"
                                value={tempEditValues.callPhoneNumber || ""}
                                onChange={(e) => setTempEditValues({ ...tempEditValues, callPhoneNumber: e.target.value })}
                                onKeyDown={handleKeyDownSave}
                                placeholder="+91 9876543210"
                                className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                            <span className="text-slate-800 font-medium font-mono text-[10px] truncate max-w-[160px]">
                              {campaignState.callPhoneNumber || "None"}
                            </span>
                          )}
                        </div>

                        {/* Optional Param 10: Device Targeting */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                          <span className="text-slate-500">Device Targeting:</span>
                          <div className="flex items-center gap-1 text-[10px]">
                            {["computers", "mobile", "tablets", "tv"].map((dev) => {
                              const active = (campaignState.devices as any)?.[dev] !== false;
                              return (
                                <button
                                  key={dev}
                                  type="button"
                                  onClick={() => {
                                    setCampaignState(prev => {
                                      const currentDevs = prev.devices || { computers: true, mobile: true, tablets: true, tv: true };
                                      return {
                                        ...prev,
                                        devices: { ...currentDevs, [dev]: !active }
                                      };
                                    });
                                  }}
                                  className={`px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                                    active
                                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                                      : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                                  }`}
                                  title={`Toggle ${dev}`}
                                >
                                  {dev === "computers" ? "Desktop" : dev === "mobile" ? "Mobile" : dev === "tablets" ? "Tablet" : "TV"}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Optional Param 11: Value Rules (Conversion Value Adjustments) */}
                        <div className="py-1 border-b border-slate-200/70 flex items-center justify-between">
                          <span className="text-slate-500">Value Rules:</span>
                          <select
                            value={(campaignState.valueRules as any)?.type || "NONE"}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCampaignState(prev => ({
                                ...prev,
                                valueRules: val === "NONE" ? undefined : {
                                  type: val,
                                  operation: "MULTIPLY",
                                  value: 1.2
                                }
                              }));
                            }}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none max-w-[160px]"
                          >
                            <option value="NONE">None</option>
                            <option value="AUDIENCE">Adjust by Audience (1.2x)</option>
                            <option value="DEVICE">Adjust by Device (1.2x)</option>
                            <option value="GEO">Adjust by Location (1.2x)</option>
                          </select>
                        </div>

                        {/* Optional Param 12: Merchant Center & Feeds (PMax / Shopping) */}
                        {(campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.campaignType === "SHOPPING") && (
                          <div className="py-1 border-b border-slate-200/70 flex items-center justify-between group">
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
                              <div className="flex items-center gap-1 flex-1 max-w-[220px] justify-end">
                                <input
                                  type="text"
                                  value={tempEditValues.merchantCenterId || ""}
                                  onChange={(e) => setTempEditValues({ ...tempEditValues, merchantCenterId: e.target.value })}
                                  onKeyDown={handleKeyDownSave}
                                  placeholder="e.g. 5840531233"
                                  className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-[11px] text-slate-900 focus:outline-none"
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
                              <span className="text-slate-800 font-medium font-mono text-[10px] truncate max-w-[160px]">
                                {campaignState.merchantCenterId || "None"}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Optional Param 13: 3rd-Party Measurement */}
                        <div className="py-1 flex items-center justify-between">
                          <span className="text-slate-500">3rd-Party Measurement:</span>
                          <select
                            value={(campaignState.thirdPartyMeasurement as any)?.vendor || "NONE"}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCampaignState(prev => ({
                                ...prev,
                                thirdPartyMeasurement: v === "NONE" ? undefined : { vendor: v }
                              }));
                            }}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-none max-w-[160px]"
                          >
                            <option value="NONE">None</option>
                            <option value="ADLOOX">Adloox</option>
                            <option value="DOUBLE_VERIFY">DoubleVerify</option>
                            <option value="INTEGRAL_AD_SCIENCE">Integral Ad Science (IAS)</option>
                            <option value="MOAT">Moat by Oracle</option>
                          </select>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Guidance Banner when Objective or Campaign Type is not selected yet */}
            {!Boolean(campaignState.objective && campaignState.campaignType) && (
              <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-blue-50/80 border border-indigo-200/80 rounded-2xl p-5 text-center space-y-2.5 shadow-2xs animate-in fade-in duration-200">
                <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 shadow-2xs mx-auto flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Select Objective & Campaign Type</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Set your Campaign Objective and Type in the Strategy card above or chat with the AI Assistant. Creative assets, targeting parameters, and ad copy will display automatically once selected.
                  </p>
                </div>
              </div>
            )}

            {/* 2. SEARCH ONLY: AI MAX SETTINGS CARD */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "SEARCH" && (
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
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "DEMAND_GEN" && (
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

            {/* 2b-Display. DISPLAY CAMPAIGN CONTROLS: BRANDING, OPTIMIZATIONS & CREATIVE SETTINGS CARD */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "DISPLAY" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Display Campaign Controls</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Display Config
                  </span>
                </div>

                <div className="space-y-3 text-[11px]">
                  {/* Call To Action Selector */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Call to action:</span>
                    <select
                      value={campaignState.callToAction || "Automated"}
                      onChange={(e) => setCampaignState(prev => ({ ...prev, callToAction: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-semibold text-slate-800 focus:outline-none"
                    >
                      {["Automated", "Shop Now", "Learn More", "Sign Up", "Contact Us", "Apply Now", "Book Now", "Download", "Get Quote", "Visit Site"].map((cta) => (
                        <option key={cta} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Guidelines: Colors & View-Through */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Custom Colors & Conversion Tracking:</span>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(campaignState.includeViewThrough)}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, includeViewThrough: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <span>View-Through Conversions</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Main Brand Color:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={campaignState.mainBrandColor || "#1A73E8"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, mainBrandColor: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={campaignState.mainBrandColor || "#1A73E8"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, mainBrandColor: e.target.value }))}
                            placeholder="#1A73E8"
                            className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Accent Color:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={campaignState.accentBrandColor || "#34A853"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, accentBrandColor: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={campaignState.accentBrandColor || "#34A853"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, accentBrandColor: e.target.value }))}
                            placeholder="#34A853"
                            className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Display Smart Optimizations */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <span className="font-semibold text-slate-800 block">Responsive Display Optimizations:</span>
                    <div className="space-y-1.5 text-[10px]">
                      <label className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={campaignState.useAssetEnhancements !== false}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, useAssetEnhancements: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <div>
                          <span className="font-semibold block">Asset Enhancements</span>
                          <span className="text-slate-400 text-[9px]">Google AI visually optimizes images and colors for different screen sizes</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={campaignState.useAutoGeneratedVideo !== false}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, useAutoGeneratedVideo: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <div>
                          <span className="font-semibold block">Auto-Generated Videos</span>
                          <span className="text-slate-400 text-[9px]">Create animated video variations from your marketing images and copy</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={campaignState.useNativeFormats !== false}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, useNativeFormats: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <div>
                          <span className="font-semibold block">Native Formats</span>
                          <span className="text-slate-400 text-[9px]">Render ads blending natively into publisher content layouts</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(campaignState.useDynamicFeed)}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, useDynamicFeed: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <div>
                          <span className="font-semibold block">Dynamic Feed (Remarketing)</span>
                          <span className="text-slate-400 text-[9px]">Bind product/service feed for personalized dynamic remarketing</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2b-Video. VIDEO CAMPAIGN CONTROLS: AD FORMAT, BRANDING & CREATIVE ENHANCEMENTS CARD */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "VIDEO" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-red-600" />
                    <span className="font-bold text-xs text-slate-900">Video Campaign Controls</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    Video Config
                  </span>
                </div>

                <div className="space-y-3 text-[11px]">
                  {/* Ad Format Selector */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Ad Format:</span>
                      <span className="text-[10px] text-red-700 font-bold uppercase">
                        {(campaignState.adFormat || "VIDEO").replace("_", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["VIDEO", "SINGLE_IMAGE", "CAROUSEL"] as const).map((fmt) => {
                        const isSelected = (campaignState.adFormat || "VIDEO") === fmt;
                        const label = fmt === "VIDEO" ? "Video (YouTube)" : fmt === "SINGLE_IMAGE" ? "Single Image" : "Carousel";
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => {
                                const nextState = { ...prev, adFormat: fmt };
                                const vFormat = fmt;
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
                                  if (vFormat === "VIDEO") {
                                    isReady = Boolean(hasVideos && hasLogo && hasHeadlines && hasLongHeadlines && hasDescriptions);
                                  } else if (vFormat === "CAROUSEL") {
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
                                ? "bg-red-600 text-white border-red-600 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Call To Action Selector */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Call to action:</span>
                    <select
                      value={campaignState.callToAction || "Automated"}
                      onChange={(e) => setCampaignState(prev => ({ ...prev, callToAction: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-semibold text-slate-800 focus:outline-none"
                    >
                      {["Automated", "Watch Now", "Shop Now", "Learn More", "Sign Up", "Contact Us", "Apply Now", "Book Now", "Download", "Get Quote"].map((cta) => (
                        <option key={cta} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Guidelines: Colors & Font */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Brand Identity & Overlays:</span>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(campaignState.includeViewThrough)}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, includeViewThrough: e.target.checked }))}
                          className="rounded text-red-600 focus:ring-red-500 h-3 w-3"
                        />
                        <span>View-Through Conversions</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Main Brand Color:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={campaignState.mainBrandColor || "#1A73E8"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, mainBrandColor: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={campaignState.mainBrandColor || "#1A73E8"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, mainBrandColor: e.target.value }))}
                            placeholder="#1A73E8"
                            className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Accent Color:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={campaignState.accentBrandColor || "#EA4335"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, accentBrandColor: e.target.value }))}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={campaignState.accentBrandColor || "#EA4335"}
                            onChange={(e) => setCampaignState(prev => ({ ...prev, accentBrandColor: e.target.value }))}
                            placeholder="#EA4335"
                            className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google AI Creative Enhancements */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Google AI Creative Enhancements:</span>
                      <span className="text-[9px] font-mono text-slate-400">All 6 Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {[
                        { key: "optAdaptiveLayouts", label: "Adaptive Layouts" },
                        { key: "optAnimatedImages", label: "Animated Images" },
                        { key: "optGeneratedVideos", label: "Generated Videos" },
                        { key: "optShorterVideos", label: "Shorter Videos (6s)" },
                        { key: "optResizedVideos", label: "Resized Videos (9:16)" },
                        { key: "optLandingPagePreviews", label: "Page Previews" }
                      ].map((enh) => {
                        const isChecked = campaignState[enh.key] !== false;
                        return (
                          <label key={enh.key} className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => setCampaignState(prev => ({ ...prev, [enh.key]: e.target.checked }))}
                              className="rounded text-red-600 focus:ring-red-500 h-3 w-3"
                            />
                            <span className="truncate">{enh.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Channel Targeting: ALL vs CHOOSE */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Placements & Inventory:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCampaignState(prev => ({ ...prev, channelTargeting: "ALL" }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            (campaignState.channelTargeting || "ALL") === "ALL"
                              ? "bg-red-600 text-white"
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
                              "YouTube Shorts", "YouTube in-feed", "YouTube in-stream", "Discover", "Gmail"
                            ]
                          }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            campaignState.channelTargeting === "CHOOSE"
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          CHOOSE
                        </button>
                      </div>
                    </div>

                    {campaignState.channelTargeting === "CHOOSE" && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Selected Video Inventory:</span>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          {[
                            "YouTube in-stream",
                            "YouTube in-feed",
                            "YouTube Shorts",
                            "Discover",
                            "Gmail",
                            "Google Display Network"
                          ].map((ch) => {
                            const curChannels = campaignState.channels || ["YouTube Shorts", "YouTube in-feed", "YouTube in-stream"];
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
                                  className="rounded text-red-600 focus:ring-red-500 h-3 w-3"
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

            {/* 2b-2. PERFORMANCE MAX CONTROLS: MORE CAMPAIGN SETTINGS */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "PERFORMANCE_MAX" && (
              <div className="bg-slate-50 border border-purple-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-xs text-slate-900">Performance Max Controls</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    PMax Controls
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* More Campaign Settings Collapsible Section */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowPMaxMoreSettings(!showPMaxMoreSettings)}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-purple-50/60 border border-purple-200 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-1.5">
                        <Settings2 className="h-3.5 w-3.5 text-purple-600" />
                        <span className="font-semibold text-slate-800 group-hover:text-purple-700">More campaign settings</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded font-mono">
                          Schedule • URL Options • Devices • Demographic Exclusions
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 text-purple-400 transition-transform ${showPMaxMoreSettings ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {showPMaxMoreSettings && (
                      <div className="mt-2 space-y-2 pt-1 animate-in fade-in duration-150">
                        {/* 1. Ad Schedule (Duplicate Prevention) */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-slate-800 font-semibold">
                              <Clock className="h-3 w-3 text-purple-600" />
                              <span>Ad Schedule</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {(campaignState.adSchedule || []).length || 1} schedule(s)
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {(campaignState.adSchedule && campaignState.adSchedule.length > 0 ? campaignState.adSchedule : [{ day: "All days", start: "00:00", end: "00:00" }]).map((sched, idx) => (
                              <div key={idx} className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[10px]">
                                <select
                                  value={sched.day}
                                  onChange={(e) => {
                                    const currentList = campaignState.adSchedule && campaignState.adSchedule.length > 0 ? [...campaignState.adSchedule] : [{ day: "All days", start: "00:00", end: "00:00" }];
                                    const updatedSched = { ...currentList[idx], day: e.target.value };
                                    const isDup = currentList.some((s, i) => i !== idx && s.day === updatedSched.day && s.start === updatedSched.start && s.end === updatedSched.end);
                                    if (isDup) {
                                      alert("This ad schedule already exists. Duplicate schedules are not saved.");
                                      return;
                                    }
                                    currentList[idx] = updatedSched;
                                    setCampaignState(prev => ({ ...prev, adSchedule: currentList }));
                                  }}
                                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-800 font-medium focus:outline-none"
                                >
                                  {pmaxDayOptions.map((d, i) => (
                                    <option key={i} value={d}>{d}</option>
                                  ))}
                                </select>

                                <select
                                  value={sched.start}
                                  onChange={(e) => {
                                    const currentList = campaignState.adSchedule && campaignState.adSchedule.length > 0 ? [...campaignState.adSchedule] : [{ day: "All days", start: "00:00", end: "00:00" }];
                                    const updatedSched = { ...currentList[idx], start: e.target.value };
                                    const isDup = currentList.some((s, i) => i !== idx && s.day === updatedSched.day && s.start === updatedSched.start && s.end === updatedSched.end);
                                    if (isDup) {
                                      alert("This ad schedule already exists. Duplicate schedules are not saved.");
                                      return;
                                    }
                                    currentList[idx] = updatedSched;
                                    setCampaignState(prev => ({ ...prev, adSchedule: currentList }));
                                  }}
                                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-800 font-mono focus:outline-none"
                                >
                                  {pmaxTimeOptions.map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                  ))}
                                </select>

                                <span className="text-slate-400">to</span>

                                <select
                                  value={sched.end}
                                  onChange={(e) => {
                                    const currentList = campaignState.adSchedule && campaignState.adSchedule.length > 0 ? [...campaignState.adSchedule] : [{ day: "All days", start: "00:00", end: "00:00" }];
                                    const updatedSched = { ...currentList[idx], end: e.target.value };
                                    const isDup = currentList.some((s, i) => i !== idx && s.day === updatedSched.day && s.start === updatedSched.start && s.end === updatedSched.end);
                                    if (isDup) {
                                      alert("This ad schedule already exists. Duplicate schedules are not saved.");
                                      return;
                                    }
                                    currentList[idx] = updatedSched;
                                    setCampaignState(prev => ({ ...prev, adSchedule: currentList }));
                                  }}
                                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-800 font-mono focus:outline-none"
                                >
                                  {pmaxTimeOptions.map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                  ))}
                                </select>

                                {(campaignState.adSchedule || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentList = [...(campaignState.adSchedule || [])];
                                      currentList.splice(idx, 1);
                                      setCampaignState(prev => ({ ...prev, adSchedule: currentList }));
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 ml-auto cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const currentList = campaignState.adSchedule && campaignState.adSchedule.length > 0 ? [...campaignState.adSchedule] : [{ day: "All days", start: "00:00", end: "00:00" }];
                                const defaultRow = { day: "Monday", start: "09:00", end: "18:00" };
                                const isDup = currentList.some(s => s.day === defaultRow.day && s.start === defaultRow.start && s.end === defaultRow.end);
                                if (isDup) {
                                  // Pick the first available day that isn't already scheduled
                                  const availableDay = pmaxDayOptions.find(d => !currentList.some(s => s.day === d && s.start === "09:00" && s.end === "18:00")) || "All days";
                                  setCampaignState(prev => ({ ...prev, adSchedule: [...currentList, { day: availableDay, start: "09:00", end: "18:00" }] }));
                                } else {
                                  setCampaignState(prev => ({ ...prev, adSchedule: [...currentList, defaultRow] }));
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-purple-700 hover:text-purple-900 font-semibold cursor-pointer pt-0.5"
                            >
                              <Plus className="h-3 w-3" /> Add schedule row
                            </button>
                          </div>
                        </div>

                        {/* 2. Campaign URL Options */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                          <div className="flex items-center gap-1 text-slate-800 font-semibold">
                            <Globe className="h-3 w-3 text-purple-600" />
                            <span>Campaign URL Options & Custom Parameters</span>
                          </div>

                          <div className="space-y-1.5">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Tracking Template:</span>
                              <input
                                type="text"
                                value={campaignState.trackingTemplate || ""}
                                onChange={(e) => setCampaignState(prev => ({ ...prev, trackingTemplate: e.target.value }))}
                                placeholder="{lpurl}?utm_source=google&utm_medium=cpc"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-mono text-slate-800 focus:outline-none focus:bg-white"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block">Final URL Suffix:</span>
                              <input
                                type="text"
                                value={campaignState.finalUrlSuffix || ""}
                                onChange={(e) => setCampaignState(prev => ({ ...prev, finalUrlSuffix: e.target.value }))}
                                placeholder="src=google_pmax&campaign_id=123"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-mono text-slate-800 focus:outline-none focus:bg-white"
                              />
                            </div>

                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] text-slate-400 block">Custom Parameters:</span>
                              {(campaignState.customParameters || []).map((cp, cpIdx) => (
                                <div key={cpIdx} className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono text-slate-400">{`{_`}</span>
                                  <input
                                    type="text"
                                    value={cp.name}
                                    placeholder="param"
                                    onChange={(e) => {
                                      const cur = [...(campaignState.customParameters || [])];
                                      cur[cpIdx] = { ...cur[cpIdx], name: e.target.value };
                                      setCampaignState(prev => ({ ...prev, customParameters: cur }));
                                    }}
                                    className="w-24 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800 focus:outline-none"
                                  />
                                  <span className="text-[10px] font-mono text-slate-400">{`} =`}</span>
                                  <input
                                    type="text"
                                    value={cp.value}
                                    placeholder="value"
                                    onChange={(e) => {
                                      const cur = [...(campaignState.customParameters || [])];
                                      cur[cpIdx] = { ...cur[cpIdx], value: e.target.value };
                                      setCampaignState(prev => ({ ...prev, customParameters: cur }));
                                    }}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-800 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const cur = (campaignState.customParameters || []).filter((_, i) => i !== cpIdx);
                                      setCampaignState(prev => ({ ...prev, customParameters: cur }));
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignState(prev => ({
                                    ...prev,
                                    customParameters: [...(prev.customParameters || []), { id: Date.now().toString(), name: "", value: "" }]
                                  }));
                                }}
                                className="inline-flex items-center gap-1 text-[10px] text-purple-700 hover:text-purple-900 font-semibold cursor-pointer pt-0.5"
                              >
                                <Plus className="h-3 w-3" /> Add URL parameter
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 3. Devices */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-slate-800 font-semibold">
                              <Monitor className="h-3 w-3 text-purple-600" />
                              <span>Devices</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400">Choose the devices where your Performance Max ads can appear:</p>
                          <div className="grid grid-cols-2 gap-1 pt-0.5">
                            {[
                              { key: "computers" as const, label: "Computers" },
                              { key: "mobile" as const, label: "Mobile phones" },
                              { key: "tablets" as const, label: "Tablets" },
                              { key: "tv" as const, label: "TV screens" }
                            ].map((d) => {
                              const curDevices = campaignState.devices || { computers: true, mobile: true, tablets: true, tv: true };
                              const isChecked = curDevices[d.key] !== false;
                              return (
                                <label key={d.key} className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      setCampaignState(prev => ({
                                        ...prev,
                                        devices: {
                                          ...(prev.devices || { computers: true, mobile: true, tablets: true, tv: true }),
                                          [d.key]: e.target.checked
                                        }
                                      }));
                                    }}
                                    className="rounded text-purple-600 focus:ring-purple-500 h-3 w-3"
                                  />
                                  <span>{d.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* 4. Demographic Exclusions */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                          <span className="font-semibold text-slate-800 block">Demographic Exclusions:</span>
                          
                          {/* Age Exclusions */}
                          <div className="space-y-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pmaxAgeExclusionsEnabled}
                                onChange={(e) => setPmaxAgeExclusionsEnabled(e.target.checked)}
                                className="rounded text-purple-600 h-3 w-3"
                              />
                              <span className="text-[10px] font-medium text-slate-700">Turn on age exclusions</span>
                            </label>
                            {pmaxAgeExclusionsEnabled && (
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-1 text-[10px]">
                                {["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"].map((age) => {
                                  const curExcluded = campaignState.demographicExclusions?.ages !== undefined
                                    ? campaignState.demographicExclusions.ages
                                    : ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
                                  const isExcluded = curExcluded.includes(age);
                                  return (
                                    <label key={age} className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isExcluded}
                                        onChange={(e) => {
                                          const nextAges = e.target.checked
                                            ? [...curExcluded, age]
                                            : curExcluded.filter(a => a !== age);
                                          setCampaignState(prev => ({
                                            ...prev,
                                            demographicExclusions: {
                                              ...(prev.demographicExclusions || {}),
                                              ages: nextAges
                                            }
                                          }));
                                        }}
                                        className="rounded text-rose-600 h-3 w-3"
                                      />
                                      <span>{age}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Gender Exclusions */}
                          <div className="space-y-1 pt-1 border-t border-slate-100">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pmaxGenderExclusionsEnabled}
                                onChange={(e) => setPmaxGenderExclusionsEnabled(e.target.checked)}
                                className="rounded text-purple-600 h-3 w-3"
                              />
                              <span className="text-[10px] font-medium text-slate-700">Turn on gender exclusions</span>
                            </label>
                            {pmaxGenderExclusionsEnabled && (
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex gap-4 text-[10px]">
                                {["Female", "Male", "Unknown"].map((gender) => {
                                  const curExcluded = campaignState.demographicExclusions?.genders !== undefined
                                    ? campaignState.demographicExclusions.genders
                                    : ["Female", "Male"];
                                  const isExcluded = curExcluded.includes(gender);
                                  return (
                                    <label key={gender} className="flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isExcluded}
                                        onChange={(e) => {
                                          const nextGenders = e.target.checked
                                            ? [...curExcluded, gender]
                                            : curExcluded.filter(g => g !== gender);
                                          setCampaignState(prev => ({
                                            ...prev,
                                            demographicExclusions: {
                                              ...(prev.demographicExclusions || {}),
                                              genders: nextGenders
                                            }
                                          }));
                                        }}
                                        className="rounded text-rose-600 h-3 w-3"
                                      />
                                      <span>{gender}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* 2c. DEDICATED SHOPPING SETTINGS & READINESS CARD (When CampaignType = SHOPPING) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "SHOPPING" && (
              <div className="bg-slate-50 border border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">Google Shopping Controls & Merchant Center</span>
                  </div>
                  <span className={campaignState.readyForPublish ? "text-[10px] text-emerald-600 font-bold" : "text-[10px] text-amber-600 font-semibold"}>
                    {campaignState.readyForPublish ? "Publish Ready ✓" : "Required items missing"}
                  </span>
                </div>

                <div className="space-y-2.5 text-[11px]">
                  {/* Merchant Center ID */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Merchant Center ID:</span>
                      <button
                        type="button"
                        onClick={() => (editingField === "merchantCenterId" ? cancelFieldEdit() : startFieldEdit("merchantCenterId"))}
                        className="p-0.5 text-slate-400 hover:text-amber-600 rounded transition-colors cursor-pointer"
                        title="Edit Merchant Center ID"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                    {editingField === "merchantCenterId" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempEditValues.merchantCenterId || ""}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, merchantCenterId: e.target.value })}
                          onKeyDown={handleKeyDownSave}
                          placeholder="e.g. 5840531233"
                          className="w-full bg-white border border-amber-500 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 focus:outline-none"
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
                            <AlertCircle className="h-3 w-3" /> Numeric ID Required
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Feed / Sales Country & Feed Label */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Sales Country:</span>
                      <input
                        type="text"
                        value={campaignState.salesCountry || "IN"}
                        onChange={(e) => setCampaignState(prev => ({ ...prev, salesCountry: e.target.value.toUpperCase() }))}
                        placeholder="IN"
                        maxLength={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Feed Label:</span>
                      <input
                        type="text"
                        value={campaignState.feedLabel || campaignState.salesCountry || "IN"}
                        onChange={(e) => setCampaignState(prev => ({ ...prev, feedLabel: e.target.value.toUpperCase() }))}
                        placeholder="IN"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Campaign Priority Tier */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Campaign Priority:</span>
                      <span className="text-[10px] text-amber-700 font-bold uppercase">
                        {campaignState.campaignPriority || "LOW"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(["LOW", "MEDIUM", "HIGH"] as const).map((prio) => {
                        const isSelected = (campaignState.campaignPriority || "LOW") === prio;
                        return (
                          <button
                            key={prio}
                            type="button"
                            onClick={() => setCampaignState(prev => ({ ...prev, campaignPriority: prio }))}
                            className={`py-1 px-1.5 rounded-lg border text-center font-semibold text-[10px] transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {prio === "LOW" ? "Low (Default)" : prio === "MEDIUM" ? "Medium" : "High"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product Groups & Local Inventory */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">Inventory & Products:</span>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(campaignState.localProducts)}
                          onChange={(e) => setCampaignState(prev => ({ ...prev, localProducts: e.target.checked }))}
                          className="rounded text-amber-600 focus:ring-amber-500 h-3 w-3"
                        />
                        <span>Local Products (In-Store)</span>
                      </label>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Product Partition:</span>
                      <select
                        value={campaignState.productGroupFilter || "Use all products"}
                        onChange={(e) => setCampaignState(prev => ({ ...prev, productGroupFilter: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-semibold text-slate-800 focus:outline-none"
                      >
                        <option value="Use all products">All products (Default)</option>
                        <option value="Category">Filter by Category</option>
                        <option value="Brand">Filter by Brand</option>
                        <option value="Custom Label">Filter by Custom Label</option>
                      </select>
                    </div>
                  </div>

                  {/* Ad Group CPC Bid (when Manual CPC is selected) */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Default Ad Group Bid:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-mono text-[10px]">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={campaignState.adGroupBid || "10"}
                        onChange={(e) => setCampaignState(prev => ({ ...prev, adGroupBid: e.target.value }))}
                        placeholder="10"
                        className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Missing Merchant ID alert */}
                {!campaignState.merchantCenterId && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>A numeric Google Merchant Center Account ID is required before this Shopping campaign can be published.</span>
                  </div>
                )}
              </div>
            )}

            {/* 2d. DEDICATED APP PROMOTION SETTINGS & READINESS CARD (When CampaignType = APP) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "APP" && (
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
                          onKeyDown={handleKeyDownSave}
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

            {/* 3. DYNAMIC CAMPAIGN ASSETS & THUMBNAILS CARD (PMax, Search Image/Logo Assets & Media) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType !== "SHOPPING" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Campaign Creatives & Assets</span>
                    {campaignState.campaignType === "SEARCH" && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                        Optional for Search (Boosts CTR)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const hasHeadlines = (campaignState.headlines || []).length >= 3;
                      const hasDescriptions = (campaignState.descriptions || []).length >= 2;
                      const hasImages = (campaignState.images || []).length > 0;
                      const isFullyFilled = hasHeadlines && hasDescriptions && hasImages;

                      return (
                        <button
                          type="button"
                          onClick={() => handleCockpitDirectAiGeneration("ALL", isFullyFilled)}
                          className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                            isFullyFilled
                              ? "bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700"
                              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          }`}
                          title={isFullyFilled ? "Re-generate & replace current AI assets with fresh creative variations" : "Auto-Generate all campaign assets while preserving your existing filled details"}
                        >
                          {isFullyFilled ? (
                            <>
                              <RefreshCw className="h-2.5 w-2.5" />
                              <span>🔄 Re-Generate AI Assets</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>✨ Generate All</span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() => setUploadGuidelineModal("IMAGE")}
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-0.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100"
                      title="View Guidelines & Specifications"
                    >
                      <Info className="h-3 w-3 text-slate-400" />
                      Rules
                    </button>
                  </div>
                </div>
                {/* Live Cockpit Direct AI Generation Animation Banner */}
                {cockpitGeneratingTarget && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-purple-300 animate-in fade-in zoom-in-95 duration-200 text-xs shadow-md space-y-2.5 relative overflow-hidden">
                    {/* Animated Shimmer Bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                    <div className="flex items-center gap-2.5 relative z-10">
                      <div className="w-8 h-8 rounded-xl bg-white border border-purple-200 shadow-sm p-0.5 flex items-center justify-center shrink-0 ring-2 ring-purple-500/20">
                        <img src="/icon.jpeg" alt="JDS" className="w-full h-full object-contain rounded-lg animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-spin" />
                            <span>
                              {cockpitGeneratingTarget === "ALL"
                                ? "Auto-Generating All Campaign Assets..."
                                : cockpitGeneratingTarget === "IMAGE"
                                ? "AI Synthesizing Landscape & Square Creatives..."
                                : cockpitGeneratingTarget === "LOGO"
                                ? "AI Designing Brand Identity Logo..."
                                : cockpitGeneratingTarget === "HEADLINES"
                                ? "AI Formulating High-CTR Headlines..."
                                : cockpitGeneratingTarget === "LONG_HEADLINES"
                                ? "AI Crafting Compelling Long Headlines..."
                                : cockpitGeneratingTarget === "KEYWORDS" || cockpitGeneratingTarget === "KEYWORD_SINGLE"
                                ? "AI Mining High-Intent Search Keywords..."
                                : "AI Generating Engaging Descriptions..."}
                            </span>
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          Studying website & business data to optimize Google Ads compliance
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full animate-[progress_1.2s_ease-in-out_infinite]" style={{ width: "80%" }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-purple-700 font-mono">
                        <span>Grok AI Engine active</span>
                        <span className="animate-pulse">Populating Cockpit fields...</span>
                      </div>
                    </div>
                  </div>
                )}



                {/* Live Search Ad Requirements Checklist when type is SEARCH */}
                {(campaignState.campaignType as string) === "SEARCH" && (
                  <div className="p-2.5 rounded-xl bg-white border border-sky-200 shadow-2xs space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-sky-700">
                        <Search className="h-3 w-3 text-sky-600" />
                        Search Responsive Ad Readiness
                      </span>
                      <span className={Boolean(
                        (campaignState.headlines?.length || 0) >= 3 &&
                        (campaignState.descriptions?.length || 0) >= 2 &&
                        (campaignState.website || campaignState.websiteVisitsUrl || campaignState.finalUrl) &&
                        (campaignState.dailyBudget && campaignState.dailyBudget >= 416)
                      ) ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                        {Boolean(
                          (campaignState.headlines?.length || 0) >= 3 &&
                          (campaignState.descriptions?.length || 0) >= 2 &&
                          (campaignState.website || campaignState.websiteVisitsUrl || campaignState.finalUrl) &&
                          (campaignState.dailyBudget && campaignState.dailyBudget >= 416)
                        ) ? "Ready ✓" : "Required items missing"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Final URL:</span>
                        <span className={(campaignState.website || campaignState.websiteVisitsUrl || campaignState.finalUrl) ? "text-emerald-600 font-bold truncate max-w-[180px]" : "text-rose-500 font-medium"}>
                          {String(campaignState.website || campaignState.websiteVisitsUrl || campaignState.finalUrl || "Missing")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Headlines:</span>
                        <span className={(campaignState.headlines?.length || 0) >= 3 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.headlines?.length || 0}/3 (min 3, max 15)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Descriptions:</span>
                        <span className={(campaignState.descriptions?.length || 0) >= 2 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.descriptions?.length || 0}/2 (min 2, max 4)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Image Assets:</span>
                        <span className={(campaignState.images?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"}>
                          {(campaignState.images?.length || 0) > 0 ? `✓ ${(campaignState.images?.length || 0)} attached` : "Optional (+CTR)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Business Logo:</span>
                        <span className={(campaignState.logos?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"}>
                          {(campaignState.logos?.length || 0) > 0 ? `✓ ${(campaignState.logos?.length || 0)} attached` : "Optional"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Daily Budget (≥ ₹416):</span>
                        <span className={(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? `₹${campaignState.dailyBudget}/day ✓` : `₹${campaignState.dailyBudget || 0}/day (min ₹416)`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Performance Max Asset Requirements Checklist when type is PERFORMANCE_MAX */}
                {campaignState.campaignType === "PERFORMANCE_MAX" && (() => {
                  const allImgs = campaignState.images || [];
                  const allLgs = campaignState.logos || [];
                  let hasLand = false;
                  let hasSq = false;
                  let hasLg = allLgs.length > 0;

                    for (const im of allImgs) {
                      const raw = typeof im === "string" ? im : (im as any)?.url || (im as any)?.data || "";
                      const fType = typeof im === "object" ? (im as any)?.fieldType : null;
                      const ratio = typeof im === "object" ? (im as any)?.aspectRatio : null;
                      const name = (typeof im === "object" && (im as any)?.name) ? (im as any).name.toLowerCase() : "";
                      const dims = typeof im === "object" ? (im as any)?.dimensions : null;

                      const isSquareDetected = fType === "SQUARE_MARKETING_IMAGE" ||
                        ratio === "1:1" ||
                        name.includes("1x1") ||
                        name.includes("1:1") ||
                        name.includes("square") ||
                        (dims && Math.abs(dims.width - dims.height) <= 20);

                      const isLandscapeDetected = fType === "MARKETING_IMAGE" ||
                        ratio === "1.91:1" ||
                        name.includes("1.91x1") ||
                        name.includes("1.91:1") ||
                        name.includes("landscape") ||
                        (dims && dims.width >= dims.height * 1.3);

                      if (isSquareDetected) hasSq = true;
                      if (isLandscapeDetected) hasLand = true;
                      if (fType === "LOGO") hasLg = true;
                      else if (typeof raw === "string" && (raw.includes("ik.imagekit.io") || raw.startsWith("data:image/") || raw.startsWith("http"))) {
                        if (!hasLand && !hasSq) {
                          hasLand = true;
                          hasSq = true;
                        } else if (!hasLand) {
                          hasLand = true;
                        } else if (!hasSq) {
                          hasSq = true;
                        }
                      }
                    }

                    if (allImgs.length >= 2 && (!hasLand || !hasSq)) {
                      hasLand = true;
                      hasSq = true;
                    } else if (allImgs.length === 1 && !hasLand && !hasSq) {
                      hasLand = true;
                      hasSq = true;
                    }

                    const isPMaxReady = checkIsCampaignReady(campaignState);

                  return (
                    <div className="p-2.5 rounded-xl bg-white border border-purple-200/80 shadow-2xs space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1 text-purple-700">
                          <Sparkles className="h-3 w-3" />
                          Performance Max Asset Readiness
                        </span>
                        <span className={isPMaxReady ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                          {isPMaxReady ? "Ready to Publish ✓" : "Required items missing"}
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
                            {campaignState.headlines?.length || 0} (min 3, max 15)
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Long Headlines:</span>
                          <span className={(campaignState.longHeadlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.longHeadlines?.length || 0} (min 1, max 5)
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Descriptions:</span>
                          <span className={(campaignState.descriptions?.length || 0) >= 2 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {campaignState.descriptions?.length || 0} (min 2, max 5)
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Search Themes (Signals):</span>
                          <span className={(campaignState.searchThemes?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-medium"}>
                            {(campaignState.searchThemes?.length || 0) > 0 ? `${campaignState.searchThemes?.length} added` : "0 added"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>Sitelinks (Extensions):</span>
                          <span className={(campaignState.sitelinks?.length || 0) >= 4 ? "text-emerald-600 font-bold" : (campaignState.sitelinks?.length || 0) > 0 ? "text-amber-600 font-medium" : "text-slate-400"}>
                            {(campaignState.sitelinks?.length || 0) > 0 ? `${campaignState.sitelinks?.length} added (4 rec.)` : "0 added (4 rec.)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Display Asset Requirements Checklist when type is DISPLAY */}
                {campaignState.campaignType === "DISPLAY" && (
                  <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-2 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800 border-b border-blue-100 pb-1.5">
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Display Responsive Ad Readiness</span>
                      </span>
                      <span className={campaignState.readyForPublish ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                        {campaignState.readyForPublish ? "Complete ✓" : "Required items missing"}
                      </span>
                    </div>

                    {/* Image Guidelines (Google Ads Display Best Practices) */}
                    <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg space-y-1 text-slate-700">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <span>Image Guidelines (Display Ad Creative Specs)</span>
                        <a
                          href="https://support.google.com/google-ads/answer/9823397"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-600 hover:text-blue-800 underline flex items-center gap-0.5"
                        >
                          <span>Best Practices Guide</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-0.5 text-[9px]">
                        <div className="bg-white/80 p-1 rounded border border-blue-100">
                          <span className="font-bold text-slate-900 block">Landscape (1.91:1)</span>
                          <span className="text-slate-500 block">Rec: 1200 x 628</span>
                          <span className="text-slate-400 block">Min: 600 x 314</span>
                        </div>
                        <div className="bg-white/80 p-1 rounded border border-blue-100">
                          <span className="font-bold text-slate-900 block">Square (1:1)</span>
                          <span className="text-slate-500 block">Rec: 1200 x 1200</span>
                          <span className="text-slate-400 block">Min: 300 x 300</span>
                        </div>
                        <div className="bg-white/80 p-1 rounded border border-blue-100">
                          <span className="font-bold text-slate-900 block">Portrait (9:16)</span>
                          <span className="text-slate-500 block">Rec: 900 x 1600</span>
                          <span className="text-slate-400 block">Min: 600 x 1067</span>
                        </div>
                      </div>
                      <p className="text-[8.5px] text-slate-500 italic pt-0.5">
                        * Maximum file size: 5120 KB (5 MB). Selected images are auto-cropped to specification and can be edited anytime.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Marketing Images (1.91:1 & 1:1):</span>
                        <span className={(campaignState.images?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.images?.length || 0) > 0 ? `✓ ${campaignState.images?.length} Uploaded` : "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Logo (1:1 Square):</span>
                        <span className={(campaignState.logos?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.logos?.length || 0) > 0 ? "✓ Uploaded" : "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Headlines:</span>
                        <span className={(campaignState.headlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.headlines?.length || 0} (min 1, max 5)
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
                          {campaignState.descriptions?.length || 0} (min 1, max 5)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Daily Budget (≥ ₹416):</span>
                        <span className={(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? `₹${campaignState.dailyBudget}/day ✓` : `₹${campaignState.dailyBudget || 0}/day (min ₹416)`}
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
                          {campaignState.headlines?.length || 0} (min 1, max 5)
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
                            {campaignState.descriptions?.length || 0} (min 1, max 5)
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Daily Budget (≥ ₹416):</span>
                        <span className={(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? `₹${campaignState.dailyBudget}/day ✓` : `₹${campaignState.dailyBudget || 0}/day (min ₹416)`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Demand Gen Asset Requirements Checklist when type is DEMAND_GEN */}
                {campaignState.campaignType === "DEMAND_GEN" && (
                  <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-indigo-700">
                        <Sparkles className="h-3 w-3 text-indigo-600" />
                        Demand Gen Readiness ({(campaignState.adFormat || "SINGLE_IMAGE").replace("_", " ")})
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
                            {(campaignState.images?.length || 0) > 0 ? "✓ Uploaded" : "Missing"}
                          </span>
                        </div>
                      )}
                      {(campaignState.adFormat || "SINGLE_IMAGE") === "VIDEO" && (
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                          <span>YouTube Video:</span>
                          <span className={(campaignState.videos?.length || 0) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                            {(campaignState.videos?.length || 0) > 0 ? "✓ Uploaded" : "Missing"}
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
                          {campaignState.headlines?.length || 0} (min 1, max 5)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Descriptions:</span>
                        <span className={(campaignState.descriptions?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.descriptions?.length || 0} (min 1, max 5)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Daily Budget (≥ ₹416):</span>
                        <span className={(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? `₹${campaignState.dailyBudget}/day ✓` : `₹${campaignState.dailyBudget || 0}/day (min ₹416)`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Live App Promotion Asset Requirements Checklist when type is APP */}
                {campaignState.campaignType === "APP" && (
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Smartphone className="h-3 w-3 text-emerald-600" />
                        App Promotion Readiness ({campaignState.platform === "IOS" ? "Apple App Store" : "Google Play"})
                      </span>
                      <span className={Boolean(
                        campaignState.appId?.trim() &&
                        (campaignState.targetCpa && Number(campaignState.targetCpa) > 0) &&
                        (campaignState.headlines?.length || 0) >= 1 &&
                        (campaignState.descriptions?.length || 0) >= 1 &&
                        (campaignState.dailyBudget && campaignState.dailyBudget >= 416)
                      ) ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                        {Boolean(
                          campaignState.appId?.trim() &&
                          (campaignState.targetCpa && Number(campaignState.targetCpa) > 0) &&
                          (campaignState.headlines?.length || 0) >= 1 &&
                          (campaignState.descriptions?.length || 0) >= 1 &&
                          (campaignState.dailyBudget && campaignState.dailyBudget >= 416)
                        ) ? "Complete ✓" : "Required items missing"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>App Package ID / Store ID:</span>
                        <span className={campaignState.appId?.trim() ? "text-emerald-600 font-bold font-mono truncate max-w-[160px]" : "text-rose-500 font-medium"}>
                          {campaignState.appId?.trim() || "Missing"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Headlines:</span>
                        <span className={(campaignState.headlines?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.headlines?.length || 0} (min 1, max 5)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Descriptions:</span>
                        <span className={(campaignState.descriptions?.length || 0) >= 1 ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {campaignState.descriptions?.length || 0} (min 1, max 5)
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Target CPA (&gt; ₹0):</span>
                        <span className={(campaignState.targetCpa && Number(campaignState.targetCpa) > 0) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.targetCpa && Number(campaignState.targetCpa) > 0) ? `₹${campaignState.targetCpa} ✓` : "Missing / ≤0"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Daily Budget (≥ ₹416):</span>
                        <span className={(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? `₹${campaignState.dailyBudget}/day ✓` : `₹${campaignState.dailyBudget || 0}/day (min ₹416)`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Live Standard Shopping Requirements Checklist when type is SHOPPING */}
                {(campaignState.campaignType as string) === "SHOPPING" && (
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1 text-amber-700">
                        <ShoppingBag className="h-3 w-3 text-amber-600" />
                        Standard Shopping Readiness
                      </span>
                      <span className={Boolean(
                        (campaignState.merchantCenterId || (campaignState as any).merchantId) &&
                        (campaignState.dailyBudget && campaignState.dailyBudget >= 416)
                      ) ? "text-emerald-600 font-bold" : "text-amber-600 font-semibold"}>
                        {Boolean(
                          (campaignState.merchantCenterId || (campaignState as any).merchantId) &&
                          (campaignState.dailyBudget && campaignState.dailyBudget >= 416)
                        ) ? "Ready ✓" : "Required items missing"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-600">
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Merchant Center ID:</span>
                        <span className={(campaignState.merchantCenterId || (campaignState as any).merchantId) ? "text-emerald-600 font-bold font-mono" : "text-rose-500 font-medium"}>
                          {(campaignState.merchantCenterId || (campaignState as any).merchantId) ? `✓ ${campaignState.merchantCenterId || (campaignState as any).merchantId}` : "Missing (Numeric ID required)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Target Country:</span>
                        <span className="text-slate-700 font-semibold">
                          {(campaignState as any).salesCountry || "IN (India)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                        <span>Priority Tier:</span>
                        <span className="text-slate-700 font-semibold uppercase">
                          {(campaignState as any).campaignPriority || "LOW"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 col-span-2">
                        <span>Daily Budget (≥ ₹416):</span>
                        <span className={(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? "text-emerald-600 font-bold" : "text-rose-500 font-medium"}>
                          {(campaignState.dailyBudget && campaignState.dailyBudget >= 416) ? `₹${campaignState.dailyBudget}/day ✓` : `₹${campaignState.dailyBudget || 0}/day (min ₹416)`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {allAssetsCount === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3.5 text-center space-y-2.5 bg-white/50">
                    <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">No media attached yet</p>
                      <p className="text-[10px] text-slate-400">Upload or generate landscape (1.91:1), square (1:1), or logo</p>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openMediaSourcePicker("IMAGE")}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openMediaSourcePicker("LOGO")}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openMediaSourcePicker("VIDEO")}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Video</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCockpitDirectAiGeneration("IMAGE")}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Wand2 className="h-2.5 w-2.5" />
                          <span>AI Generate Images</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCockpitDirectAiGeneration("LOGO")}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>AI Generate Logo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Media Actions Quick Bar */}
                    <div className="space-y-1.5 pb-2 border-b border-slate-200">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        {/* Manual / Library Upload Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openMediaSourcePicker("IMAGE")}
                            className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[9px] border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>+ Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openMediaSourcePicker("LOGO")}
                            className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[9px] border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>+ Logo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openMediaSourcePicker("VIDEO")}
                            className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[9px] border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>+ Video</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              fetchPastMediaLibrary();
                              setIsPastMediaModalOpen(true);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[9px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
                            title="Open past uploads and generated files library"
                          >
                            <History className="h-2.5 w-2.5 text-slate-500" />
                            <span>Past Files</span>
                          </button>
                          {/* Clear All Visual Assets Button */}
                          {(campaignState.images && campaignState.images.length > 0 || campaignState.logos && campaignState.logos.length > 0) && (
                            <button
                              type="button"
                              onClick={() => {
                                setCampaignState(prev => {
                                  const updated = { ...prev, images: [], logos: [] };
                                  if (typeof window !== "undefined") {
                                    try { localStorage.setItem("gads_ai_campaign_draft", JSON.stringify(updated)); } catch (e) {}
                                  }
                                  return updated;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[9px] transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                              title="Delete all images and logos"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              <span>Clear All</span>
                            </button>
                          )}
                        </div>

                        {/* AI Generation Quick Triggers */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCockpitDirectAiGeneration("IMAGE")}
                            className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[9px] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="AI Generate additional marketing images"
                          >
                            <Wand2 className="h-2.5 w-2.5" />
                            <span>AI Generate Images</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCockpitDirectAiGeneration("LOGO")}
                            className="px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-[9px] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="AI Generate new logo"
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>AI Generate Logo</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Images Preview Grid */}
                    {campaignState.images && campaignState.images.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Marketing Images ({campaignState.images.length}):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => {
                                const updated = { ...prev, images: [] };
                                if (typeof window !== "undefined") {
                                  try { localStorage.setItem("gads_ai_campaign_draft", JSON.stringify(updated)); } catch (e) {}
                                }
                                return updated;
                              });
                            }}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-all flex items-center gap-0.5 cursor-pointer"
                            title="Delete all marketing images"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                            <span>Delete All Images</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {campaignState.images.map((img, idx) => {
                            const url = typeof img === "string" ? img : img?.url || "";
                            const name = typeof img === "object" ? img?.name : `Image ${idx + 1}`;
                            const isSquare = typeof img === "object" && ((img as any)?.aspectRatio === "1:1" || (img as any)?.fieldType === "SQUARE_MARKETING_IMAGE");
                            return (
                              <div key={idx} className={`relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 ${isSquare ? "aspect-square" : "aspect-video"} flex items-center justify-center`}>
                                {url ? (
                                  <img src={url} alt={name || "Creative"} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-slate-400" />
                                )}
                                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditExistingAsset("IMAGE", idx);
                                    }}
                                    className="p-1 rounded-md bg-black/70 hover:bg-blue-600 text-white transition-all cursor-pointer"
                                    title="Edit / Crop image"
                                  >
                                    <Crop className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCampaignState(prev => ({
                                        ...prev,
                                        images: (prev.images || []).filter((_, i) => i !== idx)
                                      }));
                                    }}
                                    className="p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-all cursor-pointer"
                                    title="Remove image"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 pointer-events-none">
                                  <span className="text-[9px] text-white truncate font-medium">{name}</span>
                                </div>
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-mono pointer-events-none">
                                  {typeof img === "object" && (img as any)?.aspectRatio
                                    ? (img as any).aspectRatio
                                    : (typeof img === "object" && (img as any)?.fieldType === "SQUARE_MARKETING_IMAGE")
                                      ? "1:1"
                                      : "1.91:1"}
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
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Logos ({campaignState.logos.length}):
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => {
                                const updated = { ...prev, logos: [] };
                                if (typeof window !== "undefined") {
                                  try { localStorage.setItem("gads_ai_campaign_draft", JSON.stringify(updated)); } catch (e) {}
                                }
                                return updated;
                              });
                            }}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-all flex items-center gap-0.5 cursor-pointer"
                            title="Delete all logos"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                            <span>Delete All Logos</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {campaignState.logos.map((logo, idx) => {
                            const url = typeof logo === "string" ? logo : logo?.url || "";
                            return (
                              <div key={idx} className="relative group w-14 h-14 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden">
                                {url ? <img src={url} alt="Logo" className="max-w-full max-h-full object-contain" /> : <ImageIcon className="h-3 w-3 text-slate-400" />}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditExistingAsset("LOGO", idx);
                                    }}
                                    className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                                    title="Edit / Crop logo"
                                  >
                                    <Crop className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCampaignState(prev => ({
                                        ...prev,
                                        logos: (prev.logos || []).filter((_, i) => i !== idx)
                                      }));
                                    }}
                                    className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                                    title="Remove logo"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                <span className="absolute bottom-0.5 right-0.5 bg-blue-600 text-white text-[7px] font-bold px-1 rounded pointer-events-none">1:1</span>
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
                        {campaignState.videos.map((vid, vIdx) => (
                          <div key={vIdx} className="flex items-center justify-between text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-1.5 truncate">
                              <Video className="h-4 w-4 text-red-500 shrink-0" />
                              <span className="truncate">
                                {typeof vid === "string" ? vid : vid?.name || "Attached video asset"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCampaignState(prev => ({
                                  ...prev,
                                  videos: (prev.videos || []).filter((_, i) => i !== vIdx)
                                }));
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Remove video"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. SEARCH KEYWORDS MANAGER (Dedicated Card for Search Campaigns) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "SEARCH" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Search Keywords</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      (campaignState.keywords?.length || 0) >= 1
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {campaignState.keywords?.length || 0} Keywords (Min 1)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCockpitDirectAiGeneration("KEYWORDS")}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-all shadow-2xs group"
                      title="Generate high-intent search keywords using Grok AI"
                    >
                      <Sparkles className="h-3 w-3 text-purple-600 group-hover:rotate-12 transition-transform" />
                      <span>✨ Generate with Grok AI</span>
                    </button>
                  </div>
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
                    <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                      <p className="text-[11px] text-slate-500">No keywords configured yet. Enter a keyword above or use Grok AI to automatically generate a targeted keyword list.</p>
                      <button
                        type="button"
                        onClick={() => handleCockpitDirectAiGeneration("KEYWORDS")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                        <span>✨ Generate Keywords with Grok AI</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4a. MERCHANT CENTER & PRODUCT FEED CONDITIONAL SETUP (Performance Max / Sales) */}
            {Boolean(campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.objective === "SALES") && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">Google Merchant Center & Products</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    (campaignState.merchantCenterId || (campaignState as any).merchantId)
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : hasMerchantCenterAccount === false
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {(campaignState.merchantCenterId || (campaignState as any).merchantId) ? "Connected ✓" : hasMerchantCenterAccount === false ? "Skipped (No Feed)" : "Setup Needed"}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                  <p className="text-[11px] font-semibold text-slate-800">
                    Do you have a Google Merchant Center account for your store products?
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Linking Merchant Center allows Performance Max to advertise your products directly across Google Shopping, Search, YouTube, and Maps.
                  </p>

                  {/* Yes / No Quick Radio Selection */}
                  <div className="flex items-center gap-3 pt-1">
                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      hasMerchantCenterAccount === true || Boolean(campaignState.merchantCenterId || (campaignState as any).merchantId)
                        ? "bg-amber-50 border-amber-400 text-amber-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="merchantAccountRadio"
                        checked={hasMerchantCenterAccount === true || Boolean(campaignState.merchantCenterId || (campaignState as any).merchantId)}
                        onChange={() => {
                          setHasMerchantCenterAccount(true);
                        }}
                        className="text-amber-600"
                      />
                      <span>Yes, I have Merchant Center</span>
                    </label>

                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      hasMerchantCenterAccount === false && !Boolean(campaignState.merchantCenterId || (campaignState as any).merchantId)
                        ? "bg-slate-100 border-slate-400 text-slate-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                    }`}>
                      <input
                        type="radio"
                        name="merchantAccountRadio"
                        checked={hasMerchantCenterAccount === false && !Boolean(campaignState.merchantCenterId || (campaignState as any).merchantId)}
                        onChange={() => {
                          setHasMerchantCenterAccount(false);
                          setCampaignState(prev => ({
                            ...prev,
                            merchantCenterId: undefined,
                            merchantId: undefined
                          }));
                        }}
                        className="text-slate-600"
                      />
                      <span>No, advertise without Merchant Center</span>
                    </label>
                  </div>

                  {/* Merchant Center ID Input Field when Yes */}
                  {(hasMerchantCenterAccount === true || Boolean(campaignState.merchantCenterId || (campaignState as any).merchantId)) && (
                    <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Merchant Center Account ID (Numeric, e.g. 5840531233):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={campaignState.merchantCenterId || (campaignState as any).merchantId || ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setCampaignState(prev => ({
                                ...prev,
                                merchantCenterId: val,
                                merchantId: val
                              }));
                            }}
                            placeholder="Enter 10-digit Merchant Center ID"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendMessage("Suggest product feed information and how to optimize my Google Merchant Center products for Performance Max")}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                            title="AI Consult on Merchant Feed"
                          >
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            <span>Feed Tips</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                        <div>
                          <span>Feed Label: </span>
                          <span className="font-semibold text-slate-700">{campaignState.feedLabel || "IN"}</span>
                        </div>
                        <div>
                          <span>Target Country: </span>
                          <span className="font-semibold text-slate-700">{campaignState.salesCountry || "India (IN)"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4b. PERFORMANCE MAX SEARCH THEMES MANAGER (Dedicated Card for Performance Max Asset Group Signals) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType === "PERFORMANCE_MAX" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-xs text-slate-900">Search Themes (Signals)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      (campaignState.searchThemes?.length || 0) >= 1
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {campaignState.searchThemes?.length || 0} Themes (Max 25)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Suggest 8 high-converting search themes for my Performance Max campaign based on my target audience and products")}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-all shadow-2xs group"
                      title="Generate high-intent search themes using Grok AI"
                    >
                      <Sparkles className="h-3 w-3 text-purple-600 group-hover:rotate-12 transition-transform" />
                      <span>✨ Suggest Themes with AI</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Search themes tell Google AI what your customers are searching for across Search, YouTube, Gmail & Maps. (Up to 25 search themes).
                </p>

                <div className="space-y-2">
                  {/* Search Theme Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      let theme = (newSearchThemeInput || "").trim();
                      if (!theme) return;
                      if (theme.length > 80) {
                        theme = theme.slice(0, 80);
                      }
                      if ((campaignState.searchThemes || []).length >= 25) {
                        return;
                      }
                      if (!(campaignState.searchThemes || []).some(t => t.toLowerCase() === theme.toLowerCase())) {
                        setCampaignState(prev => ({
                          ...prev,
                          searchThemes: [...(prev.searchThemes || []), theme]
                        }));
                      }
                      setNewSearchThemeInput("");
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      type="text"
                      maxLength={80}
                      value={newSearchThemeInput}
                      onChange={(e) => setNewSearchThemeInput(e.target.value)}
                      placeholder='Add search theme, e.g. "affordable running shoes"'
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="submit"
                      disabled={!newSearchThemeInput.trim()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Search Themes Chips List */}
                  {campaignState.searchThemes && campaignState.searchThemes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl">
                      {campaignState.searchThemes.map((theme, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg border text-[10px] font-medium flex items-center gap-1.5 shadow-2xs bg-purple-50 text-purple-700 border-purple-200"
                        >
                          <Target className="h-2.5 w-2.5 text-purple-600 opacity-70" />
                          <span>{theme}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => ({
                                ...prev,
                                searchThemes: (prev.searchThemes || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                            title="Remove Search Theme"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                      <p className="text-[11px] text-slate-500">No search themes added yet. Search themes guide Performance Max machine learning towards high-intent queries.</p>
                      <button
                        type="button"
                        onClick={() => handleSendMessage("Suggest 8 high-converting search themes for my Performance Max campaign based on my target audience and products")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                        <span>✨ Suggest Search Themes with AI</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4c. SITELINKS MANAGER (Ad Extensions for Performance Max & Search Campaigns) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && (campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.campaignType === "SEARCH") && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">Sitelinks (Ad Extensions)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      (campaignState.sitelinks?.length || 0) >= 4
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : (campaignState.sitelinks?.length || 0) > 0
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {campaignState.sitelinks?.length || 0} Sitelinks {(campaignState.sitelinks?.length || 0) >= 4 ? "✓" : "(4 Rec.)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Suggest 4 high-converting sitelinks for my campaign with titles, description lines 1 & 2, and relevant landing page URLs")}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-all shadow-2xs group"
                      title="Generate sitelinks using Grok AI"
                    >
                      <Sparkles className="h-3 w-3 text-purple-600 group-hover:rotate-12 transition-transform" />
                      <span>✨ Suggest with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSitelinkIndex(null);
                        setSitelinkText("");
                        setSitelinkDesc1("");
                        setSitelinkDesc2("");
                        setSitelinkUrl(campaignState.website || "");
                        setSitelinkMobileUrl("");
                        setUseSitelinkMobileUrl(false);
                        setSitelinkTracking("");
                        setSitelinkSuffix("");
                        setSitelinkCustomParams([]);
                        setSitelinkSchedules([]);
                        setShowSitelinkUrlOptions(false);
                        setShowSitelinkAdvancedOptions(false);
                        setIsSitelinkModalOpen(true);
                      }}
                      className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all shadow-2xs"
                      title="Create a new sitelink extension"
                    >
                      <Plus className="h-3 w-3 text-indigo-600" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Draw more attention and conversions by taking users directly to specific pages (e.g. Products, About Us, Contact, Deals). Google recommends at least 4 sitelinks.
                </p>

                {/* Sitelinks List */}
                {campaignState.sitelinks && campaignState.sitelinks.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {campaignState.sitelinks.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-800 shadow-2xs group hover:border-indigo-300 transition-colors flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-indigo-600 text-xs truncate">
                              {st.text}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {st.text.length}/25
                            </span>
                          </div>
                          {(st.desc1 || st.desc2) && (
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {[st.desc1, st.desc2].filter(Boolean).join(" • ")}
                            </p>
                          )}
                          <p className="text-[9px] text-slate-400 font-mono truncate">
                            {st.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSitelinkIndex(idx);
                              setSitelinkText(st.text || "");
                              setSitelinkDesc1(st.desc1 || "");
                              setSitelinkDesc2(st.desc2 || "");
                              setSitelinkUrl(st.url || "");
                              setSitelinkMobileUrl((st as any).mobileUrl || "");
                              setUseSitelinkMobileUrl(Boolean((st as any).mobileUrl));
                              setSitelinkTracking((st as any).tracking || "");
                              setSitelinkSuffix((st as any).suffix || "");
                              setSitelinkCustomParams((st as any).customParams || []);
                              setSitelinkSchedules((st as any).schedules || []);
                              setShowSitelinkUrlOptions(Boolean((st as any).mobileUrl || (st as any).tracking || (st as any).suffix || ((st as any).customParams && (st as any).customParams.length > 0)));
                              setShowSitelinkAdvancedOptions(Boolean((st as any).schedules && (st as any).schedules.length > 0));
                              setIsSitelinkModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title="Edit sitelink"
                          >
                            <FileText className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => ({
                                ...prev,
                                sitelinks: (prev.sitelinks || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove sitelink"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <p className="text-[11px] text-slate-500">No sitelinks configured yet. Adding 4 or more sitelinks improves ad real estate and performance.</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendMessage("Suggest 4 high-converting sitelinks for my campaign with titles, description lines 1 & 2, and relevant landing page URLs")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                        <span>✨ Suggest Sitelinks with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSitelinkIndex(null);
                          setSitelinkText("");
                          setSitelinkDesc1("");
                          setSitelinkDesc2("");
                          setSitelinkUrl(campaignState.website || "");
                          setSitelinkMobileUrl("");
                          setUseSitelinkMobileUrl(false);
                          setSitelinkTracking("");
                          setSitelinkSuffix("");
                          setSitelinkCustomParams([]);
                          setSitelinkSchedules([]);
                          setShowSitelinkUrlOptions(false);
                          setShowSitelinkAdvancedOptions(false);
                          setIsSitelinkModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Plus className="h-3.5 w-3.5 text-slate-600" />
                        <span>Create Manually</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4d. MORE ASSET TYPES MANAGER (Promotions, Prices, Messages, Structured Snippets, Lead Forms, Callouts) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && (campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.campaignType === "SEARCH") && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">More Asset Types</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendMessage("Suggest high-converting callouts, structured snippets, and promotion assets for my campaign")}
                    className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200 transition-all shadow-2xs"
                    title="Suggest more asset types using AI"
                  >
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span>✨ AI Suggest Assets</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Improve ad performance and make your ad more interactive by adding promotions, prices, messages, structured snippets, lead forms, and callouts.
                </p>

                {/* 6 Modal Trigger Buttons Matching Manual Flow */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveAssetModal("PROMOTIONS")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      (campaignState.promotions?.length || 0) > 0
                        ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span>+ Promotions</span>
                    {(campaignState.promotions?.length || 0) > 0 && (
                      <span className="bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                        {campaignState.promotions?.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAssetModal("PRICES")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      (campaignState.prices?.length || 0) > 0
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span>+ Prices</span>
                    {(campaignState.prices?.length || 0) > 0 && (
                      <span className="bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                        {campaignState.prices?.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAssetModal("APPS")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      (campaignState.messages?.length || 0) > 0
                        ? "bg-sky-50 border-sky-300 text-sky-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span>+ Messages</span>
                    {(campaignState.messages?.length || 0) > 0 && (
                      <span className="bg-sky-200 text-sky-900 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                        {campaignState.messages?.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAssetModal("SNIPPETS")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      (campaignState.structuredSnippets?.length || 0) > 0
                        ? "bg-purple-50 border-purple-300 text-purple-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span>+ Structured snippets</span>
                    {(campaignState.structuredSnippets?.length || 0) > 0 && (
                      <span className="bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                        {campaignState.structuredSnippets?.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAssetModal("LEAD_FORMS")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      (campaignState.leadForms?.length || 0) > 0
                        ? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span>+ Lead forms</span>
                    {(campaignState.leadForms?.length || 0) > 0 && (
                      <span className="bg-rose-200 text-rose-900 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                        {campaignState.leadForms?.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAssetModal("BRAND_GUIDELINES")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      (campaignState.callouts?.length || 0) > 0
                        ? "bg-teal-50 border-teal-300 text-teal-900 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span>+ Callouts</span>
                    {(campaignState.callouts?.length || 0) > 0 && (
                      <span className="bg-teal-200 text-teal-900 font-bold px-1.5 py-0.2 rounded-full text-[9px]">
                        {campaignState.callouts?.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Quick Display Badges of Configured Extension Assets */}
                {((campaignState.callouts?.length || 0) > 0 || (campaignState.structuredSnippets?.length || 0) > 0 || (campaignState.promotions?.length || 0) > 0) && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    {/* Callouts list */}
                    {(campaignState.callouts?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">Callouts:</span>
                        {campaignState.callouts?.map((co, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] flex items-center gap-1 font-medium">
                            <span>{co}</span>
                            <button
                              type="button"
                              onClick={() => setCampaignState(p => ({ ...p, callouts: (p.callouts || []).filter((_, i) => i !== idx) }))}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Snippets list */}
                    {(campaignState.structuredSnippets?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">Snippets:</span>
                        {campaignState.structuredSnippets?.map((sn, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] flex items-center gap-1 font-medium">
                            <span><strong>{sn.header}:</strong> {sn.values.join(", ")}</span>
                            <button
                              type="button"
                              onClick={() => setCampaignState(p => ({ ...p, structuredSnippets: (p.structuredSnippets || []).filter((_, i) => i !== idx) }))}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Promotions list */}
                    {(campaignState.promotions?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">Deals:</span>
                        {campaignState.promotions?.map((pr, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] flex items-center gap-1 font-medium">
                            <span>{pr.promotionTarget} ({pr.percentOff ? `${pr.percentOff}% off` : pr.moneyAmountOff ? `₹${pr.moneyAmountOff} off` : "Discount"})</span>
                            <button
                              type="button"
                              onClick={() => setCampaignState(p => ({ ...p, promotions: (p.promotions || []).filter((_, i) => i !== idx) }))}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. GENERATED AD COPY CARD (Headlines, Long Headlines & Descriptions with Vertical Scrollbar & Add Buttons) */}
            {Boolean(campaignState.objective && campaignState.campaignType) && campaignState.campaignType !== "SHOPPING" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Ad Copy & Creatives</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {campaignState.headlines?.length || 0} HL • {campaignState.longHeadlines?.length || 0} Long HL • {campaignState.descriptions?.length || 0} Desc
                </span>
              </div>

              {/* Text Generation Live Shimmer Indicator */}
              {(cockpitGeneratingTarget === "ALL" || cockpitGeneratingTarget === "HEADLINES" || cockpitGeneratingTarget === "LONG_HEADLINES" || cockpitGeneratingTarget === "DESCRIPTIONS") && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 text-[11px] text-purple-900 shadow-2xs flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-spin" />
                    <span className="font-semibold">
                      AI is formulating compliant copy & character limits...
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                    <span className="text-[9px] font-mono text-purple-600 font-bold">Auto-Injecting</span>
                  </div>
                </div>
              )}

              {/* 1. HEADLINES SECTION */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Headlines (Max 30 chars):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${
                      (campaignState.headlines?.length || 0) >= 3 ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {campaignState.headlines?.length || 0} (min 3, max 15)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCockpitDirectAiGeneration("HEADLINES")}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-all shadow-2xs group"
                      title="AI Generate Headlines (max 30 chars each)"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-purple-600 group-hover:rotate-12 transition-transform" />
                      <span>Generate Headlines</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingHeadline(!isAddingHeadline);
                        setNewHeadlineInput("");
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                      title="Add headline"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Headline Input Bar */}
                {isAddingHeadline && (
                  <div className="p-2 bg-white rounded-xl border border-blue-300 shadow-2xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={30}
                        value={newHeadlineInput}
                        onChange={(e) => setNewHeadlineInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newHeadlineInput.trim()) {
                            e.preventDefault();
                            const val = newHeadlineInput.trim();
                            if ((campaignState.headlines || []).some(h => h.trim().toLowerCase() === val.toLowerCase())) {
                              return;
                            }
                            setCampaignState(prev => ({
                              ...prev,
                              headlines: [...(prev.headlines || []), val]
                            }));
                            setIsHeadlinesAiSourced(false);
                            setNewHeadlineInput("");
                            setIsAddingHeadline(false);
                          }
                        }}
                        placeholder="Enter headline (e.g. Premium Deals)..."
                        className={`flex-1 border rounded-lg px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${
                          (campaignState.headlines || []).some(h => h.trim().toLowerCase() === newHeadlineInput.trim().toLowerCase() && newHeadlineInput.trim() !== "")
                            ? "bg-rose-50/50 border-rose-500 focus:border-rose-600 text-rose-900"
                            : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white"
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={!newHeadlineInput.trim() || (campaignState.headlines || []).some(h => h.trim().toLowerCase() === newHeadlineInput.trim().toLowerCase())}
                        onClick={() => {
                          if (!newHeadlineInput.trim()) return;
                          const val = newHeadlineInput.trim();
                          if ((campaignState.headlines || []).some(h => h.trim().toLowerCase() === val.toLowerCase())) {
                            return;
                          }
                          setCampaignState(prev => ({
                            ...prev,
                            headlines: [...(prev.headlines || []), val]
                          }));
                          setIsHeadlinesAiSourced(false);
                          setNewHeadlineInput("");
                          setIsAddingHeadline(false);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const hint = newHeadlineInput.trim();
                          setIsAddingHeadline(false);
                          setNewHeadlineInput("");
                          handleCockpitDirectAiGeneration("HEADLINE_SINGLE", false, hint || undefined);
                        }}
                        className="px-2.5 py-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-xs rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-purple-400/50 group relative overflow-hidden"
                        title="Auto-generate 1 headline with Grok AI"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <BrainCircuit className="h-3.5 w-3.5 text-cyan-300 animate-pulse group-hover:rotate-180 transition-transform duration-500" />
                        <span className="tracking-wide text-[11px]">AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingHeadline(false);
                          setNewHeadlineInput("");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {(campaignState.headlines || []).some(h => h.trim().toLowerCase() === newHeadlineInput.trim().toLowerCase() && newHeadlineInput.trim() !== "") && (
                      <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 pl-1">
                        <AlertCircle className="h-2.5 w-2.5 shrink-0" /> Headline already exists. Each headline must be different.
                      </p>
                    )}
                    <div className="flex justify-between items-center px-1 text-[9px] text-slate-400 font-mono">
                      <span>Press Enter to save</span>
                      <span className={newHeadlineInput.length > 30 ? "text-rose-600 font-bold" : ""}>
                        {newHeadlineInput.length}/30 chars
                      </span>
                    </div>
                  </div>
                )}

                {/* Vertical Scrollbar Container for ALL Headlines */}
                {campaignState.headlines && campaignState.headlines.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {campaignState.headlines.map((hl, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 shadow-2xs flex justify-between items-center group hover:border-blue-300 transition-colors">
                        <span className="truncate flex-1 mr-2 text-slate-800">{hl}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-mono ${hl.length > 30 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                            {hl.length}/30
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => ({
                                ...prev,
                                headlines: (prev.headlines || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                            title="Remove headline"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded-lg border border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                    No headlines. Click "+ Add" to create.
                  </div>
                )}
              </div>

              {/* 2. LONG HEADLINES SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Long Headlines (Max 90 chars):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-600">
                      {campaignState.longHeadlines?.length || 0} (min 1, max 5)
                    </span>
                    {(campaignState.campaignType === "PERFORMANCE_MAX" || campaignState.campaignType === "DISPLAY" || campaignState.campaignType === "DEMAND_GEN" || !campaignState.campaignType) && (
                      <button
                        type="button"
                        onClick={() => handleCockpitDirectAiGeneration("LONG_HEADLINES")}
                        className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-all shadow-2xs group"
                        title="AI Generate Long Headlines (max 90 chars each)"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-purple-600 group-hover:rotate-12 transition-transform" />
                        <span>Generate Long Headlines</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingLongHeadline(!isAddingLongHeadline);
                        setNewLongHeadlineInput("");
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                      title="Add long headline"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Long Headline Input Bar */}
                {isAddingLongHeadline && (
                  <div className="p-2 bg-white rounded-xl border border-blue-300 shadow-2xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={90}
                        value={newLongHeadlineInput}
                        onChange={(e) => setNewLongHeadlineInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newLongHeadlineInput.trim()) {
                            e.preventDefault();
                            const val = newLongHeadlineInput.trim();
                            if ((campaignState.longHeadlines || []).some(lh => lh.trim().toLowerCase() === val.toLowerCase())) {
                              return;
                            }
                            setCampaignState(prev => ({
                              ...prev,
                              longHeadlines: [...(prev.longHeadlines || []), val]
                            }));
                            setIsLongHeadlinesAiSourced(false);
                            setNewLongHeadlineInput("");
                            setIsAddingLongHeadline(false);
                          }
                        }}
                        placeholder="Enter long headline..."
                        className={`flex-1 border rounded-lg px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${
                          (campaignState.longHeadlines || []).some(lh => lh.trim().toLowerCase() === newLongHeadlineInput.trim().toLowerCase() && newLongHeadlineInput.trim() !== "")
                            ? "bg-rose-50/50 border-rose-500 focus:border-rose-600 text-rose-900"
                            : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white"
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={!newLongHeadlineInput.trim() || (campaignState.longHeadlines || []).some(lh => lh.trim().toLowerCase() === newLongHeadlineInput.trim().toLowerCase())}
                        onClick={() => {
                          if (!newLongHeadlineInput.trim()) return;
                          const val = newLongHeadlineInput.trim();
                          if ((campaignState.longHeadlines || []).some(lh => lh.trim().toLowerCase() === val.toLowerCase())) {
                            return;
                          }
                          setCampaignState(prev => ({
                            ...prev,
                            longHeadlines: [...(prev.longHeadlines || []), val]
                          }));
                          setIsLongHeadlinesAiSourced(false);
                          setNewLongHeadlineInput("");
                          setIsAddingLongHeadline(false);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const hint = newLongHeadlineInput.trim();
                          setIsAddingLongHeadline(false);
                          setNewLongHeadlineInput("");
                          handleCockpitDirectAiGeneration("LONG_HEADLINE_SINGLE", false, hint || undefined);
                        }}
                        className="px-2.5 py-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-xs rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-purple-400/50 group relative overflow-hidden"
                        title="Auto-generate 1 long headline with Grok AI"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <BrainCircuit className="h-3.5 w-3.5 text-cyan-300 animate-pulse group-hover:rotate-180 transition-transform duration-500" />
                        <span className="tracking-wide text-[11px]">AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingLongHeadline(false);
                          setNewLongHeadlineInput("");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {(campaignState.longHeadlines || []).some(lh => lh.trim().toLowerCase() === newLongHeadlineInput.trim().toLowerCase() && newLongHeadlineInput.trim() !== "") && (
                      <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 pl-1">
                        <AlertCircle className="h-2.5 w-2.5 shrink-0" /> Long headline already exists. Each long headline must be different.
                      </p>
                    )}
                    <div className="flex justify-between items-center px-1 text-[9px] text-slate-400 font-mono">
                      <span>Press Enter to save</span>
                      <span className={newLongHeadlineInput.length > 90 ? "text-rose-600 font-bold" : ""}>
                        {newLongHeadlineInput.length}/90 chars
                      </span>
                    </div>
                  </div>
                )}

                {/* Vertical Scrollbar Container for ALL Long Headlines */}
                {campaignState.longHeadlines && campaignState.longHeadlines.length > 0 ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {campaignState.longHeadlines.map((lhl, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 shadow-2xs flex justify-between items-center group hover:border-blue-300 transition-colors">
                        <span className="truncate flex-1 mr-2 text-slate-800">{lhl}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-mono ${lhl.length > 90 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                            {lhl.length}/90
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCampaignState(prev => ({
                                ...prev,
                                longHeadlines: (prev.longHeadlines || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                            title="Remove long headline"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded-lg border border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                    No long headlines. Click "+ Add" to create.
                  </div>
                )}
              </div>

              {/* 3. DESCRIPTIONS SECTION */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Descriptions (Max 90 chars):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${
                      (campaignState.descriptions?.length || 0) >= 2 ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {campaignState.descriptions?.length || 0} (min 2, max 5)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCockpitDirectAiGeneration("DESCRIPTIONS")}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-all shadow-2xs group"
                      title="AI Generate Descriptions (max 90 chars each)"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-purple-600 group-hover:rotate-12 transition-transform" />
                      <span>Generate Descriptions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingDescription(!isAddingDescription);
                        setNewDescriptionInput("");
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                      title="Add description"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Description Input Bar */}
                {isAddingDescription && (
                  <div className="p-2 bg-white rounded-xl border border-blue-300 shadow-2xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={90}
                        value={newDescriptionInput}
                        onChange={(e) => setNewDescriptionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newDescriptionInput.trim()) {
                            e.preventDefault();
                            const val = newDescriptionInput.trim();
                            if ((campaignState.descriptions || []).some(d => d.trim().toLowerCase() === val.toLowerCase())) {
                              return;
                            }
                            setCampaignState(prev => ({
                              ...prev,
                              descriptions: [...(prev.descriptions || []), val]
                            }));
                            setIsDescriptionsAiSourced(false);
                            setNewDescriptionInput("");
                            setIsAddingDescription(false);
                          }
                        }}
                        placeholder="Enter description (e.g. Discover our best deals today)..."
                        className={`flex-1 border rounded-lg px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${
                          (campaignState.descriptions || []).some(d => d.trim().toLowerCase() === newDescriptionInput.trim().toLowerCase() && newDescriptionInput.trim() !== "")
                            ? "bg-rose-50/50 border-rose-500 focus:border-rose-600 text-rose-900"
                            : "bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white"
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={!newDescriptionInput.trim() || (campaignState.descriptions || []).some(d => d.trim().toLowerCase() === newDescriptionInput.trim().toLowerCase())}
                        onClick={() => {
                          if (!newDescriptionInput.trim()) return;
                          const val = newDescriptionInput.trim();
                          if ((campaignState.descriptions || []).some(d => d.trim().toLowerCase() === val.toLowerCase())) {
                            return;
                          }
                          setCampaignState(prev => ({
                            ...prev,
                            descriptions: [...(prev.descriptions || []), val]
                          }));
                          setIsDescriptionsAiSourced(false);
                          setNewDescriptionInput("");
                          setIsAddingDescription(false);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const hint = newDescriptionInput.trim();
                          setIsAddingDescription(false);
                          setNewDescriptionInput("");
                          handleCockpitDirectAiGeneration("DESCRIPTION_SINGLE", false, hint || undefined);
                        }}
                        className="px-2.5 py-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-xs rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-purple-400/50 group relative overflow-hidden"
                        title="Auto-generate 1 description with Grok AI"
                      >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        <BrainCircuit className="h-3.5 w-3.5 text-cyan-300 animate-pulse group-hover:rotate-180 transition-transform duration-500" />
                        <span className="tracking-wide text-[11px]">AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingDescription(false);
                          setNewDescriptionInput("");
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {(campaignState.descriptions || []).some(d => d.trim().toLowerCase() === newDescriptionInput.trim().toLowerCase() && newDescriptionInput.trim() !== "") && (
                      <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 pl-1">
                        <AlertCircle className="h-2.5 w-2.5 shrink-0" /> Description already exists. Each description must be different.
                      </p>
                    )}
                    <div className="flex justify-between items-center px-1 text-[9px] text-slate-400 font-mono">
                      <span>Press Enter to save</span>
                      <span className={newDescriptionInput.length > 90 ? "text-rose-600 font-bold" : ""}>
                        {newDescriptionInput.length}/90 chars
                      </span>
                    </div>
                  </div>
                )}

                {/* Vertical Scrollbar Container for ALL Descriptions */}
                {campaignState.descriptions && campaignState.descriptions.length > 0 ? (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                    {campaignState.descriptions.map((desc, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 shadow-2xs group hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-slate-800 flex-1">{desc}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-[9px] font-mono ${desc.length > 90 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                              {desc.length}/90
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCampaignState(prev => ({
                                  ...prev,
                                  descriptions: (prev.descriptions || []).filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                              title="Remove description"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded-lg border border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                    No descriptions yet. Click "+ Add" to create.
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Launch Action Footer inside Cockpit (Fixed / Sticky at bottom) */}
          {(() => {
            const isCurrentCampaignReady = checkIsCampaignReady(campaignState);

            return (
              <div className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Status:</span>
                  {isCurrentCampaignReady ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Ready to deploy</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMissingParamsModal(true)}
                      className="text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Click to view all missing required fields"
                    >
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                      <span>Required fields pending</span>
                      <ChevronRight className="h-3 w-3 text-amber-500" />
                    </button>
                  )}
                </div>

                {/* Edit Actions Grid */}
                {(() => {
                  const hasAssetParameters = Boolean(
                    (campaignState.headlines && campaignState.headlines.length > 0) ||
                    (campaignState.descriptions && campaignState.descriptions.length > 0) ||
                    (campaignState.longHeadlines && campaignState.longHeadlines.length > 0) ||
                    (campaignState.keywords && campaignState.keywords.length > 0) ||
                    (campaignState.images && campaignState.images.length > 0) ||
                    (campaignState.logos && campaignState.logos.length > 0) ||
                    (campaignState.videos && campaignState.videos.length > 0)
                  );

                  // Draft save is only available after user has selected Objective, Campaign Type, AND provided asset parameters
                  const isEligibleToSaveDraft = Boolean(
                    campaignState.objective &&
                    campaignState.campaignType &&
                    hasAssetParameters
                  );

                  return (
                    <div className={`grid ${isEligibleToSaveDraft ? "grid-cols-3" : "grid-cols-2"} gap-1.5`}>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingField) {
                            saveFieldEdit();
                          } else {
                            startFieldEdit("businessName");
                          }
                        }}
                        className={`px-2 py-2 text-[11px] font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          editingField
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
                            : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title={editingField ? "Save current inline edit" : "Edit fields inline"}
                      >
                        {editingField ? <Check className="h-3 w-3 text-emerald-600" /> : <Edit3 className="h-3 w-3" />}
                        <span className="truncate">{editingField ? "Done" : "Inline"}</span>
                      </button>

                      {isEligibleToSaveDraft && (
                        <button
                          type="button"
                          onClick={() => setIsSaveDraftConfirmOpen(true)}
                          disabled={isSavingDraft || (Boolean(loadedDraftId) && !hasLoadedDraftChanges())}
                          className={`px-2 py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs animate-in fade-in zoom-in-95 duration-150 ${
                            Boolean(loadedDraftId) && !hasLoadedDraftChanges()
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75"
                              : "text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                          }`}
                          title={
                            Boolean(loadedDraftId) && !hasLoadedDraftChanges()
                              ? "No changes made to the loaded draft yet"
                              : loadedDraftId
                              ? "Save changes to this draft or save as a new draft"
                              : "Save current progress as a draft to database"
                          }
                        >
                          {isSavingDraft ? (
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                          ) : (
                            <Save className={`h-3 w-3 ${Boolean(loadedDraftId) && !hasLoadedDraftChanges() ? "text-slate-400" : "text-emerald-600"}`} />
                          )}
                          <span className="truncate">{loadedDraftId ? (hasLoadedDraftChanges() ? "Save Changes" : "Draft Up-to-date") : "Save Draft"}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          fetchDraftCampaigns();
                          setIsDraftPickerModalOpen(true);
                        }}
                        className="px-2 py-2 text-[11px] font-semibold rounded-xl text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                        title="Load unpublished saved drafts from database"
                      >
                        <FolderOpen className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="truncate">Old Drafts</span>
                      </button>
                    </div>
                  );
                })()}

                <div>
                  <button
                    type="button"
                    onClick={handleCreateCampaign}
                    disabled={!isCurrentCampaignReady || isPublishing}
                    className={`w-full px-3 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrentCampaignReady
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                    title={isCurrentCampaignReady ? "Launch campaign to Google Ads" : "Complete required fields & assets to launch"}
                  >
                    {isPublishing ? <Loader2 className="h-3 w-3 animate-spin"/> : <Target className="h-3 w-3"/>}
                    <span className="truncate">Launch Campaign</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Hidden File Inputs for Marketing Image, Logo, and Video Uploads */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleMediaUpload(e, "IMAGE")}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />
      <input
        type="file"
        ref={logoInputRef}
        onChange={(e) => handleMediaUpload(e, "LOGO")}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={(e) => handleMediaUpload(e, "VIDEO")}
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
      />

      {/* ── Interactive Image Editor & Cropper Modal ── */}
      {isImageEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                  editorTargetType === "LOGO" ? "bg-purple-600 shadow-purple-500/20" : "bg-blue-600 shadow-blue-500/20"
                }`}>
                  <Crop className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {editorTargetType === "LOGO" ? "Logo Editor & Cropper" : "Marketing Image Editor & Cropper"}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold shrink-0">
                      {editorImageDimensions.width}x{editorImageDimensions.height}px
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Crop and align your asset to meet Google Ads specifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImageEditorOpen(false);
                  setEditorRuleViolationReason(null);
                }}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rule Notice Pill (If triggered due to dimension or aspect ratio mismatch) */}
            {editorRuleViolationReason && (
              <div className="mx-4 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 shadow-2xs">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950">Specification Adjustment Required:</span>
                  <span className="leading-snug">{editorRuleViolationReason}</span>
                </div>
              </div>
            )}

            {/* Modal Body / Visual Cropper Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
              {/* Ratio Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-blue-600" />
                  <span>Choose Google Ads Aspect Ratio:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {editorTargetType === "LOGO" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditorCropRatio("1:1")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          editorCropRatio === "1:1"
                            ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-xs border border-current" />
                        <span>Square (1:1)</span>
                        <span className="text-[9px] opacity-75 font-mono">1200x1200</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorCropRatio("4:1")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          editorCropRatio === "4:1"
                            ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        <span className="w-4 h-1.5 rounded-xs border border-current" />
                        <span>Landscape Logo (4:1)</span>
                        <span className="text-[9px] opacity-75 font-mono">1200x300</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditorCropRatio("1.91:1")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          editorCropRatio === "1.91:1"
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        <span className="w-3.5 h-2 rounded-xs border border-current" />
                        <span>Landscape (1.91:1)</span>
                        <span className="text-[9px] opacity-75 font-mono">1200x628</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorCropRatio("1:1")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          editorCropRatio === "1:1"
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-xs border border-current" />
                        <span>Square (1:1)</span>
                        <span className="text-[9px] opacity-75 font-mono">1200x1200</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorCropRatio("4:5")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          editorCropRatio === "4:5"
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        <span className="w-2 h-2.5 rounded-xs border border-current" />
                        <span>Portrait (4:5)</span>
                        <span className="text-[9px] opacity-75 font-mono">960x1200</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorCropRatio("9:16")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          editorCropRatio === "9:16"
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        <span className="w-1.5 h-3 rounded-xs border border-current" />
                        <span>Story / Tall (9:16)</span>
                        <span className="text-[9px] opacity-75 font-mono">1080x1920</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Interactive Visual Crop Preview Container */}
              <div className="relative rounded-2xl border border-slate-300 bg-slate-950/95 overflow-hidden flex items-center justify-center p-4 min-h-[260px] max-h-[340px]">
                {/* Crop Boundary Mask */}
                <div
                  className={`relative overflow-hidden border-2 border-white/90 shadow-2xl transition-all duration-200 bg-slate-900 ${
                    editorCropRatio === "1.91:1"
                      ? "aspect-[1200/628] w-full max-w-[480px]"
                      : editorCropRatio === "1:1"
                      ? "aspect-square w-56 sm:w-64"
                      : editorCropRatio === "4:5"
                      ? "aspect-[4/5] w-48 sm:w-56"
                      : editorCropRatio === "9:16"
                      ? "aspect-[9/16] w-36 sm:w-44"
                      : "aspect-[4/1] w-full max-w-[480px]"
                  }`}
                >
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-35 border border-white/30">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>

                  {/* Image with dynamic transform */}
                  {editorImageSrc && (
                    <img
                      src={editorImageSrc}
                      alt="Crop target"
                      className="w-full h-full object-cover transition-transform select-none"
                      style={{
                        transform: `scale(${editorZoom}) translate(${editorPanX * 20}%, ${editorPanY * 20}%)`,
                        transformOrigin: "center center"
                      }}
                    />
                  )}

                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono z-20 pointer-events-none">
                    {editorCropRatio}
                  </span>
                </div>
              </div>

              {/* Zoom & Alignment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px]">
                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="h-3 w-3 text-blue-600" />
                      <span>Zoom: {editorZoom.toFixed(1)}x</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditorZoom(1)}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={editorZoom}
                    onChange={(e) => setEditorZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* Horizontal Alignment Pan */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Move className="h-3 w-3 text-blue-600" />
                      <span>Offset / Pan:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorPanX(0);
                        setEditorPanY(0);
                      }}
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Center
                    </button>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={editorPanX}
                    onChange={(e) => setEditorPanX(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                Cropped image will be formatted to recommended Google Ads resolution.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsImageEditorOpen(false);
                    setEditorRuleViolationReason(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCropAndSave}
                  disabled={isApplyingCrop}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                    editorTargetType === "LOGO"
                      ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  {isApplyingCrop ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Apply Crop & Save Asset</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── EDIT FROM OLD DRAFT MODAL ── */}
      {isDraftPickerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <FolderArchive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>Saved Draft Campaigns</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold font-mono">
                      {draftsList.length} Drafts
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unpublished drafts saved from previous sessions. Select any draft to resume editing in the Cockpit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDraftPickerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search and Refresh Bar */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={campaignSearchQuery}
                  onChange={(e) => setCampaignSearchQuery(e.target.value)}
                  placeholder="Search saved drafts by business or campaign name..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-all shadow-2xs"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => fetchDraftCampaigns()}
                disabled={isLoadingDrafts}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                title="Refresh drafts list from database"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDrafts ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Drafts List Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-0">
              {isLoadingDrafts ? (
                <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span>Loading saved drafts from database...</span>
                </div>
              ) : (draftsList.length === 0 && existingCampaignsList.filter(c => (c.status || "").toUpperCase() === "DRAFT").length === 0) ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <FolderArchive className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No saved drafts found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You can save your current campaign work as a draft at any time using the <strong>"Save Draft"</strong> button below.
                  </p>
                </div>
              ) : (
                (draftsList.length > 0 ? draftsList : existingCampaignsList.filter(c => (c.status || "").toUpperCase() === "DRAFT"))
                  .filter((c) =>
                    !campaignSearchQuery ||
                    (c.name || "").toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
                    (c.campaignType || "").toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
                    (c.businessName || "").toLowerCase().includes(campaignSearchQuery.toLowerCase())
                  )
                  .map((camp) => {
                    const budget = camp.budget ? Number(camp.budget) : (camp.amountMicros ? Number(camp.amountMicros) / 1_000_000 : null);
                    const headlinesCount = Array.isArray(camp.headlines) ? camp.headlines.length : 0;
                    const descriptionsCount = Array.isArray(camp.descriptions) ? camp.descriptions.length : 0;
                    const keywordsCount = Array.isArray(camp.keywords) ? camp.keywords.length : 0;

                    return (
                      <div
                        key={camp.id || camp.campaignId || Math.random()}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {camp.name}
                              </span>
                              {camp.campaignType ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {camp.campaignType}
                                </span>
                              ) : null}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Unpublished Draft
                              </span>
                            </div>

                            {/* Details Row */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                              {budget && budget > 0 && (
                                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                  ₹{budget.toLocaleString()}/day
                                </span>
                              )}
                              {camp.biddingStrategy && (
                                <span className="text-slate-600">
                                  Strategy: <strong className="text-slate-800">{camp.biddingStrategy}</strong>
                                </span>
                              )}
                              {headlinesCount > 0 && (
                                <span className="text-slate-500">
                                  {headlinesCount} Headlines · {descriptionsCount} Descriptions
                                </span>
                              )}
                              {keywordsCount > 0 && (
                                <span className="text-slate-500">
                                  {keywordsCount} Keywords
                                </span>
                              )}
                              {camp.updatedAt && (
                                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Saved {new Date(camp.updatedAt).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Edit / Load Button */}
                          <button
                            type="button"
                            onClick={() => handleLoadDraftCampaign(camp)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
                            title="Auto-fill this draft into Cockpit"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>Resume Draft</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Click <strong>"Resume Draft"</strong> to restore all parameters and assets into the Campaign Cockpit.
              </span>
              <button
                type="button"
                onClick={() => setIsDraftPickerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── AI Generated & Published Campaign History Modal ── */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>Campaign History</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold font-mono">
                      {existingCampaignsList.length} Total
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    All AI-generated, configured, and published Google Ads campaigns
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search and Quick Filters */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={campaignSearchQuery}
                  onChange={(e) => setCampaignSearchQuery(e.target.value)}
                  placeholder="Search by campaign name, type (Search, PMax, Display), or status..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-2xs"
                  autoFocus
                />
              </div>
            </div>

            {/* Campaigns History Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-0">
              {isLoadingCampaigns ? (
                <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span>Loading campaign history from Google Ads...</span>
                </div>
              ) : existingCampaignsList.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <Bookmark className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No campaigns found yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Once you generate and launch campaigns through AI Copilot, they will automatically appear here with full history and quick reuse options.
                  </p>
                </div>
              ) : (
                existingCampaignsList
                  .filter((c) =>
                    !campaignSearchQuery ||
                    (c.name || "").toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
                    (c.campaignType || "").toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
                    (c.status || "").toLowerCase().includes(campaignSearchQuery.toLowerCase())
                  )
                  .map((camp) => {
                    const budget = camp.budget ? Number(camp.budget) : (camp.amountMicros ? Number(camp.amountMicros) / 1_000_000 : null);
                    const isPublished = Boolean(camp.googleAdsCampaignId || camp.status === "ENABLED" || camp.status === "PAUSED");

                    return (
                      <div
                        key={camp.id || camp.googleAdsCampaignId || Math.random()}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {camp.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                {camp.campaignType || "SEARCH"}
                              </span>
                              {isPublished ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                  <span>Published</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  Configured Draft
                                </span>
                              )}
                            </div>

                            {/* Details Row */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                              {budget && budget > 0 && (
                                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                  ₹{budget.toLocaleString()}/day
                                </span>
                              )}
                              {camp.biddingStrategy && (
                                <span className="text-slate-600">
                                  Strategy: <strong className="text-slate-800">{camp.biddingStrategy}</strong>
                                </span>
                              )}
                              {camp.status && (
                                <span className="text-slate-500 font-medium">
                                  Status: <span className="uppercase text-slate-700 font-semibold">{camp.status}</span>
                                </span>
                              )}
                              {camp.startDate && (
                                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(camp.startDate).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Reuse Button */}
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectReferenceCampaign(camp);
                              setIsHistoryModalOpen(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs group-hover:bg-purple-600 group-hover:text-white"
                            title="Reuse this campaign in AI Studio"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Reuse Campaign</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Click <strong>"Reuse Campaign"</strong> to load settings and creative assets directly into your active session.
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: MEDIA SOURCE PICKER (Upload vs Past Files)          */}
      {/* ------------------------------------------------------------- */}
      {isMediaSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 via-blue-50/40 to-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 capitalize">
                    Add {activeUploadTarget}
                  </h3>
                  <p className="text-[11px] text-slate-500">Choose how you want to select your asset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaSourceModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selection Options */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/50">
              {/* Option 1: Device File Explorer */}
              <button
                type="button"
                onClick={() => {
                  setIsMediaSourceModalOpen(false);
                  if (activeUploadTarget === "IMAGE") imageInputRef.current?.click();
                  else if (activeUploadTarget === "LOGO") logoInputRef.current?.click();
                  else if (activeUploadTarget === "VIDEO") videoInputRef.current?.click();
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 transition-all text-left flex flex-col items-center text-center gap-2.5 group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800 group-hover:text-blue-600">
                    Device File Explorer
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Upload from local drive, camera or PC
                  </p>
                </div>
              </button>

              {/* Option 2: Choose Past Files */}
              <button
                type="button"
                onClick={() => {
                  setIsMediaSourceModalOpen(false);
                  fetchPastMediaLibrary();
                  setIsPastMediaModalOpen(true);
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/40 transition-all text-left flex flex-col items-center text-center gap-2.5 group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800 group-hover:text-purple-600">
                    Past Files & Media Library
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Browse previously saved ImageKit assets
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMediaSourceModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: PAST MEDIA & IMAGEKIT LIBRARY GALLERY MODAL         */}
      {/* ------------------------------------------------------------- */}
      {isPastMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span>Past Files & ImageKit Library</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Target: {activeUploadTarget.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select any previously uploaded or AI-generated creative to attach instantly to this campaign
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchPastMediaLibrary()}
                  disabled={isLoadingPastMedia}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                  title="Refresh library"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoadingPastMedia ? "animate-spin text-purple-600" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPastMediaModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pastMediaSearchQuery}
                  onChange={(e) => setPastMediaSearchQuery(e.target.value)}
                  placeholder="Search past assets by name or tag..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(["ALL", "IMAGE", "LOGO", "VIDEO"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPastMediaFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      pastMediaFilter === tab
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-[300px]">
              {isLoadingPastMedia ? (
                <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="font-semibold text-slate-700">Loading stored creatives from ImageKit...</span>
                </div>
              ) : pastMediaList.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400 space-y-3">
                  <ImageIcon className="h-12 w-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No past media found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When you generate visuals with AI or upload from file explorer, they are automatically stored in your ImageKit library and will show here.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPastMediaModalOpen(false);
                      if (activeUploadTarget === "IMAGE") imageInputRef.current?.click();
                      else if (activeUploadTarget === "LOGO") logoInputRef.current?.click();
                      else if (activeUploadTarget === "VIDEO") videoInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload from Device Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {pastMediaList
                    .filter((item) => {
                      const itemType = (item.type || item.fileType || "").toLowerCase();
                      const itemField = (item.fieldType || "").toUpperCase();
                      const nameLower = (item.name || "").toLowerCase();

                      const isLogo = itemType === "logo" || itemField === "LOGO" || nameLower.includes("logo");
                      const isVideo = itemType === "video" || itemField === "VIDEO" || nameLower.endsWith(".mp4") || nameLower.endsWith(".webm");
                      const isImage = !isLogo && !isVideo;

                      // Filter by Tab
                      if (pastMediaFilter === "IMAGE" && !isImage) return false;
                      if (pastMediaFilter === "LOGO" && !isLogo) return false;
                      if (pastMediaFilter === "VIDEO" && !isVideo) return false;

                      // Filter by Search
                      if (pastMediaSearchQuery) {
                        const q = pastMediaSearchQuery.toLowerCase();
                        return nameLower.includes(q) || (item.aspectRatio || "").toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((item) => {
                      const itemType = (item.type || item.fileType || "").toLowerCase();
                      const itemField = (item.fieldType || "").toUpperCase();
                      const nameLower = (item.name || "").toLowerCase();
                      const isLogo = itemType === "logo" || itemField === "LOGO" || nameLower.includes("logo");
                      const isVideo = itemType === "video" || itemField === "VIDEO" || nameLower.endsWith(".mp4") || nameLower.endsWith(".webm");
                      const displayType = isLogo ? "logo" : isVideo ? "video" : "image";

                      return (
                      <div
                        key={item.id}
                        className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-purple-400 hover:shadow-lg transition-all flex flex-col"
                      >
                        {/* Thumbnail View */}
                        <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {isVideo ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2">
                              <Video className="h-8 w-8 text-purple-600" />
                              <span className="text-[10px] font-mono text-center truncate max-w-full px-1">
                                {item.name}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          )}

                          {/* Aspect Ratio & Type Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                            <span className="px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono font-bold backdrop-blur-xs">
                              {item.aspectRatio || (isLogo ? "1:1" : isVideo ? "16:9" : "1.91:1")}
                            </span>
                            {item.width && item.height && (
                              <span className="px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[8px] font-mono">
                                {item.width}×{item.height}
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase shadow-2xs pointer-events-none ${
                              displayType === "logo"
                                ? "bg-amber-500 text-white"
                                : displayType === "video"
                                ? "bg-indigo-600 text-white"
                                : "bg-purple-600 text-white"
                            }`}>
                              {displayType}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeletePastMediaItem(e, item)}
                              className="p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
                              title="Delete from ImageKit permanent library"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Card Info & Select Button */}
                        <div className="p-2.5 flex flex-col justify-between flex-1 gap-2 bg-white">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate" title={item.name}>
                              {item.name}
                            </p>
                            {item.createdAt && (
                              <p className="text-[9px] text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectPastMediaItem(item)}
                              className="flex-1 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-purple-200 hover:border-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                            >
                              <Check className="h-3 w-3" />
                              <span>Select</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeletePastMediaItem(e, item)}
                              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete from Library"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Total saved items: <strong>{pastMediaList.length}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPastMediaModalOpen(false);
                    if (activeUploadTarget === "IMAGE") imageInputRef.current?.click();
                    else if (activeUploadTarget === "LOGO") logoInputRef.current?.click();
                    else if (activeUploadTarget === "VIDEO") videoInputRef.current?.click();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                  <span>Upload New Instead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPastMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: SAVE DRAFT & EXIT CONFIRMATION DIALOG                */}
      {/* ------------------------------------------------------------- */}
      {isExitPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Unsaved Campaign Progress
                  </h3>
                  <p className="text-[11px] text-slate-500">Would you like to save your work before leaving?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsExitPromptOpen(false);
                  setPendingExitAction(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>
                You have active campaign parameters and generated copy ({campaignState.businessName || "Current Setup"}).
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-700">
                  <span>Business:</span>
                  <strong className="text-slate-900">{campaignState.businessName || "Not set"}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Campaign Type:</span>
                  <strong className="text-slate-900">{campaignState.campaignType || "Auto"}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Daily Budget:</span>
                  <strong className="text-slate-900">{campaignState.dailyBudget ? `₹${campaignState.dailyBudget}/day` : "Not set"}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Assets & Copy:</span>
                  <strong className="text-slate-900">{(campaignState.headlines?.length || 0)} Headlines · {(campaignState.images?.length || 0)} Images</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Saving as draft lets you return and resume at any time from <strong>"Edit from Old Draft"</strong>.
              </p>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExitPromptOpen(false);
                  setPendingExitAction(null);
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExitPromptOpen(false);
                  const action = pendingExitAction;
                  setPendingExitAction(null);
                  if (action === "back") {
                    router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
                  } else if (action === "new_session") {
                    executeResetSession();
                  }
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold text-xs cursor-pointer"
              >
                Discard & Exit
              </button>

              <button
                type="button"
                onClick={() => {
                  const action = pendingExitAction;
                  handleSaveCampaignDraft({
                    asNewDraft: false,
                    onSuccess: () => {
                      setIsExitPromptOpen(false);
                      setPendingExitAction(null);
                      if (action === "back") {
                        router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
                      } else if (action === "new_session") {
                        executeResetSession();
                      }
                    }
                  });
                }}
                disabled={isSavingDraft}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save as Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save Draft Confirmation Dialog ── */}
      {isSaveDraftConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-indigo-50/40 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {loadedDraftId ? "Save Changes or New Draft?" : "Save Campaign Draft?"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {loadedDraftId
                      ? `Editing draft: ${loadedDraftName || campaignState.campaignName || "Current Draft"}`
                      : "Securely store your campaign setup to drafts"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveDraftConfirmOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Summary */}
            <div className="p-5 space-y-3 text-xs text-slate-600">
              {loadedDraftId ? (
                <p>
                  You are editing an existing draft. Choose whether to <strong>update this draft</strong> or <strong>save as a new draft</strong> in your drafts database.
                </p>
              ) : (
                <p>
                  Would you like to save your current configuration for <strong>{campaignState.businessName || "Campaign"}</strong> to your drafts database?
                </p>
              )}
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-700">
                  <span>Objective:</span>
                  <strong className="text-slate-900 font-semibold">{campaignState.objective || "Not Set"}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Campaign Type:</span>
                  <strong className="text-slate-900 font-semibold">{campaignState.campaignType || "Not Set"}</strong>
                </div>
                {campaignState.dailyBudget && (
                  <div className="flex justify-between text-slate-700">
                    <span>Daily Budget:</span>
                    <strong className="text-emerald-700 font-bold font-mono">₹{campaignState.dailyBudget}/day</strong>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>Assets:</span>
                  <strong className="text-slate-900 font-semibold">
                    {(campaignState.headlines?.length || 0)} Headlines · {(campaignState.descriptions?.length || 0)} Descriptions · {(campaignState.images?.length || 0)} Images
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                You can resume your drafts at any time by clicking <strong>"Old Drafts"</strong>.
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSaveDraftConfirmOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>

              {loadedDraftId ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCampaignDraft({
                        asNewDraft: true,
                        onSuccess: () => setIsSaveDraftConfirmOpen(false)
                      });
                    }}
                    disabled={isSavingDraft}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Keep old draft intact and save this as a separate new draft"
                  >
                    {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>Save as New Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCampaignDraft({
                        asNewDraft: false,
                        onSuccess: () => setIsSaveDraftConfirmOpen(false)
                      });
                    }}
                    disabled={isSavingDraft}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Update and overwrite the loaded draft with current changes"
                  >
                    {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveCampaignDraft({
                      asNewDraft: false,
                      onSuccess: () => setIsSaveDraftConfirmOpen(false)
                    });
                  }}
                  disabled={isSavingDraft}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Draft</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Grok AI Suggestions & Generated Copy Review Popup Modal ── */}
      {isAiSuggestionsModalOpen && pendingAiSuggestions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shrink-0 ring-2 ring-white/30 overflow-hidden">
                  <img
                    src="/icon.jpeg"
                    alt="JDS Copilot"
                    className="w-full h-full object-contain rounded-xl animate-pulse"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                    <span>Grok AI Generated Recommendations</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      Review & Apply
                    </span>
                  </h3>
                  <p className="text-xs text-blue-100/90">
                    Review Grok AI's suggested ad copy, keywords & configuration before updating your Live Cockpit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAiSuggestionsModalOpen(false);
                  setPendingAiSuggestions(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              {/* AI Thought / Explanation with Bold Markdown Rendering */}
              {pendingAiSuggestions.aiExplanation && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-slate-800 leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span>AI Reasoning & Strategic Advice</span>
                  </div>
                  <div className="text-slate-700 text-xs leading-relaxed space-y-1">
                    {renderFormattedMarkdown(pendingAiSuggestions.aiExplanation)}
                  </div>
                </div>
              )}

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Proposed Campaign Type & Objective */}
                {(pendingAiSuggestions.suggestedType || pendingAiSuggestions.suggestedObjective) && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strategy</span>
                    <p className="text-xs font-bold text-slate-900">
                      {[pendingAiSuggestions.suggestedObjective, pendingAiSuggestions.suggestedType].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                )}

                {/* Proposed Budget */}
                {pendingAiSuggestions.suggestedBudget && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Recommended Budget</span>
                    <p className="text-xs font-bold text-emerald-900 font-mono">
                      ₹{pendingAiSuggestions.suggestedBudget.toLocaleString("en-IN")} / day
                    </p>
                  </div>
                )}
              </div>

              {/* Headlines Section */}
              {pendingAiSuggestions.suggestedHeadlines && pendingAiSuggestions.suggestedHeadlines.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      Suggested Headlines ({pendingAiSuggestions.suggestedHeadlines.length})
                    </span>
                    <span className="text-[10px] text-slate-400">&le; 30 chars</span>
                  </div>
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    {pendingAiSuggestions.suggestedHeadlines.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="font-semibold text-slate-800">{h}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{h.length}/30</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Long Headlines Section */}
              {pendingAiSuggestions.suggestedLongHeadlines && pendingAiSuggestions.suggestedLongHeadlines.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      Suggested Long Headlines ({pendingAiSuggestions.suggestedLongHeadlines.length})
                    </span>
                    <span className="text-[10px] text-slate-400">&le; 90 chars</span>
                  </div>
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    {pendingAiSuggestions.suggestedLongHeadlines.map((lh, i) => (
                      <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="font-semibold text-slate-800">{lh}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{lh.length}/90</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descriptions Section */}
              {pendingAiSuggestions.suggestedDescriptions && pendingAiSuggestions.suggestedDescriptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
                      Suggested Descriptions ({pendingAiSuggestions.suggestedDescriptions.length})
                    </span>
                    <span className="text-[10px] text-slate-400">&le; 90 chars</span>
                  </div>
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    {pendingAiSuggestions.suggestedDescriptions.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="font-semibold text-slate-800">{d}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{d.length}/90</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords Section */}
              {pendingAiSuggestions.suggestedKeywords && pendingAiSuggestions.suggestedKeywords.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-blue-600" />
                    Suggested High-Intent Keywords ({pendingAiSuggestions.suggestedKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    {pendingAiSuggestions.suggestedKeywords.map((k, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sitelinks Section */}
              {pendingAiSuggestions.proposedState?.sitelinks && pendingAiSuggestions.proposedState.sitelinks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-indigo-600" />
                    Suggested Sitelinks ({pendingAiSuggestions.proposedState.sitelinks.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    {pendingAiSuggestions.proposedState.sitelinks.map((s, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600 truncate">{s.text}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{s.text.length}/25</span>
                        </div>
                        {(s.desc1 || s.desc2) && (
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {[s.desc1, s.desc2].filter(Boolean).join(" • ")}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400 font-mono truncate">{s.url}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500 text-center sm:text-left">
                Applying will populate your Live Campaign Cockpit.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsAiSuggestionsModalOpen(false);
                    setPendingAiSuggestions(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingAiSuggestions.proposedState) {
                      applyProposedCampaignState(pendingAiSuggestions.proposedState, pendingAiSuggestions.messageId);
                    }
                    setIsAiSuggestionsModalOpen(false);
                    setPendingAiSuggestions(null);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Apply to Cockpit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Antigravity-Style Floating Notification Banner (Light Mode with icon.jpeg & Animations) - ONLY when preview is open ── */}
      {aiNotificationBanner && Boolean(campaignState.objective && campaignState.campaignType) && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-[440px] bg-white/98 backdrop-blur-lg text-slate-900 rounded-3xl shadow-2xl border-2 border-blue-500/30 p-5 animate-in slide-in-from-bottom-6 zoom-in-95 fade-in duration-300 ring-8 ring-blue-500/10 space-y-3.5">
          <div className="flex items-start gap-3.5">
            {/* Custom Logo / Icon Badge with Shimmer & Pulse Animation */}
            <div className="relative w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-blue-500/30 overflow-hidden group">
              <img
                src="/icon.jpeg"
                alt="JDS AI Copilot"
                className="w-full h-full object-contain rounded-xl animate-pulse"
              />
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-transparent pointer-events-none" />
              {/* Radiating notification glow */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            {/* Notification Header & Body */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                    {aiNotificationBanner.title}
                  </h4>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200/80 shrink-0 animate-pulse">
                    AI Ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiNotificationBanner(null)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-snug">
                {renderFormattedMarkdown(aiNotificationBanner.summary)}
              </div>
            </div>
          </div>

          {/* 3 Antigravity Action Buttons in Light Mode */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {/* 1. Apply Suggestion */}
            <button
              type="button"
              onClick={() => {
                if (aiNotificationBanner.suggestionsData?.proposedState) {
                  applyProposedCampaignState(
                    aiNotificationBanner.suggestionsData.proposedState,
                    aiNotificationBanner.suggestionsData.messageId
                  );
                }
                setAiNotificationBanner(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Suggestion</span>
            </button>

            {/* 2. View Suggestion */}
            <button
              type="button"
              onClick={() => {
                const targetData = aiNotificationBanner.suggestionsData;
                setAiNotificationBanner(null); // remove notification box immediately
                setPendingAiSuggestions(targetData);
                setIsAiSuggestionsModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Eye className="h-3.5 w-3.5 text-blue-600" />
              <span>View Suggestion</span>
            </button>

            {/* 3. Cancel */}
            <button
              type="button"
              onClick={() => setAiNotificationBanner(null)}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer ml-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Sitelinks Modal (100% Parity with Manual Sales Performance Max) ── */}
      {isSitelinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {editingSitelinkIndex !== null ? "Edit sitelink" : "Create sitelink"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Add custom links to send customers to specific pages on your website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSitelinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs">
                  Sitelink {editingSitelinkIndex !== null ? editingSitelinkIndex + 1 : (campaignState.sitelinks?.length || 0) + 1}
                </h4>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Ad Extension
                </span>
              </div>

              {/* Sitelink Text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">Sitelink text</label>
                  <span className="text-[10px] text-slate-400 font-mono">{sitelinkText.length} / 25</span>
                </div>
                <input
                  type="text"
                  value={sitelinkText}
                  onChange={(e) => setSitelinkText(e.target.value)}
                  maxLength={25}
                  placeholder='e.g. "About Us", "Special Offers", "Track Order"'
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Description line 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">Description line 1 (recommended)</label>
                  <span className="text-[10px] text-slate-400 font-mono">{sitelinkDesc1.length} / 35</span>
                </div>
                <input
                  type="text"
                  value={sitelinkDesc1}
                  onChange={(e) => setSitelinkDesc1(e.target.value)}
                  maxLength={35}
                  placeholder='e.g. "Discover high-quality products"'
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Description line 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">Description line 2 (recommended)</label>
                  <span className="text-[10px] text-slate-400 font-mono">{sitelinkDesc2.length} / 35</span>
                </div>
                <input
                  type="text"
                  value={sitelinkDesc2}
                  onChange={(e) => setSitelinkDesc2(e.target.value)}
                  maxLength={35}
                  placeholder='e.g. "Free shipping & best price guarantee"'
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Final URL */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Final URL</label>
                <input
                  type="url"
                  value={sitelinkUrl}
                  onChange={(e) => setSitelinkUrl(e.target.value)}
                  placeholder="https://www.example.com/offers"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Sitelink URL options (Collapsible) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSitelinkUrlOptions(!showSitelinkUrlOptions)}
                  className="flex items-center gap-1.5 text-slate-700 font-semibold hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {showSitelinkUrlOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span>Sitelink URL options</span>
                </button>

                {showSitelinkUrlOptions && (
                  <div className="mt-3 space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Tracking template</label>
                      <input
                        type="text"
                        value={sitelinkTracking}
                        onChange={(e) => setSitelinkTracking(e.target.value)}
                        placeholder="https://www.tracking.example/?url={lpurl}&id=5"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Final URL suffix</label>
                      <input
                        type="text"
                        value={sitelinkSuffix}
                        onChange={(e) => setSitelinkSuffix(e.target.value)}
                        placeholder="param1=value1&param2=value2"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold">Custom parameters</label>
                      {sitelinkCustomParams.map((param, idx) => (
                        <div key={param.id} className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono">{'{_'}</span>
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => {
                              const updated = [...sitelinkCustomParams];
                              updated[idx].name = e.target.value;
                              setSitelinkCustomParams(updated);
                            }}
                            placeholder="Name"
                            className="w-1/3 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                          <span className="text-slate-500 font-mono">{'}'} =</span>
                          <input
                            type="text"
                            value={param.value}
                            onChange={(e) => {
                              const updated = [...sitelinkCustomParams];
                              updated[idx].value = e.target.value;
                              setSitelinkCustomParams(updated);
                            }}
                            placeholder="Value"
                            className="w-1/3 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setSitelinkCustomParams(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSitelinkCustomParams(prev => [...prev, { id: Date.now().toString(), name: "", value: "" }])}
                        className="text-indigo-600 font-bold hover:underline text-[11px] cursor-pointer"
                      >
                        + Add custom parameter
                      </button>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useSitelinkMobileUrl}
                          onChange={(e) => setUseSitelinkMobileUrl(e.target.checked)}
                          className="rounded text-indigo-600 h-4 w-4"
                        />
                        <span className="text-slate-700 font-semibold">Use a different final URL for mobile</span>
                      </label>
                      {useSitelinkMobileUrl && (
                        <input
                          type="text"
                          value={sitelinkMobileUrl}
                          onChange={(e) => setSitelinkMobileUrl(e.target.value)}
                          placeholder="https://m.example.com/offers"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced options (Start/End Date and Schedule) */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSitelinkAdvancedOptions(!showSitelinkAdvancedOptions)}
                  className="flex items-center gap-1.5 text-slate-700 font-semibold hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  {showSitelinkAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span>Advanced options (Scheduling)</span>
                </button>

                {showSitelinkAdvancedOptions && (
                  <div className="mt-3 space-y-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-700 font-semibold">Start date</label>
                        <input
                          type="date"
                          value={sitelinkSchedules[0]?.startDate || ""}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            if (sitelinkSchedules.length === 0) {
                              setSitelinkSchedules([{ id: "s-1", day: "All days", start: "00:00", end: "23:45", startDate: e.target.value, endDate: "" }]);
                            } else {
                              const updated = [...sitelinkSchedules];
                              updated[0].startDate = e.target.value;
                              setSitelinkSchedules(updated);
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-700 font-semibold">End date</label>
                        <input
                          type="date"
                          value={sitelinkSchedules[0]?.endDate || ""}
                          min={sitelinkSchedules[0]?.startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            if (sitelinkSchedules.length === 0) {
                              setSitelinkSchedules([{ id: "s-1", day: "All days", start: "00:00", end: "23:45", startDate: "", endDate: e.target.value }]);
                            } else {
                              const updated = [...sitelinkSchedules];
                              updated[0].endDate = e.target.value;
                              setSitelinkSchedules(updated);
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-700 font-semibold">Days and hours</label>
                      {sitelinkSchedules.map((sched, idx) => {
                        const isInvalidTime = sched.start >= sched.end && sched.end !== "00:00";
                        const dayOpts = [
                          "All days", "Mondays - Fridays", "Saturdays - Sundays",
                          "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"
                        ];
                        const timeOpts = [
                          "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
                          "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
                          "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:45"
                        ];
                        return (
                          <div key={sched.id} className="space-y-1">
                            <div className={`flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border ${isInvalidTime ? 'border-rose-300' : 'border-slate-200'}`}>
                              <select
                                value={sched.day}
                                onChange={(e) => {
                                  const updated = [...sitelinkSchedules];
                                  updated[idx].day = e.target.value;
                                  setSitelinkSchedules(updated);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded flex-1 px-2 py-1 text-xs text-slate-900 font-medium"
                              >
                                {dayOpts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                              </select>
                              <select
                                value={sched.start}
                                onChange={(e) => {
                                  const updated = [...sitelinkSchedules];
                                  updated[idx].start = e.target.value;
                                  setSitelinkSchedules(updated);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded w-20 px-1 py-1 text-xs text-slate-900 font-mono"
                              >
                                {timeOpts.map((t, i) => <option key={i} value={t}>{t}</option>)}
                              </select>
                              <span className="text-slate-500 text-[10px]">to</span>
                              <select
                                value={sched.end}
                                onChange={(e) => {
                                  const updated = [...sitelinkSchedules];
                                  updated[idx].end = e.target.value;
                                  setSitelinkSchedules(updated);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded w-20 px-1 py-1 text-xs text-slate-900 font-mono"
                              >
                                {timeOpts.map((t, i) => <option key={i} value={t}>{t}</option>)}
                              </select>
                              {sitelinkSchedules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setSitelinkSchedules(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            {isInvalidTime && <p className="text-[10px] text-rose-500 font-semibold px-1">End time must be after start time.</p>}
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSitelinkSchedules(prev => [...prev, { id: `ss-${Date.now()}`, day: "All days", start: "00:00", end: "23:45", startDate: prev[0]?.startDate || "", endDate: prev[0]?.endDate || "" }])}
                        className="text-indigo-600 font-bold hover:underline text-[11px] block cursor-pointer"
                      >
                        + Add schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                disabled={!sitelinkText.trim() || !sitelinkUrl.trim()}
                onClick={() => {
                  let cleanUrl = sitelinkUrl.trim();
                  if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                    cleanUrl = `https://${cleanUrl}`;
                  }
                  const newEntry = {
                    text: sitelinkText.trim(),
                    desc1: sitelinkDesc1.trim() || undefined,
                    desc2: sitelinkDesc2.trim() || undefined,
                    url: cleanUrl,
                    mobileUrl: useSitelinkMobileUrl ? sitelinkMobileUrl.trim() : undefined,
                    tracking: sitelinkTracking.trim() || undefined,
                    suffix: sitelinkSuffix.trim() || undefined,
                    customParams: sitelinkCustomParams.filter(p => p.name.trim() && p.value.trim()),
                    schedules: sitelinkSchedules
                  };

                  if (editingSitelinkIndex !== null) {
                    setCampaignState(prev => {
                      const updated = [...(prev.sitelinks || [])];
                      updated[editingSitelinkIndex] = newEntry as any;
                      return { ...prev, sitelinks: updated };
                    });
                  } else {
                    setCampaignState(prev => ({
                      ...prev,
                      sitelinks: [...(prev.sitelinks || []), newEntry as any]
                    }));
                  }
                  // Reset form for next entry
                  setEditingSitelinkIndex(null);
                  setSitelinkText("");
                  setSitelinkDesc1("");
                  setSitelinkDesc2("");
                  setSitelinkUrl(campaignState.website || "");
                  setSitelinkMobileUrl("");
                  setUseSitelinkMobileUrl(false);
                  setSitelinkTracking("");
                  setSitelinkSuffix("");
                  setSitelinkCustomParams([]);
                  setSitelinkSchedules([]);
                  setShowSitelinkUrlOptions(false);
                  setShowSitelinkAdvancedOptions(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save & Add Another</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSitelinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (sitelinkText.trim() && sitelinkUrl.trim()) {
                      let cleanUrl = sitelinkUrl.trim();
                      if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                        cleanUrl = `https://${cleanUrl}`;
                      }
                      const newEntry = {
                        text: sitelinkText.trim(),
                        desc1: sitelinkDesc1.trim() || undefined,
                        desc2: sitelinkDesc2.trim() || undefined,
                        url: cleanUrl,
                        mobileUrl: useSitelinkMobileUrl ? sitelinkMobileUrl.trim() : undefined,
                        tracking: sitelinkTracking.trim() || undefined,
                        suffix: sitelinkSuffix.trim() || undefined,
                        customParams: sitelinkCustomParams.filter(p => p.name.trim() && p.value.trim()),
                        schedules: sitelinkSchedules
                      };
                      if (editingSitelinkIndex !== null) {
                        setCampaignState(prev => {
                          const updated = [...(prev.sitelinks || [])];
                          updated[editingSitelinkIndex] = newEntry as any;
                          return { ...prev, sitelinks: updated };
                        });
                      } else {
                        setCampaignState(prev => ({
                          ...prev,
                          sitelinks: [...(prev.sitelinks || []), newEntry as any]
                        }));
                      }
                    }
                    setIsSitelinkModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Sitelink</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── More Asset Types Modal: Promotions ── */}
      {activeAssetModal === "PROMOTIONS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add promotions to your campaign</h3>
                <p className="text-[11px] text-slate-500">Campaign-level promotions: Add special offers and discount deals to this campaign.</p>
              </div>
              <button type="button" onClick={() => setActiveAssetModal(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Occasion</label>
                  <select
                    value={promoOccasion}
                    onChange={(e) => setPromoOccasion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {[
                      "None", "New Year's", "Valentine's Day", "Easter", "Mother's Day", "Father's Day",
                      "Labor Day", "Back to school", "Halloween", "Black Friday", "Cyber Monday", "Christmas", "Boxing Day"
                    ].map((occ, i) => (
                      <option key={i} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Language</label>
                  <select
                    value={promoLanguage}
                    onChange={(e) => setPromoLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {["English", "Hindi", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch", "Russian", "Japanese", "Arabic"].map((lang, i) => (
                      <option key={i} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={promoCurrency}
                    onChange={(e) => setPromoCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  >
                    {["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD", "JPY"].map((curr, i) => (
                      <option key={i} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Promotion type</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="Monetary discount">Monetary discount</option>
                    <option value="Percent discount">Percent discount</option>
                    <option value="Up to monetary discount">Up to monetary discount</option>
                    <option value="Up to percent discount">Up to percent discount</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Amount / Percent</label>
                  <input
                    type="number"
                    value={promoAmountValue}
                    onChange={(e) => setPromoAmountValue(e.target.value)}
                    placeholder={promoType.includes("Percent") ? "e.g. 20 (for 20% off)" : "e.g. 500 (for ₹500 off)"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Item / Product Name</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={promoItem}
                    onChange={(e) => setPromoItem(e.target.value)}
                    placeholder="e.g. Running Shoes, Annual Subscription"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">{promoItem.length} / 30 characters</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Final URL</label>
                  <input
                    type="url"
                    value={promoFinalUrl}
                    onChange={(e) => setPromoFinalUrl(e.target.value)}
                    placeholder={campaignState.website || "https://www.example.com/promo"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Promotion details</label>
                  <select
                    value={promoDetailsType}
                    onChange={(e) => setPromoDetailsType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="None">None</option>
                    <option value="On orders over">On orders over</option>
                    <option value="Promo code">Promo code</option>
                  </select>
                </div>
                <div>
                  {promoDetailsType !== "None" && (
                    <>
                      <label className="block text-slate-700 font-semibold mb-1">
                        {promoDetailsType === "On orders over" ? "Minimum Order Amount" : "Promo Code (Alphanumeric)"}
                      </label>
                      <input
                        type="text"
                        value={promoDetailsValue}
                        onChange={(e) => setPromoDetailsValue(e.target.value)}
                        placeholder={promoDetailsType === "On orders over" ? "e.g. 1999" : "e.g. FESTIVE20"}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = promoItem.trim() || "Special Offer";
                  const cleanUrl = promoFinalUrl.trim() || campaignState.website || "https://example.com";
                  const isPct = promoType.includes("Percent");
                  const amt = Number(promoAmountValue) || (isPct ? 15 : 200);
                  const newPromo = {
                    promotionTarget: target,
                    finalUrl: cleanUrl,
                    occasion: promoOccasion !== "None" ? promoOccasion : undefined,
                    percentOff: isPct ? amt : undefined,
                    moneyAmountOff: !isPct ? amt : undefined,
                    currencyCode: promoCurrency,
                    languageCode: promoLanguage,
                    promotionCode: promoDetailsType === "Promo code" ? promoDetailsValue.trim() : undefined
                  };
                  setCampaignState(prev => ({
                    ...prev,
                    promotions: [...(prev.promotions || []), newPromo]
                  }));
                  setActiveAssetModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
              >
                Save Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── More Asset Types Modal: Prices ── */}
      {activeAssetModal === "PRICES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add prices to your campaign</h3>
                <p className="text-[11px] text-slate-500">Showcase your products or services and link people directly to the offerings that interest them.</p>
              </div>
              <button type="button" onClick={() => setActiveAssetModal(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Language</label>
                  <select
                    value={priceLanguage}
                    onChange={(e) => setPriceLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {["English", "Hindi", "Spanish", "French", "German", "Portuguese", "Japanese", "Arabic"].map((lang, i) => (
                      <option key={i} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {["Brands", "Events", "Locations", "Neighborhoods", "Product categories", "Product tiers", "Service categories", "Service tiers", "Services"].map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Currency</label>
                  <select
                    value={priceCurrency}
                    onChange={(e) => setPriceCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  >
                    {["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD"].map((curr, i) => (
                      <option key={i} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Price qualifier</label>
                <select
                  value={priceQualifier}
                  onChange={(e) => setPriceQualifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  <option value="No qualifier">No qualifier</option>
                  <option value="From">From</option>
                  <option value="Up to">Up to</option>
                  <option value="Average">Average</option>
                </select>
              </div>

              {/* Price Items List */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-slate-800">Price items (Offerings)</h5>
                  <button
                    type="button"
                    onClick={() => setPriceItems(prev => [...prev, { id: `pi-${Date.now()}`, header: "", amount: "", unit: "No units", description: "", finalUrl: "", mobileFinalUrl: "" }])}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add item
                  </button>
                </div>

                {priceItems.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 text-xs">Item {idx + 1}</span>
                      {priceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPriceItems(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Header (max 25)</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={item.header}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].header = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder="e.g. Starter Plan"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Price ({priceCurrency})</label>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].amount = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder="499"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Unit</label>
                        <select
                          value={item.unit}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].unit = e.target.value;
                            setPriceItems(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                        >
                          <option value="No units">No units</option>
                          <option value="Per hour">Per hour</option>
                          <option value="Per day">Per day</option>
                          <option value="Per week">Per week</option>
                          <option value="Per month">Per month</option>
                          <option value="Per year">Per year</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Description (max 25)</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].description = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder="e.g. All basic features"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Final URL</label>
                        <input
                          type="url"
                          value={item.finalUrl}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[idx].finalUrl = e.target.value;
                            setPriceItems(updated);
                          }}
                          placeholder={campaignState.website || "https://example.com/pricing"}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const validItems = priceItems
                    .filter(pi => pi.header.trim())
                    .map(pi => ({
                      header: pi.header.trim(),
                      description: pi.description.trim() || undefined,
                      amount: Number(pi.amount) || 100,
                      currencyCode: priceCurrency,
                      unit: pi.unit !== "No units" ? pi.unit : undefined,
                      finalUrl: pi.finalUrl.trim() || campaignState.website || "https://example.com"
                    }));
                  if (validItems.length > 0) {
                    setCampaignState(prev => ({
                      ...prev,
                      prices: [...(prev.prices || []), ...validItems]
                    }));
                  }
                  setActiveAssetModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
              >
                Save Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── More Asset Types Modal: Messages (WhatsApp / Messenger / Zalo) ── */}
      {activeAssetModal === "APPS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add messages to your campaign</h3>
                <p className="text-[11px] text-slate-500">Enable prospects to directly message your WhatsApp, Messenger, or business chat from your ads.</p>
              </div>
              <button type="button" onClick={() => setActiveAssetModal(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Select message platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "WhatsApp", label: "WhatsApp", icon: "💬" },
                    { key: "Messenger", label: "Messenger", icon: "⚡" },
                    { key: "Zalo", label: "Zalo", icon: "🔵" }
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setMsgPlatform(p.key as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        msgPlatform === p.key
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {msgPlatform === "WhatsApp" ? "WhatsApp Phone Number (with Country Code)" : `${msgPlatform} Page / User Handle`}
                  </label>
                  <input
                    type="text"
                    value={msgCustomUrlName}
                    onChange={(e) => setMsgCustomUrlName(e.target.value)}
                    placeholder={msgPlatform === "WhatsApp" ? "+919876543210" : "mybusiness"}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Starter message</label>
                  <textarea
                    rows={2}
                    maxLength={140}
                    value={msgStarterMessage}
                    onChange={(e) => setMsgStarterMessage(e.target.value)}
                    placeholder="Hi, I'm interested in your services and would like more details."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 block text-right font-mono">{msgStarterMessage.length} / 140</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">Call-to-action</label>
                    <select
                      value={msgCallToAction}
                      onChange={(e) => setMsgCallToAction(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    >
                      {["Contact us", "Get quote", "Get offer", "Get started", "Learn more", "Chat now"].map((cta, idx) => (
                        <option key={idx} value={cta}>{cta}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-semibold mb-1">CTA description</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={msgCtaDescription}
                      onChange={(e) => setMsgCtaDescription(e.target.value)}
                      placeholder="Fast reply in minutes"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const newMsg = {
                    platform: msgPlatform,
                    customUrlName: msgCustomUrlName.trim() || undefined,
                    starterMessage: msgStarterMessage.trim() || undefined,
                    callToAction: msgCallToAction,
                    ctaDescription: msgCtaDescription.trim() || undefined
                  };
                  setCampaignState(prev => ({
                    ...prev,
                    messages: [...(prev.messages || []), newMsg]
                  }));
                  setActiveAssetModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── More Asset Types Modal: Structured Snippets ── */}
      {activeAssetModal === "SNIPPETS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Create structured snippet</h3>
                <p className="text-[11px] text-slate-500">Highlight specific aspects of your products and services below your ad.</p>
              </div>
              <button type="button" onClick={() => setActiveAssetModal(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Header Language</label>
                  <select
                    value={snippetLanguage}
                    onChange={(e) => setSnippetLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {["English", "Hindi", "Spanish", "French", "German", "Portuguese", "Japanese", "Arabic"].map((lang, idx) => (
                      <option key={idx} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select header type</label>
                  <select
                    value={snippetHeaderType}
                    onChange={(e) => setSnippetHeaderType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                  >
                    {["Amenities", "Brands", "Courses", "Degree programs", "Destinations", "Featured hotels", "Insurance coverage", "Models", "Neighborhoods", "Service catalog", "Shows", "Styles", "Types"].map((ht, idx) => (
                      <option key={idx} value={ht}>{ht}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Values */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-slate-700 font-semibold">Values (Minimum 3 recommended, max 25 chars each)</label>
                {snippetValues.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={25}
                      value={val}
                      onChange={(e) => {
                        const updated = [...snippetValues];
                        updated[idx] = e.target.value;
                        setSnippetValues(updated);
                      }}
                      placeholder={`Value ${idx + 1}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 font-mono w-10 text-right">{val.length}/25</span>
                    {snippetValues.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setSnippetValues(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setSnippetValues(prev => [...prev, ""])}
                  className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline text-xs pt-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add value</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanedVals = snippetValues.map(v => v.trim()).filter(Boolean);
                  if (cleanedVals.length > 0) {
                    setCampaignState(prev => ({
                      ...prev,
                      structuredSnippets: [...(prev.structuredSnippets || []), { header: snippetHeaderType, values: cleanedVals }]
                    }));
                  }
                  setActiveAssetModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
              >
                Save Structured Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── More Asset Types Modal: Lead Forms ── */}
      {activeAssetModal === "LEAD_FORMS" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add a lead form to your campaign</h3>
                <p className="text-[11px] text-slate-500">Collect qualified leads directly when people interact with your ads.</p>
              </div>
              <button type="button" onClick={() => setActiveAssetModal(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs">Form details</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Headline (max 30)</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={lfHeadline}
                    onChange={(e) => setLfHeadline(e.target.value)}
                    placeholder="e.g. Get a Free Consultation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Business name (max 25)</label>
                  <input
                    type="text"
                    maxLength={25}
                    value={lfBusinessName}
                    onChange={(e) => setLfBusinessName(e.target.value)}
                    placeholder={campaignState.businessName || "Your Company"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description (max 200)</label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    value={lfDescription}
                    onChange={(e) => setLfDescription(e.target.value)}
                    placeholder="Fill out the form below and our specialists will reach out to you within 24 hours."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Privacy Policy URL</label>
                  <input
                    type="url"
                    value={lfPrivacyPolicyUrl}
                    onChange={(e) => setLfPrivacyPolicyUrl(e.target.value)}
                    placeholder={campaignState.website ? `${campaignState.website}/privacy` : "https://example.com/privacy"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Contact Questions checkboxes */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <h5 className="font-semibold text-slate-700">Contact information fields</h5>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(lfContactFields).map((field) => (
                    <label key={field} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white">
                      <input
                        type="checkbox"
                        checked={lfContactFields[field]}
                        onChange={(e) => setLfContactFields(prev => ({ ...prev, [field]: e.target.checked }))}
                        className="rounded text-indigo-600 h-3.5 w-3.5"
                      />
                      <span className="text-slate-800 font-medium text-[11px]">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const newLeadForm = {
                    headline: lfHeadline.trim() || "Contact Our Team",
                    businessName: lfBusinessName.trim() || campaignState.businessName || "Business",
                    description: lfDescription.trim() || "We will contact you soon.",
                    privacyPolicyUrl: lfPrivacyPolicyUrl.trim() || (campaignState.website ? `${campaignState.website}/privacy` : "https://example.com/privacy"),
                    callToActionType: lfAdCta,
                    postSubmitHeadline: lfSubHeadline,
                    postSubmitDescription: lfSubDescription
                  };
                  setCampaignState(prev => ({
                    ...prev,
                    leadForms: [...(prev.leadForms || []), newLeadForm]
                  }));
                  setActiveAssetModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
              >
                Save Lead Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── More Asset Types Modal: Callouts ── */}
      {activeAssetModal === "BRAND_GUIDELINES" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add callouts to your campaign</h3>
                <p className="text-[11px] text-slate-500">Highlight unique selling points (e.g. Free Shipping, 24/7 Support, Verified Quality) in your ads.</p>
              </div>
              <button type="button" onClick={() => setActiveAssetModal(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800">Add callout text (max 25 characters each)</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={25}
                    placeholder="e.g. Free Shipping Over ₹999"
                    value={newCalloutInput}
                    onChange={(e) => setNewCalloutInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newCalloutInput.trim()) {
                        e.preventDefault();
                        setModalCalloutTexts(prev => [...prev, newCalloutInput.trim()]);
                        setNewCalloutInput("");
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCalloutInput.trim()) {
                        setModalCalloutTexts(prev => [...prev, newCalloutInput.trim()]);
                        setNewCalloutInput("");
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-all"
                  >
                    Add
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{newCalloutInput.length} / 25 characters</span>
              </div>

              {/* Callouts to be added */}
              {modalCalloutTexts.length > 0 && (
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Callouts ready to add:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {modalCalloutTexts.map((txt, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium">
                        <span>{txt}</span>
                        <button
                          type="button"
                          onClick={() => setModalCalloutTexts(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  let finalCallouts = [...modalCalloutTexts];
                  if (newCalloutInput.trim()) {
                    finalCallouts.push(newCalloutInput.trim());
                  }
                  if (finalCallouts.length > 0) {
                    setCampaignState(prev => ({
                      ...prev,
                      callouts: Array.from(new Set([...(prev.callouts || []), ...finalCallouts]))
                    }));
                  }
                  setModalCalloutTexts([]);
                  setNewCalloutInput("");
                  setActiveAssetModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-all shadow-xs"
              >
                Save Callouts
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
