"use client";


import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X, HelpCircle, ArrowRight, Check, CheckCircle2, AlertTriangle, Plus, Trash2,
  Sparkles, Layers, Target, Search as SearchIcon, Video as VideoIcon, LayoutGrid, ShoppingBag,
  Zap, AlertCircle, ChevronDown, ChevronUp, Info, Users, Smartphone, Globe, Settings, Edit3,
  Image as ImageIcon, Play, Upload, ExternalLink, ShieldCheck, DollarSign, RefreshCw, Apple,
  Wand2, Filter, Eye, SlidersHorizontal, Tag, PhoneCall, Phone, Wrench, ChevronLeft, ChevronRight, FileText, Code
} from "lucide-react";

interface AppOption {
  name: string;
  packageName: string; // Package Name (Android) or Bundle ID (iOS)
  icon: string;
  publisher: string;
  rating: string;
  downloads: string;
  store: string;
}

const PRESET_APPS_ANDROID: AppOption[] = [
  {
    name: "Hubmate Android",
    packageName: "com.hubmate.app",
    icon: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
    publisher: "Hubmate Technologies",
    rating: "4.8 ★",
    downloads: "100K+",
    store: "Google Play Store"
  },
  {
    name: "WhatsApp Business",
    packageName: "com.whatsapp.w4b",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png",
    publisher: "Meta Platforms, Inc.",
    rating: "4.4 ★",
    downloads: "1B+",
    store: "Google Play Store"
  },
  {
    name: "Zomato: Food Delivery & Dining",
    packageName: "com.application.zomato",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    publisher: "Zomato",
    rating: "4.6 ★",
    downloads: "100M+",
    store: "Google Play Store"
  },
  {
    name: "Instagram",
    packageName: "com.instagram.android",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    publisher: "Instagram",
    rating: "4.3 ★",
    downloads: "1B+",
    store: "Google Play Store"
  }
];

const PRESET_APPS_IOS: AppOption[] = [
  {
    name: "Hubmate for iOS",
    packageName: "com.hubmate.ios",
    icon: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
    publisher: "Hubmate Inc.",
    rating: "4.9 ★",
    downloads: "50K+",
    store: "Apple App Store"
  },
  {
    name: "WhatsApp Messenger",
    packageName: "net.whatsapp.WhatsApp",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png",
    publisher: "Meta Platforms, Inc.",
    rating: "4.7 ★",
    downloads: "1B+",
    store: "Apple App Store"
  },
  {
    name: "Zomato iOS",
    packageName: "com.zomato.iphone",
    icon: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    publisher: "Zomato Media Pvt Ltd",
    rating: "4.8 ★",
    downloads: "50M+",
    store: "Apple App Store"
  },
  {
    name: "Instagram iOS",
    packageName: "com.burbn.instagram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    publisher: "Instagram, Inc.",
    rating: "4.7 ★",
    downloads: "1B+",
    store: "Apple App Store"
  }
];

