"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle, Plus, Trash2, PhoneCall,
  Sparkles, Layers, Target, Search, Video, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3, Bell, SlidersHorizontal, BarChart3, Link as LinkIcon
} from "lucide-react";

interface ObjectiveOption {
  id: string;
  title: string;
  desc: string;
  badge?: string;
}

const OBJECTIVES: ObjectiveOption[] = [
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

interface CampaignTypeOption {
  id: string;
  title: string;
  desc: string;
  icon: any;
}

const CAMPAIGN_TYPES_SALES: CampaignTypeOption[] = [
  {
    id: "PERFORMANCE_MAX",
    title: "Performance Max",
    desc: "Drive sales by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more",
    icon: Sparkles,
  },
  {
    id: "SEARCH",
    title: "Search",
    desc: "Drive sales on Google Search with text ads",
    icon: Search,
  },
  {
    id: "DEMAND_GEN",
    title: "Demand Gen",
    desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads",
    icon: Zap,
  },
  {
    id: "VIDEO",
    title: "Video",
    desc: "Drive sales on YouTube with your video ads",
    icon: Video,
  },
  {
    id: "DISPLAY",
    title: "Display",
    desc: "Reach potential customers across 3 million sites and apps with your creative",
    icon: LayoutGrid,
  },
  {
    id: "SHOPPING",
    title: "Shopping",
    desc: "Promote your products from Merchant Center on Google Search with Shopping ads",
    icon: ShoppingBag,
  },
];

const CAMPAIGN_TYPES_LEADS: CampaignTypeOption[] = [
  {
    id: "PERFORMANCE_MAX",
    title: "Performance Max",
    desc: "Generate leads by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more",
    icon: Sparkles,
  },
  {
    id: "SEARCH",
    title: "Search",
    desc: "Generate leads on Google Search with text ads",
    icon: Search,
  },
  {
    id: "DEMAND_GEN",
    title: "Demand Gen",
    desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads",
    icon: Zap,
  },
  {
    id: "VIDEO",
    title: "Video",
    desc: "Generate leads on YouTube with your video ads",
    icon: Video,
  },
  {
    id: "DISPLAY",
    title: "Display",
    desc: "Reach potential customers across 3 million sites and apps with your creative",
    icon: LayoutGrid,
  },
  {
    id: "SHOPPING",
    title: "Shopping",
    desc: "Promote your products from Merchant Center on Google Search with Shopping ads",
    icon: ShoppingBag,
  },
];

const CAMPAIGN_TYPES_TRAFFIC: CampaignTypeOption[] = [
  {
    id: "SEARCH",
    title: "Search",
    desc: "Get website traffic with text ads",
    icon: Search,
  },
  {
    id: "PERFORMANCE_MAX",
    title: "Performance Max",
    desc: "Get website traffic by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more",
    icon: Sparkles,
  },
  {
    id: "DEMAND_GEN",
    title: "Demand Gen",
    desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads",
    icon: Zap,
  },
  {
    id: "DISPLAY",
    title: "Display",
    desc: "Reach potential customers across 3 million sites and apps with your creative",
    icon: LayoutGrid,
  },
  {
    id: "SHOPPING",
    title: "Shopping",
    desc: "Promote your products from Merchant Center on Google Search with Shopping ads",
    icon: ShoppingBag,
  },
  {
    id: "VIDEO",
    title: "Video",
    desc: "Reach and engage viewers on YouTube and across the web",
    icon: Video,
  },
];

const CAMPAIGN_TYPES_APP: CampaignTypeOption[] = [
  {
    id: "APP",
    title: "App",
    desc: "Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads",
    icon: Smartphone,
  },
];

const CAMPAIGN_TYPES_LOCAL: CampaignTypeOption[] = [
  {
    id: "PERFORMANCE_MAX",
    title: "Performance Max",
    desc: "Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more",
    icon: Sparkles,
  },
];

const CAMPAIGN_TYPES_NO_GUIDANCE: CampaignTypeOption[] = [
  {
    id: "PERFORMANCE_MAX",
    title: "Performance Max",
    desc: "Reach the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more",
    icon: Sparkles,
  },
  {
    id: "SEARCH",
    title: "Search",
    desc: "Drive action on Google Search with text ads",
    icon: Search,
  },
  {
    id: "DEMAND_GEN",
    title: "Demand Gen",
    desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads",
    icon: Zap,
  },
  {
    id: "DISPLAY",
    title: "Display",
    desc: "Reach potential customers across 3 million sites and apps with your creative",
    icon: LayoutGrid,
  },
  {
    id: "SHOPPING",
    title: "Shopping",
    desc: "Promote your products from Merchant Center on Google Search with Shopping ads",
    icon: ShoppingBag,
  },
  {
    id: "VIDEO",
    title: "Video",
    desc: "Drive action on YouTube with your video ads",
    icon: Video,
  },
  {
    id: "APP",
    title: "App",
    desc: "Promote your Android or iOS app on Google Search, Play, YouTube and partner sites with app ads",
    icon: Smartphone,
  },
];

export default function CampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";

  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [campaignName, setCampaignName] = useState<string>("Sales-Performance Max-1");

  // Search Reach Goals State
  const [websiteVisitsUrl, setWebsiteVisitsUrl] = useState<string>("");
  const [selectedReachGoals, setSelectedReachGoals] = useState<string[]>(["website_visits"]);

  // Demand Gen Custom Form States
  const getTodayFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [demandGenCampaignName, setDemandGenCampaignName] = useState<string>(`Demand Gen - ${getTodayFormattedDate()}`);
  const [demandGenGoal, setDemandGenGoal] = useState<"Conversions" | "Clicks" | "Conversion value" | "YouTube engagements">("Conversions");
  const [includeViewThrough, setIncludeViewThrough] = useState<boolean>(false);
  const [targetCpaDemandGen, setTargetCpaDemandGen] = useState<boolean>(false);
  const [demandGenBudgetType, setDemandGenBudgetType] = useState<string>("Daily");
  const [demandGenBudgetAmount, setDemandGenBudgetAmount] = useState<string>("");
  const [mainBrandColor, setMainBrandColor] = useState<string>("");
  const [accentBrandColor, setAccentBrandColor] = useState<string>("");
  const [brandFont, setBrandFont] = useState<string>("Any font");
  const [ipExclusionsText, setIpExclusionsText] = useState<string>("");

  // Selected State
  const [selectedObjective, setSelectedObjective] = useState<string>("SALES");
  const [conversionGoals, setConversionGoals] = useState([
    { id: "phone_leads", name: "Phone call leads (account default)", source: "Call from Ads", count: "1 action", icon: PhoneCall }
  ]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [appSubtype, setAppSubtype] = useState<"installs" | "engagement" | "preregistration">("installs");
  const [videoGoal, setVideoGoal] = useState<"views" | "reach" | "subscriptions">("views");
  const [videoContinuedToShowForm, setVideoContinuedToShowForm] = useState<boolean>(false);
  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Flow step management
  const [wizardStep, setWizardStep] = useState<"OBJECTIVE" | "BIDDING" | "CAMPAIGN_SETTINGS" | "KEYWORDS_ADS" | "ASSET_GROUP" | "BUDGET" | "SUMMARY">("OBJECTIVE");

  // Bidding Step Form State
  const [biddingFocus, setBiddingFocus] = useState<"Conversions" | "Conversion value">("Conversions");
  const [setTargetCpa, setSetTargetCpa] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("");
  const [onlyNewCustomers, setOnlyNewCustomers] = useState<boolean>(false);
  const [adjustLapsedCustomers, setAdjustLapsedCustomers] = useState<boolean>(false);

  // Campaign Settings Form State
  const [searchPartnersNetwork, setSearchPartnersNetwork] = useState<boolean>(true);
  const [displayNetwork, setDisplayNetwork] = useState<boolean>(true);
  const [locationOption, setLocationOption] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationText, setCustomLocationText] = useState<string>("");
  const [targetLocations, setTargetLocations] = useState<Array<{ name: string; type: string; reach: string }>>([
    { name: "Mumbai, Maharashtra, India", type: "City", reach: "21,400,000" }
  ]);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ name: string; type: string; reach: string }>>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState<boolean>(false);
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);
  const [locationIncludeOption, setLocationIncludeOption] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [audienceTab, setAudienceTab] = useState<"SEARCH" | "BROWSE">("SEARCH");
  const [languageSearchInput, setLanguageSearchInput] = useState<string>("");
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [audienceSegments, setAudienceSegments] = useState<string[]>([]);
  const [audienceSearchInput, setAudienceSearchInput] = useState<string>("");
  const [targetingSetting, setTargetingSetting] = useState<"OBSERVATION" | "TARGETING">("OBSERVATION");
  const [adRotation, setAdRotation] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">("OPTIMIZE");
  const [showMoreSettings, setShowMoreSettings] = useState<boolean>(false);

  // AI Max Form States
  const [optimizeWithAiMax, setOptimizeWithAiMax] = useState<boolean>(true);
  const [textCustomization, setTextCustomization] = useState<boolean>(true);
  const [finalUrlExpansion, setFinalUrlExpansion] = useState<boolean>(true);
  const [brandInclusions, setBrandInclusions] = useState<string[]>([]);
  const [brandExclusions, setBrandExclusions] = useState<string[]>([]);
  const [brandInclusionInput, setBrandInclusionInput] = useState<string>("");
  const [brandExclusionInput, setBrandExclusionInput] = useState<string>("");
  // AI Max Ad Group Level States
  const [useSearchTermMatching, setUseSearchTermMatching] = useState<boolean>(true);
  const [adGroupBrandInclusions, setAdGroupBrandInclusions] = useState<string[]>([]);
  const [locationsOfInterest, setLocationsOfInterest] = useState<string[]>([]);
  const [locationOfInterestInput, setLocationOfInterestInput] = useState<string>("");
  const [showUrlInclusionsModal, setShowUrlInclusionsModal] = useState<boolean>(false);
  const [urlInclusionsTab, setUrlInclusionsTab] = useState<"URLs" | "CUSTOM_LABELS" | "RULES">("URLs");
  const [urlInclusionsInput, setUrlInclusionsInput] = useState<string>("");
  const [savedUrlInclusions, setSavedUrlInclusions] = useState<string[]>([]);
  // Keyword & Asset Generation State
  const [keywordAssetGenerationUrl, setKeywordAssetGenerationUrl] = useState<string>("");
  const [isGeneratingKeywordAssets, setIsGeneratingKeywordAssets] = useState<boolean>(false);
  // Sitelink Modal & Ad URL Options State
  const [showSitelinksModal, setShowSitelinksModal] = useState<boolean>(false);
  const [activeSitelinkIndex, setActiveSitelinkIndex] = useState<number>(0);
  const [sitelinkItems, setSitelinkItems] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([
    { text: "Json Formatter", desc1: "Fast online json tool", desc2: "Format and validate json", url: "https://example.com/json" },
    { text: "Find Comparison", desc1: "Compare products", desc2: "Best features comparison", url: "https://example.com/compare" },
    { text: "Contact Us", desc1: "Get in touch today", desc2: "24/7 customer support", url: "https://example.com/contact" },
    { text: "For Junior Employees", desc1: "Starter guides", desc2: "Onboarding resources", url: "https://example.com/junior" },
    { text: "View Benefits", desc1: "Explore all perks", desc2: "Exclusive features", url: "https://example.com/benefits" },
    { text: "Read The FAQs", desc1: "Frequently asked questions", desc2: "Help and docs", url: "https://example.com/faqs" }
  ]);
  const [sitelinkTrackingTemplate, setSitelinkTrackingTemplate] = useState<string>("");
  const [sitelinkFinalUrlSuffix, setSitelinkFinalUrlSuffix] = useState<string>("");
  const [useMobileFinalUrlAd, setUseMobileFinalUrlAd] = useState<boolean>(false);
  const [mobileFinalUrlAd, setMobileFinalUrlAd] = useState<string>("");
  const [adTrackingTemplate, setAdTrackingTemplate] = useState<string>("");
  const [adFinalUrlSuffix, setAdFinalUrlSuffix] = useState<string>("");
  const [showCallsModal, setShowCallsModal] = useState<boolean>(false);
  const [callsCountry, setCallsCountry] = useState<string>("United States");
  const [callsPhoneNumber, setCallsPhoneNumber] = useState<string>("");
  const [callsConversionAction, setCallsConversionAction] = useState<string>("Use account settings (Calls from ads)");
  const [showCallsAdvancedOptions, setShowCallsAdvancedOptions] = useState<boolean>(false);
  const [campaignCallsList, setCampaignCallsList] = useState<string[]>(["+91 6587355041"]);

  // Asset Modals Visibility States
  const [showPromotionsModal, setShowPromotionsModal] = useState<boolean>(false);
  const [showPricesModal, setShowPricesModal] = useState<boolean>(false);
  const [showMessagesModal, setShowMessagesModal] = useState<boolean>(false);
  const [showSnippetsModal, setShowSnippetsModal] = useState<boolean>(false);
  const [showLeadFormsModal, setShowLeadFormsModal] = useState<boolean>(false);
  const [showAppsModal, setShowAppsModal] = useState<boolean>(false);

  // Asset Forms States
  const [promoOccasion, setPromoOccasion] = useState<string>("None");
  const [promoLanguage, setPromoLanguage] = useState<string>("English");
  const [promoCurrency, setPromoCurrency] = useState<string>("USD");
  const [promoType, setPromoType] = useState<string>("Monetary discount");
  const [promoItem, setPromoItem] = useState<string>("");
  const [promoFinalUrl, setPromoFinalUrl] = useState<string>("");
  const [promoDetails, setPromoDetails] = useState<string>("None");
  const [promoStartDate, setPromoStartDate] = useState<string>("");
  const [promoEndDate, setPromoEndDate] = useState<string>("");

  const [priceLanguage, setPriceLanguage] = useState<string>("English");
  const [priceType, setPriceType] = useState<string>("Brands");
  const [priceCurrency, setPriceCurrency] = useState<string>("USD");
  const [priceQualifier, setPriceQualifier] = useState<string>("No qualifier");

  const [snippetHeader, setSnippetHeader] = useState<string>("Select header type");
  const [snippetValues, setSnippetValues] = useState<string[]>(["", "", ""]);

  const [leadHeadline, setLeadHeadline] = useState<string>("");
  const [leadBusinessName, setLeadBusinessName] = useState<string>("");
  const [leadDescription, setLeadDescription] = useState<string>("");
  const [leadThankYouHeadline, setLeadThankYouHeadline] = useState<string>("Thank you.");
  const [leadThankYouDesc, setLeadThankYouDesc] = useState<string>("We'll contact you soon.");
  const [leadCtaType, setLeadCtaType] = useState<string>("Learn more");
  const [leadCtaDesc, setLeadCtaDesc] = useState<string>("");
  const [leadPrivacyUrl, setLeadPrivacyUrl] = useState<string>("");

  const [appPlatform, setAppPlatform] = useState<"Android" | "iOS">("Android");
  const [appNameInput, setAppNameInput] = useState<string>("");
  const [appLinkText, setAppLinkText] = useState<string>("");

  // Ad schedule dynamic rows state
  const [adSchedules, setAdSchedules] = useState<Array<{ id: string; day: string; startTime: string; endTime: string }>>([
    { id: "1", day: "ALL", startTime: "00:00", endTime: "00:00" }
  ]);

  // More Settings Form States
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDateValue, setStartDateValue] = useState<string>(todayStr);
  const [endDateMode, setEndDateMode] = useState<"NONE" | "SELECT">("NONE");
  const [endDateValue, setEndDateValue] = useState<string>(todayStr);

  const [customParameters, setCustomParameters] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);

  const [showAssetGroupMoreOptions, setShowAssetGroupMoreOptions] = useState<boolean>(true);
  const [promotionsList, setPromotionsList] = useState<string[]>([]);
  const [pricesList, setPricesList] = useState<string[]>([]);
  const [messagesList, setMessagesList] = useState<string[]>([]);
  const [snippetsList, setSnippetsList] = useState<string[]>([]);
  const [leadFormsList, setLeadFormsList] = useState<string[]>([]);
  const [calloutsList, setCalloutsList] = useState<string[]>([]);
  const [videosList, setVideosList] = useState<string[]>([]);
  const [animatedClipsList, setAnimatedClipsList] = useState<string[]>([]);

  const [displayPath1, setDisplayPath1] = useState<string>("");
  const [isEditingOverview, setIsEditingOverview] = useState<boolean>(false);
  const [isEditingBidding, setIsEditingBidding] = useState<boolean>(false);
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);
  const [isEditingAssetGroup, setIsEditingAssetGroup] = useState<boolean>(false);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [displayPath2, setDisplayPath2] = useState<string>("");
  const [useMobileFinalUrl, setUseMobileFinalUrl] = useState<boolean>(false);
  const [mobileFinalUrl, setMobileFinalUrl] = useState<string>("");
  const [assetGroupTrackingTemplate, setAssetGroupTrackingTemplate] = useState<string>("");
  const [assetGroupFinalUrlSuffix, setAssetGroupFinalUrlSuffix] = useState<string>("");
  const [assetGroupCustomParams, setAssetGroupCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "1", name: "", value: "" }
  ]);

  const [showAdditionalSignalsAccordion, setShowAdditionalSignalsAccordion] = useState<boolean>(true);
  const [additionalInterestsInput, setAdditionalInterestsInput] = useState<string>("");
  const [showSavedAudienceModal, setShowSavedAudienceModal] = useState<boolean>(false);
  const [modalAudienceName, setModalAudienceName] = useState<string>("");
  const [modalYourDataSearch, setModalYourDataSearch] = useState<string>("");
  const [modalInterestsSearch, setModalInterestsSearch] = useState<string>("");
  
  // Demographics State
  const [genderFemale, setGenderFemale] = useState<boolean>(true);
  const [genderMale, setGenderMale] = useState<boolean>(true);
  const [genderUnknown, setGenderUnknown] = useState<boolean>(true);

  const [ageMin, setAgeMin] = useState<string>("18");
  const [ageMax, setAgeMax] = useState<string>("65+");
  const [ageUnknown, setAgeUnknown] = useState<boolean>(true);

  const [parentStatusParent, setParentStatusParent] = useState<boolean>(true);
  const [parentStatusNotParent, setParentStatusNotParent] = useState<boolean>(true);
  const [parentStatusUnknown, setParentStatusUnknown] = useState<boolean>(true);

  const [incomeMin, setIncomeMin] = useState<string>("Top 10%");
  const [incomeMax, setIncomeMax] = useState<string>("Lower 50%");
  const [incomeUnknown, setIncomeUnknown] = useState<boolean>(true);

  const [showAddBrandModal, setShowAddBrandModal] = useState<boolean>(false);
  const [termExclusionsInput, setTermExclusionsInput] = useState<string>("");
  const [termExclusions, setTermExclusions] = useState<string[]>([]);
  const [messagingRestrictions, setMessagingRestrictions] = useState<string[]>(["", "", "", "", ""]);

  const [showBrandModal, setShowBrandModal] = useState<boolean>(false);
  const [brandListName, setBrandListName] = useState<string>("");
  const [brandSearchInput, setBrandSearchInput] = useState<string>("");
  const [brandListItems, setBrandListItems] = useState<string[]>([]);
  const [appliedBrandLists, setAppliedBrandLists] = useState<string[]>([]);

  const [turnOnAgeExclusions, setTurnOnAgeExclusions] = useState<boolean>(false);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);

  const [turnOnGenderExclusions, setTurnOnGenderExclusions] = useState<boolean>(false);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  const [enableDataExclusions, setEnableDataExclusions] = useState<boolean>(false);

  // Budget Step State
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [selectedPresetBudget, setSelectedPresetBudget] = useState<string>("5080.90"); // "6097.08" | "5080.90" | "4064.72" | "CUSTOM"
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("4064.72");

  // Asset Group Form State
  const [assetGroupName, setAssetGroupName] = useState<string>("Asset Group 1");
  const [businessName, setBusinessName] = useState<string>("");
  const [assetFinalUrl, setAssetFinalUrl] = useState<string>("");
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  
  const DEFAULT_HEADLINES = [
    "Real-Time GPS Mail Tracking",
    "Smart Web Navigation Apps",
    "Never Lose a Delivery Again",
    "Streamline Your Shipments",
    "Reliable Package Monitoring",
    "Advanced Route Tracking",
    "Innovative Web Software",
    "Get Live Delivery Updates",
    "Try Our JapaTracker App",
    "Upgrade Your Car Navigation",
    "Live GPS Navigation System",
    "Accurate Portable GPS Maps",
    "Advanced Web Applications",
    "Never Get Lost On Drives",
    "Seamless Sat Nav Solutions"
  ];

  const DEFAULT_LONG_HEADLINES = [
    "Never Lose A Package Again: Experience Real-Time GPS Tracking With JapaTracker Software",
    "Streamline Your Delivery Logistics Using Our Advanced Web Application and GPS Technology",
    "Track Shipments Effortlessly: Get The All-In-One Internet Software For Package Management",
    "Optimize Your Fleet & Delivery Routes With Our Powerful Navigation Web Application",
    "Never Lose Your Way Again: Access Reliable Web-Based GPS Navigation Anywhere"
  ];

  const DEFAULT_DESCRIPTIONS = [
    "Boost your delivery efficiency with our advanced GPS and navigation software.",
    "Streamline your logistics. Try our powerful web application for package tracking.",
    "Get precise location updates for all your deliveries. Explore our tools today.",
    "Smart internet software designed to simplify your mail and package tracking.",
    "Ready to upgrade your delivery system? Deploy our custom web apps today."
  ];

  const DEFAULT_SITELINKS = [
    { title: "Json Formatter", desc: "Add a description" },
    { title: "Find Comparison", desc: "Add a description" },
    { title: "Contact Us", desc: "Add a description" },
    { title: "For Junior Employees", desc: "Add a description" },
    { title: "View Benefits", desc: "Add a description" },
    { title: "Read The FAQs", desc: "Add a description" }
  ];

  const [headlines, setHeadlines] = useState<string[]>(["", "", "", "", ""]);
  const [longHeadlines, setLongHeadlines] = useState<string[]>(["", "", "", "", ""]);
  const [descriptions, setDescriptions] = useState<string[]>(["", "", "", "", ""]);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [sitelinks, setSitelinks] = useState(DEFAULT_SITELINKS);
  const [callToAction, setCallToAction] = useState<string>("AUTOMATIC");
  const [searchThemes, setSearchThemes] = useState<string[]>([]);
  const [searchThemeInput, setSearchThemeInput] = useState<string>("");
  const [audienceName, setAudienceName] = useState<string>("");

  // ImageKit Upload & Display State (Images & Logos)
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; name: string }>>([
    { url: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png", name: "Portfolio Hero" },
    { url: "https://ik.imagekit.io/automationjds/sample_seo_growth.png", name: "Showcase Card" }
  ]);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const [uploadedVideos, setUploadedVideos] = useState<Array<{ url: string; name: string }>>([]);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);

  const [uploadedAnimatedClips, setUploadedAnimatedClips] = useState<Array<{ url: string; name: string }>>([]);
  const [isUploadingAnimatedClip, setIsUploadingAnimatedClip] = useState<boolean>(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${BACKEND}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `gads_video_${Date.now()}_${file.name}`,
            fileBase64: base64Data
          })
        });

        const data = await res.json();
        if (data.url) {
          setUploadedVideos(prev => [...prev, { url: data.url, name: file.name }]);
        } else {
          alert("ImageKit Video upload failed: " + (data.message || data.error));
        }
        setIsUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Video upload error:", err);
      alert("Error uploading video to ImageKit");
      setIsUploadingVideo(false);
    }
  };

  const handleAnimatedClipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAnimatedClip(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${BACKEND}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `gads_clip_${Date.now()}_${file.name}`,
            fileBase64: base64Data
          })
        });

        const data = await res.json();
        if (data.url) {
          setUploadedAnimatedClips(prev => [...prev, { url: data.url, name: file.name }]);
        } else {
          alert("ImageKit Clip upload failed: " + (data.message || data.error));
        }
        setIsUploadingAnimatedClip(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Clip upload error:", err);
      alert("Error uploading animated clip to ImageKit");
      setIsUploadingAnimatedClip(false);
    }
  };

  const [uploadedLogos, setUploadedLogos] = useState<Array<{ url: string; name: string }>>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${BACKEND}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `gads_img_${Date.now()}_${file.name}`,
            fileBase64: base64Data
          })
        });

        const data = await res.json();
        if (data.url) {
          setUploadedImages(prev => [...prev, { url: data.url, name: file.name }]);
        } else {
          alert("ImageKit upload failed: " + (data.message || data.error));
        }
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Error uploading image to ImageKit");
      setIsUploadingImage(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedLogos.length >= 5) {
      alert("Maximum 5 logos allowed");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        const res = await fetch(`${BACKEND}/api/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `gads_logo_${Date.now()}_${file.name}`,
            fileBase64: base64Data
          })
        });

        const data = await res.json();
        if (data.url) {
          setUploadedLogos(prev => [...prev, { url: data.url, name: file.name }]);
        } else {
          alert("ImageKit logo upload failed: " + (data.message || data.error));
        }
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Logo upload error:", err);
      alert("Error uploading logo to ImageKit");
      setIsUploadingLogo(false);
    }
  };

  // Conversion Goal modal and action state
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [openGoalMenuId, setOpenGoalMenuId] = useState<string | null>(null);

  const ALL_CONVERSION_GOALS = [
    { id: "phone_leads", name: "Phone call leads (account default)", source: "Call from Ads", count: "1 action", icon: PhoneCall },
    { id: "contacts", name: "Contacts", source: "Website / Form", count: "1 action", icon: Users },
    { id: "get_directions", name: "Get directions", source: "Google Maps / Location", count: "1 action", icon: Target }
  ];

  // Mode: Manual vs AI
  const [creationMode, setCreationMode] = useState<"MANUAL" | "AI">("MANUAL");

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "";
    if (customerId) {
      fetch(`${BACKEND}/api/ads/customer-info?orgId=${encodeURIComponent(orgId)}&customerId=${customerId}`)
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
            onClick={() => router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-sm font-semibold text-slate-900">New Campaign</span>
          </div>
        </div>

        {/* Creation Mode Toggle (Manual vs AI) */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setCreationMode("MANUAL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${creationMode === "MANUAL"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-900"
              }`}
          >
            Manual Creation
          </button>
          <button
            onClick={() => setCreationMode("AI")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${creationMode === "AI"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-900"
              }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Guided
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "Google Ads Account"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-900" />
        </div>
      </header>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      {wizardStep === "BIDDING" ? (
        <div className="flex-1 flex w-full pb-20">
          {/* Left Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/50 hidden md:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Performance Max
              </div>
            </div>

            <nav className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">1</div>
                  Bidding
                </div>
                <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                  <p className="text-blue-600 font-semibold">Bidding</p>
                  <p className="hover:text-slate-900 cursor-pointer">Customer acquisition</p>
                  <p className="hover:text-slate-900 cursor-pointer">Customer retention</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">2</div>
                Campaign settings
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">3</div>
                Asset group
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">4</div>
                Budget
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">5</div>
                Summary
              </div>
            </nav>
          </aside>

          {/* Bidding Step Main Content */}
          <main className="flex-1 p-6 md:p-10 space-y-8 max-w-4xl">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Bidding</h1>

            {/* 1. Bidding Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Bidding</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-700 flex items-center gap-1">
                  What do you want to focus on?
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                </label>
                <select
                  value={biddingFocus}
                  onChange={(e) => setBiddingFocus(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 w-64"
                >
                  <optgroup label="Recommended">
                    <option value="Conversions">Conversions</option>
                    <option value="Conversion value">Conversion value</option>
                  </optgroup>
                  <optgroup label="Other optimization options">
                    <option value="Clicks">Clicks</option>
                    <option value="Impression share">Impression share</option>
                  </optgroup>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setTargetCpa}
                    onChange={(e) => setSetTargetCpa(e.target.checked)}
                    className="rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs text-slate-900 font-medium">Set a target cost per action (optional)</span>
                </label>

                {setTargetCpa && (
                  <div className="mt-3 ml-7 space-y-1">
                    <label className="text-xs text-slate-400 block">Target CPA (Cost Per Action)</label>
                    <div className="relative w-64">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                      <input
                        type="text"
                        value={targetCpaValue}
                        onChange={(e) => setTargetCpaValue(e.target.value)}
                        placeholder="166.11"
                        className="bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Customer Acquisition Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Customer acquisition</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyNewCustomers}
                      onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                      className="rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-900">Only bid for new customers</span>
                  </label>
                  <p className="text-xs text-slate-400 ml-7">
                    Your campaign will be limited to only new customers, regardless of your bid strategy
                  </p>

                  {onlyNewCustomers && (
                    <div className="ml-7 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-semibold text-rose-200 text-sm">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        This campaign will not run.
                      </div>
                      <p className="text-xs text-rose-300/90 leading-relaxed">
                        To fix this campaign, you can either include an audience segment with at least 100 active members in at least one network, or turn off this setting until you have added an eligible audience segment.
                      </p>
                      <button className="text-xs font-bold text-rose-400 hover:underline pt-1 block">
                        Define existing customer list
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-400 max-w-xs leading-relaxed border-l border-slate-200 pl-4">
                  By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers.{" "}
                  <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about customer acquisition</a>
                </div>
              </div>
            </div>

            {/* 3. Customer Retention Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Customer retention</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adjustLapsedCustomers}
                      onChange={(e) => setAdjustLapsedCustomers(e.target.checked)}
                      className="rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-900">Adjust your bidding to help re-engage lapsed customers</span>
                  </label>

                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs flex items-start gap-3">
                    <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                    <p className="leading-relaxed">
                      You can't bid higher for lapsed customers because you don't have a purchase goal in your account. Add a purchase goal to run campaigns that bid higher for specific customer types.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 max-w-xs leading-relaxed border-l border-slate-200 pl-4">
                  By default, your campaign does not adjust bidding to re-engage lapsed customers. However, you can configure your customer acquisition settings to optimize for winning back lapsed customers.{" "}
                  <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about how to re-engage lapsed customers</a>
                </div>
              </div>
            </div>
          </main>

          {/* Right Weekly Estimates Sidebar */}
          <aside className="w-72 border-l border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/40 hidden lg:block">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Campaign optimization score</span>
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 text-white w-full rounded-full"></div>
              </div>
              <p className="text-right text-xs font-bold text-blue-600">100%</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900">Weekly estimates</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Based on your daily budget and bid settings
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Weekly conv.</span>
                  <span className="font-semibold text-slate-900">61</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cost / Conv.</span>
                  <span className="font-semibold text-slate-900">₹166.11</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-400">Weekly cost</span>
                  <span className="font-bold text-blue-600">₹10,199.00</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : wizardStep === "CAMPAIGN_SETTINGS" ? (
        <div className="flex-1 flex w-full pb-20">
          {/* Left Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/50 hidden md:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Performance Max
              </div>
            </div>

            <nav className="space-y-4 text-xs">
              {selectedType === "SEARCH" ? (
                <>
                  <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BIDDING")}>
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                    Bidding
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-blue-600">
                      <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">2</div>
                      Campaign settings
                    </div>
                    <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                      <p className="hover:text-slate-900 cursor-pointer">Network</p>
                      <p className="hover:text-slate-900 cursor-pointer">Locations</p>
                      <p className="hover:text-slate-900 cursor-pointer">Languages</p>
                      <p className="hover:text-slate-900 cursor-pointer">EU political ads</p>
                      <p className="hover:text-slate-900 cursor-pointer">Audiences</p>
                      <p className="hover:text-slate-900 cursor-pointer text-emerald-400 font-medium">AI Max</p>
                      <p className="hover:text-slate-900 cursor-pointer">Keyword and asset generation</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">3</div>
                      Keywords and ads
                    </div>
                    <div className="ml-6 space-y-1 text-slate-500 border-l border-slate-200 pl-3 py-1 text-[11px]">
                      <p className="hover:text-slate-900 cursor-pointer">Keywords</p>
                      <p className="hover:text-slate-900 cursor-pointer text-emerald-400">AI Max</p>
                      <p className="hover:text-slate-900 cursor-pointer">Ads</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BUDGET")}>
                    <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">4</div>
                    Budget
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                    <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">5</div>
                    Review
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BIDDING")}>
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                    Bidding
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-blue-600">
                      <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">2</div>
                      Campaign settings
                    </div>
                    <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                      <p className="hover:text-slate-900 cursor-pointer">Network</p>
                      <p className="text-blue-600 font-semibold">Locations</p>
                      <p className="hover:text-slate-900 cursor-pointer">Languages</p>
                      <p className="hover:text-slate-900 cursor-pointer">EU political ads</p>
                      <p className="hover:text-slate-900 cursor-pointer">Audiences</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">3</div>
                Asset group
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">4</div>
                Budget
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">5</div>
                Summary
              </div>
            </nav>
          </aside>

          {/* Campaign Settings Main Content */}
          <main className="flex-1 p-6 md:p-10 space-y-8 max-w-4xl">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
              <p className="text-xs text-slate-400 mt-1">To reach the right people, start by defining key settings for your campaign</p>
            </div>

            {/* 1. Networks Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Networks</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchPartnersNetwork}
                    onChange={(e) => setSearchPartnersNetwork(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-900 block">
                      Google Search Partners Network <span className="text-slate-400 font-normal">(recommended)</span>
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ads can appear near Google Search results and on other Google Search Partners websites when people search for terms that are relevant to your keywords. Search Partners can include hundreds of non-Google websites, Parked Domains, as well as YouTube and other Google sites.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer border-t border-slate-200 pt-3">
                  <input
                    type="checkbox"
                    checked={displayNetwork}
                    onChange={(e) => setDisplayNetwork(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-900 block">
                      Google Display Network <span className="text-slate-400 font-normal">(recommended)</span>
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Ads can appear on relevant sites, videos, and apps across Google (like YouTube) and the Internet when you have leftover Search budget
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Locations Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Locations</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-700 flex items-center gap-1">
                  Select locations for this campaign
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                </label>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      checked={locationOption === "ALL"}
                      onChange={() => setLocationOption("ALL")}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium text-slate-900">All countries and territories</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      checked={locationOption === "INDIA"}
                      onChange={() => setLocationOption("INDIA")}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium text-slate-900">India</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      checked={locationOption === "CUSTOM"}
                      onChange={() => setLocationOption("CUSTOM")}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium text-slate-900">Enter another location</span>
                  </label>

                  {locationOption === "CUSTOM" && (
                    <div className="ml-7 pt-1 space-y-3 max-w-lg">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={customLocationText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomLocationText(val);
                            if (val.trim().length > 1) {
                              setIsSearchingLocations(true);
                              const LOC_DATABASE = [
                                { name: "Mumbai, Maharashtra, India", type: "City", reach: "21,400,000" },
                                { name: "Delhi, India", type: "Union territory", reach: "32,900,000" },
                                { name: "Bengaluru, Karnataka, India", type: "City", reach: "13,600,000" },
                                { name: "Hyderabad, Telangana, India", type: "City", reach: "10,500,000" },
                                { name: "Pune, Maharashtra, India", type: "City", reach: "7,200,000" },
                                { name: "Ahmedabad, Gujarat, India", type: "City", reach: "8,600,000" },
                                { name: "Chennai, Tamil Nadu, India", type: "City", reach: "11,700,000" },
                                { name: "Kolkata, West Bengal, India", type: "City", reach: "15,100,000" },
                                { name: "Jaipur, Rajasthan, India", type: "City", reach: "4,100,000" },
                                { name: "Surat, Gujarat, India", type: "City", reach: "6,500,000" },
                                { name: "United States", type: "Country", reach: "331,000,000" },
                                { name: "United Kingdom", type: "Country", reach: "67,000,000" },
                                { name: "California, United States", type: "State", reach: "39,000,000" },
                                { name: "London, England, United Kingdom", type: "City", reach: "8,900,000" }
                              ];
                              const matches = LOC_DATABASE.filter(loc => loc.name.toLowerCase().includes(val.toLowerCase()));
                              setLocationSuggestions(matches);
                            } else {
                              setLocationSuggestions([]);
                              setIsSearchingLocations(false);
                            }
                          }}
                          placeholder="Enter a location to target or exclude (e.g. Mumbai, Maharashtra, India)"
                          className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                        />
                      </div>

                      {/* Location Suggestions Dropdown List */}
                      {locationSuggestions.length > 0 && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 animate-in fade-in duration-200 max-h-60 overflow-y-auto shadow-2xl z-30">
                          <p className="text-[11px] text-slate-400 font-semibold px-2 py-1">Matching locations:</p>
                          {locationSuggestions.map((loc) => (
                            <div
                              key={loc.name}
                              className="p-2.5 rounded-lg hover:bg-white flex items-center justify-between text-xs transition-all border border-transparent hover:border-slate-200"
                            >
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-900">{loc.name}</p>
                                <p className="text-[11px] text-slate-400">{loc.type} • Reach: {loc.reach}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (!targetLocations.some(l => l.name === loc.name)) {
                                      setTargetLocations(prev => [...prev, loc]);
                                    }
                                    setCustomLocationText("");
                                    setLocationSuggestions([]);
                                  }}
                                  className="px-2.5 py-1 rounded bg-blue-600 text-white/10 border border-blue-500/30 text-blue-600 font-semibold text-[11px] hover:bg-blue-600 text-white/20 transition-all cursor-pointer"
                                >
                                  Target
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Targeted Locations List */}
                      {targetLocations.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] text-slate-400 font-semibold">Matched and targeted locations:</p>
                          <div className="space-y-1.5">
                            {targetLocations.map((loc) => (
                              <div key={loc.name} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                                <div>
                                  <span className="font-semibold text-slate-900">{loc.name}</span>
                                  <span className="text-slate-500 text-[11px] block">{loc.type} • {loc.reach} reach</span>
                                </div>
                                <button
                                  onClick={() => setTargetLocations(prev => prev.filter(l => l.name !== loc.name))}
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white rounded transition-all"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowLocationOptions(!showLocationOptions)}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
                    Location options
                  </button>

                  {showLocationOptions && (
                    <div className="mt-3 space-y-3 pl-2 animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                          Include <HelpCircle className="h-3 w-3 text-slate-500" />
                        </label>
                        <div className="space-y-2 pl-1">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="locInclude"
                              checked={locationIncludeOption === "PRESENCE_INTEREST"}
                              onChange={() => setLocationIncludeOption("PRESENCE_INTEREST")}
                              className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-xs text-slate-700">
                              Presence or interest: People in, regularly in, or who've shown interest in your included locations (recommended)
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="locInclude"
                              checked={locationIncludeOption === "PRESENCE"}
                              onChange={() => setLocationIncludeOption("PRESENCE")}
                              className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-xs text-slate-700">
                              Presence: People in or regularly in your included locations
                            </span>
                          </label>
                        </div>
                      </div>

                      {euPoliticalAds === "YES" && (
                        <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs flex items-start gap-2.5">
                          <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                          <p className="leading-relaxed">
                            Your campaign can't run in the EU because it has EU political ads.{" "}
                            <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about the EU political ad policy</a>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Languages Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Languages</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-700 flex items-center gap-1">
                  Select the languages your customers speak.
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                </label>

                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={languageSearchInput}
                    onChange={(e) => setLanguageSearchInput(e.target.value)}
                    placeholder="Start typing or select a language"
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                  />
                </div>

                {/* Popular Languages Checkbox List */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-md space-y-2 max-h-52 overflow-y-auto">
                  <p className="text-[11px] text-slate-400 font-semibold mb-1">Select languages:</p>
                  {[
                    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu",
                    "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German",
                    "Chinese (simplified)", "Japanese", "Arabic", "Portuguese", "Russian"
                  ]
                    .filter(lang => lang.toLowerCase().includes(languageSearchInput.toLowerCase()))
                    .map((lang) => {
                      const isChecked = selectedLanguages.includes(lang);
                      return (
                        <label key={lang} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white cursor-pointer text-xs transition-all">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLanguages(prev => [...prev, lang]);
                              } else {
                                setSelectedLanguages(prev => prev.filter(l => l !== lang));
                              }
                            }}
                            className="rounded bg-white border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className={`font-medium ${isChecked ? "text-blue-600 font-semibold" : "text-slate-900"}`}>{lang}</span>
                        </label>
                      );
                    })}
                </div>

                {/* Selected Languages Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Selected ({selectedLanguages.length}):</span>
                  {selectedLanguages.map((lang) => (
                    <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white/10 border border-blue-500/30 text-xs text-blue-600 font-medium">
                      {lang}
                      <button
                        onClick={() => setSelectedLanguages(prev => prev.filter(l => l !== lang))}
                        className="hover:text-rose-400 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. EU Political Ads Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">EU political ads</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900">Does your campaign have European Union political ads?</p>
                    <span className="text-[10px] text-rose-400 font-semibold uppercase">Required</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="euPolitical"
                        checked={euPoliticalAds === "YES"}
                        onChange={() => setEuPoliticalAds("YES")}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-slate-900">Yes, this campaign has EU political ads</span>

                        {euPoliticalAds === "YES" && (
                          <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs space-y-1 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 font-semibold text-blue-200">
                              <Info className="h-4 w-4 text-blue-400 shrink-0" />
                              Your campaign can't run in the European Union
                            </div>
                            <p className="text-xs text-blue-300/90 leading-relaxed pl-6">
                              Google Ads doesn't allow campaigns with EU political ads to run in the EU. You can still run your campaign in other regions.{" "}
                              <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about the EU political ads policy</a>
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer pt-1">
                      <input
                        type="radio"
                        name="euPolitical"
                        checked={euPoliticalAds === "NO"}
                        onChange={() => setEuPoliticalAds("NO")}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-xs font-medium text-slate-900">No, this campaign doesn't have EU political ads</span>
                    </label>
                  </div>
                </div>

                <div className="text-xs text-slate-400 max-w-xs leading-relaxed border-l border-slate-200 pl-4 space-y-1">
                  <p>EU regulation requires Google to ask this question</p>
                  <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline block">Learn how an EU political ad is defined</a>
                </div>
              </div>
            </div>

            {/* 4. Audience Segments Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Audience segments</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-700">
                    Select audience segments to add to your campaign. You can create new Your data segments by clicking on <span className="text-blue-600 font-semibold cursor-pointer">+ New segment</span> in the Search tab.
                  </p>
                </div>

                <div className="flex items-center gap-4 border-b border-slate-200 pb-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAudienceTab("SEARCH")}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${audienceTab === "SEARCH" ? "border-blue-500 text-blue-600 font-bold" : "border-transparent text-slate-400 hover:text-slate-900"}`}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceTab("BROWSE")}
                    className={`pb-2 border-b-2 transition-all cursor-pointer ${audienceTab === "BROWSE" ? "border-blue-500 text-blue-600 font-bold" : "border-transparent text-slate-400 hover:text-slate-900"}`}
                  >
                    Browse
                  </button>
                </div>

                {audienceTab === "SEARCH" ? (
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={audienceSearchInput}
                      onChange={(e) => setAudienceSearchInput(e.target.value)}
                      placeholder='Try "beauty & wellness"'
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 max-w-md">
                    {[
                      { category: "Who they are", desc: "(Detailed demographics)", items: ["Marital Status", "Education", "Homeownership", "Employment"] },
                      { category: "What their interests and habits are", desc: "(Affinity)", items: ["Banking & Finance", "Beauty & Wellness", "Food & Dining", "Technology", "Travel"] },
                      { category: "What they are actively researching or planning", desc: "(In-market)", items: ["Apparel & Accessories", "Autos & Vehicles", "Business Services", "Software & Cloud"] },
                      { category: "How they have interacted with your business", desc: "(Your data segments)", items: ["Website Visitors", "App Users", "Customer Lists"] },
                      { category: "Your combined audience segments", desc: "(Combined segments)", items: ["Custom Combined Segment 1"] },
                    ].map((browseGroup, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                        <div className="flex items-center justify-between cursor-pointer">
                          <div>
                            <span className="text-xs font-semibold text-slate-900 block">{browseGroup.category}</span>
                            <span className="text-[11px] text-slate-400 block">{browseGroup.desc}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200">
                          {browseGroup.items.map(item => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (!audienceSegments.includes(item)) setAudienceSegments(prev => [...prev, item]);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:text-blue-600 hover:border-blue-500/50 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3 text-blue-600" /> {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {audienceSearchInput && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-md space-y-1 animate-in fade-in duration-200">
                    <p className="text-[11px] text-slate-400">Search results for "{audienceSearchInput}":</p>
                    {["Beauty & Personal Care", "Wellness & Fitness Enthusiasts", "Online Shoppers"].filter(s => s.toLowerCase().includes(audienceSearchInput.toLowerCase())).map((seg) => (
                      <div
                        key={seg}
                        onClick={() => {
                          if (!audienceSegments.includes(seg)) setAudienceSegments(prev => [...prev, seg]);
                          setAudienceSearchInput("");
                        }}
                        className="p-2 rounded-lg hover:bg-white cursor-pointer text-xs text-slate-900 flex items-center justify-between"
                      >
                        <span>{seg}</span>
                        <Plus className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}

                {audienceSegments.length === 0 ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <p className="text-xs font-semibold text-slate-700">None selected</p>
                    <p className="text-xs text-slate-400">Select one or more segments to observe.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {audienceSegments.map((seg) => (
                      <span key={seg} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900">
                        {seg}
                        <button onClick={() => setAudienceSegments(prev => prev.filter(s => s !== seg))}>
                          <X className="h-3 w-3 hover:text-rose-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Targeting setting for this campaign</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-200 transition-all">
                      <input
                        type="radio"
                        name="targetingOption"
                        checked={targetingSetting === "TARGETING"}
                        onChange={() => setTargetingSetting("TARGETING")}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">Targeting</span>
                        <span className="text-[11px] text-slate-400 block">Narrow the reach of your campaign to the selected segments, with the option to adjust the bids</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-200 transition-all">
                      <input
                        type="radio"
                        name="targetingOption"
                        checked={targetingSetting === "OBSERVATION"}
                        onChange={() => setTargetingSetting("OBSERVATION")}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">Observation (recommended)</span>
                        <span className="text-[11px] text-slate-400 block">Don't narrow the reach of your campaign, with the option to adjust the bids on the selected segments</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. AI Max Card (Search Only) */}
            {selectedType === "SEARCH" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">AI Max for Search campaigns</h2>
                </div>

                {/* AI Max Banner Header */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">Get the best AI-powered performance on Google Search</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Advertisers that activate AI Max in Search Campaigns will typically see 14% more conversions or conversion value at a similar CPA / ROAS.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs text-slate-700">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-900">Engage more customers and boost performance.</strong> Easily expand your keywords with broad match technology and let Google AI match content from your landing pages and assets to help you show up on more relevant searches. New ad group settings help you guide which customers you reach.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <SlidersHorizontal className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-900">Tailor your ads and keep them fresh.</strong> Use Google AI to serve the most relevant ad copy and landing pages to each customer based on their unique interest and intent.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-900">Take charge and understand how the newest and best Google AI is working for you.</strong> You'll get new actionable insights in search term reports that show how AI Max improves performance.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <a href="#" onClick={e => e.preventDefault()} className="text-xs text-blue-600 font-semibold hover:underline">Learn more</a>
                  </div>
                </div>

                {/* Main Toggle Switch */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optimizeWithAiMax}
                      onChange={(e) => setOptimizeWithAiMax(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 text-white"></div>
                  </label>
                  <span className="text-xs font-semibold text-slate-900">Optimize your campaign with AI Max</span>
                </div>

                {optimizeWithAiMax && (
                  <div className="space-y-6 pt-2 animate-in fade-in duration-200">
                    {/* Asset Optimization Section */}
                    <div className="border border-slate-200 rounded-2xl bg-slate-50/40 p-5 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-semibold text-slate-900">Asset optimization</h3>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>

                      {/* 1. Text customization */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={textCustomization}
                              onChange={(e) => setTextCustomization(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 text-white"></div>
                          </label>
                          <span className="text-xs font-semibold text-slate-900">Text customization</span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed pl-12">
                          Match your ad copy to what people are searching for with new headlines and descriptions using your website and assets. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about text customization</a>
                        </p>

                        <div className="flex items-center gap-4 text-xs font-semibold text-blue-600 pl-12">
                          <button onClick={() => alert("Text guidelines modal")} className="hover:underline cursor-pointer">Add text guidelines</button>
                          <button onClick={() => alert("Asset examples modal")} className="hover:underline cursor-pointer">View asset examples</button>
                        </div>

                        {/* Text Customization Visual Example */}
                        <div className="ml-12 p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                            {/* Left Input Mock */}
                            <div className="w-full md:w-5/12 space-y-2">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400">
                                <Search className="h-3.5 w-3.5" />
                                <span>Blue wall paint delivery</span>
                              </div>
                              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div className="text-[10px] text-slate-500">Sponsored result</div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                  <span>Beahm's https://www.beahms.com/</span>
                                </div>
                                <div className="text-blue-600 font-medium text-xs">Blue Paint Colors | Expert Picks</div>
                                <p className="text-[11px] text-slate-500">Make your house a home with our range of painting and decorating essentials.</p>
                              </div>
                            </div>

                            {/* Arrow Indicator */}
                            <div className="text-blue-600 font-bold text-lg hidden md:block">»</div>

                            {/* Right Output Mock */}
                            <div className="w-full md:w-6/12 space-y-2">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold">
                                <Search className="h-3.5 w-3.5 text-blue-600" />
                                <span>Blue wall paint delivery</span>
                              </div>
                              <div className="p-3 rounded-lg bg-slate-50 border border-blue-500/40 text-xs space-y-1">
                                <div className="text-[10px] text-slate-500">Sponsored result</div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                  <span>Beahm's https://www.beahms.com/</span>
                                </div>
                                <div className="text-blue-600 font-bold text-xs">Blue Wall Paint, Next-Day Delivery | Expert Picks</div>
                                <p className="text-[11px] text-slate-400">Make your house a home with our range of painting and decorating essentials.</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 text-center pt-1">Example of text customization</p>
                        </div>
                      </div>

                      {/* 2. Final URL expansion */}
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={finalUrlExpansion}
                              onChange={(e) => setFinalUrlExpansion(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 text-white"></div>
                          </label>
                          <span className="text-xs font-semibold text-slate-900">Final URL expansion</span>
                        </div>

                        <div className="pl-12 space-y-1.5">
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Direct people to the most relevant content by matching your landing pages with user searches. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about Final URL expansion</a>
                          </p>
                          <p className="text-[11px] text-slate-500">Requires text customization to be turned on to ensure ad copy matches landing page</p>
                        </div>

                        <div className="pl-12">
                          <button onClick={() => alert("URL exclusions modal")} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">Add URL exclusions</button>
                        </div>

                        {/* Final URL Expansion Visual Example */}
                        <div className="ml-12 p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                            {/* Left Input Mock */}
                            <div className="w-full md:w-5/12 space-y-2">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-400">
                                <Search className="h-3.5 w-3.5" />
                                <span>Blue wall paint delivery</span>
                              </div>
                              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div className="text-[10px] text-slate-500">Sponsored result</div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                  <span>Beahm's https://www.beahms.com/</span>
                                </div>
                                <div className="text-blue-600 font-medium text-xs">Blue Paint Colors | Expert Picks</div>
                              </div>
                            </div>

                            {/* Arrow Indicator */}
                            <div className="text-blue-600 font-bold text-lg hidden md:block">»</div>

                            {/* Right Output Mock */}
                            <div className="w-full md:w-6/12 space-y-2">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold">
                                <Search className="h-3.5 w-3.5 text-blue-600" />
                                <span>Blue wall paint delivery</span>
                              </div>
                              <div className="p-3 rounded-lg bg-slate-50 border border-blue-500/40 text-xs space-y-1">
                                <div className="text-[10px] text-slate-500">Sponsored result</div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                  <span>Beahm's https://www.beahms.com/<strong className="text-blue-600">paint/blue</strong></span>
                                </div>
                                <div className="text-blue-600 font-bold text-xs">Blue Wall Paint, Next-Day Delivery | Expert Picks</div>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 text-center pt-1">Example of Final URL expansion</p>
                        </div>
                      </div>
                    </div>

                    {/* Brands Section */}
                    <div className="border border-slate-200 rounded-2xl bg-slate-50/40 p-5 space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-semibold text-slate-900">Brands</h3>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        Use brand settings to ensure your campaign meets your branded traffic needs. You can add up to 20 brand lists across your brand inclusions and exclusions. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about brand settings</a>
                      </p>

                      {/* Brand Inclusions */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-900 block">Brand inclusions</label>
                        <p className="text-[11px] text-slate-400">
                          Your ads will only show on searches that match your keywords and mention selected brands, including related products and services. Brand inclusions will limit search traffic, so apply only necessary brands.
                        </p>
                        <div className="relative max-w-xl">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={brandInclusionInput}
                            onChange={(e) => setBrandInclusionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && brandInclusionInput.trim()) {
                                setBrandInclusions(prev => [...prev, brandInclusionInput.trim()]);
                                setBrandInclusionInput("");
                              }
                            }}
                            placeholder="Add brand lists"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        {brandInclusions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {brandInclusions.map((b, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
                                + {b}
                                <button onClick={() => setBrandInclusions(prev => prev.filter((_, i) => i !== idx))}>
                                  <X className="h-3 w-3 hover:text-rose-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Brand Exclusions */}
                      <div className="space-y-2 pt-3 border-t border-slate-200">
                        <label className="text-xs font-semibold text-slate-900 block">Brand exclusions</label>
                        <p className="text-[11px] text-slate-400">
                          Your ads won't show on searches that mention selected brands or related products and services. If you exclude and include the same brand, only the exclusion will work.
                        </p>
                        <div className="relative max-w-xl">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={brandExclusionInput}
                            onChange={(e) => setBrandExclusionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && brandExclusionInput.trim()) {
                                setBrandExclusions(prev => [...prev, brandExclusionInput.trim()]);
                                setBrandExclusionInput("");
                              }
                            }}
                            placeholder="Add brand lists"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        {brandExclusions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {brandExclusions.map((b, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
                                - {b}
                                <button onClick={() => setBrandExclusions(prev => prev.filter((_, i) => i !== idx))}>
                                  <X className="h-3 w-3 hover:text-rose-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. Keyword and asset generation Card (Search Only) */}
            {selectedType === "SEARCH" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Keyword and asset generation</h2>
                </div>

                <div className="border border-slate-200 rounded-2xl bg-slate-50/60 p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Keyword and asset generation</h3>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">Get help creating your ad</h4>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[9px] uppercase tracking-wider">
                        BETA
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Google AI will use your URL and the information you provide to create assets, like keywords, headlines, and descriptions for you to review. Generated content may be inaccurate or offensive, so please review and check the responses. To improve Google AI, human reviewers may read, annotate, and process the information you provide. Don't enter anything you wouldn't want reviewed or used.
                    </p>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your use is subject to Google's{" "}
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Generative AI Prohibited Use Policy</a>.{" "}
                      Your data is handled as explained in the Google{" "}
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Privacy Policy</a>.
                    </p>

                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-semibold text-slate-900">
                        Where will people go when they click your ad?
                      </label>

                      <div className="relative">
                        <div className="absolute left-3.5 top-3 text-slate-500 flex items-center gap-1.5">
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <input
                          type="url"
                          value={keywordAssetGenerationUrl}
                          onChange={(e) => setKeywordAssetGenerationUrl(e.target.value)}
                          placeholder="Final URL (required)*"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Keyword and asset generation is not available in all languages
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Skip & Generate */}
                <div className="flex items-center justify-end gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setKeywordAssetGenerationUrl("")}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer px-3 py-2"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    disabled={!keywordAssetGenerationUrl.trim() || isGeneratingKeywordAssets}
                    onClick={async () => {
                      if (!keywordAssetGenerationUrl.trim()) return;
                      setIsGeneratingKeywordAssets(true);
                      try {
                        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                        await fetch(`${BACKEND}/api/ads/generate-copy`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ businessName: businessName || "JISNU Digital Solutions", finalUrl: keywordAssetGenerationUrl, type: "HEADLINES" })
                        });
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsGeneratingKeywordAssets(false);
                      }
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      keywordAssetGenerationUrl.trim() && !isGeneratingKeywordAssets
                        ? "bg-blue-600 hover:bg-blue-700 text-slate-900 cursor-pointer shadow-lg shadow-primary/20"
                        : "bg-slate-100 text-slate-500 border border-slate-200/60 cursor-not-allowed"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isGeneratingKeywordAssets ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            )}

            {/* 7. Ad Rotation Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Ad rotation</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="adRot"
                    checked={adRotation === "OPTIMIZE"}
                    onChange={() => setAdRotation("OPTIMIZE")}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-900">Optimize: Prefer best performing ads</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="adRot"
                    checked={adRotation === "DO_NOT_OPTIMIZE"}
                    onChange={() => setAdRotation("DO_NOT_OPTIMIZE")}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-900">Do not optimize: Rotate ads indefinitely</span>
                </label>
              </div>
            </div>

            {/* 4. More Settings Section & List */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowMoreSettings(!showMoreSettings)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-600 transition-all cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                More settings
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMoreSettings ? "rotate-180" : ""}`} />
              </button>

              {showMoreSettings && (
                <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-800 text-xs animate-in fade-in duration-200 overflow-hidden">
                  
                  {/* 1. Ad schedule */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Ad schedule</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-3">
                      {/* Dynamic Schedule Rows */}
                      <div className="space-y-2.5">
                        {adSchedules.map((sched, idx) => (
                          <div key={sched.id} className="flex flex-wrap items-center gap-3">
                            <select
                              value={sched.day}
                              onChange={(e) => {
                                const newScheds = [...adSchedules];
                                newScheds[idx].day = e.target.value;
                                setAdSchedules(newScheds);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            >
                              <option value="ALL">All days</option>
                              <option value="WEEKDAYS">Mondays - Fridays</option>
                              <option value="WEEKENDS">Saturdays - Sundays</option>
                              <option value="MONDAY">Mondays</option>
                              <option value="TUESDAY">Tuesdays</option>
                              <option value="WEDNESDAY">Wednesdays</option>
                              <option value="THURSDAY">Thursdays</option>
                              <option value="FRIDAY">Fridays</option>
                              <option value="SATURDAY">Saturdays</option>
                              <option value="SUNDAY">Sundays</option>
                            </select>

                            <select
                              value={sched.startTime}
                              onChange={(e) => {
                                const newScheds = [...adSchedules];
                                newScheds[idx].startTime = e.target.value;
                                setAdSchedules(newScheds);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            >
                              {["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>

                            <span className="text-slate-400">to</span>

                            <select
                              value={sched.endTime}
                              onChange={(e) => {
                                const newScheds = [...adSchedules];
                                newScheds[idx].endTime = e.target.value;
                                setAdSchedules(newScheds);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            >
                              {["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:59"].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>

                            {adSchedules.length > 1 && (
                              <button
                                onClick={() => setAdSchedules(prev => prev.filter(s => s.id !== sched.id))}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-100 rounded-lg transition-all"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setAdSchedules(prev => [...prev, { id: String(Date.now()), day: "MONDAY", startTime: "09:00", endTime: "18:00" }])}
                        className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add schedule
                      </button>

                      <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed mt-2">
                        To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more</a>
                      </div>

                      <p className="text-[11px] text-slate-400">Based on account time zone: <strong>(GMT+05:30) India Standard Time</strong></p>
                      <p className="text-[10px] text-amber-400/90">Saving this removes the settings you changed and adds new ones, resetting any performance data.</p>
                      <p className="text-[11px] text-slate-500">To limit when your ads can run, set an ad schedule. Keep in mind that your ads will only run during these times.</p>
                    </div>
                  </div>

                  {/* 2. Start and end dates */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Start and end dates</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">Start date</label>
                        <input
                          type="date"
                          min={todayStr}
                          value={startDateValue}
                          onChange={(e) => setStartDateValue(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">End date</label>
                        <div className="space-y-2">
                          <select
                            value={endDateMode}
                            onChange={(e) => {
                              const val = e.target.value as "NONE" | "SELECT";
                              setEndDateMode(val);
                              if (val === "SELECT") {
                                setTimeout(() => {
                                  const dateInput = document.getElementById("endDateCalendarPicker") as HTMLInputElement;
                                  if (dateInput) {
                                    dateInput.focus();
                                    if ("showPicker" in dateInput) {
                                      (dateInput as any).showPicker();
                                    }
                                  }
                                }, 100);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="NONE">None</option>
                            <option value="SELECT">Select a date</option>
                          </select>

                          {endDateMode === "SELECT" && (
                            <div className="relative animate-in fade-in duration-200">
                              <input
                                id="endDateCalendarPicker"
                                type="date"
                                min={startDateValue || todayStr}
                                value={endDateValue}
                                onChange={(e) => setEndDateValue(e.target.value)}
                                onClick={(e) => {
                                  if ("showPicker" in e.currentTarget) {
                                    (e.currentTarget as any).showPicker();
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">Your ads will continue to run unless you specify an end date.</p>
                  </div>

                  {/* 3. Campaign URL options */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Campaign URL options</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-slate-700 font-medium">Tracking template</label>
                        <input
                          type="text"
                          placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-700 font-medium">Final URL suffix</label>
                        <input
                          type="text"
                          placeholder="Example: param1=value1&param2=value2"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="block text-slate-700 font-medium">Custom parameters</label>
                        <div className="space-y-2">
                          {customParameters.map((cp, idx) => (
                            <div key={cp.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={cp.name}
                                onChange={(e) => {
                                  const newCP = [...customParameters];
                                  newCP[idx].name = e.target.value;
                                  setCustomParameters(newCP);
                                }}
                                placeholder="{_Name}"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 w-1/3 focus:outline-none focus:border-blue-500"
                              />
                              <span className="text-slate-400">=</span>
                              <input
                                type="text"
                                value={cp.value}
                                onChange={(e) => {
                                  const newCP = [...customParameters];
                                  newCP[idx].value = e.target.value;
                                  setCustomParameters(newCP);
                                }}
                                placeholder="Value"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 w-2/3 focus:outline-none focus:border-blue-500"
                              />
                              {customParameters.length > 1 && (
                                <button
                                  onClick={() => setCustomParameters(prev => prev.filter(p => p.id !== cp.id))}
                                  className="p-1.5 text-slate-400 hover:text-rose-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setCustomParameters(prev => [...prev, { id: String(Date.now()), name: "", value: "" }])}
                          className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add parameter
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400">Tracking template is the URL you want the ad click to go to for tracking. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more</a></p>
                    </div>
                  </div>

                  {/* 4. Page feeds */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Page feeds</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Add page feeds to specify which URLs to use in your campaign. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about page feeds</a>
                    </p>
                    <button className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-750 flex items-center gap-1.5 cursor-pointer">
                      <Plus className="h-3.5 w-3.5 text-blue-600" /> Add a page feed
                    </button>
                    <p className="text-[11px] text-slate-500 pt-1">
                      You don't have any page feeds. You can add page feeds in Business Data.
                    </p>
                  </div>

                  {/* 5. Devices */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Devices</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">Choose the devices where your ads can appear. <span className="text-rose-400 uppercase text-[10px] font-semibold">Required</span></p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {["Computers", "Mobile phones", "Tablets", "TV screens"].map((dev) => (
                        <label key={dev} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded bg-white border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                          <span className="text-xs text-slate-900 font-medium">{dev}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 6. Brand exclusions */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Brand exclusions</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">Exclude brands so your ads won't show on searches that mention those brands. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about brand exclusions</a></p>

                    {appliedBrandLists.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {appliedBrandLists.map((bl, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900">
                            🛡️ {bl}
                            <button onClick={() => setAppliedBrandLists(prev => prev.filter((_, i) => i !== idx))}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setShowBrandModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-750 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 text-blue-600" /> Use brand lists to exclude brands
                    </button>
                  </div>

                  {/* 7. Demographic exclusions */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Demographic exclusions</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">Demographic exclusions will override any specific hints that are active on any asset groups within this campaign.</p>

                    <div className="space-y-4">
                      {/* Age Exclusions */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={turnOnAgeExclusions}
                            onChange={(e) => setTurnOnAgeExclusions(e.target.checked)}
                            className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                          />
                          <span className="text-xs text-slate-900 font-semibold">Turn on age exclusions</span>
                        </label>

                        {turnOnAgeExclusions && (
                          <div className="ml-6 space-y-2 pt-1 animate-in fade-in duration-200">
                            <p className="text-[11px] text-slate-400">Select age ranges to exclude from the campaign. Unselected ages will be included.</p>
                            <div className="flex flex-wrap gap-2">
                              {["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"].map((age) => (
                                <label key={age} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${selectedAgeRanges.includes(age) ? "border-rose-500 bg-rose-500/10 text-rose-300 font-semibold" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-200"}`}>
                                  <input
                                    type="checkbox"
                                    checked={selectedAgeRanges.includes(age)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedAgeRanges(prev => [...prev, age]);
                                      else setSelectedAgeRanges(prev => prev.filter(a => a !== age));
                                    }}
                                    className="hidden"
                                  />
                                  <span>{age}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Gender Exclusions */}
                      <div className="space-y-2 border-t border-slate-200 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={turnOnGenderExclusions}
                            onChange={(e) => setTurnOnGenderExclusions(e.target.checked)}
                            className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                          />
                          <span className="text-xs text-slate-900 font-semibold">Turn on gender exclusions</span>
                        </label>

                        {turnOnGenderExclusions && (
                          <div className="ml-6 space-y-2 pt-1 animate-in fade-in duration-200">
                            <p className="text-[11px] text-slate-400">Select genders to exclude from the campaign. Unselected genders will be included.</p>
                            <div className="flex flex-wrap gap-2">
                              {["Female", "Male", "Unknown"].map((g) => (
                                <label key={g} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${selectedGenders.includes(g) ? "border-rose-500 bg-rose-500/10 text-rose-300 font-semibold" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-200"}`}>
                                  <input
                                    type="checkbox"
                                    checked={selectedGenders.includes(g)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedGenders(prev => [...prev, g]);
                                      else setSelectedGenders(prev => prev.filter(gen => gen !== g));
                                    }}
                                    className="hidden"
                                  />
                                  <span>{g}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 8. Your data exclusions */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 text-sm">Your data exclusions</h3>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={enableDataExclusions}
                        onChange={(e) => setEnableDataExclusions(e.target.checked)}
                        className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                      />
                      <span className="text-xs text-slate-700 font-medium">Enable your data exclusions</span>
                    </label>
                  </div>
                </div>
              )}
              </div>

              {/* Next Navigation Action */}
              <div className="flex items-center justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(selectedType === "SEARCH" ? "KEYWORDS_ADS" as any : "ASSET_GROUP")}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold text-xs transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
          </main>

          {/* Right Weekly Estimates Sidebar */}
          <aside className="w-72 border-l border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/40 hidden lg:block">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Campaign optimization score</span>
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 text-white w-full rounded-full"></div>
              </div>
              <p className="text-right text-xs font-bold text-blue-600">100%</p>
            </div>
          </aside>
        </div>
      ) : wizardStep === "KEYWORDS_ADS" ? (
        <div className="flex-1 flex w-full pb-20">
          {/* Left Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/50 hidden md:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Search className="h-3.5 w-3.5 text-blue-600" />
                Search
              </div>
            </div>

            <nav className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BIDDING")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Bidding
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Campaign settings
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">3</div>
                  Keywords and ads
                </div>
                <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                  <p className="hover:text-slate-900 cursor-pointer">Keywords</p>
                  <p className="hover:text-slate-900 cursor-pointer text-emerald-400 font-medium">AI Max</p>
                  <p className="text-blue-600 font-semibold">Ads</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">4</div>
                Budget
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">5</div>
                Review
              </div>
            </nav>
          </aside>

          {/* Keywords & Ads Main Content */}
          <main className="flex-1 p-6 md:p-10 space-y-8 max-w-5xl">
            {/* 1. Keywords Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Keywords</h2>
                <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
              </div>

              {/* Get keyword suggestions */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Get keyword suggestions <span className="text-slate-400 font-normal">(optional)</span></h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Google Ads can find keywords for you by scanning a web page or seeing what's working for similar products or services</p>
                </div>

                <div className="space-y-3 max-w-2xl">
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-500">
                      <Globe className="h-4 w-4" />
                    </div>
                    <input
                      type="url"
                      value={assetFinalUrl}
                      onChange={(e) => setAssetFinalUrl(e.target.value)}
                      placeholder="Final URL"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-500">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter products or services to advertise"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!keywordsInput.includes("digital marketing") && !keywordsInput.includes("seo services")) {
                        setKeywordsInput(prev => (prev ? prev + "\ndigital marketing\nseo services\nlead generation\nwhatsapp automation" : "digital marketing\nseo services\nlead generation\nwhatsapp automation"));
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-slate-750 transition-all cursor-pointer"
                  >
                    Get keyword suggestions
                  </button>
                </div>
              </div>

              {/* Enter keywords */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Enter keywords</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Keywords are words or phrases that are used to match your ads with the terms people are searching for <HelpCircle className="inline h-3 w-3 text-slate-500" />
                  </p>
                </div>

                <div className="space-y-1">
                  <textarea
                    rows={6}
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="Enter or paste keywords. You can separate each keyword by commas or enter one per line."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 2. Ad group settings for AI Max */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Ad group settings for AI Max</h2>
                <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">AI Max is turned on for your campaign</span>
              </div>

              <div className="space-y-4">
                {/* 1. Search term matching */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-slate-900">Search term matching</h3>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[9px] uppercase">
                        BETA
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Search term matching expands your keywords to broad match and lets Google AI match content from your landing pages and assets to help you show up on more relevant searches
                  </p>

                  <label className="flex items-center gap-3 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSearchTermMatching}
                      onChange={(e) => setUseSearchTermMatching(e.target.checked)}
                      className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-900 font-medium">Use search term matching for this ad group</span>
                  </label>
                </div>

                {/* 2. Brand inclusions */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900">Brand inclusions</h3>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Add brand inclusions to limit traffic to serve only on search queries related to the specified brands. Your ad group brand inclusions will be used instead of campaign-level brand inclusions.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowBrandModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-750 text-xs font-semibold text-blue-600 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add brand lists
                  </button>

                  {adGroupBrandInclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {adGroupBrandInclusions.map((b, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
                          + {b}
                          <button onClick={() => setAdGroupBrandInclusions(prev => prev.filter((_, i) => i !== idx))}>
                            <X className="h-3 w-3 hover:text-rose-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Locations of interest */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900">Locations of interest</h3>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use locations of interest to reach customers searching for or interested in specific geographic areas. The locations you selected in your campaign settings still apply. For best results, use locations of interest with phrase and broad match keywords.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 max-w-lg">
                      <input
                        type="text"
                        value={locationOfInterestInput}
                        onChange={(e) => setLocationOfInterestInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && locationOfInterestInput.trim()) {
                            setLocationsOfInterest(prev => [...prev, locationOfInterestInput.trim()]);
                            setLocationOfInterestInput("");
                          }
                        }}
                        placeholder="For example, a country, city, region, or postal code"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (locationOfInterestInput.trim()) {
                            setLocationsOfInterest(prev => [...prev, locationOfInterestInput.trim()]);
                            setLocationOfInterestInput("");
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-slate-750 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {locationsOfInterest.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {locationsOfInterest.map((loc, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900">
                            📍 {loc}
                            <button onClick={() => setLocationsOfInterest(prev => prev.filter((_, i) => i !== idx))}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. URL inclusions */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900">URL inclusions</h3>
                    <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Google AI selects the best performing landing page from your website. To use only certain pages, create URL rules or choose custom labels from your page feeds.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowUrlInclusionsModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-750 text-xs font-semibold text-blue-600 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add url inclusions
                  </button>

                  {savedUrlInclusions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-slate-700">Added URL inclusions ({savedUrlInclusions.length}):</p>
                      <div className="space-y-1">
                        {savedUrlInclusions.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                            <span className="font-mono text-slate-900">{url}</span>
                            <button onClick={() => setSavedUrlInclusions(prev => prev.filter((_, i) => i !== idx))}>
                              <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal: Add URL Inclusions */}
            {showUrlInclusionsModal && (
              <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden space-y-0">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowUrlInclusionsModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <h2 className="text-lg font-semibold text-slate-900">Add URL inclusions</h2>
                    </div>
                  </div>

                  {/* Modal Content Grid matching Google Ads UI screenshot */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <span className="text-xs font-semibold text-slate-700 pt-1 shrink-0">URL inclusions</span>
                      <p className="text-xs text-slate-400">Select specific pages from your website that you want Google AI to include</p>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
                      {/* Left Side: Tabs & Input Form */}
                      <div className="lg:col-span-8 border-r border-slate-200 p-5 space-y-4">
                        <div className="flex items-center border-b border-slate-200 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setUrlInclusionsTab("URLs")}
                            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${urlInclusionsTab === "URLs" ? "border-blue-500 text-blue-600 font-bold" : "border-transparent text-slate-400 hover:text-slate-900"}`}
                          >
                            URLs
                          </button>
                          <button
                            type="button"
                            onClick={() => setUrlInclusionsTab("CUSTOM_LABELS")}
                            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${urlInclusionsTab === "CUSTOM_LABELS" ? "border-blue-500 text-blue-600 font-bold" : "border-transparent text-slate-400 hover:text-slate-900"}`}
                          >
                            Custom labels
                          </button>
                          <button
                            type="button"
                            onClick={() => setUrlInclusionsTab("RULES")}
                            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${urlInclusionsTab === "RULES" ? "border-blue-500 text-blue-600 font-bold" : "border-transparent text-slate-400 hover:text-slate-900"}`}
                          >
                            Rules
                          </button>
                        </div>

                        {urlInclusionsTab === "URLs" ? (
                          <div className="space-y-3 pt-2">
                            <label className="block text-xs font-semibold text-slate-900">
                              Enter URLs to include:
                            </label>
                            <textarea
                              rows={5}
                              value={urlInclusionsInput}
                              onChange={(e) => setUrlInclusionsInput(e.target.value)}
                              placeholder="Enter or paste your webpages, one URL per line"
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (urlInclusionsInput.trim()) {
                                  const lines = urlInclusionsInput.split("\n").map(l => l.trim()).filter(Boolean);
                                  setSavedUrlInclusions(prev => Array.from(new Set([...prev, ...lines])));
                                  setUrlInclusionsInput("");
                                }
                              }}
                              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer pt-1"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400">
                            Configure {urlInclusionsTab.toLowerCase()} for advanced page feed routing.
                          </div>
                        )}
                      </div>

                      {/* Right Side: Selected Targets */}
                      <div className="lg:col-span-4 p-5 flex flex-col justify-between space-y-4 bg-slate-50/40">
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-700">
                            {savedUrlInclusions.length === 0 ? "None selected" : `Selected (${savedUrlInclusions.length})`}
                          </h4>

                          {savedUrlInclusions.length === 0 ? (
                            <p className="text-xs text-slate-500 py-10 text-center">Select targets on the left.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {savedUrlInclusions.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                                  <span className="truncate text-slate-900 font-mono max-w-[160px]">{url}</span>
                                  <button onClick={() => setSavedUrlInclusions(prev => prev.filter((_, i) => i !== idx))}>
                                    <X className="h-3 w-3 text-slate-400 hover:text-rose-400" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => setShowUrlInclusionsModal(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-750 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Create ads to get more sales & Interactive Ad Builder */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Create ads to get more sales</h2>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-semibold text-slate-900">Ads</h3>
                  <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
                </div>

                {/* Ad Strength Header Bar */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-amber-400 flex items-center justify-center font-bold text-amber-400 text-xs">
                      45%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">Ad strength</span>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs text-amber-400 font-bold">Incomplete</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Add a Final URL to see headline and description suggestions</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">○</div>
                      <span>Add headlines</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 hover:underline font-semibold ml-1">View ideas</a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">○</div>
                      <span>Include popular keywords</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 hover:underline font-semibold ml-1">View ideas</a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">○</div>
                      <span>Make headlines unique</span>
                      <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 hover:underline font-semibold ml-1">View ideas</a>
                    </div>
                  </div>
                </div>

                {/* Left Form Column & Right Mobile Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-6 space-y-5">
                    {/* Final URL */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                          Final URL <HelpCircle className="h-3 w-3 text-slate-500" />
                        </label>
                        <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        value={assetFinalUrl}
                        onChange={(e) => setAssetFinalUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-slate-500">This will be used to suggest assets for your ad</p>
                    </div>

                    {/* Display path */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                          Display path <HelpCircle className="h-3 w-3 text-slate-500" />
                        </label>
                        <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <p className="text-[11px] text-slate-400">www.example.com</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-mono">/</span>
                        <input
                          type="text"
                          maxLength={15}
                          value={displayPath1}
                          onChange={(e) => setDisplayPath1(e.target.value)}
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-500 font-mono">/</span>
                        <input
                          type="text"
                          maxLength={15}
                          value={displayPath2}
                          onChange={(e) => setDisplayPath2(e.target.value)}
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Calls */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold text-slate-900">Calls ({campaignCallsList.length})</span>
                          <HelpCircle className="h-3 w-3 text-slate-500" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCallsModal(true)}
                          className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-750 text-xs font-semibold text-blue-600 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add call
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {campaignCallsList.map((num, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                              📞 {num}
                            </span>
                            <button onClick={() => setCampaignCallsList(prev => prev.filter((_, i) => i !== idx))}>
                              <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Headlines */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold text-slate-900">Headlines ({headlines.length}/15)</span>
                          <HelpCircle className="h-3 w-3 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isGeneratingCopy}
                            onClick={async () => {
                              setIsGeneratingCopy(true);
                              try {
                                const targetUrl = assetFinalUrl.trim() || websiteVisitsUrl.trim() || "https://japatracker-7f759.web.app/";
                                const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                                const res = await fetch(`${BACKEND}/api/ads/generate-copy`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ businessName: businessName || "JISNU Digital Solutions", finalUrl: targetUrl, type: "HEADLINES" })
                                });
                                const data = await res.json();
                                if (data.headlines && data.headlines.length > 0) {
                                  setHeadlines(data.headlines.slice(0, 10));
                                }
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsGeneratingCopy(false);
                              }
                            }}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {isGeneratingCopy ? "Generating..." : "View ideas"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (headlines.length < 15) {
                                setHeadlines(prev => [...prev, ""]);
                              }
                            }}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Headline
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {headlines.map((hl, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={30}
                              value={hl}
                              onChange={(e) => {
                                const newH = [...headlines];
                                newH[idx] = e.target.value;
                                setHeadlines(newH);
                              }}
                              placeholder={`Headline ${idx + 1}`}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                            {idx > 2 && (
                              <button
                                type="button"
                                onClick={() => setHeadlines(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono">{hl.length}/30</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold text-slate-900">Descriptions ({descriptions.length}/14)</span>
                          <HelpCircle className="h-3 w-3 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isGeneratingCopy}
                            onClick={async () => {
                              setIsGeneratingCopy(true);
                              try {
                                const targetUrl = assetFinalUrl.trim() || websiteVisitsUrl.trim() || "https://japatracker-7f759.web.app/";
                                const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                                const res = await fetch(`${BACKEND}/api/ads/generate-copy`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ businessName: businessName || "JISNU Digital Solutions", finalUrl: targetUrl, type: "DESCRIPTIONS" })
                                });
                                const data = await res.json();
                                if (data.descriptions && data.descriptions.length > 0) {
                                  setDescriptions(data.descriptions.slice(0, 14));
                                }
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsGeneratingCopy(false);
                              }
                            }}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {isGeneratingCopy ? "Generating..." : "View ideas"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (descriptions.length < 14) {
                                setDescriptions(prev => [...prev, ""]);
                              }
                            }}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Description
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {descriptions.map((desc, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={90}
                                value={desc}
                                onChange={(e) => {
                                  const newD = [...descriptions];
                                  newD[idx] = e.target.value;
                                  setDescriptions(newD);
                                }}
                                placeholder={`Description ${idx + 1}`}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                              {idx > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setDescriptions(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 px-1">
                              <span>{idx < 2 ? "Required" : "Optional"}</span>
                              <span>{desc.length}/90</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Name */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-900">Business name</label>
                        <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <p className="text-[11px] text-slate-400">This name should match your URL or verified advertiser name</p>
                      <input
                        type="text"
                        maxLength={25}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="JISNU DIGITAL SOLUTIONS PRIVATE LIMITED"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      />
                      <div className="flex justify-end text-[10px] text-slate-500">
                        <span>{businessName.length}/25</span>
                      </div>
                    </div>

                    {/* Sitelinks Section */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900">Sitelinks</h3>
                          <p className="text-[11px] text-slate-400">Add links to your ads to take people to specific pages on your website.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSitelinksModal(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-750 text-xs font-semibold text-blue-600 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Sitelinks
                        </button>
                      </div>

                      {/* Sitelinks 1 to 6 List */}
                      <div className="space-y-2 pt-1">
                        {[1, 2, 3, 4, 5, 6].map((num, idx) => {
                          const item = sitelinkItems[idx] || { text: "", desc1: "", desc2: "", url: "" };
                          return (
                            <div key={num} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-700">Sitelink {num}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                                  Recommended
                                </span>
                                {item.text && (
                                  <span className="text-xs text-slate-400 font-mono italic">
                                    "{item.text}"
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                id={num === 1 ? "a" : undefined}
                                onClick={() => {
                                  setActiveSitelinkIndex(idx);
                                  setShowSitelinksModal(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-750 text-xs font-semibold text-blue-600 border border-slate-200 cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Callouts Section */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900">Callouts</h3>
                          <p className="text-[11px] text-slate-400">Add more business information</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const val = prompt("Enter callout text (e.g. 24/7 Customer Support):");
                            if (val) setCalloutsList(prev => [...prev, val]);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-750 text-xs font-semibold text-blue-600 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Callout
                        </button>
                      </div>

                      {calloutsList.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {calloutsList.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900">
                              ✓ {c}
                              <button onClick={() => setCalloutsList(prev => prev.filter((_, idx) => idx !== i))}>
                                <X className="h-3 w-3 hover:text-rose-400" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* More asset types (0/7) */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-900">More asset types (0/7)</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Improve your ad performance and make your ad more interactive by adding more details about your business and website
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Promotions */}
                        <div
                          onClick={() => setShowPromotionsModal(true)}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">Promotions</span>
                            <span className="text-[10px] text-slate-400">Add promotions</span>
                          </div>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 text-white group-hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Prices */}
                        <div
                          onClick={() => setShowPricesModal(true)}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">Prices</span>
                            <span className="text-[10px] text-slate-400">Add prices</span>
                          </div>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 text-white group-hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Messages */}
                        <div
                          onClick={() => setShowMessagesModal(true)}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">Messages</span>
                            <span className="text-[10px] text-slate-400">Add a message</span>
                          </div>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 text-white group-hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Structured snippets */}
                        <div
                          onClick={() => setShowSnippetsModal(true)}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">Structured snippets</span>
                            <span className="text-[10px] text-slate-400">Add snippets of text</span>
                          </div>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 text-white group-hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Lead forms */}
                        <div
                          onClick={() => setShowLeadFormsModal(true)}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">Lead forms</span>
                            <span className="text-[10px] text-slate-400">Add a form</span>
                          </div>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 text-white group-hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Apps */}
                        <div
                          onClick={() => setShowAppsModal(true)}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">Apps</span>
                            <span className="text-[10px] text-slate-400">Add apps</span>
                          </div>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 text-white group-hover:text-white transition-all cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ad URL options */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-xs font-semibold text-slate-900">Ad URL options</h3>
                        <ChevronUp className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                      </div>

                      {/* Tracking template */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Tracking template</label>
                        <input
                          type="text"
                          value={adTrackingTemplate}
                          onChange={(e) => setAdTrackingTemplate(e.target.value)}
                          placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      {/* Final URL suffix */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Final URL suffix</label>
                        <input
                          type="text"
                          value={adFinalUrlSuffix}
                          onChange={(e) => setAdFinalUrlSuffix(e.target.value)}
                          placeholder="Example: param1=value1&param2=value2"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      {/* Custom parameters */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-slate-700">Custom parameters</label>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomParameters(prev => [...prev, { id: String(Date.now()), name: "", value: "" }]);
                            }}
                            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add custom parameters
                          </button>
                        </div>

                        <div className="space-y-2">
                          {customParameters.map((param, idx) => (
                            <div key={param.id || idx} className="flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-400">{`{_`}</span>
                              <input
                                type="text"
                                value={param.name}
                                onChange={(e) => {
                                  const updated = [...customParameters];
                                  updated[idx] = { ...updated[idx], name: e.target.value };
                                  setCustomParameters(updated);
                                }}
                                placeholder="Name"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                              />
                              <span className="text-xs font-mono text-slate-400">{`}`}</span>
                              <span className="text-xs font-mono text-slate-400">=</span>
                              <input
                                type="text"
                                value={param.value}
                                onChange={(e) => {
                                  const updated = [...customParameters];
                                  updated[idx] = { ...updated[idx], value: e.target.value };
                                  setCustomParameters(updated);
                                }}
                                placeholder="Value"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                              />
                              {customParameters.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setCustomParameters(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1 text-slate-400 hover:text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mobile URL Switch */}
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useMobileFinalUrlAd}
                            onChange={(e) => setUseMobileFinalUrlAd(e.target.checked)}
                            className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                          />
                          <span className="text-xs text-slate-900 font-medium">Use a different final URL for mobile</span>
                        </label>

                        {useMobileFinalUrlAd && (
                          <div className="space-y-1 pl-7 pt-1 animate-in fade-in duration-200">
                            <label className="block text-[11px] font-semibold text-slate-700">Final URL for mobile</label>
                            <input
                              type="text"
                              value={mobileFinalUrlAd}
                              onChange={(e) => setMobileFinalUrlAd(e.target.value)}
                              placeholder="https://m.example.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Google Mobile Phone Ad Preview */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">Preview</span>
                      <div className="flex items-center gap-3 text-xs font-semibold text-blue-600">
                        <button className="hover:underline cursor-pointer">Share</button>
                        <button className="hover:underline cursor-pointer">Preview ads</button>
                      </div>
                    </div>

                    {/* Mobile Mock Frame */}
                    <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col items-center space-y-4">
                      <div className="w-64 rounded-[32px] border-4 border-slate-200 bg-white p-4 space-y-3 text-xs shadow-2xl">
                        {/* Google Search Bar Mock */}
                        <div className="flex items-center gap-2 p-2 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-400">
                          <span className="font-bold text-blue-400 text-xs pl-1">G</span>
                          <span className="truncate">{keywordsInput.split("\n")[0] || "search keywords"}</span>
                        </div>

                        {/* Ad Card Mock */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-900">Sponsored</span>
                            <Info className="h-3 w-3 text-slate-500" />
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <div className="w-4 h-4 rounded-full bg-blue-600 text-slate-900 font-bold flex items-center justify-center text-[9px]">J</div>
                            <span className="truncate">{assetFinalUrl ? new URL(assetFinalUrl.startsWith("http") ? assetFinalUrl : `https://${assetFinalUrl}`).hostname : "example.com"}</span>
                          </div>

                          <h4 className="font-semibold text-blue-600 text-xs leading-snug">
                            {headlines[0] || "Headline 1"} - {headlines[1] || "Headline 2"}
                          </h4>

                          <p className="text-[10px] text-slate-400 leading-normal">
                            {descriptions[0] || "Description text preview will show here..."}
                          </p>

                          {/* Phone Call Callout */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-[11px] text-emerald-400 font-semibold pt-1">
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>Call 658 735 5041</span>
                          </div>
                        </div>

                        {/* Skeleton Rows */}
                        <div className="space-y-1.5 pt-1">
                          <div className="h-2 bg-slate-100 rounded w-full"></div>
                          <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center items-center gap-1.5 pt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 text-white"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 text-center max-w-xs leading-normal">
                        Previews shown here are examples and don't include all possible formats. You're responsible for the content of your ads.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                className="px-6 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-750 text-slate-900 font-semibold text-xs transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setWizardStep("BUDGET")}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold text-xs transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      ) : wizardStep === "ASSET_GROUP" ? (
        <div className="flex-1 flex w-full pb-20">
          {/* Left Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/50 hidden md:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Performance Max
              </div>
            </div>

            <nav className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BIDDING")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Bidding
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Campaign settings
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">3</div>
                  Asset group
                </div>
                <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                  <p className="text-blue-600 font-semibold">Name</p>
                  <p className="hover:text-slate-900 cursor-pointer">Final URL</p>
                  <p className="hover:text-slate-900 cursor-pointer">Brand guidelines</p>
                  <p className="hover:text-slate-900 cursor-pointer">Assets</p>
                  <p className="hover:text-slate-900 cursor-pointer">Asset optimization</p>
                  <p className="hover:text-slate-900 cursor-pointer">Search themes</p>
                  <p className="hover:text-slate-900 cursor-pointer">Audience signal</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">4</div>
                Budget
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">5</div>
                Summary
              </div>
            </nav>
          </aside>

          {/* Asset Group Main Content */}
          <main className="flex-1 p-6 md:p-10 space-y-8 max-w-4xl">
            {/* Top Ad Strength Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Let's start adding ad assets</span>
                    <span className="text-xs text-slate-400 font-mono">• Ad strength: <strong className="text-amber-400">Incomplete</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 text-emerald-400">✓ Images</span>
                    <span className="flex items-center gap-1 text-emerald-400">✓ Headlines</span>
                    <span className="flex items-center gap-1 text-emerald-400">✓ Sitelinks</span>
                    <span className="flex items-center gap-1 text-emerald-400">✓ Videos</span>
                    <span className="flex items-center gap-1 text-emerald-400">✓ Descriptions</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs text-blue-600 font-semibold hover:underline">Clear All</button>
                <button className="text-xs text-blue-600 font-semibold hover:underline">Refine</button>
              </div>
            </div>

            {/* Asset Group Name & Final URL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Asset group name</label>
                <input
                  type="text"
                  value={assetGroupName}
                  onChange={(e) => setAssetGroupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">Final URL</label>
                <input
                  type="text"
                  value={assetFinalUrl}
                  onChange={(e) => setAssetFinalUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Brand Guidelines Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Brand guidelines</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about brand guidelines</a></p>
                </div>
                <button
                  onClick={() => setShowAddBrandModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-750 text-xs font-semibold text-blue-600 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Settings className="h-3.5 w-3.5" /> More options
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Business name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business name"
                    maxLength={25}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Required</span>
                    <span>{businessName.length} / 25</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Logos ({uploadedLogos.length}/5)</label>
                  <label className="w-full p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 hover:border-blue-500 flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <Plus className="h-4 w-4 text-blue-600" />
                    {isUploadingLogo ? "Uploading Logo to ImageKit..." : "+ Add logos"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded ImageKit Logos Grid */}
                  {uploadedLogos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {uploadedLogos.map((logo, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-1">
                          <img src={logo.url} alt={logo.name} className="w-full h-full object-contain" />
                          <button
                            onClick={() => setUploadedLogos(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-rose-500/90 rounded text-slate-900 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Headlines Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Headline ({headlines.length})</h2>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">✓ You have enough headlines to reach Excellent ad strength</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (headlines.length < 15) {
                        setHeadlines(prev => [...prev, "New AI Headline"]);
                      }
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Headline
                  </button>
                  <button
                    disabled={isGeneratingCopy}
                    onClick={async () => {
                      setIsGeneratingCopy(true);
                      try {
                        const targetUrl = assetFinalUrl.trim() || websiteVisitsUrl.trim() || "https://japatracker-7f759.web.app/";
                        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                        const res = await fetch(`${BACKEND}/api/ads/generate-copy`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ businessName: businessName || "JISNU Digital Solutions", finalUrl: targetUrl, type: "HEADLINES" })
                        });
                        const data = await res.json();
                        if (data.headlines && data.headlines.length > 0) {
                          const aiItems = data.headlines.slice(0, 5);
                          setHeadlines(aiItems);
                        }
                      } catch (e) {
                        console.error("AI copy generation error:", e);
                      } finally {
                        setIsGeneratingCopy(false);
                      }
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {isGeneratingCopy ? "Generating from AI..." : "Generate headlines"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {headlines.map((hl, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hl}
                        maxLength={30}
                        onChange={(e) => {
                          const newH = [...headlines];
                          newH[idx] = e.target.value;
                          setHeadlines(newH);
                        }}
                        placeholder={`Headline ${idx + 1}`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      {idx < 3 ? <span className="text-[10px] text-rose-400 font-semibold uppercase">Req</span> : (
                        <button onClick={() => setHeadlines(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-rose-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-end text-[10px] text-slate-500 pr-1">
                      <span>{hl.length} / 30</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long Headlines Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Long headlines ({longHeadlines.length})</h2>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">✓ You have enough long headlines to reach Excellent ad strength</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setLongHeadlines(prev => [...prev, ""]);
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Long headline
                  </button>
                  <button
                    disabled={isGeneratingCopy}
                    onClick={async () => {
                      setIsGeneratingCopy(true);
                      try {
                        const targetUrl = assetFinalUrl.trim() || websiteVisitsUrl.trim() || "https://japatracker-7f759.web.app/";
                        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                        const res = await fetch(`${BACKEND}/api/ads/generate-copy`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ businessName: businessName || "JISNU Digital Solutions", finalUrl: targetUrl, type: "LONG_HEADLINES" })
                        });
                        const data = await res.json();
                        if (data.longHeadlines && data.longHeadlines.length > 0) {
                          const aiItems = data.longHeadlines.slice(0, 5);
                          setLongHeadlines(aiItems);
                        }
                      } catch (e) {
                        console.error("AI copy generation error:", e);
                      } finally {
                        setIsGeneratingCopy(false);
                      }
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {isGeneratingCopy ? "Generating from AI..." : "Generate long headlines"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {longHeadlines.map((lhl, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={lhl}
                        maxLength={90}
                        onChange={(e) => {
                          const newLH = [...longHeadlines];
                          newLH[idx] = e.target.value;
                          setLongHeadlines(newLH);
                        }}
                        placeholder={`Long headline ${idx + 1}`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      {idx === 0 ? <span className="text-[10px] text-rose-400 font-semibold uppercase">Req</span> : (
                        <button onClick={() => setLongHeadlines(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-rose-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-end text-[10px] text-slate-500 pr-1">
                      <span>{lhl.length} / 90</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Descriptions ({descriptions.length})</h2>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">✓ You have enough descriptions to reach Excellent ad strength</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setDescriptions(prev => [...prev, ""]);
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Description
                  </button>
                  <button
                    disabled={isGeneratingCopy}
                    onClick={async () => {
                      setIsGeneratingCopy(true);
                      try {
                        const targetUrl = assetFinalUrl.trim() || websiteVisitsUrl.trim() || "https://japatracker-7f759.web.app/";
                        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                        const res = await fetch(`${BACKEND}/api/ads/generate-copy`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ businessName: businessName || "JISNU Digital Solutions", finalUrl: targetUrl, type: "DESCRIPTIONS" })
                        });
                        const data = await res.json();
                        if (data.descriptions && data.descriptions.length > 0) {
                          const aiItems = data.descriptions.slice(0, 5);
                          setDescriptions(aiItems);
                        }
                      } catch (e) {
                        console.error("AI copy generation error:", e);
                      } finally {
                        setIsGeneratingCopy(false);
                      }
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {isGeneratingCopy ? "Generating from AI..." : "Generate descriptions"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {descriptions.map((desc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={desc}
                        maxLength={90}
                        onChange={(e) => {
                          const newD = [...descriptions];
                          newD[idx] = e.target.value;
                          setDescriptions(newD);
                        }}
                        placeholder={`Description ${idx + 1}`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      {idx < 2 ? <span className="text-[10px] text-rose-400 font-semibold uppercase">Req</span> : (
                        <button onClick={() => setDescriptions(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-rose-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-end text-[10px] text-slate-500 pr-1">
                      <span>{desc.length} / 90</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Card with ImageKit Cloud Upload & Display */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Images ({uploadedImages.length})</h2>
                <div className="flex items-center gap-3 text-xs">
                  <label className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    {isUploadingImage ? "Uploading to ImageKit..." : "+ Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                  <button className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Generate images
                  </button>
                </div>
              </div>

              {/* Uploaded ImageKit Images Display Grid */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Saved on ImageKit Cloud CDN:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                        <div className="absolute inset-0 bg-slate-50/70 opacity-0 group-hover:opacity-100 transition-all p-2 flex flex-col justify-between text-[10px]">
                          <span className="text-slate-900 font-medium truncate">{img.name}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-mono text-[9px]">ImageKit CDN</span>
                            <button
                              onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1 bg-rose-500/80 rounded hover:bg-rose-600 text-slate-900"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-700">Add more for variety</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="h-32 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden relative">
                      <img src="https://ik.imagekit.io/automationjds/sample_web_portfolio.png" alt="Generated" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-blue-600" /> Generated</span>
                      <button className="text-blue-600 font-semibold hover:underline">Select all</button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="h-32 rounded-lg bg-gradient-to-br from-blue-900/40 to-slate-900 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden relative">
                      <img src="https://ik.imagekit.io/automationjds/sample_seo_growth.png" alt="Enhanced" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">⚡ Enhanced from URL</span>
                      <button className="text-blue-600 font-semibold hover:underline">View more</button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                  You confirm you own all legal rights to the images you select from a URL and have permission to share them with Google for use on your behalf in advertising or for other commercial purposes.
                </p>
              </div>
            </div>

            {/* Videos Card with ImageKit Cloud Upload */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Videos ({uploadedVideos.length})</h2>
                <div className="flex items-center gap-3 text-xs">
                  <label className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    {isUploadingVideo ? "Uploading Video..." : "+ Upload Video"}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={isUploadingVideo}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      setUploadedVideos(prev => [...prev, { url: "https://ik.imagekit.io/automationjds/sample_ad_video.mp4", name: "AI Generated Video 1" }]);
                    }}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate videos
                  </button>
                </div>
              </div>

              {/* Uploaded ImageKit Videos Display Grid */}
              {uploadedVideos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Saved on ImageKit Cloud CDN:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {uploadedVideos.map((vid, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 space-y-1">
                        <div className="h-24 bg-white rounded-lg flex items-center justify-center text-blue-600">
                          <Video className="h-8 w-8" />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-900 font-medium truncate max-w-[120px]">{vid.name}</span>
                          <button
                            onClick={() => setUploadedVideos(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 bg-rose-500/80 rounded hover:bg-rose-600 text-slate-900"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-emerald-400 font-mono text-[9px] block">ImageKit CDN</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">Add more for variety</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="h-28 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Video className="h-7 w-7 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">Instagram ad</span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="h-28 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Video className="h-7 w-7 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">Instagram ad</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sitelinks Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Sitelinks</h2>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">✓ You have enough sitelinks to reach Excellent ad strength</p>
                </div>
                <button
                  onClick={() => {
                    const newTitle = prompt("Enter Sitelink Title:");
                    if (newTitle) {
                      setSitelinks(prev => [...prev, { title: newTitle, desc: "Custom sitelink" }]);
                    }
                  }}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit sitelinks
                </button>
              </div>

              <p className="text-xs text-slate-400">New sitelinks suggested by Google AI for your campaign:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sitelinks.map((sl, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1 hover:border-slate-200 transition-all flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">{sl.title}</p>
                      <p className="text-[11px] text-slate-500">{sl.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <button onClick={() => setSitelinks(prev => prev.filter((_, i) => i !== idx))} className="p-1 hover:text-slate-900"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Animated Clips Card with ImageKit Cloud Upload */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Animated clips ({uploadedAnimatedClips.length})</h2>
                <div className="flex items-center gap-2">
                  <label className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    {isUploadingAnimatedClip ? "Uploading Clip..." : "+ Upload Animated Clip"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleAnimatedClipUpload}
                      disabled={isUploadingAnimatedClip}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded ImageKit Animated Clips Display Grid */}
              {uploadedAnimatedClips.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Saved on ImageKit Cloud CDN:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedAnimatedClips.map((clip, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 space-y-1">
                        <div className="h-16 bg-white rounded flex items-center justify-center text-blue-600 text-xs font-bold">
                          ✨ CLIP
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-900 font-medium truncate max-w-[100px]">{clip.name}</span>
                          <button
                            onClick={() => setUploadedAnimatedClips(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 bg-rose-500/80 rounded hover:bg-rose-600 text-slate-900"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-emerald-400 font-mono text-[9px] block">ImageKit CDN</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* More Asset Types Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">More asset types</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Improve your ad performance and make your ad more interactive by adding more details about your business and website
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    title: "Promotions",
                    desc: "Add promotions",
                    action: "+ Add promotions",
                    list: promotionsList,
                    onAdd: () => {
                      const val = prompt("Enter promotion details (e.g. 20% OFF Summer Sale):");
                      if (val) setPromotionsList(prev => [...prev, val]);
                    },
                    onRemove: (idx: number) => setPromotionsList(prev => prev.filter((_, i) => i !== idx))
                  },
                  {
                    title: "Prices",
                    desc: "Add prices",
                    action: "+ Add prices",
                    list: pricesList,
                    onAdd: () => {
                      const val = prompt("Enter price item (e.g. Basic Plan - ₹499/mo):");
                      if (val) setPricesList(prev => [...prev, val]);
                    },
                    onRemove: (idx: number) => setPricesList(prev => prev.filter((_, i) => i !== idx))
                  },
                  {
                    title: "Messages",
                    desc: "Add a message",
                    action: "+ Add message",
                    list: messagesList,
                    onAdd: () => {
                      const val = prompt("Enter message asset text:");
                      if (val) setMessagesList(prev => [...prev, val]);
                    },
                    onRemove: (idx: number) => setMessagesList(prev => prev.filter((_, i) => i !== idx))
                  },
                  {
                    title: "Structured snippets",
                    desc: "Add snippets of text",
                    action: "+ Add snippets",
                    list: snippetsList,
                    onAdd: () => {
                      const val = prompt("Enter structured snippet (e.g. Brands: Nike, Adidas):");
                      if (val) setSnippetsList(prev => [...prev, val]);
                    },
                    onRemove: (idx: number) => setSnippetsList(prev => prev.filter((_, i) => i !== idx))
                  },
                  {
                    title: "Lead forms",
                    desc: "Add lead forms",
                    action: "+ Add lead form",
                    list: leadFormsList,
                    onAdd: () => {
                      const val = prompt("Enter lead form title:");
                      if (val) setLeadFormsList(prev => [...prev, val]);
                    },
                    onRemove: (idx: number) => setLeadFormsList(prev => prev.filter((_, i) => i !== idx))
                  },
                  {
                    title: "Callouts",
                    desc: "Add more business information",
                    action: "+ Add callouts",
                    list: calloutsList,
                    onAdd: () => {
                      const val = prompt("Enter callout text (e.g. 24/7 Support):");
                      if (val) setCalloutsList(prev => [...prev, val]);
                    },
                    onRemove: (idx: number) => setCalloutsList(prev => prev.filter((_, i) => i !== idx))
                  }
                ].map((mat, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{mat.title} ({mat.list.length})</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{mat.desc}</p>
                    </div>

                    {mat.list.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {mat.list.map((item, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-900">
                            {item}
                            <button onClick={() => mat.onRemove(i)}>
                              <X className="h-3 w-3 hover:text-rose-400" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={mat.onAdd}
                      className="text-xs text-blue-600 font-semibold hover:underline text-left pt-1 cursor-pointer flex items-center gap-1"
                    >
                      {mat.action}
                    </button>
                  </div>
                ))}
              </div>

              {/* More Options Accordion with Toggle ^ icon */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div
                  onClick={() => setShowAssetGroupMoreOptions(prev => !prev)}
                  className="flex items-center justify-between cursor-pointer group py-1"
                >
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-all">More options</h3>
                  {showAssetGroupMoreOptions ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                  )}
                </div>

                {showAssetGroupMoreOptions && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Display Path */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">Display path</h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-mono">japatracker-7f759.web.app /</span>
                        <div className="space-y-0.5 flex-1 max-w-[120px]">
                          <input
                            type="text"
                            maxLength={15}
                            value={displayPath1}
                            onChange={(e) => setDisplayPath1(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-500 block text-right">{displayPath1.length} / 15</span>
                        </div>
                        <span className="text-slate-400 font-mono">/</span>
                        <div className="space-y-0.5 flex-1 max-w-[120px]">
                          <input
                            type="text"
                            maxLength={15}
                            value={displayPath2}
                            onChange={(e) => setDisplayPath2(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-500 block text-right">{displayPath2.length} / 15</span>
                        </div>
                      </div>
                    </div>

                    {/* Final URL for Mobile */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">Final URL for mobile</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useMobileFinalUrl}
                          onChange={(e) => setUseMobileFinalUrl(e.target.checked)}
                          className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                        />
                        <span className="text-xs text-slate-700 font-medium">Use a different final URL for mobile</span>
                      </label>
                      {useMobileFinalUrl && (
                        <div className="pt-1 animate-in fade-in duration-200">
                          <input
                            type="text"
                            value={mobileFinalUrl}
                            onChange={(e) => setMobileFinalUrl(e.target.value)}
                            placeholder="Final URL for mobile (e.g. https://m.yourwebsite.com)"
                            className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Asset Group URL Options */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">Asset group URL options</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-[11px]">Tracking template</label>
                          <input
                            type="text"
                            value={assetGroupTrackingTemplate}
                            onChange={(e) => setAssetGroupTrackingTemplate(e.target.value)}
                            placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-400 text-[11px]">Final URL suffix</label>
                          <input
                            type="text"
                            value={assetGroupFinalUrlSuffix}
                            onChange={(e) => setAssetGroupFinalUrlSuffix(e.target.value)}
                            placeholder="Example: param1=value1&param2=value2"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2 pt-1">
                          <label className="block text-slate-400 text-[11px]">Custom parameter</label>
                          {assetGroupCustomParams.map((cp, idx) => (
                            <div key={cp.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={cp.name}
                                onChange={(e) => {
                                  const newCP = [...assetGroupCustomParams];
                                  newCP[idx].name = e.target.value;
                                  setAssetGroupCustomParams(newCP);
                                }}
                                placeholder="{_Name}"
                                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 w-1/3 focus:outline-none focus:border-blue-500"
                              />
                              <span className="text-slate-400">=</span>
                              <input
                                type="text"
                                value={cp.value}
                                onChange={(e) => {
                                  const newCP = [...assetGroupCustomParams];
                                  newCP[idx].value = e.target.value;
                                  setAssetGroupCustomParams(newCP);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* URL Rules */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900">URL rules</h4>
                      <p className="text-xs text-slate-400">
                        Create URL rules or specify which URLs from page feeds to use for your ads
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Call to action */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Call to action</h2>
              <select
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="AUTOMATIC">Automated</option>
                <option value="APPLY_NOW">Apply now</option>
                <option value="BOOK_NOW">Book now</option>
                <option value="CONTACT_US">Contact us</option>
              </select>
            </div>

            {/* Asset optimization Drawer Bar */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Asset optimization</span>
              <span className="text-slate-400">Text customization, final URL expansion, and 2 more are turned on</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            {/* Signals Card (Search Themes & Audience Signals) */}
            <div className="space-y-6 pt-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Signals</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Signals provide valuable information about the people you want to reach. They help guide who sees your ads on Google Search, YouTube, and more.
                </p>
              </div>

              {/* Search Themes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Search themes</h3>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-700 flex items-center gap-1.5">
                    What are some words or phrases people use when searching for your products or services?
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  </p>
                  <input
                    type="text"
                    placeholder="Add search themes (up to 50)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Audience Signal */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Audience signal</h3>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <p className="text-xs text-slate-700 flex items-center gap-1.5">
                    Reach the right customers faster across Google with an audience signal.
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  </p>
                  <button
                    onClick={() => setShowSavedAudienceModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-750 transition-all shrink-0 cursor-pointer"
                  >
                    Add saved audience signal
                  </button>
                </div>

                {/* Your Data Sub-card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-slate-900">Your data</h4>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                  
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    First-party data can help us reach your customers
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  </p>

                  <div className="relative max-w-lg">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Add your data"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Additional Signals Accordion */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <div
                    onClick={() => setShowAdditionalSignalsAccordion(prev => !prev)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span>Additional signals</span>
                    </div>
                    {showAdditionalSignalsAccordion ? (
                      <ChevronUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>

                  {showAdditionalSignalsAccordion && (
                    <div className="p-4 pt-0 space-y-4 border-t border-slate-200 animate-in fade-in duration-200 text-xs">
                      {/* Interests & detailed demographics */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Interests & detailed demographics</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Add any interests, detailed demographics, or life events related to your customers
                          </p>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={additionalInterestsInput}
                            onChange={(e) => setAdditionalInterestsInput(e.target.value)}
                            placeholder="Add in-market segments, life events, and more"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Demographics */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Demographics</h4>
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">All demographics (recommended)</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Audience Name (Optional) Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Audience name</h4>
                    <span className="text-[11px] text-slate-400">Add a name for your audience to save it to your library (optional)</span>
                  </div>
                  <input
                    type="text"
                    value={audienceName}
                    onChange={(e) => setAudienceName(e.target.value)}
                    placeholder="Enter audience name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Right Preview Sidebar */}
          <aside className="w-80 border-l border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/40 hidden lg:block">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Ad strength</span>
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full rounded-full"></div>
              </div>
              <p className="text-right text-xs font-bold text-emerald-400">Excellent</p>
            </div>

            {/* Live Search Ad Preview Box */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                <span>Search ad preview</span>
                <span className="text-[10px] text-slate-500 font-normal">Google Search</span>
              </h3>

              <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs space-y-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-900">Sponsored</span>
                  <span>•</span>
                  <span className="text-slate-700 font-mono truncate">{assetFinalUrl}</span>
                </div>

                <div className="text-sm font-semibold text-blue-400 leading-snug hover:underline cursor-pointer">
                  {headlines[0]} | {headlines[1]}
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {descriptions[0]}
                </p>

                {sitelinks.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[10px]">
                    <span className="text-blue-400 hover:underline">{sitelinks[0].title}</span>
                    <span className="text-blue-400 hover:underline">{sitelinks[1].title}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed">
                Previews shown here are examples and don't include all possible formats.
              </p>
            </div>
          </aside>
        </div>
      ) : wizardStep === "BUDGET" ? (
        <div className="flex-1 flex w-full pb-20">
          {/* Left Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/50 hidden md:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Performance Max
              </div>
            </div>

            <nav className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BIDDING")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Bidding
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Campaign settings
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("ASSET_GROUP")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Asset group
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">4</div>
                  Budget
                </div>
                <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                  <p className="text-blue-600 font-semibold">Budget</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-200 flex items-center justify-center text-[10px]">5</div>
                Summary
              </div>
            </nav>
          </aside>

          {/* Budget Main Content */}
          <main className="flex-1 p-6 md:p-10 space-y-8 max-w-4xl">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Budget</h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Decide how much you want to spend.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Budget</h2>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                <p className="leading-relaxed">
                  Your budget type (daily or campaign total) can't be changed once this campaign has started. You can change your budget amount at any time.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-900">Select budget type</label>

                {/* 1. Average Daily Budget */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="budgetTypeRadio"
                      checked={budgetType === "DAILY"}
                      onChange={() => setBudgetType("DAILY")}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-900 block">Average daily budget</span>
                      <span className="text-[11px] text-slate-400 block">Set your average daily budget for this campaign</span>
                    </div>
                  </label>

                  {budgetType === "DAILY" && (
                    <div className="ml-7 space-y-3 animate-in fade-in duration-200">
                      
                      {/* Option A: ₹6,097.08 */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <label
                          onClick={() => setSelectedPresetBudget("6097.08")}
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="presetBudgetRadio"
                              checked={selectedPresetBudget === "6097.08"}
                              onChange={() => setSelectedPresetBudget("6097.08")}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900">₹6,097.08</span>
                              {selectedPresetBudget === "6097.08" && (
                                <span className="text-[11px] text-slate-400 block font-normal">Average daily budget</span>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${selectedPresetBudget === "6097.08" ? "rotate-180" : ""}`} />
                        </label>

                        {selectedPresetBudget === "6097.08" && (
                          <div className="p-4 border-t border-slate-200 bg-white space-y-2 animate-in fade-in duration-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly conv.</span>
                                <span className="text-xs font-bold text-slate-900">35</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Cost / conv.</span>
                                <span className="text-xs font-bold text-slate-900">₹1,188.85</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly cost</span>
                                <span className="text-xs font-bold text-slate-900">₹42,679.56</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option B: ₹5,080.90 Recommended */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <label
                          onClick={() => setSelectedPresetBudget("5080.90")}
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="presetBudgetRadio"
                              checked={selectedPresetBudget === "5080.90"}
                              onChange={() => setSelectedPresetBudget("5080.90")}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">₹5,080.90</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold text-[10px]">Recommended</span>
                              </div>
                              {selectedPresetBudget === "5080.90" && (
                                <span className="text-[11px] text-slate-400 block font-normal mt-0.5">Average daily budget</span>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${selectedPresetBudget === "5080.90" ? "rotate-180" : ""}`} />
                        </label>

                        {selectedPresetBudget === "5080.90" && (
                          <div className="p-4 border-t border-slate-200 bg-white space-y-3 animate-in fade-in duration-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly conv.</span>
                                <span className="text-xs font-bold text-slate-900">32</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Cost / conv.</span>
                                <span className="text-xs font-bold text-slate-900">₹1,084.34</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly cost</span>
                                <span className="text-xs font-bold text-slate-900">₹35,566.30</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-200">
                              Recommended because of your campaign settings, such as bidding, targeting and ads, as well as the budgets of similar advertisers.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Option C: ₹4,064.72 */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <label
                          onClick={() => setSelectedPresetBudget("4064.72")}
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="presetBudgetRadio"
                              checked={selectedPresetBudget === "4064.72"}
                              onChange={() => setSelectedPresetBudget("4064.72")}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900">₹4,064.72</span>
                              {selectedPresetBudget === "4064.72" && (
                                <span className="text-[11px] text-slate-400 block font-normal">Average daily budget</span>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${selectedPresetBudget === "4064.72" ? "rotate-180" : ""}`} />
                        </label>

                        {selectedPresetBudget === "4064.72" && (
                          <div className="p-4 border-t border-slate-200 bg-white space-y-2 animate-in fade-in duration-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly conv.</span>
                                <span className="text-xs font-bold text-slate-900">29</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Cost / conv.</span>
                                <span className="text-xs font-bold text-slate-900">₹971.09</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly cost</span>
                                <span className="text-xs font-bold text-slate-900">₹28,453.04</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option D: Set custom budget */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <label
                          onClick={() => setSelectedPresetBudget("CUSTOM")}
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="presetBudgetRadio"
                              checked={selectedPresetBudget === "CUSTOM"}
                              onChange={() => setSelectedPresetBudget("CUSTOM")}
                              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="text-xs font-semibold text-slate-900">Set custom budget</span>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${selectedPresetBudget === "CUSTOM" ? "rotate-180" : ""}`} />
                        </label>

                        {selectedPresetBudget === "CUSTOM" && (
                          <div className="p-4 border-t border-slate-200 bg-white space-y-4 animate-in fade-in duration-200">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-700">Set your average daily budget for this campaign</label>
                              <div className="relative w-64">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-200 pt-3">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly conv.</span>
                                <span className="text-xs font-bold text-slate-900">29</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Cost / conv.</span>
                                <span className="text-xs font-bold text-slate-900">₹971.09</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Weekly cost</span>
                                <span className="text-xs font-bold text-slate-900">₹28,453.04</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lower Budget Warning Banner */}
                      {(selectedPresetBudget === "4064.72" || (selectedPresetBudget === "CUSTOM" && Number(customBudgetValue.replace(/,/g, "")) < 5080.90)) && (
                        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                          <p className="leading-relaxed">
                            Your budget is lower than other advertisers' budgets, which may affect performance. Try raising it to at least <strong>₹5,080.90</strong> per day
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        For the month, you won't pay more than your daily budget times the average number of days in a month. Some days you might spend less than your daily budget, and on others you might spend up to twice as much. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more</a>
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Campaign Total Budget */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="budgetTypeRadio"
                      checked={budgetType === "TOTAL"}
                      onChange={() => setBudgetType("TOTAL")}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-900 block">Campaign total budget</span>
                      <span className="text-[11px] text-slate-400 block">Set a budget for the duration of your campaign</span>
                    </div>
                  </label>

                  {budgetType === "TOTAL" && (
                    <div className="ml-7 space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <div className="relative w-64">
                          <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                          <input
                            type="text"
                            value={customBudgetValue}
                            onChange={(e) => setCustomBudgetValue(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Campaign dates */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900">Campaign dates</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            To set a campaign total budget add the dates of your campaign
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700">Start date</label>
                            <input
                              type="date"
                              value={startDateValue}
                              onChange={(e) => setStartDateValue(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 font-mono pt-0.5">
                              {new Date(startDateValue || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700">End date</label>
                            <input
                              type="date"
                              value={endDateValue}
                              onChange={(e) => {
                                setEndDateValue(e.target.value);
                                setEndDateMode("SELECT");
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 pt-0.5">
                              {endDateMode === "NONE" ? "Select a date" : new Date(endDateValue).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </main>
        </div>
      ) : wizardStep === "SUMMARY" ? (
        <div className="flex-1 flex w-full pb-20">
          {/* Left Sub-Navigation Sidebar */}
          <aside className="w-64 border-r border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/50 hidden md:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Performance Max
              </div>
            </div>

            <nav className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BIDDING")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Bidding
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Campaign settings
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("ASSET_GROUP")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Asset group
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer hover:text-slate-900" onClick={() => setWizardStep("BUDGET")}>
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">✓</div>
                Budget
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-600">
                  <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px]">5</div>
                  Summary
                </div>
                <div className="ml-6 space-y-1 text-slate-400 border-l border-slate-200 pl-3 py-1">
                  <p className="text-blue-600 font-semibold">Overview</p>
                </div>
              </div>
            </nav>
          </aside>

          {/* Summary Main Content */}
          <main className="flex-1 p-6 md:p-10 space-y-8 max-w-4xl">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Your campaign is ready to publish
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Summary</h1>
              <p className="text-xs text-slate-400 mt-1">Review your campaign details before publishing</p>
            </div>

            {/* Recommendations Banner */}
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Recommendations</span>
                <span className="text-[11px] text-slate-500 font-mono">1 / 1</span>
              </div>
              <p className="text-xs text-slate-400">Apply these recommendations to optimize campaign performance</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mt-2">
                <span className="font-semibold text-slate-900">Add an audience signal for faster optimization</span>
                <button
                  onClick={() => setWizardStep("ASSET_GROUP")}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Fix it
                </button>
              </div>
            </div>

            {/* Overview Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Overview</h2>
                <button
                  onClick={() => setIsEditingOverview(prev => !prev)}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {isEditingOverview ? "Done" : "Edit"}
                </button>
              </div>

              {isEditingOverview ? (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Campaign name</label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Website URL</label>
                    <input
                      type="text"
                      value={assetFinalUrl}
                      onChange={(e) => {
                        setAssetFinalUrl(e.target.value);
                        setWebsiteVisitsUrl(e.target.value);
                      }}
                      placeholder="https://yourwebsite.com"
                      className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign name</span>
                    <p className="font-semibold text-slate-900 text-sm">{campaignName || "Sales-Performance Max-1"}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Campaign type</span>
                    <p className="font-semibold text-slate-900">Performance Max</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Goal</span>
                    <p className="font-semibold text-slate-900">
                      {conversionGoals.length > 0 ? conversionGoals.map(g => g.name).join(", ") : "Phone call leads"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Business details</span>
                    <p className="font-semibold text-slate-900 truncate">
                      Website: {assetFinalUrl.trim() || websiteVisitsUrl.trim() || "None specified"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bidding Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Bidding</h2>
                <button
                  onClick={() => setIsEditingBidding(prev => !prev)}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {isEditingBidding ? "Done" : "Edit"}
                </button>
              </div>

              {isEditingBidding ? (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Bidding strategy</label>
                    <select
                      value={biddingFocus}
                      onChange={(e) => setBiddingFocus(e.target.value as any)}
                      className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Conversions">Maximize conversions</option>
                      <option value="Conversion value">Maximize conversion value</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={onlyNewCustomers}
                      onChange={(e) => setOnlyNewCustomers(e.target.checked)}
                      className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                    />
                    <span className="text-slate-700">Only bid for new customers</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Bidding strategy</span>
                    <p className="font-semibold text-slate-900">
                      {biddingFocus === "Conversions" ? "Maximize conversions" : "Maximize conversion value"}
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-slate-200 pt-2">
                    <span className="text-slate-400">Customer acquisition</span>
                    <p className="font-semibold text-slate-900">
                      {onlyNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-slate-200 pt-2">
                    <span className="text-slate-400">Customer retention</span>
                    <p className="font-semibold text-slate-900">Do not adjust bidding to re-engage lapsed customers</p>
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Settings Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Campaign settings</h2>
                <button
                  onClick={() => setIsEditingSettings(prev => !prev)}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {isEditingSettings ? "Done" : "Edit"}
                </button>
              </div>

              {isEditingSettings ? (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Location</label>
                    <select
                      value={locationOption}
                      onChange={(e) => setLocationOption(e.target.value as any)}
                      className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="ALL">All countries and territories</option>
                      <option value="INDIA">India</option>
                      <option value="CUSTOM">Enter another location</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Locations</span>
                    <p className="font-semibold text-slate-900">
                      {locationOption === "ALL" ? "All countries and territories" : locationOption === "INDIA" ? "India" : "Selected location"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">Languages</span>
                    <p className="font-semibold text-slate-900">
                      {selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "English"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400">EU political ads</span>
                    <p className="font-semibold text-slate-900">Doesn't have EU political ads</p>
                  </div>
                </div>
              )}
            </div>

            {/* Asset Group Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Asset group</h2>
                <button
                  onClick={() => setIsEditingAssetGroup(prev => !prev)}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {isEditingAssetGroup ? "Done" : "Edit"}
                </button>
              </div>

              {isEditingAssetGroup ? (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Asset Group Name</label>
                    <input
                      type="text"
                      value={assetGroupName}
                      onChange={(e) => setAssetGroupName(e.target.value)}
                      className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Asset group name</span>
                    <p className="font-semibold text-slate-900">{assetGroupName || "Asset Group 1"}</p>
                  </div>

                  <div className="space-y-1 border-t border-slate-200 pt-2">
                    <span className="text-slate-400">Assets</span>
                    <p className="font-semibold text-slate-900">
                      {headlines.filter(h => h.trim()).length} headlines, {longHeadlines.filter(lh => lh.trim()).length} long headlines, {descriptions.filter(d => d.trim()).length} descriptions, {uploadedImages.length} images, {sitelinks.length} sitelinks
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-slate-200 pt-2">
                    <span className="text-slate-400">Asset optimization</span>
                    <p className="font-semibold text-slate-900">Text customization, final URL expansion, and 2 more are turned on</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-2">
                    <div className="space-y-1">
                      <span className="text-slate-400">Search themes</span>
                      <p className="font-medium text-slate-900">
                        {searchThemes.length > 0 ? searchThemes.join(", ") : "No themes added"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400">Audience</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {audienceName || modalAudienceName || "Custom Audience Signal"}
                        </span>
                        <button onClick={() => setWizardStep("ASSET_GROUP")} className="text-blue-600 font-semibold hover:underline">Edit</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Budget</h2>
                <button
                  onClick={() => setIsEditingBudget(prev => !prev)}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {isEditingBudget ? "Done" : "Edit"}
                </button>
              </div>

              {isEditingBudget ? (
                <div className="space-y-4 text-xs animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Select Budget Preset / Custom (₹)</label>
                    <input
                      type="text"
                      value={customBudgetValue}
                      onChange={(e) => {
                        setSelectedPresetBudget("CUSTOM");
                        setCustomBudgetValue(e.target.value);
                      }}
                      placeholder="e.g. 5080.90"
                      className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400">{budgetType === "DAILY" ? "Average Daily Budget" : "Campaign Total Budget"}</span>
                  <p className="font-bold text-blue-600 text-base">
                    ₹{selectedPresetBudget === "CUSTOM" ? customBudgetValue : selectedPresetBudget} {budgetType === "DAILY" ? "/ day" : "total"}
                  </p>
                </div>
              )}
            </div>

          </main>

          {/* Right Summary Sidebar with Weekly Performance Estimates */}
          <aside className="w-72 border-l border-slate-200 p-6 space-y-6 shrink-0 bg-slate-50/40 hidden lg:block">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Optimization score</span>
                <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 text-white w-full rounded-full"></div>
              </div>
              <p className="text-right text-xs font-bold text-blue-600">100%</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h3 className="text-xs font-semibold text-slate-900">Weekly performance</h3>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Weekly conv.</span>
                  <span className="font-bold text-slate-900">16</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cost / Conv.</span>
                  <span className="font-bold text-slate-900">₹664.50</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-400">Weekly cost</span>
                  <span className="font-bold text-blue-600">₹10,897.81</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10 pb-28">

        {/* Step Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">What's your campaign objective?</h1>
          <p className="text-sm text-slate-400">
            Select an objective to tailor your experience to the goals and settings that will work best for your campaign
          </p>
        </div>

        {/* Objective Grid */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select the goal that would make this campaign successful to you
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {OBJECTIVES.map((obj) => {
              const isSelected = selectedObjective === obj.id;
              return (
                <div
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjective(obj.id);
                    setSelectedType(""); // Reset campaign type on objective change
                  }}
                  className={`relative cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between min-h-[120px] ${isSelected
                      ? "bg-blue-600 text-white/10 border-blue-500 shadow-md shadow-primary/10 ring-1 ring-primary"
                      : "bg-white border-slate-200 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-sm font-semibold mb-1 pr-5 ${isSelected ? "text-blue-600" : "text-slate-900"}`}>
                      {obj.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {obj.desc}
                    </p>
                  </div>
                  {obj.badge && (
                    <span className="mt-3 text-[10px] text-slate-500 italic block">
                      {obj.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Section for Objectives */}
        {(selectedObjective === "SALES" || selectedObjective === "LEADS" || selectedObjective === "WEBSITE_TRAFFIC" || selectedObjective === "APP_PROMOTION" || selectedObjective === "AWARENESS" || selectedObjective === "LOCAL" || selectedObjective === "NO_GUIDANCE") && (
          <div className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in duration-300">

            {/* Conversion Goals Section (shown for Sales, Leads, Traffic) */}
            {(selectedObjective === "SALES" || selectedObjective === "LEADS" || selectedObjective === "WEBSITE_TRAFFIC") && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Use these conversion goals to improve {selectedObjective === "SALES" ? "Sales" : selectedObjective === "LEADS" ? "Leads" : "Website traffic"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance, even if they don't seem directly related to Sales.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white/10 border border-blue-500/30 text-blue-600 hover:bg-blue-600 text-white/20 text-xs font-semibold transition-all shrink-0 ml-4"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add goal
                  </button>
                </div>

                {/* Goal List Table/Card */}
                <div className="border border-slate-200 rounded-lg overflow-visible bg-slate-50">
                  <div className="grid grid-cols-12 px-4 py-2.5 bg-white text-xs font-semibold text-slate-400 border-b border-slate-200">
                    <div className="col-span-5">Conversion Goals</div>
                    <div className="col-span-3">Conversion Source</div>
                    <div className="col-span-2 text-right">Conversion Actions</div>
                    <div className="col-span-2 text-right">More actions</div>
                  </div>

                  {conversionGoals.map((goal) => {
                    const GoalIcon = goal.icon || PhoneCall;
                    const isMenuOpen = openGoalMenuId === goal.id;
                    return (
                      <div key={goal.id} className="grid grid-cols-12 px-4 py-3 text-sm text-slate-900 border-b border-slate-200 items-center last:border-b-0 hover:bg-slate-100/20 relative">
                        <div className="col-span-5 font-medium text-slate-900 flex items-center gap-2">
                          <GoalIcon className="h-4 w-4 text-blue-600 shrink-0" />
                          {goal.name}
                        </div>
                        <div className="col-span-3 text-xs text-slate-400">{goal.source}</div>
                        <div className="col-span-2 text-right text-xs text-slate-400">{goal.count}</div>
                        <div className="col-span-2 text-right relative">
                          <button
                            onClick={() => setOpenGoalMenuId(isMenuOpen ? null : goal.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs"
                          >
                            More actions ▾
                          </button>
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left">
                              <button
                                onClick={() => {
                                  setConversionGoals(prev => prev.filter(g => g.id !== goal.id));
                                  setOpenGoalMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-slate-100 flex items-center gap-2 text-left"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove Goal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal: Add Additional Conversion Goals */}
            {showAddGoalModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-base font-semibold text-slate-900">Add conversion goal</h3>
                    <button onClick={() => setShowAddGoalModal(false)} className="text-slate-400 hover:text-slate-900 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Select additional conversion goals to add to your Sales campaign objective:
                  </p>

                  <div className="space-y-2">
                    {ALL_CONVERSION_GOALS.map((addGoal) => {
                      const isAlreadyAdded = conversionGoals.some(g => g.id === addGoal.id);
                      const AddIcon = addGoal.icon;
                      return (
                        <div
                          key={addGoal.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isAlreadyAdded ? "bg-slate-50 border-slate-200 opacity-60" : "bg-slate-100 border-slate-200 hover:border-slate-600"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <AddIcon className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{addGoal.name}</p>
                              <p className="text-xs text-slate-400">{addGoal.source}</p>
                            </div>
                          </div>
                          <button
                            disabled={isAlreadyAdded}
                            onClick={() => {
                              setConversionGoals(prev => [...prev, addGoal]);
                              setShowAddGoalModal(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isAlreadyAdded
                                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-secondary"
                              }`}
                          >
                            {isAlreadyAdded ? "Added" : "Add Goal"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowAddGoalModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Goal Chooser for AWARENESS objective */}
            {selectedObjective === "AWARENESS" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Choose a campaign goal</h2>
                  <p className="text-xs text-slate-400 mt-1">Each goal determines which metrics the campaign is optimized to deliver.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: "views",
                      title: "Video views",
                      badge: "Suggested",
                      desc: "Get people to watch your video ads",
                      goodFor: "Finding people who are more likely to be interested in your product or brand, and consider it when deciding to make a purchase\n• Increasing the number of online searches for your product or brand\n• Getting more people to watch your entire video ad",
                      optimizedFor: "TrueView views"
                    },
                    {
                      id: "reach",
                      title: "Reach",
                      desc: "Reach the maximum number of people",
                      goodFor: "Getting more people familiar with your product or brand\n• Reaching the maximum number of unique users at your desired frequency",
                      optimizedFor: "Unique users, Impressions"
                    },
                    {
                      id: "subscriptions",
                      title: "YouTube subscriptions and engagements",
                      desc: "Get people to subscribe and engage with your YouTube channel",
                      goodFor: "Building a subscriber base and driving community interactions",
                      optimizedFor: "Engagements, Subscriptions"
                    }
                  ].map((goal) => {
                    const isSel = videoGoal === goal.id;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => {
                          setVideoGoal(goal.id as any);
                          setSelectedType(""); // Reset selected campaign type when video goal changes
                        }}
                        className={`relative cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${isSel
                            ? "bg-blue-600 text-white/10 border-blue-500 shadow-md ring-1 ring-primary"
                            : "bg-slate-50 border-slate-200 hover:border-slate-200"
                          }`}
                      >
                        {isSel && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-semibold ${isSel ? "text-blue-600" : "text-slate-900"}`}>
                              {goal.title}
                            </h3>
                            {goal.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white/20 text-blue-600 text-[10px] font-bold">
                                {goal.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-3">{goal.desc}</p>
                          <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                            <p><strong className="text-slate-700">Good for:</strong> {goal.goodFor}</p>
                            <p><strong className="text-slate-700">Optimized to get more:</strong> {goal.optimizedFor}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Campaign Type Selection based on selected Conversion Goals & Video Goals */}
            {(() => {
              const hasContacts = conversionGoals.some(g => g.id === "contacts");
              const hasDirections = conversionGoals.some(g => g.id === "get_directions");

              let baseCampaignTypes = CAMPAIGN_TYPES_SALES;
              if (selectedObjective === "LEADS") baseCampaignTypes = CAMPAIGN_TYPES_LEADS;
              if (selectedObjective === "WEBSITE_TRAFFIC") baseCampaignTypes = CAMPAIGN_TYPES_TRAFFIC;
              if (selectedObjective === "APP_PROMOTION") baseCampaignTypes = CAMPAIGN_TYPES_APP;
              if (selectedObjective === "LOCAL") baseCampaignTypes = CAMPAIGN_TYPES_LOCAL;
              if (selectedObjective === "NO_GUIDANCE") baseCampaignTypes = CAMPAIGN_TYPES_NO_GUIDANCE;

              let visibleCampaignTypes = baseCampaignTypes;

              if (selectedObjective === "AWARENESS") {
                if (videoGoal === "views") {
                  visibleCampaignTypes = [
                    {
                      id: "VIDEO",
                      title: "Video",
                      desc: "Reach viewers on YouTube and get conversions",
                      icon: Video
                    }
                  ];
                } else if (videoGoal === "reach") {
                  visibleCampaignTypes = [
                    {
                      id: "VIDEO",
                      title: "Video",
                      desc: "Reach viewers on YouTube and get conversions",
                      icon: Video
                    },
                    {
                      id: "DISPLAY",
                      title: "Display",
                      desc: "Reach potential customers across 3 million sites and apps with your creative",
                      icon: LayoutGrid
                    }
                  ];
                } else if (videoGoal === "subscriptions") {
                  visibleCampaignTypes = [
                    {
                      id: "DEMAND_GEN",
                      title: "Demand Gen",
                      desc: "Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads",
                      icon: Zap
                    }
                  ];
                }
              } else if (selectedObjective !== "APP_PROMOTION" && selectedObjective !== "LOCAL" && selectedObjective !== "NO_GUIDANCE") {
                if (hasContacts) {
                  // If Contacts goal is present (whether alone with Phone leads, or with Get Directions, or all three): ONLY Performance Max
                  visibleCampaignTypes = baseCampaignTypes.filter(ct => ct.id === "PERFORMANCE_MAX");
                } else if (hasDirections && !hasContacts) {
                  // If Get directions is present (without Contacts): Performance Max, Search, Shopping
                  visibleCampaignTypes = baseCampaignTypes.filter(ct => ["PERFORMANCE_MAX", "SEARCH", "SHOPPING"].includes(ct.id));
                } else {
                  // Only Phone call leads: All 6 campaign types available
                  visibleCampaignTypes = baseCampaignTypes;
                }
              }

              const isOverride = (selectedObjective !== "APP_PROMOTION" && selectedObjective !== "AWARENESS" && selectedObjective !== "LOCAL" && selectedObjective !== "NO_GUIDANCE") && (conversionGoals.length > 1 || !conversionGoals.every(g => g.id === "phone_leads"));
              const prefix = selectedObjective === "LEADS" ? "Leads" : selectedObjective === "WEBSITE_TRAFFIC" ? "Website traffic" : selectedObjective === "APP_PROMOTION" ? "App promotion" : selectedObjective === "AWARENESS" ? "YouTube reach" : selectedObjective === "LOCAL" ? "Local store" : selectedObjective === "NO_GUIDANCE" ? "Campaign" : "Sales";

              return (
                <div className="space-y-6 pt-2">
                  {/* Override Warning Notice if goals differ from account defaults */}
                  {isOverride && (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <p className="font-semibold text-amber-200">Review your goals for this campaign</p>
                        <p className="text-amber-400/80 mt-0.5">This change overrides your account goals setup</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Select a campaign type</h2>
                      <p className="text-xs text-slate-400">Choose how you want to reach potential buyers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {visibleCampaignTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedType === type.id;
                        return (
                          <div
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`relative cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${isSelected
                                ? "bg-blue-600 text-white/10 border-blue-500 ring-1 ring-primary"
                                : "bg-white border-slate-200 hover:border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Check className="h-3 w-3 text-white stroke-[3]" />
                              </div>
                            )}
                            <div>
                              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white/10 text-blue-600 flex items-center justify-center mb-3">
                                <Icon className="h-4 w-4" />
                              </div>
                              <h3 className={`text-sm font-semibold mb-1 ${isSelected ? "text-blue-600" : "text-slate-900"}`}>
                                {type.title}
                              </h3>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {type.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedObjective === "LOCAL" && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        Performance Max has replaced Local campaigns. Performance Max brings you the same optimization benefits, including store visits, call clicks, and directions to help you meet your offline goals.{" "}
                        <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more</a>
                      </p>
                    )}
                  </div>

                  {/* Dynamic Sub-Flow Options when selecting a Campaign Type */}

                  {/* 1. PERFORMANCE MAX */}
                  {selectedType === "PERFORMANCE_MAX" && (
                    <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-white space-y-5 animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-slate-900">Would you like to resume from an existing campaign draft?</h3>
                        <p className="text-xs text-slate-400">
                          Your account has existing campaign drafts with the same campaign type, allowing you to continue where you last left off setting up your campaign
                        </p>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900">{prefix}-Performance Max-4</p>
                          <p className="text-xs text-slate-500">Last modified less than a day ago • Performance Max</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Resuming draft ${prefix}-Performance Max-4`)}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white/10 border border-blue-500/30 text-blue-600 font-semibold text-xs hover:bg-blue-600 text-white/20 transition-all"
                          >
                            Continue from draft
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 space-y-4">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Create a new campaign</h4>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign name</label>
                          <input
                            defaultValue={`${prefix}-Performance Max-5`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700">Where should people go after clicking your ads?</label>
                          <p className="text-xs text-slate-400">
                            Think about the product or service you want to sell and enter the URL you want people to see after clicking your ads. This might be your homepage or a more specific page on your website.
                          </p>
                          <input
                            placeholder="Final URL (e.g. https://yourwebsite.com/product)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SEARCH */}
                  {selectedType === "SEARCH" && (
                    <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-white space-y-5 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign name</label>
                        <input
                          key={`${prefix}-Search`}
                          defaultValue={selectedObjective === "NO_GUIDANCE" ? "Search-1" : `${prefix}-Search-1`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>

                      {/* Conversion Goals Table for No Guidance */}
                      {selectedObjective === "NO_GUIDANCE" && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700">Use these conversion goals for campaign performance optimization</h4>
                              <p className="text-xs text-slate-400 mt-0.5">Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance</p>
                            </div>
                            <button
                              onClick={() => setShowAddGoalModal(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white/10 border border-blue-500/30 text-blue-600 hover:bg-blue-600 text-white/20 text-xs font-semibold transition-all shrink-0 ml-4"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add goal
                            </button>
                          </div>
                          <div className="border border-slate-200 rounded-lg overflow-visible bg-slate-50">
                            <div className="grid grid-cols-12 px-4 py-2 bg-white text-xs font-semibold text-slate-400 border-b border-slate-200">
                              <div className="col-span-5">Conversion Goals</div>
                              <div className="col-span-3">Conversion Source</div>
                              <div className="col-span-2 text-right">Conversion Actions</div>
                              <div className="col-span-2 text-right">More actions</div>
                            </div>
                            {conversionGoals.map((goal) => {
                              const GoalIcon = goal.icon || PhoneCall;
                              const isMenuOpen = openGoalMenuId === `noguidance-${goal.id}`;
                              return (
                                <div key={goal.id} className="grid grid-cols-12 px-4 py-2.5 text-xs text-slate-900 border-b border-slate-200 items-center last:border-b-0 hover:bg-slate-100/20 relative">
                                  <div className="col-span-5 font-medium text-slate-900 flex items-center gap-2">
                                    <GoalIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                    {goal.name}
                                  </div>
                                  <div className="col-span-3 text-slate-400">{goal.source}</div>
                                  <div className="col-span-2 text-right text-slate-400">{goal.count}</div>
                                  <div className="col-span-2 text-right relative">
                                    <button
                                      onClick={() => setOpenGoalMenuId(isMenuOpen ? null : `noguidance-${goal.id}`)}
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs"
                                    >
                                      More actions ▾
                                    </button>
                                    {isMenuOpen && (
                                      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left">
                                        <button
                                          onClick={() => {
                                            setConversionGoals(prev => prev.filter(g => g.id !== goal.id));
                                            setOpenGoalMenuId(null);
                                          }}
                                          className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-slate-100 flex items-center gap-2 text-left"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Remove Goal
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedObjective !== "NO_GUIDANCE" && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <label className="block text-xs font-semibold text-slate-700">Select the ways you'd like to reach your goal</label>
                          <div className="space-y-2">
                            {[
                              { id: "website_visits", label: "Website visits", placeholder: "Your business's website (e.g. https://yourwebsite.com)" },
                              { id: "phone_calls", label: "Phone calls", countrySelect: true, placeholder: "Example: (201) 555-0123" },
                              { id: "store_visits", label: "Store visits", desc: "Reach customers near your physical store locations" },
                              { id: "lead_forms", label: "Lead form submissions", desc: "Add lead form on the next step" },
                              { id: "messages", label: "Messages from your ads", desc: "Add message asset on the next step" }
                            ].map((way) => {
                              const isChecked = selectedReachGoals.includes(way.id);
                              return (
                                <label key={way.id} className={`flex flex-col p-3.5 rounded-xl border transition-all ${isChecked ? "bg-white border-blue-500/60" : "bg-slate-50 border-slate-200 hover:border-slate-200"}`}>
                                  <div className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedReachGoals(prev => [...prev, way.id]);
                                        } else {
                                          setSelectedReachGoals(prev => prev.filter(id => id !== way.id));
                                        }
                                      }}
                                      className="rounded bg-white border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <span className="text-xs font-semibold text-slate-900">{way.label}</span>
                                  </div>
                                  {isChecked && way.countrySelect && (
                                    <div className="mt-2.5 ml-7 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in duration-200">
                                      <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500">
                                        <option value="IN">India (+91)</option>
                                        <option value="US">United States (+1)</option>
                                        <option value="GB">United Kingdom (+44)</option>
                                        <option value="CA">Canada (+1)</option>
                                      </select>
                                      <input
                                        placeholder={way.placeholder}
                                        className="sm:col-span-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  )}
                                  {isChecked && !way.countrySelect && way.placeholder && (
                                    <div className="mt-2.5 ml-7 animate-in fade-in duration-200">
                                      <input
                                        type="text"
                                        value={way.id === "website_visits" ? websiteVisitsUrl : ""}
                                        onChange={(e) => {
                                          if (way.id === "website_visits") setWebsiteVisitsUrl(e.target.value);
                                        }}
                                        placeholder={way.placeholder}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                                      />
                                    </div>
                                  )}
                                  {way.desc && (
                                    <p className="mt-1 ml-7 text-[11px] text-slate-500">{way.desc}</p>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. DEMAND GEN */}
                  {selectedType === "DEMAND_GEN" && (
                    <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 space-y-2 animate-in fade-in duration-200 shadow-md">
                      <p className="leading-relaxed text-slate-700">
                        Capturing engagement and action across YouTube, including Shorts, Discover, and Gmail, Demand Gen campaigns are ideal for social advertisers who want to serve visually-appealing, multi-format ads on Google's most impactful surfaces available to any advertiser. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">See how it works</a>
                      </p>
                    </div>
                  )}

                  {/* 4. VIDEO */}
                  {selectedType === "VIDEO" && (
                    <div className="mt-6 space-y-6 animate-in fade-in duration-200">
                      {/* Upgrade Banner Notice matching prompt text */}
                      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3 shadow-md">
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-amber-200">You can no longer create new video conversion campaigns because they're being upgraded to Demand Gen campaigns.</p>
                          <p className="text-[11px] text-amber-300/80">Capturing engagement and action across YouTube, including Shorts, Discover, and Gmail, Demand Gen campaigns are ideal for social advertisers.</p>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 text-xs text-slate-700 shadow-lg">
                        <p className="leading-relaxed">
                          Click <strong className="text-slate-900">Continue</strong> at the bottom right to open the new page for your Video Ad Group settings (Ad group name, Locations, Languages, Channels, Audience, Optimized targeting, and URL options).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 5. DISPLAY */}
                  {selectedType === "DISPLAY" && (
                    <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-white space-y-5 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign name</label>
                        <input
                          key={`${prefix}-Display`}
                          defaultValue={selectedObjective === "NO_GUIDANCE" ? "Display-1" : `${prefix}-Display-1`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>

                      {/* Conversion Goals Table for No Guidance */}
                      {selectedObjective === "NO_GUIDANCE" && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-700">Use these conversion goals for campaign performance optimization</h4>
                              <p className="text-xs text-slate-400 mt-0.5">Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance</p>
                            </div>
                            <button
                              onClick={() => setShowAddGoalModal(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white/10 border border-blue-500/30 text-blue-600 hover:bg-blue-600 text-white/20 text-xs font-semibold transition-all shrink-0 ml-4"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add goal
                            </button>
                          </div>
                          <div className="border border-slate-200 rounded-lg overflow-visible bg-slate-50">
                            <div className="grid grid-cols-12 px-4 py-2 bg-white text-xs font-semibold text-slate-400 border-b border-slate-200">
                              <div className="col-span-5">Conversion Goals</div>
                              <div className="col-span-3">Conversion Source</div>
                              <div className="col-span-2 text-right">Conversion Actions</div>
                              <div className="col-span-2 text-right">More actions</div>
                            </div>
                            {conversionGoals.map((goal) => {
                              const GoalIcon = goal.icon || PhoneCall;
                              const isMenuOpen = openGoalMenuId === `noguidance-${goal.id}`;
                              return (
                                <div key={goal.id} className="grid grid-cols-12 px-4 py-2.5 text-xs text-slate-900 border-b border-slate-200 items-center last:border-b-0 hover:bg-slate-100/20 relative">
                                  <div className="col-span-5 font-medium text-slate-900 flex items-center gap-2">
                                    <GoalIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                    {goal.name}
                                  </div>
                                  <div className="col-span-3 text-slate-400">{goal.source}</div>
                                  <div className="col-span-2 text-right text-slate-400">{goal.count}</div>
                                  <div className="col-span-2 text-right relative">
                                    <button
                                      onClick={() => setOpenGoalMenuId(isMenuOpen ? null : `noguidance-${goal.id}`)}
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs"
                                    >
                                      More actions ▾
                                    </button>
                                    {isMenuOpen && (
                                      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left">
                                        <button
                                          onClick={() => {
                                            setConversionGoals(prev => prev.filter(g => g.id !== goal.id));
                                            setOpenGoalMenuId(null);
                                          }}
                                          className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-slate-100 flex items-center gap-2 text-left"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Remove Goal
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedObjective !== "NO_GUIDANCE" && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200">
                          <label className="block text-xs font-semibold text-slate-700">This is the web page people will go to after clicking your ad</label>
                          <input
                            placeholder="Your business's website (e.g. https://yourwebsite.com)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6. SHOPPING */}
                  {selectedType === "SHOPPING" && (
                    <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-white space-y-5 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign name</label>
                        <input
                          key={`${prefix}-Shopping`}
                          defaultValue={selectedObjective === "NO_GUIDANCE" ? "Shopping-1" : `${prefix}-Shopping-1`}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>

                      {/* Conversion Goals Table for No Guidance */}
                      {selectedObjective === "NO_GUIDANCE" ? (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <h4 className="text-xs font-semibold text-slate-700">Use these conversion goals for campaign performance optimization</h4>
                          <p className="text-xs text-slate-400">Conversion goals labeled as account default will use data from all of your campaigns to improve your bid strategy and campaign performance</p>
                          <div className="border border-slate-200 rounded-lg overflow-visible bg-slate-50">
                            <div className="grid grid-cols-12 px-4 py-2 bg-white text-xs font-semibold text-slate-400 border-b border-slate-200">
                              <div className="col-span-5">Conversion Goals</div>
                              <div className="col-span-3">Conversion Source</div>
                              <div className="col-span-2 text-right">Conversion Actions</div>
                              <div className="col-span-2 text-right">More actions</div>
                            </div>
                            <div className="grid grid-cols-12 px-4 py-2.5 text-xs text-slate-900 items-center">
                              <div className="col-span-5 font-medium text-slate-900 flex items-center gap-2">
                                <PhoneCall className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                Phone call leads (account default)
                              </div>
                              <div className="col-span-3 text-slate-400">Call from Ads</div>
                              <div className="col-span-2 text-right text-slate-400">1 action</div>
                              <div className="col-span-2 text-right text-slate-400">More actions ▾</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                          <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                            Add products to this campaign
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            To run a Shopping campaign, create a Merchant Center account with the products you want to advertise. You can create the account now and finish setting it up after you've published this campaign.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 7. APP */}
                  {selectedType === "APP" && (
                    <div className="mt-6 p-5 rounded-2xl border border-slate-200 bg-white space-y-6 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign name</label>
                        <input
                          defaultValue={selectedObjective === "NO_GUIDANCE" ? "App-1" : "App promotion-App-1"}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>

                      {/* Subtype Selection */}
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-700">Select a campaign subtype</label>
                          <a href="#" onClick={e => e.preventDefault()} className="text-xs text-blue-600 font-semibold hover:underline">Learn more</a>
                        </div>
                        <div className="space-y-2">
                          {[
                            { id: "installs", title: "App installs", desc: "Get new people to install your app" },
                            { id: "engagement", title: "App engagement", desc: "Get existing users to take actions in your app (Minimum 50K installs required)" },
                            { id: "preregistration", title: "App pre-registration (Android only)", desc: "Get new users to pre-register for your app before launch" },
                          ].map((sub) => (
                            <label
                              key={sub.id}
                              onClick={() => setAppSubtype(sub.id as any)}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${appSubtype === sub.id ? "border-blue-500 bg-blue-600 text-white/5" : "border-slate-200 bg-slate-50 hover:border-slate-200"
                                }`}
                            >
                              <input
                                type="radio"
                                name="appSubtype"
                                checked={appSubtype === sub.id}
                                onChange={() => setAppSubtype(sub.id as any)}
                                className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4"
                              />
                              <div>
                                <p className="text-xs font-semibold text-slate-900">{sub.title}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{sub.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Platform Selection */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block text-xs font-semibold text-slate-700">Select your mobile app's platform</label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 text-xs text-slate-900 cursor-pointer">
                            <input type="radio" name="platform" defaultChecked className="text-blue-600 focus:ring-blue-500 h-4 w-4" />
                            Android
                          </label>
                          {appSubtype !== "preregistration" && (
                            <label className="flex items-center gap-2 text-xs text-slate-900 cursor-pointer">
                              <input type="radio" name="platform" className="text-blue-600 focus:ring-blue-500 h-4 w-4" />
                              iOS
                            </label>
                          )}
                        </div>
                      </div>

                      {/* App Lookup */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block text-xs font-semibold text-slate-700">
                          {appSubtype === "preregistration"
                            ? "Look up your app that's eligible for pre-registration"
                            : "Look up your app"}
                        </label>
                        <input
                          placeholder="Enter the app name, package name, publisher, or Play Store URL"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                        />
                        <p className="text-[11px] text-slate-500 pt-1">
                          If you cannot find your app, please see these steps
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        )}

        </main>
      )}

      {/* ── Fixed Footer Action Bar ──────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-40">
        <button
          onClick={() => {
            if (wizardStep === "SUMMARY") {
              setWizardStep("BUDGET");
            } else if (wizardStep === "BUDGET") {
              setWizardStep("ASSET_GROUP");
            } else if (wizardStep === "ASSET_GROUP") {
              setWizardStep("CAMPAIGN_SETTINGS");
            } else if (wizardStep === "CAMPAIGN_SETTINGS") {
              setWizardStep("BIDDING");
            } else if (wizardStep === "BIDDING") {
              setWizardStep("OBJECTIVE");
            } else {
              router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
            }
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          {wizardStep === "OBJECTIVE" ? "Cancel" : "Back"}
        </button>

        <button
          disabled={(wizardStep === "OBJECTIVE" && (!selectedObjective || !selectedType)) || isPublishing}
          onClick={async () => {
            if (wizardStep === "OBJECTIVE" && selectedObjective && selectedType) {
              const objSlugMap: Record<string, string> = {
                SALES: "sales",
                LEADS: "leads",
                WEBSITE_TRAFFIC: "website-traffic",
                APP_PROMOTION: "app-promotion",
                AWARENESS: "awareness",
                LOCAL: "local",
                NO_GUIDANCE: "no-guidance"
              };
              const typeSlugMap: Record<string, string> = {
                PERFORMANCE_MAX: "performance-max",
                SEARCH: "search",
                DEMAND_GEN: "demand-gen",
                VIDEO: "video",
                DISPLAY: "display",
                SHOPPING: "shopping",
                APP: "app"
              };

              const objSlug = objSlugMap[selectedObjective] || "sales";
              const typeSlug = typeSlugMap[selectedType] || "performance-max";

              router.push(`/ads/campaigns/create/${objSlug}/${typeSlug}${customerId ? `?customerId=${customerId}` : ""}`);
              return;
            }
            if (wizardStep === "OBJECTIVE") {
              setWizardStep("BIDDING");
            } else if (wizardStep === "BIDDING") {
              setWizardStep("CAMPAIGN_SETTINGS");
            } else if (wizardStep === "CAMPAIGN_SETTINGS") {
              setWizardStep("ASSET_GROUP");
            } else if (wizardStep === "ASSET_GROUP") {
              setWizardStep("BUDGET");
            } else if (wizardStep === "BUDGET") {
              setWizardStep("SUMMARY");
            } else {
              // Save & Publish Campaign Action
              setIsPublishing(true);
              try {
                const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                const activeBudgetValue = selectedPresetBudget === "CUSTOM"
                  ? Number(customBudgetValue.replace(/,/g, "")) || 1556.83
                  : Number(selectedPresetBudget) || 1556.83;

                await fetch(`${BACKEND}/api/ads/campaign/launch`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orgId: (typeof window !== "undefined" ? localStorage.getItem("organization_id") : null) || "",
                    customerId: customerId || "6587355041",
                    campaignName: `${OBJECTIVES.find(o => o.id === selectedObjective)?.title || "Sales"}-${selectedType === "PERFORMANCE_MAX" ? "Performance Max" : selectedType || "Performance Max"}-5`,
                    budget: activeBudgetValue,
                    channelType: selectedType || "PERFORMANCE_MAX",
                    biddingStrategy: "MAXIMIZE_CONVERSIONS",
                    startDate: startDateValue || new Date().toISOString().split("T")[0],
                    endDate: endDateMode === "SELECT" ? endDateValue : undefined,
                    finalUrl: assetFinalUrl || "https://japatracker-7f759.web.app/",
                    headlines: headlines.slice(0, 3),
                    descriptions: descriptions.slice(0, 2),
                    keywords: ["whatsapp automation", "campaign management"]
                  })
                });
              } catch (err) {
                console.error("Save & Publish campaign fallback:", err);
              } finally {
                setIsPublishing(false);
                alert(`Campaign "${assetGroupName || 'Sales-Performance Max-5'}" created and published successfully!`);
                router.push(`/ads${customerId ? `?customerId=${customerId}` : ""}`);
              }
            }
          }}
          className={`px-6 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
            (wizardStep !== "OBJECTIVE" || (selectedObjective && selectedType)) && !isPublishing
              ? "bg-blue-600 text-white hover:bg-secondary font-bold shadow-md shadow-primary/20 cursor-pointer"
              : "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200"
          }`}
        >
          {isPublishing ? (
            <>Saving & Publishing...</>
          ) : (
            <>
              {wizardStep === "BUDGET" ? "Next" : wizardStep === "SUMMARY" ? "Save & Publish" : wizardStep === "OBJECTIVE" ? "Continue" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </footer>

      {/* ── New account-level brand list Modal ────────────────────────────── */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">New account-level brand list</h3>
                <p className="text-xs text-slate-400 mt-0.5">Brand lists let you choose whether your ads show on searches that mention specific brands</p>
              </div>
              <button onClick={() => setShowBrandModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">List name</label>
                <input
                  type="text"
                  value={brandListName}
                  onChange={(e) => setBrandListName(e.target.value)}
                  placeholder="Enter list name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Brands</label>
                <p className="text-[11px] text-slate-400">Add brands to your list</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={brandSearchInput}
                    onChange={(e) => setBrandSearchInput(e.target.value)}
                    placeholder="Enter a brand (e.g. Nike, Apple, Samsung)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (brandSearchInput.trim()) {
                        setBrandListItems(prev => [...prev, brandSearchInput.trim()]);
                        setBrandSearchInput("");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-secondary cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {brandListItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {brandListItems.map((b, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900">
                        {b}
                        <button onClick={() => setBrandListItems(prev => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3 w-3 hover:text-rose-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowBrandModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (brandListName.trim() || brandListItems.length > 0) {
                    setAppliedBrandLists(prev => [...prev, brandListName || `Brand List (${brandListItems.length})`]);
                  }
                  setShowBrandModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-secondary cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Add Brand Guidelines Modal Overlay ───────────────────────── */}
      {showAddBrandModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" onClick={() => setShowAddBrandModal(false)} />
          
          <div className="relative z-10 bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Add brand guidelines</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control how your brand appears in ads for this campaign. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about brand guidelines</a>
                </p>
              </div>
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-900">
              
              {/* Section 1: Brand identity */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">Brand identity</h4>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Business name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business name"
                    maxLength={25}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Required</span>
                    <span>{businessName.length} / 25</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">Logos ({uploadedLogos.length}/5)</label>
                  <label className="w-full p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 hover:border-blue-500 flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <Plus className="h-4 w-4 text-blue-600" />
                    {isUploadingLogo ? "Uploading Logo..." : "+ Add logos"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Section 2: Visual guidelines */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Visual guidelines</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Add your brand colors and fonts to help Google AI generate on-brand videos and responsive display ads.</p>
                </div>

                <div className="space-y-3">
                  <label className="block font-semibold text-slate-700">Custom colors</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-400 text-[11px]">Main color</label>
                      <input
                        type="text"
                        value={mainBrandColor}
                        onChange={(e) => setMainBrandColor(e.target.value)}
                        placeholder="Example: #ffffff"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-400 text-[11px]">Accent color</label>
                      <input
                        type="text"
                        value={accentBrandColor}
                        onChange={(e) => setAccentBrandColor(e.target.value)}
                        placeholder="Example: #4285f4"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block font-semibold text-slate-700">Font</label>
                  <select
                    value={brandFont}
                    onChange={(e) => setBrandFont(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Any font">Any font</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Text guidelines Beta */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">Text guidelines</h4>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">Beta</span>
                </div>
                <p className="text-xs text-slate-400">
                  Tell Google AI the rules it needs to follow when it creates relevant, on-brand headlines and descriptions for you. <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">Learn more about text guidelines</a>
                </p>

                {/* Term Exclusions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Term exclusions ({termExclusions.length}/25)</label>
                  </div>
                  <input
                    type="text"
                    value={termExclusionsInput}
                    onChange={(e) => setTermExclusionsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && termExclusionsInput.trim()) {
                        e.preventDefault();
                        if (termExclusions.length < 25 && !termExclusions.includes(termExclusionsInput.trim())) {
                          setTermExclusions(prev => [...prev, termExclusionsInput.trim()]);
                        }
                        setTermExclusionsInput("");
                      }
                    }}
                    placeholder="For example: Cheap, free shipping, etc. Press Enter after each word or phrase."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />

                  {termExclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {termExclusions.map((term, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium">
                          {term}
                          <button onClick={() => setTermExclusions(prev => prev.filter((_, idx) => idx !== i))}>
                            <X className="h-3 w-3 hover:text-rose-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Messaging Restrictions */}
                <div className="space-y-3 pt-2">
                  <label className="block font-semibold text-slate-700">Messaging restrictions ({messagingRestrictions.filter(m => m.trim()).length}/40)</label>
                  
                  {messagingRestrictions.map((val, idx) => {
                    const placeholders = [
                      "Example: Don't mention competitor names, such as Acme Corp or Plants 4 You",
                      "Example: Don't use specific prices, such as $550 per night or $99 intro offer",
                      "Example: Don't use \"only\" or \"just for\" language, such as \"for high-performance athletes only\"",
                      "Example: Avoid words like \"cheapest\" or \"discount\"",
                      "Example: Specify any prohibited claims"
                    ];
                    const placeh = placeholders[idx] || "Example: Specify messaging restriction or rule for Google AI";
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            maxLength={300}
                            value={val}
                            onChange={(e) => {
                              const newRestr = [...messagingRestrictions];
                              newRestr[idx] = e.target.value;
                              setMessagingRestrictions(newRestr);
                            }}
                            placeholder={placeh}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                          />
                          {messagingRestrictions.length > 1 && (
                            <button
                              onClick={() => setMessagingRestrictions(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-100 rounded-lg transition-all mt-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 text-right pr-1">
                          {val.length} / 300
                        </p>
                      </div>
                    );
                  })}

                  {messagingRestrictions.length < 40 && (
                    <button
                      onClick={() => setMessagingRestrictions(prev => [...prev, ""])}
                      className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 pt-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add another restriction
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-secondary cursor-pointer"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Saved Audience Signal Modal */}
      {showSavedAudienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" /> Create Audience Signal
              </h2>
              <button
                onClick={() => setShowSavedAudienceModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-900">
              {/* Audience Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-xs">Audience name</label>
                  <span className="text-[10px] text-rose-400 font-semibold uppercase">Required</span>
                </div>
                <input
                  type="text"
                  value={modalAudienceName}
                  onChange={(e) => setModalAudienceName(e.target.value)}
                  placeholder="Enter audience name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Your Data */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Your data</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">People who have previously interacted with your business</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={modalYourDataSearch}
                    onChange={(e) => setModalYourDataSearch(e.target.value)}
                    placeholder="Add your data"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Interests & Detailed Demographics */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Interests & detailed demographics</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">People based on their interests, life events, or detailed demographics</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={modalInterestsSearch}
                    onChange={(e) => setModalInterestsSearch(e.target.value)}
                    placeholder="Add in-market segments, life events, and more"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-5">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Demographics</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">People with the following demographics</p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700">Gender</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={genderFemale}
                        onChange={(e) => setGenderFemale(e.target.checked)}
                        className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                      />
                      Female
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={genderMale}
                        onChange={(e) => setGenderMale(e.target.checked)}
                        className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={genderUnknown}
                        onChange={(e) => setGenderUnknown(e.target.checked)}
                        className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                      />
                      Unknown
                    </label>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-700">Age</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="18">18</option>
                      <option value="25">25</option>
                      <option value="35">35</option>
                      <option value="45">45</option>
                      <option value="55">55</option>
                    </select>
                    <span className="text-slate-400">to</span>
                    <select
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="24">24</option>
                      <option value="34">34</option>
                      <option value="44">44</option>
                      <option value="54">54</option>
                      <option value="64">64</option>
                      <option value="65+">65+</option>
                    </select>

                    <label className="flex items-center gap-2 ml-4 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={ageUnknown}
                        onChange={(e) => setAgeUnknown(e.target.checked)}
                        className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                      />
                      Unknown
                    </label>
                  </div>
                </div>

                {/* Additional Demographics */}
                <div className="pt-2 space-y-4 border-t border-slate-200">
                  <h5 className="font-bold text-slate-700 text-xs">Additional demographics</h5>

                  {/* Parental Status */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-400">Parental status</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={parentStatusParent}
                          onChange={(e) => setParentStatusParent(e.target.checked)}
                          className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                        />
                        Parent
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={parentStatusNotParent}
                          onChange={(e) => setParentStatusNotParent(e.target.checked)}
                          className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                        />
                        Not a parent
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={parentStatusUnknown}
                          onChange={(e) => setParentStatusUnknown(e.target.checked)}
                          className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                        />
                        Unknown
                      </label>
                    </div>
                  </div>

                  {/* Household Income */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-400">Household income</label>
                    <div className="flex items-center gap-3">
                      <select
                        value={incomeMin}
                        onChange={(e) => setIncomeMin(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Top 10%">Top 10%</option>
                        <option value="11-20%">11-20%</option>
                        <option value="21-30%">21-30%</option>
                        <option value="31-40%">31-40%</option>
                        <option value="41-50%">41-50%</option>
                      </select>
                      <span className="text-slate-400">to</span>
                      <select
                        value={incomeMax}
                        onChange={(e) => setIncomeMax(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="11-20%">11-20%</option>
                        <option value="21-30%">21-30%</option>
                        <option value="31-40%">31-40%</option>
                        <option value="41-50%">41-50%</option>
                        <option value="Lower 50%">Lower 50%</option>
                      </select>

                      <label className="flex items-center gap-2 ml-4 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={incomeUnknown}
                          onChange={(e) => setIncomeUnknown(e.target.checked)}
                          className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4"
                        />
                        Unknown
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      Note: Household income targeting is only available in select countries.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setShowSavedAudienceModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalAudienceName.trim()) {
                    setAudienceName(modalAudienceName.trim());
                  }
                  setShowSavedAudienceModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-secondary cursor-pointer"
              >
                Save Audience Signal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New account-level brand list */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">New account-level brand list</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Brand lists let you choose whether your ads show on searches that mention specific brands
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content Form */}
            <div className="p-6 space-y-5">
              {/* List name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-900">List name</label>
                <input
                  type="text"
                  value={brandListName}
                  onChange={(e) => setBrandListName(e.target.value)}
                  placeholder="Enter list name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Brands Section */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-900">Brands</label>
                <p className="text-[11px] text-slate-400">Add brands to your list</p>

                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={brandSearchInput}
                    onChange={(e) => setBrandSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && brandSearchInput.trim()) {
                        setBrandListItems(prev => [...prev, brandSearchInput.trim()]);
                        setBrandSearchInput("");
                      }
                    }}
                    placeholder="Enter a brand"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-20 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (brandSearchInput.trim()) {
                        setBrandListItems(prev => [...prev, brandSearchInput.trim()]);
                        setBrandSearchInput("");
                      }
                    }}
                    className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-secondary transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Brands Added Tag Cloud */}
                {brandListItems.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-semibold text-slate-700">Added brands ({brandListItems.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {brandListItems.map((b, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white/10 border border-blue-500/30 text-xs text-blue-600 font-medium">
                          🛡️ {b}
                          <button onClick={() => setBrandListItems(prev => prev.filter((_, i) => i !== idx))}>
                            <X className="h-3 w-3 hover:text-rose-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (brandListName.trim() || brandListItems.length > 0) {
                    const name = brandListName.trim() || brandListItems[0] || "Custom Brand List";
                    setAdGroupBrandInclusions(prev => Array.from(new Set([...prev, name])));
                    setAppliedBrandLists(prev => Array.from(new Set([...prev, name])));
                  }
                  setShowBrandModal(false);
                  setBrandListName("");
                  setBrandListItems([]);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-secondary cursor-pointer"
              >
                Save Brand List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add calls to your campaign */}
      {showCallsModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCallsModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add calls to your campaign</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Campaign-level calls
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content Form */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Add calls to this campaign. Any calls added here can be used across campaigns.
              </p>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900">Add new call</h3>
                  <span className="text-[11px] text-slate-400">Call reporting on, call recording off</span>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Country</label>
                  <select
                    value={callsCountry}
                    onChange={(e) => setCallsCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>

                {/* Phone number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Phone number</label>
                  <input
                    type="text"
                    value={callsPhoneNumber}
                    onChange={(e) => setCallsPhoneNumber(e.target.value)}
                    placeholder="Example: (201) 555-0123"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Conversion action */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Conversion action</label>
                  <select
                    value={callsConversionAction}
                    onChange={(e) => setCallsConversionAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Use account settings (Calls from ads)">Use account settings (Calls from ads)</option>
                    <option value="Calls from ads (account default)">Calls from ads (account default)</option>
                    <option value="Don't use a conversion action">Don't use a conversion action</option>
                  </select>
                </div>

                {/* Advanced options */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCallsAdvancedOptions(!showCallsAdvancedOptions)}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCallsAdvancedOptions ? "rotate-180" : ""}`} />
                    Advanced options
                  </button>

                  {showCallsAdvancedOptions && (
                    <div className="mt-3 space-y-3 pl-2 text-xs text-slate-400 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-700">Device preference</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded bg-white border-slate-200 text-blue-600 h-4 w-4" />
                          <span>Prefer mobile devices</span>
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-700">Scheduling</label>
                        <p className="text-[10px] text-slate-500">Run call asset only during specific days or business hours</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowCallsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (callsPhoneNumber.trim()) {
                    setCampaignCallsList(prev => Array.from(new Set([...prev, callsPhoneNumber.trim()])));
                  }
                  setShowCallsModal(false);
                  setCallsPhoneNumber("");
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-secondary cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create sitelink */}
      {showSitelinksModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSitelinksModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900">Create sitelink</h2>
              </div>
            </div>

            {/* Modal Content Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Sitelinks 1 to 6 Forms */}
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map((num, idx) => {
                  const item = sitelinkItems[idx] || { text: "", desc1: "", desc2: "", url: "" };
                  return (
                    <div key={num} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          Sitelink {num}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.text.length}/25 characters
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Sitelink text */}
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Sitelink text</label>
                          <input
                            type="text"
                            maxLength={25}
                            value={item.text}
                            onChange={(e) => {
                              const updated = [...sitelinkItems];
                              updated[idx] = { ...updated[idx], text: e.target.value };
                              setSitelinkItems(updated);
                            }}
                            placeholder="Enter sitelink text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <p className="text-[10px] text-slate-500">Text is {item.text.length} characters out of 25</p>
                        </div>

                        {/* Final URL */}
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Final URL</label>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => {
                              const updated = [...sitelinkItems];
                              updated[idx] = { ...updated[idx], url: e.target.value };
                              setSitelinkItems(updated);
                            }}
                            placeholder="https://example.com/page"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        {/* Description line 1 */}
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Description line 1 (recommended)</label>
                          <input
                            type="text"
                            maxLength={35}
                            value={item.desc1}
                            onChange={(e) => {
                              const updated = [...sitelinkItems];
                              updated[idx] = { ...updated[idx], desc1: e.target.value };
                              setSitelinkItems(updated);
                            }}
                            placeholder="Enter description line 1"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <p className="text-[10px] text-slate-500">Text is {item.desc1.length} characters out of 35</p>
                        </div>

                        {/* Description line 2 */}
                        <div className="space-y-1">
                          <label className="block font-semibold text-slate-700">Description line 2 (recommended)</label>
                          <input
                            type="text"
                            maxLength={35}
                            value={item.desc2}
                            onChange={(e) => {
                              const updated = [...sitelinkItems];
                              updated[idx] = { ...updated[idx], desc2: e.target.value };
                              setSitelinkItems(updated);
                            }}
                            placeholder="Enter description line 2"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <p className="text-[10px] text-slate-500">Text is {item.desc2.length} characters out of 35</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sitelink URL options */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Sitelink URL options
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Tracking template</label>
                    <input
                      type="text"
                      value={sitelinkTrackingTemplate}
                      onChange={(e) => setSitelinkTrackingTemplate(e.target.value)}
                      placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Final URL suffix</label>
                    <input
                      type="text"
                      value={sitelinkFinalUrlSuffix}
                      onChange={(e) => setSitelinkFinalUrlSuffix(e.target.value)}
                      placeholder="Example: param1=value1&param2=value2"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Custom parameter</label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">{`{_`}</span>
                      <input
                        type="text"
                        placeholder="Name"
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <span className="font-mono text-slate-400">{`}`}</span>
                      <span className="font-mono text-slate-400">=</span>
                      <input
                        type="text"
                        placeholder="Value"
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced options & Asset scheduling */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Advanced options - Asset scheduling
                </h3>
                <p className="text-xs text-slate-400">Select when your assets will be eligible to show</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Start date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">End date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <label className="block font-semibold text-slate-700">Days and hours</label>
                  <div className="flex items-center gap-3">
                    <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer">
                      <option value="ALL">All days</option>
                      <option value="WEEKDAYS">Mondays to Fridays</option>
                      <option value="WEEKENDS">Saturdays and Sundays</option>
                    </select>

                    <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer">
                      <option value="00:00">12:00 AM</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                    </select>
                    <span className="text-slate-400">to</span>
                    <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer">
                      <option value="00:00">12:00 AM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="23:59">11:59 PM</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1 leading-normal">
                    To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. Learn more
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Based on account time zone: (GMT+05:30) India Standard Time
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setShowSitelinksModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowSitelinksModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-secondary cursor-pointer"
              >
                Save Sitelinks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Promotions */}
      {showPromotionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowPromotionsModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add promotions to your campaign</h2>
                  <p className="text-xs text-slate-400">Campaign-level promotions</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <p className="text-slate-400">Add promotions to this campaign. Any promotions added here can be used across campaigns.</p>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="font-semibold text-slate-900">Add new promotion</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Occasion</label>
                    <select value={promoOccasion} onChange={(e) => setPromoOccasion(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="None">None</option>
                      <option value="New Year's">New Year's</option>
                      <option value="Valentine's Day">Valentine's Day</option>
                      <option value="Easter">Easter</option>
                      <option value="Mother's Day">Mother's Day</option>
                      <option value="Father's Day">Father's Day</option>
                      <option value="Labor Day">Labor Day</option>
                      <option value="Back to School">Back to School</option>
                      <option value="Halloween">Halloween</option>
                      <option value="Black Friday">Black Friday</option>
                      <option value="Cyber Monday">Cyber Monday</option>
                      <option value="Christmas">Christmas</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Language</label>
                    <select value={promoLanguage} onChange={(e) => setPromoLanguage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Currency</label>
                    <select value={promoCurrency} onChange={(e) => setPromoCurrency(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700">Promotion type</label>
                    <select value={promoType} onChange={(e) => setPromoType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="Monetary discount">Monetary discount</option>
                      <option value="Percent discount">Percent discount</option>
                      <option value="Up to monetary discount">Up to monetary discount</option>
                      <option value="Up to percent discount">Up to percent discount</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Item</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={promoItem}
                    onChange={(e) => setPromoItem(e.target.value)}
                    placeholder="Item name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-500"
                  />
                  <p className="text-[10px] text-slate-500">Text is {promoItem.length} characters out of 20</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Final URL</label>
                  <input
                    type="text"
                    value={promoFinalUrl}
                    onChange={(e) => setPromoFinalUrl(e.target.value)}
                    placeholder="https://example.com/promo"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Promotion details</label>
                  <select value={promoDetails} onChange={(e) => setPromoDetails(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                    <option value="None">None</option>
                    <option value="On orders over">On orders over</option>
                    <option value="Promo code">Promo code</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <h4 className="font-semibold text-slate-700">Displayed promotion dates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400">Start date</label>
                      <input type="date" value={promoStartDate} onChange={(e) => setPromoStartDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400">End date</label>
                      <input type="date" value={promoEndDate} onChange={(e) => setPromoEndDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button type="button" onClick={() => setShowPromotionsModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => { if (promoItem) setPromotionsList(prev => [...prev, promoItem]); setShowPromotionsModal(false); }} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Prices */}
      {showPricesModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowPricesModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add prices to your campaign</h2>
                  <p className="text-xs text-slate-400">Campaign-level prices</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-400">Add prices to this campaign. Any prices added here can be used across campaigns.</p>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="font-semibold text-slate-900">Add new price</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">Language</label>
                    <select value={priceLanguage} onChange={(e) => setPriceLanguage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Type</label>
                    <select value={priceType} onChange={(e) => setPriceType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="Brands">Brands</option>
                      <option value="Events">Events</option>
                      <option value="Locations">Locations</option>
                      <option value="Neighborhoods">Neighborhoods</option>
                      <option value="Product categories">Product categories</option>
                      <option value="Product tiers">Product tiers</option>
                      <option value="Services">Services</option>
                      <option value="Service categories">Service categories</option>
                      <option value="Service tiers">Service tiers</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">Currency</label>
                    <select value={priceCurrency} onChange={(e) => setPriceCurrency(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">Price qualifier</label>
                    <select value={priceQualifier} onChange={(e) => setPriceQualifier(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                      <option value="No qualifier">No qualifier</option>
                      <option value="From">From</option>
                      <option value="Up to">Up to</option>
                      <option value="Average">Average</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button type="button" onClick={() => setShowPricesModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => { setPricesList(prev => [...prev, `${priceType} (${priceCurrency})`]); setShowPricesModal(false); }} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Messages */}
      {showMessagesModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowMessagesModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add messages to your campaign</h2>
                  <p className="text-xs text-slate-400">Campaign-level messages</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-400">Add messages to this campaign. Any messages added here can be used across campaigns.</p>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <h3 className="font-semibold text-slate-900">Set up your message asset</h3>
                <p className="text-slate-400">Select message platform</p>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700">
                  Optimize your campaign for message ads. This will add a leads from messages conversion action to your campaign. Learn more about conversions
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button type="button" onClick={() => setShowMessagesModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => { setMessagesList(prev => [...prev, "WhatsApp / SMS Message"]); setShowMessagesModal(false); }} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Structured Snippets */}
      {showSnippetsModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowSnippetsModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900">Create structured snippet</h2>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Header</label>
                <select value={snippetHeader} onChange={(e) => setSnippetHeader(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900">
                  <option value="Select header type">Select header type</option>
                  <option value="Amenities">Amenities</option>
                  <option value="Brands">Brands</option>
                  <option value="Courses">Courses</option>
                  <option value="Degree programs">Degree programs</option>
                  <option value="Destinations">Destinations</option>
                  <option value="Featured hotels">Featured hotels</option>
                  <option value="Insurance coverage">Insurance coverage</option>
                  <option value="Models">Models</option>
                  <option value="Neighborhoods">Neighborhoods</option>
                  <option value="Service catalog">Service catalog</option>
                  <option value="Shows">Shows</option>
                  <option value="Styles">Styles</option>
                  <option value="Types">Types</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block font-semibold text-slate-700">Values</label>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-[11px] text-slate-400">Value {idx + 1}</label>
                    <input
                      type="text"
                      maxLength={25}
                      value={snippetValues[idx] || ""}
                      onChange={(e) => {
                        const newV = [...snippetValues];
                        newV[idx] = e.target.value;
                        setSnippetValues(newV);
                      }}
                      placeholder={`Value ${idx + 1}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500">Text is {(snippetValues[idx] || "").length} characters out of 25</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button type="button" onClick={() => setShowSnippetsModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => { if (snippetHeader !== "Select header type") setSnippetsList(prev => [...prev, `${snippetHeader}: ${snippetValues.filter(Boolean).join(", ")}`]); setShowSnippetsModal(false); }} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Lead Forms */}
      {showLeadFormsModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowLeadFormsModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add a lead form to your campaign</h2>
                  <p className="text-xs text-slate-400">Campaign-level lead forms</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <p className="text-slate-400">Add lead forms to this campaign. Any lead forms added here can be used across campaigns.</p>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="font-semibold text-slate-900">Create your lead form</h3>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Headline</label>
                  <input type="text" maxLength={30} value={leadHeadline} onChange={(e) => setLeadHeadline(e.target.value)} placeholder="Headline" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900" />
                  <p className="text-[10px] text-slate-500">Text is {leadHeadline.length} characters out of 30</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Business name</label>
                  <input type="text" maxLength={25} value={leadBusinessName} onChange={(e) => setLeadBusinessName(e.target.value)} placeholder="Business name" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900" />
                  <p className="text-[10px] text-slate-500">Text is {leadBusinessName.length} characters out of 25</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Description</label>
                  <textarea rows={2} maxLength={200} value={leadDescription} onChange={(e) => setLeadDescription(e.target.value)} placeholder="Description" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900" />
                  <p className="text-[10px] text-slate-500">Text is {leadDescription.length} characters out of 200</p>
                </div>

                {/* Pre-filled questions */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Contact information</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    {["Name", "Email", "Phone number", "Country", "City", "Zip/Postal code", "State/Province", "Street address"].map((q) => (
                      <label key={q} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded bg-white border-slate-200 text-blue-600 h-3.5 w-3.5" />
                        <span>{q} (Pre-filled)</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Submission Message */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700">Create form submission message</h4>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Headline</label>
                    <input type="text" maxLength={30} value={leadThankYouHeadline} onChange={(e) => setLeadThankYouHeadline(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400">Description</label>
                    <textarea rows={2} maxLength={200} value={leadThankYouDesc} onChange={(e) => setLeadThankYouDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px]">
                  Optimize your campaign for lead form submissions. This will add a submit lead form conversion action to your campaign.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button type="button" onClick={() => setShowLeadFormsModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => { if (leadHeadline) setLeadFormsList(prev => [...prev, leadHeadline]); setShowLeadFormsModal(false); }} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Save Lead Form</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Apps */}
      {showAppsModal && (
        <div className="fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowAppsModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add apps to your campaign</h2>
                  <p className="text-xs text-slate-400">Campaign-level apps</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-400">Add apps to this campaign. Any apps added here can be used across campaigns.</p>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                <h3 className="font-semibold text-slate-900">Add new app</h3>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">Select your mobile app's platform</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="appPlatform" checked={appPlatform === "Android"} onChange={() => setAppPlatform("Android")} className="text-blue-600 focus:ring-blue-500" />
                      <span>Android</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="appPlatform" checked={appPlatform === "iOS"} onChange={() => setAppPlatform("iOS")} className="text-blue-600 focus:ring-blue-500" />
                      <span>iOS</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Look up your app</label>
                  <input
                    type="text"
                    value={appNameInput}
                    onChange={(e) => setAppNameInput(e.target.value)}
                    placeholder="Enter the app name, package name, or publisher"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Link text</label>
                  <input
                    type="text"
                    maxLength={25}
                    value={appLinkText}
                    onChange={(e) => setAppLinkText(e.target.value)}
                    placeholder="Download App"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-500"
                  />
                  <p className="text-[10px] text-slate-500">Text is {appLinkText.length} characters out of 25</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <button type="button" onClick={() => setShowAppsModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => setShowAppsModal(false)} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