export default function AppPromotionWizard()  {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [accountInfo, setAccountInfo] = useState<{ customerId?: string; name?: string } | null>(null);

  // Wizard Step State: "CAMPAIGN_SETTINGS" | "AD_GROUP" | "BIDDING_BUDGET" | "SUMMARY"
  const [wizardStep, setWizardStep] = useState<"CAMPAIGN_SETTINGS" | "AD_GROUP" | "BIDDING_BUDGET" | "SUMMARY">("CAMPAIGN_SETTINGS");
  const [campaignName, setCampaignName] = useState<string>("app-promotion-7");

  // Step 1: Bidding State
  const [biddingFocus, setBiddingFocus] = useState<"Conversions" | "Target CPA" | "Conversion value" | "Target ROAS" | "Clicks" | "Impression share">("Conversions");
  const [setTargetCpa, setSetTargetCpa] = useState<boolean>(false);
  const [targetCpaValue, setTargetCpaValue] = useState<string>("166.11");
  const [setTargetRoas, setSetTargetRoas] = useState<boolean>(false);
  const [targetRoasValue, setTargetRoasValue] = useState<string>("200");
  const [setMaxCpc, setSetMaxCpc] = useState<boolean>(false);
  const [maxCpcLimit, setMaxCpcLimit] = useState<string>("10.00");
  const [impressionShareLocation, setImpressionShareLocation] = useState<string>("Anywhere on results page");
  const [targetImpressionSharePercent, setTargetImpressionSharePercent] = useState<string>("50");
  const [maxCpcImpressionShare, setMaxCpcImpressionShare] = useState<string>("10.00");
  const [onlyBidNewCustomers, setOnlyBidNewCustomers] = useState<boolean>(false);
  const [adjustLapsedCustomers, setAdjustLapsedCustomers] = useState<boolean>(false);

  // Step 2: Campaign Settings State
  const [mobileAppPlatform, setMobileAppPlatform] = useState<"ANDROID" | "IOS">("ANDROID");
  const [mobileAppQuery, setMobileAppQuery] = useState<string>("");
  const [selectedMobileApp, setSelectedMobileApp] = useState<AppOption | null>({
    name: "My App",
    packageName: "com.myapp.android",
    icon: "https://play-lh.googleusercontent.com/12345",
    publisher: "My Company",
    rating: "4.5",
    downloads: "1M+",
    store: "Google Play"
  });
  const [viewThroughConversion, setViewThroughConversion] = useState<boolean>(true);
  const [useDataFeed, setUseDataFeed] = useState<boolean>(false);
  const [dataFeedType, setDataFeedType] = useState<string>("Dynamic ad feed");
  
  const [selectedLocation, setSelectedLocation] = useState<"ALL" | "INDIA" | "CUSTOM">("ALL");
  const [customLocationInput, setCustomLocationInput] = useState<string>("");
  const [targetLocations, setTargetLocations] = useState<Array<{ name: string; type: string; reach: string }>>([
    { name: "Mumbai, Maharashtra, India", type: "City", reach: "21,400,000" }
  ]);
  const [locationTargetingType, setLocationTargetingType] = useState<"PRESENCE_INTEREST" | "PRESENCE">("PRESENCE_INTEREST");
  const [showLocationOptions, setShowLocationOptions] = useState<boolean>(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [languageAppInput, setLanguageAppInput] = useState<string>("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [euPoliticalAds, setEuPoliticalAds] = useState<"YES" | "NO">("NO");
  const [audienceTab, setAudienceTab] = useState<"App" | "BROWSE">("App");
  const [audienceAppQuery, setAudienceAppQuery] = useState<string>("");
  const [selectedAudienceSegments, setSelectedAudienceSegments] = useState<string[]>([]);
  const [audienceTargetingMode, setAudienceTargetingMode] = useState<"TARGETING" | "OBSERVATION">("OBSERVATION");
  const [showNewSegmentModal, setShowNewSegmentModal] = useState<boolean>(false);
  const [selectedNewSegmentType, setSelectedNewSegmentType] = useState<"CUSTOMER_LIST" | "LEAD_FORM" | "YOUTUBE" | "GA4" | "APP_USERS" | "WEBSITE_VISITORS">("CUSTOMER_LIST");
  const [customerListStep, setCustomerListStep] = useState<"SELECT_TYPE" | "CUSTOMER_LIST_DETAILS" | "LEAD_FORM_DETAILS" | "YOUTUBE_DETAILS" | "GA4_DETAILS" | "GA4_LINK_PROPERTY">("SELECT_TYPE");
  const [customerDataSourceOption, setCustomerDataSourceOption] = useState<"CONNECT_PRODUCT" | "UPLOAD_FILE" | "SKIP">("CONNECT_PRODUCT");
  const [selectedDataSourceProduct, setSelectedDataSourceProduct] = useState<string>("Shopify");
  const [customerMatchComplianceChecked, setCustomerMatchComplianceChecked] = useState<boolean>(false);
  const [leadFormSegmentName, setLeadFormSegmentName] = useState<string>("");
  const [selectedCustomerTypes, setSelectedCustomerTypes] = useState<string[]>(["Qualified leads"]);
  const [selectedLeadForms, setSelectedLeadForms] = useState<string[]>([]);
  const [submissionDays, setSubmissionDays] = useState<string>("540");
  const [youtubeSegmentName, setYoutubeSegmentName] = useState<string>("");
  const [youtubeSelectionMode, setYoutubeSelectionMode] = useState<"CHANNEL" | "CREATOR_VIDEO">("CHANNEL");
  const [youtubePrefillOption, setYoutubePrefillOption] = useState<"PREFILL" | "EMPTY">("PREFILL");
  const [youtubeDescription, setYoutubeDescription] = useState<string>("");
  const [ga4AppProperty, setGa4AppProperty] = useState<string>("");
  const [ga4SelectedProperty, setGa4SelectedProperty] = useState<string>("Jisnu Digital Solutions (531372646)");
  const [ga4LinkStep, setGa4LinkStep] = useState<number>(2);
  const [importAppWebMetrics, setImportAppWebMetrics] = useState<boolean>(true);
  const [importGa4Audiences, setImportGa4Audiences] = useState<boolean>(true);
  const [adRotationMode, setAdRotationMode] = useState<"OPTIMIZE" | "DO_NOT_OPTIMIZE">("OPTIMIZE");

  // App-Specific AI Max Settings State
  const [enableAiMax, setEnableAiMax] = useState<boolean>(true);
  const [enableTextCustomization, setEnableTextCustomization] = useState<boolean>(true);
  const [enableFinalUrlExpansion, setEnableFinalUrlExpansion] = useState<boolean>(true);
  const [brandInclusions, setBrandInclusions] = useState<string[]>([]);
  const [brandExclusions, setBrandExclusions] = useState<string[]>([]);
  // Brand List Modal State
  const [showBrandListModal, setShowBrandListModal] = useState<boolean>(false);
  const [brandListModalMode, setBrandListModalMode] = useState<"INCLUSION" | "EXCLUSION">("INCLUSION");
  const [brandListNameInput, setBrandListNameInput] = useState<string>("");
  const [brandAppQuery, setBrandAppQuery] = useState<string>("");
  const [selectedBrandListBrands, setSelectedBrandListBrands] = useState<Array<{ name: string; url: string }>>([]);

  // Collapsible sections toggle states
  const [showAssetOptimization, setShowAssetOptimization] = useState<boolean>(false);
  const [showBrands, setShowBrands] = useState<boolean>(false);
  const [showKeywordsSection, setShowKeywordsSection] = useState<boolean>(false);
  const [showAdGroupSettingsSection, setShowAdGroupSettingsSection] = useState<boolean>(false);
  const [showAppTermMatchingSection, setShowAppTermMatchingSection] = useState<boolean>(false);
  const [showBrandInclusionsSection, setShowBrandInclusionsSection] = useState<boolean>(false);
  const [showLocationsOfInterestSection, setShowLocationsOfInterestSection] = useState<boolean>(false);
  const [showUrlInclusionsSection, setShowUrlInclusionsSection] = useState<boolean>(false);
  const [showFinalUrlCard, setShowFinalUrlCard] = useState<boolean>(false);
  const [showDisplayPathCard, setShowDisplayPathCard] = useState<boolean>(false);
  const [showAdUrlOptionsCard, setShowAdUrlOptionsCard] = useState<boolean>(false);
  const [showCallsCard, setShowCallsCard] = useState<boolean>(false);
  const [showHeadlinesCard, setShowHeadlinesCard] = useState<boolean>(false);
  const [showDescriptionsCard, setShowDescriptionsCard] = useState<boolean>(false);
  const [showBusinessNameCard, setShowBusinessNameCard] = useState<boolean>(false);
  const [showBusinessLogoCard, setShowBusinessLogoCard] = useState<boolean>(false);
  const [showCalloutsCard, setShowCalloutsCard] = useState<boolean>(false);
  const [showMoreAssetTypesCard, setShowMoreAssetTypesCard] = useState<boolean>(false);
  const [showSitelinksCard, setShowSitelinksCard] = useState<boolean>(false);

  const presetBrandsList = [
    { name: "Amazon", url: "https://www.amazon.co.uk/" },
    { name: "World Cup", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" },
    { name: "Apple", url: "https://www.apple.com/" },
    { name: "M&S", url: "https://www.marksandspencer.com/" },
    { name: "Altaba", url: "https://www.yahoo.com/" },
    { name: "Premier League", url: "https://www.premierleague.com/" },
    { name: "NBA", url: "https://www.nba.com/" },
    { name: "IKEA", url: "https://www.ikea.com/gb/en/" },
    { name: "Real Madrid CF", url: "https://www.realmadrid.com/" },
    { name: "BBC", url: "https://www.bbc.com/" },
    { name: "Liverpool F.C.", url: "https://www.liverpoolfc.com/" },
    { name: "UEFA Champions League", url: "https://www.uefa.com/uefachampionsleague/" },
    { name: "EBay", url: "https://www.ebay.com/" },
    { name: "Honda", url: "https://www.hondacarindia.com/" },
    { name: "Campeonato Brasileiro Série A", url: "https://brasileirao.cbf.com.br/" },
    { name: "Ford", url: "https://www.ford.co.uk/" },
    { name: "Amazon Prime Video", url: "https://www.primevideo.com/" },
    { name: "Formula 1", url: "https://www.formula1.com/" },
    { name: "FIFA", url: "https://www.fifa.com/fifaplus/en" },
    { name: "Manchester City F.C.", url: "https://www.mancity.com/" },
    { name: "Adidas", url: "https://www.adidas.com/us" },
    { name: "Serie A", url: "https://www.legaseriea.it/" },
    { name: "Mercedes-Benz", url: "https://www.mbusa.com/en/home" },
    { name: "LEGO", url: "https://www.lego.com/en-gb" },
    { name: "Chelsea F.C.", url: "https://twitter.com/ChelseaFC" },
    { name: "IPad", url: "https://www.apple.com/ipad/" },
    { name: "Arsenal F.C.", url: "https://www.arsenal.com/" },
    { name: "Nike Air", url: "https://www.nike.com/" },
    { name: "H&M", url: "https://www2.hm.com/" },
    { name: "MLB", url: "https://www.mlb.com/" },
    { name: "Nissan", url: "https://www.nissan-global.com/EN/" },
    { name: "Airbnb", url: "https://www.airbnb.co.in/" },
    { name: "Sociedade Esportiva Palmeiras", url: "https://www.palmeiras.com.br/" },
    { name: "Audi", url: "https://www.audiusa.com/us/web/en.html" },
    { name: "Grand Theft Auto", url: "http://www.rockstargames.com/grandtheftauto/" },
    { name: "Kia", url: "https://www.kia.com/in/home.html" },
    { name: "Sport Club Corinthians Paulista", url: "https://www.corinthians.com.br/" },
    { name: "Volkswagen AG", url: "https://www.volkswagen.fr/fr.html" },
    { name: "Hyundai", url: "https://www.hyundaicanada.com/" },
    { name: "Employees' Provident Fund Organisation", url: "https://twitter.com/socialepfo" },
    { name: "Cristiano Ronaldo", url: "https://www.cristianoronaldo.com/" },
    { name: "UIDAI", url: "https://uidai.gov.in/" },
    { name: "AC Milan", url: "https://www.acmilan.com/" },
    { name: "ESPN", url: "https://www.espn.com/" },
    { name: "Škoda Auto Volkswagen India", url: "https://www.volkswagen.co.in/en.html" },
    { name: "Zoom Video Communications", url: "https://zoom.us/" },
    { name: "AirPods", url: "https://www.apple.com/airpods/" },
    { name: "Bundesliga", url: "https://www.bundesliga.com/en/bundesliga" },
    { name: "United Parcel Service", url: "https://www.ups.com/" },
    { name: "UPS Access Point", url: "https://www.ups.com/fr/fr/business-solutions/business-shipping-tools.page" },
    { name: "Orange S.A.", url: "https://www.orange.com/en" },
    { name: "Hyundai Motor Group", url: "https://www.hyundaimotorgroup.com/group/CONT0000000000000646" },
    { name: "Aldi", url: "https://www.aldi.co.uk/" },
    { name: "ANSES", url: "http://www.anses.gob.ar/" },
    { name: "Galatasaray S.K.", url: "https://www.galatasaray.org/" },
    { name: "Arizona", url: "https://az.gov/" },
    { name: "Santander Group", url: "https://www.santander.com/en/home" },
    { name: "Cricket Wireless Authorized Retailer", url: "https://www.cricketwireless.com/" },
    { name: "Macintosh", url: "https://www.apple.com/mac/" },
    { name: "Adobe", url: "https://www.adobe.com/" },
    { name: "Liga 1", url: "https://www.ligaindonesia.co.id/" },
    { name: "Liverpool", url: "https://www.liverpool.com.mx/tienda/home" },
    { name: "Loterías Y Apuestas Del Estado", url: "https://www.loteriasyapuestas.es/" },
    { name: "Seznam.cz", url: "https://www.seznam.cz/" },
    { name: "Sonic The Hedgehog", url: "https://www.sonicthehedgehog.com/" },
    { name: "Liga MX", url: "https://fmf.mx/" },
    { name: "ASUS", url: "https://www.asus.com/" },
    { name: "Lotería Nacional", url: "https://www.youtube.com/@LN__Tradicionales" },
    { name: "Mazda", url: "https://www.mazda.com/" },
    { name: "AliExpress", url: "https://www.aliexpress.com/" },
    { name: "JPMorgan Chase", url: "https://www.jpmorganchase.com/" },
    { name: "Indian Railway Catering And Tourism Corporation", url: "https://www.irctc.co.in/" },
    { name: "Claro", url: "https://www.claro.com/" },
    { name: "Chase Bank", url: "https://www.chase.com/" },
    { name: "European Union", url: "https://european-union.europa.eu/" },
    { name: "Amber Heard", url: "http://amberheardofficial.com/" },
    { name: "Porsche", url: "https://www.porsche.com/usa/" },
    { name: "Bosch", url: "https://www.bosch.com/" },
    { name: "Nasdaq", url: "https://www.nasdaq.com/" },
    { name: "Crédit Agricole", url: "https://www.credit-agricole.com/" },
    { name: "Dow Jones & Company", url: "https://smi.wsj.com/" },
    { name: "Club Atlético Boca Juniors", url: "https://www.bocajuniors.com.ar/" },
    { name: "Atlético De Madrid", url: "https://en.atleticodemadrid.com/" },
    { name: "Süper Lig", url: "https://www.tff.org/" },
    { name: "Action", url: "https://www.action.com/nl-nl/" },
    { name: "Target Australia", url: "https://www.target.com.au/" },
    { name: "International Cricket Council", url: "https://www.icc-cricket.com/" },
    { name: "Allegro", url: "https://allegro.pl/" },
    { name: "AOL", url: "https://www.aol.co.uk/" },
    { name: "AS Trenčín", url: "https://www.astrencin.sk/" },
    { name: "Wells Fargo ATM", url: "https://www.wellsfargo.com/locator/" },
    { name: "AT&T", url: "https://www.att.com/" },
    { name: "Social Security Administration", url: "https://www.ssa.gov/" },
    { name: "McDonald's", url: "https://www.mcdonalds.com/us/en-us/location/ca/san-francisco/1201-ocean-ave/1782.html" },
    { name: "American Airlines", url: "https://www.aa.com/homePage.do" },
    { name: "JBL", url: "https://in.jbl.com/" },
    { name: "Clube Atlético Mineiro", url: "https://atletico.com.br/" },
    { name: "Club Atlético River Plate", url: "https://www.cariverplate.com.ar/" },
    { name: "Bank Of America ATM", url: "https://locators.bankofamerica.com/" }
  ];
  const [aiGenFinalUrl, setAiGenFinalUrl] = useState<string>("https://www.example.com");

  const [showMoreSettings, setShowMoreSettings] = useState<boolean>(false);
  const [openSetting, setOpenSetting] = useState<string | null>(null);
  const [openMainSetting, setOpenMainSetting] = useState<string | null>("networks");
  const [openBiddingSetting, setOpenBiddingSetting] = useState<string | null>("bidding");
  const [openKeywordAssetCard, setOpenKeywordAssetCard] = useState<boolean>(true);
  const [trackingTemplate, setTrackingTemplate] = useState<string>("");
  const [finalUrlSuffix, setFinalUrlSuffix] = useState<string>("");
  const [customParams, setCustomParams] = useState<Array<{ name: string; value: string }>>([
    { name: "", value: "" }
  ]);
  const [pageFeeds, setPageFeeds] = useState<string[]>([]);
  const [adScheduleList, setAdScheduleList] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "00:00", end: "00:00" }
  ]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>("");
  const [endDateOption, setEndDateOption] = useState<"NONE" | "SELECT">("NONE");

  // Step 5: Keywords and Ads State
  const [adGroupName, setAdGroupName] = useState<string>("Ad Group 1");
  const [keywordScanUrl, setKeywordScanUrl] = useState<string>("");
  const [keywordProductsInput, setKeywordProductsInput] = useState<string>("");
  const [keywordsText, setKeywordsText] = useState<string>("");
  const [useAppTermMatchingAdGroup, setUseAppTermMatchingAdGroup] = useState<boolean>(true);
  const [adGroupBrandInclusions, setAdGroupBrandInclusions] = useState<string[]>([]);
  const [adGroupLocationsOfInterest, setAdGroupLocationsOfInterest] = useState<string[]>([]);
  const [adGroupUrlInclusions, setAdGroupUrlInclusions] = useState<string[]>([]);
  const [finalUrl, setFinalUrl] = useState<string>("https://www.example.com");
  const [displayPath1, setDisplayPath1] = useState<string>("");
  const [displayPath2, setDisplayPath2] = useState<string>("");
  const [headlines, setHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
  const [uploadedHtml5, setUploadedHtml5] = useState<File[]>([]);
  
  const [isPromotionsOpen, setIsPromotionsOpen] = useState(false);
  const [promotionEvent, setPromotionEvent] = useState("None");
  const [promotionLanguage, setPromotionLanguage] = useState("Hindi");
  const [promotionCurrency, setPromotionCurrency] = useState("INR");
  const [promotionType, setPromotionType] = useState("Monetary discount");
  const [promotionTypeAmount, setPromotionTypeAmount] = useState("");
  const [promotionItem, setPromotionItem] = useState("");
  const [promotionFinalUrl, setPromotionFinalUrl] = useState("");
  const [promotionDetailsType, setPromotionDetailsType] = useState("None");
  const [promotionDetailsAmount, setPromotionDetailsAmount] = useState("");
  const [promotionStartDateOption, setPromotionStartDateOption] = useState("NONE");
  const [promotionStartDate, setPromotionStartDate] = useState("");
  const [promotionEndDateOption, setPromotionEndDateOption] = useState("NONE");
  const [promotionEndDate, setPromotionEndDate] = useState("");

  const [isUrlOptionsOpen, setIsUrlOptionsOpen] = useState(false);
  const [adGroupTrackingTemplate, setAdGroupTrackingTemplate] = useState("");
  const [adGroupFinalUrlSuffix, setAdGroupFinalUrlSuffix] = useState("");
  const [adGroupCustomParams, setAdGroupCustomParams] = useState([{ name: "", value: "" }]);
  const [differentMobileUrl, setDifferentMobileUrl] = useState(false);

  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [assetScheduleStartDateOption, setAssetScheduleStartDateOption] = useState("NONE");
  const [assetScheduleStartDate, setAssetScheduleStartDate] = useState("");
  const [assetScheduleEndDateOption, setAssetScheduleEndDateOption] = useState("NONE");
  const [assetScheduleEndDate, setAssetScheduleEndDate] = useState("");
  const [assetScheduleDays, setAssetScheduleDays] = useState("All days");

  const [businessName, setBusinessName] = useState<string>("JISNU DIGITAL SOLUTIONS PRIVATE LIMITED");
  const [businessLogo, setBusinessLogo] = useState<string>("");
  const [businessLogos, setBusinessLogos] = useState<string[]>([]);

  // URL Inclusions Modal State
  const [showUrlInclusionsModal, setShowUrlInclusionsModal] = useState<boolean>(false);
  const [urlInclusionsTab, setUrlInclusionsTab] = useState<"URLS" | "CUSTOM_LABELS" | "RULES">("URLS");
  const [urlInclusionsText, setUrlInclusionsText] = useState<string>("");
  const [urlInclusionsCustomLabel, setUrlInclusionsCustomLabel] = useState<string>("");
  const [urlInclusionsRuleField, setUrlInclusionsRuleField] = useState<string>("URL_CONTAINS");
  const [urlInclusionsRuleValue, setUrlInclusionsRuleValue] = useState<string>("");
  const [selectedUrlInclusionTargets, setSelectedUrlInclusionTargets] = useState<string[]>([]);

  // Modals State
  const [activeModal, setActiveModal] = useState<
    "CALLOUTS" | "SITELINKS" | "CALLS" | "PROMOTIONS" | "PRICES" | "MESSAGES" | "SNIPPETS" | "LEAD_FORMS" | "APPS" | "BRAND_GUIDELINES" | "AUDIENCE_SIGNAL" | null
  >(null);

  // Modal 1: Sitelinks State
  const [sitelinks, setSitelinks] = useState<Array<{ text: string; desc1: string; desc2: string; url: string }>>([
    { text: "", desc1: "", desc2: "", url: "" },
    { text: "", desc1: "", desc2: "", url: "" },
    { text: "", desc1: "", desc2: "", url: "" },
    { text: "", desc1: "", desc2: "", url: "" },
    { text: "", desc1: "", desc2: "", url: "" },
    { text: "", desc1: "", desc2: "", url: "" }
  ]);
  const [openSitelinkIdx, setOpenSitelinkIdx] = useState<number>(0);
  const [sitelinkTrackingTemplate, setSitelinkTrackingTemplate] = useState<string>("");
  const [sitelinkFinalUrlSuffix, setSitelinkFinalUrlSuffix] = useState<string>("");
  const [sitelinkCustomParamName, setSitelinkCustomParamName] = useState<string>("");
  const [sitelinkCustomParamValue, setSitelinkCustomParamValue] = useState<string>("");
  const [useDifferentMobileUrl, setUseDifferentMobileUrl] = useState<boolean>(false);
  const [mobileFinalUrl, setMobileFinalUrl] = useState<string>("");
  const [assetStartDateMode, setAssetStartDateMode] = useState<"NONE" | "CUSTOM">("NONE");
  const [assetStartDate, setAssetStartDate] = useState<string>("");
  const [assetEndDateMode, setAssetEndDateMode] = useState<"NONE" | "CUSTOM">("NONE");
  const [assetEndDate, setAssetEndDate] = useState<string>("");
  const [sitelinkSchedules, setSitelinkSchedules] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "12:00 AM", end: "12:00 AM" }
  ]);

  // Modal 0: Callouts State
  const [callouts, setCallouts] = useState<string[]>(["24/7 Customer Support", "Free Shipping", "Instant Setup"]);
  const [calloutInputList, setCalloutInputList] = useState<string[]>(["Callout text 1", "Callout text 2", "Callout text 3", "Callout text 4"]);

  // Modal 3: Promotions State
  const [promoOccasion, setPromoOccasion] = useState<string>("None");
  const [promoLanguage, setPromoLanguage] = useState<string>("English");
  const [promoCurrency, setPromoCurrency] = useState<string>("USD");
  const [promoType, setPromoType] = useState<"MONETARY" | "PERCENT">("MONETARY");
  const [promoValue, setPromoValue] = useState<string>("");
  const [promoItem, setPromoItem] = useState<string>("");
  const [promoFinalUrl, setPromoFinalUrl] = useState<string>("");
  const [promoDetails, setPromoDetails] = useState<string>("None");
  const [promoStartDateMode, setPromoStartDateMode] = useState<"NONE" | "CUSTOM">("NONE");
  const [promoStartDate, setPromoStartDate] = useState<string>("");
  const [promoEndDateMode, setPromoEndDateMode] = useState<"NONE" | "CUSTOM">("NONE");
  const [promoEndDate, setPromoEndDate] = useState<string>("");

  // Modal 4: Structured Snippet State
  const [snippetLanguage, setSnippetLanguage] = useState<string>("English");
  const [snippetHeaderType, setSnippetHeaderType] = useState<string>("Select header type");
  const [snippetValuesList, setSnippetValuesList] = useState<string[]>(["Value 1", "Value 2", "Value 3", "Value 4"]);

  // Modal 5: Messages State
  const [selectedMessagePlatform, setSelectedMessagePlatform] = useState<string>("Select message platform");
  const [optimizeForMessageAds, setOptimizeForMessageAds] = useState<boolean>(true);
  const [msgPhone, setMsgPhone] = useState<string>("");
  const [msgCountry, setMsgCountry] = useState<string>("India (+91)");
  const [msgStarterMessage, setMsgStarterMessage] = useState<string>("Can I get started with a delivery?");
  const [msgCallToAction, setMsgCallToAction] = useState<string>("None");
  const [msgCtaDescription, setMsgCtaDescription] = useState<string>("");
  const [msgCustomUrlName, setMsgCustomUrlName] = useState<string>("");

  // Detailed Lead Forms Modal State
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
  const [lfCustomQuestions, setLfCustomQuestions] = useState<Array<{ id: string; question: string }>>([]);
  const [lfCustomLanguage, setLfCustomLanguage] = useState<string>("English");
  const [lfLeadScoringQuestion, setLfLeadScoringQuestion] = useState<string>("");
  const [lfPrivacyPolicyUrl, setLfPrivacyPolicyUrl] = useState<string>("");
  const [lfBackgroundImage, setLfBackgroundImage] = useState<string>("");
  
  // Submission Message
  const [lfSubHeadline, setLfSubHeadline] = useState<string>("Thank you.");
  const [lfSubDescription, setLfSubDescription] = useState<string>("We'll contact you soon.");
  const [lfSubCta, setLfSubCta] = useState<string>("Visit site");
  const [lfSubCtaUrl, setLfSubCtaUrl] = useState<string>("");
  const [lfAdCta, setLfAdCta] = useState<string>("Learn more");
  const [lfAdCtaDescription, setLfAdCtaDescription] = useState<string>("");

  // Delivery & Options
  const [lfWebhookUrl, setLfWebhookUrl] = useState<string>("");
  const [lfWebhookKey, setLfWebhookKey] = useState<string>("");
  const [lfNotificationEmails, setLfNotificationEmails] = useState<string>("");
  const [lfFormType, setLfFormType] = useState<"MORE_VOLUME" | "MORE_QUALIFIED">("MORE_VOLUME");
  const [savedLeadForms, setSavedLeadForms] = useState<Array<{ headline: string; business: string }>>([]);

  // Apps Modal State
  const [appPlatform, setAppPlatform] = useState<"Android" | "iOS">("Android");
  const [appAppQuery, setAppAppQuery] = useState<string>("");
  const [appLinkText, setAppLinkText] = useState<string>("");
  const [appTrackingTemplate, setAppTrackingTemplate] = useState<string>("");
  const [appFinalUrlSuffix, setAppFinalUrlSuffix] = useState<string>("");
  const [appCustomParams, setAppCustomParams] = useState<Array<{ id: string; name: string; value: string }>>([
    { id: "acp-1", name: "", value: "" }
  ]);
  const [appStartDate, setAppStartDate] = useState<string>("");
  const [appEndDate, setAppEndDate] = useState<string>("");
  const [appScheduleDays, setAppScheduleDays] = useState<string>("All days");
  const [appScheduleStart, setAppScheduleStart] = useState<string>("09:00");
  const [appScheduleEnd, setAppScheduleEnd] = useState<string>("18:00");
  const [showAppAdvanced, setShowAppAdvanced] = useState<boolean>(false);
  const [savedApps, setSavedApps] = useState<Array<{ platform: string; query: string; linkText: string }>>([]);

  // Modal 2: Calls State
  const [callCountry, setCallCountry] = useState<string>("India (+91)");
  const [callPhone, setCallPhone] = useState<string>("");
  const [callConversionAction, setCallConversionAction] = useState<string>("Use account settings (Calls from ads)");
  const [callSchedules, setCallSchedules] = useState<Array<{ day: string; start: string; end: string }>>([
    { day: "All days", start: "00:00", end: "00:00" }
  ]);

  // Step 4: Budget State
  const [budgetType, setBudgetType] = useState<"DAILY" | "TOTAL">("DAILY");
  const [selectedPresetBudget, setSelectedPresetBudget] = useState<string>("1556.83");
  const [customBudgetValue, setCustomBudgetValue] = useState<string>("");

  const timeOptions = [
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
    "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"
  ];

  const dayOptions = [
    "All days", "Mondays - Fridays", "Saturdays - Sundays",
    "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"
  ];

  const languagesList = [
    "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu",
    "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German",
    "Chinese (simplified)", "Japanese", "Arabic", "Portuguese", "Russian"
  ];

  const locationSuggestionsList = [
    { name: "Mumbai, Maharashtra, India", type: "City", reach: "21,400,000" },
    { name: "Delhi, India", type: "Union territory", reach: "30,200,000" },
    { name: "Bengaluru, Karnataka, India", type: "City", reach: "13,100,000" },
    { name: "Hyderabad, Telangana, India", type: "City", reach: "10,500,000" },
    { name: "Pune, Maharashtra, India", type: "City", reach: "7,800,000" },
    { name: "United States", type: "Country", reach: "280,000,000" },
    { name: "United Kingdom", type: "Country", reach: "55,000,000" }
  ];

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const orgId = "demo-org-123";
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

  const activeBudgetValue = selectedPresetBudget === "CUSTOM"
    ? Number(customBudgetValue.replace(/,/g, "")) || 1556.83
    : Number(selectedPresetBudget) || 1556.83;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Header ── */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 text-xs font-semibold">
            <span className="text-slate-500">app-promotion</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <SearchIcon className="h-3.5 w-3.5 text-primary" />
              App Setup
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono">
            {accountInfo ? `${accountInfo.customerId} ${accountInfo.name}` : customerId ? `ID: ${customerId}` : "658-735-5041 JISNU Digital Solutions PVT LTD"}
          </span>
          <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-900" />
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="flex-1 flex w-full pb-20 overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block shrink-0 overflow-y-auto hidden-scrollbar">
          <div className="p-6 space-y-6">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
              <SearchIcon className="h-4 w-4 text-primary shrink-0" />
              <span>App</span>
            </div>

            <nav className="space-y-1.5 text-xs">
              {/* 1) Campaign settings */}
              <div className="space-y-1">
                <div
                  onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                  className={`p-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    wizardStep === "CAMPAIGN_SETTINGS"
                      ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</div>
                  <span>Campaign settings</span>
                </div>
                {wizardStep === "CAMPAIGN_SETTINGS" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Mobile app</p>
                    <p className="hover:text-slate-800">Locations</p>
                    <p className="hover:text-slate-800">Languages</p>
                    <p className="hover:text-slate-800">View-through conversion optimization</p>
                    <p className="hover:text-slate-800">EU political ads</p>
                  </div>
                )}
              </div>

              {/* 2) Ad group */}
              <div className="space-y-1">
                <div
                  onClick={() => setWizardStep("AD_GROUP")}
                  className={`p-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    wizardStep === "AD_GROUP"
                      ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">2</div>
                  <span>Ad group</span>
                </div>
                {wizardStep === "AD_GROUP" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Product groups</p>
                    <p className="hover:text-slate-800">Ad assets</p>
                    <p className="hover:text-slate-800">Audience signal</p>
                  </div>
                )}
              </div>

              {/* 3) Bidding and budget */}
              <div className="space-y-1">
                <div
                  onClick={() => setWizardStep("BIDDING_BUDGET")}
                  className={`p-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                    wizardStep === "BIDDING_BUDGET"
                      ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">3</div>
                  <span>Bidding and budget</span>
                </div>
                {wizardStep === "BIDDING_BUDGET" && (
                  <div className="ml-6 space-y-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3 py-1">
                    <p className="hover:text-slate-800">Bidding</p>
                    <p className="hover:text-slate-800">Budget</p>
                  </div>
                )}
              </div>

              {/* 4) Review */}
              <div
                onClick={() => setWizardStep("SUMMARY")}
                className={`p-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-all ${
                  wizardStep === "SUMMARY"
                    ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                }`}
              >
                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">4</div>
                <span>Review</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6 max-w-4xl mx-auto">
          
          {/* STEP 2: CAMPAIGN SETTINGS */}
          {wizardStep === "CAMPAIGN_SETTINGS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign settings</h1>
                <p className="text-xs text-slate-500 mt-1">To reach the right people, start by defining key settings for your campaign</p>
              </div>

              {/* 1. Mobile app */}
              {openMainSetting === "mobile_app" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenMainSetting(null)}>
                    <h2 className="text-sm font-semibold text-slate-900">Mobile app</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="space-y-4 text-xs">
                    <div className="space-y-3">
                      <label className="text-slate-700 font-semibold block">Mobile app platform</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={mobileAppPlatform === "ANDROID"} onChange={() => setMobileAppPlatform("ANDROID")} className="text-primary focus:ring-primary h-4 w-4 bg-slate-50 border-slate-300" />
                          <span className="text-slate-800">Android</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={mobileAppPlatform === "IOS"} onChange={() => setMobileAppPlatform("IOS")} className="text-primary focus:ring-primary h-4 w-4 bg-slate-50 border-slate-300" />
                          <span className="text-slate-800">iOS</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-slate-700 font-semibold block">Look up your app</label>
                      <div className="relative max-w-md">
                        <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={mobileAppQuery}
                          onChange={(e) => setMobileAppQuery(e.target.value)}
                          placeholder="Look up your app"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                        />
                      </div>
                      
                      {selectedMobileApp && (
                        <div className="mt-4 flex items-center gap-4 p-3 rounded-xl border border-primary/30 bg-primary/5 max-w-md">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-300">
                            <Smartphone className="h-6 w-6 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-800 font-bold text-sm truncate">{selectedMobileApp.name}</h4>
                            <p className="text-slate-500 text-[11px] truncate">{selectedMobileApp.publisher}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span>{selectedMobileApp.store}</span>
                              <span>•</span>
                              <span>{selectedMobileApp.rating} ★</span>
                            </div>
                          </div>
                          <button onClick={() => setSelectedMobileApp(null)} className="text-slate-500 hover:text-slate-900 p-2">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenMainSetting("mobile_app")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">Mobile app</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedMobileApp ? `${selectedMobileApp.name} (${mobileAppPlatform})` : "Not selected"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* 2. Locations */}
              {openMainSetting === "locations" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenMainSetting(null)}>
                    <h2 className="text-sm font-semibold text-slate-900">Locations</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="AppLoc"
                        checked={selectedLocation === "ALL"}
                        onChange={() => setSelectedLocation("ALL")}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-slate-800 font-medium">All countries and territories</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="AppLoc"
                        checked={selectedLocation === "INDIA"}
                        onChange={() => setSelectedLocation("INDIA")}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-slate-800 font-medium">India</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="AppLoc"
                        checked={selectedLocation === "CUSTOM"}
                        onChange={() => setSelectedLocation("CUSTOM")}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-slate-800 font-medium">Enter another location</span>
                    </label>

                    {selectedLocation === "CUSTOM" && (
                      <div className="ml-7 pt-2 space-y-3 animate-in fade-in duration-200">
                        <div className="relative max-w-md">
                          <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            value={customLocationInput}
                            onChange={(e) => setCustomLocationInput(e.target.value)}
                            placeholder="Enter a location to target or exclude"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Suggestions List */}
                        {customLocationInput.trim() && (
                          <div className="border border-slate-200 bg-slate-50 rounded-xl max-w-md overflow-hidden space-y-1 p-1">
                            {locationSuggestionsList.filter(l => l.name.toLowerCase().includes(customLocationInput.toLowerCase())).map((loc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 hover:bg-white rounded-lg text-xs">
                                <div>
                                  <span className="font-semibold text-slate-800 block">{loc.name}</span>
                                  <span className="text-[10px] text-slate-500">{loc.type} • Reach: {loc.reach}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!targetLocations.some(t => t.name === loc.name)) {
                                      setTargetLocations(prev => [...prev, loc]);
                                    }
                                  }}
                                  className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-bold text-[11px] rounded-lg hover:bg-primary/20"
                                >
                                  Target
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {targetLocations.map((loc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 max-w-md">
                            <div>
                              <span className="font-semibold text-slate-800 block">{loc.name}</span>
                              <span className="text-[10px] text-slate-500">{loc.type} • Reach: {loc.reach}</span>
                            </div>
                            <button onClick={() => setTargetLocations(prev => prev.filter((_, i) => i !== idx))}>
                              <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-rose-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowLocationOptions(!showLocationOptions)}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLocationOptions ? "rotate-180" : ""}`} />
                        Location options
                      </button>

                      {showLocationOptions && (
                        <div className="mt-3 ml-4 space-y-2 text-xs animate-in fade-in duration-200">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="AppLocOpt"
                              checked={locationTargetingType === "PRESENCE_INTEREST"}
                              onChange={() => setLocationTargetingType("PRESENCE_INTEREST")}
                              className="text-primary h-4 w-4"
                            />
                            <span className="text-slate-700">Presence or interest: People in, regularly in, or who've shown interest in your targeted locations (recommended)</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="AppLocOpt"
                              checked={locationTargetingType === "PRESENCE"}
                              onChange={() => setLocationTargetingType("PRESENCE")}
                              className="text-primary h-4 w-4"
                            />
                            <span className="text-slate-700">Presence: People in or regularly in your targeted locations</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenMainSetting("locations")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">Locations</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedLocation === "ALL" ? "All countries and territories" : selectedLocation === "INDIA" ? "India" : targetLocations.map(l => l.name).join(", ") || "Custom locations"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* 3. Languages */}
              {openMainSetting === "languages" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenMainSetting(null)}>
                    <h2 className="text-sm font-semibold text-slate-900">Languages</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="relative max-w-md">
                      <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={languageAppInput}
                        onFocus={() => setShowLanguageDropdown(true)}
                        onChange={(e) => {
                          setLanguageAppInput(e.target.value);
                          setShowLanguageDropdown(true);
                        }}
                        placeholder="Start typing or select a language"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Languages Checkbox Grid - Only Shown on Click/Focus/Type */}
                    {(showLanguageDropdown || languageAppInput.trim().length > 0) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50 animate-in fade-in duration-200">
                        {languagesList.filter(l => l.toLowerCase().includes(languageAppInput.toLowerCase())).map((lang, idx) => {
                          const isSelected = selectedLanguages.includes(lang);
                          return (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 p-1 rounded hover:bg-white">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedLanguages(prev => [...prev, lang]);
                                  else setSelectedLanguages(prev => prev.filter(l => l !== lang));
                                }}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span>{lang}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
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
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenMainSetting("languages")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">Languages</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedLanguages.length > 0 ? selectedLanguages.join(", ") : "All languages"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* NEW: View-through conversion optimization */}
              {openMainSetting === "view_through" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenMainSetting(null)}>
                    <h2 className="text-sm font-semibold text-slate-900">View-through conversion optimization</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-700">
                      Optimize your campaign to show ads to people more likely to install your app or take an action within it, even if they didn't click your ad.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={viewThroughConversion}
                        onChange={(e) => setViewThroughConversion(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                      />
                      <div className="space-y-1">
                        <span className="text-slate-800 font-semibold block">Enable view-through conversion optimization</span>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenMainSetting("view_through")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">View-through conversion optimization</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {viewThroughConversion ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* 4. EU political ads */}
              {openMainSetting === "eu_political" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenMainSetting(null)}>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">EU political ads</h2>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">Required</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <p className="font-semibold text-slate-800">Does your campaign have European Union political ads?</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="AppEuPol"
                        checked={euPoliticalAds === "YES"}
                        onChange={() => setEuPoliticalAds("YES")}
                        className="text-primary h-4 w-4"
                      />
                      <span className="text-slate-800">Yes, this campaign has EU political ads</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="AppEuPol"
                        checked={euPoliticalAds === "NO"}
                        onChange={() => setEuPoliticalAds("NO")}
                        className="text-primary h-4 w-4"
                      />
                      <span className="text-slate-800">No, this campaign doesn't have EU political ads</span>
                    </label>
                    {euPoliticalAds === "YES" && (
                      <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] leading-relaxed">
                        Your campaign can't run in the European Union.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenMainSetting("eu_political")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">EU political ads</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {euPoliticalAds === "YES" ? "Yes, this campaign has EU political ads" : "No, this campaign doesn't have EU political ads"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* 5. More Settings Section & List */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoreSettings(!showMoreSettings)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-primary transition-all cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  More settings
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMoreSettings ? "rotate-180" : ""}`} />
                </button>

                {showMoreSettings && (
                  <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-800 text-xs animate-in fade-in duration-200 overflow-hidden">
                    
                    {/* 1. Start and end dates */}
                    <div className="divide-y divide-slate-800">
                      {openSetting === "dates" ? (
                        <div className="p-6 space-y-4 bg-slate-50">
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenSetting(null)}>
                            <div className="space-y-0.5">
                              <h3 className="font-semibold text-slate-800 text-sm">Start and end dates</h3>
                              <p className="text-[11px] text-slate-500">
                                Start date: {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} End date: {endDateOption === "NONE" ? "None" : (endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Not set")}
                              </p>
                            </div>
                            <Edit3 className="h-4 w-4 text-primary" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md text-xs pt-4 border-t border-slate-200/40">
                            <div className="space-y-1">
                              <label className="block text-[11px] text-slate-500 font-semibold">Start date</label>
                              <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                  const newDate = e.target.value;
                                  setStartDate(newDate);
                                  if (endDate && newDate > endDate) {
                                    setEndDate(newDate);
                                  }
                                }}
                                onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[11px] text-slate-500 font-semibold">End date</label>
                              <div className="flex items-center gap-4 mb-2 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                                  <input 
                                    type="radio" 
                                    name="endDateOption" 
                                    checked={endDateOption === "NONE"} 
                                    onChange={() => {
                                      setEndDateOption("NONE");
                                      setEndDate("");
                                    }} 
                                    className="text-primary focus:ring-primary h-3.5 w-3.5"
                                  />
                                  None
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                                  <input 
                                    type="radio" 
                                    name="endDateOption" 
                                    checked={endDateOption === "SELECT"} 
                                    onChange={() => setEndDateOption("SELECT")} 
                                    className="text-primary focus:ring-primary h-3.5 w-3.5"
                                  />
                                  Select a date
                                </label>
                              </div>
                              {endDateOption === "SELECT" && (
                                <input
                                  type="date"
                                  value={endDate}
                                  min={startDate || new Date().toISOString().split("T")[0]}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer"
                                />
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500">Your ads will continue to run unless you specify an end date.</p>
                        </div>
                      ) : (
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
                          onClick={() => setOpenSetting("dates")}
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-48">
                              <h3 className="font-semibold text-slate-800 text-sm">Start and end dates</h3>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Start date: {new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} End date: {endDateOption === "NONE" ? "None" : (endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Not set")}
                            </div>
                          </div>
                          <Edit3 className="h-4 w-4 text-slate-500" />
                        </div>
                      )}
                    </div>

                    {/* 2. Data feed */}
                    <div className="divide-y divide-slate-800">
                      {openSetting === "data_feed" ? (
                        <div className="p-6 space-y-4 bg-slate-50">
                          <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenSetting(null)}>
                            <div className="space-y-0.5">
                              <h3 className="font-semibold text-slate-800 text-sm">Data feed</h3>
                              <p className="text-[11px] text-slate-500">
                                {useDataFeed ? "Attached" : "Not attached"}
                              </p>
                            </div>
                            <Edit3 className="h-4 w-4 text-primary" />
                          </div>

                          <div className="space-y-3 text-xs pt-4 border-t border-slate-200/40">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={useDataFeed}
                                onChange={(e) => setUseDataFeed(e.target.checked)}
                                className="mt-0.5 text-primary h-4 w-4 bg-slate-50 border-slate-300 rounded"
                              />
                              <div className="space-y-1">
                                <span className="text-slate-800 font-semibold block">Attach a feed to improve targeting and reach</span>
                                <span className="text-[11px] text-slate-500 block leading-relaxed">
                                  You can select an existing feed or create a new one to help Google AI match your app's content to the right people.
                                </span>
                              </div>
                            </label>
                            
                            {useDataFeed && (
                              <div className="ml-7 space-y-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                                  <input 
                                    type="radio" 
                                    name="dataFeedType" 
                                    checked={dataFeedType === "Dynamic ad feed"} 
                                    onChange={() => setDataFeedType("Dynamic ad feed")} 
                                    className="text-primary focus:ring-primary h-4 w-4"
                                  />
                                  Dynamic ad feed
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                                  <input 
                                    type="radio" 
                                    name="dataFeedType" 
                                    checked={dataFeedType === "Google Merchant Center feed"} 
                                    onChange={() => setDataFeedType("Google Merchant Center feed")} 
                                    className="text-primary focus:ring-primary h-4 w-4"
                                  />
                                  Google Merchant Center feed
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                                  <input 
                                    type="radio" 
                                    name="dataFeedType" 
                                    checked={dataFeedType === "Hotel Center feed"} 
                                    onChange={() => setDataFeedType("Hotel Center feed")} 
                                    className="text-primary focus:ring-primary h-4 w-4"
                                  />
                                  Hotel Center feed
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
                          onClick={() => setOpenSetting("data_feed")}
                        >
                          <div className="flex items-center gap-16">
                            <div className="w-48">
                              <h3 className="font-semibold text-slate-800 text-sm">Data feed</h3>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {useDataFeed ? "Attached" : "Not attached"}
                            </div>
                          </div>
                          <Edit3 className="h-4 w-4 text-slate-500" />
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* (DELETED) STEP 3: AI MAX FOR App CAMPAIGNS */}
          {false && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">AI Max for App campaigns</h1>
              </div>

              {/* Main Container Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
                
                {/* Header Banner: Get the best AI-powered performance */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold text-slate-900">Get the best AI-powered performance on Google App</h2>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Advertisers that activate AI Max in App Campaigns will typically see 14% more conversions or conversion value at a similar CPA / ROAS.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-200 text-[11px]">
                    <div className="flex items-start gap-3 text-slate-700">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">Engage more customers and boost performance.</strong> Easily expand your keywords with broad match technology and let Google AI match content from your landing pages and assets to help you show up on more relevant Appes. New ad group settings help you guide which customers you reach.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-slate-700">
                      <Edit3 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">Tailor your ads and keep them fresh.</strong> Use Google AI to serve the most relevant ad copy and landing pages to each customer based on their unique interest and intent.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-slate-700">
                      <SlidersHorizontal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">Take charge and understand how the newest and best Google AI is working for you.</strong> You'll get new actionable insights in App term reports that show how AI Max improves performance.
                      </span>
                    </div>

                    <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold block pt-1">Learn more</a>
                  </div>
                </div>

                {/* Main Toggle Switch */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAiMax}
                      onChange={(e) => setEnableAiMax(e.target.checked)}
                      className="rounded text-primary h-4 w-4"
                    />
                    <span className="font-bold text-slate-900 text-sm">Optimize your campaign with AI Max</span>
                  </label>
                </div>

                {/* Asset Optimization Accordion Card */}
                {enableAiMax && (
                  <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-6 animate-in fade-in duration-200">
                    {showAssetOptimization ? (
                      <>
                        <div 
                          onClick={() => setShowAssetOptimization(false)}
                          className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                        >
                          <h3 className="font-bold text-slate-900 text-sm">Asset optimization</h3>
                          <ChevronUp className="h-4 w-4 text-slate-500" />
                        </div>

                        {/* Sub-Card 1: Text Customization */}
                        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={enableTextCustomization}
                                onChange={(e) => setEnableTextCustomization(e.target.checked)}
                                className="rounded text-primary h-4 w-4"
                              />
                              <span className="font-bold text-slate-900">Text customization</span>
                            </label>
                          </div>

                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Match your ad copy to what people are Apping for with new headlines and descriptions using your website and assets. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Learn more about text customization</a>
                          </p>

                          <div className="flex items-center gap-4 text-[11px]">
                            <button type="button" className="text-blue-400 hover:underline font-semibold">Add text guidelines</button>
                            <button type="button" className="text-blue-400 hover:underline font-semibold">View asset examples</button>
                          </div>

                          {/* Before / After Sponsored Result Ad Visual Preview */}
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
                              
                              {/* Original Ad Card */}
                              <div className="w-full md:w-64 p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                  <SearchIcon className="h-3 w-3 text-slate-500" />
                                  <span className="truncate">Blue wall paint delivery</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 block">Sponsored result</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                    <span className="truncate">Beahm's https://www.beahms.com/</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Paint Colors | Expert Picks</h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-2">Make your house a home with our range of painting and decorating essentials.</p>
                                </div>
                              </div>

                              <ArrowRight className="h-5 w-5 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

                              {/* Dynamic Tailored Ad Card */}
                              <div className="w-full md:w-72 p-3.5 rounded-lg border border-blue-500/30 bg-white space-y-2 shadow-lg">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                  <SearchIcon className="h-3 w-3 text-slate-500" />
                                  <span className="truncate">Blue wall paint delivery</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 block">Sponsored result</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                    <span className="truncate">Beahm's https://www.beahms.com/</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Wall Paint, Next-Day Delivery | Expert Picks</h4>
                                  <p className="text-[10px] text-slate-500 line-clamp-2">Make your house a home with our range of painting and decorating essentials.</p>
                                </div>
                              </div>

                            </div>
                            <span className="text-[10px] text-slate-500 block text-center italic">Example of text customization</span>
                          </div>
                        </div>

                        {/* Sub-Card 2: Final URL Expansion */}
                        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={enableFinalUrlExpansion}
                                onChange={(e) => setEnableFinalUrlExpansion(e.target.checked)}
                                className="rounded text-primary h-4 w-4"
                              />
                              <span className="font-bold text-slate-900">Final URL expansion</span>
                            </label>
                          </div>

                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Direct people to the most relevant content by matching your landing pages with user Appes. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Learn more about Final URL expansion</a>
                          </p>
                          <p className="text-[11px] text-amber-400 font-semibold">Requires text customization to be turned on to ensure ad copy matches landing page</p>

                          <div className="pt-1">
                            <button type="button" className="text-blue-400 hover:underline font-semibold text-[11px]">Add URL exclusions</button>
                          </div>

                          {/* Before / After Final URL Expansion Visual Preview */}
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
                              
                              {/* Original Landing Card */}
                              <div className="w-full md:w-64 p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                  <SearchIcon className="h-3 w-3 text-slate-500" />
                                  <span className="truncate">Blue wall paint delivery</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 block">Sponsored result</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                    <span className="truncate">Beahm's https://www.beahms.com/</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Paint Colors | Expert Picks</h4>
                                </div>
                              </div>

                              <ArrowRight className="h-5 w-5 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

                              {/* Expanded Landing URL Card */}
                              <div className="w-full md:w-72 p-3.5 rounded-lg border border-blue-500/30 bg-white space-y-2 shadow-lg">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                  <SearchIcon className="h-3 w-3 text-slate-500" />
                                  <span className="truncate">Blue wall paint delivery</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 block">Sponsored result</span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                    <span className="truncate font-semibold text-slate-800">Beahm's https://www.beahms.com/<strong className="text-blue-400 font-bold">/paint/blue</strong></span>
                                  </div>
                                  <h4 className="text-xs font-bold text-blue-400 line-clamp-1">Blue Wall Paint, Next-Day Delivery | Expert Picks</h4>
                                </div>
                              </div>

                            </div>
                            <span className="text-[10px] text-slate-500 block text-center italic">Example of Final URL expansion</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div 
                        className="flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setShowAssetOptimization(true)}
                      >
                        <div className="flex items-center gap-16">
                          <div className="w-48">
                            <h3 className="font-bold text-slate-900 text-sm">Asset optimization</h3>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {[enableTextCustomization ? "Text customization" : null, enableFinalUrlExpansion ? "Final URL expansion" : null].filter(Boolean).join(", ") || "Off"}
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* Brands Card */}
                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-5 shadow-sm">
                  {showBrands ? (
                    <>
                      <div 
                        onClick={() => setShowBrands(false)}
                        className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer select-none"
                      >
                        <h3 className="font-bold text-slate-900 text-sm">Brands</h3>
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Use brand settings to ensure your campaign meets your branded traffic needs. You can add up to 20 brand lists across your brand inclusions and exclusions. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Learn more about brand settings</a>
                      </p>

                      {/* Brand inclusions */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-800">Brand inclusions</label>
                        <p className="text-[11px] text-slate-500">
                          Your ads will only show on Appes that match your keywords and mention selected brands, including related products and services. Brand inclusions will limit App traffic, so apply only necessary brands.
                        </p>
                        <div className="relative max-w-xl">
                          <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="text"
                            readOnly
                            onClick={() => {
                              setBrandListModalMode("INCLUSION");
                              setShowBrandListModal(true);
                            }}
                            placeholder="Add brand lists"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary cursor-pointer"
                          />
                        </div>
                        {brandInclusions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {brandInclusions.map((b, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
                                {b}
                                <button type="button" onClick={() => setBrandInclusions(prev => prev.filter((_, idx) => idx !== i))}>
                                  <X className="h-3 w-3 hover:text-rose-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Brand exclusions */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block font-bold text-slate-800">Brand exclusions</label>
                        <p className="text-[11px] text-slate-500">
                          Your ads won't show on Appes that mention selected brands or related products and services. If you exclude and include the same brand, only the exclusion will work.
                        </p>
                        <div className="relative max-w-xl">
                          <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="text"
                            readOnly
                            onClick={() => {
                              setBrandListModalMode("EXCLUSION");
                              setShowBrandListModal(true);
                            }}
                            placeholder="Add brand lists"
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary cursor-pointer"
                          />
                        </div>
                        {brandExclusions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {brandExclusions.map((b, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-semibold">
                                {b}
                                <button type="button" onClick={() => setBrandExclusions(prev => prev.filter((_, idx) => idx !== i))}>
                                  <X className="h-3 w-3 hover:text-rose-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div 
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setShowBrands(true)}
                    >
                      <div className="flex items-center gap-16">
                        <div className="w-48">
                          <h3 className="font-bold text-slate-900 text-sm">Brands</h3>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {[brandInclusions.length > 0 ? `${brandInclusions.length} Inclusions` : null, brandExclusions.length > 0 ? `${brandExclusions.length} Exclusions` : null].filter(Boolean).join(", ") || "No brand settings applied"}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* (DELETED) STEP 4: KEYWORD AND ASSET GENERATION */}
          {false && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Keyword and asset generation</h1>
              </div>

              {/* Main Card */}
              {openKeywordAssetCard ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenKeywordAssetCard(false)}>
                    <h2 className="text-sm font-semibold text-slate-900">Keyword and asset generation</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">Get help creating your ad</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">BETA</span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Google AI will use your URL and the information you provide to create assets, like keywords, headlines, and descriptions for you to review. Generated content may be inaccurate or offensive, so please review and check the responses. To improve Google AI, human reviewers may read, annotate, and process the information you provide. Don't enter anything you wouldn't want reviewed or used.
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Your use is subject to Google's <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Terms of Service</a> and <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Generative AI Prohibited Use Policy</a>. Your data is handled as explained in the Google <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline font-semibold">Privacy Policy</a>.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <label className="block font-bold text-slate-800 text-sm">Where will people go when they click your ad?</label>

                      {/* Red Outline Input Card for Final URL (required)* */}
                      <div className="space-y-1">
                        <div className="p-3.5 rounded-xl border border-rose-500 bg-rose-500/5 flex items-center gap-3">
                          <Globe className="h-4 w-4 text-rose-400 shrink-0" />
                          <input
                            type="text"
                            value={aiGenFinalUrl}
                            onChange={(e) => setAiGenFinalUrl(e.target.value)}
                            placeholder="Final URL (required)*"
                            className="w-full bg-transparent text-xs text-rose-300 placeholder-rose-400/80 font-mono focus:outline-none"
                          />
                        </div>
                        {!aiGenFinalUrl.trim() && (
                          <span className="text-[11px] text-rose-400 font-semibold block pl-1">Enter a value</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenKeywordAssetCard(true)}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">Keyword and asset generation</h2>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      URL: {aiGenFinalUrl || "Not set"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Bottom Actions for Step 4 */}
              <div className="flex items-center justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep("AD_GROUP")}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  disabled={!aiGenFinalUrl.trim()}
                  onClick={() => {
                    if (aiGenFinalUrl.trim()) {
                      alert(`Generating AI keywords and assets for ${aiGenFinalUrl}...`);
                      setWizardStep("AD_GROUP");
                    }
                  }}
                  className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow ${
                    aiGenFinalUrl.trim()
                      ? "bg-primary text-slate-950 hover:bg-secondary cursor-pointer shadow-primary/20"
                      : "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-300/50"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AD GROUP */}
          {wizardStep === "AD_GROUP" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Ad group</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Ad groups help you organize your ads around a common theme. For App campaigns, your ad assets are combined into different ad formats.
                </p>
              </div>

              {/* 1. Product groups (Placeholder) */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Product groups</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                </div>
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">
                    Manage your product feed in the Product feeds setting. When you have attached a product feed to this campaign, you will be able to choose specific products or product groups.
                  </p>
                </div>
              </div>

              {/* 2. Ad assets (Simplified) */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Ad assets</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                </div>
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">
                    Provide a variety of text, images, and videos. Google AI will combine them to create ads for different formats and placements.
                  </p>
                  
                  {/* Headlines */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold">Headlines <span className="text-slate-500 font-normal ml-1">Up to 5</span></label>
                    <div className="space-y-2">
                      {headlines.map((headline, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Add headline" 
                            value={headline}
                            onChange={(e) => {
                              const newH = [...headlines];
                              newH[idx] = e.target.value;
                              setHeadlines(newH);
                            }}
                            className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary" 
                          />
                          {headlines.length > 1 && (
                            <button onClick={() => setHeadlines(headlines.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 p-2">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {headlines.length < 5 && (
                        <button onClick={() => setHeadlines([...headlines, ""])} className="text-primary hover:text-secondary text-xs font-semibold flex items-center gap-1 mt-1">
                          <Plus className="h-3 w-3" /> Add headline
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold">Descriptions <span className="text-slate-500 font-normal ml-1">Up to 5</span></label>
                    <div className="space-y-2">
                      {descriptions.map((desc, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Add description" 
                            value={desc}
                            onChange={(e) => {
                              const newD = [...descriptions];
                              newD[idx] = e.target.value;
                              setDescriptions(newD);
                            }}
                            className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary" 
                          />
                          {descriptions.length > 1 && (
                            <button onClick={() => setDescriptions(descriptions.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 p-2">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {descriptions.length < 5 && (
                        <button onClick={() => setDescriptions([...descriptions, ""])} className="text-primary hover:text-secondary text-xs font-semibold flex items-center gap-1 mt-1">
                          <Plus className="h-3 w-3" /> Add description
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Images, Videos & HTML5 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl pt-2">
                    {/* Images */}
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files).slice(0, 20);
                            setUploadedImages(files);
                            console.log("Mock ImageKit upload started for", files.length, "images");
                          }
                        }}
                      />
                      <div className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed ${uploadedImages.length > 0 ? 'border-primary bg-primary/5' : 'border-slate-300 bg-white'} hover:bg-slate-100 transition-colors pointer-events-none gap-2`}>
                        <ImageIcon className={`h-6 w-6 ${uploadedImages.length > 0 ? 'text-primary' : 'text-slate-500'}`} />
                        <span className="font-semibold text-slate-800">Images</span>
                        <span className="text-[10px] text-slate-500">{uploadedImages.length > 0 ? `${uploadedImages.length}/20 uploaded` : 'Up to 20'}</span>
                      </div>
                    </div>
                    
                    {/* Videos */}
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="video/*" 
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files).slice(0, 20);
                            setUploadedVideos(files);
                            console.log("Mock ImageKit upload started for", files.length, "videos");
                          }
                        }}
                      />
                      <div className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed ${uploadedVideos.length > 0 ? 'border-primary bg-primary/5' : 'border-slate-300 bg-white'} hover:bg-slate-100 transition-colors pointer-events-none gap-2`}>
                        <VideoIcon className={`h-6 w-6 ${uploadedVideos.length > 0 ? 'text-primary' : 'text-slate-500'}`} />
                        <span className="font-semibold text-slate-800">Videos</span>
                        <span className="text-[10px] text-slate-500">{uploadedVideos.length > 0 ? `${uploadedVideos.length}/20 uploaded` : 'Up to 20'}</span>
                      </div>
                    </div>

                    {/* HTML5 */}
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".html,.zip" 
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files).slice(0, 20);
                            setUploadedHtml5(files);
                            console.log("Mock ImageKit upload started for", files.length, "html5 files");
                          }
                        }}
                      />
                      <div className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed ${uploadedHtml5.length > 0 ? 'border-primary bg-primary/5' : 'border-slate-300 bg-white'} hover:bg-slate-100 transition-colors pointer-events-none gap-2`}>
                        <Code className={`h-6 w-6 ${uploadedHtml5.length > 0 ? 'text-primary' : 'text-slate-500'}`} />
                        <span className="font-semibold text-slate-800">HTML5</span>
                        <span className="text-[10px] text-slate-500">{uploadedHtml5.length > 0 ? `${uploadedHtml5.length}/20 uploaded` : 'Up to 20'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Promotions */}
                  <div className="pt-4 border-t border-slate-200/40">
                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setIsPromotionsOpen(!isPromotionsOpen)}
                    >
                      <h3 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">Add promotions to your ad group</h3>
                      {isPromotionsOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </div>
                    {isPromotionsOpen && (
                      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-500 font-semibold">Add new promotion</label>
                            <select value={promotionEvent} onChange={(e) => setPromotionEvent(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary">
                              {["None", "Back to school", "Black Friday", "Boxing Day", "Carnival", "Chinese New Year", "Christmas", "Cyber Monday", "Diwali", "Easter", "Eid al-Adha", "Eid al-Fitr", "End of Season", "Epiphany", "Fall Sale", "Father's Day", "Halloween", "Hanukkah", "Holi", "Independence Day", "Labor Day", "Mother's Day", "National Day", "Navratri", "New Year's", "Parent's Day", "Passover", "Ramadan", "Rosh Hashanah", "Singles Day", "Spring Sale", "St. Nicholas Day", "Summer Sale", "Valentine's Day", "Winter Sale", "Women's Day"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-500 font-semibold">Language</label>
                            <select value={promotionLanguage} onChange={(e) => setPromotionLanguage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary">
                              {["Hindi", "Arabic", "Bulgarian", "Catalan", "Chinese (Hong Kong)", "Chinese (Simplified)", "Chinese (Traditional)", "Croatian", "Czech", "Danish", "Dutch", "English", "English (Australia)", "English (United Kingdom)", "Estonian", "Filipino", "Finnish", "French", "German", "Greek", "Hebrew", "Hungarian", "Indonesian", "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Malay", "Norwegian", "Polish", "Portuguese (Brazil)", "Portuguese (Portugal)", "Romanian", "Russian", "Serbian", "Slovak", "Slovenian", "Spanish (Latin America)", "Spanish (Spain)", "Swedish", "Thai", "Turkish", "Ukrainian", "Vietnamese"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-500 font-semibold">Currency</label>
                            <select value={promotionCurrency} onChange={(e) => setPromotionCurrency(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary">
                              {["INR", "AED", "ARS", "AUD", "BGN", "BND", "BOB", "BRL", "CAD", "CHF", "CLP", "CNY", "COP", "CZK", "DKK", "EGP", "EUR", "FJD", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "JPY", "KES", "KRW", "MAD", "MXN", "MYR", "NOK", "NZD", "PEN", "PHP", "PKR", "PLN", "RON", "RSD", "RUB", "SAR", "SEK", "SGD", "THB", "TRY", "TWD", "UAH", "USD", "VND", "ZAR"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-500 font-semibold">Promotion type</label>
                            <div className="flex items-center gap-2">
                              <select value={promotionType} onChange={(e) => setPromotionType(e.target.value)} className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary">
                                {["Monetary discount", "Percent discount", "Up to monetary discount", "Up to percent discount"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              <input type="text" placeholder="Amount" value={promotionTypeAmount} onChange={(e) => setPromotionTypeAmount(e.target.value)} className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">Item</label>
                          <input type="text" value={promotionItem} onChange={(e) => setPromotionItem(e.target.value)} className="w-full max-w-xl bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary" />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">Final URL</label>
                          <input type="text" value={promotionFinalUrl} onChange={(e) => setPromotionFinalUrl(e.target.value)} className="w-full max-w-xl bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary" />
                          <p className="text-[10px] text-slate-500 pt-1 leading-relaxed max-w-xl">
                            The final URL is the URL that people reach after clicking your ad. It should match what your ad promotes. If you use a cross-domain redirect, enter it in a tracking template. This field will not apply to App Campaigns (pre-populated with your Play Store or App Store link). If you plan to use it with other campaigns, replace it with a final URL.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">Promotion details</label>
                          <div className="flex items-center gap-2 max-w-xl">
                            <select value={promotionDetailsType} onChange={(e) => setPromotionDetailsType(e.target.value)} className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary">
                              {["None", "On orders over", "Promo code"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {promotionDetailsType !== "None" && (
                              <input type="text" placeholder={promotionDetailsType === "Promo code" ? "Code" : "Amount"} value={promotionDetailsAmount} onChange={(e) => setPromotionDetailsAmount(e.target.value)} className="w-1/2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <label className="block text-[11px] text-slate-500 font-semibold">Displayed promotion dates</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                            <div className="space-y-2">
                              <span className="text-[10px] text-slate-500">Start date</span>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"><input type="radio" checked={promotionStartDateOption === "NONE"} onChange={() => { setPromotionStartDateOption("NONE"); setPromotionStartDate(""); }} className="text-primary focus:ring-primary h-3.5 w-3.5" /> None</label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"><input type="radio" checked={promotionStartDateOption === "SELECT"} onChange={() => setPromotionStartDateOption("SELECT")} className="text-primary focus:ring-primary h-3.5 w-3.5" /> Select a date</label>
                              </div>
                              {promotionStartDateOption === "SELECT" && <input type="date" value={promotionStartDate} onChange={(e) => setPromotionStartDate(e.target.value)} onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer" />}
                            </div>
                            <div className="space-y-2">
                              <span className="text-[10px] text-slate-500">End date</span>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"><input type="radio" checked={promotionEndDateOption === "NONE"} onChange={() => { setPromotionEndDateOption("NONE"); setPromotionEndDate(""); }} className="text-primary focus:ring-primary h-3.5 w-3.5" /> None</label>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"><input type="radio" checked={promotionEndDateOption === "SELECT"} onChange={() => setPromotionEndDateOption("SELECT")} className="text-primary focus:ring-primary h-3.5 w-3.5" /> Select a date</label>
                              </div>
                              {promotionEndDateOption === "SELECT" && <input type="date" value={promotionEndDate} min={promotionStartDate || undefined} onChange={(e) => setPromotionEndDate(e.target.value)} onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* URL Options */}
                  <div className="pt-4 border-t border-slate-200/40">
                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setIsUrlOptionsOpen(!isUrlOptionsOpen)}
                    >
                      <h3 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">URL options</h3>
                      {isUrlOptionsOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </div>
                    {isUrlOptionsOpen && (
                      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4 max-w-xl">
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">Tracking template</label>
                          <input type="text" placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5" value={adGroupTrackingTemplate} onChange={(e) => setAdGroupTrackingTemplate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">Final URL suffix</label>
                          <input type="text" placeholder="Example: param1=value1&param2=value2" value={adGroupFinalUrlSuffix} onChange={(e) => setAdGroupFinalUrlSuffix(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="block text-[11px] text-slate-500 font-semibold">Custom parameters</label>
                          {adGroupCustomParams.map((param, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-slate-500 font-mono">{`{_`}</span>
                              <input type="text" placeholder="Name" value={param.name} onChange={(e) => { const updated = [...adGroupCustomParams]; updated[idx].name = e.target.value; setAdGroupCustomParams(updated); }} className="w-1/3 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary" />
                              <span className="text-slate-500 font-mono">{`}`} =</span>
                              <input type="text" placeholder="Value" value={param.value} onChange={(e) => { const updated = [...adGroupCustomParams]; updated[idx].value = e.target.value; setAdGroupCustomParams(updated); }} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary" />
                              {adGroupCustomParams.length > 1 && (
                                <button onClick={() => setAdGroupCustomParams(adGroupCustomParams.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 p-1">
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => setAdGroupCustomParams([...adGroupCustomParams, {name: "", value: ""}])} className="text-primary hover:text-secondary text-xs font-semibold flex items-center gap-1 mt-1">
                            <Plus className="h-3 w-3" /> Add custom parameter
                          </button>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-4">
                          <input type="checkbox" checked={differentMobileUrl} onChange={(e) => setDifferentMobileUrl(e.target.checked)} className="rounded text-primary h-4 w-4" />
                          <span className="font-semibold text-slate-800 text-xs">Use a different final URL for mobile</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Advanced Options */}
                  <div className="pt-4 border-t border-slate-200/40">
                    <div 
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
                    >
                      <h3 className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">Advanced options</h3>
                      {isAdvancedOptionsOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </div>
                    {isAdvancedOptionsOpen && (
                      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4 max-w-xl text-xs">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-800">Asset scheduling</h4>
                          <p className="text-[11px] text-slate-500">Select when your assets will be eligible to show</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[11px] text-slate-500 font-semibold block">Start date</span>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer text-slate-700"><input type="radio" checked={assetScheduleStartDateOption === "NONE"} onChange={() => { setAssetScheduleStartDateOption("NONE"); setAssetScheduleStartDate(""); }} className="text-primary focus:ring-primary h-3.5 w-3.5" /> None</label>
                              <label className="flex items-center gap-2 cursor-pointer text-slate-700"><input type="radio" checked={assetScheduleStartDateOption === "SELECT"} onChange={() => setAssetScheduleStartDateOption("SELECT")} className="text-primary focus:ring-primary h-3.5 w-3.5" /> Select a date</label>
                            </div>
                            {assetScheduleStartDateOption === "SELECT" && <input type="date" value={assetScheduleStartDate} onChange={(e) => setAssetScheduleStartDate(e.target.value)} onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer mt-2" />}
                          </div>
                          <div className="space-y-2">
                            <span className="text-[11px] text-slate-500 font-semibold block">End date</span>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer text-slate-700"><input type="radio" checked={assetScheduleEndDateOption === "NONE"} onChange={() => { setAssetScheduleEndDateOption("NONE"); setAssetScheduleEndDate(""); }} className="text-primary focus:ring-primary h-3.5 w-3.5" /> None</label>
                              <label className="flex items-center gap-2 cursor-pointer text-slate-700"><input type="radio" checked={assetScheduleEndDateOption === "SELECT"} onChange={() => setAssetScheduleEndDateOption("SELECT")} className="text-primary focus:ring-primary h-3.5 w-3.5" /> Select a date</label>
                            </div>
                            {assetScheduleEndDateOption === "SELECT" && <input type="date" value={assetScheduleEndDate} min={assetScheduleStartDate || undefined} onChange={(e) => setAssetScheduleEndDate(e.target.value)} onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary cursor-pointer mt-2" />}
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <label className="block text-[11px] text-slate-500 font-semibold">Days and hours</label>
                          <select value={assetScheduleDays} onChange={(e) => setAssetScheduleDays(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary">
                            {["All days", "Mondays - Fridays", "Saturdays - Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more</a><br/>
                            <span className="mt-1 block">Based on account time zone: (GMT+05:30) India Standard Time</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Audience signal */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">Audience signal</h2>
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                </div>
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">
                    Add audience signals to help Google AI find people most likely to engage with your app.
                  </p>
                  <button className="flex items-center justify-between w-full max-w-xl p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-600 transition-colors cursor-pointer">
                    <span className="font-semibold text-slate-800">Create an audience signal</span>
                    <Plus className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              </div>
              
              {/* Navigation Actions */}
              <div className="flex items-center justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep("CAMPAIGN_SETTINGS")}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep("BIDDING_BUDGET")}
                  className="px-6 py-2.5 rounded-xl font-bold bg-primary text-slate-950 hover:bg-secondary cursor-pointer shadow-md shadow-primary/20 transition-all flex items-center gap-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BIDDING AND BUDGET (Part 1 - Bidding) */}
          {wizardStep === "BIDDING_BUDGET" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Bidding</h1>

              {/* Card 1: Bidding Focus */}
              {openBiddingSetting === "bidding" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBiddingSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Bidding</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-semibold">What do you want to focus on?</label>
                      <select
                        value={biddingFocus}
                        onChange={(e) => setBiddingFocus(e.target.value as any)}
                        className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
                      >
                        <optgroup label="Recommended">
                          <option value="Conversions">Maximize conversions</option>
                          <option value="Target CPA">Target CPA</option>
                          <option value="Conversion value">Maximize conversion value</option>
                          <option value="Target ROAS">Target ROAS</option>
                        </optgroup>
                        <optgroup label="Other optimization options">
                          <option value="Clicks">Clicks</option>
                          <option value="Impression share">Impression share</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* i) Conversions */}
                    {biddingFocus === "Conversions" && (
                      <div className="pt-2 animate-in fade-in duration-150 max-w-md text-slate-500">
                        <span>No additional settings required for Maximize conversions.</span>
                      </div>
                    )}

                    {/* ii) Target CPA */}
                    {biddingFocus === "Target CPA" && (
                      <div className="pt-2 space-y-2 animate-in fade-in duration-150 max-w-md">
                        <label className="block text-slate-700 font-semibold">Target CPA</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                          <input
                            type="number"
                            value={targetCpaValue}
                            onChange={(e) => setTargetCpaValue(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                          Alternative bid strategies like portfolios are available in settings after you create your campaign
                        </p>
                      </div>
                    )}

                    {/* iii) Conversion value */}
                    {biddingFocus === "Conversion value" && (
                      <div className="pt-2 animate-in fade-in duration-150 max-w-md text-slate-500">
                        <span>No additional settings required for Maximize conversion value.</span>
                      </div>
                    )}

                    {/* iv) Target ROAS */}
                    {biddingFocus === "Target ROAS" && (
                      <div className="pt-2 space-y-2 animate-in fade-in duration-150 max-w-md">
                        <label className="block text-slate-700 font-semibold">Target ROAS</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={targetRoasValue}
                            onChange={(e) => setTargetRoasValue(e.target.value)}
                            placeholder="200"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                        </div>
                        <p className="text-[10px] text-amber-500 mt-1 leading-relaxed font-semibold">
                          Before opting into target ROAS, wait until the account that set up conversion tracking has received at least 15 conversions in the last 30 days.
                        </p>
                        <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                          Alternative bid strategies like portfolios are available in settings after you create your campaign
                        </p>
                      </div>
                    )}

                    {/* v) Clicks */}
                    {biddingFocus === "Clicks" && (
                      <div className="pt-2 space-y-3 animate-in fade-in duration-150 max-w-md">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setMaxCpc}
                            onChange={(e) => setSetMaxCpc(e.target.checked)}
                            className="mt-0.5 rounded text-primary h-4 w-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">Set a maximum cost per click bid limit</span>
                        </label>
                        
                        {setMaxCpc && (
                          <div className="space-y-1 ml-6 animate-in slide-in-from-left-2 duration-150">
                            <label className="block text-[11px] text-slate-500">Maximum CPC bid limit</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                              <input
                                type="number"
                                value={maxCpcLimit}
                                onChange={(e) => setMaxCpcLimit(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        )}
                        
                        <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                          Alternative bid strategies like portfolios are available in settings after you create your campaign
                        </p>
                      </div>
                    )}

                    {/* vi) Impression share */}
                    {biddingFocus === "Impression share" && (
                      <div className="pt-2 space-y-3 animate-in fade-in duration-150 max-w-md">
                        <div className="space-y-1">
                          <label className="block text-slate-700 font-semibold">Where do you want your ads to appear</label>
                          <select
                            value={impressionShareLocation}
                            onChange={(e) => setImpressionShareLocation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                          >
                            <option value="Anywhere on results page">Anywhere on results page</option>
                            <option value="Top of results page">Top of results page</option>
                            <option value="Absolute top of results page">Absolute top of results page</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500">Percent (%) impression share to target</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={targetImpressionSharePercent}
                              onChange={(e) => setTargetImpressionSharePercent(e.target.value)}
                              placeholder="10"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-8 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500">Maximum CPC bid limit</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                            <input
                              type="number"
                              value={maxCpcImpressionShare}
                              onChange={(e) => setMaxCpcImpressionShare(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-slate-200">
                          <strong>Tip:</strong> Bid more efficiently with Maximize clicks: Get more clicks with a fully automated bid strategy.
                        </p>
                      </div>
                    )}


                    {/* Portfolio Strategy Disclaimer Notice */}
                    <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      Alternative bid strategies like portfolios are available in settings after you create your campaign
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenBiddingSetting("bidding")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">Bidding</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Focus: {biddingFocus}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Card 2: Customer Acquisition */}
              {openBiddingSetting === "acquisition" ? (
                <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 cursor-pointer" onClick={() => setOpenBiddingSetting(null)}>
                    <h2 className="text-base font-semibold text-slate-900">Customer acquisition</h2>
                    <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyBidNewCustomers}
                        onChange={(e) => setOnlyBidNewCustomers(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-50 border-slate-300 text-primary h-4 w-4"
                      />
                      <div className="space-y-1">
                        <span className="text-slate-800 font-semibold block">Only bid for new customers</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">
                          Your campaign will be limited to only new customers, regardless of your bid strategy
                        </span>
                      </div>
                    </label>

                    <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                      By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers. <a href="#" onClick={e => e.preventDefault()} className="text-primary hover:underline font-semibold">Learn more about customer acquisition</a>
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors shadow-lg animate-in fade-in duration-200"
                  onClick={() => setOpenBiddingSetting("acquisition")}
                >
                  <div className="flex items-center gap-16">
                    <div className="w-48">
                      <h2 className="text-sm font-semibold text-slate-800">Customer acquisition</h2>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {onlyBidNewCustomers ? "Only bid for new customers" : "Bid equally for new and existing customers"}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              )}
              
              <hr className="border-slate-200 my-8" />

              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Budget</h1>
                <p className="text-xs text-slate-500">Decide how much you want to spend.</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Main Controls Column (8 Cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Blue Info Notice Banner */}
                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-start gap-3 text-blue-300">
                      <HelpCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed">
                        Your budget type (daily or campaign total) can&apos;t be changed once this campaign has started. You can change your budget amount at any time.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <span className="font-bold text-slate-900 text-xs block">Select budget type</span>

                      {/* Option 1: Average daily budget */}
                      <label
                        onClick={() => setBudgetType("DAILY")}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          budgetType === "DAILY" ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budgetTypeRadio"
                          checked={budgetType === "DAILY"}
                          onChange={() => setBudgetType("DAILY")}
                          className="mt-1 text-primary h-4 w-4"
                        />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block">Average daily budget</span>
                          <span className="text-slate-500 block text-[11px]">Set your average daily budget for this campaign</span>
                          {budgetType === "DAILY" && (
                            <div className="pt-2">
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue || selectedPresetBudget}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder="Enter daily amount"
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Option 2: Campaign total budget */}
                      <label
                        onClick={() => setBudgetType("TOTAL")}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          budgetType === "TOTAL" ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budgetTypeRadio"
                          checked={budgetType === "TOTAL"}
                          onChange={() => setBudgetType("TOTAL")}
                          className="mt-1 text-primary h-4 w-4"
                        />
                        <div className="space-y-1 flex-1">
                          <span className="font-bold text-slate-900 block">Campaign total budget</span>
                          <span className="text-slate-500 block text-[11px]">Set a budget for the duration of your campaign</span>
                          
                          {budgetType === "TOTAL" && (
                            <div className="pt-2 space-y-4">
                              <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                                <input
                                  type="text"
                                  value={customBudgetValue}
                                  onChange={(e) => setCustomBudgetValue(e.target.value)}
                                  placeholder=""
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                                />
                              </div>

                              {/* Start Date & End Date Info Card */}
                              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                                <div className="space-y-1 text-xs">
                                  <p className="text-slate-800">
                                    <span className="text-slate-500 font-semibold">Start date:</span> August 11, 2026
                                  </p>
                                  <p className="text-slate-800">
                                    <span className="text-slate-500 font-semibold">End date:</span> None
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => alert("Editing Campaign Dates...")}
                                  className="text-blue-400 font-bold hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                  </div>

                  {/* Right Help Column (4 Cols) */}
                  <div className="lg:col-span-4 border-l border-slate-200 pl-6 space-y-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your campaign total budget is what the campaign should spend over its runtime. To use a campaign total budget, you must add an end date for your campaign.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {wizardStep === "SUMMARY" && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Your campaign is almost ready to publish</h1>
              </div>

              {/* 1. Issues Section */}
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-800 text-xs">Issues</h3>
                  <p className="text-[11px] text-slate-500">Fix these issues to run your campaign</p>
                </div>

                <div className="space-y-2">
                  {/* Issue 1: Create an ad */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Create an ad:</strong> Get your ads running by adding ads to your ad group
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("AD_GROUP")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 2: Add keywords */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Add keywords:</strong> Get your ads running by adding keywords to your ad group
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("AD_GROUP")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 3: Add a budget */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Add a budget:</strong> To publish your campaign, enter a budget
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("BIDDING_BUDGET")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>

                  {/* Issue 4: Budget value required */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-rose-400 shrink-0" />
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-bold">Budget:</strong> Value is required
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWizardStep("BIDDING_BUDGET")}
                      className="text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Recommendations Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">Recommendations</h3>
                    <p className="text-[11px] text-slate-500">Apply these recommendations to optimize campaign performance</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                    <ChevronLeft className="h-4 w-4 cursor-pointer hover:text-slate-900" />
                    <span>1 / 3</span>
                    <ChevronRight className="h-4 w-4 cursor-pointer hover:text-slate-900" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                    <p className="text-slate-800">
                      <strong className="text-slate-900 font-bold">Add sitelinks:</strong> Draw more attention to your ads by adding at least 4 sitelinks. <HelpCircle className="inline h-3 w-3 text-slate-500" />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal("SITELINKS")}
                    className="text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* 3. Overview Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Overview</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Campaign name</span>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="flex-1 max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Campaign type</span>
                    <span className="flex-1 text-slate-900 font-semibold">App</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Objective</span>
                    <span className="flex-1 text-slate-900 font-semibold">app-promotion</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Goal</span>
                    <span className="flex-1 text-slate-900 font-semibold">Downloads, Phone call leads</span>
                  </div>
                </div>
              </div>

              {/* 4. Bidding Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Bidding</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Bidding focus</span>
                    <span className="flex-1 text-slate-900 font-semibold">{biddingFocus}</span>
                  </div>
                </div>
              </div>

              {/* 5. Campaign Settings Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Campaign settings</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Mobile app</span>
                    <span className="flex-1 text-slate-900 font-semibold">{selectedMobileApp?.name || "None selected"}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Locations</span>
                    <span className="flex-1 text-slate-900 font-semibold">All countries and territories</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Languages</span>
                    <span className="flex-1 text-slate-900 font-semibold">English</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Data feed</span>
                    <span className="flex-1 text-slate-900 font-semibold">None</span>
                  </div>
                </div>
              </div>

              {/* 6. Ad Group Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Ad group</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-800">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Ad group name</span>
                    <span className="flex-1 text-slate-900 font-semibold">{adGroupName || "Ad group 1"}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Product groups</span>
                    <span className="flex-1 text-slate-900 font-semibold">None selected</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Ad assets</span>
                    <span className="flex-1 text-slate-900 font-semibold">Pending</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-slate-500 w-48 font-medium">Audience signal</span>
                    <span className="flex-1 text-slate-900 font-semibold">None added</span>
                  </div>
                </div>
              </div>

              {/* 8. Budget Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-800 text-xs">Budget</h3>
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden p-4 flex items-center justify-between">
                  <span className="text-slate-500 w-48 font-medium">Budget</span>
                  <div className="flex-1 space-y-1">
                    <span className="text-slate-900 font-bold">Campaign total: ₹0.00</span>
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                      Value is required
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ── Fixed Footer Action Bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-50">
        <button
          onClick={() => {
            if (wizardStep === "SUMMARY") setWizardStep("BIDDING_BUDGET");
            else if (wizardStep === "BIDDING_BUDGET") setWizardStep("AD_GROUP");
            else if (wizardStep === "AD_GROUP") setWizardStep("CAMPAIGN_SETTINGS");
            else router.push(`/ads/campaigns/create${customerId ? `?customerId=${customerId}` : ""}`);
          }}
          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
        >
          {wizardStep === "CAMPAIGN_SETTINGS" ? "Cancel" : "Back"}
        </button>

        <div className="flex items-center gap-3">
          {wizardStep !== "SUMMARY" ? (
            <button
              onClick={() => {
                if (wizardStep === "CAMPAIGN_SETTINGS") setWizardStep("AD_GROUP");
                else if (wizardStep === "AD_GROUP") setWizardStep("BIDDING_BUDGET");
                else if (wizardStep === "BIDDING_BUDGET") setWizardStep("SUMMARY");
              }}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-slate-950 hover:bg-secondary flex items-center gap-2 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={async () => {
                alert(`App campaign "${adGroupName}" published successfully!`);
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

      {/* ── New Segment Modal ── */}
      {showNewSegmentModal && (
        <div className="fixed inset-0 z-[100] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Top Bar */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setShowNewSegmentModal(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">New segment</h2>
          </div>

          {/* Modal Body Content */}
          {customerListStep === "SELECT_TYPE" ? (
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
              {/* Top Group: Available segment types */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                  <span>Available segment types</span>
                  <HelpCircle className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1) Customer list */}
                  <div
                    onClick={() => setSelectedNewSegmentType("CUSTOMER_LIST")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      selectedNewSegmentType === "CUSTOMER_LIST"
                        ? "bg-primary/10 border-primary ring-2 ring-primary/50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewSegmentType === "CUSTOMER_LIST" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Customer list</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">List of customer data that you've collected</p>
                    </div>
                  </div>

                  {/* 2) Lead form segment */}
                  <div
                    onClick={() => setSelectedNewSegmentType("LEAD_FORM")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      selectedNewSegmentType === "LEAD_FORM"
                        ? "bg-primary/10 border-primary ring-2 ring-primary/50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewSegmentType === "LEAD_FORM" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <FileText className="h-6 w-6 text-slate-500" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Lead form segment</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">People who have submitted your lead form</p>
                    </div>
                  </div>

                  {/* 3) YouTube users */}
                  <div
                    onClick={() => setSelectedNewSegmentType("YOUTUBE")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      selectedNewSegmentType === "YOUTUBE"
                        ? "bg-primary/10 border-primary ring-2 ring-primary/50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewSegmentType === "YOUTUBE" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <VideoIcon className="h-6 w-6 text-slate-500" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">YouTube users</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">People who interacted with your YouTube channel or videos</p>
                    </div>
                  </div>

                  {/* 4) Google Analytics 4 segment */}
                  <div
                    onClick={() => setSelectedNewSegmentType("GA4")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      selectedNewSegmentType === "GA4"
                        ? "bg-primary/10 border-primary ring-2 ring-primary/50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewSegmentType === "GA4" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <SlidersHorizontal className="h-6 w-6 text-slate-500" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Google Analytics 4 segment</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Create Web/App segment using Google Analytics audience builder</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Group: Audience Manager segment types */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <p className="text-slate-500 text-xs">
                  Create other segment types in <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 font-semibold hover:underline">Audience manager</a>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 5) App users */}
                  <div
                    onClick={() => setSelectedNewSegmentType("APP_USERS")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      selectedNewSegmentType === "APP_USERS"
                        ? "bg-primary/10 border-primary ring-2 ring-primary/50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewSegmentType === "APP_USERS" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <Smartphone className="h-6 w-6 text-slate-500" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">App users</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">People who've downloaded your mobile app</p>
                    </div>
                  </div>

                  {/* 6) Website visitors */}
                  <div
                    onClick={() => setSelectedNewSegmentType("WEBSITE_VISITORS")}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                      selectedNewSegmentType === "WEBSITE_VISITORS"
                        ? "bg-primary/10 border-primary ring-2 ring-primary/50"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewSegmentType === "WEBSITE_VISITORS" && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <Globe className="h-6 w-6 text-slate-500" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Website visitors</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">People who visited your website or landing pages</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : customerListStep === "CUSTOMER_LIST_DETAILS" ? (
            /* CUSTOMER LIST SETUP DETAILS SCREEN */
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Segment type</span>
                  <span className="font-bold text-slate-900 text-sm">Customer list</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerListStep("SELECT_TYPE")}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Card 1: Choose a data source */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Choose a data source</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Help your business gain more insights about customers or improve measurement</p>
                </div>

                <div className="space-y-4">
                  {/* Option 1: Connect a new product */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="custDataSrc"
                        checked={customerDataSourceOption === "CONNECT_PRODUCT"}
                        onChange={() => setCustomerDataSourceOption("CONNECT_PRODUCT")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Connect a new product</span>
                        <span className="text-[11px] text-slate-500 block">Choose from products available for connections</span>
                      </div>
                    </label>

                    {customerDataSourceOption === "CONNECT_PRODUCT" && (
                      <div className="ml-7 space-y-4 pt-1 animate-in fade-in duration-200">
                        <div className="relative max-w-md">
                          <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="App products or data sources"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="font-semibold text-slate-700 text-[11px] block">Featured products</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              "Shopify", "HubSpot", "Zoho CRM", "ActiveCampaign",
                              "Klaviyo", "Salesforce", "Google Sheets", "Google Drive",
                              "HTTPS", "SFTP", "Google BigQuery", "MySQL",
                              "Amazon S3", "Snowflake", "Google Cloud Storage", "Oracle",
                              "Amazon Redshift", "PostgreSQL"
                            ].map((prod, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedDataSourceProduct(prod)}
                                className={`p-3 rounded-xl border flex items-center justify-between text-left font-semibold text-xs transition-all cursor-pointer ${
                                  selectedDataSourceProduct === prod
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                                }`}
                              >
                                <span className="truncate">{prod}</span>
                                {selectedDataSourceProduct === prod && <Check className="h-3.5 w-3.5 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Upload a file manually */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                    <input
                      type="radio"
                      name="custDataSrc"
                      checked={customerDataSourceOption === "UPLOAD_FILE"}
                      onChange={() => setCustomerDataSourceOption("UPLOAD_FILE")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Upload a file manually</span>
                      <span className="text-[11px] text-slate-500 block">Create an audience segment by manually uploading a customer list</span>
                    </div>
                  </label>

                  {/* Option 3: Skip this step */}
                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                    <input
                      type="radio"
                      name="custDataSrc"
                      checked={customerDataSourceOption === "SKIP"}
                      onChange={() => setCustomerDataSourceOption("SKIP")}
                      className="mt-0.5 text-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Skip this step and set up a data source later</span>
                      <span className="text-[11px] text-slate-500 block">Create an audience segment to connect to a data source later in the segment details or in Tools &gt; Data manager</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card 2: Customer data Compliance */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm">Customer data</h3>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customerMatchComplianceChecked}
                    onChange={(e) => setCustomerMatchComplianceChecked(e.target.checked)}
                    className="mt-0.5 rounded text-primary h-4 w-4"
                  />
                  <span className="text-slate-800 font-semibold leading-relaxed">
                    This data was collected and is being shared with Google in compliance with <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Google's Customer Match policies</a>
                  </span>
                </label>

                <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                  <p>In particular, you confirm that your privacy policy discloses that you share customer data with third parties to perform services on your behalf, and that you obtain consent for such sharing where required by law or any applicable Google policies governing personalized ads and/or user consent including Google's <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">EU user consent policy</a>.</p>
                  <p>The data files you upload will only be used to match your customers to Google accounts and to ensure your Customer Match campaigns comply with our policies. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more</a></p>
                  <p>To comply with the General Data Protection Regulation (GDPR), we've included the <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Google Ads Data Processing Terms</a> that apply to Customer Match in the Google Ads terms of service. Under these terms, Google acts as a "processor" of the personal data you may share with us for Customer Match. In your <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Account settings</a>, confirm that the contact information for you (the primary contact) and your data protection officer and/or EU representative (if applicable) are up-to-date.</p>
                </div>
              </div>
            </div>
          ) : customerListStep === "LEAD_FORM_DETAILS" ? (
            /* LEAD FORM SEGMENT SETUP DETAILS SCREEN */
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Segment type</span>
                  <span className="font-bold text-slate-900 text-sm">Lead form segment</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerListStep("SELECT_TYPE")}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Segment name Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
                <label className="block font-semibold text-slate-800">Segment name</label>
                <input
                  type="text"
                  value={leadFormSegmentName}
                  onChange={(e) => setLeadFormSegmentName(e.target.value)}
                  placeholder="Audience segment name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Customer type Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <span>Add customer types (optional)</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Customer type helps you define customer groups that you can use for new customer acquisitions and other goals. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more about Customer types</a>
                </p>

                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2">
                  {selectedCustomerTypes.map((type, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-300 text-xs text-slate-800 font-semibold">
                      {type}
                      <button type="button" onClick={() => setSelectedCustomerTypes(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="h-3 w-3 text-slate-500 hover:text-rose-400" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Select customer type"
                    className="bg-transparent text-xs text-slate-900 focus:outline-none flex-1 min-w-[140px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        setSelectedCustomerTypes(prev => [...prev, e.currentTarget.value.trim()]);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Lead forms Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm">Lead forms</h3>
                <p className="text-[11px] text-slate-500">Select lead forms</p>

                <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 min-h-[220px]">
                    <div className="p-3 space-y-3">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="App"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 p-2">No lead form</p>
                    </div>

                    <div className="p-3">
                      <span className="text-slate-500 font-semibold block">None selected</span>
                    </div>
                  </div>
                </div>

                {/* Info Notice Box */}
                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] flex items-start gap-2.5 leading-relaxed">
                  <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    Customer lists can only be used on the "Observation" setting without bid adjustments, and for exclusions. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 font-bold hover:underline">Learn more</a>
                  </div>
                </div>

                {/* Compliance Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={customerMatchComplianceChecked}
                    onChange={(e) => setCustomerMatchComplianceChecked(e.target.checked)}
                    className="mt-0.5 rounded text-primary h-4 w-4"
                  />
                  <span className="text-slate-800 font-semibold leading-relaxed">
                    This data was collected and is being shared with Google in compliance with <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Google's Customer Match policies</a>
                  </span>
                </label>

                <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
                  <p>The lead forms that you use will only be used to match your customers to Google accounts and to ensure your Customer Match campaigns comply with our policies. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more</a></p>
                  <p>To comply with the General Data Protection Regulation (GDPR), we've included the <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Google Ads Data Processing Terms</a> that apply to Customer Match in the Google Ads terms of service. Under these terms, Google acts as a "processor" of the personal data you may share with us for Customer Match. In your <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Account Preferences</a>, confirm that the contact information for you (the primary contact) and your data protection officer and/or EU representative (if applicable) are up-to-date. Any notices under the Google Ads Data Processing Terms will be sent to the primary contact.</p>
                </div>
              </div>

              {/* Submission dates Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-slate-800">Submission dates</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Include lead form submissions from the past {submissionDays} days</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 cursor-pointer" />
              </div>
            </div>
          ) : customerListStep === "YOUTUBE_DETAILS" ? (
            /* YOUTUBE USERS SEGMENT SETUP DETAILS SCREEN */
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Segment type</span>
                  <span className="font-bold text-slate-900 text-sm">YouTube users</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerListStep("SELECT_TYPE")}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Segment name Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
                <label className="block font-semibold text-slate-800">Segment name</label>
                <input
                  type="text"
                  value={youtubeSegmentName}
                  onChange={(e) => setYoutubeSegmentName(e.target.value)}
                  placeholder="Audience segment name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Customer type Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <span>Customer type</span>
                  <span className="text-slate-500 text-[11px] font-normal">Add customer types (optional)</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Customer type helps you define customer groups that you can use for new customer acquisitions and other goals. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more about Customer types</a>
                </p>
                <input
                  type="text"
                  placeholder="Select customer type"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                />
              </div>

              {/* YouTube channel or video Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">YouTube channel or video</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Select the YouTube channel or video made by a YouTube creator of this audience segment</p>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ytMode"
                      checked={youtubeSelectionMode === "CHANNEL"}
                      onChange={() => setYoutubeSelectionMode("CHANNEL")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-800 font-semibold">Select a channel</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ytMode"
                      checked={youtubeSelectionMode === "CREATOR_VIDEO"}
                      onChange={() => setYoutubeSelectionMode("CREATOR_VIDEO")}
                      className="text-primary h-4 w-4"
                    />
                    <span className="text-slate-800 font-semibold">Select a video made by a YouTube creator</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">NEW</span>
                  </label>
                </div>

                {/* Actions Box */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 block mb-2">Actions</span>
                  <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300 text-[11px] flex items-center gap-2.5">
                    <Info className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>To create a YouTube user segment, you'll need to select a YouTube channel or video.</span>
                  </div>
                </div>
              </div>

              {/* Pre-fill options Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Pre-fill options</h3>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                  <div className="md:col-span-2 space-y-3">
                    <p className="text-[11px] text-slate-500">Choose between pre-filling the segment or starting with an empty one</p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="ytPrefill"
                        checked={youtubePrefillOption === "PREFILL"}
                        onChange={() => setYoutubePrefillOption("PREFILL")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <span className="text-slate-800 font-semibold">Pre-fill segment with people who matched the rules within the past 30 days</span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="ytPrefill"
                        checked={youtubePrefillOption === "EMPTY"}
                        onChange={() => setYoutubePrefillOption("EMPTY")}
                        className="mt-0.5 text-primary h-4 w-4"
                      />
                      <span className="text-slate-800 font-semibold">Start with an empty segment</span>
                    </label>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-500 leading-relaxed self-start">
                    Google Ads can pre-fill your segment with people who have interacted with your business in the previous 30 days, or you can start with an empty segment.
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Description</h3>
                  <ChevronUp className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
                <p className="text-[11px] text-slate-500">Enter details about this segment</p>
                <textarea
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  placeholder="Add a segment description (optional)"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Policy Disclaimer */}
              <p className="text-[11px] text-slate-500 pt-2">
                Your data segments must comply with the <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Personalized advertising policy</a> and the <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Google EU user consent policy</a>.
              </p>
            </div>
          ) : customerListStep === "GA4_DETAILS" ? (
            /* GA4 SEGMENT DETAILS SCREEN */
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Segment type</span>
                  <span className="font-bold text-slate-900 text-sm">Google Analytics 4 segment</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerListStep("SELECT_TYPE")}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Card 1: Select a Google Analytics property */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Select a Google Analytics property</h3>
                  <button
                    type="button"
                    onClick={() => setCustomerListStep("GA4_LINK_PROPERTY")}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs cursor-pointer transition-all shadow"
                  >
                    Link new property
                  </button>
                </div>

                <div className="relative max-w-md">
                  <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={ga4AppProperty}
                    onChange={(e) => setGa4AppProperty(e.target.value)}
                    placeholder="App linked Google Analytics property"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Property Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      GA4
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Jisnu Digital Solutions</span>
                      <span className="text-[11px] text-slate-500 font-mono">Property ID: 531372646</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">LINKED</span>
                </div>
              </div>
            </div>
          ) : (
            /* GA4 LINK PROPERTY STEP SCREEN */
            <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6 text-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Link a Google Analytics (GA4) property</h2>
                <p className="text-xs text-slate-500 mt-1">Link setup</p>
              </div>

              {/* Progress Steps Header */}
              <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">1</span>
                  <span className="font-medium">Select Google Analytics properties</span>
                </div>
                <span className="text-slate-600 font-bold">›</span>
                <div className="flex items-center gap-2 text-primary">
                  <span className="w-6 h-6 rounded-full bg-primary text-slate-950 flex items-center justify-center text-xs font-bold">2</span>
                  <span className="font-bold text-slate-900">Configure settings and submit</span>
                </div>
              </div>

              {/* Property Info Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                <span className="text-slate-500 text-[11px] font-semibold block">Google Analytics property to be linked</span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    GA4
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Jisnu Digital Solutions</h3>
                    <p className="text-[11px] text-slate-500 font-mono">531372646</p>
                  </div>
                </div>
              </div>

              {/* Data Sharing Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Data sharing</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Data shared from Google Analytics (GA4) to Google Ads</p>
                </div>

                {/* Setting 1: Import app and web metrics */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">Import app and web metrics</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                      Turn on to use Google Analytics app and web metrics to give you a more customer-centric measurement of how users interact with your ads. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more about using GA4 metrics in Google Ads</a>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportAppWebMetrics(prev => !prev)}
                    className={`px-3 py-1 rounded-full font-bold text-xs transition-all cursor-pointer ${
                      importAppWebMetrics ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {importAppWebMetrics ? "On" : "Off"}
                  </button>
                </div>

                {/* Setting 2: Import Google Analytics audiences */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">Import Google Analytics audiences</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                      Turn on to publish your Google Analytics audiences to the linked Google Ads account. You can change this setting anytime in Google Analytics. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more about remarketing audiences</a>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportGa4Audiences(prev => !prev)}
                    className={`px-3 py-1 rounded-full font-bold text-xs transition-all cursor-pointer ${
                      importGa4Audiences ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {importGa4Audiences ? "On" : "Off"}
                  </button>
                </div>

                {/* Important notices */}
                <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200">
                  <p><strong className="text-slate-700">Important notice:</strong> Data exported from your Analytics property into Ads is subject to the Ads terms of service, while Ads data imported into Analytics is subject to the Analytics terms of service. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">View the terms of service</a></p>
                  <p>Your GA4 property may be set to measure Google paid channels only or both paid and organic channels. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more about GA4 creditable channels</a></p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Footer Actions */}
          <div className="h-16 bg-white border-t border-slate-200 px-8 flex items-center gap-4 shrink-0">
            {customerListStep === "SELECT_TYPE" ? (
              <button
                onClick={() => {
                  if (selectedNewSegmentType === "CUSTOMER_LIST") {
                    setCustomerListStep("CUSTOMER_LIST_DETAILS");
                  } else if (selectedNewSegmentType === "LEAD_FORM") {
                    setCustomerListStep("LEAD_FORM_DETAILS");
                  } else if (selectedNewSegmentType === "YOUTUBE") {
                    setCustomerListStep("YOUTUBE_DETAILS");
                  } else if (selectedNewSegmentType === "GA4") {
                    setCustomerListStep("GA4_DETAILS");
                  } else {
                    const labelMap = {
                      CUSTOMER_LIST: "Customer list segment",
                      LEAD_FORM: "Lead form segment",
                      YOUTUBE: "YouTube users segment",
                      GA4: "GA4 segment",
                      APP_USERS: "App users segment",
                      WEBSITE_VISITORS: "Website visitors segment"
                    };
                    setSelectedAudienceSegments(prev => [...prev, labelMap[selectedNewSegmentType]]);
                    setShowNewSegmentModal(false);
                  }
                }}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  const segLabel = customerListStep === "CUSTOMER_LIST_DETAILS"
                    ? `Customer list (${selectedDataSourceProduct})`
                    : customerListStep === "LEAD_FORM_DETAILS"
                    ? leadFormSegmentName.trim() || "Lead form segment"
                    : customerListStep === "YOUTUBE_DETAILS"
                    ? youtubeSegmentName.trim() || "YouTube users segment"
                    : `GA4 Segment (${ga4SelectedProperty.split(" ")[0]})`;
                  setSelectedAudienceSegments(prev => [...prev, segLabel]);
                  setShowNewSegmentModal(false);
                  setCustomerListStep("SELECT_TYPE");
                }}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
              >
                Save & Continue
              </button>
            )}
            <button
              onClick={() => {
                setShowNewSegmentModal(false);
                setCustomerListStep("SELECT_TYPE");
              }}
              className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── New Account-Level Brand List Modal ── */}
      {showBrandListModal && (
        <div className="fixed inset-0 z-[110] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Top Bar */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setShowBrandListModal(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">New account-level brand list</h2>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            <p className="text-slate-500 text-xs">
              Brand lists let you choose whether your ads show on Appes that mention specific brands
            </p>

            {/* List name Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
              <label className="block font-bold text-slate-800">List name</label>
              <input
                type="text"
                value={brandListNameInput}
                onChange={(e) => setBrandListNameInput(e.target.value)}
                placeholder="Enter list name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Brands App & Select Grid Card */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Brands</h3>
                <p className="text-[11px] text-slate-500">Add brands to your list</p>
              </div>

              {/* App Box */}
              <div className="relative max-w-md">
                <SearchIcon className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={brandAppQuery}
                  onChange={(e) => setBrandAppQuery(e.target.value)}
                  placeholder="Enter a brand name or website URL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Selected Brands Chips */}
              {selectedBrandListBrands.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-semibold text-[11px]">
                    {selectedBrandListBrands.length} brand{selectedBrandListBrands.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrandListBrands.map((b, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
                        {b.name}
                        <button type="button" onClick={() => setSelectedBrandListBrands(prev => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3 w-3 hover:text-rose-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Scrollable Options Grid */}
              <div className="space-y-1.5 pt-2">
                <span className="text-slate-500 font-semibold text-[11px] block">Popular & Apped Brands ({presetBrandsList.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {presetBrandsList
                    .filter(b => !brandAppQuery.trim() || b.name.toLowerCase().includes(brandAppQuery.toLowerCase()) || b.url.toLowerCase().includes(brandAppQuery.toLowerCase()))
                    .map((b, idx) => {
                      const isSelected = selectedBrandListBrands.some(item => item.name === b.name);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBrandListBrands(prev => prev.filter(item => item.name !== b.name));
                            } else {
                              setSelectedBrandListBrands(prev => [...prev, b]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-xs block truncate">{b.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block truncate">{b.url}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="h-16 bg-white border-t border-slate-200 px-8 flex items-center gap-4 shrink-0">
            <button
              onClick={() => {
                const label = brandListNameInput.trim() || (selectedBrandListBrands.length > 0 ? selectedBrandListBrands.map(b => b.name).join(", ") : "Custom Brand List");
                if (brandListModalMode === "INCLUSION") {
                  setBrandInclusions(prev => [...prev, label]);
                } else {
                  setBrandExclusions(prev => [...prev, label]);
                }
                setShowBrandListModal(false);
                setBrandListNameInput("");
                setSelectedBrandListBrands([]);
              }}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowBrandListModal(false);
                setBrandListNameInput("");
                setSelectedBrandListBrands([]);
              }}
              className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Add URL Inclusions Modal Overlay ── */}
      {showUrlInclusionsModal && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Top Header Bar */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUrlInclusionsModal(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-base font-semibold text-slate-900">Add URL Inclusions</h2>
            </div>
            <button
              onClick={() => setShowUrlInclusionsModal(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Modal Main Content Container */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-800">URL inclusions</span>
                <span className="text-slate-500 text-xs">Select specific pages from your website that you want Google AI to include</span>
              </div>
            </div>

            {/* Split Card Container (Left 65% Controls, Right 35% Selection Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md min-h-[400px]">
              
              {/* Left Column Controls (8 cols) */}
              <div className="md:col-span-8 p-6 space-y-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                <div className="space-y-5">
                  
                  {/* 3 Tabs Header: URLs / Custom labels / Rules */}
                  <div className="flex items-center gap-8 border-b border-slate-200 pb-3">
                    <button
                      onClick={() => setUrlInclusionsTab("URLS")}
                      className={`font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
                        urlInclusionsTab === "URLS"
                          ? "border-blue-500 text-blue-400 font-bold"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      URLs
                    </button>
                    <button
                      onClick={() => setUrlInclusionsTab("CUSTOM_LABELS")}
                      className={`font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
                        urlInclusionsTab === "CUSTOM_LABELS"
                          ? "border-blue-500 text-blue-400 font-bold"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Custom labels
                    </button>
                    <button
                      onClick={() => setUrlInclusionsTab("RULES")}
                      className={`font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
                        urlInclusionsTab === "RULES"
                          ? "border-blue-500 text-blue-400 font-bold"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Rules
                    </button>
                  </div>

                  {/* Tab 1: URLs */}
                  {urlInclusionsTab === "URLS" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <label className="block font-bold text-slate-800">Enter URLs to include:</label>
                      <div className="space-y-1">
                        <textarea
                          rows={5}
                          value={urlInclusionsText}
                          onChange={(e) => setUrlInclusionsText(e.target.value)}
                          placeholder="Enter or paste your webpages, one URL per line"
                          className="w-full bg-slate-50 border border-rose-500/80 rounded-xl p-4 text-xs text-rose-300 placeholder-rose-400/80 font-mono focus:outline-none focus:border-rose-500"
                        />
                        {!urlInclusionsText.trim() && (
                          <span className="text-[11px] text-rose-400 font-semibold block pl-1">Please enter at least one URL.</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Custom labels */}
                  {urlInclusionsTab === "CUSTOM_LABELS" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <label className="block font-bold text-slate-800">Select custom labels from page feeds:</label>
                      <input
                        type="text"
                        value={urlInclusionsCustomLabel}
                        onChange={(e) => setUrlInclusionsCustomLabel(e.target.value)}
                        placeholder="Enter custom label name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {/* Tab 3: Rules */}
                  {urlInclusionsTab === "RULES" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <label className="block font-bold text-slate-800">Create URL rules to include:</label>
                      <div className="flex flex-col md:flex-row gap-3">
                        <select
                          value={urlInclusionsRuleField}
                          onChange={(e) => setUrlInclusionsRuleField(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        >
                          <option value="URL_CONTAINS">URL contains</option>
                          <option value="PAGE_TITLE_CONTAINS">Page title contains</option>
                          <option value="PAGE_CONTENT_CONTAINS">Page content contains</option>
                        </select>
                        <input
                          type="text"
                          value={urlInclusionsRuleValue}
                          onChange={(e) => setUrlInclusionsRuleValue(e.target.value)}
                          placeholder="Enter rule text"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Left Column Bottom Add Action */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInclusionsTab === "URLS" && urlInclusionsText.trim()) {
                        const lines = urlInclusionsText.split("\n").filter(l => l.trim());
                        setSelectedUrlInclusionTargets(prev => [...prev, ...lines]);
                        setUrlInclusionsText("");
                      } else if (urlInclusionsTab === "CUSTOM_LABELS" && urlInclusionsCustomLabel.trim()) {
                        setSelectedUrlInclusionTargets(prev => [...prev, `Label: ${urlInclusionsCustomLabel.trim()}`]);
                        setUrlInclusionsCustomLabel("");
                      } else if (urlInclusionsTab === "RULES" && urlInclusionsRuleValue.trim()) {
                        setSelectedUrlInclusionTargets(prev => [...prev, `Rule: ${urlInclusionsRuleField} -> ${urlInclusionsRuleValue.trim()}`]);
                        setUrlInclusionsRuleValue("");
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/30 font-bold text-xs cursor-pointer transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Right Column: Selected Targets Summary (4 cols) */}
              <div className="md:col-span-4 p-6 bg-slate-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
                    {selectedUrlInclusionTargets.length > 0 ? `${selectedUrlInclusionTargets.length} selected` : "None selected"}
                  </h3>

                  {selectedUrlInclusionTargets.length === 0 ? (
                    <div className="py-20 text-center text-slate-500">
                      <p className="text-xs">Select targets on the left.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-3 max-h-64 overflow-y-auto">
                      {selectedUrlInclusionTargets.map((target, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs">
                          <span className="truncate text-slate-700 font-mono text-[11px]">{target}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedUrlInclusionTargets(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Add Calls to Your Campaign Modal Overlay ── */}
      {activeModal === "CALLS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Top Header */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Add calls to your campaign</h2>
          </div>

          {/* Main Content Scroll Container */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            
            {/* Section 1: Campaign-level calls */}
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Campaign-level calls</h3>
                <p className="text-[11px] text-slate-500">Add calls to this campaign. Any calls added here can be used across campaigns.</p>
              </div>

              {/* Add New Call Container Box */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">Add new call</span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span>Call reporting on, call recording off</span>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                </div>

                {/* Country + Phone Number Input Row */}
                <div className="space-y-1 max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={callCountry}
                      onChange={(e) => setCallCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                    >
                      <option value="United States">United States</option>
                      <option value="India (+91)">India (+91)</option>
                      <option value="United Kingdom (+44)">United Kingdom (+44)</option>
                      <option value="Canada (+1)">Canada (+1)</option>
                      <option value="Australia (+61)">Australia (+61)</option>
                    </select>

                    <div className="relative">
                      <input
                        type="text"
                        value={callPhone}
                        onChange={(e) => setCallPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
                      />
                      <HelpCircle className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block pl-1">Example: (201) 555-0123</span>
                </div>

                {/* Conversion Action */}
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold">
                    <span>Conversion action</span>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <select
                    value={callConversionAction}
                    onChange={(e) => setCallConversionAction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    <option value="Use account settings (Calls from ads)">Use account settings (Calls from ads)</option>
                    <option value="Calls from ads">Calls from ads</option>
                    <option value="Calls from ads 2">Calls from ads</option>
                    <option value="None">None</option>
                    <option value="Manage conversions">Manage conversions</option>
                  </select>
                </div>

                {/* Advanced Options Accordion */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-blue-400 text-xs">Advanced options</span>
                    <ChevronUp className="h-4 w-4 text-blue-400" />
                  </div>

                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-800 block text-xs">Days and hours</span>

                    <div className="space-y-2">
                      {callSchedules.map((sched, idx) => (
                        <div key={idx} className="flex flex-wrap items-center gap-3">
                          <select
                            value={sched.day}
                            onChange={(e) => {
                              const updated = [...callSchedules];
                              updated[idx].day = e.target.value;
                              setCallSchedules(updated);
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                          >
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
                            value={sched.start}
                            onChange={(e) => {
                              const updated = [...callSchedules];
                              updated[idx].start = e.target.value;
                              setCallSchedules(updated);
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                          >
                            {timeOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          <span className="text-slate-500">to</span>

                          <select
                            value={sched.end}
                            onChange={(e) => {
                              const updated = [...callSchedules];
                              updated[idx].end = e.target.value;
                              setCallSchedules(updated);
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                          >
                            {timeOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          {callSchedules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setCallSchedules(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCallSchedules(prev => [...prev, { day: "All days", start: "00:00", end: "00:00" }])}
                      className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      + Add Schedule
                    </button>

                    <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-200/40">
                      <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more</a></p>
                      <p className="text-[10px] text-slate-500">Based on account time zone: (GMT+05:30) India Standard Time</p>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold text-xs shadow cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>

            {/* Section 2: Account-level calls */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Account-level calls</h3>
                <p className="text-[11px] text-slate-500">The following calls are from your account and will be used in this campaign.</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white max-w-xs shadow">
                <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">077099 36965</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Create Sitelink Modal Overlay ── */}
      {activeModal === "SITELINKS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Top Header Bar */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-base font-semibold text-slate-900">Create sitelink</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
              >
                Save
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Main Scroll Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-5">
            
            {/* Sitelinks Accordion List (Sitelink 1 to 6+) */}
            {sitelinks.map((st, idx) => {
              const isOpen = openSitelinkIdx === idx;
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  {/* Accordion Header */}
                  <div
                    onClick={() => setOpenSitelinkIdx(isOpen ? -1 : idx)}
                    className="p-4 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    <span className="font-bold text-slate-900 text-xs">Sitelink {idx + 1}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </div>

                  {/* Accordion Body Form Controls */}
                  {isOpen && (
                    <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4 animate-in fade-in duration-150">
                      
                      {/* Sitelink text */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={st.text}
                            onChange={(e) => {
                              const updated = [...sitelinks];
                              updated[idx].text = e.target.value;
                              setSitelinks(updated);
                            }}
                            placeholder="Sitelink text"
                            maxLength={25}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block text-right font-mono">{st.text.length} / 25</span>
                      </div>

                      {/* Description line 1 (recommended) */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={st.desc1}
                            onChange={(e) => {
                              const updated = [...sitelinks];
                              updated[idx].desc1 = e.target.value;
                              setSitelinks(updated);
                            }}
                            placeholder="Description line 1 (recommended)"
                            maxLength={35}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary pr-9 font-medium"
                          />
                          <HelpCircle className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </div>
                        <span className="text-[10px] text-slate-500 block text-right font-mono">{st.desc1.length} / 35</span>
                      </div>

                      {/* Description line 2 (recommended) */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={st.desc2}
                            onChange={(e) => {
                              const updated = [...sitelinks];
                              updated[idx].desc2 = e.target.value;
                              setSitelinks(updated);
                            }}
                            placeholder="Description line 2 (recommended)"
                            maxLength={35}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block text-right font-mono">{st.desc2.length} / 35</span>
                      </div>

                      {/* Final URL */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={st.url}
                            onChange={(e) => {
                              const updated = [...sitelinks];
                              updated[idx].url = e.target.value;
                              setSitelinks(updated);
                            }}
                            placeholder="Final URL"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary pr-9 font-mono"
                          />
                          <HelpCircle className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Sitelink Button */}
            <button
              type="button"
              onClick={() => {
                setSitelinks(prev => [...prev, { text: "", desc1: "", desc2: "", url: "" }]);
                setOpenSitelinkIdx(sitelinks.length);
              }}
              className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer pt-1"
            >
              + Add sitelink
            </button>

            {/* Sitelink URL Options Expandable */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between cursor-pointer border-b border-slate-200 pb-3">
                <span className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                  <ChevronUp className="h-4 w-4" /> Sitelink URL options
                </span>
              </div>

              <div className="space-y-4 pt-1 text-xs">
                {/* Tracking template */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={sitelinkTrackingTemplate}
                      onChange={(e) => setSitelinkTrackingTemplate(e.target.value)}
                      placeholder="Tracking template"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary pr-9 font-mono"
                    />
                    <HelpCircle className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <span className="text-[10px] text-slate-500 block font-mono">Example: https://www.trackingtemplate.foo/?url=&#123;lpurl&#125;&amp;id=5</span>
                </div>

                {/* Final URL suffix */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={sitelinkFinalUrlSuffix}
                      onChange={(e) => setSitelinkFinalUrlSuffix(e.target.value)}
                      placeholder="Final URL suffix"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary pr-9 font-mono"
                    />
                    <HelpCircle className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <span className="text-[10px] text-slate-500 block font-mono">Example: param1=value1&param2=value2</span>
                </div>

                {/* Custom parameter */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold">
                    <span>Custom parameter</span>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <span className="text-slate-500 font-mono text-xs pr-1">{`{_`}</span>
                      <input
                        type="text"
                        value={sitelinkCustomParamName}
                        onChange={(e) => setSitelinkCustomParamName(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-transparent text-xs text-slate-900 focus:outline-none font-mono"
                      />
                      <span className="text-slate-500 font-mono text-xs pl-1">{`)`}</span>
                    </div>
                    <span className="text-slate-500 font-bold">=</span>
                    <input
                      type="text"
                      value={sitelinkCustomParamValue}
                      onChange={(e) => setSitelinkCustomParamValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                    />
                    <button type="button" className="p-2 text-blue-400 hover:text-blue-300">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Use a different final URL for mobile */}
                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={useDifferentMobileUrl}
                    onChange={(e) => setUseDifferentMobileUrl(e.target.checked)}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span className="text-slate-700 font-semibold">Use a different final URL for mobile</span>
                </label>
              </div>
            </div>

            {/* Advanced Options Expandable */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between cursor-pointer border-b border-slate-200 pb-3">
                <span className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                  <ChevronUp className="h-4 w-4" /> Advanced options
                </span>
              </div>

              <div className="space-y-4 pt-1 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">Asset scheduling</h4>
                  <p className="text-[11px] text-slate-500">Select when your assets will be eligible to show</p>
                </div>

                {/* Start Date & End Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700 block text-[11px]">Start date</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="assetStartRadio"
                        checked={assetStartDateMode === "NONE"}
                        onChange={() => setAssetStartDateMode("NONE")}
                        className="text-primary h-4 w-4"
                      />
                      <span className="text-slate-700">None</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="assetStartRadio"
                        checked={assetStartDateMode === "CUSTOM"}
                        onChange={() => setAssetStartDateMode("CUSTOM")}
                        className="text-primary h-4 w-4"
                      />
                      <input
                        type="date"
                        value={assetStartDate}
                        onChange={(e) => {
                          setAssetStartDate(e.target.value);
                          setAssetStartDateMode("CUSTOM");
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </label>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700 block text-[11px]">End date</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="assetEndRadio"
                        checked={assetEndDateMode === "NONE"}
                        onChange={() => setAssetEndDateMode("NONE")}
                        className="text-primary h-4 w-4"
                      />
                      <span className="text-slate-700">None</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="assetEndRadio"
                        checked={assetEndDateMode === "CUSTOM"}
                        onChange={() => setAssetEndDateMode("CUSTOM")}
                        className="text-primary h-4 w-4"
                      />
                      <input
                        type="date"
                        value={assetEndDate}
                        onChange={(e) => {
                          setAssetEndDate(e.target.value);
                          setAssetEndDateMode("CUSTOM");
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </label>
                  </div>
                </div>

                {/* Days and hours schedule */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-800 block text-xs">Days and hours</span>

                  <div className="space-y-2">
                    {sitelinkSchedules.map((sched, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-3">
                        <select
                          value={sched.day}
                          onChange={(e) => {
                            const updated = [...sitelinkSchedules];
                            updated[idx].day = e.target.value;
                            setSitelinkSchedules(updated);
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        >
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
                          value={sched.start}
                          onChange={(e) => {
                            const updated = [...sitelinkSchedules];
                            updated[idx].start = e.target.value;
                            setSitelinkSchedules(updated);
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                        >
                          {["12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM", "05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        <span className="text-slate-500">to</span>

                        <select
                          value={sched.end}
                          onChange={(e) => {
                            const updated = [...sitelinkSchedules];
                            updated[idx].end = e.target.value;
                            setSitelinkSchedules(updated);
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-primary"
                        >
                          {["12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM", "05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        {sitelinkSchedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSitelinkSchedules(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSitelinkSchedules(prev => [...prev, { day: "All days", start: "12:00 AM", end: "12:00 AM" }])}
                    className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    + Add Schedule
                  </button>

                  <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-200/40">
                    <p>To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more</a></p>
                    <p className="text-[10px] text-slate-500">Based on account time zone: (GMT+05:30) India Standard Time</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Add Promotions to Your Campaign Modal Overlay ── */}
      {activeModal === "PROMOTIONS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Header */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Add promotions to your campaign</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Campaign-level promotions</h3>
              <p className="text-[11px] text-slate-500">Add promotions to this campaign. Any promotions added here can be used across campaigns.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-xs block">Add new promotion</span>
                
                {/* Occasion */}
                <div className="space-y-1 max-w-xs pt-1">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold">
                    <span>Occasion</span>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <select
                    value={promoOccasion}
                    onChange={(e) => setPromoOccasion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    <option value="None">None</option>
                    <option value="New Year's">New Year's</option>
                    <option value="Valentine's Day">Valentine's Day</option>
                    <option value="Easter">Easter</option>
                    <option value="Mother's Day">Mother's Day</option>
                    <option value="Father's Day">Father's Day</option>
                    <option value="Labor Day">Labor Day</option>
                    <option value="Back to school">Back to school</option>
                    <option value="Halloween">Halloween</option>
                    <option value="Black Friday">Black Friday</option>
                    <option value="Cyber Monday">Cyber Monday</option>
                    <option value="Christmas">Christmas</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Choose an occasion or select a date range in the Advanced options below. Otherwise, this asset will be eligible to show continuously. <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 hover:underline">Learn more</a></p>
                </div>
              </div>

              {/* Language & Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Language</label>
                  <select
                    value={promoLanguage}
                    onChange={(e) => setPromoLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold">
                    <span>Currency</span>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                  </div>
                  <select
                    value={promoCurrency}
                    onChange={(e) => setPromoCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>

              {/* Promotion type */}
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <span>Promotion type</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as "MONETARY" | "PERCENT")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    <option value="MONETARY">Monetary discount</option>
                    <option value="PERCENT">Percent discount</option>
                  </select>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">
                      {promoType === "MONETARY" ? "$" : "%"}
                    </span>
                    <input
                      type="text"
                      value={promoValue}
                      onChange={(e) => setPromoValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Item */}
              <div className="space-y-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    value={promoItem}
                    onChange={(e) => setPromoItem(e.target.value)}
                    placeholder="Item"
                    maxLength={20}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary pr-9 font-medium"
                  />
                  <HelpCircle className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <span className="text-[10px] text-slate-500 block text-right font-mono">{promoItem.length} / 20</span>
              </div>

              {/* Final URL */}
              <div className="space-y-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    value={promoFinalUrl}
                    onChange={(e) => setPromoFinalUrl(e.target.value)}
                    placeholder="Final URL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary pr-9 font-mono"
                  />
                  <HelpCircle className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
              </div>

              {/* Promotion details */}
              <div className="space-y-1 max-w-xs">
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <span>Promotion details</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <select
                  value={promoDetails}
                  onChange={(e) => setPromoDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                >
                  <option value="None">None</option>
                  <option value="On orders over">On orders over</option>
                  <option value="Promo code">Promo code</option>
                </select>
              </div>

              {/* Displayed promotion dates */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <span>Displayed promotion dates</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <span className="text-[11px] text-slate-500 block">Show the dates of your promotion</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700 block text-[11px]">Start date</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="promoStartRadio"
                        checked={promoStartDateMode === "NONE"}
                        onChange={() => setPromoStartDateMode("NONE")}
                        className="text-primary h-4 w-4"
                      />
                      <span className="text-slate-700">None</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="promoStartRadio"
                        checked={promoStartDateMode === "CUSTOM"}
                        onChange={() => setPromoStartDateMode("CUSTOM")}
                        className="text-primary h-4 w-4"
                      />
                      <input
                        type="date"
                        value={promoStartDate}
                        onChange={(e) => {
                          setPromoStartDate(e.target.value);
                          setPromoStartDateMode("CUSTOM");
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </label>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700 block text-[11px]">End date</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="promoEndRadio"
                        checked={promoEndDateMode === "NONE"}
                        onChange={() => setPromoEndDateMode("NONE")}
                        className="text-primary h-4 w-4"
                      />
                      <span className="text-slate-700">None</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="promoEndRadio"
                        checked={promoEndDateMode === "CUSTOM"}
                        onChange={() => setPromoEndDateMode("CUSTOM")}
                        className="text-primary h-4 w-4"
                      />
                      <input
                        type="date"
                        value={promoEndDate}
                        onChange={(e) => {
                          setPromoEndDate(e.target.value);
                          setPromoEndDateMode("CUSTOM");
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Add Callouts to Your Campaign Modal Overlay ── */}
      {activeModal === "CALLOUTS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Add callouts to your campaign</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Campaign-level callouts</h3>
              <p className="text-[11px] text-slate-500">Add callouts to this campaign. Any callouts added here can be used across campaigns.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
              <span className="font-bold text-slate-800 text-xs block">Add new callout</span>

              <div className="space-y-4 max-w-xl">
                {calloutInputList.map((text, idx) => (
                  <div key={idx} className="space-y-1">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => {
                        const updated = [...calloutInputList];
                        updated[idx] = e.target.value;
                        setCalloutInputList(updated);
                      }}
                      placeholder={`Callout text ${idx + 1}`}
                      maxLength={25}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                    />
                    <span className="text-[10px] text-slate-500 block text-right font-mono">{text.length} / 25</span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setCalloutInputList(prev => [...prev, ""])}
                  className="text-blue-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  + Add callout text
                </button>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setCallouts(calloutInputList.filter(c => c.trim()));
                    setActiveModal(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Structured Snippet Modal Overlay ── */}
      {activeModal === "SNIPPETS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Create structured snippet</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                  <span>Header</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                  <select
                    value={snippetLanguage}
                    onChange={(e) => setSnippetLanguage(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    {[
                      "Arabic", "Bulgarian", "Catalan", "Chinese (Hong Kong)", "Chinese (Simplified)",
                      "Chinese (Traditional)", "Croatian", "Czech", "Danish", "Dutch",
                      "English", "Estonian", "Filipino", "Finnish", "French",
                      "German", "Greek", "Hebrew", "Hindi", "Hungarian",
                      "Indonesian", "Italian", "Japanese", "Korean", "Latvian",
                      "Lithuanian", "Malay", "Norwegian", "Polish", "Portuguese",
                      "Romanian", "Russian", "Serbian", "Slovak", "Slovenian",
                      "Spanish (Spain)", "Swedish", "Thai", "Turkish", "Ukrainian",
                      "Vietnamese"
                    ].map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>

                  <select
                    value={snippetHeaderType}
                    onChange={(e) => setSnippetHeaderType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
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
              </div>

              {/* Values */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                  <span>Values</span>
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                </div>

                <div className="space-y-3 max-w-xl">
                  {snippetValuesList.map((val, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const updated = [...snippetValuesList];
                            updated[idx] = e.target.value;
                            setSnippetValuesList(updated);
                          }}
                          placeholder={`Value ${idx + 1}`}
                          maxLength={25}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setSnippetValuesList(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono pr-7">{val.length} / 25</span>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSnippetValuesList(prev => [...prev, ""])}
                    className="text-blue-400 font-bold text-xs hover:underline block cursor-pointer pt-1"
                  >
                    + Add value
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Create Lead Form Modal Overlay ── */}
      {activeModal === "LEAD_FORMS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Top Header */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Add a lead form to your campaign</h2>
          </div>

          {/* Scrollable Container with Split-screen columns */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full mx-auto space-y-6">
            <div className="max-w-6xl mx-auto">
              <div className="space-y-1 pb-4">
                <h3 className="font-bold text-slate-900 text-sm">Campaign-level lead forms</h3>
                <p className="text-[11px] text-slate-500">Add lead forms to this campaign. Any lead forms added here can be used across campaigns.</p>
              </div>

              {/* Grid split: 60% Left form inputs, 40% Right sticky preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Inputs) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card 1: Create your lead form */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 text-xs">Create your lead form</h4>
                    
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Headline</label>
                      <input
                        type="text"
                        maxLength={30}
                        value={lfHeadline}
                        onChange={(e) => setLfHeadline(e.target.value)}
                        placeholder="Headline"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {lfHeadline.length} / 30 (Text is {lfHeadline.length} characters out of 30)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Business name</label>
                      <input
                        type="text"
                        maxLength={25}
                        value={lfBusinessName}
                        onChange={(e) => setLfBusinessName(e.target.value)}
                        placeholder="Business name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {lfBusinessName.length} / 25 (Text is {lfBusinessName.length} characters out of 25)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Description</label>
                      <textarea
                        rows={3}
                        maxLength={200}
                        value={lfDescription}
                        onChange={(e) => setLfDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {lfDescription.length} / 200 (Text is {lfDescription.length} characters out of 200)
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Questions */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 text-xs">Questions</h4>

                    {/* Contact information */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-slate-700">Contact information</h5>
                        <span className="text-[11px] text-slate-500">Add Field (Optional)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {Object.keys(lfContactFields).map((field) => (
                          <div key={field} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={lfContactFields[field]}
                                  onChange={(e) => setLfContactFields({ ...lfContactFields, [field]: e.target.checked })}
                                  className="rounded text-primary h-3.5 w-3.5"
                                />
                                <span className="text-slate-800 font-medium">{field}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">Pre-filled</span>
                            </label>

                            {/* Name Options */}
                            {field === "Name" && lfContactFields["Name"] && (
                              <div className="pl-6 pt-1 flex items-center gap-3 text-[10px] text-slate-500 border-t border-slate-900 mt-1">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="lfNameFormat"
                                    checked={lfNameFormat === "FULL_NAME"}
                                    onChange={() => setLfNameFormat("FULL_NAME")}
                                    className="text-primary"
                                  />
                                  <span>Full name</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="lfNameFormat"
                                    checked={lfNameFormat === "FIRST_LAST_NAME"}
                                    onChange={() => setLfNameFormat("FIRST_LAST_NAME")}
                                    className="text-primary"
                                  />
                                  <span>First and last name</span>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work information */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-slate-700">Work information</h5>
                        <span className="text-[11px] text-slate-500">Add Field (Optional)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {Object.keys(lfWorkFields).map((field) => (
                          <label key={field} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:bg-white cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={lfWorkFields[field]}
                                onChange={(e) => setLfWorkFields({ ...lfWorkFields, [field]: e.target.checked })}
                                className="rounded text-primary h-3.5 w-3.5"
                              />
                              <span className="text-slate-800 font-medium">{field}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">Optional</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Additional information */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-slate-700">Additional information</h5>
                        <span className="text-[11px] text-slate-500">Add Field (Optional)</span>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer max-w-md">
                          <input
                            type="checkbox"
                            checked={lfAgeQuestion}
                            onChange={(e) => setLfAgeQuestion(e.target.checked)}
                            className="rounded text-primary h-3.5 w-3.5"
                          />
                          <span className="text-slate-800 text-xs">Are you over</span>
                          <select
                            value={lfAgeYears}
                            onChange={(e) => setLfAgeYears(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-900 font-mono"
                          >
                            {["18", "19", "20", "21", "25"].map((yr) => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                          <span className="text-slate-800 text-xs">years of age?</span>
                        </label>
                      </div>
                    </div>

                    {/* Custom questions */}
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-slate-700">Custom questions</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Language:</span>
                          <select
                            value={lfCustomLanguage}
                            onChange={(e) => setLfCustomLanguage(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                          >
                            {[
                              "Arabic", "Bulgarian", "Catalan", "Chinese (Hong Kong)", "Chinese (Simplified)", "Chinese (Traditional)",
                              "Croatian", "Czech", "Danish", "Dutch", "English", "Estonian", "Filipino", "Finnish", "French",
                              "German", "Greek", "Hebrew", "Hindi", "Hungarian", "Indonesian", "Italian", "Japanese", "Korean",
                              "Latvian", "Lithuanian", "Malay", "Norwegian", "Polish", "Portuguese", "Romanian", "Russian",
                              "Serbian", "Slovak", "Slovenian", "Spanish (Spain)", "Swedish", "Thai", "Turkish", "Ukrainian", "Vietnamese"
                            ].map((lang, idx) => (
                              <option key={idx} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500">Setup lead scoring by choosing 1 question to qualify form submits as a strong lead for your business.</p>

                      {/* Added custom questions list */}
                      {lfCustomQuestions.map((cq, idx) => (
                        <div key={cq.id} className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-100">
                          <input
                            type="text"
                            value={cq.question}
                            onChange={(e) => {
                              const updated = [...lfCustomQuestions];
                              updated[idx].question = e.target.value;
                              setLfCustomQuestions(updated);
                            }}
                            placeholder={`Custom Question ${idx + 1}`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                          />
                          <button type="button" onClick={() => setLfCustomQuestions(prev => prev.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setLfCustomQuestions(prev => [...prev, { id: `cq-${Date.now()}`, question: "" }])}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add custom question
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Privacy Policy & Background Image */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 text-xs">Privacy & Design</h4>
                    
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Privacy policy URL</label>
                      <input
                        type="url"
                        value={lfPrivacyPolicyUrl}
                        onChange={(e) => setLfPrivacyPolicyUrl(e.target.value)}
                        placeholder="https://example.com/privacy"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Background image URL</label>
                      <input
                        type="url"
                        value={lfBackgroundImage}
                        onChange={(e) => setLfBackgroundImage(e.target.value)}
                        placeholder="https://example.com/bg-image.jpg"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Card 4: Form Submission Message */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 text-xs">Create form submission message</h4>
                    
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Headline</label>
                      <input
                        type="text"
                        maxLength={30}
                        value={lfSubHeadline}
                        onChange={(e) => setLfSubHeadline(e.target.value)}
                        placeholder="Thank you."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block font-mono">{lfSubHeadline.length} / 30 (Text is {lfSubHeadline.length} characters out of 30)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Description</label>
                      <textarea
                        rows={2}
                        maxLength={200}
                        value={lfSubDescription}
                        onChange={(e) => setLfSubDescription(e.target.value)}
                        placeholder="We'll contact you soon."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-slate-500 block text-right font-mono">{lfSubDescription.length} / 200 (Text is {lfSubDescription.length} characters out of 200)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Call-to-action</label>
                        <select
                          value={lfSubCta}
                          onChange={(e) => setLfSubCta(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        >
                          {["None", "Visit site", "Download", "Learn more", "Shop now"].map((cta, idx) => (
                            <option key={idx} value={cta}>{cta}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Call-to-action URL</label>
                        <input
                          type="url"
                          value={lfSubCtaUrl}
                          onChange={(e) => setLfSubCtaUrl(e.target.value)}
                          placeholder="https://example.com/thank-you"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Select a call-to-action for your ad */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Select a call-to-action for your ad</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Select a compelling call-to-action that empowers people to engage with your business or service</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Call-to-action</label>
                        <select
                          value={lfAdCta}
                          onChange={(e) => setLfAdCta(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        >
                          {[
                            "Apply now", "Book now", "Contact us", "Download", "Get info", "Get offer",
                            "Get quote", "Get started", "Join now", "Learn more", "Register", "Request a demo",
                            "Sign up", "Subscribe"
                          ].map((cta, idx) => (
                            <option key={idx} value={cta}>{cta}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Call-to-action description</label>
                        <input
                          type="text"
                          maxLength={30}
                          value={lfAdCtaDescription}
                          onChange={(e) => setLfAdCtaDescription(e.target.value)}
                          placeholder="Call-to-action description"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Text is {lfAdCtaDescription.length} characters out of 30</span>
                          <span>{lfAdCtaDescription.length} / 30</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Lead Delivery Options */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1">Lead delivery option</h4>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-1">
                      <span className="font-semibold block text-slate-900">Download collected leads in ad extensions table</span>
                      <p className="text-slate-500">You can only download leads that've been collected within the last 30 days</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h5 className="font-semibold text-slate-700 text-xs">Webhook integration (optional)</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Send lead form data directly to your CRM software in real time. Otherwise, you can download data from the extensions table. <a href="https://support.google.com/google-ads/answer/10089407?hl=en_US" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Learn more</a>
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-semibold mb-1">Webhook URL</label>
                          <input
                            type="url"
                            value={lfWebhookUrl}
                            onChange={(e) => setLfWebhookUrl(e.target.value)}
                            placeholder="https://example.com/webhook"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-semibold mb-1">Key</label>
                          <input
                            type="text"
                            maxLength={50}
                            value={lfWebhookKey}
                            onChange={(e) => setLfWebhookKey(e.target.value)}
                            placeholder="Key"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                        <span className="font-semibold text-slate-700 block">Don't have a webhook?</span>
                        <p className="text-slate-500">
                          Zapier allows you to quickly connect your lead form with over 3,000 apps. <a href="https://zapier.com/apps/google-ads/integrations" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Connect with Zapier</a>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <h5 className="font-semibold text-slate-700 text-xs">Notifications (optional)</h5>
                      <p className="text-[11px] text-slate-500">To get an email notification for every lead, enter 1 or more email addresses.</p>
                      <input
                        type="text"
                        value={lfNotificationEmails}
                        onChange={(e) => setLfNotificationEmails(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Card 7: Lead Form Type & Terms */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Lead form type</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Optimize for leads with higher intent or for more leads overall. <a href="https://support.google.com/google-ads/answer/10089406?hl=en_US#optimization" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Learn more</a></p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${lfFormType === "MORE_VOLUME" ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:bg-white/40"}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="lfFormType" checked={lfFormType === "MORE_VOLUME"} onChange={() => setLfFormType("MORE_VOLUME")} className="text-primary" />
                          <span className="font-bold text-slate-800 text-xs">More volume</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5">This may result in leads with lower intent.</p>
                      </label>

                      <label className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${lfFormType === "MORE_QUALIFIED" ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:bg-white/40"}`}>
                        <div className="flex items-center gap-2">
                          <input type="radio" name="lfFormType" checked={lfFormType === "MORE_QUALIFIED"} onChange={() => setLfFormType("MORE_QUALIFIED")} className="text-primary" />
                          <span className="font-bold text-slate-800 text-xs">More qualified</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5">This may result in fewer leads or a higher cost per lead.</p>
                      </label>
                    </div>

                    <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                      To create new lead form extensions, accept the Terms of Service.
                    </p>
                  </div>

                  {/* Optimize conversion checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 bg-white/30">
                    <input
                      type="checkbox"
                      checked={optimizeForMessageAds}
                      onChange={(e) => setOptimizeForMessageAds(e.target.checked)}
                      className="mt-0.5 rounded text-primary h-4 w-4"
                    />
                    <span className="text-slate-700 leading-relaxed">
                      Optimize your campaign for lead form submissions. This will add a <strong className="text-slate-900 font-bold">submit lead form</strong> conversion action to your campaign. <a href="https://support.google.com/google-ads/answer/10995103?hl=en_US" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">Learn more about conversions</a>
                    </span>
                  </label>

                </div>

                {/* Right Column (Sticky Smartphone Preview) */}
                <div className="lg:col-span-5 lg:sticky lg:top-8">
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                    <span className="font-bold text-slate-800 text-xs block pb-1 border-b border-slate-200">Preview</span>
                    
                    {/* Smartphone Mockup Body */}
                    <div className="relative mx-auto max-w-[280px] rounded-[32px] border-4 border-slate-200 bg-slate-50 p-4 shadow-md text-left space-y-3">
                      {/* Form Header */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">{lfBusinessName || "Business name"}</span>
                        <h4 className="text-xs font-bold text-slate-800">{lfHeadline || "Headline"}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">{lfDescription || "Description text goes here..."}</p>
                      </div>

                      {/* Form Fields Preview */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        {lfContactFields["Name"] && (
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-medium">Full name</span>
                            <div className="w-full h-8 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-[10px] text-slate-600 select-none">
                              John Doe
                            </div>
                          </div>
                        )}
                        {lfContactFields["Email"] && (
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-medium">Email</span>
                            <div className="w-full h-8 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-[10px] text-slate-600 select-none">
                              johndoe@example.com
                            </div>
                          </div>
                        )}
                        {lfContactFields["Phone number"] && (
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500 font-medium">Phone number</span>
                            <div className="w-full h-8 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-[10px] text-slate-600 select-none">
                              +91 98765 43210
                            </div>
                          </div>
                        )}
                        
                        {/* Dynamic fields showing in preview */}
                        {Object.keys(lfContactFields).filter(f => f !== "Name" && f !== "Email" && f !== "Phone number" && lfContactFields[f]).map(field => (
                          <div key={field} className="space-y-1 animate-in fade-in duration-100">
                            <span className="text-[9px] text-slate-500 font-medium">{field}</span>
                            <div className="w-full h-8 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-[10px] text-slate-600 select-none">
                              Value for {field}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Disclosure */}
                      <p className="text-[8px] text-slate-500 leading-normal pt-2 border-t border-slate-900">
                        By submitting, you agree to send your info to <span className="font-semibold text-slate-500">{lfBusinessName || "Business name"}</span> so they can contact you about the above request. <span className="font-semibold text-slate-500">{lfBusinessName || "Business name"}</span> agrees to use your info in accordance with their privacy policy. Google will not use the content of your responses for ads targeting or measurement. Google may otherwise use your submission in accordance with our privacy policy.
                      </p>

                      {/* Submit button */}
                      <button type="button" className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] text-center select-none cursor-default shadow">
                        Submit
                      </button>
                    </div>

                    <p className="text-[9px] text-slate-500 leading-normal italic text-center pt-2">
                      People seeing your form will see standard text, such as questions and calls-to-action, translated into the language of their device. Custom text won't be translated. Your ad might not always include all your text. Shortening might occur in some formats. <a href="https://support.google.com/google-ads/answer/1704363?hl=en_US" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Learn more</a>
                    </p>

                  </div>
                </div>

              </div>

              {/* Modal footer controls */}
              <div className="flex justify-end pt-4 border-t border-slate-850 mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSavedLeadForms(prev => [...prev, { headline: lfHeadline || "Lead Form", business: lfBusinessName || "Business" }]);
                    setActiveModal(null);
                  }}
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow transition-all"
                >
                  Save Lead Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Add Messages to Your Campaign Modal Overlay ── */}
      {activeModal === "MESSAGES" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Add messages to your campaign</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Campaign-level messages</h3>
              <p className="text-[11px] text-slate-500">Add messages to this campaign. Any messages added here can be used across campaigns.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 text-xs block">Set up your message asset</span>
                  <select
                    value={selectedMessagePlatform}
                    onChange={(e) => setSelectedMessagePlatform(e.target.value)}
                    className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
                  >
                    <option value="Select message platform">Select message platform</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Messenger">Messenger</option>
                    <option value="Zalo">Zalo</option>
                  </select>
                </div>

                {selectedMessagePlatform === "WhatsApp" && (
                  <div className="space-y-4 p-5 rounded-xl border border-slate-200 bg-slate-50 max-w-xl animate-in fade-in duration-150">
                    <span className="font-bold text-slate-800 block text-xs">WhatsApp phone number</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={msgCountry}
                        onChange={(e) => setMsgCountry(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      >
                        <option value="India (+91)">India (+91)</option>
                        <option value="United States (+1)">United States (+1)</option>
                        <option value="United Kingdom (+44)">United Kingdom (+44)</option>
                        <option value="Canada (+1)">Canada (+1)</option>
                        <option value="Australia (+61)">Australia (+61)</option>
                      </select>

                      <div className="relative">
                        <input
                          type="text"
                          value={msgPhone}
                          onChange={(e) => setMsgPhone(e.target.value)}
                          placeholder="WhatsApp phone number"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-mono"
                        />
                        <HelpCircle className="absolute right-3.5 top-2.5 h-3.5 w-3.5 text-slate-500 cursor-pointer" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 block pl-1">
                      {msgCountry.includes("India") ? "Example: 98765 43210" : "Example: (201) 555-0123"}
                    </span>

                    {/* Starter Message */}
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Starter message</label>
                      <textarea
                        rows={2}
                        maxLength={140}
                        value={msgStarterMessage}
                        onChange={(e) => setMsgStarterMessage(e.target.value)}
                        placeholder="Can I get started with a delivery?"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Text is {msgStarterMessage.length} characters out of 140</span>
                        <span className="font-mono">{msgStarterMessage.length} / 140</span>
                      </div>
                    </div>

                    {/* Call To Action */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-slate-700 font-semibold">Select a call-to-action for your ad</label>
                        <p className="text-[11px] text-slate-500">Select a compelling call-to-action that empowers people to engage with your business or service</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Call-to-action</label>
                        <select
                          value={msgCallToAction}
                          onChange={(e) => setMsgCallToAction(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        >
                          {["None", "Apply now", "Book now", "Contact us", "Get info", "Get offer", "Get quote", "Get started", "Learn more"].map((cta, idx) => (
                            <option key={idx} value={cta}>{cta}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Call-to-action description</label>
                        <input
                          type="text"
                          maxLength={30}
                          value={msgCtaDescription}
                          onChange={(e) => setMsgCtaDescription(e.target.value)}
                          placeholder="Call-to-action description"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Text is {msgCtaDescription.length} characters out of 30</span>
                          <span className="font-mono">{msgCtaDescription.length} / 30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMessagePlatform === "Messenger" && (
                  <div className="space-y-4 p-5 rounded-xl border border-slate-200 bg-slate-50 max-w-xl animate-in fade-in duration-150">
                    <span className="font-bold text-slate-800 block text-xs font-semibold">Messenger URL username</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2 text-slate-500 font-mono text-xs">https://m.me/</span>
                      <input
                        type="text"
                        maxLength={128}
                        value={msgCustomUrlName}
                        onChange={(e) => setMsgCustomUrlName(e.target.value)}
                        placeholder="username"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-[96px] pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Example: https://m.me/username</span>
                      <span className="font-mono">{msgCustomUrlName.length} / 128 (Text is {msgCustomUrlName.length} characters out of 128)</span>
                    </div>

                    {/* Starter Message */}
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Starter message</label>
                      <textarea
                        rows={2}
                        maxLength={140}
                        value={msgStarterMessage}
                        onChange={(e) => setMsgStarterMessage(e.target.value)}
                        placeholder="Can I get started with a delivery?"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Text is {msgStarterMessage.length} characters out of 140</span>
                        <span className="font-mono">{msgStarterMessage.length} / 140</span>
                      </div>
                    </div>

                    {/* Call To Action */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-slate-700 font-semibold">Select a call-to-action for your ad</label>
                        <p className="text-[11px] text-slate-500">Select a compelling call-to-action that empowers people to engage with your business or service</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Call-to-action</label>
                        <select
                          value={msgCallToAction}
                          onChange={(e) => setMsgCallToAction(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        >
                          {["None", "Apply now", "Book now", "Contact us", "Get info", "Get offer", "Get quote", "Get started", "Learn more"].map((cta, idx) => (
                            <option key={idx} value={cta}>{cta}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Call-to-action description</label>
                        <input
                          type="text"
                          maxLength={30}
                          value={msgCtaDescription}
                          onChange={(e) => setMsgCtaDescription(e.target.value)}
                          placeholder="Call-to-action description"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Text is {msgCtaDescription.length} characters out of 30</span>
                          <span className="font-mono">{msgCtaDescription.length} / 30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMessagePlatform === "Zalo" && (
                  <div className="space-y-4 p-5 rounded-xl border border-slate-200 bg-slate-50 max-w-xl animate-in fade-in duration-150">
                    <span className="font-bold text-slate-800 block text-xs font-semibold">Zalo ID / Custom URL name / Official account ID</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2 text-slate-500 font-mono text-xs">https://zalo.me/</span>
                      <input
                        type="text"
                        maxLength={20}
                        value={msgCustomUrlName}
                        onChange={(e) => setMsgCustomUrlName(e.target.value)}
                        placeholder="Custom URL name"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-[96px] pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Official account ID URL: https://zalo.me/{msgCustomUrlName || "[Custom URL name]"}</span>
                      <span className="font-mono">{msgCustomUrlName.length} / 20 (Text is {msgCustomUrlName.length} characters out of 20)</span>
                    </div>

                    {/* Starter Message */}
                    <div className="space-y-1">
                      <label className="block text-slate-700 font-semibold">Starter message</label>
                      <textarea
                        rows={2}
                        maxLength={140}
                        value={msgStarterMessage}
                        onChange={(e) => setMsgStarterMessage(e.target.value)}
                        placeholder="Can I get started with a delivery?"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                        <span>Text is {msgStarterMessage.length} characters out of 140</span>
                        <span className="font-mono">{msgStarterMessage.length} / 140</span>
                      </div>
                    </div>

                    {/* Call To Action */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-slate-700 font-semibold">Select a call-to-action for your ad</label>
                        <p className="text-[11px] text-slate-500">Select a compelling call-to-action that empowers people to engage with your business or service</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Call-to-action</label>
                        <select
                          value={msgCallToAction}
                          onChange={(e) => setMsgCallToAction(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        >
                          {["None", "Apply now", "Book now", "Contact us", "Get info", "Get offer", "Get quote", "Get started", "Learn more"].map((cta, idx) => (
                            <option key={idx} value={cta}>{cta}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="block text-[11px] text-slate-500 font-semibold">Call-to-action description</label>
                        <input
                          type="text"
                          maxLength={30}
                          value={msgCtaDescription}
                          onChange={(e) => setMsgCtaDescription(e.target.value)}
                          placeholder="Call-to-action description"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Text is {msgCtaDescription.length} characters out of 30</span>
                          <span className="font-mono">{msgCtaDescription.length} / 30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={optimizeForMessageAds}
                    onChange={(e) => setOptimizeForMessageAds(e.target.checked)}
                    className="mt-0.5 rounded text-primary h-4 w-4"
                  />
                  <span className="text-slate-700 leading-relaxed">
                    Optimize your campaign for message ads. This will add a <strong className="text-slate-900 font-bold">leads from messages</strong> conversion action to your campaign. <a href="https://support.google.com/google-ads/answer/10995103?hl=en_US" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Learn more about conversions</a>
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Create Apps Modal Overlay ── */}
      {activeModal === "APPS" && (
        <div className="fixed inset-0 z-[120] bg-white backdrop-blur-sm flex flex-col animate-in fade-in duration-200 text-xs">
          {/* Header */}
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center gap-4">
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-slate-900">Add apps to your campaign</h2>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl w-full mx-auto space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Campaign-level apps</h3>
              <p className="text-[11px] text-slate-500">Add apps to this campaign. Any apps added here can be used across campaigns.</p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
              
              {/* Add new app details */}
              <div className="space-y-4">
                <span className="font-bold text-slate-800 text-xs block">Add new app</span>
                
                {/* Platform */}
                <div className="space-y-2">
                  <span className="text-slate-700 font-semibold block">Select your mobile app's platform</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="appPlatform"
                        checked={appPlatform === "Android"}
                        onChange={() => setAppPlatform("Android")}
                        className="text-primary"
                      />
                      <span>Android</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        name="appPlatform"
                        checked={appPlatform === "iOS"}
                        onChange={() => setAppPlatform("iOS")}
                        className="text-primary"
                      />
                      <span>iOS</span>
                    </label>
                  </div>
                </div>

                {/* Lookup app */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Look up your app</label>
                  <input
                    type="text"
                    value={appAppQuery}
                    onChange={(e) => setAppAppQuery(e.target.value)}
                    placeholder="Enter the app name, package name, or publisher"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Link Text */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Link text</label>
                  <input
                    type="text"
                    maxLength={25}
                    value={appLinkText}
                    onChange={(e) => setAppLinkText(e.target.value)}
                    placeholder="Link text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Text is {appLinkText.length} characters out of 25</span>
                    <span className="font-mono">{appLinkText.length} / 25</span>
                  </div>
                </div>

                {/* App URL Options */}
                <div className="pt-2 border-t border-slate-200 space-y-4">
                  <span className="font-bold text-slate-800 text-xs block">App URL options</span>
                  
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Tracking template</label>
                    <input
                      type="url"
                      value={appTrackingTemplate}
                      onChange={(e) => setAppTrackingTemplate(e.target.value)}
                      placeholder="Example: https://www.trackingtemplate.foo/?url={lpurl}&id=5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Final URL suffix</label>
                    <input
                      type="text"
                      value={appFinalUrlSuffix}
                      onChange={(e) => setAppFinalUrlSuffix(e.target.value)}
                      placeholder="Example: param1=value1&param2=value2"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Custom Parameters */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold">Custom parameter</label>
                    {appCustomParams.map((param, idx) => (
                      <div key={param.id} className="flex items-center gap-3 animate-in fade-in duration-100">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2 text-slate-500 font-mono text-xs">{`{_`}</span>
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => {
                              const updated = [...appCustomParams];
                              updated[idx].name = e.target.value;
                              setAppCustomParams(updated);
                            }}
                            placeholder="Name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-slate-500 font-mono text-xs">{`}`}</span>
                        </div>
                        <span className="text-slate-500 font-bold text-xs">=</span>
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...appCustomParams];
                            updated[idx].value = e.target.value;
                            setAppCustomParams(updated);
                          }}
                          placeholder="Value"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                        />
                        <button type="button" onClick={() => setAppCustomParams(prev => prev.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAppCustomParams(prev => [...prev, { id: `acp-${Date.now()}`, name: "", value: "" }])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 cursor-pointer transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add custom parameter
                    </button>
                  </div>
                </div>

                {/* Advanced Options Accordion */}
                <div className="pt-2 border-t border-slate-200 space-y-4">
                  <div 
                    onClick={() => setShowAppAdvanced(!showAppAdvanced)}
                    className="flex items-center justify-between cursor-pointer text-slate-800 font-bold text-xs select-none"
                  >
                    <span>Advanced options</span>
                    <span>{showAppAdvanced ? "▲" : "▼"}</span>
                  </div>

                  {showAppAdvanced && (
                    <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50 animate-in slide-in-from-top-1 duration-150">
                      <span className="font-bold text-slate-700 text-xs block">Asset scheduling</span>
                      <p className="text-[11px] text-slate-500">Select when your assets will be eligible to show</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">Start date</label>
                          <input
                            type="date"
                            value={appStartDate}
                            onChange={(e) => setAppStartDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500 font-semibold">End date</label>
                          <input
                            type="date"
                            value={appEndDate}
                            onChange={(e) => setAppEndDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block text-[11px] text-slate-500 font-semibold">Days and hours</label>
                        <div className="flex gap-2 items-center">
                          <select
                            value={appScheduleDays}
                            onChange={(e) => setAppScheduleDays(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                          >
                            <option value="All days">All days</option>
                            <option value="Mondays to Fridays">Mondays to Fridays</option>
                            <option value="Saturdays and Sundays">Saturdays and Sundays</option>
                          </select>
                          <span className="text-slate-500">from</span>
                          <input
                            type="time"
                            value={appScheduleStart}
                            onChange={(e) => setAppScheduleStart(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono"
                          />
                          <span className="text-slate-500">to</span>
                          <input
                            type="time"
                            value={appScheduleEnd}
                            onChange={(e) => setAppScheduleEnd(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal pt-2 border-t border-slate-200/40">
                        To support predictable monthly spending, campaigns now pace toward a full month, distributed across your active ad schedule. <a href="https://support.google.com/google-ads/answer/16913225?hl=en_US" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Learn more</a>
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">Based on account time zone: (GMT+05:30) India Standard Time</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer controls */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSavedApps(prev => [...prev, { platform: appPlatform, query: appAppQuery || "My App", linkText: appLinkText || "Download" }]);
                    setActiveModal(null);
                  }}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 cursor-pointer shadow"
                >
                  Save App
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
